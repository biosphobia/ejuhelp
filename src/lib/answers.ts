import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GenQuestion } from './api';
import type { Subject } from './ui';
import { useProgress } from './userdata';

interface AnswersState {
  /** Map of question id → the choice index the user picked. */
  picked: Record<string, number>;
  /**
   * Record an answer for a question. Each question is answered once; grading
   * feeds the weak-points profile. Shared by the practice panel and the
   * pinned board widget so a question's answered state stays consistent
   * wherever it is shown.
   */
  answer: (subject: Subject, q: GenQuestion, idx: number) => void;
  clear: () => void;
}

export const useAnswers = create<AnswersState>()(
  persist(
    (set, get) => ({
      picked: {},
      answer: (subject, q, idx) => {
        if (get().picked[q.id] !== undefined) return; // answer once
        set((s) => ({ picked: { ...s.picked, [q.id]: idx } }));
        useProgress.getState().addAttempt({
          subject,
          topic: q.topic || subject,
          correct: idx === q.answerIndex,
          source: 'quiz',
        });
      },
      clear: () => set({ picked: {} }),
    }),
    { name: 'eju-answers' }
  )
);
