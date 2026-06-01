import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Markdown from './Markdown';
import { usePinned } from '../lib/pinned';
import { usePractice } from '../lib/practice';
import { useAnswers } from '../lib/answers';
import { explainQuestion } from '../lib/ask';
import { useT } from '../i18n';
import { ChevronLeft, ChevronRight, CloseIcon, AskIcon, TrashIcon, PinIcon } from './icons';

const WIDTH = 340;
const LETTERS = 'ABCDE';
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function BoardQuestions() {
  const t = useT();
  const items = usePinned((s) => s.items);
  const index = usePinned((s) => s.index);
  const collapsed = usePinned((s) => s.collapsed);
  const pos = usePinned((s) => s.pos);
  const setIndex = usePinned((s) => s.setIndex);
  const setCollapsed = usePinned((s) => s.setCollapsed);
  const setPos = usePinned((s) => s.setPos);
  const unpin = usePinned((s) => s.unpin);
  const clear = usePinned((s) => s.clear);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);
  const picked = useAnswers((s) => s.picked);
  const answer = useAnswers((s) => s.answer);

  const [showAnswer, setShowAnswer] = useState(false);

  const i = Math.max(0, Math.min(index, items.length - 1));
  const q = items[i];

  // Keep "Check my work" pointed at whatever question is currently shown.
  useEffect(() => {
    if (!q) return;
    const ch = q.choices?.length ? '\n' + q.choices.map((c, k) => `${LETTERS[k]}. ${c}`).join('\n') : '';
    setActiveQuestion(`${q.prompt}${ch}`);
    setShowAnswer(false);
  }, [q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items.length || !q) return null;

  const chosen = picked[q.id];
  const answered = chosen !== undefined;
  const mcq = (q.choices?.length ?? 0) > 0 && q.answerIndex >= 0;

  const left = pos ? pos.x : Math.max(8, (window.innerWidth - WIDTH) / 2);
  const top = pos ? pos.y : 12;

  const startDrag = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // let buttons work
    const sx = e.clientX;
    const sy = e.clientY;
    const bx = left;
    const by = top;
    const move = (ev: PointerEvent) => {
      setPos({
        x: clamp(bx + (ev.clientX - sx), 4, window.innerWidth - 90),
        y: clamp(by + (ev.clientY - sy), 4, window.innerHeight - 44),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        style={{ left, top }}
        className="pointer-events-auto absolute z-20 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur"
      >
        <PinIcon className="h-4 w-4" />
        {t('question')} {i + 1}/{items.length}
      </button>
    );
  }

  return (
    <div
      style={{ left, top, width: WIDTH }}
      className="pointer-events-auto absolute z-20 max-w-[94vw] overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/10 backdrop-blur"
    >
      <div
        onPointerDown={startDrag}
        className="flex cursor-move touch-none items-center justify-between gap-2 bg-slate-900 px-3 py-2 text-white"
      >
        <span className="text-xs font-semibold">
          {t('question')} {i + 1}/{items.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIndex(i - 1)}
            disabled={i <= 0}
            aria-label="previous"
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex(i + 1)}
            disabled={i >= items.length - 1}
            aria-label="next"
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="collapse"
            className="grid h-7 w-7 place-items-center rounded-lg text-base hover:bg-white/15"
          >
            –
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label={t('close')}
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="thin-scroll max-h-[46vh] overflow-y-auto px-3 py-2.5">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{q.topic}</div>
        <Markdown text={q.prompt} />
        {mcq ? (
          <div className="mt-2 space-y-1.5">
            {q.choices!.map((c, k) => {
              const isAnswer = k === q.answerIndex;
              const isChosen = chosen === k;
              let cls = 'border-slate-200 hover:bg-slate-50';
              if (answered && isAnswer) cls = 'border-emerald-300 bg-emerald-50';
              else if (answered && isChosen) cls = 'border-red-300 bg-red-50';
              return (
                <button
                  key={k}
                  type="button"
                  disabled={answered}
                  onClick={() => answer(q.subject, q, k)}
                  className={`flex w-full items-start gap-2 rounded-xl border px-2.5 py-1.5 text-left text-sm transition ${cls}`}
                >
                  <span className="font-semibold text-slate-500">{LETTERS[k]}</span>
                  <span className="flex-1">{c}</span>
                </button>
              );
            })}
            {answered ? (
              <p
                className={`pt-0.5 text-sm font-semibold ${chosen === q.answerIndex ? 'text-emerald-700' : 'text-red-600'}`}
              >
                {chosen === q.answerIndex ? t('correctMark') : t('incorrectMark')}
              </p>
            ) : (
              <p className="pt-0.5 text-xs italic text-slate-400">{t('selectAnswer')}</p>
            )}
          </div>
        ) : q.choices?.length ? (
          <ol className="mt-2 ml-5 list-[upper-alpha] space-y-1 text-sm text-slate-700">
            {q.choices.map((c, k) => (
              <li key={k}>{c}</li>
            ))}
          </ol>
        ) : null}
        {showAnswer ? (
          <div className="mt-3 rounded-xl bg-emerald-50 p-2.5 text-sm ring-1 ring-emerald-100">
            <div className="font-semibold text-emerald-800">
              {t('correctAnswerLabel')}: {q.answer}
            </div>
            <div className="mt-1">
              <Markdown text={q.explanation} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 p-2">
        <button
          type="button"
          onClick={() => explainQuestion(q.prompt, q.choices, q.answer)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <AskIcon className="h-3.5 w-3.5" /> {t('explain')}
        </button>
        <button
          type="button"
          onClick={() => setShowAnswer((v) => !v)}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          {showAnswer ? t('hideAnswer') : t('showAnswerShort')}
        </button>
        <button
          type="button"
          onClick={() => unpin(q.id)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-600"
        >
          <TrashIcon className="h-3.5 w-3.5" /> {t('unpin')}
        </button>
      </div>
    </div>
  );
}
