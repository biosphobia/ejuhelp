import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch, type Unsubscribe } from 'firebase/firestore';
import { useBoard, notebookOf, defaultNotebooks, type Page, type NotebookMeta } from './board';
import { useAuth } from './auth';
import { useUI } from './ui';
import { db } from './firebase';
import { idbGet, idbGetMany, idbWrite, persistStorage } from './idb';
import { create } from 'zustand';
import { chunkPage, assemblePages, type ChunkDoc } from './chunk';

const LS_KEY = 'eju-board-v1';
const LS_SNAPS = 'eju-board-snapshots';
// Device storage (IndexedDB). Each page, snapshot and journal entry is its own
// record, so a save writes only what changed and nothing is held in memory
// that is not needed (a full-notebook rewrite after every stroke, and twelve
// snapshots plus the journal kept in memory, crashed the iPad's tab).
const IDB_BOARD2 = 'board2'; // { v: 2, order, currentPageId, notebooks, updatedAt }
const pageKey = (id: string) => `bp:${id}`;
const IDB_SNAPS2 = 'board-snaps2'; // SnapMeta[], newest first
const snapKey = (id: string) => `bs:${id}`;
const IDB_JOURNAL2 = 'journal2'; // JournalMeta[], newest first
const journalKey = (id: string) => `bj:${id}`;
// Older layouts, still read (and moved over) so nothing saved by an older build is missed.
const IDB_BOARD = 'board';
const IDB_SNAPS = 'board-snapshots';
const IDB_HISTORY = 'board-history';
const HISTORY_KEEP = 400; // journal entries kept on the device (older ones fall off)
const HISTORY_MAX_BYTES = 40_000_000; // on disk, not in memory
const LS_MIRROR_MAX = 1_500_000; // mirror to localStorage only while it comfortably fits
const LOCAL_SNAPS_KEEP = 12;
const CLOUD_SNAPS_KEEP = 5;
const AUTO_SNAPSHOT_MS = 20 * 3_600_000; // one automatic cloud snapshot a day

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
import type { CPage, CStroke } from './chunk';

const round = (n: number, d: number) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

// Encoding a page is costly on a full notebook (every point of every stroke), and
// it used to run for every page half a second after each stroke. Pages are
// immutable in the board store (an edit makes a new page object), so a page's
// encoding is kept with it and only changed pages are encoded again.
interface EncEntry {
  strokes: Page['strokes'];
  n: number;
  last: Page['strokes'][number] | undefined;
  texts: Page['texts'];
  title?: string;
  notebook?: string;
  sourceId?: string;
  st: CStroke[];
  key: string;
}
const encCache = new WeakMap<Page, EncEntry>();
// The content key (see contentKey) of an encoded page, kept with the object.
const keyCache = new WeakMap<object, string>();

function encodePage(pg: Page): CPage {
  let e = encCache.get(pg);
  // Also checked field by field, in case a page object is ever changed in place.
  if (
    !e ||
    e.strokes !== pg.strokes ||
    e.n !== pg.strokes.length ||
    e.last !== pg.strokes[pg.strokes.length - 1] ||
    e.texts !== pg.texts ||
    e.title !== pg.title ||
    e.notebook !== pg.notebook ||
    e.sourceId !== pg.sourceId
  ) {
    const st: CStroke[] = pg.strokes.map((s) => ({
      i: s.id,
      c: s.color,
      s: s.size,
      p: s.points.flatMap((pt) => [Math.round(pt.x), Math.round(pt.y), round(pt.p, 2)]),
      ...(s.shape ? { sh: s.shape } : {}),
    }));
    const body: CPage = {
      id: pg.id,
      st,
      ...(pg.notebook ? { nb: pg.notebook } : {}),
      ...(pg.title ? { t: pg.title } : {}),
      ...(pg.texts?.length ? { tx: pg.texts } : {}),
      ...(pg.sourceId ? { src: pg.sourceId } : {}),
    } as CPage;
    e = {
      strokes: pg.strokes,
      n: pg.strokes.length,
      last: pg.strokes[pg.strokes.length - 1],
      texts: pg.texts,
      title: pg.title,
      notebook: pg.notebook,
      sourceId: pg.sourceId,
      st,
      key: JSON.stringify(body),
    };
    encCache.set(pg, e);
  }
  const cp: CPage = {
    id: pg.id,
    v: [round(pg.viewport.scale, 3), Math.round(pg.viewport.x), Math.round(pg.viewport.y)],
    st: e.st,
    ...(pg.notebook ? { nb: pg.notebook } : {}),
    ...(pg.title ? { t: pg.title } : {}),
    ...(pg.texts?.length ? { tx: pg.texts } : {}),
    ...(pg.sourceId ? { src: pg.sourceId } : {}),
  };
  keyCache.set(cp, e.key);
  return cp;
}
// When each page's content last changed. Pan/zoom does not count. Used to settle
// the same page edited on two devices: the later edit wins, nothing is merged blindly.
const mtimes = new Map<string, number>();
const lastContent = new Map<string, string>(); // pageId -> content key at the last stamp
/** Everything about a page except its view, change time and parent version. */
const contentKey = (cp: CPage) => {
  const known = keyCache.get(cp);
  if (known !== undefined) return known;
  const { v: _v, m: _m, pm: _pm, ...rest } = cp;
  const key = JSON.stringify(rest);
  keyCache.set(cp, key);
  return key;
};
/** Same pages, same order, same content, view and change times (cheap with cached keys). */
function samePages(a: CPage[], b: CPage[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.id !== y.id || x.m !== y.m || x.pm !== y.pm || String(x.v) !== String(y.v) || contentKey(x) !== contentKey(y)) return false;
  }
  return true;
}
/** Encode pages and stamp the ones whose content changed since the last call. */
function encode(pages: Page[]): CPage[] {
  const now = Date.now();
  return pages.map((pg) => {
    const cp = encodePage(pg);
    const key = contentKey(cp);
    if (lastContent.get(cp.id) !== key) {
      lastContent.set(cp.id, key);
      mtimes.set(cp.id, Math.max(now, (mtimes.get(cp.id) ?? 0) + 1));
    }
    const out = { ...cp, m: mtimes.get(cp.id) ?? 0 };
    keyCache.set(out, key);
    return out;
  });
}
/** Remember pages as already known (loaded from disk or cloud) so they are not
 *  re-stamped. A page saved by an older build has no time: it counts as oldest. */
function noteKnown(pages: CPage[]) {
  for (const cp of pages) {
    lastContent.set(cp.id, contentKey(cp));
    mtimes.set(cp.id, typeof cp.m === 'number' ? cp.m : 0);
  }
}

function decodePoints(p: number[] | number[][] | undefined): { x: number; y: number; p: number }[] {
  if (!Array.isArray(p) || !p.length) return [];
  if (Array.isArray(p[0])) return (p as number[][]).map((t) => ({ x: t[0], y: t[1], p: t[2] })); // older saves
  const flat = p as number[];
  const out: { x: number; y: number; p: number }[] = [];
  for (let i = 0; i + 2 < flat.length; i += 3) out.push({ x: flat[i], y: flat[i + 1], p: flat[i + 2] });
  return out;
}
function decode(cps: CPage[]): Page[] {
  return cps.map((cp) => ({
    id: cp.id,
    viewport: { scale: cp.v?.[0] ?? 1, x: cp.v?.[1] ?? 0, y: cp.v?.[2] ?? 0 },
    strokes: (cp.st ?? []).map((cs) => ({
      id: cs.i,
      color: cs.c,
      size: cs.s,
      points: decodePoints(cs.p),
      ...(cs.sh ? { shape: cs.sh } : {}),
    })),
    ...(cp.nb ? { notebook: cp.nb } : {}),
    ...(cp.t ? { title: cp.t } : {}),
    ...(cp.tx?.length ? { texts: cp.tx } : {}),
    ...(cp.src ? { sourceId: cp.src } : {}),
  }));
}

/** Decode pages read from storage and keep their encoding with them, so the first
 *  save after loading does not encode the whole notebook again. Only pages stored
 *  in the current format qualify (encoding them again would give exactly this). */
function decodeKnown(cps: CPage[]): Page[] {
  const pages = decode(cps);
  pages.forEach((pg, i) => {
    const cp = cps[i];
    const st = cp.st ?? [];
    const current = st.every((s) => {
      const keys = Object.keys(s);
      return Array.isArray(s.p) && typeof s.p[0] !== 'object' && s.p.length % 3 === 0 && keys.every((k) => k === 'i' || k === 'c' || k === 's' || k === 'p' || k === 'sh');
    });
    if (!current || cp.id !== pg.id) return;
    const body: CPage = {
      id: pg.id,
      st,
      ...(pg.notebook ? { nb: pg.notebook } : {}),
      ...(pg.title ? { t: pg.title } : {}),
      ...(pg.texts?.length ? { tx: pg.texts } : {}),
      ...(pg.sourceId ? { src: pg.sourceId } : {}),
    } as CPage;
    encCache.set(pg, {
      strokes: pg.strokes,
      n: pg.strokes.length,
      last: pg.strokes[pg.strokes.length - 1],
      texts: pg.texts,
      title: pg.title,
      notebook: pg.notebook,
      sourceId: pg.sourceId,
      st,
      key: JSON.stringify(body),
    });
  });
  return pages;
}

const hasInk = (p: CPage) => (p.st?.length ?? 0) > 0 || (p.tx?.length ?? 0) > 0;
const inkOf = (p: CPage) => (p.st?.length ?? 0) + (p.tx?.length ?? 0);
const inkPages = (pages: CPage[]) => pages.filter(hasInk).length;

// ─────────────────────────── local ───────────────────────────
let localUpdatedAt = 0;
type LocalBoard = { pages: CPage[]; currentPageId?: string; notebooks?: NotebookMeta[]; updatedAt?: number };
type BoardIndex = { v: 2; order: string[]; currentPageId?: string; notebooks?: NotebookMeta[]; updatedAt?: number };
// The copy of each page last written to IndexedDB (to write only what changed).
const idbWritten = new Map<string, CPage>();
let oldBoardRetired = false;
let lsMirrored = true; // until known otherwise, so a board grown too large clears the old mirror once
const sameWritten = (a: CPage, b: CPage) => a.m === b.m && String(a.v) === String(b.v) && contentKey(a) === contentKey(b);

type DeviceBoard = LocalBoard & { from: 'idb' | 'idb-old' | 'ls' };
/** The device copy of the board: the per-page layout ('idb'), plus anything an older build left in the old record ('idb-old'). */
async function readDeviceBoards(): Promise<DeviceBoard[]> {
  const out: DeviceBoard[] = [];
  const idx = await idbGet<BoardIndex>(IDB_BOARD2);
  if (idx && Array.isArray(idx.order)) {
    const pages = (await idbGetMany<CPage>(idx.order.map(pageKey))).filter((p): p is CPage => Boolean(p && p.id));
    out.push({ pages, currentPageId: idx.currentPageId, notebooks: idx.notebooks, updatedAt: idx.updatedAt, from: 'idb' });
  }
  const old = await idbGet<LocalBoard>(IDB_BOARD);
  if (old?.pages?.length) out.push({ ...old, from: 'idb-old' });
  return out;
}
let localSnaps: LocalSnap[] = []; // only snapshots from the old localStorage layout, until moved over

let lastStructure = '';
let lastSavedEnc: CPage[] | null = null;
function saveLocal() {
  const { pages, currentPageId, notebooks } = useBoard.getState();
  const enc = encode(pages);
  // "When did this device last change the notebook" must mean real changes:
  // ink (each page's own stamp), or pages added/removed/reordered/renamed
  // notebooks. Merely opening the app or turning a page must not make a stale
  // device copy look newer than the account copy.
  const structure = JSON.stringify([pages.map((p) => p.id), notebooks]);
  let at = localUpdatedAt;
  for (const p of enc) if ((p.m ?? 0) > at) at = p.m!;
  if (lastStructure && structure !== lastStructure) at = Math.max(at, Date.now(), localUpdatedAt + 1);
  lastStructure = structure;
  localUpdatedAt = at;
  // A page deleted or cleared on this device is journaled before the copy is gone.
  if (lastSavedEnc) {
    const now = new Map(enc.map((p) => [p.id, p]));
    const gone = lastSavedEnc.filter((p) => hasInk(p) && (!now.has(p.id) || !hasInk(now.get(p.id)!)));
    if (gone.length) journal('deleted-here', gone);
  }
  lastSavedEnc = enc;
  // Only pages that changed since the last write go to IndexedDB, together with
  // the index, in one transaction (so the index never names a page not stored).
  const ids = new Set(enc.map((p) => p.id));
  const puts: [string, unknown][] = [];
  const written: CPage[] = [];
  for (const p of enc) {
    const w = idbWritten.get(p.id);
    if (!w || !sameWritten(w, p)) {
      puts.push([pageKey(p.id), p]);
      written.push(p);
    }
  }
  const removed = [...idbWritten.keys()].filter((id) => !ids.has(id));
  const index: BoardIndex = { v: 2, order: enc.map((p) => p.id), currentPageId, notebooks, updatedAt: localUpdatedAt };
  puts.push([IDB_BOARD2, index]);
  // The old single-record copy is replaced by a marker once (an older build then
  // finds no pages there rather than a stale copy, and a newer save of its own is still read).
  const retire = !oldBoardRetired;
  if (retire) puts.push([IDB_BOARD, { pages: [], movedTo: IDB_BOARD2, updatedAt: 0 }]);
  void idbWrite(puts, removed.map(pageKey)).then((ok) => {
    if (!ok) return; // nothing marked as written: the next save tries again
    for (const p of written) idbWritten.set(p.id, p);
    for (const id of removed) idbWritten.delete(id);
    if (retire) oldBoardRetired = true;
  });
  // Mirror into localStorage while small, so an older build or a blocked
  // IndexedDB still finds the notes. The size is estimated from the cached
  // page keys, so a large board is never turned into one big string for nothing.
  try {
    let size = 0;
    for (const p of enc) size += contentKey(p).length + 40;
    if (size <= LS_MIRROR_MAX) {
      const data: LocalBoard = { pages: enc, currentPageId, notebooks, updatedAt: localUpdatedAt };
      const json = JSON.stringify(data);
      if (json.length <= LS_MIRROR_MAX) {
        localStorage.setItem(LS_KEY, json);
        lsMirrored = true;
      } else if (lsMirrored) {
        localStorage.removeItem(LS_KEY);
        lsMirrored = false;
      }
    } else if (lsMirrored) {
      localStorage.removeItem(LS_KEY);
      lsMirrored = false;
    }
  } catch (e) {
    console.warn('[persistence] localStorage mirror skipped', e);
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

/** What is kept in memory about a device snapshot; the pages stay on disk until needed. */
interface SnapMeta {
  id: string;
  ts: number;
  reason: string;
  /** Pages with ink. */
  pages: number;
  /** Cheap fingerprint of the content (page ids, change times, ink counts). */
  sig: string;
}
const snapSig = (pages: CPage[]) => pages.map((p) => `${p.id}:${p.m ?? 0}:${inkOf(p)}`).join(',');
const snapMeta = (s: LocalSnap): SnapMeta => ({ id: s.id, ts: s.ts, reason: s.reason, pages: inkPages(s.pages), sig: snapSig(s.pages) });
let snapIndex: SnapMeta[] = [];

/** One device snapshot, read from disk. */
async function readLocalSnap(id: string): Promise<LocalSnap | undefined> {
  return (await idbGet<LocalSnap>(snapKey(id))) ?? localSnaps.find((s) => s.id === id);
}

const OLD_SNAPS_DELAY_MS = 2000;
let oldSnapsMoved: Promise<void> = Promise.resolve();
async function moveOldSnaps() {
  try {
    const old = (await idbGet<LocalSnap[]>(IDB_SNAPS)) ?? [];
    const rawSnaps = localStorage.getItem(LS_SNAPS);
    if (rawSnaps) localSnaps = (JSON.parse(rawSnaps) as LocalSnap[]).filter((s) => s && Array.isArray(s.pages));
    if (!old.length && !localSnaps.length) return;
    await adoptOldSnaps([...old, ...localSnaps]);
    localSnaps = [];
    localStorage.removeItem(LS_SNAPS);
  } catch (e) {
    console.warn('[persistence] moving old snapshots failed', e);
  }
}

/** Store snapshots taken from an older layout as separate records (newest first, capped). */
async function adoptOldSnaps(old: LocalSnap[]) {
  const all = [...old.filter((s) => s && Array.isArray(s.pages)).map(snapMeta), ...snapIndex];
  const seen = new Set<string>();
  const keep = all.filter((m) => !seen.has(m.id) && seen.add(m.id)).sort((a, b) => b.ts - a.ts).slice(0, LOCAL_SNAPS_KEEP);
  for (const s of old) if (keep.some((m) => m.id === s.id)) await idbWrite([[snapKey(s.id), s]]);
  snapIndex = keep;
  if (await idbWrite([[IDB_SNAPS2, snapIndex]])) await idbWrite([[IDB_SNAPS, []]]);
}

/** Keep a copy of the current pages on this device (newest first, capped). */
function snapshotLocal(reason: string, pages?: CPage[], notebooks?: NotebookMeta[]) {
  const st = useBoard.getState();
  const p = pages ?? encode(st.pages);
  if (!inkPages(p)) return;
  const sig = snapSig(p);
  if (reason !== 'manual' && snapIndex[0]?.sig === sig) return; // the newest snapshot already holds exactly this
  const snap: LocalSnap = { id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, ts: Date.now(), reason, pages: p, notebooks: notebooks ?? st.notebooks };
  const all = [snapMeta(snap), ...snapIndex];
  snapIndex = all.slice(0, LOCAL_SNAPS_KEEP);
  const dropped = all.slice(LOCAL_SNAPS_KEEP).map((m) => snapKey(m.id));
  void idbWrite([[snapKey(snap.id), snap], [IDB_SNAPS2, snapIndex]], dropped);
}

// ─────────────────────────── sync status (shown in Settings) ───────────────────────────
export interface SyncStatus {
  /** last successful cloud save of the notebook (ms), 0 = none this session */
  cloudSavedAt: number;
  /** pages in the cloud copy after the last save */
  cloudPages: number;
  /** last cloud error message, cleared by the next success */
  cloudError: string | null;
  /** true once this device has merged with the account copy (cloud writes are held until then) */
  merged: boolean;
  /** journal entries written this session (page versions kept before being replaced or removed) */
  journaled: number;
}
export const useSyncStatus = create<SyncStatus>(() => ({ cloudSavedAt: 0, cloudPages: 0, cloudError: null, merged: false, journaled: 0 }));

// ─────────────────────────── journal ───────────────────────────
// Every page version that is about to lose ink or disappear through anything
// other than the pen on this device (a merge, another device, a restore, an
// import, a page delete or clear) is written to the journal first: on the
// device (IndexedDB) and in the account (users/{uid}/history). The journal is
// never trimmed by ink content, only by age on the device, and "Find lost
// pages" searches it. So no update, sync rule or mistake can lose a page
// without leaving a copy that can be put back.
export interface JournalEntry {
  id: string;
  pageId: string;
  ts: number;
  reason: string;
  page: CPage;
}
/** What is kept in memory about a journal entry; the page itself stays on disk. */
interface JournalMeta {
  id: string;
  pageId: string;
  ts: number;
  reason: string;
  /** Approximate size on disk. */
  bytes: number;
}
let journalIndex: JournalMeta[] = [];
let journalLoaded: Promise<void> | null = null;
// Per page, the strokes (and texts) of the last copy journaled this session: a
// newer copy whose ink is all in it adds nothing recoverable, so it is not
// stored again (erasing stroke after stroke used to add a full page copy each time).
const lastJournaled = new Map<string, { ids: Set<string>; tx: string; t: string }>();
function coveredByJournal(page: CPage): boolean {
  const prev = lastJournaled.get(page.id);
  if (!prev) return false;
  if (JSON.stringify(page.tx ?? []) !== prev.tx || (page.t ?? '') !== prev.t) return false;
  return (page.st ?? []).every((s) => prev.ids.has(s.i));
}
function loadJournal(): Promise<void> {
  if (!journalLoaded) {
    journalLoaded = (async () => {
      journalIndex = (await idbGet<JournalMeta[]>(IDB_JOURNAL2)) ?? [];
      // Move entries kept by an older build (one big record) into the per-entry layout.
      const old = await idbGet<JournalEntry[]>(IDB_HISTORY);
      if (old?.length) {
        const known = new Set(journalIndex.map((m) => m.id));
        const fresh = old.filter((e) => e && e.page && !known.has(e.id));
        for (const e of fresh) await idbWrite([[journalKey(e.id), e]]);
        journalIndex = [...journalIndex, ...fresh.map((e) => ({ id: e.id, pageId: e.pageId, ts: e.ts, reason: e.reason, bytes: contentKey(e.page).length }))].sort((a, b) => b.ts - a.ts);
        if (await idbWrite([[IDB_JOURNAL2, journalIndex]])) await idbWrite([[IDB_HISTORY, []]]);
      }
    })().catch((e) => console.warn('[persistence] journal load failed', e));
  }
  return journalLoaded;
}
function journal(reason: string, pages: CPage[]) {
  const inked = pages.filter((p) => hasInk(p) && !coveredByJournal(p));
  if (!inked.length) return;
  const ts = Date.now();
  const entries: JournalEntry[] = inked.map((page, i) => ({ id: `${page.id}-${ts + i}`, pageId: page.id, ts: ts + i, reason, page }));
  for (const e of entries) lastJournaled.set(e.pageId, { ids: new Set((e.page.st ?? []).map((s) => s.i)), tx: JSON.stringify(e.page.tx ?? []), t: e.page.t ?? '' });
  void loadJournal().then(() => {
    journalIndex = [...entries.map((e) => ({ id: e.id, pageId: e.pageId, ts: e.ts, reason: e.reason, bytes: contentKey(e.page).length })), ...journalIndex];
    // Oldest entries fall off by count and by size on disk.
    let bytes = 0;
    let keep = 0;
    while (keep < journalIndex.length && keep < HISTORY_KEEP && (keep === 0 || bytes + journalIndex[keep].bytes <= HISTORY_MAX_BYTES)) {
      bytes += journalIndex[keep].bytes;
      keep++;
    }
    const dropped = journalIndex.slice(keep).map((m) => journalKey(m.id));
    journalIndex = journalIndex.slice(0, keep);
    void idbWrite([...entries.map((e) => [journalKey(e.id), e] as [string, unknown]), [IDB_JOURNAL2, journalIndex]], dropped);
  });
  useSyncStatus.setState((st) => ({ journaled: st.journaled + entries.length }));
  const { user } = useAuth.getState();
  if (!user || !db) return;
  void (async () => {
    try {
      const col = collection(db!, 'users', user.uid, 'history');
      let batch = writeBatch(db!);
      let n = 0;
      for (const e of entries) {
        for (const part of chunkPage({ ...e.page, id: e.id })) {
          batch.set(doc(col, part.id), { ...part.data, pageId: e.pageId, ts: e.ts, reason });
          if (++n >= 20) {
            await batch.commit();
            batch = writeBatch(db!);
            n = 0;
          }
        }
      }
      if (n) await batch.commit();
    } catch (e) {
      console.warn('[persistence] cloud journal failed', e);
    }
  })();
}
/**
 * Compare the notebook before and after an automatic change and journal every
 * page that lost ink or vanished. Called around every merge, remote update,
 * restore and import — the one place that guarantees nothing is lost silently.
 */
function guardInk(reason: string, before: CPage[], after: CPage[]) {
  const afterById = new Map(after.map((p) => [p.id, p]));
  const lost = before.filter((p) => hasInk(p) && lostInk(p, afterById.get(p.id)));
  if (lost.length) journal(reason, lost);
}
/** Whether any stroke or text of `before` is missing from `after` (not just fewer of them:
 *  a newer copy with as many strokes can still have dropped some and added others). */
function lostInk(before: CPage, after: CPage | undefined): boolean {
  if (!after) return true;
  if (before === after || contentKey(before) === contentKey(after)) return false;
  if (inkOf(after) < inkOf(before)) return true;
  const strokes = new Set((after.st ?? []).map((s) => s.i));
  if ((before.st ?? []).some((s) => !strokes.has(s.i))) return true;
  const texts = new Set((after.tx ?? []).map((t) => JSON.stringify(t)));
  return (before.tx ?? []).some((t) => !texts.has(JSON.stringify(t)));
}
/** Every journal entry on this device, newest first (read from disk). */
export async function listJournal(): Promise<JournalEntry[]> {
  await loadJournal();
  const index = journalIndex;
  const entries = await idbGetMany<JournalEntry>(index.map((m) => journalKey(m.id)));
  return entries.filter((e): e is JournalEntry => Boolean(e && e.page));
}

// ─────────────────────────── cloud ───────────────────────────
// users/{uid}/board/main            → { v: 2, order: [pageId…], currentPageId, notebooks, updatedAt, snapshots: [...] }
// users/{uid}/board/main/pages/{id} → one encoded page per doc
// users/{uid}/board/snap-{ts}       → { ts, reason, order, notebooks, count } with its own pages subcollection
// One doc per page keeps every write far below Firestore's 1 MB document cap.
const lastCloud = new Map<string, string>(); // pageId -> content key (see contentKey) as last written or received
const lastCloudPage = new Map<string, CPage>(); // pageId -> that copy, the base for merging edits made on two devices
// A few recent account copies per page, by version (`m`). When another device's
// write was made from an older copy than the one we last synced, that older copy
// is the right base for a three-way merge, so its erasures still count and
// nothing of ours is dropped.
const versions = new Map<string, Map<number, CPage>>();
const VERSIONS_KEEP = 6;
function rememberVersion(cp: CPage) {
  if (typeof cp.m !== 'number') return;
  let m = versions.get(cp.id);
  if (!m) versions.set(cp.id, (m = new Map()));
  m.set(cp.m, cp);
  while (m.size > VERSIONS_KEEP) m.delete(m.keys().next().value!);
}
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
  for (let enc of pages) {
    const key = contentKey(enc);
    if (skipUnchanged && lastCloud.get(enc.id) === key) continue;
    const prev = skipUnchanged ? lastCloudPage.get(enc.id) : undefined;
    if (prev && hasInk(prev) && inkOf(enc) < inkOf(prev)) journal('replaced-in-cloud', [prev]);
    // Record which account copy this write was made from, so other devices can
    // tell a follow-on write from one made at the same time as theirs.
    if (skipUnchanged) enc = { ...enc, pm: prev?.m ?? 0 };
    for (const part of chunkPage(enc)) {
      batch.set(doc(colRef, part.id), part.data);
      if (++n >= 20) await flush();
    }
    if (skipUnchanged) {
      lastCloud.set(enc.id, key);
      lastCloudPage.set(enc.id, enc);
      rememberVersion(enc);
    }
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

let mergedUid: string | null = null; // the account this device has merged with; cloud writes wait for it
let merging = false;
async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) return;
  // Never write to the account before this device has merged with its copy: a
  // save that ran first would push a possibly stale device copy over it.
  if (mergedUid !== user.uid) return;
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
        for (let i = 1; i < 40; i++) await deleteDoc(doc(pagesCol, `${id}~${i}`)).catch(() => undefined);
        lastCloud.delete(id);
        lastCloudPage.delete(id);
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
    useSyncStatus.setState({ cloudSavedAt: Date.now(), cloudPages: enc.length, cloudError: null });
    if (Date.now() - lastAutoSnapshot > AUTO_SNAPSHOT_MS && inkPages(enc)) {
      lastAutoSnapshot = Date.now();
      await snapshotCloud('auto', enc, notebooks);
    }
  } catch (e) {
    console.warn('[persistence] cloud save failed', e);
    useSyncStatus.setState({ cloudError: e instanceof Error ? e.message : String(e) });
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
    const docs: { id: string; data: any }[] = [];
    qs.forEach((d) => docs.push({ id: d.id, data: d.data() }));
    const byId = new Map(assemblePages(docs).map((p) => [p.id, p]));
    const order = data.order ?? [];
    const pages = order.map((id) => byId.get(id)).filter((p): p is CPage => Boolean(p));
    for (const [id, p] of byId) if (!order.includes(id)) pages.push(p); // pages the order list missed
    for (const p of pages) {
      lastCloud.set(p.id, contentKey(p));
      lastCloudPage.set(p.id, p);
      rememberVersion(p);
    }
    lastMainAt = data.updatedAt ?? 0;
    return { pages, currentPageId: data.currentPageId, notebooks: data.notebooks, updatedAt: data.updatedAt ?? 0, legacy: false };
  }
  if (data.pages?.length) return { pages: data.pages, currentPageId: data.currentPageId, updatedAt: data.updatedAt ?? 0, legacy: true };
  return null;
}

/**
 * Union of two page sets by id. A page on only one side is always kept; a page on
 * both sides takes the newer side's version. Nothing is ever dropped.
 */
/** Which of two copies of one page to keep. With a change time on both, the later
 *  edit wins (that is how an erase travels). Without reliable times, the copy with
 *  more ink wins: a stale device copy can never blank out a page. Ties keep `a`. */
function pickPage(a: CPage, b: CPage): CPage {
  const am = a.m ?? 0;
  const bm = b.m ?? 0;
  if (am > 0 && bm > 0 && am !== bm) return am > bm ? a : b;
  return inkOf(b) > inkOf(a) ? b : a;
}
function mergePages(local: CPage[], cloud: CPage[], cloudNewer: boolean): CPage[] {
  const base = cloudNewer ? cloud : local;
  const other = cloudNewer ? local : cloud;
  const otherById = new Map(other.map((p) => [p.id, p]));
  const seen = new Set(base.map((p) => p.id));
  const out = base.map((p) => {
    const o = otherById.get(p.id);
    return o ? pickPage(p, o) : p;
  });
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
  const local: BackupMeta[] = snapIndex.map((s) => ({ id: s.id, where: 'device', ts: s.ts, reason: s.reason, pages: s.pages }));
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
  await oldSnapsMoved;
  let pages: CPage[] | null = null;
  let notebooks: NotebookMeta[] | undefined;
  const local = snapIndex.some((s) => s.id === id) ? await readLocalSnap(id) : undefined;
  if (local) {
    pages = local.pages;
    notebooks = local.notebooks;
  } else {
    const { user } = useAuth.getState();
    if (!user || !db) throw new Error('backup_unavailable');
    const ref = doc(db, 'users', user.uid, 'board', id);
    const meta = (await getDoc(ref)).data() as { order?: string[]; notebooks?: NotebookMeta[] } | undefined;
    const qs = await getDocs(collection(ref, 'pages'));
    const docs: { id: string; data: any }[] = [];
    qs.forEach((d) => docs.push({ id: d.id, data: d.data() }));
    const byId = new Map(assemblePages(docs).map((p) => [p.id, p]));
    pages = (meta?.order ?? [...byId.keys()]).map((pid) => byId.get(pid)).filter((p): p is CPage => Boolean(p));
    for (const [pid, p] of byId) if (!pages.some((x) => x.id === pid)) pages.push(p);
    notebooks = meta?.notebooks;
  }
  if (!pages) throw new Error('backup_unavailable');
  const st = useBoard.getState();
  const current = encode(st.pages);
  snapshotLocal('before-restore', current, st.notebooks);
  guardInk('before-restore', current, mode === 'replace' ? pages : current);
  // Replace: the backup as it was, plus current pages the backup does not have.
  // Merge: every page from both; a page in both keeps whichever copy has more ink.
  const curById = new Map(current.map((p) => [p.id, p]));
  const bakById = new Map(pages.map((p) => [p.id, p]));
  let merged: CPage[];
  if (mode === 'replace') {
    merged = [...pages, ...current.filter((p) => !bakById.has(p.id) && hasInk(p))];
  } else {
    merged = current.map((p) => {
      const b = bakById.get(p.id);
      return b && inkOf(b) > inkOf(p) ? b : p;
    });
    for (const p of pages) if (!curById.has(p.id)) merged.push(p);
  }
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
  for (const b of await readDeviceBoards()) consider(b.pages, 'device');
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) consider((JSON.parse(raw) as { pages?: CPage[] }).pages, 'device (mirror)');
    const oldSnaps = localStorage.getItem(LS_SNAPS);
    if (oldSnaps) for (const sn of JSON.parse(oldSnaps) as LocalSnap[]) consider(sn.pages, 'device snapshot (old)');
  } catch {
    /* ignore */
  }
  searched.push('device');
  // One at a time, so no more than one snapshot is in memory.
  await oldSnapsMoved;
  for (const m of snapIndex) {
    const s = await readLocalSnap(m.id);
    if (s) consider(s.pages, `device snapshot ${new Date(s.ts).toLocaleString()}`);
  }
  if (snapIndex.length) searched.push('device snapshots');
  await loadJournal();
  // In small batches, so the journal is never all in memory at once.
  for (let i = 0; i < journalIndex.length; i += 20) {
    const batch = await idbGetMany<JournalEntry>(journalIndex.slice(i, i + 20).map((m) => journalKey(m.id)));
    for (const e of batch) if (e?.page) consider([e.page], `journal ${new Date(e.ts).toLocaleString()} (${e.reason})`);
  }
  if (journalIndex.length) searched.push('journal');

  const { user } = useAuth.getState();
  if (user && db) {
    try {
      const mainRef = doc(db, 'users', user.uid, 'board', 'main');
      const main = (await getDoc(mainRef)).data() as { pages?: CPage[]; snapshots?: BackupMeta[] } | undefined;
      if (main?.pages?.length) consider(main.pages, 'cloud (old layout)');
      const qs = await getDocs(collection(mainRef, 'pages'));
      const docs: { id: string; data: any }[] = [];
      qs.forEach((d) => docs.push({ id: d.id, data: d.data() }));
      consider(assemblePages(docs), 'cloud');
      searched.push('cloud');
      const snaps = main?.snapshots ?? cloudSnapshots;
      for (const sn of snaps) {
        try {
          const sq = await getDocs(collection(doc(db, 'users', user.uid, 'board', sn.id), 'pages'));
          const sdocs: { id: string; data: any }[] = [];
          sq.forEach((d) => sdocs.push({ id: d.id, data: d.data() }));
          consider(assemblePages(sdocs), `cloud snapshot ${new Date(sn.ts).toLocaleString()}`);
        } catch {
          /* skip */
        }
      }
      if (snaps.length) searched.push('cloud snapshots');
      try {
        const hq = await getDocs(collection(db, 'users', user.uid, 'history'));
        const hdocs: { id: string; data: any }[] = [];
        hq.forEach((d) => hdocs.push({ id: d.id, data: d.data() }));
        const entries = assemblePages(hdocs) as (CPage & { pageId?: string; ts?: number; reason?: string })[];
        for (const e of entries) {
          const { pageId, ts, reason, ...page } = e;
          if (pageId) consider([{ ...page, id: pageId }], `cloud journal ${new Date(ts ?? 0).toLocaleString()} (${reason ?? ''})`);
        }
        if (entries.length) searched.push('cloud journal');
      } catch (e) {
        console.warn('[persistence] cloud journal scan failed', e);
      }
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
  guardInk('before-recover', current, out);
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
  guardInk('before-import', current, merged);
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
let localReady: Promise<void> = Promise.resolve();

function flushNow() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = undefined;
  saveLocal();
  void saveCloud();
}

/** Read the device copy: IndexedDB first, then the localStorage mirror (older builds
 *  saved only there). Both are merged and the newer one leads, so nothing is lost. */
async function hydrateLocal(subject: string) {
  const sources = await readDeviceBoards();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const ls = JSON.parse(raw) as LocalBoard;
      if (ls?.pages?.length) sources.push({ ...ls, from: 'ls' });
    }
  } catch {
    /* ignore */
  }
  try {
    snapIndex = (await idbGet<SnapMeta[]>(IDB_SNAPS2)) ?? [];
  } catch (e) {
    console.warn('[persistence] snapshot index load failed', e);
  }
  // Snapshots kept by an older build (all in one record) are moved a little after
  // the notebook has loaded: reading them means holding every one of them in memory
  // once, which must not add to the memory the notebook itself needs while loading.
  oldSnapsMoved = new Promise((resolve) => setTimeout(() => void moveOldSnaps().finally(resolve), OLD_SNAPS_DELAY_MS));
  // The journal index (and moving an older build's journal) likewise, once that is done.
  void oldSnapsMoved.then(() => loadJournal());
  const withPages = sources.filter((b) => b.pages?.length);
  if (!withPages.length) return;
  // The newest copy leads; the others are merged in, so nothing in any of them is lost.
  withPages.sort((x, y) => (y.updatedAt ?? 0) - (x.updatedAt ?? 0));
  const lead = withPages[0];
  let pages = lead.pages;
  for (const other of withPages.slice(1)) pages = mergePages(pages, other.pages, false);
  if (withPages.length > 1) for (const b of withPages) guardInk('device-copies-merged', b.pages, pages);
  localUpdatedAt = Math.max(...withPages.map((b) => b.updatedAt ?? 0));
  noteKnown(pages);
  // What the per-page records hold already, so the first save writes only what
  // changed. Only that layout counts: pages read from an older record or the
  // localStorage mirror are written as records on the first save.
  const idbCopy = withPages.find((b) => b.from === 'idb');
  if (idbCopy) for (const p of idbCopy.pages) idbWritten.set(p.id, p);
  oldBoardRetired = !withPages.some((b) => b.from === 'idb-old') && Boolean(idbCopy);
  const board = useBoard.getState();
  let notebooks = lead.notebooks;
  for (const other of withPages.slice(1)) notebooks = mergeNotebooks(notebooks, other.notebooks);
  board.setNotebooks(mergeNotebooks(notebooks, undefined));
  board.loadPages(decodeKnown(pages), lead.currentPageId, subject);
  board.setNotebooks(useBoard.getState().notebooks);
  const st = useBoard.getState();
  lastStructure = JSON.stringify([st.pages.map((p) => p.id), st.notebooks]);
  lastSavedEnc = pages;
}

/** Wire up local + cloud autosave. Call once at startup. */
export function initPersistence() {
  const subject = useUI.getState().subject;
  persistStorage();

  // 1) hydrate the device copy (IndexedDB + localStorage mirror)
  localReady = hydrateLocal(subject)
    .catch((e) => console.warn('[persistence] local hydrate failed', e))
    .then(() => useBoard.getState().setNotebook(useUI.getState().subject));
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
    saveTimer = setTimeout(flushNow, 500);
  });
  // The iPad kills background web apps without warning: write immediately when the
  // app is hidden or the page is being left, so the last strokes are never lost.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushNow();
  });
  window.addEventListener('pagehide', flushNow);

  // 3) on sign-in, MERGE with the cloud board. Pages are joined by id, so a page
  //    that exists on only one side is always kept; the newer side wins for pages
  //    on both. A device snapshot is taken first, so nothing is ever lost silently.
  const mergeWithCloud = (st: { user: { uid: string } | null }) => {
    if (!st.user || !db || merging) return;
    merging = true;
    void (async () => {
        try {
          await localReady; // never merge the cloud into a half-loaded device copy
          const cloud = await loadCloud(st.user!.uid);
          const board = useBoard.getState();
          const local = encode(board.pages);
          if (!cloud) {
            mergedUid = st.user!.uid;
            useSyncStatus.setState({ merged: true });
            await saveCloud();
            merging = false;
            if (useAuth.getState().user === st.user) startLive(st.user!.uid);
            return;
          }
          const cloudNewer = cloud.updatedAt > localUpdatedAt;
          // A blank page this device made on its own (the starter page of a fresh
          // install) is not worth adding to an account that already has pages
          // in that notebook; every page with ink always is.
          const cloudNbs = new Set(cloud.pages.map((p) => p.nb ?? 'physics'));
          const cloudIds = new Set(cloud.pages.map((p) => p.id));
          const localKept = local.filter((p) => hasInk(p) || cloudIds.has(p.id) || !cloudNbs.has(p.nb ?? 'physics'));
          const merged = mergePages(localKept, cloud.pages, cloudNewer);
          guardInk('cloud-merge', local, merged);
          guardInk('cloud-merge', cloud.pages, merged);
          const changed = !samePages(merged, local);
          if (changed) {
            snapshotLocal('before-cloud-merge', local, board.notebooks);
            noteKnown(merged);
            board.setNotebooks(mergeNotebooks(cloudNewer ? cloud.notebooks : board.notebooks, cloudNewer ? board.notebooks : cloud.notebooks));
            board.loadPages(decode(merged), board.currentPageId, useUI.getState().subject);
            board.setNotebooks(useBoard.getState().notebooks);
            board.setNotebook(useUI.getState().subject);
            saveLocal();
          }
          // Legacy single-doc board: keep a cloud snapshot of it before migrating.
          if (cloud.legacy) await snapshotCloud('legacy-board', cloud.pages, board.notebooks);
          mergedUid = st.user!.uid;
          useSyncStatus.setState({ merged: true });
          await saveCloud();
        } catch (e) {
          console.warn('[persistence] cloud hydrate failed', e);
          useSyncStatus.setState({ cloudError: e instanceof Error ? e.message : String(e) });
          merging = false;
          return; // not merged: cloud writes stay held, the device copy is untouched; retried when online
        }
        merging = false;
        if (useAuth.getState().user === st.user) startLive(st.user!.uid);
    })();
  };
  useAuth.subscribe((st, prev) => {
    if (st.user && st.user !== prev.user) {
      mergedUid = null;
      useSyncStatus.setState({ merged: false });
      mergeWithCloud(st);
    }
    if (!st.user) {
      stopLive();
      mergedUid = null;
      useSyncStatus.setState({ merged: false });
    }
  });
  // A merge that failed (offline at sign-in, a bad connection) is retried as soon
  // as the connection is back; until then nothing is written to the account.
  const retry = () => {
    const st = useAuth.getState();
    if (st.user && mergedUid !== st.user.uid) mergeWithCloud(st);
  };
  window.addEventListener('online', retry);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') retry();
  });
  setInterval(retry, 30_000);
}

// ─────────────────────────── live sync ───────────────────────────
// While signed in, listen to the cloud board so pages written on another device
// appear here as they are saved there. Only real remote changes are applied:
// echoes of this device's own writes are ignored, a page edited here more
// recently than the incoming copy is kept (and uploaded), and a page that was
// deleted elsewhere is removed here only if it was not touched since it was
// last synced. A device snapshot is taken before a page with local ink is replaced.
let liveUnsubs: Unsubscribe[] = [];
let lastMainAt = 0;
let lastLiveSnapshot = 0;

function stopLive() {
  for (const u of liveUnsubs) u();
  liveUnsubs = [];
}

function startLive(uid: string) {
  stopLive();
  if (!db) return;
  const mainRef = doc(db, 'users', uid, 'board', 'main');
  const pagesCol = collection(mainRef, 'pages');

  liveUnsubs.push(
    onSnapshot(
      pagesCol,
      (snap) => {
        try {
          const touched = new Set<string>();
          const removed = new Set<string>();
          for (const ch of snap.docChanges()) {
            if (ch.doc.metadata.hasPendingWrites) continue; // this device's own write, not yet confirmed
            const head = ch.doc.id.replace(/~\d+$/, '');
            if (ch.type === 'removed' && head === ch.doc.id) removed.add(head);
            else touched.add(head);
          }
          if (!touched.size && !removed.size) return;
          const docs: ChunkDoc[] = [];
          snap.forEach((d) => {
            const head = d.id.replace(/~\d+$/, '');
            if (touched.has(head)) docs.push({ id: d.id, data: d.data() });
          });
          for (const id of removed) touched.delete(id);
          applyRemotePages(assemblePages(docs), [...removed].filter((id) => !snap.docs.some((d) => d.id === id)));
        } catch (e) {
          // An exception inside a Firestore listener would take the client down; never let one out.
          console.warn('[persistence] applying remote pages failed', e);
        }
      },
      (e) => console.warn('[persistence] live pages listener failed', e)
    )
  );

  liveUnsubs.push(
    onSnapshot(
      mainRef,
      (snap) => {
        try {
          if (snap.metadata.hasPendingWrites || !snap.exists()) return;
          const data = snap.data() as { v?: number; order?: string[]; notebooks?: NotebookMeta[]; updatedAt?: number; snapshots?: BackupMeta[] };
          if (Array.isArray(data.snapshots)) cloudSnapshots = data.snapshots.filter((s) => s && typeof s.id === 'string');
          const at = typeof data.updatedAt === 'number' ? data.updatedAt : 0;
          if (data.v !== 2 || at <= lastMainAt) return;
          lastMainAt = at;
          const board = useBoard.getState();
          if (Array.isArray(data.notebooks)) board.setNotebooks(mergeNotebooks(data.notebooks, board.notebooks));
          const order = Array.isArray(data.order) ? data.order : [];
          const cur = board.pages.map((p) => p.id).filter((id) => order.includes(id));
          const want = order.filter((id) => cur.includes(id));
          if (cur.join() !== want.join()) board.applyRemote([], [], order);
        } catch (e) {
          console.warn('[persistence] applying board order failed', e);
        }
      },
      (e) => console.warn('[persistence] live board listener failed', e)
    )
  );
}

/**
 * The same page edited on two devices since they last agreed (`base`): keep both
 * sets of changes. The more recent copy leads; strokes and text blocks the other
 * device added since the base are appended, and ones it erased since the base
 * are removed. Title and notebook follow the leader.
 */
function mergeEdits(base: CPage, local: CPage, remote: CPage): CPage {
  const lead = (local.m ?? 0) >= (remote.m ?? 0) ? local : remote;
  const other = lead === local ? remote : local;
  const baseSt = new Set(base.st.map((s) => s.i));
  const leadSt = new Set(lead.st.map((s) => s.i));
  const otherSt = new Set(other.st.map((s) => s.i));
  const st = lead.st.filter((s) => !(baseSt.has(s.i) && !otherSt.has(s.i)));
  for (const s of other.st) if (!baseSt.has(s.i) && !leadSt.has(s.i)) st.push(s);
  const baseTx = new Set((base.tx ?? []).map((t) => t.id));
  const leadTx = new Set((lead.tx ?? []).map((t) => t.id));
  const otherTx = new Set((other.tx ?? []).map((t) => t.id));
  const tx = (lead.tx ?? []).filter((t) => !(baseTx.has(t.id) && !otherTx.has(t.id)));
  for (const t of other.tx ?? []) if (!baseTx.has(t.id) && !leadTx.has(t.id)) tx.push(t);
  const { tx: _tx, ...rest } = lead;
  return { ...rest, st, ...(tx.length ? { tx } : {}), m: Math.max(Date.now(), (local.m ?? 0) + 1, (remote.m ?? 0) + 1) };
}

/** Two copies written at the same time from the same older version: union of
 *  both, the more recent one leading for title, notebook and stroke order. */
function mergeConcurrent(local: CPage, remote: CPage): CPage {
  const lead = (local.m ?? 0) >= (remote.m ?? 0) ? local : remote;
  const other = lead === local ? remote : local;
  const st = [...lead.st];
  const have = new Set(st.map((s) => s.i));
  for (const s of other.st) if (!have.has(s.i)) st.push(s);
  const tx = [...(lead.tx ?? [])];
  const haveTx = new Set(tx.map((t) => t.id));
  for (const t of other.tx ?? []) if (!haveTx.has(t.id)) tx.push(t);
  const { tx: _tx, ...rest } = lead;
  return { ...rest, st, ...(tx.length ? { tx } : {}), m: Math.max(Date.now(), (local.m ?? 0) + 1, (remote.m ?? 0) + 1) };
}

/** @internal exported for tests */
export function applyRemotePages(remote: CPage[], removedIds: string[]) {
  const board = useBoard.getState();
  const involved = new Set([...remote.map((p) => p.id), ...removedIds]);
  const localById = new Map(encode(board.pages.filter((p) => involved.has(p.id))).map((p) => [p.id, p]));
  const apply: CPage[] = [];
  let needUpload = false;
  let inkReplaced = false;
  for (const rp of remote) {
    const key = contentKey(rp);
    if (lastCloud.get(rp.id) === key) continue; // already known
    const lp = localById.get(rp.id);
    if (lp) {
      const lk = contentKey(lp);
      if (lk === key) {
        lastCloud.set(rp.id, key);
        lastCloudPage.set(rp.id, rp);
        rememberVersion(rp);
        continue;
      }
      const base = lastCloudPage.get(rp.id);
      const localEdited = !base || contentKey(base) !== lk;
      // A copy with no reliable change time (older build, stale device) or one
      // older than ours must not take ink away. Keep ours and put it back up.
      const stale = !(rp.m! > 0) || (lp.m! > 0 && rp.m! < lp.m!);
      if (stale && inkOf(rp) < inkOf(lp)) {
        lastCloud.set(rp.id, key);
        lastCloudPage.set(rp.id, rp);
        mtimes.set(rp.id, Math.max(Date.now(), (lp.m ?? 0) + 1, (rp.m ?? 0) + 1)); // ours goes up as the newer copy
        needUpload = true;
        continue;
      }
      // Written from a different account copy than the one we last synced (or
      // from none we can tell): the other device never saw our version, so it
      // cannot have meant to erase anything of ours. Keep every stroke of both.
      const concurrent = base ? (rp.pm ?? -1) !== (base.m ?? 0) : typeof rp.pm !== 'number';
      if (concurrent && (localEdited || base)) {
        // If we still hold the copy the other device wrote from, merge properly
        // against it (its erasures count); otherwise keep every stroke of both.
        const parent = typeof rp.pm === 'number' ? versions.get(rp.id)?.get(rp.pm) : undefined;
        const merged = parent ? mergeEdits(parent, lp, rp) : mergeConcurrent(lp, rp);
        lastCloud.set(rp.id, key);
        lastCloudPage.set(rp.id, rp);
        rememberVersion(rp);
        if (contentKey(merged) !== lk) apply.push(merged);
        if (contentKey(merged) !== key) needUpload = true;
        continue;
      }
      if (localEdited && base) {
        // edited here and there since the copies last agreed: keep both sets of edits
        const merged = mergeEdits(base, lp, rp);
        lastCloud.set(rp.id, key);
        lastCloudPage.set(rp.id, rp);
        rememberVersion(rp);
        if (contentKey(merged) !== lk) apply.push(merged);
        needUpload = true; // the merged page goes back up so the other device gets our edits too
        continue;
      }
      if (localEdited && (lp.m ?? 0) > (rp.m ?? 0)) {
        needUpload = true; // ours is newer: keep it, the cloud gets it on the next save
        continue;
      }
      if (hasInk(lp)) inkReplaced = true;
    }
    lastCloud.set(rp.id, key);
    lastCloudPage.set(rp.id, rp);
    rememberVersion(rp);
    apply.push(rp);
  }
  const drop: string[] = [];
  for (const id of removedIds) {
    const lp = localById.get(id);
    if (!lp) {
      lastCloud.delete(id);
      lastCloudPage.delete(id);
      continue;
    }
    const untouched = lastCloud.has(id) && lastCloud.get(id) === contentKey(lp);
    lastCloud.delete(id);
    lastCloudPage.delete(id);
    if (untouched) {
      drop.push(id);
      if (hasInk(lp)) inkReplaced = true;
    } else needUpload = true; // edited here since: keep it and put it back
  }
  if (!apply.length && !drop.length) {
    if (needUpload) void saveCloud();
    return;
  }
  if (inkReplaced && Date.now() - lastLiveSnapshot > 60_000) {
    lastLiveSnapshot = Date.now();
    snapshotLocal('before-live-update');
  }
  const localBefore = [...localById.values()];
  guardInk('other-device', localBefore, localBefore.filter((p) => !drop.includes(p.id)).map((p) => apply.find((a) => a.id === p.id) ?? p));
  noteKnown(apply);
  board.applyRemote(decode(apply), drop);
  saveLocal();
  if (needUpload) void saveCloud();
}
