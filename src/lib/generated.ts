import { create } from 'zustand';
import type { GenQuestion } from './api';
import type { Subject } from './ui';

/** A generated question kept in the saved pool, tagged with its subject. */
export interface SavedQuestion extends GenQuestion {
  subject: Subject;
  addedAt: number;
}

/** Hard cap on the saved pool — older questions are culled past this. */
export const MAX_SAVED = 30;

interface GeneratedState {
  /** Saved questions, newest first; capped at MAX_SAVED and synced to the account. */
  questions: SavedQuestion[];
  /** Selected sub-topic / topic ids, per subject. */
  selected: Partial<Record<Subject, string[]>>;
  rev: number;
  /** Append a freshly generated set, keep the newest MAX_SAVED, cull the rest. */
  addResult: (subject: Subject, qs: GenQuestion[]) => void;
  removeQuestion: (id: string) => void;
  clearQuestions: () => void;
  setSelected: (subject: Subject, ids: string[]) => void;
  load: (data: { questions?: SavedQuestion[]; selected?: Partial<Record<Subject, string[]>> }) => void;
}

export const useGenerated = create<GeneratedState>((set) => ({
  questions: [],
  selected: {},
  rev: 0,
  addResult: (subject, qs) =>
    set((s) => {
      const now = Date.now();
      const fresh: SavedQuestion[] = qs.map((q) => ({ ...q, subject, addedAt: now }));
      const freshIds = new Set(fresh.map((q) => q.id));
      // New set on top; drop any id collisions; keep only the newest MAX_SAVED.
      const merged = [...fresh, ...s.questions.filter((q) => !freshIds.has(q.id))].slice(0, MAX_SAVED);
      return { questions: merged, rev: s.rev + 1 };
    }),
  removeQuestion: (id) =>
    set((s) => ({ questions: s.questions.filter((q) => q.id !== id), rev: s.rev + 1 })),
  clearQuestions: () => set((s) => ({ questions: [], rev: s.rev + 1 })),
  setSelected: (subject, ids) =>
    set((s) => ({ selected: { ...s.selected, [subject]: ids }, rev: s.rev + 1 })),
  load: (data) =>
    set((s) => ({
      questions: Array.isArray(data?.questions) ? data.questions.slice(0, MAX_SAVED) : [],
      selected: data?.selected && typeof data.selected === 'object' ? data.selected : {},
      rev: s.rev + 1,
    })),
}));
