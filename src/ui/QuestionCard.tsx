import { useState } from 'react';
import Markdown, { Inline } from './Markdown';
import { useAnswers } from '../lib/answers';
import { usePinned } from '../lib/pinned';
import { explainQuestion } from '../lib/ask';
import { generateQuestions, type GenQuestion } from '../lib/api';
import { useUI, type Subject } from '../lib/ui';
import { useGenerated } from '../lib/generated';
import { useReview } from '../lib/review';
import { usePractice } from '../lib/practice';
import { findSubtopic, loadNotes } from '../data/notes';
import { errorMessage, ErrorNote } from './atoms';
import { SpinnerIcon } from './icons';
import { useT } from '../i18n';

const LETTERS = 'ABCDEF';

/** One reviewable question: answerable MCQ with instant grading, hint, per-choice
 *  feedback, reveal, pin, explain, "try a similar one" and a link back to the note.
 *  Shared by the practice generator and the mock-exam review. */
export default function QuestionCard({
  subject,
  q,
  label,
}: {
  subject: Subject;
  q: GenQuestion;
  label?: string | number;
}) {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const openPanel = useUI((s) => s.openPanel);
  const panel = useUI((s) => s.panel);
  const picked = useAnswers((s) => s.picked);
  const answer = useAnswers((s) => s.answer);
  const pin = usePinned((s) => s.pin);
  const unpin = usePinned((s) => s.unpin);
  const pinnedItems = usePinned((s) => s.items);
  const [revealed, setRevealed] = useState(false);
  const [hint, setHint] = useState(false);
  const [similarBusy, setSimilarBusy] = useState(false);
  const [similarErr, setSimilarErr] = useState<unknown>(null);
  const [similarDone, setSimilarDone] = useState(false);
  const [markedDue, setMarkedDue] = useState(false);

  const chosen = picked[q.id];
  const answered = chosen !== undefined;
  const mcq = (q.choices?.length ?? 0) > 0 && q.answerIndex >= 0;
  const isPinned = pinnedItems.some((p) => p.id === q.id);
  const noteHit = q.topicId ? findSubtopic(subject, q.topicId) : null;
  const wrong = answered && chosen !== q.answerIndex;

  const pick = (idx: number) => {
    if (answered) return;
    answer(subject, q, idx);
    setRevealed(true);
    // A miss pulls the topic forward in the spaced-review calendar.
    if (idx !== q.answerIndex && noteHit) {
      useReview.getState().markDue(subject, q.topicId!);
      setMarkedDue(true);
    }
  };

  const trySimilar = async () => {
    if (similarBusy) return;
    setSimilarBusy(true);
    setSimilarErr(null);
    try {
      const res = await generateQuestions({
        subject,
        lang,
        topic: q.topicId,
        difficulty: 'medium',
        count: 1,
        similarTo: { prompt: q.prompt + (q.choices?.length ? '\n' + q.choices.map((c, i) => `${LETTERS[i]}. ${c}`).join('\n') : ''), answer: q.answer },
      });
      if (!res.questions.length) throw new Error('empty');
      useGenerated.getState().addQuestions(subject, res.questions, q.id);
      setSimilarDone(true);
      if (panel !== 'generate') openPanel('generate');
    } catch (e) {
      setSimilarErr(e);
    } finally {
      setSimilarBusy(false);
    }
  };

  // "Explain" hands the coach the matching study note so the explanation uses the
  // same words and logic the student has already seen.
  const explain = async () => {
    let notes: string | undefined;
    if (noteHit) {
      const data = await loadNotes(subject).catch(() => null);
      const n = data?.notes[q.topicId!];
      const L: 'en' | 'ja' = lang === 'ja' ? 'ja' : 'en';
      if (n) notes = `${noteHit.sub.name[L]}\n\n${n.core[L]}\n\n${n.body[L]}`;
    }
    explainQuestion(q.prompt, q.choices, q.answer, notes);
  };

  const openNote = () => {
    if (!noteHit) return;
    usePractice.getState().setWantNote({ subject, id: q.topicId! });
    openPanel('plan');
  };

  const showFeedback = revealed || answered;

  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label != null ? `${label}. ` : ''}
          {q.topic}
        </div>
        {q.hint && !showFeedback ? (
          <button
            type="button"
            onClick={() => setHint((h) => !h)}
            className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100 hover:bg-amber-100"
          >
            💡 {hint ? t('hideHint') : t('showHint')}
          </button>
        ) : null}
      </div>
      <Markdown text={q.prompt} />
      {hint && q.hint && !showFeedback ? (
        <div className="mt-2 rounded-xl bg-amber-50/80 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-100">
          💡 <Inline text={q.hint} />
        </div>
      ) : null}

      {mcq ? (
        <div className="mt-2 space-y-1.5">
          {q.choices!.map((c, idx) => {
            const isAnswer = idx === q.answerIndex;
            const isChosen = chosen === idx;
            let cls = 'border-slate-200 hover:bg-slate-50';
            if (answered && isAnswer) cls = 'border-emerald-300 bg-emerald-50';
            else if (answered && isChosen) cls = 'border-red-300 bg-red-50';
            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => pick(idx)}
                className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${cls}`}
              >
                <span className="font-semibold text-slate-500">{LETTERS[idx]}</span>
                <span className="flex-1">
                  <Inline text={c} />
                </span>
              </button>
            );
          })}
          {!answered ? (
            <p className="pt-1 text-xs italic text-slate-400">{t('selectAnswer')}</p>
          ) : (
            <p
              className={`pt-1 text-sm font-semibold ${chosen === q.answerIndex ? 'text-emerald-700' : 'text-red-600'}`}
            >
              {chosen === q.answerIndex ? t('correctMark') : t('incorrectMark')}
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {!mcq ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            {revealed ? t('hideAnswer') : t('showAnswer')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => (isPinned ? unpin(q.id) : pin(subject, q))}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            isPinned
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isPinned ? `✓ ${t('unpin')}` : t('pinToBoard')}
        </button>
        <button
          type="button"
          onClick={() => void explain()}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          {t('explain')}
        </button>
        {showFeedback ? (
          <button
            type="button"
            onClick={() => void trySimilar()}
            disabled={similarBusy}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            {similarBusy ? <SpinnerIcon className="h-3.5 w-3.5" /> : '↻'} {t('trySimilar')}
          </button>
        ) : null}
        {noteHit ? (
          <button
            type="button"
            onClick={openNote}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            📖 {t('openNote')}
          </button>
        ) : null}
      </div>
      {similarDone ? <p className="mt-1.5 text-xs font-medium text-indigo-700">✓ {t('similarAdded')}</p> : null}
      {similarErr ? <div className="mt-2"><ErrorNote>{errorMessage(similarErr, t)}</ErrorNote></div> : null}

      {showFeedback ? (
        <div className="mt-3 space-y-2">
          {wrong && q.choiceNotes?.[chosen!] ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm ring-1 ring-red-100">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-red-600">{t('whyYourChoice')}</div>
              <div className="text-slate-800">
                <Inline text={q.choiceNotes[chosen!]} />
              </div>
            </div>
          ) : null}
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="mb-1 text-sm font-semibold text-emerald-800">
              {t('correctAnswerLabel')}: <Inline text={q.answer} />
            </div>
            {mcq && q.choiceNotes?.[q.answerIndex] ? (
              <div className="mb-2 text-sm text-slate-700">
                <span className="font-semibold text-emerald-700">{t('whyCorrect')}: </span>
                <Inline text={q.choiceNotes[q.answerIndex]} />
              </div>
            ) : null}
            {q.keyIdea ? (
              <div className="mb-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{t('whatThisTests')}: </span>
                <Inline text={q.keyIdea} />
              </div>
            ) : null}
            {q.explanation ? <Markdown text={q.explanation} /> : null}
            {q.trap ? (
              <div className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-slate-800 ring-1 ring-amber-100">
                <span className="font-semibold text-amber-700">⚠ {t('trapLabel')}: </span>
                <Inline text={q.trap} />
              </div>
            ) : null}
          </div>
          {markedDue ? <p className="text-xs text-slate-500">📅 {t('reviewMarkedDue')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
