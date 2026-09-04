import { useMemo } from 'react';
import Panel, { SubjectChips } from '../Panel';
import { Label } from '../atoms';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { useAnswers } from '../../lib/answers';
import { useProgress, summarize } from '../../lib/userdata';
import { errorTagLabel } from '../../lib/labels';
import { useT } from '../../i18n';
import { TREES } from '../../data/notes';

export default function ProgressPanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const openPanel = useUI((s) => s.openPanel);
  const setWantFocus = usePractice((s) => s.setWantFocus);
  const attempts = useProgress((s) => s.attempts);
  const resetProgress = useProgress((s) => s.reset);
  const clearAnswers = useAnswers((s) => s.clear);
  // Weak-topic rows link to the matching study note (matched by English name).
  const noteFor = (topic: string) => {
    for (const tp of TREES[subject]) for (const st of tp.subtopics) if (st.name.en === topic) return st.id;
    return null;
  };
  const openNote = (id: string) => {
    usePractice.getState().setWantNote({ subject, id });
    openPanel('plan');
  };
  const reset = () => {
    resetProgress();
    clearAnswers();
  };

  const mine = useMemo(() => attempts.filter((a) => a.subject === subject), [attempts, subject]);
  const sum = useMemo(() => summarize(mine), [mine]);
  const overall = sum.total ? Math.round((sum.correct / sum.total) * 100) : 0;

  const startFocus = () => {
    setWantFocus(true);
    openPanel('generate');
  };

  return (
    <Panel title={t('progressTitle')}>
      <SubjectChips />

      {sum.total === 0 ? (
        <p className="text-sm italic text-slate-400">{t('noProgress')}</p>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="text-xs uppercase tracking-wide text-slate-300">{t('overallAccuracy')}</div>
            <div className="mt-1 text-3xl font-bold">{overall}%</div>
            <div className="text-xs text-slate-400">
              {sum.correct}/{sum.total} {t('attemptsLabel')}
            </div>
          </div>

          <div>
            <Label>{t('byTopic')}</Label>
            <ul className="space-y-2">
              {sum.topics.map((tp) => {
                const pct = Math.round(tp.acc * 100);
                const tone = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <li key={tp.topic}>
                    <div className="mb-0.5 flex items-center justify-between text-sm">
                      {noteFor(tp.topic) ? (
                        <button
                          type="button"
                          onClick={() => openNote(noteFor(tp.topic)!)}
                          className="min-w-0 truncate pr-2 text-left text-slate-700 hover:text-indigo-700 hover:underline"
                          title={t('openNote')}
                        >
                          📖 {tp.topic}
                        </button>
                      ) : (
                        <span className="min-w-0 truncate pr-2 text-slate-700">{tp.topic}</span>
                      )}
                      <span className="shrink-0 text-xs text-slate-400">
                        {tp.correct}/{tp.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {sum.tags.length ? (
            <div>
              <Label>{t('commonMistakes')}</Label>
              <div className="flex flex-wrap gap-2">
                {sum.tags.map((tg) => (
                  <span
                    key={tg.tag}
                    className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-100"
                  >
                    {errorTagLabel(tg.tag, t)} · {tg.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={startFocus}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {t('practiceWeak')}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            >
              {t('resetProgress')}
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
