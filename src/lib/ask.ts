import { create } from 'zustand';
import { askClaude, checkWork, explainBoard, fetchNoteRevise, EmptyBoardError, type ChatMessage } from './api';
import { useUI, type Lang } from './ui';
import { usePractice } from './practice';
import { useAnswers } from './answers';
import { useProgress, learnerSnapshotLines } from './userdata';
import { useMindmap } from './mindmap';
import { useLearnerProfile, learnerProfileLines } from './profile';
import { useBoard, type Stroke } from './board';
import { useSelection } from './selection';
import { exportPagePng } from '../whiteboard/export';
import { makeTextNotes } from '../whiteboard/textnote';
import { clearBoardSelection } from '../whiteboard/view';

/** The selected strokes that are text notes (so a coach message can revise them). */
function selectedTextNotes(): Stroke[] {
  const ids = new Set(useSelection.getState().ids);
  return useBoard.getState().getCurrentPage().strokes.filter((s) => ids.has(s.id) && s.text != null);
}
function notesCenter(notes: Stroke[]): { x: number; y: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of notes)
    for (const p of n.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  return minX === Infinity ? { x: 0, y: 0 } : { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}
const NOTE_UPDATED: Record<Lang, string> = {
  en: '✓ Updated your note on the whiteboard.',
  ja: '✓ ホワイトボードのメモを更新しました。',
  zh: '✓ 已更新白板上的笔记。',
  tr: '✓ Beyaz tahtadaki notun güncellendi.',
};
const NOTE_UPDATE_FAILED: Record<Lang, string> = {
  en: "Sorry — I couldn't update that note. Please try again.",
  ja: 'メモを更新できませんでした。もう一度お試しください。',
  zh: '抱歉，无法更新该笔记，请重试。',
  tr: 'Üzgünüm, o notu güncelleyemedim. Lütfen tekrar dene.',
};

/** Compact learner-profile lines (saved style preferences + a measured strengths/
 *  weaknesses snapshot) sent to the coach so it adapts how it teaches this student. */
function coachProfile(): string[] {
  return [...learnerProfileLines(), ...learnerSnapshotLines()];
}

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

/** Default user bubble when "Explain" is pressed without a typed note. */
const EXPLAIN_REQUEST: Record<Lang, string> = {
  en: 'Help me with what I have on the whiteboard.',
  ja: 'ホワイトボードに書いた内容について教えてください。',
  zh: '请帮我看看白板上写的内容。',
  tr: 'Beyaz tahtada yazdıklarımda bana yardım et.',
};

const CORRECT_ANSWER_NOTE: Record<Lang, (a: string) => string> = {
  en: (a) => `\n\n(Correct answer: ${a})`,
  ja: (a) => `\n\n（正解：${a}）`,
  zh: (a) => `\n\n（正确答案：${a}）`,
  tr: (a) => `\n\n(Doğru cevap: ${a})`,
};

interface AskState {
  messages: Message[];
  busy: boolean;
  error: unknown | null;
  lastSaved: number; // concepts auto-added to the Mindmap from the latest answer
  lastAutoAnswered: boolean; // the latest check read a final answer onto a pinned question
  send: (text: string) => Promise<void>;
  /** Send a photo (data URL) the student attached, with an optional question, to the coach. */
  sendPhoto: (note: string, imageDataUrl: string) => Promise<void>;
  /** Capture the current page and have the coach grade it, in-line with the chat.
   *  `note` is the student's optional textbox message, sent to steer the grading. */
  check: (note?: string) => Promise<void>;
  /** Capture the current page and have the coach explain / help with it (not grade). */
  explain: (note?: string) => Promise<void>;
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

    // If text notes are selected, treat the message as an instruction to REVISE them:
    // the coach rewrites the selected rows and they're replaced on the whiteboard.
    const notes = selectedTextNotes();
    if (notes.length) {
      const revNext: Message[] = [...get().messages, { role: 'user', content: t }];
      set({ messages: revNext, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
      try {
        const combined = notes.map((n) => n.text ?? '').join('\n');
        let revised = '';
        try {
          const r = await fetchNoteRevise({ subject, lang, note: combined, instruction: t });
          revised = (r.text || '').trim();
        } catch {
          /* handled below */
        }
        if (revised) {
          const rows = makeTextNotes(revised, notes[0].color, notesCenter(notes));
          useBoard.getState().eraseStrokes(notes.map((n) => n.id));
          useBoard.getState().addStrokes(rows);
          useSelection.getState().set([]);
          clearBoardSelection();
          set({ messages: [...revNext, { role: 'assistant', content: NOTE_UPDATED[lang] }] });
        } else {
          set({ messages: [...revNext, { role: 'assistant', content: NOTE_UPDATE_FAILED[lang] }] });
        }
      } catch (e) {
        set({ error: e });
      } finally {
        set({ busy: false });
      }
      return;
    }

    const { activeQuestion } = usePractice.getState();
    const next: Message[] = [...get().messages, { role: 'user', content: t }];
    set({ messages: next, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
    try {
      const res = await askClaude({
        subject,
        lang,
        messages: next,
        context: activeQuestion ?? undefined,
        profile: coachProfile(),
      });
      const added = useMindmap.getState().addMany(subject, res.keyPoints ?? []);
      useLearnerProfile.getState().addNotes(res.profile ?? []);
      set({ messages: [...next, { role: 'assistant', content: res.text }], lastSaved: added });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
  sendPhoto: async (note, imageDataUrl) => {
    if (get().busy || !imageDataUrl) return;
    const { subject, lang } = useUI.getState();
    const trimmed = note?.trim() || '';
    const prior = get().messages;
    const next: Message[] = [...prior, { role: 'user', content: trimmed || '📷 (photo)' }];
    set({ messages: next, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
    try {
      const res = await explainBoard({
        subject,
        lang,
        imageDataUrl,
        note: trimmed || undefined,
        messages: prior,
        profile: coachProfile(),
      });
      const added = useMindmap.getState().addMany(subject, res.keyPoints ?? []);
      useLearnerProfile.getState().addNotes(res.profile ?? []);
      set({ messages: [...next, { role: 'assistant', content: res.text }], lastSaved: added });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
  check: async (note) => {
    if (get().busy) return;
    const { subject, lang } = useUI.getState();
    const selIds = useSelection.getState().ids;
    const onlySelection = selIds.length > 0;
    const img = exportPagePng(useBoard.getState().getCurrentPage(), onlySelection ? { onlyIds: selIds } : undefined);
    if (!img) {
      set({ error: new EmptyBoardError() });
      return;
    }
    const { activeQuestion, activeItem } = usePractice.getState();
    const trimmedNote = note?.trim() || '';
    // Conversation so far, so a repeat check stays anchored to the same question.
    const prior = get().messages;
    const next: Message[] = [...prior, { role: 'user', content: trimmedNote || CHECK_REQUEST[lang] }];
    set({ messages: next, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
    try {
      const res = await checkWork({
        subject,
        lang,
        imageDataUrl: img,
        question: activeQuestion ?? undefined,
        // Give the grader the official answer/solution when the work is tied to a
        // known question, so it grades against them instead of re-deriving.
        answer: activeItem?.answer || undefined,
        solution: activeItem?.explanation || undefined,
        note: trimmedNote || undefined,
        messages: prior,
        profile: coachProfile(),
        selection: onlySelection || undefined,
      });
      set({
        messages: [
          ...next,
          { role: 'assistant', content: res.feedback, check: { correct: res.correct, errorTags: res.errorTags } },
        ],
      });
      const statSubject = res.subject || subject; // attribute to the inferred subject
      if (res.correct !== 'unknown') {
        useProgress.getState().addAttempt({
          subject: statSubject,
          topic: res.topic || statSubject,
          correct: res.correct === 'yes',
          source: 'check',
          errorTags: res.errorTags,
          prompt: activeQuestion?.slice(0, 400) || undefined,
          reasoning: res.feedback?.replace(/\s+/g, ' ').slice(0, 500) || undefined,
        });
      }
      // Capture the concepts this problem tests into the Mindmap, and any durable
      // learner signals (e.g. recurring mistakes) into the profile.
      const added = useMindmap.getState().addMany(statSubject, res.keyPoints ?? []);
      useLearnerProfile.getState().addNotes(res.profile ?? []);
      if (added) set({ lastSaved: added });
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
  explain: async (note) => {
    if (get().busy) return;
    const { subject, lang } = useUI.getState();
    const selIds = useSelection.getState().ids;
    const onlySelection = selIds.length > 0;
    const img = exportPagePng(useBoard.getState().getCurrentPage(), onlySelection ? { onlyIds: selIds } : undefined);
    if (!img) {
      set({ error: new EmptyBoardError() });
      return;
    }
    const { activeQuestion } = usePractice.getState();
    const trimmedNote = note?.trim() || '';
    const prior = get().messages;
    const next: Message[] = [...prior, { role: 'user', content: trimmedNote || EXPLAIN_REQUEST[lang] }];
    set({ messages: next, busy: true, error: null, lastSaved: 0, lastAutoAnswered: false });
    try {
      const res = await explainBoard({
        subject,
        lang,
        imageDataUrl: img,
        question: activeQuestion ?? undefined,
        note: trimmedNote || undefined,
        selection: onlySelection || undefined,
        messages: prior,
        profile: coachProfile(),
      });
      const added = useMindmap.getState().addMany(subject, res.keyPoints ?? []);
      useLearnerProfile.getState().addNotes(res.profile ?? []);
      set({ messages: [...next, { role: 'assistant', content: res.text }], lastSaved: added });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
}));

// Builds an EJU-oriented overview request whose depth scales with how many
// topics are selected: one topic → room to elaborate; many → terse, high-yield.
const OVERVIEW_REQUEST: Record<Lang, (subject: string, list: string, n: number) => string> = {
  en: (subject, list, n) =>
    n === 1
      ? `Give me a clear, EJU-focused study overview of this ${subject} topic: ${list}. ` +
        'I want full marks, so explain the core idea and intuition, the must-know formulas/definitions, one quick worked mini-example, the typical EJU question patterns for it, and the common traps. You have room to elaborate a little.'
      : `Give me a condensed, EJU-focused study overview covering all ${n} of these ${subject} topics: ${list}. ` +
        'Be tight and to the point so you can cover them all without a wall of text — the more topics, the more condensed you must be. For each topic give a few sharp bullets: the must-know formula(s)/fact(s), the typical EJU question pattern, and the main trap. End with the highest-yield points to memorize across them.',
  ja: (subject, list, n) =>
    n === 1
      ? `次の${subject}のトピックについて、EJU向けにわかりやすく要点をまとめてください：${list}。` +
        '満点を狙いたいので、核心となる考え方と直感、必ず覚える公式・定義、簡単な計算例、EJUでの典型的な出題パターン、よくある落とし穴を説明してください。少し詳しく書いて構いません。'
      : `次の${n}個の${subject}トピックすべてを、EJU向けに簡潔にまとめてください：${list}。` +
        'すべてを長文にせず簡潔に — トピックが多いほど凝縮してください。各トピックについて、必ず覚える公式・要点、EJUでの典型的な出題パターン、主な落とし穴を箇条書きで。最後に全体で最も得点に直結する暗記事項をまとめてください。',
  zh: (subject, list, n) =>
    n === 1
      ? `请就这个${subject}主题给我一份清晰、面向 EJU 的复习概览：${list}。` +
        '我要拿满分，请讲清核心思想与直觉、必记的公式/定义、一个简短的例题、该主题在 EJU 的典型出题方式以及常见陷阱。可以适当展开。'
      : `请用面向 EJU 的方式，简明地概览以下全部 ${n} 个${subject}主题：${list}。` +
        '要精炼、抓重点，不要长篇大论——主题越多越要浓缩。每个主题用几条要点列出：必记公式/要点、EJU 典型出题方式、主要陷阱。最后总结这些主题中最能得分的必背要点。',
  tr: (subject, list, n) =>
    n === 1
      ? `Şu ${subject} konusu için EJU odaklı, net bir çalışma özeti ver: ${list}. ` +
        'Tam puan istiyorum; temel fikri ve sezgiyi, bilinmesi şart formülleri/tanımları, kısa bir örnek çözümü, EJU’daki tipik soru kalıplarını ve sık yapılan hataları açıkla. Biraz detaylandırabilirsin.'
      : `Şu ${n} ${subject} konusunun hepsini kapsayan, EJU odaklı, yoğunlaştırılmış bir özet ver: ${list}. ` +
        'Hepsini uzun metne boğmadan, kısa ve öz tut — konu arttıkça daha da yoğunlaştır. Her konu için birkaç madde: bilinmesi şart formül(ler)/bilgi(ler), tipik EJU soru kalıbı ve ana tuzak. Sonunda hepsi içinden en çok puan getiren ezberlenecekleri özetle.',
};

/** Mirror the topics selected in the practice panel to Ask Coach for an EJU overview. */
export function overviewTopics(subjectName: string, labels: string[]) {
  const list = labels.filter(Boolean);
  if (!list.length) return;
  const { lang } = useUI.getState();
  const msg = OVERVIEW_REQUEST[lang](subjectName, list.join('; '), list.length);
  useUI.getState().openPanel('ask');
  void useAsk.getState().send(msg);
}

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
