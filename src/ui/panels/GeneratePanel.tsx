import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import QuestionCard from '../QuestionCard';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import {
  fetchTopics,
  fetchPastQuestions,
  generateQuestions,
  type Difficulty,
  type GenQuestion,
} from '../../lib/api';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { usePinned } from '../../lib/pinned';
import { useGenerated } from '../../lib/generated';
import { useProgress, summarize, focusFromSummary } from '../../lib/userdata';
import { useT } from '../../i18n';
import { TrashIcon } from '../icons';
import { loadNotes } from '../../data/notes';

const EMPTY: GenQuestion[] = [];

export default function GeneratePanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const wantFocus = usePractice((s) => s.wantFocus);
  const setWantFocus = usePractice((s) => s.setWantFocus);
  const wantTopic = usePractice((s) => s.wantTopic);
  const setWantTopic = usePractice((s) => s.setWantTopic);
  const attempts = useProgress((s) => s.attempts);
  const pinMany = usePinned((s) => s.pinMany);
  // Generated questions live in a persisted store (device + cloud) so they
  // survive closing the panel, reloads and re-logins until the user clears them.
  const questions: GenQuestion[] = useGenerated((s) => s.sets[subject]?.questions) ?? EMPTY;
  const setQuestions = useGenerated((s) => s.setQuestions);
  const clearQuestions = useGenerated((s) => s.clear);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [subtopics, setSubtopics] = useState<{ id: string; name: string; group: string }[]>([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(3);
  const [focus, setFocus] = useState(false);
  // Where questions come from: the model (EJU style) or the real past papers.
  const [source, setSource] = useState<'ai' | 'past'>('ai');
  const [pastCount, setPastCount] = useState(10);
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
        // A topic requested from the EJU calendar wins over the default.
        const want = usePractice.getState().wantTopic;
        const known = want && (r.subtopics?.some((x) => x.id === want) || r.topics?.some((x) => x.id === want));
        setTopic(known ? want! : first);
        if (want) usePractice.getState().setWantTopic(null);
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

  // If the calendar asks for a topic while the list is already loaded, switch to it.
  useEffect(() => {
    if (!wantTopic) return;
    if (subtopics.some((x) => x.id === wantTopic) || topics.some((x) => x.id === wantTopic)) {
      setTopic(wantTopic);
      setFocus(false);
      setWantTopic(null);
    }
  }, [wantTopic, subtopics, topics, setWantTopic]);

  const grouped = useMemo(() => {
    const m = new Map<string, { id: string; name: string }[]>();
    for (const s of subtopics) {
      if (!m.has(s.group)) m.set(s.group, []);
      m.get(s.group)!.push({ id: s.id, name: s.name });
    }
    return [...m.entries()];
  }, [subtopics]);

  const pastMode = source === 'past' && useSub;

  const run = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (pastMode) {
        if (!topic) throw new Error('pick_topic');
        const res = await fetchPastQuestions({ subject, lang, topic, limit: pastCount });
        setQuestions(subject, res.questions);
        return;
      }
      const focusPayload =
        focus && hasWeakData ? focusFromSummary(summarize(subjectAttempts)) : undefined;
      // If the study notes cover this topic, hand the coach the note's core idea so
      // the questions test exactly what the student just read.
      let noteCore: string | undefined;
      if (!focusPayload && topic) {
        const data = await loadNotes(subject).catch(() => null);
        const n = data?.notes[topic];
        if (n) noteCore = n.core[lang === 'ja' ? 'ja' : 'en'];
      }
      const res = await generateQuestions({
        subject,
        lang,
        topic: focusPayload ? undefined : topic || undefined,
        difficulty,
        count,
        focus: focusPayload,
        noteCore,
      });
      setQuestions(subject, res.questions);
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
          {pastMode ? t('loadPast') : questions.length ? t('newSet') : t('generateBtn')}
        </PrimaryButton>
      }
    >
      <SubjectChips />

      {useSub ? (
        <div className="mb-3">
          <Label>{t('qSource')}</Label>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(['ai', 'past'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSource(k)}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                  source === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {k === 'ai' ? t('qSourceAi') : t('qSourcePast')}
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
            {!pastMode ? <option value="">{t('mixedTopics')}</option> : null}
          </select>
        </div>
        {pastMode ? (
          <div className="col-span-2">
            <Label>{t('count')}</Label>
            <select
              value={pastCount}
              onChange={(e) => setPastCount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              {[5, 10, 20, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div hidden={pastMode}>
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
        <div hidden={pastMode}>
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

      {pastMode ? null : (
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
      )}

      {err ? <ErrorNote>{err}</ErrorNote> : null}

      {questions.length ? (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => clearQuestions(subject)}
            title={t('clearQuestionsHint')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600"
          >
            <TrashIcon className="h-3.5 w-3.5" /> {t('clearQuestions')}
          </button>
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
