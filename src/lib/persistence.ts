import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { useBoard, notebookOf, defaultNotebooks, type Page, type InkColor, type ShapeKind, type TextBlock, type NotebookMeta } from './board';
import { useAuth } from './auth';
import { useUI } from './ui';
import { db } from './firebase';

const LS_KEY = 'eju-board-v1';
const LS_SNAPS = 'eju-board-snapshots';
const LOCAL_SNAPS_KEEP = 3;
const CLOUD_SNAPS_KEEP = 5;
const AUTO_SNAPSHOT_MS = 20 * 3_600_000; // one automatic cloud snapshot a day

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind };
type CPage = { id: string; v: [number, number, number]; st: CStroke[]; nb?: string; t?: string; tx?: TextBlock[]; src?: string };

const round = (n: number, d: number) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function encodePage(pg: Page): CPage {
  return {
    id: pg.id,
    v: [round(pg.viewport.scale, 3), Math.round(pg.viewport.x), Math.round(pg.viewport.y)],
    st: pg.strokes.map((s) => ({
      i: s.id,
      c: s.color,
      s: s.size,
      p: s.points.map((pt) => [Math.round(pt.x), Math.round(pt.y), round(pt.p, 2)]),
      ...(s.shape ? { sh: s.shape } : {}),
    })),
    ...(pg.notebook ? { nb: pg.notebook } : {}),
    ...(pg.title ? { t: pg.title } : {}),
    ...(pg.texts?.length ? { tx: pg.texts } : {}),
    ...(pg.sourceId ? { src: pg.sourceId } : {}),
  };
}
const encode = (pages: Page[]): CPage[] => pages.map(encodePage);

function decode(cps: CPage[]): Page[] {
  return cps.map((cp) => ({
    id: cp.id,
    viewport: { scale: cp.v?.[0] ?? 1, x: cp.v?.[1] ?? 0, y: cp.v?.[2] ?? 0 },
    strokes: (cp.st ?? []).map((cs) => ({
      id: cs.i,
      color: cs.c,
      size: cs.s,
      points: cs.p.map((t) => ({ x: t[0], y: t[1], p: t[2] })),
      ...(cs.sh ? { shape: cs.sh } : {}),
    })),
    ...(cp.nb ? { notebook: cp.nb } : {}),
    ...(cp.t ? { title: cp.t } : {}),
    ...(cp.tx?.length ? { texts: cp.tx } : {}),
    ...(cp.src ? { sourceId: cp.src } : {}),
  }));
}

const hasInk = (p: CPage) => (p.st?.length ?? 0) > 0 || (p.tx?.length ?? 0) > 0;
const inkPages = (pages: CPage[]) => pages.filter(hasInk).length;

// ─────────────────────────── local ───────────────────────────
let localUpdatedAt = 0;

function saveLocal() {
  const { pages, currentPageId, notebooks } = useBoard.getState();
  localUpdatedAt = Date.now();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ pages: encode(pages), currentPageId, notebooks, updatedAt: localUpdatedAt }));
  } catch (e) {
    console.warn('[persistence] local save failed', e);
  }
}

export interface BackupMeta {
  id: string;
  where: 'device' | 'cloud';
  ts: number;
  reason: string;
  pages: number;
}
interface LocalSnap {
  id: string;
  ts: number;
  reason: string;
  pages: CPage[];
  notebooks?: NotebookMeta[];
}

function readLocalSnaps(): LocalSnap[] {
  try {
    const raw = localStorage.getItem(LS_SNAPS);
    const arr = raw ? (JSON.parse(raw) as LocalSnap[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeLocalSnaps(snaps: LocalSnap[]) {
  // Drop the oldest until it fits; a snapshot must never break normal saving.
  for (let keep = snaps.length; keep >= 0; keep--) {
    try {
      localStorage.setItem(LS_SNAPS, JSON.stringify(snaps.slice(0, keep)));
      return;
    } catch {
      /* too big, try fewer */
    }
  }
}

/** Keep a copy of the current pages on this device (newest first, capped). */
function snapshotLocal(reason: string, pages?: CPage[], notebooks?: NotebookMeta[]) {
  const st = useBoard.getState();
  const p = pages ?? encode(st.pages);
  if (!inkPages(p)) return;
  const snap: LocalSnap = { id: `d${Date.now().toString(36)}`, ts: Date.now(), reason, pages: p, notebooks: notebooks ?? st.notebooks };
  writeLocalSnaps([snap, ...readLocalSnaps()].slice(0, LOCAL_SNAPS_KEEP));
}

// ─────────────────────────── cloud ───────────────────────────
// users/{uid}/board/main            → { v: 2, order: [pageId…], currentPageId, notebooks, updatedAt, snapshots: [...] }
// users/{uid}/board/main/pages/{id} → one encoded page per doc
// users/{uid}/board/snap-{ts}       → { ts, reason, order, notebooks, count } with its own pages subcollection
// One doc per page keeps every write far below Firestore's 1 MB document cap.
const lastCloud = new Map<string, string>(); // pageId -> JSON last written
let cloudBusy = false;
let cloudDirty = false;
let cloudSnapshots: BackupMeta[] = [];
let lastAutoSnapshot = 0;

async function writePages(colRef: ReturnType<typeof collection>, pages: CPage[], skipUnchanged: boolean) {
  let batch = writeBatch(db!);
  let n = 0;
  const flush = async () => {
    if (n) await batch.commit();
    batch = writeBatch(db!);
    n = 0;
  };
  for (const enc of pages) {
    const json = JSON.stringify(enc);
    if (skipUnchanged && lastCloud.get(enc.id) === json) continue;
    if (json.length > 950_000) {
      console.warn(`[persistence] page ${enc.id} is too large for the cloud (${json.length} bytes); kept locally only`);
      continue;
    }
    batch.set(doc(colRef, enc.id), enc);
    if (skipUnchanged) lastCloud.set(enc.id, json);
    if (++n >= 20) await flush();
  }
  await flush();
}

async function deleteCollection(colRef: ReturnType<typeof collection>) {
  const qs = await getDocs(colRef);
  let batch = writeBatch(db!);
  let n = 0;
  for (const d of qs.docs) {
    batch.delete(d.ref);
    if (++n >= 20) {
      await batch.commit();
      batch = writeBatch(db!);
      n = 0;
    }
  }
  if (n) await batch.commit();
}

async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) return;
  if (cloudBusy) {
    cloudDirty = true;
    return;
  }
  cloudBusy = true;
  try {
    const { pages, currentPageId, notebooks } = useBoard.getState();
    const mainRef = doc(db, 'users', user.uid, 'board', 'main');
    const pagesCol = collection(mainRef, 'pages');
    const enc = encode(pages);
    await writePages(pagesCol, enc, true);
    const ids = new Set(pages.map((p) => p.id));
    for (const id of [...lastCloud.keys()]) {
      if (!ids.has(id)) {
        await deleteDoc(doc(pagesCol, id));
        lastCloud.delete(id);
      }
    }
    await setDoc(mainRef, {
      v: 2,
      order: pages.map((p) => p.id),
      currentPageId,
      notebooks,
      updatedAt: localUpdatedAt || Date.now(),
      snapshots: cloudSnapshots,
    });
    if (Date.now() - lastAutoSnapshot > AUTO_SNAPSHOT_MS && inkPages(enc)) {
      lastAutoSnapshot = Date.now();
      await snapshotCloud('auto', enc, notebooks);
    }
  } catch (e) {
    console.warn('[persistence] cloud save failed', e);
  } finally {
    cloudBusy = false;
    if (cloudDirty) {
      cloudDirty = false;
      void saveCloud();
    }
  }
}

/** Copy the given pages into a cloud snapshot; prune old ones. */
async function snapshotCloud(reason: string, pages: CPage[], notebooks: NotebookMeta[]) {
  const { user } = useAuth.getState();
  if (!user || !db || !inkPages(pages)) return;
  const ts = Date.now();
  const id = `snap-${ts.toString(36)}`;
  const ref = doc(db, 'users', user.uid, 'board', id);
  try {
    await writePages(collection(ref, 'pages'), pages, false);
    await setDoc(ref, { ts, reason, order: pages.map((p) => p.id), notebooks, count: inkPages(pages) });
    cloudSnapshots = [{ id, where: 'cloud' as const, ts, reason, pages: inkPages(pages) }, ...cloudSnapshots].slice(0, CLOUD_SNAPS_KEEP + 5);
    const extra = cloudSnapshots.slice(CLOUD_SNAPS_KEEP);
    cloudSnapshots = cloudSnapshots.slice(0, CLOUD_SNAPS_KEEP);
    for (const s of extra) {
      const old = doc(db, 'users', user.uid, 'board', s.id);
      await deleteCollection(collection(old, 'pages'));
      await deleteDoc(old);
    }
    await setDoc(doc(db, 'users', user.uid, 'board', 'main'), { snapshots: cloudSnapshots }, { merge: true });
  } catch (e) {
    console.warn('[persistence] cloud snapshot failed', e);
  }
}

interface CloudBoard {
  pages: CPage[];
  currentPageId?: string;
  notebooks?: NotebookMeta[];
  updatedAt: number;
  legacy: boolean;
}

/** Read the cloud board in either layout. Returns null when there is none. */
async function loadCloud(uid: string): Promise<CloudBoard | null> {
  const mainRef = doc(db!, 'users', uid, 'board', 'main');
  const snap = await getDoc(mainRef);
  const data = snap.data() as
    | { v?: number; order?: string[]; pages?: CPage[]; currentPageId?: string; notebooks?: NotebookMeta[]; updatedAt?: number; snapshots?: BackupMeta[] }
    | undefined;
  if (!data) return null;
  if (Array.isArray(data.snapshots)) cloudSnapshots = data.snapshots.filter((s) => s && typeof s.id === 'string');
  if (cloudSnapshots.length) lastAutoSnapshot = Math.max(...cloudSnapshots.map((s) => s.ts));
  if (data.v === 2) {
    const qs = await getDocs(collection(mainRef, 'pages'));
    const byId = new Map<string, CPage>();
    qs.forEach((d) => byId.set(d.id, d.data() as CPage));
    const order = data.order ?? [];
    const pages = order.map((id) => byId.get(id)).filter((p): p is CPage => Boolean(p));
    for (const [id, p] of byId) if (!order.includes(id)) pages.push(p); // pages the order list missed
    for (const p of pages) lastCloud.set(p.id, JSON.stringify(p));
    return { pages, currentPageId: data.currentPageId, notebooks: data.notebooks, updatedAt: data.updatedAt ?? 0, legacy: false };
  }
  if (data.pages?.length) return { pages: data.pages, currentPageId: data.currentPageId, updatedAt: data.updatedAt ?? 0, legacy: true };
  return null;
}

/**
 * Union of two page sets by id. A page on only one side is always kept; a page on
 * both sides takes the newer side's version. Nothing is ever dropped.
 */
function mergePages(local: CPage[], cloud: CPage[], cloudNewer: boolean): CPage[] {
  const base = cloudNewer ? cloud : local;
  const other = cloudNewer ? local : cloud;
  const seen = new Set(base.map((p) => p.id));
  const out = [...base];
  for (const p of other) if (!seen.has(p.id)) out.push(p);
  return out;
}

function mergeNotebooks(a?: NotebookMeta[], b?: NotebookMeta[]): NotebookMeta[] {
  const out = [...(a ?? defaultNotebooks())];
  const ids = new Set(out.map((n) => n.id));
  for (const n of b ?? []) if (!ids.has(n.id)) out.push(n);
  return out;
}

// ─────────────────────────── backups API (Settings panel) ───────────────────────────
export function listBackups(): BackupMeta[] {
  const local: BackupMeta[] = readLocalSnaps().map((s) => ({ id: s.id, where: 'device', ts: s.ts, reason: s.reason, pages: inkPages(s.pages) }));
  return [...local, ...cloudSnapshots].sort((a, b) => b.ts - a.ts);
}

/** Save a snapshot now, on the device and (when signed in) in the cloud. */
export async function backupNow(): Promise<void> {
  const st = useBoard.getState();
  const enc = encode(st.pages);
  snapshotLocal('manual', enc, st.notebooks);
  await snapshotCloud('manual', enc, st.notebooks);
}

/** Bring a backup back: 'merge' adds the pages that are missing now (never removes
 *  anything); 'replace' swaps the whole board for the backup (a snapshot of the
 *  current board is taken first, so this is reversible). */
export async function restoreBackup(id: string, mode: 'merge' | 'replace'): Promise<number> {
  let pages: CPage[] | null = null;
  let notebooks: NotebookMeta[] | undefined;
  const local = readLocalSnaps().find((s) => s.id === id);
  if (local) {
    pages = local.pages;
    notebooks = local.notebooks;
  } else {
    const { user } = useAuth.getState();
    if (!user || !db) throw new Error('backup_unavailable');
    const ref = doc(db, 'users', user.uid, 'board', id);
    const meta = (await getDoc(ref)).data() as { order?: string[]; notebooks?: NotebookMeta[] } | undefined;
    const qs = await getDocs(collection(ref, 'pages'));
    const byId = new Map<string, CPage>();
    qs.forEach((d) => byId.set(d.id, d.data() as CPage));
    pages = (meta?.order ?? [...byId.keys()]).map((pid) => byId.get(pid)).filter((p): p is CPage => Boolean(p));
    for (const [pid, p] of byId) if (!pages.some((x) => x.id === pid)) pages.push(p);
    notebooks = meta?.notebooks;
  }
  if (!pages) throw new Error('backup_unavailable');
  const st = useBoard.getState();
  const current = encode(st.pages);
  snapshotLocal('before-restore', current, st.notebooks);
  const merged = mode === 'replace' ? mergePages(pages, current.filter((p) => !hasInk(p)), true) : mergePages(current, pages, false);
  const added = merged.length - (mode === 'replace' ? 0 : current.length);
  st.setNotebooks(mergeNotebooks(st.notebooks, notebooks));
  st.loadPages(decode(merged), st.currentPageId, useUI.getState().subject);
  st.setNotebooks(useBoard.getState().notebooks);
  st.setNotebook(useUI.getState().subject);
  saveLocal();
  void saveCloud();
  return Math.max(0, added);
}

// ─────────────────────────── recovery scan ───────────────────────────
export interface FoundPage {
  id: string;
  title: string;
  notebook: string;
  strokes: number;
  /** Where it was found. */
  source: string;
  page: CPage;
}
export interface ScanResult {
  /** Inked pages that exist somewhere but are not in the notebook right now. */
  missing: FoundPage[];
  /** Inked pages that are in the notebook, but in a different notebook than the open one. */
  elsewhere: FoundPage[];
  /** Places that were searched, for the report. */
  searched: string[];
}

const describe = (p: CPage, source: string): FoundPage => ({
  id: p.id,
  title: p.t || '',
  notebook: p.nb || 'physics',
  strokes: (p.st?.length ?? 0) + (p.tx?.length ?? 0),
  source,
  page: p,
});

/**
 * Look everywhere a page could survive — this device's saved board, device
 * snapshots, the cloud board, every cloud snapshot, and the old single-document
 * cloud layout — and report inked pages that are not in the notebook now.
 */
export async function scanForLostPages(): Promise<ScanResult> {
  const board = useBoard.getState();
  const have = new Map(board.pages.map((p) => [p.id, p]));
  const missing = new Map<string, FoundPage>();
  const searched: string[] = [];
  const consider = (pages: CPage[] | undefined, source: string) => {
    for (const p of pages ?? []) {
      if (!hasInk(p)) continue;
      const cur = have.get(p.id);
      const curInk = cur ? cur.strokes.length + (cur.texts?.length ?? 0) : 0;
      // Missing entirely, or present but with far less ink than this copy.
      if (!cur || curInk * 2 < (p.st?.length ?? 0) + (p.tx?.length ?? 0)) {
        const found = describe(p, source);
        const prev = missing.get(p.id);
        if (!prev || prev.strokes < found.strokes) missing.set(p.id, found);
      }
    }
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) consider((JSON.parse(raw) as { pages?: CPage[] }).pages, 'device');
    searched.push('device');
  } catch {
    /* ignore */
  }
  for (const s of readLocalSnaps()) consider(s.pages, `device snapshot ${new Date(s.ts).toLocaleString()}`);
  if (readLocalSnaps().length) searched.push('device snapshots');

  const { user } = useAuth.getState();
  if (user && db) {
    try {
      const mainRef = doc(db, 'users', user.uid, 'board', 'main');
      const main = (await getDoc(mainRef)).data() as { pages?: CPage[]; snapshots?: BackupMeta[] } | undefined;
      if (main?.pages?.length) consider(main.pages, 'cloud (old layout)');
      const qs = await getDocs(collection(mainRef, 'pages'));
      const cloudPages: CPage[] = [];
      qs.forEach((d) => cloudPages.push(d.data() as CPage));
      consider(cloudPages, 'cloud');
      searched.push('cloud');
      const snaps = main?.snapshots ?? cloudSnapshots;
      for (const sn of snaps) {
        try {
          const sq = await getDocs(collection(doc(db, 'users', user.uid, 'board', sn.id), 'pages'));
          const pages: CPage[] = [];
          sq.forEach((d) => pages.push(d.data() as CPage));
          consider(pages, `cloud snapshot ${new Date(sn.ts).toLocaleString()}`);
        } catch {
          /* skip */
        }
      }
      if (snaps.length) searched.push('cloud snapshots');
    } catch (e) {
      console.warn('[persistence] cloud scan failed', e);
    }
  }
  const elsewhere = board.pages
    .filter((p) => (p.strokes.length || p.texts?.length) && notebookOf(p) !== board.notebook)
    .map((p) => describe(encodePage(p), 'notebook'));
  return { missing: [...missing.values()], elsewhere, searched };
}

/** Put found pages back into the notebook (they keep their own notebook tag). */
export function addPages(pages: CPage[]): number {
  const st = useBoard.getState();
  const current = encode(st.pages);
  snapshotLocal('before-recover', current, st.notebooks);
  const merged = mergePages(current, pages, false);
  // A found copy with more ink than the current one replaces it.
  const byId = new Map(pages.map((p) => [p.id, p]));
  const out = merged.map((p) => {
    const f = byId.get(p.id);
    return f && (f.st?.length ?? 0) + (f.tx?.length ?? 0) > (p.st?.length ?? 0) + (p.tx?.length ?? 0) ? f : p;
  });
  st.setNotebooks(mergeNotebooks(st.notebooks, undefined));
  st.loadPages(decode(out), st.currentPageId, useUI.getState().subject);
  st.setNotebooks(useBoard.getState().notebooks);
  st.setNotebook(useUI.getState().subject);
  saveLocal();
  void saveCloud();
  return pages.length;
}

/** Everything as one JSON file the student can keep anywhere. */
export function exportBoardJson(): string {
  const st = useBoard.getState();
  return JSON.stringify({ app: 'ejuhelp', v: 2, exportedAt: Date.now(), pages: encode(st.pages), notebooks: st.notebooks }, null, 0);
}

/** Merge a JSON file produced by exportBoardJson (or the raw localStorage format). */
export function importBoardJson(text: string): number {
  const raw = JSON.parse(text) as { pages?: CPage[]; notebooks?: NotebookMeta[] };
  if (!Array.isArray(raw.pages)) throw new Error('bad_backup_file');
  const st = useBoard.getState();
  const current = encode(st.pages);
  snapshotLocal('before-import', current, st.notebooks);
  const merged = mergePages(current, raw.pages, false);
  st.setNotebooks(mergeNotebooks(st.notebooks, raw.notebooks));
  st.loadPages(decode(merged), st.currentPageId, useUI.getState().subject);
  st.setNotebooks(useBoard.getState().notebooks);
  st.setNotebook(useUI.getState().subject);
  saveLocal();
  void saveCloud();
  return merged.length - current.length;
}

// ─────────────────────────── startup ───────────────────────────
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedRev = -1;

/** Wire up local + cloud autosave. Call once at startup. */
export function initPersistence() {
  const subject = useUI.getState().subject;

  // 1) hydrate from localStorage right away
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { pages?: CPage[]; currentPageId?: string; notebooks?: NotebookMeta[]; updatedAt?: number };
      localUpdatedAt = parsed.updatedAt ?? 0;
      if (Array.isArray(parsed.notebooks)) useBoard.getState().setNotebooks(parsed.notebooks);
      if (parsed?.pages?.length) {
        useBoard.getState().loadPages(decode(parsed.pages), parsed.currentPageId, subject);
        useBoard.getState().setNotebooks(useBoard.getState().notebooks);
      }
    }
  } catch (e) {
    console.warn('[persistence] local hydrate failed', e);
  }
  // The notebook always follows the selected subject.
  useBoard.getState().setNotebook(subject);
  useUI.subscribe((s, prev) => {
    if (s.subject === prev.subject) return;
    const b = useBoard.getState();
    const cur = b.notebooks.find((n) => n.id === b.notebook);
    if (cur?.subject !== s.subject) b.setNotebook(s.subject); // a custom notebook of the same subject stays open
  });

  // 2) autosave whenever drawing content changes (rev bumps)
  useBoard.subscribe((st) => {
    if (st.rev === lastSavedRev) return;
    lastSavedRev = st.rev;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveLocal();
      void saveCloud();
    }, 1200);
  });

  // 3) on sign-in, MERGE with the cloud board. Pages are joined by id, so a page
  //    that exists on only one side is always kept; the newer side wins for pages
  //    on both. A device snapshot is taken first, so nothing is ever lost silently.
  useAuth.subscribe((st, prev) => {
    if (st.user && st.user !== prev.user && db) {
      void (async () => {
        try {
          const cloud = await loadCloud(st.user!.uid);
          const board = useBoard.getState();
          const local = encode(board.pages);
          if (!cloud) {
            void saveCloud();
            return;
          }
          const cloudNewer = cloud.updatedAt > localUpdatedAt;
          const merged = mergePages(local, cloud.pages, cloudNewer);
          const changed = JSON.stringify(merged) !== JSON.stringify(local);
          if (changed) {
            snapshotLocal('before-cloud-merge', local, board.notebooks);
            board.setNotebooks(mergeNotebooks(cloudNewer ? cloud.notebooks : board.notebooks, cloudNewer ? board.notebooks : cloud.notebooks));
            board.loadPages(decode(merged), board.currentPageId, useUI.getState().subject);
            board.setNotebooks(useBoard.getState().notebooks);
            board.setNotebook(useUI.getState().subject);
            saveLocal();
          }
          // Legacy single-doc board: keep a cloud snapshot of it before migrating.
          if (cloud.legacy) await snapshotCloud('legacy-board', cloud.pages, board.notebooks);
          void saveCloud();
        } catch (e) {
          console.warn('[persistence] cloud hydrate failed', e);
        }
      })();
    }
  });
}
