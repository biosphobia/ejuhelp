import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import QuestionCard from '../QuestionCard';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import {
  fetchTopics,
  fetchPastQuestions,
  type Difficulty,
  type GenQuestion,
} from '../../lib/api';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { usePinned } from '../../lib/pinned';
import { useGenerated, noteCoreFor } from '../../lib/generated';
import { useProgress, summarize, focusFromSummary } from '../../lib/userdata';
import { useT } from '../../i18n';
import { TrashIcon, SpinnerIcon } from '../icons';

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
  // Generation lives in the store, so closing this panel (or the device sleeping)
  // never loses the questions being written.
  const genBusy = useGenerated((s) => s.busy);
  const genError = useGenerated((s) => s.error);
  const genPending = useGenerated((s) => s.pending);
  const runGenerate = useGenerated((s) => s.run);
  const clearGenError = useGenerated((s) => s.clearError);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [subtopics, setSubtopics] = useState<{ id: string; name: string; group: string }[]>([]);
  const [topic, setTopic] = useState(''); // past papers: one topic at a time
  const [picked, setPicked] = useState<string[]>([]); // AI questions: any number of topics (none = mixed)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(3);
  const [focus, setFocus] = useState(false);
  // Where questions come from: the model (EJU style) or the real past papers.
  const [source, setSource] = useState<'ai' | 'past'>('ai');
  const [pastCount, setPastCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const working = busy || genBusy;

  // Physics & Chemistry use specific sub-topics; others use broad topics.
  const useSub = subject === 'physics' || subject === 'chemistry' || subject === 'math';
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
    setPicked([]);
    fetchTopics({ subject, lang })
      .then((r) => {
        if (!alive) return;
        setTopics(r.topics);
        setSubtopics(r.subtopics ?? []);
        // Default to a specific category rather than "mixed".
        const us = subject === 'physics' || subject === 'chemistry' || subject === 'math';
        const first = (us ? r.subtopics?.[0]?.id : r.topics?.[0]?.id) ?? '';
        // A topic requested from the EJU calendar wins over the default.
        const want = usePractice.getState().wantTopic;
        const known = want && (r.subtopics?.some((x) => x.id === want) || r.topics?.some((x) => x.id === want));
        setTopic(known ? want! : first);
        setPicked(known ? [want!] : first ? [first] : []);
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
      setPicked([wantTopic]);
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
  const nameOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const x of [...topics, ...subtopics]) m.set(x.id, x.name);
    return m;
  }, [topics, subtopics]);

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
      const ids = focusPayload ? [] : picked;
      const noteCore = focusPayload ? undefined : await noteCoreFor(subject, ids, lang);
      await runGenerate({
        subject,
        topic: ids.length === 1 ? ids[0] : undefined,
        topics: ids.length > 1 ? ids : undefined,
        difficulty,
        count,
        focus: focusPayload,
        noteCore,
      });
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
        <PrimaryButton onClick={() => void run()} busy={working}>
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
                onClick={() => {
                  // Past papers are looked up one topic at a time: start from the first one picked.
                  if (k === 'past' && picked[0]) setTopic(picked[0]);
                  setSource(k);
                }}
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
        {pastMode ? (
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
            </select>
          </div>
        ) : (
          <div className="col-span-2">
            <Label>{t('topicsLabel')}</Label>
            <div className={`mb-2 flex flex-wrap gap-1.5 ${focus && hasWeakData ? 'opacity-50' : ''}`}>
              {picked.length ? (
                picked.map((id) => (
                  <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-900 py-1 pl-3 pr-1 text-xs font-medium text-white">
                    <span className="truncate">{nameOf.get(id) ?? id}</span>
                    <button
                      type="button"
                      disabled={focus && hasWeakData}
                      aria-label={t('removeTopic', { name: nameOf.get(id) ?? id })}
                      onClick={() => setPicked((p) => p.filter((x) => x !== id))}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/20 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{t('mixedTopics')}</span>
              )}
            </div>
            <select
              value=""
              disabled={focus && hasWeakData}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__mixed') setPicked([]);
                else if (v) setPicked((p) => (p.includes(v) ? p : [...p, v]));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:opacity-50"
            >
              <option value="">{t('addTopic')}</option>
              {useSub
                ? grouped.map(([group, items]) => (
                    <optgroup key={group} label={group}>
                      {items.map((s) => (
                        <option key={s.id} value={s.id} disabled={picked.includes(s.id)}>
                          {picked.includes(s.id) ? '✓ ' : ''}
                          {s.name}
                        </option>
                      ))}
                    </optgroup>
                  ))
                : topics.map((tp) => (
                    <option key={tp.id} value={tp.id} disabled={picked.includes(tp.id)}>
                      {picked.includes(tp.id) ? '✓ ' : ''}
                      {tp.name}
                    </option>
                  ))}
              {picked.length ? <option value="__mixed">{t('mixedTopics')}</option> : null}
            </select>
          </div>
        )}
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
            {[1, 2, 3, 4, 5, 10, 15, 20].map((n) => (
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
          {hasWeakData ? null : <span className="block text-xs text-slate-500">{t('noWeakDataShort')}</span>}
        </span>
      </label>
      )}

      {working ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <SpinnerIcon className="h-4 w-4" /> {genPending ? t('stillWorking') : t('loading')}
        </div>
      ) : null}
      {err ? <ErrorNote>{err}</ErrorNote> : null}
      {genError ? (
        <div onClick={clearGenError}>
          <ErrorNote>{errorMessage(genError, t)}</ErrorNote>
        </div>
      ) : null}

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
