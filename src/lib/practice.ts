import { create } from 'zustand';

interface PracticeState {
  /** The question the user is currently working on (used by "Check my work"). */
  activeQuestion: string | null;
  setActiveQuestion: (q: string | null) => void;
}

export const usePractice = create<PracticeState>((set) => ({
  activeQuestion: null,
  setActiveQuestion: (activeQuestion) => set({ activeQuestion }),
}));
