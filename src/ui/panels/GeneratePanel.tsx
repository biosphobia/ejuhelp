import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import QuestionCard from '../QuestionCard';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import { fetchTopics, type Difficulty } from '../../lib/api';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { usePinned } from '../../lib/pinned';
import { useGenerated, MAX_SAVED } from '../../lib/generated';
import { overviewTopics } from '../../lib/ask';
import { useProgress, summarize, focusFromSummary } from '../../lib/userdata';
import { useT } from '../../i18n';
import { AskIcon, TrashIcon } from '../icons';

export default function GeneratePanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const wantFocus = usePractice((s) => s.wantFocus);
  const setWantFocus = usePractice((s) => s.setWantFocus);
  const attempts = useProgress((s) => s.attempts);

  // Saved pool — retained across sets, capped, and synced to the account. Generation
  // state also lives in the store so closing the panel mid-generation can't abort it.
  const questions = useGenerated((s) => s.questions);
  const generate = useGenerated((s) => s.generate);
  const generating = useGenerated((s) => s.generating);
  const genError = useGenerated((s) => s.genError);
  const removeQuestion = useGenerated((s) => s.removeQuestion);
  const clearQuestions = useGenerated((s) => s.clearQuestions);
  const selectedMap = useGenerated((s) => s.selected);
  const setSelected = useGenerated((s) => s.setSelected);
  const pinManyTagged = usePinned((s) => s.pinManyTagged);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [subtopics, setSubtopics] = useState<{ id: string; name: string; group: string }[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(3);
  const [focus, setFocus] = useState(false);

  const subjectAttempts = useMemo(() => attempts.filter((a) => a.subject === subject), [attempts, subject]);
  const hasWeakData = subjectAttempts.length > 0;

  const selectedIds = useMemo(() => selectedMap[subject] ?? [], [selectedMap, subject]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Honor "practice my weak points" coming from the Progress panel.
  useEffect(() => {
    if (wantFocus) {
      setFocus(true);
      setWantFocus(false);
    }
  }, [wantFocus, setWantFocus]);

  useEffect(() => {
    let alive = true;
    fetchTopics({ subject, lang })
      .then((r) => {
        if (!alive) return;
        setTopics(r.topics);
        setSubtopics(r.subtopics ?? []);
      })
      .catch(() => {
        if (!alive) return;
        setTopics([]);
        setSubtopics([]);
      });
    return () => {
      alive = false;
    };
  }, [subject, lang]);

  // Categories with their sub-topics (preserves KB order).
  const grouped = useMemo(() => {
    const m = new Map<string, { id: string; name: string }[]>();
    for (const s of subtopics) {
      if (!m.has(s.group)) m.set(s.group, []);
      m.get(s.group)!.push({ id: s.id, name: s.name });
    }
    return [...m.entries()];
  }, [subtopics]);

  const nameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const tp of topics) m[tp.id] = tp.name;
    for (const s of subtopics) m[s.id] = s.name;
    return m;
  }, [topics, subtopics]);

  const topicsLocked = focus && hasWeakData;

  const toggleId = (id: string) => {
    const next = selectedSet.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    setSelected(subject, next);
  };
  const toggleCategory = (items: { id: string }[]) => {
    const ids = items.map((i) => i.id);
    const allOn = ids.every((id) => selectedSet.has(id));
    const next = allOn
      ? selectedIds.filter((id) => !ids.includes(id))
      : [...selectedIds, ...ids.filter((id) => !selectedSet.has(id))];
    setSelected(subject, next);
  };

  const overview = () => {
    const labels = selectedIds.map((id) => nameById[id]).filter(Boolean);
    if (labels.length) overviewTopics(t(subject), labels);
  };

  const run = () => {
    const focusPayload = focus && hasWeakData ? focusFromSummary(summarize(subjectAttempts)) : undefined;
    void generate({
      subject,
      lang,
      topics: focusPayload ? undefined : selectedIds.length ? selectedIds : undefined,
      difficulty,
      count,
      focus: focusPayload,
    });
  };

  return (
    <Panel
      title={t('generateTitle')}
      footer={
        <PrimaryButton onClick={run} busy={generating}>
          {questions.length ? t('newSet') : t('generateBtn')}
        </PrimaryButton>
      }
    >
      <SubjectChips />

      <div className="flex items-center justify-between">
        <Label>{t('topics')}</Label>
        <div className="flex items-center gap-2">
          {selectedIds.length ? (
            <button
              type="button"
              onClick={() => setSelected(subject, [])}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              {t('clearTopics')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={overview}
            disabled={!selectedIds.length}
            title={t('coachOverviewHint')}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <AskIcon className="h-3.5 w-3.5" /> {t('coachOverview')}
          </button>
        </div>
      </div>

      {grouped.length ? (
        <div
          className={`mt-1 max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2 thin-scroll ${
            topicsLocked ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {grouped.map(([group, items]) => {
            const allOn = items.every((i) => selectedSet.has(i.id));
            const someOn = items.some((i) => selectedSet.has(i.id));
            return (
              <div key={group}>
                <button
                  type="button"
                  onClick={() => toggleCategory(items)}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] font-bold ${
                      allOn
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : someOn
                        ? 'border-slate-900 bg-white text-slate-900'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    {allOn ? '✓' : someOn ? '–' : ''}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group}</span>
                </button>
                <div className="mt-1 flex flex-wrap gap-1.5 pl-6">
                  {items.map((it) => {
                    const on = selectedSet.has(it.id);
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => toggleId(it.id)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {it.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-1 text-xs text-slate-500">{t('noTopicsForSubject')}</p>
      )}

      {grouped.length ? (
        <p className="mt-1.5 text-xs text-slate-500">
          {selectedIds.length ? t('topicsSelected', { n: selectedIds.length }) : t('allTopicsMixed')}
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label>{t('difficulty')}</Label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="easy">{t('diffEasy')}</option>
            <option value="medium">{t('diffMedium')}</option>
            <option value="hard">{t('diffHard')}</option>
          </select>
        </div>
        <div>
          <Label>{t('count')}</Label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        className={`mt-3 flex items-start gap-2 rounded-xl p-2 ${hasWeakData ? 'cursor-pointer hover:bg-slate-50' : 'opacity-60'}`}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={focus && hasWeakData}
          disabled={!hasWeakData}
          onChange={(e) => setFocus(e.target.checked)}
        />
        <span className="text-sm">
          <span className="font-medium text-slate-800">{t('focusWeak')}</span>
          <span className="block text-xs text-slate-500">
            {hasWeakData ? t('focusWeakHint') : t('noWeakDataShort')}
          </span>
        </span>
      </label>

      {genError ? <ErrorNote>{errorMessage(genError, t)}</ErrorNote> : null}

      {questions.length ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{t('savedCount', { n: questions.length, max: MAX_SAVED })}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pinManyTagged(questions)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              📌 {t('pinAll')}
            </button>
            <button
              type="button"
              onClick={clearQuestions}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-600"
            >
              <TrashIcon className="h-3.5 w-3.5" /> {t('clearQuestions')}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 space-y-3">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            subject={q.subject}
            q={q}
            label={i + 1}
            onRemove={() => removeQuestion(q.id)}
          />
        ))}
      </div>
    </Panel>
  );
}
