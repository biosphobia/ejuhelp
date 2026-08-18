import { useEffect, useMemo, useState } from 'react';
import { SUBJECTS, type Subject } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useStudyMap, weakNodeIds } from '../lib/studymap';
import {
  buildDay,
  totalDays,
  todayIndex,
  effectivePlanStart,
  todayStr,
  phaseOf,
  ejuExamDate,
  startOfDay,
  addDays,
  daysBetween,
  parseDate,
  type CalTask,
  type Phase,
} from '../lib/calendar';
import { runTask } from './runTask';
import { useT, type StringKey } from '../i18n';
import { ChevronLeft, ChevronRight, SpinnerIcon } from '../ui/icons';

const DEFAULT_SUBJECTS: Subject[] = ['math', 'physics', 'chemistry'];
const PHASE_KEY: Record<Phase, StringKey> = { learn: 'phaseLearn', drill: 'phaseDrill', sprint: 'phaseSprint' };
const KIND_KEY: Record<CalTask['kind'], StringKey> = {
  learn: 'kindLearn',
  review: 'kindReview',
  drill: 'kindDrill',
  quiz: 'kindQuiz',
  mock: 'kindMock',
};
const KIND_CLS: Record<CalTask['kind'], string> = {
  learn: 'bg-sky-500/20 text-sky-200',
  review: 'bg-violet-500/20 text-violet-200',
  drill: 'bg-amber-500/20 text-amber-100',
  quiz: 'bg-indigo-500/20 text-indigo-100',
  mock: 'bg-rose-500/20 text-rose-100',
};
// A fixed Sunday, used to render localized weekday headers in Sun–Sat order.
const WEEK_REF = new Date(2023, 0, 1);

/** The EJU study calendar: a standard, navigable month grid from today to the (fixed) EJU
 *  date, computed entirely on the client. Tapping a day shows its tasks; tapping a task
 *  opens the topic (study sheet + practice) or starts a mixed drill. */
export default function StudyCalendar() {
  const t = useT();
  const planSubjects = useStudyMap((s) => s.planSubjects);
  const setPlanSubjects = useStudyMap((s) => s.setPlanSubjects);
  const done = useStudyMap((s) => s.done);
  const toggleTask = useStudyMap((s) => s.toggleTask);
  const ensureTree = useStudyMap((s) => s.ensureTree);
  const trees = useStudyMap((s) => s.trees);
  const rev = useStudyMap((s) => s.rev);
  const prev = useProgress((s) => s.rev);

  const storedStart = useStudyMap((s) => s.planStart);
  const setPlanStart = useStudyMap((s) => s.setPlanStart);

  const today = useMemo(() => startOfDay(), []);
  const examDate = useMemo(() => ejuExamDate(), []);
  const examD = useMemo(() => parseDate(examDate), [examDate]);
  // The plan is anchored to a FIXED start date so it advances day by day and covers the
  // whole syllabus by the exam (a plan re-based to "today" can never finish).
  const planStart = useMemo(() => effectivePlanStart(storedStart, examDate), [storedStart, examDate]);
  const planStartD = useMemo(() => parseDate(planStart), [planStart]);
  const D = totalDays(examDate, planStart);
  const subjects = planSubjects.length ? planSubjects : DEFAULT_SUBJECTS;

  const [selectedIdx, setSelectedIdx] = useState(() => todayIndex(examDate, planStart));
  const [cursor, setCursor] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));

  // Seed the default subjects and the fixed plan anchor once, so both persist.
  useEffect(() => {
    if (!planSubjects.length) setPlanSubjects(DEFAULT_SUBJECTS);
  }, [planSubjects.length, setPlanSubjects]);
  useEffect(() => {
    if (!storedStart || storedStart !== planStart) setPlanStart(planStart);
  }, [storedStart, planStart, setPlanStart]);

  const restartPlan = () => {
    setPlanStart(todayStr());
    setSelectedIdx(0);
    setCursor({ y: today.getFullYear(), m: today.getMonth() });
  };

  useEffect(() => {
    for (const s of subjects) void ensureTree(s);
  }, [subjects, ensureTree]);

  // Weak nodes (for prioritizing drills/quizzes), keyed `${subject}:${id}`.
  const weak = useMemo(
    () => weakNodeIds(subjects),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subjects, trees, rev, prev]
  );

  const treesReady = subjects.every((s) => trees[s]);
  const dte = daysBetween(today, examD);

  const toggleSubject = (s: Subject) => {
    const next = subjects.includes(s) ? subjects.filter((x) => x !== s) : [...subjects, s];
    if (next.length) setPlanSubjects(next);
  };

  // ── month grid geometry ──
  const monthStart = new Date(cursor.y, cursor.m, 1);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const weeks = Math.ceil((monthStart.getDay() + daysInMonth) / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const weekdayNames = Array.from({ length: 7 }, (_, i) => addDays(WEEK_REF, i).toLocaleDateString(undefined, { weekday: 'narrow' }));

  const cmp = (a: { y: number; m: number }, b: { y: number; m: number }) => a.y - b.y || a.m - b.m;
  const minCursor = { y: planStartD.getFullYear(), m: planStartD.getMonth() };
  const maxCursor = { y: examD.getFullYear(), m: examD.getMonth() };
  const canPrev = cmp(cursor, minCursor) > 0;
  const canNext = cmp(cursor, maxCursor) < 0;

  const firstPlanIdxInMonth = (y: number, m: number): number | null => {
    const a = Math.max(0, daysBetween(planStartD, new Date(y, m, 1)));
    const b = Math.min(D - 1, daysBetween(planStartD, new Date(y, m + 1, 0)));
    return a <= b ? a : null;
  };
  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    const nc = { y: d.getFullYear(), m: d.getMonth() };
    setCursor(nc);
    const idx = firstPlanIdxInMonth(nc.y, nc.m);
    if (idx != null) setSelectedIdx(idx);
  };
  const selectDay = (date: Date) => {
    const idx = daysBetween(planStartD, date);
    if (idx < 0 || idx >= D) return;
    setSelectedIdx(idx);
    if (date.getMonth() !== cursor.m || date.getFullYear() !== cursor.y) setCursor({ y: date.getFullYear(), m: date.getMonth() });
  };

  const dayTasksDone = (idx: number): { total: number; doneCount: number } => {
    const dp = buildDay(idx, examDate, planStart, subjects, trees, weak);
    return { total: dp.tasks.length, doneCount: dp.tasks.filter((tk) => done[tk.id]).length };
  };

  const daysCompleteCount = useMemo(() => {
    if (!treesReady) return 0;
    let n = 0;
    for (let i = 0; i < D; i++) {
      const { total, doneCount } = dayTasksDone(i);
      if (total > 0 && doneCount === total) n++;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [D, examDate, subjects, trees, weak, done, treesReady]);

  const selDate = addDays(planStartD, selectedIdx);
  const day = buildDay(selectedIdx, examDate, planStart, subjects, trees, weak);
  const selStats = dayTasksDone(selectedIdx);
  const todayIdx = todayIndex(examDate, planStart);
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const examLabel = examD.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="mx-auto max-w-lg">
      {/* exam countdown + subjects + progress */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <div className="text-2xl font-extrabold text-white">{dte <= 0 ? t('examDayLabel') : t('daysToExamLabel', { n: dte })}</div>
        <div className="text-xs text-slate-400">EJU · {examLabel}</div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
          <span>{t('planRange', { start: planStartD.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })}</span>
          {todayIdx > 0 ? (
            <button type="button" onClick={restartPlan} className="rounded-full bg-white/5 px-2 py-0.5 font-medium text-slate-400 ring-1 ring-white/10 hover:bg-white/10">
              {t('restartPlan')}
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSubject(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition ${subjects.includes(s) ? 'bg-indigo-500 text-white ring-indigo-400' : 'bg-white/5 text-slate-400 ring-white/10'}`}
            >
              {t(s)}
            </button>
          ))}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${D ? (daysCompleteCount / D) * 100 : 0}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-slate-500">{t('daysComplete', { done: daysCompleteCount, total: D })}</div>
      </div>

      {/* month navigator */}
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shiftMonth(-1)} disabled={!canPrev} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-bold capitalize">{monthLabel}</div>
        <button type="button" onClick={() => shiftMonth(1)} disabled={!canNext} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* weekday header */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-slate-500">
        {weekdayNames.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      {/* month grid */}
      {!treesReady ? (
        <div className="grid place-items-center py-16 text-slate-400"><SpinnerIcon className="h-5 w-5" /></div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            const idx = daysBetween(planStartD, date);
            const inMonth = date.getMonth() === cursor.m;
            const inPlan = idx >= 0 && idx < D;
            const { total, doneCount } = inPlan ? dayTasksDone(idx) : { total: 0, doneCount: 0 };
            const complete = total > 0 && doneCount === total;
            const isToday = daysBetween(today, date) === 0;
            const selected = inPlan && idx === selectedIdx;
            const numCls = !inMonth ? 'text-slate-700' : inPlan ? 'text-slate-100' : 'text-slate-600';
            const box = selected
              ? 'bg-indigo-500/20 ring-2 ring-indigo-400'
              : complete
              ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30'
              : inPlan
              ? 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08]'
              : 'ring-1 ring-transparent';
            return (
              <button
                key={i}
                type="button"
                disabled={!inPlan}
                onClick={() => selectDay(date)}
                className={`flex min-h-[2.9rem] flex-col items-center justify-center rounded-lg py-1 transition ${box} ${!inPlan ? 'cursor-default' : ''}`}
              >
                <span className={`text-sm ${isToday ? 'font-extrabold text-indigo-300' : 'font-medium'} ${numCls}`}>{date.getDate()}</span>
                {inPlan && total > 0 ? (
                  complete ? (
                    <span className="mt-0.5 text-[10px] leading-none text-emerald-400">✓</span>
                  ) : (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${doneCount > 0 ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                  )
                ) : (
                  <span className="mt-0.5 h-1.5 w-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* selected day tasks */}
      {treesReady ? (
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <div>
              <div className="text-sm font-bold">{selectedIdx === todayIdx && daysBetween(today, selDate) === 0 ? t('planToday') : selDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <div className="text-[11px] uppercase tracking-wide text-indigo-300">{t(PHASE_KEY[phaseOf(selectedIdx, D)])}</div>
            </div>
            {selStats.total ? <span className="text-[11px] text-slate-500">{selStats.doneCount}/{selStats.total}</span> : null}
          </div>

          <div className="space-y-2">
            {selStats.total > 0 && selStats.doneCount === selStats.total ? (
              <p className="rounded-xl bg-emerald-500/15 px-3 py-2 text-center text-sm font-medium text-emerald-200">{t('allDoneToday')}</p>
            ) : null}
            {day.tasks.map((task) => {
              const isDone = !!done[task.id];
              const title = task.nodeId ? task.label : task.kind === 'mock' ? t('mixedMock', { subject: t(task.subject) }) : t('mixedQuiz', { subject: t(task.subject) });
              return (
                <div key={task.id} className={`flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 transition ${isDone ? 'opacity-60 ring-white/5' : 'ring-white/10'}`}>
                  <button type="button" onClick={() => toggleTask(task.id)} aria-label="toggle done" className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${isDone ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-white/25 text-transparent hover:border-white/50'}`}>✓</button>
                  <button type="button" onClick={() => runTask(task)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${KIND_CLS[task.kind]}`}>{t(KIND_KEY[task.kind])}</span>
                    <span className="shrink-0 text-[10px] uppercase text-slate-500">{t(task.subject)}</span>
                    <span className={`min-w-0 flex-1 truncate text-sm font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{title}</span>
                  </button>
                </div>
              );
            })}
            {day.tasks.length === 0 ? <p className="py-8 text-center text-sm italic text-slate-500">{t('restDay')}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
