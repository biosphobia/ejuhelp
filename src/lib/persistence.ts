import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useBoard, type Page, type InkColor, type ShapeKind } from './board';
import { useAuth } from './auth';
import { db } from './firebase';

const LS_KEY = 'eju-board-v1';

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind };
type CPage = { id: string; v: [number, number, number]; st: CStroke[] };

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
    })),
  }));
}

function saveLocal() {
  const { pages, currentPageId } = useBoard.getState();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ pages: encode(pages), currentPageId }));
  } catch (e) {
    console.warn('[persistence] local save failed', e);
  }
}

async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) return;
  const { pages, currentPageId } = useBoard.getState();
  try {
    await setDoc(doc(db, 'users', user.uid, 'board', 'main'), {
      pages: encode(pages),
      currentPageId,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[persistence] cloud save failed', e);
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedRev = -1;

/** Wire up local + cloud autosave. Call once at startup. */
export function initPersistence() {
  // 1) hydrate from localStorage right away
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { pages?: CPage[]; currentPageId?: string };
      if (parsed?.pages?.length) {
        useBoard.getState().loadPages(decode(parsed.pages), parsed.currentPageId);
      }
    }
  } catch (e) {
    console.warn('[persistence] local hydrate failed', e);
  }

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

  // 3) on sign-in, pull the cloud board (or seed it from local if empty)
  useAuth.subscribe((st, prev) => {
    if (st.user && st.user !== prev.user && db) {
      void (async () => {
        try {
          const snap = await getDoc(doc(db!, 'users', st.user!.uid, 'board', 'main'));
          const data = snap.data() as { pages?: CPage[]; currentPageId?: string } | undefined;
          if (data?.pages?.length) {
            useBoard.getState().loadPages(decode(data.pages), data.currentPageId);
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
