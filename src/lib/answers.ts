import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractConcepts, type GenQuestion } from './api';
import type { Subject } from './ui';
import { useUI } from './ui';
import { useProgress } from './userdata';
import { useMindmap } from './mindmap';

// Questions we've already mined for Mindmap concepts, so a re-render or a second
// glance never fires a duplicate extraction call.
const conceptCaptured = new Set<string>();
const LETTERS = 'ABCDE';

/** Distil the concept(s) a just-answered practice question tests, into the Mindmap. */
function captureQuestionConcepts(subject: Subject, q: GenQuestion) {
  if (conceptCaptured.has(q.id)) return;
  if (!q.prompt?.trim()) return;
  conceptCaptured.add(q.id);
  const lang = useUI.getState().lang;
  const choiceStr = q.choices?.length
    ? '\n' + q.choices.map((c, i) => `${LETTERS[i]}. ${c}`).join('\n')
    : '';
  const text =
    `Question: ${q.prompt}${choiceStr}\n` +
    (q.answer ? `Correct answer: ${q.answer}\n` : '') +
    (q.explanation ? `Explanation: ${q.explanation}` : '');
  void extractConcepts({ subject, lang, text })
    .then((r) => {
      if (r.concepts?.length) useMindmap.getState().addMany(subject, r.concepts);
    })
    .catch(() => {
      conceptCaptured.delete(q.id); // allow a later retry on transient failure
    });
}

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
        useProgress.getState().addAttempt({
          subject,
          topic: q.topic || subject,
          correct: idx === q.answerIndex,
          source: 'quiz',
        });
        captureQuestionConcepts(subject, q); // mine the concept(s) it tests for the Mindmap
      },
      mark: (id, idx) => set((s) => ({ picked: { ...s.picked, [id]: idx } })),
      clear: () => set({ picked: {} }),
    }),
    { name: 'eju-answers' }
  )
);
