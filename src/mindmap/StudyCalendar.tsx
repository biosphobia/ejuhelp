import { useEffect, useMemo, useState } from 'react';
import { useUI, SUBJECTS, type Subject } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useGenerated } from '../lib/generated';
import { useStudyMap, nodeStat, type OpenNode } from '../lib/studymap';
import { buildDay, totalDays, phaseOf, ejuExamDate, type CalTask, type Phase } from '../lib/calendar';
import { useT } from '../i18n';
import { ChevronLeft, ChevronRight, SpinnerIcon } from '../ui/icons';

const DEFAULT_SUBJECTS: Subject[] = ['math', 'physics', 'chemistry'];
const PHASE_LABEL: Record<Phase, string> = { learn: 'Learn & build', drill: 'Drill & master', sprint: 'Exam sprint' };
const KIND_META: Record<CalTask['kind'], { label: string; cls: string }> = {
  learn: { label: 'Learn', cls: 'bg-sky-500/20 text-sky-200' },
  review: { label: 'Review', cls: 'bg-violet-500/20 text-violet-200' },
  drill: { label: 'Drill', cls: 'bg-amber-500/20 text-amber-100' },
  quiz: { label: 'Quiz', cls: 'bg-indigo-500/20 text-indigo-100' },
  mock: { label: 'Mock set', cls: 'bg-rose-500/20 text-rose-100' },
};

/** The EJU study calendar: a daily, progressive plan from today to the (fixed) EJU date,
 *  computed entirely on the client. Tapping a task opens the topic (study sheet +
 *  practice) or starts a mixed drill. */
export default function StudyCalendar({ onOpen }: { onOpen: (n: OpenNode) => void }) {
  const t = useT();
  const planSubjects = useStudyMap((s) => s.planSubjects);
  const setPlanSubjects = useStudyMap((s) => s.setPlanSubjects);
  const done = useStudyMap((s) => s.done);
  const toggleTask = useStudyMap((s) => s.toggleTask);
  const ensureTree = useStudyMap((s) => s.ensureTree);
  const trees = useStudyMap((s) => s.trees);
  useProgress((s) => s.rev);
  useStudyMap((s) => s.rev);

  const setSubject = useUI((s) => s.setSubject);
  const setMode = useUI((s) => s.setMode);
  const openPanel = useUI((s) => s.openPanel);
  const setSelected = useGenerated((s) => s.setSelected);

  const examDate = useMemo(() => ejuExamDate(), []);
  const subjects = planSubjects.length ? planSubjects : DEFAULT_SUBJECTS;
  const [dayIndex, setDayIndex] = useState(0);

  // Seed the default subjects once so the choice is persisted/adjustable.
  useEffect(() => {
    if (!planSubjects.length) setPlanSubjects(DEFAULT_SUBJECTS);
  }, [planSubjects.length, setPlanSubjects]);

  useEffect(() => {
    for (const s of subjects) void ensureTree(s);
  }, [subjects, ensureTree]);

  const rev = useStudyMap((s) => s.rev);
  const prev = useProgress((s) => s.rev);
  // Weak nodes (for prioritizing drills/quizzes), keyed `${subject}:${id}`.
  const weakIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of subjects) {
      for (const top of trees[s] ?? []) {
        for (const sub of top.subs) if (nodeStat(s, sub.id).level === 'weak') set.add(`${s}:${sub.id}`);
      }
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, trees, rev, prev]);

  const toggleSubject = (s: Subject) => {
    const next = subjects.includes(s) ? subjects.filter((x) => x !== s) : [...subjects, s];
    if (next.length) {
      setPlanSubjects(next);
      setDayIndex((i) => i);
    }
  };

  const D = totalDays(examDate);
  const treesReady = subjects.every((s) => trees[s]);
  const day = buildDay(dayIndex, examDate, subjects, trees, weakIds);
  const dayDone = day.tasks.length > 0 && day.tasks.every((tk) => done[tk.id]);

  const resolve = (subject: Subject, id: string): OpenNode => {
    const tree = trees[subject];
    const topic = tree?.find((tt) => tt.id === id);
    if (topic) return { subject, id, label: topic.label, isTopic: true, subIds: topic.subs.map((x) => x.id) };
    const sub = tree?.flatMap((tt) => tt.subs).find((x) => x.id === id);
    return { subject, id, label: sub?.label ?? id, isTopic: false, subIds: [] };
  };

  const runTask = (task: CalTask) => {
    if (task.nodeId) {
      setSubject(task.subject);
      onOpen(resolve(task.subject, task.nodeId));
      return;
    }
    setSubject(task.subject);
    const ids = task.topicIds?.length ? task.topicIds : (trees[task.subject] ?? []).flatMap((tt) => tt.subs.map((x) => x.id));
    setSelected(task.subject, ids);
    setMode('board');
    openPanel('generate');
  };

  const daysComplete = useMemo(() => {
    let n = 0;
    for (let i = 0; i < D; i++) {
      const d = buildDay(i, examDate, subjects, trees, weakIds);
      if (d.tasks.length > 0 && d.tasks.every((tk) => done[tk.id])) n++;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [D, examDate, subjects, trees, weakIds, done]);

  const examLabel = new Date(examDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="mx-auto max-w-3xl">
      {/* exam countdown + subjects + progress */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <div className="text-2xl font-extrabold text-white">{day.daysToExam <= 0 ? 'Exam day!' : `${day.daysToExam} days to the EJU`}</div>
        <div className="text-xs text-slate-400">EJU {examLabel}</div>
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
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${D ? (daysComplete / D) * 100 : 0}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-slate-500">{daysComplete}/{D} days complete</div>
      </div>

      {/* day navigator */}
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={() => setDayIndex((i) => Math.max(0, i - 1))} disabled={dayIndex <= 0} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-sm font-bold">{dayIndex === 0 ? 'Today' : day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <div className="text-[11px] uppercase tracking-wide text-indigo-300">{PHASE_LABEL[phaseOf(dayIndex, D)]}</div>
        </div>
        <button type="button" onClick={() => setDayIndex((i) => Math.min(D - 1, i + 1))} disabled={dayIndex >= D - 1} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </button>
        {dayIndex !== 0 ? (
          <button type="button" onClick={() => setDayIndex(0)} className="rounded-lg px-2.5 py-1.5 text-xs text-slate-300 ring-1 ring-white/15 hover:bg-white/5">Today</button>
        ) : null}
      </div>

      {/* week strip */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: Math.min(D, 21) }, (_, k) => {
          const di = Math.max(0, Math.min(D - 1, dayIndex - 3)) + k;
          if (di > D - 1) return null;
          const dd = buildDay(di, examDate, subjects, trees, weakIds);
          const complete = dd.tasks.length > 0 && dd.tasks.every((tk) => done[tk.id]);
          return (
            <button
              key={di}
              type="button"
              onClick={() => setDayIndex(di)}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold ring-1 ${di === dayIndex ? 'bg-indigo-500 text-white ring-indigo-400' : complete ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/30' : 'bg-white/5 text-slate-300 ring-white/10'}`}
            >
              {di === 0 ? '•' : dd.date.getDate()}
            </button>
          );
        })}
      </div>

      {/* tasks */}
      {!treesReady ? (
        <div className="grid place-items-center py-12 text-slate-400"><SpinnerIcon className="h-5 w-5" /></div>
      ) : (
        <div className="space-y-2">
          {dayDone ? <p className="rounded-xl bg-emerald-500/15 px-3 py-2 text-center text-sm font-medium text-emerald-200">All done for this day 🎉</p> : null}
          {day.tasks.map((task) => {
            const m = KIND_META[task.kind];
            const isDone = !!done[task.id];
            const title = task.nodeId ? task.label : `Mixed ${t(task.subject)} ${task.kind === 'mock' ? 'mock set' : 'quiz'}`;
            return (
              <div key={task.id} className={`flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 transition ${isDone ? 'opacity-60 ring-white/5' : 'ring-white/10'}`}>
                <button type="button" onClick={() => toggleTask(task.id)} aria-label="toggle done" className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${isDone ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-white/25 text-transparent hover:border-white/50'}`}>✓</button>
                <button type="button" onClick={() => runTask(task)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${m.cls}`}>{m.label}</span>
                  <span className="shrink-0 text-[10px] uppercase text-slate-500">{t(task.subject)}</span>
                  <span className={`min-w-0 flex-1 truncate text-sm font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{title}</span>
                </button>
              </div>
            );
          })}
          {day.tasks.length === 0 ? <p className="py-8 text-center text-sm italic text-slate-500">Rest day — review anything you like.</p> : null}
        </div>
      )}
    </div>
  );
}
