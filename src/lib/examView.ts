import { create } from 'zustand';
import type { Exam } from './api';

/** A mock exam popped out onto the board as a per-question PDF view to solve against. */
interface ExamViewState {
  exam: Exam | null;
  index: number;
  collapsed: boolean;
  pos: { x: number; y: number } | null;
  open: (exam: Exam, index?: number) => void;
  setIndex: (i: number) => void;
  setCollapsed: (b: boolean) => void;
  setPos: (p: { x: number; y: number }) => void;
  close: () => void;
}

const clampIndex = (i: number, n: number) => Math.max(0, Math.min(i, Math.max(0, n - 1)));

export const useExamView = create<ExamViewState>((set, get) => ({
  exam: null,
  index: 0,
  collapsed: false,
  pos: null,
  open: (exam, index = 0) => set({ exam, index: clampIndex(index, exam.questions.length), collapsed: false }),
  setIndex: (i) => set((s) => ({ index: s.exam ? clampIndex(i, s.exam.questions.length) : 0 })),
  setCollapsed: (collapsed) => set({ collapsed }),
  setPos: (pos) => set({ pos }),
  close: () => set({ exam: null }),
}));
