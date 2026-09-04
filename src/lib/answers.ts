import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GenQuestion } from './api';
import type { Subject } from './ui';
import { useProgress } from './userdata';
import { findSubtopic } from '../data/notes';

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
  /**
   * Reflect a detected choice on a question (e.g. a final answer read off the
   * page by "Check my work") WITHOUT recording a separate attempt — the check
   * already grades the work, so this only updates the on-screen answered state.
   */
  mark: (id: string, idx: number) => void;
  clear: () => void;
}

export const useAnswers = create<AnswersState>()(
  persist(
    (set, get) => ({
      picked: {},
      answer: (subject, q, idx) => {
        if (get().picked[q.id] !== undefined) return; // answer once
        set((s) => ({ picked: { ...s.picked, [q.id]: idx } }));
        // Group attempts by the knowledge-base subtopic (English name) when the
        // question is linked to one, so past-paper questions with long unique
        // topic strings still roll up into one weak-point bar per subtopic.
        const sub = q.topicId ? findSubtopic(subject, q.topicId) : null;
        useProgress.getState().addAttempt({
          subject,
          topic: sub?.sub.name.en || q.topic || subject,
          correct: idx === q.answerIndex,
          source: 'quiz',
        });
      },
      mark: (id, idx) => set((s) => ({ picked: { ...s.picked, [id]: idx } })),
      clear: () => set({ picked: {} }),
    }),
    { name: 'eju-answers' }
  )
);
