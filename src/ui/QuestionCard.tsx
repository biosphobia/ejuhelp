import { useState } from 'react';
import Markdown, { Inline } from './Markdown';
import { useAnswers } from '../lib/answers';
import { usePinned } from '../lib/pinned';
import { explainQuestion } from '../lib/ask';
import type { GenQuestion } from '../lib/api';
import type { Subject } from '../lib/ui';
import { useT } from '../i18n';
import { TrashIcon } from './icons';

const LETTERS = 'ABCDE';

/** One reviewable question: answerable MCQ with instant grading, reveal, pin, and explain.
 *  Shared by the practice generator and the mock-exam review. */
export default function QuestionCard({
  subject,
  q,
  label,
  onRemove,
}: {
  subject: Subject;
  q: GenQuestion;
  label?: string | number;
  /** When provided, shows a small button to delete this saved question. */
  onRemove?: () => void;
}) {
  const t = useT();
  const picked = useAnswers((s) => s.picked);
  const answer = useAnswers((s) => s.answer);
  const pin = usePinned((s) => s.pin);
  const unpin = usePinned((s) => s.unpin);
  const pinnedItems = usePinned((s) => s.items);
  const [revealed, setRevealed] = useState(false);

  const chosen = picked[q.id];
  const answered = chosen !== undefined;
  const mcq = (q.choices?.length ?? 0) > 0 && q.answerIndex >= 0;
  const isPinned = pinnedItems.some((p) => p.id === q.id);

  const pick = (idx: number) => {
    if (answered) return;
    answer(subject, q, idx);
    setRevealed(true);
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label != null ? `${label}. ` : ''}
        {q.topic}
      </div>
      <Markdown text={q.prompt} />

      {!mcq && !(q.choices?.length) ? (
        <p className="mt-2 text-xs italic text-slate-400">✏️ {t('solveOnBoardHint')}</p>
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
          onClick={() => explainQuestion(q.prompt, q.choices, q.answer)}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          {t('explain')}
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t('removeQuestion')}
            title={t('removeQuestion')}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-600"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {revealed ? (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="mb-1 text-sm font-semibold text-emerald-800">
            {t('correctAnswerLabel')}: <Inline text={q.answer} />
          </div>
          {q.explanation ? <Markdown text={q.explanation} /> : null}
        </div>
      ) : null}
    </div>
  );
}
