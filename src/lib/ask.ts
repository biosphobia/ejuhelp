import { create } from 'zustand';
import { askClaude, checkWork, EmptyBoardError, type ChatMessage } from './api';
import { useUI, type Lang } from './ui';
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

const CHECK_REQUEST: Record<Lang, string> = {
  en: 'Please check my work on this page.',
  ja: 'このページの答案をチェックしてください。',
  zh: '请检查这一页上我的解答。',
  tr: 'Lütfen bu sayfadaki çözümümü kontrol et.',
};

const EXPLAIN_INTRO: Record<Lang, string> = {
  en: 'Explain how to solve this question in a simple, clear, step-by-step way a beginner can follow.',
  ja: '次の問題の解き方を、初心者にもわかるように、順を追って丁寧に説明してください。',
  zh: '请用简单清晰、循序渐进的方式讲解这道题的解法，让初学者也能看懂。',
  tr: 'Bu sorunun nasıl çözüleceğini, yeni başlayan birinin takip edebileceği basit ve net adımlarla açıkla.',
};

const CORRECT_ANSWER_NOTE: Record<Lang, (a: string) => string> = {
  en: (a) => `\n\n(Correct answer: ${a})`,
  ja: (a) => `\n\n（正解：${a}）`,
  zh: (a) => `\n\n（正确答案：${a}）`,
  tr: (a) => `\n\n(Doğru cevap: ${a})`,
};

/** Keep the saved conversation bounded so it always fits in one Firestore doc (~1 MiB). */
const MSG_LIMIT = 80;
const MSG_BYTES = 700_000;
function trimMessages(msgs: Message[]): Message[] {
  let out = msgs.slice(-MSG_LIMIT);
  // Drop oldest turns while the serialized history is too large for the cloud doc.
  while (out.length > 2 && JSON.stringify(out).length > MSG_BYTES) out = out.slice(2);
  return out;
}

interface AskState {
  messages: Message[];
  /** Bumped whenever `messages` change; drives local + cloud autosave. */
  rev: number;
  busy: boolean;
  error: unknown | null;
  lastSaved: number; // key points auto-saved from the latest answer
  lastAutoAnswered: boolean; // the latest check read a final answer onto a pinned question
  send: (text: string) => Promise<void>;
  /** Capture the current page and have the coach grade it, in-line with the chat. */
  check: () => Promise<void>;
  /** Wipe the conversation (locally and in the cloud). */
  reset: () => void;
  /** Replace the conversation from a saved copy (localStorage / Firestore). */
  load: (messages: Message[]) => void;
}

export const useAsk = create<AskState>((set, get) => ({
  messages: [],
  rev: 0,
  busy: false,
  error: null,
  lastSaved: 0,
  lastAutoAnswered: false,
  reset: () =>
    set((s) => ({ messages: [], rev: s.rev + 1, error: null, lastSaved: 0, lastAutoAnswered: false })),
  load: (messages) =>
    set((s) => ({
      messages: Array.isArray(messages)
        ? trimMessages(messages.filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant')))
        : [],
      rev: s.rev + 1,
    })),
  send: async (text) => {
    const t = text.trim();
    if (!t || get().busy) return;
    const { subject, lang } = useUI.getState();
    const { activeQuestion } = usePractice.getState();
    const next: Message[] = trimMessages([...get().messages, { role: 'user', content: t }]);
    set((s) => ({ messages: next, rev: s.rev + 1, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false }));
    try {
      const res = await askClaude({ subject, lang, messages: next, context: activeQuestion ?? undefined });
      const added = useKeyPoints.getState().addMany(subject, res.keyPoints ?? []);
      set((s) => ({
        messages: trimMessages([...next, { role: 'assistant', content: res.text }]),
        rev: s.rev + 1,
        lastSaved: added,
      }));
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
    const next: Message[] = trimMessages([...get().messages, { role: 'user', content: CHECK_REQUEST[lang] }]);
    set((s) => ({ messages: next, rev: s.rev + 1, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false }));
    try {
      const res = await checkWork({ subject, lang, imageDataUrl: img, question: activeQuestion ?? undefined });
      set((s) => ({
        messages: trimMessages([
          ...next,
          { role: 'assistant', content: res.feedback, check: { correct: res.correct, errorTags: res.errorTags } },
        ]),
        rev: s.rev + 1,
      }));
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
  const ans = answer ? CORRECT_ANSWER_NOTE[lang](answer) : '';
  const msg = `${EXPLAIN_INTRO[lang]}\n\n${prompt}${choiceStr}${ans}`;
  useUI.getState().openPanel('ask');
  void useAsk.getState().send(msg);
}
