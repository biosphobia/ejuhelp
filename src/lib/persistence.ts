import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useBoard, blankPage, type Page, type InkColor, type ShapeKind } from './board';
import { useAuth, onBeforeSignOut } from './auth';
import { useSync } from './sync';
import { db } from './firebase';
import { useNotebook, NOTEBOOKS, DEFAULT_NOTEBOOK, type NotebookId } from './notebooks';
import { idbGet, idbSet, idbDel, idbKeys, KV_STORE, SNAP_STORE } from './idb';
import { emitOp, isRemoteApply } from './liveBus';

const LS_KEY = 'eju-notebooks-v1';
const OLD_LS_KEY = 'eju-board-v1'; // legacy single-board format → migrated into "general"
const IDB_KEY = 'notebooks';

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind; tx?: string; im?: string };
type CPage = { id: string; v: [number, number, number]; st: CStroke[] };
export interface StoredBook {
  pages: CPage[];
  currentPageId?: string;
  updatedAt: number;
}
interface StoredNotebooks {
  active: NotebookId;
  books: Partial<Record<NotebookId, StoredBook>>;
  /** Top-level stamp, set on every write, so the durable stores can be compared by recency. */
  updatedAt?: number;
}

const round = (n: number, d: number) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function encode(pages: Page[]): CPage[] {
  return pages.map((pg) => ({
    id: pg.id,
    v: [round(pg.viewport.scale, 3), Math.round(pg.viewport.x), Math.round(pg.viewport.y)],
    st: pg.strokes.map((s) => ({
      i: s.id,
      c: s.color,
      s: s.size,
      p: s.points.map((pt) => [Math.round(pt.x), Math.round(pt.y), round(pt.p, 2)]),
      ...(s.shape ? { sh: s.shape } : {}),
      ...(s.text != null ? { tx: s.text } : {}),
      ...(s.image != null ? { im: s.image } : {}),
    })),
  }));
}

function decode(cps: CPage[]): Page[] {
  return cps.map((cp) => ({
    id: cp.id,
    viewport: { scale: cp.v[0], x: cp.v[1], y: cp.v[2] },
    strokes: cp.st.map((cs) => ({
      id: cs.i,
      color: cs.c,
      size: cs.s,
      points: cs.p.map((t) => ({ x: t[0], y: t[1], p: t[2] })),
      ...(cs.sh ? { shape: cs.sh } : {}),
      ...(cs.tx != null ? { text: cs.tx } : {}),
      ...(cs.im != null ? { image: cs.im } : {}),
    })),
  }));
}

// ── Durable local storage ─────────────────────────────────────────────────────────────
// IndexedDB is the PRIMARY durable store (large quota, holds the full copy INCLUDING
// image data). localStorage carries a second, image-STRIPPED copy: stripping the base64
// images keeps it far below the ~5MB quota, so the synchronous write can never start
// failing just because the user pasted photos — which previously could silently disable
// the localStorage copy for the rest of the session. On load we take whichever store is
// newer and re-attach image data from the other (matched by stroke id).
//
// The IDB layer (lib/idb.ts) self-heals from iOS Safari's zombie-connection failure and
// reports honest success/failure, which we surface in the sync store: if a save cannot
// be committed ANYWHERE, the app shows a loud warning instead of losing work silently.

// In-memory snapshot of every notebook. The ACTIVE notebook's live content lives
// in the board store; the others are authoritative here until switched to.
let books: Partial<Record<NotebookId, StoredBook>> = {};

const validId = (id: unknown): id is NotebookId =>
  typeof id === 'string' && (NOTEBOOKS as string[]).includes(id);

/** Newest write stamp across a stored blob (top-level, else the freshest book). */
function stampOf(data: StoredNotebooks | null | undefined): number {
  if (!data) return 0;
  let m = data.updatedAt ?? 0;
  for (const id of NOTEBOOKS) {
    const t = data.books?.[id]?.updatedAt ?? 0;
    if (t > m) m = t;
  }
  return m;
}

/** Copy the live board into books[active] so a save/switch captures current edits. */
function snapshotActive() {
  const active = useNotebook.getState().active;
  const { pages, currentPageId } = useBoard.getState();
  books[active] = { pages: encode(pages), currentPageId, updatedAt: Date.now() };
}

/** Load a notebook's stored pages into the board (or a fresh blank page if empty). */
function loadBookIntoBoard(id: NotebookId) {
  const b = books[id];
  const pages = b?.pages?.length ? decode(b.pages) : [blankPage()];
  useBoard.getState().loadPages(pages, b?.currentPageId);
}

function stripBookImages(b: StoredBook): StoredBook {
  return {
    ...b,
    pages: b.pages.map((pg) => ({
      ...pg,
      st: pg.st.map((s) => (s.im != null && s.im !== '' ? { ...s, im: '' } : s)),
    })),
  };
}

function stripAllImages(data: StoredNotebooks): StoredNotebooks {
  const out: StoredNotebooks = { ...data, books: {} };
  for (const id of NOTEBOOKS) {
    const b = data.books?.[id];
    if (b) out.books[id] = stripBookImages(b);
  }
  return out;
}

// ── Rolling snapshot history ──────────────────────────────────────────────────────────
// Every few minutes of active work (and at key moments: notebook switch, import, cloud
// merge, restore) the full notebook set is ALSO written as an immutable `<timestamp>`
// record in the 'snaps' store. Nothing ever overwrites a snapshot, so even a bad merge,
// a bug, or user error can be rolled back from Account → recovery. Pruned to the newest
// SNAP_KEEP records.
const SNAP_MIN_INTERVAL = 3 * 60_000;
const SNAP_KEEP = 40;
let lastSnapAt = 0;

async function writeSnapshot(reason: string, force = false) {
  const now = Date.now();
  if (!force && now - lastSnapAt < SNAP_MIN_INTERVAL) return;
  const hasAny = NOTEBOOKS.some((id) => hasInk(books[id]));
  if (!hasAny) return; // never snapshot an empty state — worthless and can churn the prune
  lastSnapAt = now;
  const data: StoredNotebooks = { active: useNotebook.getState().active, books, updatedAt: now };
  const ok = await idbSet(SNAP_STORE, String(now), { ...data, reason });
  if (!ok) return;
  // prune oldest beyond SNAP_KEEP
  const keys = (await idbKeys(SNAP_STORE)).map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => b - a);
  for (const k of keys.slice(SNAP_KEEP)) void idbDel(SNAP_STORE, String(k));
}

export interface SnapshotInfo {
  ts: number;
  reason?: string;
  books: number;
  pages: number;
  strokes: number;
}

/** List recovery snapshots, newest first. */
export async function listSnapshots(): Promise<SnapshotInfo[]> {
  const keys = (await idbKeys(SNAP_STORE)).map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => b - a);
  const out: SnapshotInfo[] = [];
  for (const ts of keys) {
    const d = await idbGet<StoredNotebooks & { reason?: string }>(SNAP_STORE, String(ts));
    if (!d?.books) continue;
    let pages = 0;
    let strokes = 0;
    let bookCount = 0;
    for (const id of NOTEBOOKS) {
      const b = d.books[id];
      if (!b?.pages?.length) continue;
      bookCount++;
      pages += b.pages.length;
      for (const p of b.pages) strokes += p.st.length;
    }
    out.push({ ts, reason: d.reason, books: bookCount, pages, strokes });
  }
  return out;
}

/** Restore a snapshot (the current state is snapshotted first, so this is reversible). */
export async function restoreSnapshot(ts: number): Promise<boolean> {
  const d = await idbGet<StoredNotebooks>(SNAP_STORE, String(ts));
  if (!d?.books) return false;
  snapshotActive();
  await writeSnapshot('before-restore', true);
  applyStored(d);
  saveLocal();
  if (cloudLoaded) void saveCloud();
  return true;
}

// True once we've fetched & reconciled the signed-in user's cloud copy this session. Until
// then we must NOT write to the cloud — otherwise a blank/partial board (e.g. on a device
// whose local storage was purged) could overwrite the real backup before we've read it.
let cloudLoaded = false;

// ── Local save pipeline ───────────────────────────────────────────────────────────────
let lastSavedRev = -1; // last rev pushed through saveLocal (dedupes the subscription)
let lastWrittenRev = -1; // last rev CONFIRMED committed to a durable local store

/** Write the current notebook set to both local stores and report honest health.
 *  localStorage gets the image-stripped copy synchronously; IndexedDB gets the full
 *  copy asynchronously. `lastWrittenRev` only advances when at least one commit is
 *  CONFIRMED, so the periodic backstop keeps retrying after failures. */
function saveLocal() {
  const rev = useBoard.getState().rev;
  const data: StoredNotebooks = {
    active: useNotebook.getState().active,
    books,
    updatedAt: Date.now(),
  };
  let lsOk = false;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stripAllImages(data)));
    lsOk = true;
  } catch (e) {
    console.warn('[persistence] localStorage save failed', e);
  }
  if (lsOk) {
    lastWrittenRev = rev;
    useSync.getState().setLocal('ok');
  }
  void idbSet(KV_STORE, IDB_KEY, data).then((idbOk) => {
    if (idbOk) {
      // Only mark THIS rev as committed if the board hasn't moved on meanwhile —
      // a newer edit has its own save in flight (and the backstop retries regardless).
      if (useBoard.getState().rev === rev) lastWrittenRev = rev;
      useSync.getState().setLocal('ok');
      void writeSnapshot('autosave');
    } else if (!lsOk) {
      // NEITHER store committed — the work is memory-only. Say so loudly.
      useSync.getState().setLocal('failing', 'local-write-failed');
    }
  });
}

// gzip a string to a base64 payload (and back), when the browser supports it. Dense ink
// JSON compresses ~8×, which keeps large boards under Firestore's 1MB per-document limit.
async function gzipB64(str: string): Promise<string | null> {
  try {
    if (typeof CompressionStream === 'undefined') return null;
    const stream = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return btoa(bin);
  } catch {
    return null;
  }
}
async function gunzipB64(b64: string): Promise<string | null> {
  try {
    if (typeof DecompressionStream === 'undefined') return null;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  } catch {
    return null;
  }
}

// Per-notebook serialized copy last written to the cloud, so we only re-upload notebooks
// that actually changed (and detect that nothing changed).
const cloudCache: Partial<Record<NotebookId, string>> = {};
const EMPTY_MARK = ' empty';

async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) {
    useSync.getState().setCloud('local');
    return;
  }
  if (!cloudLoaded) return; // don't overwrite the cloud until we've reconciled with it
  useSync.getState().setCloud('saving');
  try {
    const now = Date.now();
    let tooBig = false;
    // ONE document per notebook — a large board (lots of handwriting across notebooks)
    // otherwise blows Firestore's 1MB PER-DOCUMENT limit and fails the whole save. Image
    // data is stripped and the JSON gzip-compressed; each notebook is well under 1MB.
    for (const id of NOTEBOOKS) {
      const ref = doc(db, 'users', user.uid, 'board', `nb-${id}`);
      const book = books[id];
      if (!book || !hasInk(book)) {
        if (cloudCache[id] !== undefined && cloudCache[id] !== EMPTY_MARK) {
          await setDoc(ref, { data: '', updatedAt: now, v: 3 });
          cloudCache[id] = EMPTY_MARK;
        }
        continue;
      }
      const json = JSON.stringify(stripBookImages(book));
      if (cloudCache[id] === json) continue; // unchanged → skip
      const gz = await gzipB64(json);
      if ((gz ?? json).length > 1_040_000) {
        tooBig = true; // this one notebook is too big — skip it, still save the others
        continue;
      }
      await setDoc(ref, gz ? { data: gz, enc: 'gz', updatedAt: now, v: 3 } : { data: json, updatedAt: now, v: 3 });
      cloudCache[id] = json;
    }
    await setDoc(doc(db, 'users', user.uid, 'board', '_meta'), {
      active: useNotebook.getState().active,
      updatedAt: now,
      v: 3,
    });
    useSync.getState().setCloud(tooBig ? 'error' : 'saved', tooBig ? 'one notebook too large; the rest are backed up' : undefined);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    const msg = (e as { message?: string })?.message;
    useSync.getState().setCloud('error', code || msg || 'unknown');
    console.warn('[persistence] cloud save failed', e);
  }
}

let cloudTimer: ReturnType<typeof setTimeout> | undefined;

/** Debounce ONLY the network (cloud) write — local storage is written immediately. */
function scheduleCloud() {
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    cloudTimer = undefined;
    void saveCloud();
  }, 800);
}

/** Persist immediately — used when the app is being hidden/closed so nothing can drop the
 *  last strokes. Local storage is already written on every change (below); this also
 *  forces the pending cloud write out. */
function flush() {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
    cloudTimer = undefined;
  }
  snapshotActive();
  saveLocal();
  void saveCloud();
}

/** Await a final cloud write — used right before sign-out so the last edits reach the
 *  account before it's signed out (an unblocked saveCloud checks user/cloudLoaded itself). */
async function flushCloudNow() {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
    cloudTimer = undefined;
  }
  snapshotActive();
  saveLocal();
  await saveCloud();
}

/** A JSON string of ALL notebooks — a manual backup the user can download to a file. This
 *  is storage-independent (survives iOS storage purges, cloud outages, everything). */
export function exportBackup(): string {
  snapshotActive();
  return JSON.stringify({ active: useNotebook.getState().active, books, exportedAt: Date.now(), v: 2 });
}

/** Restore all notebooks from a manual backup file. Returns true on success. */
export function importBackup(text: string): boolean {
  try {
    const data = JSON.parse(text) as StoredNotebooks;
    if (!data || typeof data !== 'object' || !data.books) return false;
    snapshotActive();
    void writeSnapshot('before-import', true); // current state is recoverable after a bad import
    applyStored(data);
    saveLocal();
    if (cloudLoaded) void saveCloud();
    return true;
  } catch {
    return false;
  }
}

/** Switch the active whiteboard, saving the current one first. */
export function switchNotebook(target: NotebookId) {
  if (!validId(target)) return;
  const cur = useNotebook.getState().active;
  if (cur === target) return;
  snapshotActive(); // capture edits on the notebook we're leaving
  void writeSnapshot('switch');
  useNotebook.getState()._setActive(target);
  loadBookIntoBoard(target);
  lastSavedRev = useBoard.getState().rev; // loadPages reset rev; don't double-save it
  saveLocal();
  void saveCloud();
  emitOp({ t: 'notebook', id: target }); // mirror the switch on the user's other devices
}

// ── Live device-mirroring hooks (lib/live.ts) ────────────────────────────────────────

/** The active notebook's full current state, for the connect-time exchange between a
 *  user's devices (heals any ops missed while a device was offline/asleep). */
export function liveSnapshot(): { active: NotebookId; book: StoredBook | null; stamp: number } {
  snapshotActive();
  const active = useNotebook.getState().active;
  const book = books[active] ?? null;
  return { active, book, stamp: book?.updatedAt ?? 0 };
}

/** Adopt a peer device's notebook state if it beats ours (content beats empty, else
 *  newer wins — the same rules as the cloud merge, so all copies converge). */
export function adoptLiveBook(id: NotebookId, book: StoredBook): boolean {
  if (!validId(id) || !book?.pages) return false;
  if (id === useNotebook.getState().active) snapshotActive();
  const l = books[id];
  const ci = hasInk(book);
  const li = hasInk(l);
  const adopt = !l || (ci !== li ? ci : (book.updatedAt ?? 0) > (l.updatedAt ?? 0));
  if (!adopt) return false;
  books[id] = restoreImages(book, l);
  if (id === useNotebook.getState().active) {
    loadBookIntoBoard(id);
    lastSavedRev = useBoard.getState().rev;
  }
  saveLocal();
  if (cloudLoaded) void saveCloud();
  return true;
}

/** Follow a peer's notebook switch (remote apply — no re-broadcast; liveBus suppresses
 *  the emitOp inside switchNotebook because the caller wraps this in applyingRemote). */
export function applyRemoteNotebook(target: NotebookId) {
  if (!validId(target)) return;
  if (isRemoteApply()) {
    // same flow as switchNotebook, minus the echo
    const cur = useNotebook.getState().active;
    if (cur === target) return;
    snapshotActive();
    useNotebook.getState()._setActive(target);
    loadBookIntoBoard(target);
    lastSavedRev = useBoard.getState().rev;
    saveLocal();
  } else {
    switchNotebook(target);
  }
}

function migrateLegacyLocal(): StoredNotebooks | null {
  try {
    const raw = localStorage.getItem(OLD_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { pages?: CPage[]; currentPageId?: string };
    if (parsed?.pages?.length) {
      return {
        active: DEFAULT_NOTEBOOK,
        books: { general: { pages: parsed.pages, currentPageId: parsed.currentPageId, updatedAt: Date.now() } },
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function applyStored(data: StoredNotebooks) {
  books = data.books ?? {};
  const active = validId(data.active) ? data.active : DEFAULT_NOTEBOOK;
  useNotebook.getState()._setActive(active);
  loadBookIntoBoard(active);
  lastSavedRev = useBoard.getState().rev;
}

const hasInk = (b?: StoredBook) => !!b && b.pages.some((p) => p.st.length > 0);

/** Copy image data (matched by stroke id) from `source` into strokes of `book` that are
 *  missing it. Used because the localStorage and cloud copies strip images — only the
 *  IndexedDB copy (and the live board) carry them. */
function restoreImages(book: StoredBook, source?: StoredBook): StoredBook {
  if (!source) return book;
  const byId = new Map<string, string>();
  for (const pg of source.pages) for (const s of pg.st) if (s.im) byId.set(s.i, s.im);
  if (!byId.size) return book;
  let changed = false;
  const pages = book.pages.map((pg) => {
    let pgChanged = false;
    const st = pg.st.map((s) => {
      if (!s.im && byId.has(s.i)) {
        pgChanged = true;
        return { ...s, im: byId.get(s.i)! };
      }
      return s;
    });
    if (!pgChanged) return pg;
    changed = true;
    return { ...pg, st };
  });
  return changed ? { ...book, pages } : book;
}

/** Merge cloud notebooks into local: content always beats an empty notebook, and
 *  among non-empty (or both-empty) copies the newer one wins. This keeps unsynced
 *  local work from being clobbered, without letting a fresh device's empty page
 *  clobber real cloud content. */
function mergeCloud(cloud: StoredNotebooks, preferCloud = false) {
  const merged: Partial<Record<NotebookId, StoredBook>> = { ...books };
  for (const id of NOTEBOOKS) {
    const c = cloud.books?.[id];
    const l = books[id];
    if (!c) continue;
    if (!l) {
      merged[id] = c;
      continue;
    }
    const ci = hasInk(c);
    const li = hasInk(l);
    // preferCloud: this device had NO local content at launch (e.g. an iPad PWA whose
    // storage was purged), so the cloud is authoritative — take it whenever it has ink,
    // even if a stroke was drawn on the blank board while the cloud fetch was in flight.
    if (preferCloud && ci) merged[id] = restoreImages(c, l);
    else if (ci !== li) merged[id] = ci ? restoreImages(c, l) : l;
    else merged[id] = (c.updatedAt ?? 0) > (l.updatedAt ?? 0) ? restoreImages(c, l) : l;
  }
  books = merged;
}

// Whether this launch hydrated any real (inked) content from local storage. When false, a
// signed-in user's cloud copy is treated as authoritative on reconcile (purged-device case).
let hadContentAtLaunch = false;

let inited = false;

/** Wire up local + cloud autosave and notebook switching. Call once at startup. */
export function initPersistence() {
  if (inited) return; // guard against accidental double-invoke
  inited = true;

  // Flush the board to the cloud before a sign-out completes, so the last edits are saved
  // under the account rather than lost when it goes away.
  onBeforeSignOut(flushCloudNow);

  // 1) hydrate synchronously from localStorage (instant paint), migrating legacy format.
  //    NOTE: this copy is image-stripped — images are re-attached from IndexedDB below.
  let data: StoredNotebooks | null = null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) data = JSON.parse(raw) as StoredNotebooks;
  } catch (e) {
    console.warn('[persistence] local hydrate failed', e);
  }
  if (!data) data = migrateLegacyLocal();
  if (data) applyStored(data);
  hadContentAtLaunch = NOTEBOOKS.some((id) => hasInk(books[id]));
  // Baseline "saved" rev so the reconcile below can tell whether the user has drawn yet.
  lastSavedRev = useBoard.getState().rev;
  const localStamp = stampOf(data);

  // 1b) reconcile with IndexedDB (the durable primary, and the only local store that
  // carries image data). If it holds a newer copy — e.g. localStorage was evicted by the
  // OS, or a previous quota error dropped a localStorage write — adopt it wholesale;
  // otherwise merge its image data back into the (stripped) localStorage copy.
  void idbGet<StoredNotebooks>(KV_STORE, IDB_KEY).then((idbData) => {
    if (!idbData?.books) {
      if (data) saveLocal(); // seed IDB from the localStorage copy on first run
      return;
    }
    const fresh = useBoard.getState().rev === lastSavedRev; // no edits since hydrate
    if (fresh && stampOf(idbData) > localStamp) {
      applyStored(idbData);
      hadContentAtLaunch = hadContentAtLaunch || NOTEBOOKS.some((id) => hasInk(books[id]));
      saveLocal();
      return;
    }
    // Same-or-older IDB copy: keep current content but re-attach its image data.
    let activeChanged = false;
    const active = useNotebook.getState().active;
    for (const id of NOTEBOOKS) {
      const l = books[id];
      const src = idbData.books?.[id];
      if (!l || !src) continue;
      const withImages = restoreImages(l, src);
      if (withImages !== l) {
        books[id] = withImages;
        if (id === active) activeChanged = true;
      }
    }
    if (activeChanged && fresh) {
      loadBookIntoBoard(active);
      lastSavedRev = useBoard.getState().rev;
    }
    saveLocal();
  });

  // 2) autosave whenever board content changes (rev bumps). The local write happens
  //    IMMEDIATELY and synchronously — the zustand subscription fires synchronously when a
  //    stroke is committed, so by the time the pointer-up handler returns the drawing is
  //    already in localStorage (and queued to IndexedDB). This removes any dependence on a
  //    debounce timer or lifecycle event for the local copy, so closing the tab can never
  //    drop committed work. Only the network write is debounced.
  useBoard.subscribe((st) => {
    if (st.rev === lastSavedRev) return;
    lastSavedRev = st.rev;
    snapshotActive();
    saveLocal();
    scheduleCloud();
  });

  // 3) flush on hide/close as extra insurance and to force the pending cloud write out
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    // Page Lifecycle 'freeze' fires before iOS/Chrome suspend a backgrounded PWA.
    document.addEventListener('freeze', flush);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
  }

  // 3a) Ask the browser to keep our storage durable. Without this, iOS/Safari can
  // EVICT a PWA's storage, which silently wipes saved notes between sessions.
  if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
    void navigator.storage
      .persisted?.()
      .then((granted) => {
        if (!granted) void navigator.storage.persist().catch(() => {});
      })
      .catch(() => {});
  }

  // 3b) Periodic backstop: if the board has changes not yet CONFIRMED committed (e.g. a
  // local write failed, or an unload event was missed), persist again. Saves therefore
  // retry automatically until a durable store accepts them.
  if (typeof window !== 'undefined') {
    window.setInterval(() => {
      if (useBoard.getState().rev !== lastWrittenRev) {
        snapshotActive();
        saveLocal();
        void saveCloud();
      }
    }, 5000);
  }

  // 4) Reconcile with the signed-in user's cloud copy. This must run whether Firebase
  //    restored the session BEFORE this code attached (so we check the current user now) or
  //    AFTER (so we also subscribe) — a subscribe alone misses an already-restored session,
  //    which on a purged device leaves the board blank and the cloud backup never fetched.
  maybeReconcileCloud(useAuth.getState().user?.uid ?? null);
  useAuth.subscribe((st) => {
    if (st.user) maybeReconcileCloud(st.user.uid);
    else {
      reconciledUid = null;
      cloudLoaded = false; // signed out → block cloud writes until a new reconcile
    }
  });
}

// Which uid we've already started reconciling, so we run the cloud fetch once per user.
let reconciledUid: string | null = null;

function maybeReconcileCloud(uid: string | null) {
  if (!db || !uid || reconciledUid === uid) return;
  reconciledUid = uid;
  cloudLoaded = false;
  void reconcileCloud(uid, 0);
}

/** Fetch the user's cloud board, merge it with local (content beats empty; else newest
 *  wins), and only THEN allow cloud writes. On failure we retry with backoff and keep cloud
 *  writes blocked, so a transient error never overwrites a backup we couldn't read. */
async function reconcileCloud(uid: string, attempt: number) {
  if (!db) {
    useSync.getState().setCloud('error', 'firestore-unavailable');
    return;
  }
  if (attempt === 0) useSync.getState().setCloud('saving'); // "checking cloud…"
  try {
    snapshotActive(); // include current local edits in the merge base
    const cloudBooks: Partial<Record<NotebookId, StoredBook>> = {};
    let cloudActive: NotebookId | undefined;
    let sawV3 = false; // at least one per-notebook doc exists
    let readFailure = false; // an existing doc we couldn't parse — must NOT clobber it

    // v3: one document per notebook (nb-<id>) + a _meta doc for the active notebook.
    for (const id of NOTEBOOKS) {
      const snap = await getDoc(doc(db, 'users', uid, 'board', `nb-${id}`));
      if (!snap.exists()) continue;
      sawV3 = true;
      const raw = snap.data() as { data?: string; enc?: string };
      if (typeof raw.data === 'string' && raw.data) {
        const jsonStr = raw.enc === 'gz' ? await gunzipB64(raw.data) : raw.data;
        if (!jsonStr) {
          readFailure = true;
          continue;
        }
        try {
          const b = JSON.parse(jsonStr) as StoredBook;
          if (b?.pages) cloudBooks[id] = b;
        } catch {
          readFailure = true;
        }
      }
      // raw.data === '' is an intentionally-empty notebook — leave it out.
    }
    if (sawV3) {
      const meta = await getDoc(doc(db, 'users', uid, 'board', '_meta'));
      const md = meta.data() as { active?: NotebookId } | undefined;
      if (md && validId(md.active)) cloudActive = md.active;
    }

    // v2 migration: a single 'notebooks' doc holding all books.
    if (!sawV3) {
      const snap = await getDoc(doc(db, 'users', uid, 'board', 'notebooks'));
      if (snap.exists()) {
        const raw = snap.data() as { data?: string; enc?: string; books?: StoredNotebooks['books']; active?: NotebookId };
        let parsed: StoredNotebooks['books'] | undefined;
        if (typeof raw.data === 'string' && raw.data) {
          const jsonStr = raw.enc === 'gz' ? await gunzipB64(raw.data) : raw.data;
          if (!jsonStr) readFailure = true;
          else
            try {
              const p = JSON.parse(jsonStr) as StoredNotebooks;
              parsed = p?.books;
              if (validId(p?.active)) cloudActive = p.active;
            } catch {
              readFailure = true;
            }
        } else if (raw.books) {
          parsed = raw.books;
          if (validId(raw.active)) cloudActive = raw.active;
        }
        if (parsed) for (const id of NOTEBOOKS) if (parsed[id]) cloudBooks[id] = parsed[id]!;
      }
    }

    // v1 migration: the oldest single-board 'main' doc (best-effort).
    if (!sawV3 && !Object.keys(cloudBooks).length && !readFailure) {
      try {
        const legacy = await getDoc(doc(db, 'users', uid, 'board', 'main'));
        const ld = legacy.data() as { pages?: CPage[]; currentPageId?: string; updatedAt?: number } | undefined;
        if (ld?.pages?.length) cloudBooks.general = { pages: ld.pages, currentPageId: ld.currentPageId, updatedAt: ld.updatedAt ?? 0 };
      } catch {
        /* ignore legacy read errors */
      }
    }

    if (uid !== reconciledUid) return; // user changed while we were fetching — abort
    // CRITICAL: never push over a cloud copy we couldn't read — retry instead of clobbering.
    if (readFailure) throw new Error('cloud-present-but-unreadable');

    const cloud: StoredNotebooks | null = Object.keys(cloudBooks).length
      ? { active: cloudActive ?? DEFAULT_NOTEBOOK, books: cloudBooks }
      : null;
    if (cloud?.books) {
      // The local state is snapshotted BEFORE the merge, so even a pathological merge
      // outcome is recoverable from Account → recovery.
      await writeSnapshot('before-cloud-merge', true);
      mergeCloud(cloud, !hadContentAtLaunch);
      // On a fresh/purged device (current notebook empty), jump to the notebook the user
      // was last on elsewhere so their work is visible immediately.
      const cur = useNotebook.getState().active;
      const next = !hasInk(books[cur]) && validId(cloud.active) && hasInk(books[cloud.active]) ? cloud.active! : cur;
      useNotebook.getState()._setActive(next);
      loadBookIntoBoard(next);
      lastSavedRev = useBoard.getState().rev;
      saveLocal();
    }
    // Seed the per-notebook change cache with what's actually IN the cloud, so the first
    // save only writes notebooks that differ (local-newer or local-only).
    for (const id of NOTEBOOKS) cloudCache[id] = cloudBooks[id] ? JSON.stringify(cloudBooks[id]) : EMPTY_MARK;
    cloudLoaded = true; // reconciled — cloud writes are now safe
    void saveCloud(); // push any local notebooks the cloud didn't have
  } catch (e) {
    console.warn('[persistence] cloud reconcile failed', e);
    const code = (e as { code?: string })?.code;
    const msg = (e as { message?: string })?.message;
    useSync.getState().setCloud('error', code || msg || 'reconcile-failed');
    // Keep cloudLoaded=false so we never clobber a cloud we couldn't read; retry.
    if (attempt < 5 && uid === reconciledUid) {
      setTimeout(() => void reconcileCloud(uid, attempt + 1), Math.min(1000 * 2 ** attempt, 15000));
    }
  }
}
