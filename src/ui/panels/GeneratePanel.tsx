import { useEffect, useState } from 'react';
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
import { useT } from '../../i18n';

export default function GeneratePanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const closePanel = useUI((s) => s.closePanel);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(3);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setTopic('');
    fetchTopics({ subject, lang })
      .then((r) => alive && setTopics(r.topics))
      .catch(() => alive && setTopics([]));
    return () => {
      alive = false;
    };
  }, [subject, lang]);

  const run = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await generateQuestions({
        subject,
        lang,
        topic: topic || undefined,
        difficulty,
        count,
      });
      setQuestions(res.questions);
      setRevealed(new Set());
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

  const practice = (q: GenQuestion) => {
    const choices = q.choices?.length ? '\n' + q.choices.join('\n') : '';
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
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">{t('anyTopic')}</option>
            {topics.map((tp) => (
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

      {err ? <ErrorNote>{err}</ErrorNote> : null}

      <div className="mt-4 space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {i + 1}. {q.topic}
              </span>
            </div>
            <Markdown text={q.prompt} />
            {q.choices?.length ? (
              <ol className="mt-2 ml-5 list-[upper-alpha] space-y-1 text-sm text-slate-700">
                {q.choices.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ol>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggle(q.id)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                {revealed.has(q.id) ? t('hideAnswer') : t('showAnswer')}
              </button>
              <button
                type="button"
                onClick={() => practice(q)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                {t('practiceThis')}
              </button>
            </div>

            {revealed.has(q.id) ? (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                <div className="mb-1 text-sm font-semibold text-emerald-800">{q.answer}</div>
                <Markdown text={q.explanation} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
