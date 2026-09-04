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
export interface Page {
  id: string;
  strokes: Stroke[];
  viewport: Viewport;
  /** Which notebook the page belongs to (one notebook per subject). */
  notebook?: string;
  /** Optional name the student gives the page ("Lecture 3 – titration"). */
  title?: string;
}

export const NOTEBOOKS = ['physics', 'chemistry', 'biology', 'math'] as const;
export type Notebook = (typeof NOTEBOOKS)[number];
export const DEFAULT_NOTEBOOK: Notebook = 'physics';
export const notebookOf = (p: Page): string => p.notebook ?? DEFAULT_NOTEBOOK;

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

    notebookPages: () => {
      const st = get();
      return st.pages.filter((p) => notebookOf(p) === st.notebook);
    },

    clearCurrentPage: () =>
      set((st) => {
        const id = st.currentPageId;
        const prev = st.pages.find((p) => p.id === id)?.strokes ?? [];
        if (prev.length === 0) return st;
        const pages = st.pages.map((pg) =>
          pg.id === id ? { ...pg, strokes: [] } : pg
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
