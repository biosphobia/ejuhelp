import { useEffect } from 'react';
import { type Subject } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useStudyMap, nodeStat, LEVEL_COLOR } from '../lib/studymap';
import { SpinnerIcon, ResetIcon } from '../ui/icons';

export type OpenNode = { id: string; label: string; isTopic: boolean; subIds: string[] };

/** The structured EJU lesson plan: ordered phases of topic-node lessons, prioritized by
 *  EJU weight and the student's weak points. Each lesson links to its node (study sheet
 *  + practice) and can be checked off; progress is tracked per phase and overall. */
export default function LessonPlan({ subject, onOpen }: { subject: Subject; onOpen: (n: OpenNode) => void }) {
  const ensureTree = useStudyMap((s) => s.ensureTree);
  const loadPlan = useStudyMap((s) => s.lessonPlan);
  const toggleDone = useStudyMap((s) => s.toggleDone);
  const plan = useStudyMap((s) => s.plans[subject]);
  const planBusy = useStudyMap((s) => s.busy['plan:' + subject]);
  const done = useStudyMap((s) => s.done);
  const tree = useStudyMap((s) => s.trees[subject]);
  useProgress((s) => s.rev);
  useStudyMap((s) => s.treeLang[subject]);

  useEffect(() => {
    void ensureTree(subject);
    void loadPlan(subject);
  }, [subject, ensureTree, loadPlan]);

  const resolve = (id: string): OpenNode => {
    const topic = tree?.find((t) => t.id === id);
    if (topic) return { id, label: topic.label, isTopic: true, subIds: topic.subs.map((s) => s.id) };
    const sub = tree?.flatMap((t) => t.subs).find((s) => s.id === id);
    return { id, label: sub?.label ?? id, isTopic: false, subIds: [] };
  };
  const isDone = (id: string) => !!done[`${subject}:${id}`] || nodeStat(subject, id).level === 'strong';

  const all = plan?.phases.flatMap((p) => p.lessons) ?? [];
  const total = all.length;
  const completed = all.filter((l) => isDone(l.id)).length;

  if (planBusy && !plan) {
    return (
      <div className="grid place-items-center py-16 text-slate-400">
        <SpinnerIcon className="h-6 w-6" />
        <p className="mt-3 text-sm">Building your EJU study plan…</p>
      </div>
    );
  }
  if (!plan || !plan.phases.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm italic text-slate-500">No plan yet.</p>
        <button type="button" onClick={() => void loadPlan(subject, true)} className="mt-3 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
          Build my study plan
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* overall progress */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="flex-1 text-sm font-semibold text-slate-200">Your EJU path</h2>
          <span className="text-xs text-slate-400">{completed}/{total} done</span>
          <button type="button" onClick={() => void loadPlan(subject, true)} disabled={planBusy} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-white/5 hover:text-slate-200 disabled:opacity-50">
            {planBusy ? <SpinnerIcon className="h-3 w-3" /> : <ResetIcon className="h-3 w-3" />} Rebuild
          </button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Follow it top to bottom, or jump anywhere. Prioritized for the EJU and your weak points.</p>
      </div>

      <div className="space-y-5">
        {plan.phases.map((phase, pi) => {
          const pdone = phase.lessons.filter((l) => isDone(l.id)).length;
          return (
            <div key={pi}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-200">{pi + 1}</span>
                <h3 className="flex-1 text-sm font-bold text-slate-100">{phase.title}</h3>
                <span className="text-[11px] text-slate-500">{pdone}/{phase.lessons.length}</span>
              </div>
              <div className="space-y-2">
                {phase.lessons.map((l) => {
                  const lvl = nodeStat(subject, l.id).level;
                  const checked = isDone(l.id);
                  return (
                    <div
                      key={l.id}
                      className={`flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 transition ${checked ? 'opacity-60 ring-white/5' : 'ring-white/10'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDone(subject, l.id)}
                        aria-label="toggle done"
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${checked ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-white/25 text-transparent hover:border-white/50'}`}
                      >
                        ✓
                      </button>
                      <button type="button" onClick={() => onOpen(resolve(l.id))} className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_COLOR[lvl].split(' ')[0]}`} />
                          <span className={`truncate text-sm font-semibold ${checked ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{l.label}</span>
                        </div>
                        {l.why ? <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{l.why}</p> : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
