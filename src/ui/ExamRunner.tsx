import { useEffect, useMemo, useState } from 'react';
import Markdown, { Inline, boxify } from './Markdown';
import QuestionCard from './QuestionCard';
import { ChevronLeft } from './icons';
import { useAnswers } from '../lib/answers';
import { useMockExams, type ExamResult } from '../lib/mockexams';
import type { GenQuestion } from '../lib/api';
import type { Subject } from '../lib/ui';
import { useT } from '../i18n';

type ExamQuestion = GenQuestion & { number?: number; block?: string };
const LETTERS = 'ABCDEFGHIJ';
const RUN_KEY = 'eju-exam-run';

/** A sitting in progress, kept on this device so a reload does not lose it. */
interface Run {
  examId: string;
  startedAt: number;
  picked: Record<string, number>;
  blanks: Record<string, Record<string, string>>;
}
function readRun(examId: string): Run | null {
  try {
    const r = JSON.parse(localStorage.getItem(RUN_KEY) ?? 'null') as Run | null;
    return r && r.examId === examId ? r : null;
  } catch {
    return null;
  }
}
function writeRun(r: Run | null) {
  try {
    if (r) localStorage.setItem(RUN_KEY, JSON.stringify(r));
    else localStorage.removeItem(RUN_KEY);
  } catch {
    /* storage unavailable: the sitting just isn't kept over a reload */
  }
}

const norm = (v: string) => v.replace(/[－−ー]/g, '-').replace(/\s+/g, '');
const scorable = (q: ExamQuestion) => ((q.choices?.length ?? 0) > 0 && q.answerIndex >= 0) || (q.blanks?.length ?? 0) > 0;
function isRight(q: ExamQuestion, run: Run): boolean {
  if (q.blanks?.length) return q.blanks.every((b) => norm(run.blanks[q.id]?.[b.label] ?? '') === norm(b.answer));
  return run.picked[q.id] === q.answerIndex;
}

/**
 * Sit an exam like the real thing: a countdown, answers not shown until the end,
 * then a score with a per-block breakdown and the full review.
 */
export default function ExamRunner({
  examId,
  title,
  subject,
  minutes,
  questions,
  onExit,
}: {
  examId: string;
  title: string;
  subject: Subject;
  minutes: number;
  questions: ExamQuestion[];
  onExit: () => void;
}) {
  const t = useT();
  const saveResult = useMockExams((s) => s.saveResult);
  const answer = useAnswers((s) => s.answer);
  const [run, setRun] = useState<Run>(() => readRun(examId) ?? { examId, startedAt: Date.now(), picked: {}, blanks: {} });
  const [result, setResult] = useState<ExamResult | null>(null);
  const [now, setNow] = useState(Date.now());
  const endsAt = run.startedAt + minutes * 60_000;
  const left = Math.max(0, endsAt - now);

  useEffect(() => {
    if (result) return;
    writeRun(run);
  }, [run, result]);
  useEffect(() => {
    if (result) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [result]);

  const finish = () => {
    if (result) return;
    const graded = questions.filter(scorable);
    const r: ExamResult = {
      examId,
      picked: run.picked,
      blanks: run.blanks,
      correct: graded.filter((q) => isRight(q, run)).length,
      total: graded.length,
      startedAt: run.startedAt,
      finishedAt: Date.now(),
    };
    // Every answer also counts in the weak-points profile, like any practice answer.
    for (const q of graded) {
      if (q.blanks?.length) {
        if (Object.keys(run.blanks[q.id] ?? {}).length) answer(subject, q, isRight(q, run) ? q.answerIndex : q.answerIndex - 1);
      } else if (run.picked[q.id] !== undefined) answer(subject, q, run.picked[q.id]);
    }
    saveResult(r);
    writeRun(null);
    setResult(r);
  };
  useEffect(() => {
    if (!result && left === 0) finish();
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const byBlock = useMemo(() => {
    const m = new Map<string, { right: number; total: number }>();
    if (!result) return [];
    const r: Run = { examId, startedAt: result.startedAt, picked: result.picked, blanks: result.blanks };
    for (const q of questions.filter(scorable)) {
      const k = q.block ?? '';
      const cur = m.get(k) ?? { right: 0, total: 0 };
      cur.total++;
      if (isRight(q, r)) cur.right++;
      m.set(k, cur);
    }
    return [...m.entries()];
  }, [result, questions, examId]);

  const answeredCount = questions.filter((q) => (q.blanks?.length ? Object.values(run.blanks[q.id] ?? {}).some(Boolean) : run.picked[q.id] !== undefined)).length;
  const mm = Math.floor(left / 60_000);
  const ss = Math.floor((left % 60_000) / 1000);

  if (result) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    const used = Math.round((result.finishedAt - result.startedAt) / 60_000);
    return (
      <div>
        <button type="button" onClick={onExit} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ChevronLeft className="h-4 w-4" /> {t('backToExams')}
        </button>
        <div className="mb-4 rounded-2xl bg-slate-900 p-4 text-white">
          <div className="text-xs uppercase tracking-wide text-slate-300">{title}</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">
            {result.correct} / {result.total} <span className="text-lg font-semibold text-slate-300">({pct}%)</span>
          </div>
          <div className="mt-1 text-xs text-slate-300">{t('examTimeUsed', { n: used, total: minutes })}</div>
        </div>
        {byBlock.length > 1 ? (
          <div className="mb-4 space-y-1.5">
            {byBlock.map(([name, v]) => (
              <div key={name} className="flex items-center gap-2 text-sm">
                <span className="w-40 shrink-0 truncate text-slate-600">{name || '—'}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${v.total ? (v.right / v.total) * 100 : 0}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right tabular-nums text-slate-500">
                  {v.right}/{v.total}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="space-y-3">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} subject={subject} q={q} label={q.number ?? i + 1} blankValues={result.blanks[q.id]} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center justify-between gap-2 rounded-xl bg-white/95 px-1 py-2 backdrop-blur">
        <button type="button" onClick={onExit} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ChevronLeft className="h-4 w-4" /> {t('examLeave')}
        </button>
        <span className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${left < 5 * 60_000 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'}`}>
          {mm}:{String(ss).padStart(2, '0')}
        </span>
        <span className="text-xs tabular-nums text-slate-500">{t('examAnswered', { n: answeredCount, total: questions.length })}</span>
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => {
          const prevBlock = i > 0 ? questions[i - 1].block : undefined;
          return (
            <div key={q.id}>
              {q.block && q.block !== prevBlock ? <div className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{q.block}</div> : null}
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-1 text-xs font-semibold text-slate-400">{q.number ?? i + 1}</div>
                <Markdown text={boxify(q.prompt, q.blanks?.map((b) => b.label))} />
                {q.blanks?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.blanks.map((b) => (
                      <label key={b.label} className="flex items-center gap-1 text-sm">
                        <span className="font-semibold text-slate-500">{b.label}</span>
                        <input
                          value={run.blanks[q.id]?.[b.label] ?? ''}
                          inputMode="numeric"
                          maxLength={Math.max(1, b.label.length)}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9\-－−]/g, '');
                            setRun((r) => ({ ...r, blanks: { ...r.blanks, [q.id]: { ...(r.blanks[q.id] ?? {}), [b.label]: v } } }));
                          }}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-center font-mono text-sm outline-none focus:border-slate-500"
                          style={{ width: `${Math.max(1, b.label.length) * 1.1 + 1.6}rem` }}
                        />
                      </label>
                    ))}
                  </div>
                ) : q.choices?.length ? (
                  <div className="mt-2 space-y-1.5">
                    {q.choices.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRun((r) => ({ ...r, picked: { ...r.picked, [q.id]: idx } }))}
                        className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                          run.picked[q.id] === idx ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-semibold opacity-70">{LETTERS[idx]}</span>
                        <span className="flex-1">
                          <Inline text={c} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          if (answeredCount === questions.length || window.confirm(t('examSubmitConfirm', { n: questions.length - answeredCount }))) finish();
        }}
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
      >
        {t('examSubmit')}
      </button>
    </div>
  );
}
