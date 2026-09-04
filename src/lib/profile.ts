import { create } from 'zustand';

/** One thing the coach has learned about how this student writes or takes notes,
 *  e.g. "writes る so it looks like ろ", "uses ∴ for 'therefore'", "writes 濃度 in
 *  hiragana". Fed back into every prompt that reads the student's handwriting. */
export interface Habit {
  id: string;
  text: string;
  ts: number;
}

interface ProfileState {
  habits: Habit[];
  rev: number;
  /** Merge new observations (deduplicated, newest kept, capped). */
  add: (texts: string[]) => number;
  remove: (id: string) => void;
  clear: () => void;
  load: (habits: Habit[]) => void;
}

const CAP = 40;
const norm = (s: string) => s.trim().toLowerCase().replace(/[\s。．.、,]+$/g, '');

export const useProfile = create<ProfileState>((set, get) => ({
  habits: [],
  rev: 0,
  add: (texts) => {
    const cur = get().habits;
    const seen = new Set(cur.map((h) => norm(h.text)));
    const fresh: Habit[] = [];
    for (const t of texts) {
      const text = t.trim();
      if (!text || text.length > 200 || seen.has(norm(text))) continue;
      seen.add(norm(text));
      fresh.push({ id: Math.random().toString(36).slice(2, 10), text, ts: Date.now() });
    }
    if (!fresh.length) return 0;
    set((s) => ({ habits: [...fresh, ...s.habits].slice(0, CAP), rev: s.rev + 1 }));
    return fresh.length;
  },
  remove: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id), rev: s.rev + 1 })),
  clear: () => set((s) => ({ habits: [], rev: s.rev + 1 })),
  load: (habits) =>
    set((s) => ({
      habits: Array.isArray(habits) ? habits.filter((h) => h && typeof h.text === 'string' && h.text.trim()).slice(0, CAP) : [],
      rev: s.rev + 1,
    })),
}));

/** The habit texts, for sending with a request. */
export const profileTexts = () => useProfile.getState().habits.map((h) => h.text);
