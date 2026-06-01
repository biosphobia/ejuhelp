import { create } from 'zustand';
import { askClaude, type ChatMessage } from './api';
import { useUI } from './ui';
import { useKeyPoints } from './userdata';

interface AskState {
  messages: ChatMessage[];
  busy: boolean;
  error: unknown | null;
  lastSaved: number; // key points auto-saved from the latest answer
  send: (text: string) => Promise<void>;
  reset: () => void;
}

export const useAsk = create<AskState>((set, get) => ({
  messages: [],
  busy: false,
  error: null,
  lastSaved: 0,
  reset: () => set({ messages: [], error: null, lastSaved: 0 }),
  send: async (text) => {
    const t = text.trim();
    if (!t || get().busy) return;
    const { subject, lang } = useUI.getState();
    const next: ChatMessage[] = [...get().messages, { role: 'user', content: t }];
    set({ messages: next, busy: true, error: null, lastSaved: 0 });
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
}));

/** Open the Ask panel and ask Claude to explain a question, allowing follow-ups. */
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
