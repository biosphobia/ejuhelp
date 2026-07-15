import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useBoard, blankPage, type Page, type InkColor, type ShapeKind } from './board';
import { useAuth } from './auth';
import { db } from './firebase';
import { useNotebook, NOTEBOOKS, DEFAULT_NOTEBOOK, type NotebookId } from './notebooks';

const LS_KEY = 'eju-notebooks-v1';
const OLD_LS_KEY = 'eju-board-v1'; // legacy single-board format → migrated into "general"

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind; tx?: string; im?: string };
type CPage = { id: string; v: [number, number, number]; st: CStroke[] };
interface StoredBook {
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
// IndexedDB is the PRIMARY durable store: it has a large quota (ink can exceed the ~5MB
// localStorage cap, which would make setItem throw and silently drop saves) and, together
// with navigator.storage.persist(), is far less likely to be evicted by iOS/Safari than
// localStorage. localStorage is kept as a second copy because it hydrates synchronously on
// startup (instant paint) and — crucially — can be written synchronously inside an unload
// handler, which IndexedDB (async) cannot guarantee. On load we read whichever is newer.
const IDB_NAME = 'eju-board';
const IDB_STORE = 'kv';
const IDB_KEY = 'notebooks';

let idbConn: Promise<IDBDatabase> | null = null;
function idbOpen(): Promise<IDBDatabase> {
  // Cache the connection so per-stroke writes don't reopen the database every time.
  if (idbConn) return idbConn;
  idbConn = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no-idb'));
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  // If the connection drops or fails, allow a fresh open next time.
  idbConn.then((idb) => {
    idb.onclose = () => { idbConn = null; };
  }).catch(() => { idbConn = null; });
  return idbConn;
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const idb = await idbOpen();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const rq = tx.objectStore(IDB_STORE).get(key);
      rq.onsuccess = () => resolve(rq.result as T | undefined);
      rq.onerror = () => reject(rq.error);
    });
  } catch {
    return undefined;
  }
}

async function idbSet(key: string, val: unknown): Promise<boolean> {
  try {
    const idb = await idbOpen();
    return await new Promise<boolean>((resolve) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(val, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch {
    return false;
  }
}

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

/** Write the current notebook set to BOTH durable stores. IndexedDB is the primary
 *  (large, eviction-resistant); localStorage is a synchronous best-effort second copy
 *  (may throw on quota for very large ink — that's fine, IndexedDB still has it). */
function saveLocal() {
  const data: StoredNotebooks = {
    active: useNotebook.getState().active,
    books,
    updatedAt: Date.now(),
  };
  void idbSet(IDB_KEY, data); // durable primary
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data)); // sync copy for instant hydrate / unload
  } catch (e) {
    console.warn('[persistence] localStorage save failed (quota?) — relying on IndexedDB', e);
  }
  lastWrittenRev = useBoard.getState().rev;
}

// True once we've fetched & reconciled the signed-in user's cloud copy this session. Until
// then we must NOT write to the cloud — otherwise a blank/partial board (e.g. on a device
// whose local storage was purged) could overwrite the real backup before we've read it.
let cloudLoaded = false;

async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) return;
  if (!cloudLoaded) return; // don't overwrite the cloud until we've reconciled with it
  try {
    await setDoc(doc(db, 'users', user.uid, 'board', 'notebooks'), {
      active: useNotebook.getState().active,
      books,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[persistence] cloud save failed', e);
  }
}

let cloudTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedRev = -1;
// The board rev actually written to local storage, so a periodic backstop can tell when
// there are unsaved changes even if lifecycle events never fire.
let lastWrittenRev = -1;

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

/** Switch the active whiteboard, saving the current one first. */
export function switchNotebook(target: NotebookId) {
  if (!validId(target)) return;
  const cur = useNotebook.getState().active;
  if (cur === target) return;
  snapshotActive(); // capture edits on the notebook we're leaving
  useNotebook.getState()._setActive(target);
  loadBookIntoBoard(target);
  lastSavedRev = useBoard.getState().rev; // loadPages reset rev; don't double-save it
  saveLocal();
  void saveCloud();
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

/** Merge cloud notebooks into local: content always beats an empty notebook, and
 *  among non-empty (or both-empty) copies the newer one wins. This keeps unsynced
 *  local work from being clobbered, without letting a fresh device's empty page
 *  clobber real cloud content. */
function mergeCloud(cloud: StoredNotebooks) {
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
    if (ci !== li) merged[id] = ci ? c : l;
    else merged[id] = (c.updatedAt ?? 0) > (l.updatedAt ?? 0) ? c : l;
  }
  books = merged;
}

let inited = false;

/** Wire up local + cloud autosave and notebook switching. Call once at startup. */
export function initPersistence() {
  if (inited) return; // guard against accidental double-invoke
  inited = true;

  // 1) hydrate synchronously from localStorage (instant paint), migrating legacy format
  let data: StoredNotebooks | null = null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) data = JSON.parse(raw) as StoredNotebooks;
  } catch (e) {
    console.warn('[persistence] local hydrate failed', e);
  }
  if (!data) data = migrateLegacyLocal();
  if (data) applyStored(data);
  // Baseline "saved" rev so the reconcile below can tell whether the user has drawn yet.
  lastSavedRev = useBoard.getState().rev;
  const localStamp = stampOf(data);

  // Seed both durable stores with whatever we hydrated (this also migrates an existing
  // localStorage-only board into IndexedDB on the first run after this change).
  if (data) saveLocal();

  // 1b) reconcile with IndexedDB (the durable primary). If it holds a newer copy — e.g.
  // localStorage was evicted by the OS, or a previous quota error dropped a localStorage
  // write — adopt it, unless the user has already drawn this session (don't clobber).
  void idbGet<StoredNotebooks>(IDB_KEY).then((idbData) => {
    if (!idbData?.books) return;
    const fresh = useBoard.getState().rev === lastSavedRev; // no edits since hydrate
    if (fresh && stampOf(idbData) > localStamp) {
      applyStored(idbData);
      saveLocal();
    }
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

  // 3b) Periodic backstop: if the board has changed since the last write (e.g. the
  // user is drawing continuously, or an unload event was missed), persist it. This
  // guarantees saves don't depend solely on pauses or lifecycle events.
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
  if (!db) return;
  try {
    snapshotActive(); // include current local edits in the merge base
    const snap = await getDoc(doc(db, 'users', uid, 'board', 'notebooks'));
    let cloud = snap.exists() ? (snap.data() as StoredNotebooks) : null;
    if (!cloud?.books) {
      const legacy = await getDoc(doc(db, 'users', uid, 'board', 'main'));
      const ld = legacy.data() as { pages?: CPage[]; currentPageId?: string; updatedAt?: number } | undefined;
      if (ld?.pages?.length) {
        cloud = {
          active: DEFAULT_NOTEBOOK,
          books: { general: { pages: ld.pages, currentPageId: ld.currentPageId, updatedAt: ld.updatedAt ?? 0 } },
        };
      }
    }
    if (uid !== reconciledUid) return; // user changed while we were fetching — abort
    if (cloud?.books) {
      mergeCloud(cloud);
      // On a fresh/purged device (current notebook empty), jump to the notebook the user
      // was last on elsewhere so their work is visible immediately.
      const cur = useNotebook.getState().active;
      const next =
        !hasInk(books[cur]) && validId(cloud.active) && hasInk(books[cloud.active]) ? cloud.active : cur;
      useNotebook.getState()._setActive(next);
      loadBookIntoBoard(next);
      lastSavedRev = useBoard.getState().rev;
      saveLocal();
    }
    cloudLoaded = true; // reconciled — cloud writes are now safe
    void saveCloud(); // push the merged result (also seeds an empty cloud)
  } catch (e) {
    console.warn('[persistence] cloud reconcile failed', e);
    // Keep cloudLoaded=false so we never clobber a cloud we couldn't read; retry.
    if (attempt < 5 && uid === reconciledUid) {
      setTimeout(() => void reconcileCloud(uid, attempt + 1), Math.min(1000 * 2 ** attempt, 15000));
    }
  }
}
