import { create } from 'zustand';

interface PracticeState {
  /** The question the user is currently working on (used by "Check my work"). */
  activeQuestion: string | null;
  setActiveQuestion: (q: string | null) => void;
  /** Set when the user taps "practice my weak points" so the generator opens in focus mode. */
  wantFocus: boolean;
  setWantFocus: (b: boolean) => void;
}

export const usePractice = create<PracticeState>((set) => ({
  activeQuestion: null,
  setActiveQuestion: (activeQuestion) => set({ activeQuestion }),
  wantFocus: false,
  setWantFocus: (wantFocus) => set({ wantFocus }),
}));
