import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useBoard, blankPage, type Page, type InkColor, type ShapeKind } from './board';
import { useAuth } from './auth';
import { db } from './firebase';
import { useNotebook, NOTEBOOKS, DEFAULT_NOTEBOOK, type NotebookId } from './notebooks';

const LS_KEY = 'eju-notebooks-v1';
const OLD_LS_KEY = 'eju-board-v1'; // legacy single-board format → migrated into "general"

// Compact wire format: points stored as [x, y, pressure] tuples to save space
// (Firestore docs are capped at ~1MB; ink can be large).
type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind };
type CPage = { id: string; v: [number, number, number]; st: CStroke[] };
interface StoredBook {
  pages: CPage[];
  currentPageId?: string;
  updatedAt: number;
}
interface StoredNotebooks {
  active: NotebookId;
  books: Partial<Record<NotebookId, StoredBook>>;
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

// In-memory snapshot of every notebook. The ACTIVE notebook's live content lives
// in the board store; the others are authoritative here until switched to.
let books: Partial<Record<NotebookId, StoredBook>> = {};

const validId = (id: unknown): id is NotebookId =>
  typeof id === 'string' && (NOTEBOOKS as string[]).includes(id);

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

function saveLocal() {
  try {
    const data: StoredNotebooks = { active: useNotebook.getState().active, books };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    lastWrittenRev = useBoard.getState().rev;
  } catch (e) {
    console.warn('[persistence] local save failed', e);
  }
}

async function saveCloud() {
  const { user } = useAuth.getState();
  if (!user || !db) return;
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

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedRev = -1;
// The board rev actually written to storage, so a periodic backstop can tell when
// there are unsaved changes even if the debounce/unload events never fire.
let lastWrittenRev = -1;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = undefined;
    snapshotActive();
    saveLocal();
    void saveCloud();
  }, 600);
}

/** Persist immediately — used when the app is being hidden/closed so a pending
 *  debounce can't drop the last strokes (the main cause of "notes lost sometimes"). */
function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = undefined;
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

/** Wire up local + cloud autosave and notebook switching. Call once at startup. */
export function initPersistence() {
  // 1) hydrate from localStorage (migrating the legacy single-board format)
  let data: StoredNotebooks | null = null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) data = JSON.parse(raw) as StoredNotebooks;
  } catch (e) {
    console.warn('[persistence] local hydrate failed', e);
  }
  if (!data) data = migrateLegacyLocal();
  if (data) {
    applyStored(data);
    saveLocal(); // persist the (possibly migrated) shape
  }

  // 2) autosave whenever board content changes (rev bumps)
  useBoard.subscribe((st) => {
    if (st.rev === lastSavedRev) return;
    lastSavedRev = st.rev;
    scheduleSave();
  });

  // 3) flush on hide/close so the debounce can't lose the last edits (mobile-safe)
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
  // EVICT a PWA's localStorage, which silently wipes saved notes between sessions.
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

  // 4) on sign-in, merge the cloud copy (migrating the legacy single-board doc)
  useAuth.subscribe((st, prev) => {
    if (st.user && st.user !== prev.user && db) {
      void (async () => {
        try {
          snapshotActive(); // include current local edits in the merge base
          const snap = await getDoc(doc(db!, 'users', st.user!.uid, 'board', 'notebooks'));
          let cloud = snap.exists() ? (snap.data() as StoredNotebooks) : null;
          if (!cloud?.books) {
            const legacy = await getDoc(doc(db!, 'users', st.user!.uid, 'board', 'main'));
            const ld = legacy.data() as { pages?: CPage[]; currentPageId?: string; updatedAt?: number } | undefined;
            if (ld?.pages?.length) {
              cloud = {
                active: DEFAULT_NOTEBOOK,
                books: { general: { pages: ld.pages, currentPageId: ld.currentPageId, updatedAt: ld.updatedAt ?? 0 } },
              };
            }
          }
          if (cloud?.books) {
            mergeCloud(cloud);
            // On a fresh device (current notebook empty), jump to the notebook the
            // user was last on elsewhere so their work is visible immediately.
            const cur = useNotebook.getState().active;
            const next =
              !hasInk(books[cur]) && validId(cloud.active) && hasInk(books[cloud.active])
                ? cloud.active
                : cur;
            useNotebook.getState()._setActive(next);
            loadBookIntoBoard(next);
            lastSavedRev = useBoard.getState().rev;
            saveLocal();
          }
          void saveCloud(); // push the merged result (also seeds an empty cloud)
        } catch (e) {
          console.warn('[persistence] cloud hydrate failed', e);
        }
      })();
    }
  });
}
