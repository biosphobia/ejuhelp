import { useEffect, useMemo } from 'react';
import { useUI, type PanelId, type Subject } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useStudyMap, weakNodeIds } from '../lib/studymap';
import { buildDay, ejuExamDate, effectivePlanStart, todayIndex, type CalTask } from '../lib/calendar';
import { runTask } from '../mindmap/runTask';
import { useT, type StringKey } from '../i18n';
import {
  AskIcon,
  GenerateIcon,
  ExamIcon,
  TimerIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  CalendarIcon,
  ChevronRight,
} from './icons';

type Item = { id: Exclude<PanelId, null>; label: StringKey; Icon: typeof AskIcon };

const PRIMARY: Item[] = [
  { id: 'ask', label: 'askCoach', Icon: AskIcon },
  { id: 'generate', label: 'generate', Icon: GenerateIcon },
  { id: 'exams', label: 'exams', Icon: ExamIcon },
  // Weak-point/progress analysis now lives per-topic in the Mindmap.
  { id: 'timer', label: 'timer', Icon: TimerIcon },
];
const SECONDARY: Item[] = [
  { id: 'settings', label: 'settings', Icon: SettingsIcon },
  { id: 'account', label: 'account', Icon: UserIcon },
];

const DEFAULT_SUBJECTS: Subject[] = ['math', 'physics', 'chemistry'];
const KIND_KEY: Record<CalTask['kind'], StringKey> = {
  learn: 'kindLearn',
  review: 'kindReview',
  drill: 'kindDrill',
  quiz: 'kindQuiz',
  mock: 'kindMock',
};
const KIND_DOT: Record<CalTask['kind'], string> = {
  learn: 'bg-sky-400',
  review: 'bg-violet-400',
  drill: 'bg-amber-400',
  quiz: 'bg-indigo-400',
  mock: 'bg-rose-400',
};

export default function Launcher() {
  const t = useT();
  const open = useUI((s) => s.launcherOpen);
  const setOpen = useUI((s) => s.setLauncherOpen);
  const openPanel = useUI((s) => s.openPanel);
  const setMode = useUI((s) => s.setMode);

  const planSubjects = useStudyMap((s) => s.planSubjects);
  const ensureTree = useStudyMap((s) => s.ensureTree);
  const trees = useStudyMap((s) => s.trees);
  const done = useStudyMap((s) => s.done);
  const toggleTask = useStudyMap((s) => s.toggleTask);
  const rev = useStudyMap((s) => s.rev);
  const prev = useProgress((s) => s.rev);

  const subjects = planSubjects.length ? planSubjects : DEFAULT_SUBJECTS;
  const examDate = useMemo(ejuExamDate, []);
  const storedStart = useStudyMap((s) => s.planStart);
  // Same fixed anchor as the calendar, so "today's tasks" is the plan's ACTUAL current
  // day — not day 0 over and over.
  const planStart = useMemo(() => effectivePlanStart(storedStart, examDate), [storedStart, examDate]);

  // Load the taxonomy for the plan subjects so today's tasks can be built.
  useEffect(() => {
    for (const s of subjects) void ensureTree(s);
  }, [subjects, ensureTree]);

  const treesReady = subjects.every((s) => trees[s]);
  // Today's tasks (index 0), incomplete first, capped so the menu stays compact.
  const { shown, remaining, total } = useMemo(() => {
    if (!treesReady) return { shown: [] as CalTask[], remaining: 0, total: 0 };
    const weak = weakNodeIds(subjects);
    const tasks = buildDay(todayIndex(examDate, planStart), examDate, planStart, subjects, trees, weak).tasks;
    const todo = tasks.filter((tk) => !done[tk.id]);
    const doneList = tasks.filter((tk) => done[tk.id]);
    return { shown: [...todo, ...doneList].slice(0, 4), remaining: todo.length, total: tasks.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treesReady, subjects, trees, examDate, planStart, done, rev, prev]);

  const runAndClose = (task: CalTask) => {
    runTask(task);
    setOpen(false);
  };
  const openPlan = () => {
    setMode('mindmap');
    setOpen(false);
  };

  const Row = ({ id, label, Icon }: Item) => (
    <button
      type="button"
      onClick={() => openPanel(id)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="whitespace-nowrap text-sm font-medium">{t(label)}</span>
    </button>
  );

  return (
    <div className="pointer-events-auto absolute right-0 top-1/2 z-20 -translate-y-1/2 safe-pad-right">
      <div className="flex items-center">
        {/* Expanding menu */}
        <div
          className={`mr-1 overflow-hidden rounded-2xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur transition-all duration-200 ${
            open ? 'w-56 opacity-100' : 'pointer-events-none w-0 opacity-0'
          }`}
        >
          <div className="max-h-[80vh] w-56 overflow-y-auto p-2">
            {/* Today's plan */}
            <button
              type="button"
              onClick={openPlan}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-slate-100"
            >
              <CalendarIcon className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="flex-1 text-xs font-bold uppercase tracking-wide text-slate-500">{t('todaysPlan')}</span>
              {treesReady && remaining > 0 ? (
                <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-600">{remaining}</span>
              ) : null}
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            <div className="mb-1 space-y-1 px-1">
              {!treesReady ? (
                <p className="px-2 py-1.5 text-xs italic text-slate-400">…</p>
              ) : total === 0 ? (
                <p className="px-2 py-1.5 text-xs italic text-slate-400">{t('restDay')}</p>
              ) : remaining === 0 ? (
                <p className="px-2 py-1.5 text-xs font-medium text-emerald-600">{t('allDoneToday')}</p>
              ) : (
                shown.map((task) => {
                  const isDone = !!done[task.id];
                  const title = task.nodeId
                    ? task.label
                    : task.kind === 'mock'
                    ? t('mixedMock', { subject: t(task.subject) })
                    : t('mixedQuiz', { subject: t(task.subject) });
                  return (
                    <div key={task.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        aria-label="toggle done"
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[9px] ${isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}
                      >
                        ✓
                      </button>
                      <button type="button" onClick={() => runAndClose(task)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[task.kind]}`} />
                        <span className={`min-w-0 flex-1 truncate text-xs ${isDone ? 'text-slate-400 line-through' : 'font-medium text-slate-700'}`}>{title}</span>
                        <span className="shrink-0 text-[9px] uppercase text-slate-400">{t(KIND_KEY[task.kind])}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="my-1 h-px bg-slate-200" />
            {PRIMARY.map((it) => (
              <Row key={it.id} {...it} />
            ))}
            <div className="my-1 h-px bg-slate-200" />
            {SECONDARY.map((it) => (
              <Row key={it.id} {...it} />
            ))}
          </div>
        </div>

        {/* The always-present tab */}
        <button
          type="button"
          aria-label={t('menu')}
          title={t('menu')}
          onClick={() => setOpen(!open)}
          className={`grid h-14 w-9 place-items-center rounded-l-2xl shadow-lg ring-1 ring-black/5 backdrop-blur transition ${
            open ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
          }`}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
