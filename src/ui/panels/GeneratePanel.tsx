import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import QuestionCard from '../QuestionCard';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import {
  fetchTopics,
  generateQuestions,
  type Difficulty,
  type GenQuestion,
} from '../../lib/api';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { usePinned } from '../../lib/pinned';
import { useProgress, summarize, focusFromSummary } from '../../lib/userdata';
import { useT } from '../../i18n';

export default function GeneratePanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const wantFocus = usePractice((s) => s.wantFocus);
  const setWantFocus = usePractice((s) => s.setWantFocus);
  const attempts = useProgress((s) => s.attempts);
  const pinMany = usePinned((s) => s.pinMany);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [subtopics, setSubtopics] = useState<{ id: string; name: string; group: string }[]>([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(3);
  const [focus, setFocus] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Physics & Chemistry use specific sub-topics; others use broad topics.
  const useSub = subject === 'physics' || subject === 'chemistry';
  const subjectAttempts = useMemo(() => attempts.filter((a) => a.subject === subject), [attempts, subject]);
  const hasWeakData = subjectAttempts.length > 0;

  // Honor "practice my weak points" coming from the Progress panel.
  useEffect(() => {
    if (wantFocus) {
      setFocus(true);
      setWantFocus(false);
    }
  }, [wantFocus, setWantFocus]);

  useEffect(() => {
    let alive = true;
    setTopic('');
    fetchTopics({ subject, lang })
      .then((r) => {
        if (!alive) return;
        setTopics(r.topics);
        setSubtopics(r.subtopics ?? []);
        // Default to a specific category rather than "mixed".
        const us = subject === 'physics' || subject === 'chemistry';
        const first = (us ? r.subtopics?.[0]?.id : r.topics?.[0]?.id) ?? '';
        setTopic(first);
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

  const grouped = useMemo(() => {
    const m = new Map<string, { id: string; name: string }[]>();
    for (const s of subtopics) {
      if (!m.has(s.group)) m.set(s.group, []);
      m.get(s.group)!.push({ id: s.id, name: s.name });
    }
    return [...m.entries()];
  }, [subtopics]);

  const run = async () => {
    setBusy(true);
    setErr(null);
    try {
      const focusPayload =
        focus && hasWeakData ? focusFromSummary(summarize(subjectAttempts)) : undefined;
      const res = await generateQuestions({
        subject,
        lang,
        topic: focusPayload ? undefined : topic || undefined,
        difficulty,
        count,
        focus: focusPayload,
      });
      setQuestions(res.questions);
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title={t('generateTitle')}
      footer={
        <PrimaryButton onClick={() => void run()} busy={busy}>
          {questions.length ? t('newSet') : t('generateBtn')}
        </PrimaryButton>
      }
    >
      <SubjectChips />

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>{t('topic')}</Label>
          <select
            value={topic}
            disabled={focus && hasWeakData}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:opacity-50"
          >
            {useSub
              ? grouped.map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              : topics.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.name}
                  </option>
                ))}
            <option value="">{t('mixedTopics')}</option>
          </select>
        </div>
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

      {err ? <ErrorNote>{err}</ErrorNote> : null}

      {questions.length ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => pinMany(subject, questions)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            📌 {t('pinAll')}
          </button>
        </div>
      ) : null}

      <div className="mt-3 space-y-3">
        {questions.map((q, i) => (
          <QuestionCard key={q.id} subject={subject} q={q} label={i + 1} />
        ))}
      </div>
    </Panel>
  );
}
