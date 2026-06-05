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
}

export const INK_HEX: Record<InkColor, string> = {
  black: '#111827',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
};

export const PEN_SIZES = [2, 4, 7, 12];
// Zoom-out is effectively unlimited: MIN_SCALE is only a numerical-safety floor
// that keeps the scale strictly positive (the world<->screen math divides by it).
export const MIN_SCALE = 0.0001;
export const MAX_SCALE = 6;
const UNDO_LIMIT = 50;

export const newId = () => Math.random().toString(36).slice(2, 10);

export const blankPage = (): Page => ({
  id: newId(),
  strokes: [],
  viewport: { scale: 1, x: 0, y: 0 },
});

interface BoardState {
  pages: Page[];
  currentPageId: string;
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
  clearCurrentPage: () => void;
  undoLast: () => void;

  /** Replace all pages (used when hydrating from storage / cloud). */
  loadPages: (pages: Page[], currentId?: string) => void;
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
        const pg = blankPage();
        const idx = st.pages.findIndex((p) => p.id === st.currentPageId);
        const pages = [...st.pages];
        pages.splice(idx + 1, 0, pg);
        return { pages, currentPageId: pg.id, rev: st.rev + 1 };
      }),

    deletePage: (id) =>
      set((st) => {
        if (st.pages.length <= 1) {
          // never leave zero pages — reset the only page instead
          const pg = blankPage();
          return { pages: [pg], currentPageId: pg.id, rev: st.rev + 1 };
        }
        const idx = st.pages.findIndex((p) => p.id === id);
        const pages = st.pages.filter((p) => p.id !== id);
        const nextId =
          st.currentPageId === id
            ? pages[Math.min(idx, pages.length - 1)].id
            : st.currentPageId;
        return { pages, currentPageId: nextId, rev: st.rev + 1 };
      }),

    goToPage: (id) => set({ currentPageId: id }),

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

    loadPages: (pages, currentId) =>
      set(() => ({
        pages: pages.length ? pages : [blankPage()],
        currentPageId:
          currentId && pages.some((p) => p.id === currentId)
            ? currentId
            : (pages[0]?.id ?? blankPage().id),
        undo: {},
        rev: 0,
      })),

    getCurrentPage: () => {
      const st = get();
      return st.pages.find((p) => p.id === st.currentPageId) ?? st.pages[0];
    },
  };
});
