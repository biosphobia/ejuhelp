import { create } from 'zustand';

export type InkColor = 'black' | 'red' | 'blue' | 'green';
export type Tool = 'pen' | 'eraser' | 'select' | 'shapes';
/** Shapes the shapes-tool can stamp. Triangle/square store their corner vertices
 * (individually editable); circle stores a sampled outline polygon. */
export type ShapeKind = 'triangle' | 'square' | 'circle';

export interface Pt {
  x: number; // world coordinates
  y: number;
  p: number; // pressure 0..1
}
export interface Stroke {
  id: string;
  color: InkColor;
  size: number;
  points: Pt[];
  /** When set, the stroke is a closed, lightly-filled shape rather than freehand ink. */
  shape?: ShapeKind;
}
export interface Viewport {
  scale: number;
  x: number; // translation (screen px)
  y: number;
}
/** A block of typed text on a page (used for coach-tidied notes), drawn in a
 *  handwriting-style font so it sits naturally next to the student's own ink. */
export interface TextBlock {
  id: string;
  x: number; // world coordinates of the top-left corner
  y: number;
  w: number; // wrap width
  size: number; // font px in world units
  color: InkColor;
  text: string;
  /** 'h' = heading weight. */
  style?: 'h' | 'b' | 'n';
}

export interface Page {
  id: string;
  strokes: Stroke[];
  texts?: TextBlock[];
  viewport: Viewport;
  /** Which notebook the page belongs to (one notebook per subject). */
  notebook?: string;
  /** Optional name the student gives the page ("Lecture 3 – titration"). */
  title?: string;
}

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'math';
export const NOTEBOOKS: SubjectId[] = ['physics', 'chemistry', 'biology', 'math'];
export const DEFAULT_NOTEBOOK: SubjectId = 'physics';
export const notebookOf = (p: Page): string => p.notebook ?? DEFAULT_NOTEBOOK;

/** A notebook (category of pages). The four subject notebooks always exist; the
 *  student can add more (e.g. "Lab class", "Homework") tied to a subject. */
export interface NotebookMeta {
  id: string;
  /** Display name; empty for the built-in subject notebooks (their name is the subject). */
  name: string;
  subject: SubjectId;
}
export const defaultNotebooks = (): NotebookMeta[] => NOTEBOOKS.map((id) => ({ id, name: '', subject: id }));

export const INK_HEX: Record<InkColor, string> = {
  black: '#111827',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
};

export const PEN_SIZES = [2, 4, 7, 12];
export const MIN_SCALE = 0.2;
export const MAX_SCALE = 6;
const UNDO_LIMIT = 50;

export const newId = () => Math.random().toString(36).slice(2, 10);

export const blankPage = (notebook: string = DEFAULT_NOTEBOOK): Page => ({
  id: newId(),
  strokes: [],
  viewport: { scale: 1, x: 0, y: 0 },
  notebook,
});

interface BoardState {
  pages: Page[];
  currentPageId: string;
  /** The notebook currently shown (follows the selected subject). */
  notebook: string;
  /** All notebooks in display order. */
  notebooks: NotebookMeta[];
  /** Last page visited in each notebook, so switching back lands where you were. */
  lastPage: Record<string, string>;
  tool: Tool;
  color: InkColor;
  size: number;
  /** which shape the shapes-tool stamps next */
  shape: ShapeKind;
  /** pageId -> stack of previous stroke arrays (for undo) */
  undo: Record<string, Stroke[][]>;
  /** bumped whenever persisted content changes, so the sync layer can react */
  rev: number;

  setTool: (t: Tool) => void;
  setColor: (c: InkColor) => void;
  setSize: (n: number) => void;
  setShape: (s: ShapeKind) => void;

  addStroke: (s: Stroke) => void;
  eraseStrokes: (ids: string[]) => void;
  updateStrokes: (updates: { id: string; points: Pt[] }[]) => void;
  setViewport: (v: Viewport) => void;

  addPage: () => void;
  deletePage: (id: string) => void;
  goToPage: (id: string) => void;
  /** Switch notebooks; creates the first page of an empty notebook. */
  setNotebook: (nb: string) => void;
  setPageTitle: (id: string, title: string) => void;
  /** Move a page earlier (-1) or later (+1) within its notebook. */
  movePage: (id: string, delta: number) => void;
  movePageToNotebook: (id: string, nb: string) => void;
  /** Insert a page of typed text blocks right after `afterId` (coach-tidied notes). */
  addTextPage: (afterId: string, title: string, texts: TextBlock[]) => string;
  addNotebook: (name: string, subject: SubjectId) => string;
  renameNotebook: (id: string, name: string) => void;
  moveNotebook: (id: string, delta: number) => void;
  /** Delete a custom notebook; its pages move to the subject notebook. */
  deleteNotebook: (id: string) => void;
  setNotebooks: (list: NotebookMeta[]) => void;
  /** Pages of the current notebook, in order. */
  notebookPages: () => Page[];
  clearCurrentPage: () => void;
  undoLast: () => void;

  /** Replace all pages (used when hydrating from storage / cloud). */
  loadPages: (pages: Page[], currentId?: string, defaultNotebook?: string) => void;
  getCurrentPage: () => Page;
}

const pushUndo = (
  undo: Record<string, Stroke[][]>,
  pageId: string,
  strokes: Stroke[]
): Record<string, Stroke[][]> => {
  const stack = (undo[pageId] ?? []).concat([strokes]).slice(-UNDO_LIMIT);
  return { ...undo, [pageId]: stack };
};

export const useBoard = create<BoardState>((set, get) => {
  const first = blankPage();
  return {
    pages: [first],
    currentPageId: first.id,
    notebook: DEFAULT_NOTEBOOK,
    notebooks: defaultNotebooks(),
    lastPage: {},
    tool: 'pen',
    color: 'black',
    size: PEN_SIZES[1],
    shape: 'square',
    undo: {},
    rev: 0,

    setTool: (tool) => set({ tool }),
    // Picking a color from the eraser jumps back to the pen, but keep the shapes
    // tool active so colors can be chosen while stamping shapes.
    setColor: (color) => set((st) => ({ color, tool: st.tool === 'shapes' ? 'shapes' : 'pen' })),
    setSize: (size) => set({ size }),
    setShape: (shape) => set({ shape, tool: 'shapes' }),

    addStroke: (stroke) =>
      set((st) => {
        const id = st.currentPageId;
        const pages = st.pages.map((pg) =>
          pg.id === id ? { ...pg, strokes: [...pg.strokes, stroke] } : pg
        );
        const prev = st.pages.find((p) => p.id === id)?.strokes ?? [];
        return { pages, undo: pushUndo(st.undo, id, prev), rev: st.rev + 1 };
      }),

    eraseStrokes: (ids) =>
      set((st) => {
        if (ids.length === 0) return st;
        const id = st.currentPageId;
        const set_ = new Set(ids);
        const prev = st.pages.find((p) => p.id === id)?.strokes ?? [];
        if (!prev.some((s) => set_.has(s.id))) return st;
        const pages = st.pages.map((pg) =>
          pg.id === id
            ? { ...pg, strokes: pg.strokes.filter((s) => !set_.has(s.id)) }
            : pg
        );
        return { pages, undo: pushUndo(st.undo, id, prev), rev: st.rev + 1 };
      }),

    updateStrokes: (updates) =>
      set((st) => {
        if (updates.length === 0) return st;
        const id = st.currentPageId;
        const prev = st.pages.find((p) => p.id === id)?.strokes ?? [];
        const map = new Map(updates.map((u) => [u.id, u.points]));
        const next = prev.map((s) => (map.has(s.id) ? { ...s, points: map.get(s.id)! } : s));
        return {
          pages: st.pages.map((pg) => (pg.id === id ? { ...pg, strokes: next } : pg)),
          undo: pushUndo(st.undo, id, prev),
          rev: st.rev + 1,
        };
      }),

    setViewport: (viewport) =>
      set((st) => ({
        pages: st.pages.map((pg) =>
          pg.id === st.currentPageId ? { ...pg, viewport } : pg
        ),
      })),

    addPage: () =>
      set((st) => {
        const pg = blankPage(st.notebook);
        const idx = st.pages.findIndex((p) => p.id === st.currentPageId);
        const pages = [...st.pages];
        pages.splice(idx + 1, 0, pg);
        return { pages, currentPageId: pg.id, lastPage: { ...st.lastPage, [st.notebook]: pg.id }, rev: st.rev + 1 };
      }),

    deletePage: (id) =>
      set((st) => {
        const target = st.pages.find((p) => p.id === id);
        if (!target) return st;
        const nb = notebookOf(target);
        const inNb = st.pages.filter((p) => notebookOf(p) === nb);
        if (inNb.length <= 1) {
          // never leave a notebook with zero pages — reset the only page instead
          const pg = blankPage(nb);
          const pages = st.pages.map((p) => (p.id === id ? pg : p));
          return { pages, currentPageId: pg.id, lastPage: { ...st.lastPage, [nb]: pg.id }, rev: st.rev + 1 };
        }
        const idx = inNb.findIndex((p) => p.id === id);
        const remaining = inNb.filter((p) => p.id !== id);
        const pages = st.pages.filter((p) => p.id !== id);
        const nextId = st.currentPageId === id ? remaining[Math.min(idx, remaining.length - 1)].id : st.currentPageId;
        return { pages, currentPageId: nextId, lastPage: { ...st.lastPage, [nb]: nextId }, rev: st.rev + 1 };
      }),

    goToPage: (id) =>
      set((st) => {
        const pg = st.pages.find((p) => p.id === id);
        if (!pg) return st;
        return { currentPageId: id, lastPage: { ...st.lastPage, [notebookOf(pg)]: id } };
      }),

    setNotebook: (nb) =>
      set((st) => {
        const inNb = st.pages.filter((p) => notebookOf(p) === nb);
        const remembered = st.lastPage[nb];
        if (inNb.length) {
          const id = remembered && inNb.some((p) => p.id === remembered) ? remembered : inNb[0].id;
          return { notebook: nb, currentPageId: id, lastPage: { ...st.lastPage, [nb]: id } };
        }
        const pg = blankPage(nb);
        return { notebook: nb, pages: [...st.pages, pg], currentPageId: pg.id, lastPage: { ...st.lastPage, [nb]: pg.id }, rev: st.rev + 1 };
      }),

    setPageTitle: (id, title) =>
      set((st) => ({
        pages: st.pages.map((pg) => (pg.id === id ? { ...pg, title: title.trim() || undefined } : pg)),
        rev: st.rev + 1,
      })),

    movePage: (id, delta) =>
      set((st) => {
        const pg = st.pages.find((p) => p.id === id);
        if (!pg) return st;
        const nb = notebookOf(pg);
        const ids = st.pages.filter((p) => notebookOf(p) === nb).map((p) => p.id);
        const i = ids.indexOf(id);
        const j = i + delta;
        if (j < 0 || j >= ids.length) return st;
        const other = ids[j];
        const a = st.pages.findIndex((p) => p.id === id);
        const b = st.pages.findIndex((p) => p.id === other);
        const pages = [...st.pages];
        [pages[a], pages[b]] = [pages[b], pages[a]];
        return { pages, rev: st.rev + 1 };
      }),

    movePageToNotebook: (id, nb) =>
      set((st) => {
        const pg = st.pages.find((p) => p.id === id);
        if (!pg || notebookOf(pg) === nb) return st;
        const from = notebookOf(pg);
        const pages = st.pages.map((p) => (p.id === id ? { ...p, notebook: nb } : p));
        const left = pages.filter((p) => notebookOf(p) === from);
        const extra = left.length ? [] : [blankPage(from)];
        const nextCurrent = st.currentPageId === id ? (left[0] ?? extra[0]).id : st.currentPageId;
        return { pages: [...pages, ...extra], currentPageId: nextCurrent, lastPage: { ...st.lastPage, [from]: nextCurrent, [nb]: id }, rev: st.rev + 1 };
      }),

    addTextPage: (afterId, title, texts) => {
      const after = get().pages.find((p) => p.id === afterId);
      const pg: Page = { ...blankPage(after ? notebookOf(after) : get().notebook), title, texts };
      set((st) => {
        const idx = st.pages.findIndex((p) => p.id === afterId);
        const pages = [...st.pages];
        pages.splice(idx >= 0 ? idx + 1 : pages.length, 0, pg);
        return { pages, currentPageId: pg.id, lastPage: { ...st.lastPage, [notebookOf(pg)]: pg.id }, rev: st.rev + 1 };
      });
      return pg.id;
    },

    addNotebook: (name, subject) => {
      const id = `nb-${newId()}`;
      set((st) => ({ notebooks: [...st.notebooks, { id, name: name.trim() || 'Notebook', subject }], rev: st.rev + 1 }));
      return id;
    },
    renameNotebook: (id, name) =>
      set((st) => ({ notebooks: st.notebooks.map((n) => (n.id === id && !NOTEBOOKS.includes(id as SubjectId) ? { ...n, name: name.trim() || n.name } : n)), rev: st.rev + 1 })),
    moveNotebook: (id, delta) =>
      set((st) => {
        const i = st.notebooks.findIndex((n) => n.id === id);
        const j = i + delta;
        if (i < 0 || j < 0 || j >= st.notebooks.length) return st;
        const notebooks = [...st.notebooks];
        [notebooks[i], notebooks[j]] = [notebooks[j], notebooks[i]];
        return { notebooks, rev: st.rev + 1 };
      }),
    deleteNotebook: (id) =>
      set((st) => {
        const nb = st.notebooks.find((n) => n.id === id);
        if (!nb || NOTEBOOKS.includes(id as SubjectId)) return st;
        const pages = st.pages.map((p) => (notebookOf(p) === id ? { ...p, notebook: nb.subject } : p));
        const notebooks = st.notebooks.filter((n) => n.id !== id);
        const notebook = st.notebook === id ? nb.subject : st.notebook;
        const inNb = pages.filter((p) => notebookOf(p) === notebook);
        const currentPageId = inNb.some((p) => p.id === st.currentPageId) ? st.currentPageId : inNb[0]?.id ?? st.currentPageId;
        return { pages, notebooks, notebook, currentPageId, rev: st.rev + 1 };
      }),
    setNotebooks: (list) =>
      set((st) => {
        // Keep the four subject notebooks no matter what was saved.
        const byId = new Map(list.map((n) => [n.id, n]));
        for (const d of defaultNotebooks()) if (!byId.has(d.id)) list = [...list, d];
        const stray = new Set(st.pages.map(notebookOf));
        for (const id of stray) if (!list.some((n) => n.id === id)) list = [...list, { id, name: id, subject: 'physics' }];
        return { notebooks: list };
      }),

    notebookPages: () => {
      const st = get();
      return st.pages.filter((p) => notebookOf(p) === st.notebook);
    },

    clearCurrentPage: () =>
      set((st) => {
        const id = st.currentPageId;
        const cur = st.pages.find((p) => p.id === id);
        const prev = cur?.strokes ?? [];
        if (prev.length === 0 && !cur?.texts?.length) return st;
        const pages = st.pages.map((pg) =>
          pg.id === id ? { ...pg, strokes: [], texts: undefined } : pg
        );
        return { pages, undo: pushUndo(st.undo, id, prev), rev: st.rev + 1 };
      }),

    undoLast: () =>
      set((st) => {
        const id = st.currentPageId;
        const stack = st.undo[id] ?? [];
        if (stack.length === 0) return st;
        const prev = stack[stack.length - 1];
        const pages = st.pages.map((pg) =>
          pg.id === id ? { ...pg, strokes: prev } : pg
        );
        return {
          pages,
          undo: { ...st.undo, [id]: stack.slice(0, -1) },
          rev: st.rev + 1,
        };
      }),

    loadPages: (pages, currentId, defaultNotebook) =>
      set((st) => {
        // Pages saved before notebooks existed get filed under the notebook that is
        // open right now, so nothing the student wrote disappears from view.
        const nb = defaultNotebook ?? st.notebook;
        const tagged = pages.map((p) => (p.notebook ? p : { ...p, notebook: nb }));
        const all = tagged.length ? tagged : [blankPage(nb)];
        const cur = currentId && all.find((p) => p.id === currentId);
        const inNb = all.filter((p) => notebookOf(p) === (cur ? notebookOf(cur) : nb));
        const currentPageId = cur ? cur.id : inNb[0]?.id ?? all[0].id;
        const notebook = cur ? notebookOf(cur) : inNb.length ? nb : notebookOf(all[0]);
        return {
          pages: all,
          currentPageId,
          notebook,
          lastPage: { ...st.lastPage, [notebook]: currentPageId },
          undo: {},
          rev: 0,
        };
      }),

    getCurrentPage: () => {
      const st = get();
      return st.pages.find((p) => p.id === st.currentPageId) ?? st.pages[0];
    },
  };
});
