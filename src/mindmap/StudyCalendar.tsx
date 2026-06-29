import { useEffect, useMemo, useState } from 'react';
import { useUI, SUBJECTS, type Subject } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useGenerated } from '../lib/generated';
import { useStudyMap, nodeStat, type OpenNode } from '../lib/studymap';
import { buildDay, totalDays, phaseOf, type CalTask, type Phase } from '../lib/calendar';
import { useT } from '../i18n';
import { ChevronLeft, ChevronRight, SpinnerIcon } from '../ui/icons';

const PHASE_LABEL: Record<Phase, string> = { learn: 'Learn & build', drill: 'Drill & master', sprint: 'Exam sprint' };
const KIND_META: Record<CalTask['kind'], { label: string; cls: string }> = {
  learn: { label: 'Learn', cls: 'bg-sky-500/20 text-sky-200' },
  review: { label: 'Review', cls: 'bg-violet-500/20 text-violet-200' },
  drill: { label: 'Drill', cls: 'bg-amber-500/20 text-amber-100' },
  quiz: { label: 'Quiz', cls: 'bg-indigo-500/20 text-indigo-100' },
  mock: { label: 'Mock set', cls: 'bg-rose-500/20 text-rose-100' },
};

/** The EJU study calendar: a daily, progressive plan from today to the exam date,
 *  computed entirely on the client. Tapping a task opens the topic (study sheet +
 *  practice) or starts a mixed drill. */
export default function StudyCalendar({ onOpen }: { onOpen: (n: OpenNode) => void }) {
  const t = useT();
  const examDate = useStudyMap((s) => s.examDate);
  const planSubjects = useStudyMap((s) => s.planSubjects);
  const setExam = useStudyMap((s) => s.setExam);
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

  const [dayIndex, setDayIndex] = useState(0);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    for (const s of planSubjects) void ensureTree(s);
  }, [planSubjects, ensureTree]);

  // Weak nodes (for prioritizing drills/quizzes), keyed `${subject}:${id}`.
  const weakIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of planSubjects) {
      for (const top of trees[s] ?? []) {
        for (const sub of top.subs) {
          if (nodeStat(s, sub.id).level === 'weak') set.add(`${s}:${sub.id}`);
        }
      }
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planSubjects, trees, useStudyMap((s) => s.rev), useProgress((s) => s.rev)]);

  if (!examDate || !planSubjects.length || setup) {
    return <Setup initialDate={examDate} initialSubjects={planSubjects} onSave={(d, s) => { setExam(d, s); setSetup(false); setDayIndex(0); }} onCancel={examDate ? () => setSetup(false) : undefined} />;
  }

  const D = totalDays(examDate);
  const treesReady = planSubjects.every((s) => trees[s]);
  const day = buildDay(dayIndex, examDate, planSubjects, trees, weakIds);
  const dayDone = day.tasks.length > 0 && day.tasks.every((t) => done[t.id]);

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
    // mixed quiz / mock: open the generator on the board with the relevant topics.
    setSubject(task.subject);
    const ids = task.topicIds?.length ? task.topicIds : (trees[task.subject] ?? []).flatMap((tt) => tt.subs.map((x) => x.id));
    setSelected(task.subject, ids);
    setMode('board');
    openPanel('generate');
  };

  // overall progress across the whole plan (days whose tasks are all complete)
  const daysComplete = countDoneDays(examDate, planSubjects, trees, weakIds, done, D);

  return (
    <div className="mx-auto max-w-3xl">
      {/* exam countdown + progress */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-2xl font-extrabold text-white">{day.daysToExam <= 0 ? 'Exam day!' : `${day.daysToExam} days to EJU`}</div>
            <div className="text-xs text-slate-400">Exam {new Date(examDate + 'T00:00:00').toLocaleDateString()} · {planSubjects.map((s) => t(s)).join(' · ')}</div>
          </div>
          <button type="button" onClick={() => setSetup(true)} className="rounded-lg px-2.5 py-1.5 text-xs text-slate-300 ring-1 ring-white/15 hover:bg-white/5">Edit</button>
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
          const dd = buildDay(di, examDate, planSubjects, trees, weakIds);
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

function countDoneDays(
  examDate: string,
  subjects: Subject[],
  trees: Parameters<typeof buildDay>[3],
  weakIds: Set<string>,
  done: Record<string, true>,
  D: number
): number {
  let n = 0;
  for (let i = 0; i < D; i++) {
    const d = buildDay(i, examDate, subjects, trees, weakIds);
    if (d.tasks.length > 0 && d.tasks.every((t) => done[t.id])) n++;
  }
  return n;
}

function Setup({
  initialDate,
  initialSubjects,
  onSave,
  onCancel,
}: {
  initialDate: string | null;
  initialSubjects: Subject[];
  onSave: (date: string, subjects: Subject[]) => void;
  onCancel?: () => void;
}) {
  const t = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initialDate ?? '');
  const [subs, setSubs] = useState<Subject[]>(initialSubjects.length ? initialSubjects : ['math', 'physics', 'chemistry']);
  const toggle = (s: Subject) => setSubs((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const valid = date >= today && subs.length > 0;
  return (
    <div className="mx-auto max-w-md py-6">
      <h2 className="text-lg font-bold">Set up your EJU plan</h2>
      <p className="mt-1 text-sm text-slate-400">A daily, progressive plan from today to your exam — built to cover and reinforce every topic.</p>

      <label className="mt-5 block text-sm font-medium text-slate-200">EJU exam date</label>
      <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-indigo-400 [color-scheme:dark]" />

      <div className="mt-4 text-sm font-medium text-slate-200">Subjects</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button key={s} type="button" onClick={() => toggle(s)} className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${subs.includes(s) ? 'bg-indigo-500 text-white ring-indigo-400' : 'bg-white/5 text-slate-300 ring-white/10'}`}>
            {t(s)}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <button type="button" disabled={!valid} onClick={() => onSave(date, subs)} className="flex-1 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Build my plan</button>
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm text-slate-300 ring-1 ring-white/15">Cancel</button> : null}
      </div>
    </div>
  );
}
