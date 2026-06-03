import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GenQuestion } from './api';
import type { Subject } from './ui';

export interface PinnedQuestion extends GenQuestion {
  subject: Subject;
  pinnedAt: number;
}

interface PinnedState {
  items: PinnedQuestion[];
  index: number;
  collapsed: boolean;
  pos: { x: number; y: number } | null;
  pin: (subject: Subject, q: GenQuestion) => void;
  /** Pin several questions that already carry their own subject (mixed-subject safe). */
  pinManyTagged: (items: (GenQuestion & { subject: Subject })[]) => void;
  unpin: (id: string) => void;
  clear: () => void;
  setIndex: (i: number) => void;
  setCollapsed: (b: boolean) => void;
  setPos: (p: { x: number; y: number }) => void;
  isPinned: (id: string) => boolean;
}

export const usePinned = create<PinnedState>()(
  persist(
    (set, get) => ({
      items: [],
      index: 0,
      collapsed: false,
      pos: null,
      pin: (subject, q) =>
        set((s) => {
          if (s.items.some((i) => i.id === q.id)) return s;
          const items = [...s.items, { ...q, subject, pinnedAt: Date.now() }];
          return { items, index: items.length - 1, collapsed: false };
        }),
      pinManyTagged: (items) =>
        set((s) => {
          const have = new Set(s.items.map((i) => i.id));
          const add = items
            .filter((q) => !have.has(q.id))
            .map((q) => ({ ...q, pinnedAt: Date.now() }));
          if (!add.length) return s;
          const merged = [...s.items, ...add];
          return { items: merged, index: s.items.length, collapsed: false };
        }),
      unpin: (id) =>
        set((s) => {
          const items = s.items.filter((i) => i.id !== id);
          return { items, index: Math.max(0, Math.min(s.index, items.length - 1)) };
        }),
      clear: () => set({ items: [], index: 0 }),
      setIndex: (i) => set((s) => ({ index: Math.max(0, Math.min(i, s.items.length - 1)) })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setPos: (pos) => set({ pos }),
      isPinned: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'eju-pinned',
      partialize: (s) => ({ items: s.items, index: s.index, collapsed: s.collapsed, pos: s.pos }),
    }
  )
);
