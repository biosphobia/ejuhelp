import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DebugState {
  enabled: boolean;
  lines: string[];
  setEnabled: (b: boolean) => void;
  push: (line: string) => void;
  clear: () => void;
}

const MAX = 14;

export const useDebug = create<DebugState>()(
  persist(
    (set, get) => ({
      enabled: false,
      lines: [],
      setEnabled: (enabled) => set({ enabled, lines: [] }),
      push: (line) => {
        if (!get().enabled) return;
        set((s) => ({ lines: [...s.lines.slice(-(MAX - 1)), line] }));
      },
      clear: () => set({ lines: [] }),
    }),
    { name: 'eju-debug', partialize: (s) => ({ enabled: s.enabled }) }
  )
);
