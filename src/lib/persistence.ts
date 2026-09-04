import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { useBoard, notebookOf, type Page, type InkColor, type ShapeKind } from './board';
import { useAuth } from './auth';
import { useUI } from './ui';
import { db } from './firebase';

const LS_KEY = 'eju-board-v1';

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind };
type CPage = { id: string; v: [number, number, number]; st: CStroke[]; nb?: string; t?: string };

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
  };
}
const encode = (pages: Page[]): CPage[] => pages.map(encodePage);

function decode(cps: CPage[]): Page[] {
  return cps.map((cp) => ({
    id: cp.id,
    viewport: { scale: cp.v[0], x: cp.v[1], y: cp.v[2] },
    strokes: (cp.st ?? []).map((cs) => ({
      id: cs.i,
      color: cs.c,
      size: cs.s,
      points: cs.p.map((t) => ({ x: t[0], y: t[1], p: t[2] })),
      ...(cs.sh ? { shape: cs.sh } : {}),
    })),
    ...(cp.nb ? { notebook: cp.nb } : {}),
    ...(cp.t ? { title: cp.t } : {}),
  }));
}

let localUpdatedAt = 0;

function saveLocal() {
  const { pages, currentPageId } = useBoard.getState();
  localUpdatedAt = Date.now();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ pages: encode(pages), currentPageId, updatedAt: localUpdatedAt }));
  } catch (e) {
    console.warn('[persistence] local save failed', e);
  }
}

// ── Cloud layout (v2) ──
// users/{uid}/board/main            → { v: 2, order: [pageId…], currentPageId, updatedAt }
// users/{uid}/board/main/pages/{id} → one encoded page per doc
// One doc per page keeps every write far below Firestore's 1 MB document cap, so
// a big notebook can never make the whole board stop saving (the v1 single-doc
// layout did exactly that, and a stale cloud copy then overwrote local notes on
// the next sign-in).
const lastCloud = new Map<string, string>(); // pageId -> JSON last written
let cloudBusy = false;
let cloudDirty = false;

async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) return;
  if (cloudBusy) {
    cloudDirty = true;
    return;
  }
  cloudBusy = true;
  try {
    const { pages, currentPageId } = useBoard.getState();
    const mainRef = doc(db, 'users', user.uid, 'board', 'main');
    const pagesCol = collection(mainRef, 'pages');
    let batch = writeBatch(db);
    let n = 0;
    const flush = async () => {
      if (n) await batch.commit();
      batch = writeBatch(db!);
      n = 0;
    };
    const ids = new Set<string>();
    for (const pg of pages) {
      ids.add(pg.id);
      const enc = encodePage(pg);
      const json = JSON.stringify(enc);
      if (lastCloud.get(pg.id) === json) continue;
      if (json.length > 950_000) {
        console.warn(`[persistence] page ${pg.id} is too large for the cloud (${json.length} bytes); kept locally only`);
        continue;
      }
      batch.set(doc(pagesCol, pg.id), enc);
      lastCloud.set(pg.id, json);
      if (++n >= 20) await flush();
    }
    for (const id of [...lastCloud.keys()]) {
      if (!ids.has(id)) {
        batch.delete(doc(pagesCol, id));
        lastCloud.delete(id);
        if (++n >= 20) await flush();
      }
    }
    batch.set(mainRef, { v: 2, order: pages.map((p) => p.id), currentPageId, updatedAt: localUpdatedAt || Date.now() });
    n++;
    await flush();
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

/** Read the cloud board in either layout. Returns null when there is none. */
async function loadCloud(uid: string): Promise<{ pages: CPage[]; currentPageId?: string; updatedAt: number } | null> {
  const mainRef = doc(db!, 'users', uid, 'board', 'main');
  const snap = await getDoc(mainRef);
  const data = snap.data() as { v?: number; order?: string[]; pages?: CPage[]; currentPageId?: string; updatedAt?: number } | undefined;
  if (!data) return null;
  if (data.v === 2) {
    const qs = await getDocs(collection(mainRef, 'pages'));
    const byId = new Map<string, CPage>();
    qs.forEach((d) => byId.set(d.id, d.data() as CPage));
    const order = data.order ?? [];
    const pages = order.map((id) => byId.get(id)).filter((p): p is CPage => Boolean(p));
    for (const [id, p] of byId) if (!order.includes(id)) pages.push(p); // pages the order list missed
    for (const p of pages) lastCloud.set(p.id, JSON.stringify(p));
    return { pages, currentPageId: data.currentPageId, updatedAt: data.updatedAt ?? 0 };
  }
  if (data.pages?.length) return { pages: data.pages, currentPageId: data.currentPageId, updatedAt: data.updatedAt ?? 0 };
  return null;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedRev = -1;

/** Wire up local + cloud autosave. Call once at startup. */
export function initPersistence() {
  const subject = useUI.getState().subject;

  // 1) hydrate from localStorage right away
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { pages?: CPage[]; currentPageId?: string; updatedAt?: number };
      localUpdatedAt = parsed.updatedAt ?? 0;
      if (parsed?.pages?.length) {
        useBoard.getState().loadPages(decode(parsed.pages), parsed.currentPageId, subject);
      }
    }
  } catch (e) {
    console.warn('[persistence] local hydrate failed', e);
  }
  // The notebook always follows the selected subject.
  useBoard.getState().setNotebook(subject);
  useUI.subscribe((s, prev) => {
    if (s.subject !== prev.subject) useBoard.getState().setNotebook(s.subject);
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

  // 3) on sign-in, merge with the cloud board: whichever copy was written last
  //    wins, and the other side is brought up to date.
  useAuth.subscribe((st, prev) => {
    if (st.user && st.user !== prev.user && db) {
      void (async () => {
        try {
          const cloud = await loadCloud(st.user!.uid);
          const localHasInk = useBoard.getState().pages.some((p) => p.strokes.length);
          if (cloud && (cloud.updatedAt >= localUpdatedAt || !localHasInk)) {
            useBoard.getState().loadPages(decode(cloud.pages), cloud.currentPageId, useUI.getState().subject);
            useBoard.getState().setNotebook(useUI.getState().subject);
            localUpdatedAt = cloud.updatedAt;
            saveLocal();
            if (cloud.updatedAt === 0) void saveCloud(); // legacy single-doc layout → migrate to v2
          } else {
            void saveCloud();
          }
        } catch (e) {
          console.warn('[persistence] cloud hydrate failed', e);
        }
      })();
    }
  });
}
