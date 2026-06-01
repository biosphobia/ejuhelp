import { create } from 'zustand';
import { askClaude, checkWork, EmptyBoardError, type ChatMessage } from './api';
import { useUI } from './ui';
import { usePractice } from './practice';
import { useAnswers } from './answers';
import { useProgress, useKeyPoints } from './userdata';
import { useBoard } from './board';
import { exportPagePng } from '../whiteboard/export';

/** Verdict metadata attached to the assistant message produced by "Check my work". */
export interface CheckMeta {
  correct: 'yes' | 'no' | 'partial' | 'unknown';
  errorTags: string[];
}

export interface Message extends ChatMessage {
  check?: CheckMeta;
}

interface AskState {
  messages: Message[];
  busy: boolean;
  error: unknown | null;
  lastSaved: number; // key points auto-saved from the latest answer
  lastAutoAnswered: boolean; // the latest check read a final answer onto a pinned question
  send: (text: string) => Promise<void>;
  /** Capture the current page and have the coach grade it, in-line with the chat. */
  check: () => Promise<void>;
  reset: () => void;
}

export const useAsk = create<AskState>((set, get) => ({
  messages: [],
  busy: false,
  error: null,
  lastSaved: 0,
  lastAutoAnswered: false,
  reset: () => set({ messages: [], error: null, lastSaved: 0, lastAutoAnswered: false }),
  send: async (text) => {
    const t = text.trim();
    if (!t || get().busy) return;
    const { subject, lang } = useUI.getState();
    const next: Message[] = [...get().messages, { role: 'user', content: t }];
    set({ messages: next, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
    try {
      const res = await askClaude({ subject, lang, messages: next });
      const added = useKeyPoints.getState().addMany(subject, res.keyPoints ?? []);
      set({ messages: [...next, { role: 'assistant', content: res.text }], lastSaved: added });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
  check: async () => {
    if (get().busy) return;
    const { subject, lang } = useUI.getState();
    const img = exportPagePng(useBoard.getState().getCurrentPage());
    if (!img) {
      set({ error: new EmptyBoardError() });
      return;
    }
    const { activeQuestion, activeItem } = usePractice.getState();
    const reqText =
      lang === 'ja' ? 'このページの答案をチェックしてください。' : 'Please check my work on this page.';
    const next: Message[] = [...get().messages, { role: 'user', content: reqText }];
    set({ messages: next, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
    try {
      const res = await checkWork({ subject, lang, imageDataUrl: img, question: activeQuestion ?? undefined });
      set({
        messages: [
          ...next,
          { role: 'assistant', content: res.feedback, check: { correct: res.correct, errorTags: res.errorTags } },
        ],
      });
      if (res.correct !== 'unknown') {
        useProgress.getState().addAttempt({
          subject,
          topic: res.topic || subject,
          correct: res.correct === 'yes',
          source: 'check',
          errorTags: res.errorTags,
        });
      }
      // If the page clearly states a final choice for the active MCQ, reflect it on the board.
      if (
        activeItem &&
        (activeItem.choices?.length ?? 0) > 0 &&
        activeItem.answerIndex >= 0 &&
        res.studentAnswerIndex >= 0 &&
        res.studentAnswerIndex < activeItem.choices!.length
      ) {
        useAnswers.getState().mark(activeItem.id, res.studentAnswerIndex);
        set({ lastAutoAnswered: true });
      }
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
}));

/** Open the Ask Coach panel and ask Claude to explain a question, allowing follow-ups. */
export function explainQuestion(prompt: string, choices: string[] | undefined, answer: string) {
  const { lang } = useUI.getState();
  const letters = 'ABCDE';
  const choiceStr = choices?.length
    ? '\n' + choices.map((c, i) => `${letters[i]}. ${c}`).join('\n')
    : '';
  const ans = answer ? (lang === 'ja' ? `\n\n（正解：${answer}）` : `\n\n(Correct answer: ${answer})`) : '';
  const msg =
    lang === 'ja'
      ? `次の問題の解き方を、初心者にもわかるように、順を追って丁寧に説明してください。\n\n${prompt}${choiceStr}${ans}`
      : `Explain how to solve this question in a simple, clear, step-by-step way a beginner can follow.\n\n${prompt}${choiceStr}${ans}`;
  useUI.getState().openPanel('ask');
  void useAsk.getState().send(msg);
}
