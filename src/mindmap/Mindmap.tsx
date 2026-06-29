import { useEffect, useState } from 'react';
import { useUI, SUBJECTS, type Subject } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useStudyMap, nodeStat, LEVEL_COLOR } from '../lib/studymap';
import { useT } from '../i18n';
import { MindmapIcon, ChevronLeft, SpinnerIcon } from '../ui/icons';
import NodeDetail from './NodeDetail';
import LessonPlan, { type OpenNode } from './LessonPlan';

/** The Mindmap: an EJU topic map. Major topics → sub-topics, each colored by how the
 *  student is doing on it. Tapping a node opens its study sheet, the student's own
 *  history, the coach's strength/weakness read and a topic chat. */
export default function Mindmap() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const setSubject = useUI((s) => s.setSubject);
  const setMode = useUI((s) => s.setMode);

  const ensureTree = useStudyMap((s) => s.ensureTree);
  const tree = useStudyMap((s) => s.trees[subject]);
  const loading = useStudyMap((s) => s.loadingTree[subject]);
  // Re-render mastery colors when attempts or the matcher change.
  useProgress((s) => s.rev);
  useStudyMap((s) => s.treeLang[subject]);

  const [open, setOpen] = useState<OpenNode | null>(null);
  const [view, setView] = useState<'map' | 'plan'>('map');

  useEffect(() => {
    void ensureTree(subject);
  }, [subject, ensureTree]);

  const dot = (level: ReturnType<typeof nodeStat>['level']) => LEVEL_COLOR[level].split(' ')[0];

  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col bg-slate-950 text-slate-100">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <button type="button" onClick={() => setMode('board')} aria-label="back to board" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <MindmapIcon className="h-5 w-5 text-indigo-300" />
        <h1 className="text-base font-bold">{t('mindmapTitle')}</h1>
      </div>

      {/* subject switcher + view toggle */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 px-4 py-2">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${s === subject ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'}`}
          >
            {t(s as Subject)}
          </button>
        ))}
        <div className="ml-auto flex shrink-0 rounded-full bg-white/10 p-0.5 text-sm">
          {(['map', 'plan'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 font-medium transition ${view === v ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              {v === 'map' ? t('mindmapMap') : t('mindmapPlan')}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {view === 'plan' ? (
          <LessonPlan subject={subject} onOpen={setOpen} />
        ) : loading && !tree ? (
          <div className="grid place-items-center py-16 text-slate-400">
            <SpinnerIcon className="h-6 w-6" />
          </div>
        ) : !tree || !tree.length ? (
          <p className="py-16 text-center text-sm italic text-slate-500">{t('mindmapEmpty')}</p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {tree.map((topic) => {
              const ts = nodeStat(subject, topic.id);
              return (
                <div key={topic.id} className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                  <button
                    type="button"
                    onClick={() => setOpen({ id: topic.id, label: topic.label, isTopic: true, subIds: topic.subs.map((x) => x.id) })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot(ts.level)}`} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{topic.label}</span>
                    {ts.total ? <span className="shrink-0 text-[11px] text-slate-400">{ts.correct}/{ts.total}</span> : null}
                  </button>
                  {topic.subs.length ? (
                    <div className="flex flex-wrap gap-2 px-4 pb-3">
                      {topic.subs.map((sub) => {
                        const ss = nodeStat(subject, sub.id);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setOpen({ id: sub.id, label: sub.label, isTopic: false, subIds: [] })}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition hover:brightness-125 ${LEVEL_COLOR[ss.level]}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${dot(ss.level)}`} />
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open ? (
        <NodeDetail
          subject={subject}
          nodeId={open.id}
          label={open.label}
          isTopic={open.isTopic}
          subIds={open.subIds}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
