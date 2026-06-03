import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GenQuestion } from './api';
import type { Subject } from './ui';

/**
 * The last generated practice set, plus the per-subject topic selection, kept in
 * localStorage so both survive closing the panel and reloading — the questions
 * stay until the user explicitly clears them.
 */
interface GeneratedState {
  /** Subject the current questions belong to (so cards render with the right subject). */
  subject: Subject | null;
  questions: GenQuestion[];
  /** Selected sub-topic / topic ids, per subject. */
  selected: Partial<Record<Subject, string[]>>;
  setResult: (subject: Subject, questions: GenQuestion[]) => void;
  clearQuestions: () => void;
  setSelected: (subject: Subject, ids: string[]) => void;
}

export const useGenerated = create<GeneratedState>()(
  persist(
    (set) => ({
      subject: null,
      questions: [],
      selected: {},
      setResult: (subject, questions) => set({ subject, questions }),
      clearQuestions: () => set({ questions: [], subject: null }),
      setSelected: (subject, ids) =>
        set((s) => ({ selected: { ...s.selected, [subject]: ids } })),
    }),
    {
      name: 'eju-generated',
      partialize: (s) => ({ subject: s.subject, questions: s.questions, selected: s.selected }),
    }
  )
);
