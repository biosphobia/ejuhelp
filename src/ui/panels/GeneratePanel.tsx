import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import Markdown from '../Markdown';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import {
  fetchTopics,
  generateQuestions,
  type Difficulty,
  type GenQuestion,
} from '../../lib/api';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { useProgress, summarize, focusFromSummary } from '../../lib/userdata';
import { useT } from '../../i18n';

const LETTERS = 'ABCDE';

export default function GeneratePanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const closePanel = useUI((s) => s.closePanel);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);
  const wantFocus = usePractice((s) => s.wantFocus);
  const setWantFocus = usePractice((s) => s.setWantFocus);
  const addAttempt = useProgress((s) => s.addAttempt);
  const attempts = useProgress((s) => s.attempts);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [subtopics, setSubtopics] = useState<{ id: string; name: string; group: string }[]>([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(3);
  const [focus, setFocus] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Record<string, number>>({});
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
      setRevealed(new Set());
      setPicked({});
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setRevealed((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const pick = (q: GenQuestion, idx: number) => {
    if (picked[q.id] !== undefined) return; // answer once
    const correct = idx === q.answerIndex;
    setPicked((p) => ({ ...p, [q.id]: idx }));
    setRevealed((prev) => new Set(prev).add(q.id));
    addAttempt({ subject, topic: q.topic || subject, correct, source: 'quiz' });
  };

  const practice = (q: GenQuestion) => {
    const choices = q.choices?.length
      ? '\n' + q.choices.map((c, i) => `${LETTERS[i]}. ${c}`).join('\n')
      : '';
    setActiveQuestion(`${q.prompt}${choices}`);
    closePanel();
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
            <option value="">{t('anyTopic')}</option>
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

      <div className="mt-4 space-y-3">
        {questions.map((q, i) => {
          const chosen = picked[q.id];
          const answered = chosen !== undefined;
          const mcq = (q.choices?.length ?? 0) > 0 && q.answerIndex >= 0;
          return (
            <div key={q.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {i + 1}. {q.topic}
              </div>
              <Markdown text={q.prompt} />

              {mcq ? (
                <div className="mt-2 space-y-1.5">
                  {q.choices!.map((c, idx) => {
                    const isAnswer = idx === q.answerIndex;
                    const isChosen = chosen === idx;
                    let cls = 'border-slate-200 hover:bg-slate-50';
                    if (answered && isAnswer) cls = 'border-emerald-300 bg-emerald-50';
                    else if (answered && isChosen) cls = 'border-red-300 bg-red-50';
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={answered}
                        onClick={() => pick(q, idx)}
                        className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${cls}`}
                      >
                        <span className="font-semibold text-slate-500">{LETTERS[idx]}</span>
                        <span className="flex-1">{c}</span>
                      </button>
                    );
                  })}
                  {!answered ? (
                    <p className="pt-1 text-xs italic text-slate-400">{t('selectAnswer')}</p>
                  ) : (
                    <p
                      className={`pt-1 text-sm font-semibold ${chosen === q.answerIndex ? 'text-emerald-700' : 'text-red-600'}`}
                    >
                      {chosen === q.answerIndex ? t('correctMark') : t('incorrectMark')}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {!mcq ? (
                  <button
                    type="button"
                    onClick={() => toggle(q.id)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    {revealed.has(q.id) ? t('hideAnswer') : t('showAnswer')}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => practice(q)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {t('practiceThis')}
                </button>
              </div>

              {revealed.has(q.id) ? (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="mb-1 text-sm font-semibold text-emerald-800">
                    {t('correctAnswerLabel')}: {q.answer}
                  </div>
                  <Markdown text={q.explanation} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
