import { create } from 'zustand';
import type { GenQuestion } from './api';
import type { Subject } from './ui';

/** A question the student is actively working on, rich enough to grade. */
export type ActiveItem = GenQuestion & { subject: Subject };

interface PracticeState {
  /** The question the user is currently working on, as text (used by "Check my work"). */
  activeQuestion: string | null;
  /** The same question as a gradable object, when it came from a generated/pinned question. */
  activeItem: ActiveItem | null;
  setActiveQuestion: (q: string | null, item?: ActiveItem | null) => void;
  /** Set when the user taps "practice my weak points" so the generator opens in focus mode. */
  wantFocus: boolean;
  setWantFocus: (b: boolean) => void;
  /** Set by the EJU calendar's "practice this topic" so the generator opens on that subtopic. */
  wantTopic: string | null;
  setWantTopic: (id: string | null) => void;
}

export const usePractice = create<PracticeState>((set) => ({
  activeQuestion: null,
  activeItem: null,
  setActiveQuestion: (activeQuestion, activeItem = null) => set({ activeQuestion, activeItem }),
  wantFocus: false,
  setWantFocus: (wantFocus) => set({ wantFocus }),
  wantTopic: null,
  setWantTopic: (wantTopic) => set({ wantTopic }),
}));
