import { useEffect, useState } from 'react';
import Panel from '../Panel';
import QuestionCard from '../QuestionCard';
import ExamRunner from '../ExamRunner';
import { ErrorNote, errorMessage } from '../atoms';
import { SpinnerIcon, ChevronLeft, TrashIcon } from '../icons';
import { fetchExams, fetchExam, type ExamMeta, type Exam, type GenQuestion, type GeneratedExam, type MockDifficulty } from '../../lib/api';
import { usePinned } from '../../lib/pinned';
import { useMockExams } from '../../lib/mockexams';
import { useUI, type Subject } from '../../lib/ui';
import { useT, type TFunc } from '../../i18n';

type Open =
  | { kind: 'past'; exam: Exam }
  | { kind: 'gen'; exam: GeneratedExam };

/** Minutes for one subject: science is 80 min for two subjects, mathematics 80 min. */
const minutesFor = (subject: Subject) => (subject === 'math' ? 80 : 40);
const MOCK_SUBJECTS: Subject[] = ['physics', 'chemistry', 'math'];

export default function ExamsPanel() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const uiSubject = useUI((s) => s.subject);
  const pinMany = usePinned((s) => s.pinMany);
  const generated = useMockExams((s) => s.exams);
  const results = useMockExams((s) => s.results);

  const [exams, setExams] = useState<ExamMeta[]>([]);
  const [open, setOpen] = useState<Open | null>(null);
  const [mode, setMode] = useState<'overview' | 'browse' | 'timed'>('overview');
  const [loadingList, setLoadingList] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchExams()
      .then((r) => alive && setExams(r.exams))
      .catch((e) => alive && setErr(errorMessage(e, t)))
      .finally(() => alive && setLoadingList(false));
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openPast = async (id: string) => {
    setBusy(true);
    setErr(null);
    try {
      setOpen({ kind: 'past', exam: await fetchExam(id, lang) });
      setMode('overview');
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  // ── One exam ──
  if (open) {
    const ex = open.exam;
    const questions = ex.questions as (GenQuestion & { number?: number; block?: string })[];
    const minutes = open.kind === 'gen' ? open.exam.minutes : minutesFor(ex.subject);
    const title = open.kind === 'gen' ? genTitle(open.exam, t) : ex.title;
    const res = results[ex.id];
    const back = () => {
      setOpen(null);
      setMode('overview');
    };
    if (mode === 'timed') {
      return (
        <Panel title={title}>
          <ExamRunner examId={ex.id} title={title} subject={ex.subject} minutes={minutes} questions={questions} onExit={() => setMode('overview')} />
        </Panel>
      );
    }
    return (
      <Panel title={title}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={mode === 'browse' ? () => setMode('overview') : back} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ChevronLeft className="h-4 w-4" /> {t('backToExams')}
          </button>
          <button
            type="button"
            onClick={() => pinMany(ex.subject, questions)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            📌 {t('pinAll')}
          </button>
        </div>
        {open.kind === 'past' && open.exam.source ? <p className="mb-3 text-[11px] text-slate-400">{open.exam.source}</p> : null}

        {mode === 'overview' ? (
          <div className="space-y-3">
            {open.kind === 'gen' ? <Blueprint exam={open.exam} t={t} /> : null}
            {res ? <p className="text-sm font-medium text-slate-600">{t('lastScore', { c: res.correct, t: res.total })}</p> : null}
            <button type="button" onClick={() => setMode('timed')} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
              ⏱ {t('startTimed', { n: minutes })}
            </button>
            <button type="button" onClick={() => setMode('browse')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {t('reviewQuestions')} · {t('questionsCount', { n: questions.length })}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard key={q.id} subject={ex.subject} q={q} label={q.number ?? i + 1} />
            ))}
          </div>
        )}
      </Panel>
    );
  }

  // ── Choosing an exam ──
  const years = [...new Set(exams.map((e) => e.year))].sort((a, b) => b - a);
  return (
    <Panel title={t('examsTitle')}>
      <Generator t={t} defaultSubject={MOCK_SUBJECTS.includes(uiSubject) ? uiSubject : 'physics'} />

      {generated.length ? (
        <div className="mb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('yourExams')}</div>
          <div className="space-y-2">
            {generated.map((g) => (
              <div key={g.id} className="flex items-stretch gap-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setOpen({ kind: 'gen', exam: g });
                    setMode('overview');
                  }}
                  className="min-w-0 flex-1 px-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className="block truncate text-sm font-semibold text-slate-800">{genTitle(g, t)}</span>
                  <span className="block text-xs text-slate-400">
                    {new Date(g.generatedAt).toLocaleDateString()} · {t('questionsCount', { n: g.questions.length })}
                    {results[g.id] ? ` · ${t('lastScore', { c: results[g.id].correct, t: results[g.id].total })}` : ''}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={t('deleteExam')}
                  title={t('deleteExam')}
                  onClick={() => useMockExams.getState().remove(g.id)}
                  className="shrink-0 px-2.5 text-slate-300 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('pastPapers')}</div>
      {err ? <ErrorNote>{err}</ErrorNote> : null}
      {loadingList || busy ? (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
          <SpinnerIcon className="h-4 w-4" /> {t('loading')}
        </div>
      ) : exams.length === 0 ? (
        <p className="text-sm italic text-slate-400">{t('noExams')}</p>
      ) : (
        <div className="space-y-5">
          {years.map((year) => (
            <div key={year}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{year}</div>
              <div className="space-y-2">
                {exams
                  .filter((e) => e.year === year)
                  .map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => void openPast(e.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {t(e.subject)} · {t('sessionLabel', { n: e.session })}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {e.title}
                          {results[e.id] ? ` · ${t('lastScore', { c: results[e.id].correct, t: results[e.id].total })}` : ''}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        {t('questionsCount', { n: e.count })}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function genTitle(g: GeneratedExam, t: TFunc) {
  const diff = g.difficulty === 'easy' ? t('diffEasier') : g.difficulty === 'hard' ? t('diffHarder') : t('diffLikeExam');
  return `${t(g.subject)}${g.course ? ` · ${t('courseLabel', { n: g.course })}` : ''} · ${diff}`;
}

function Blueprint({ exam, t }: { exam: GeneratedExam; t: TFunc }) {
  const years = exam.basedOn.map((p) => Number(p.slice(0, 4))).filter(Boolean);
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('examCovers')}</div>
      <ul className="space-y-1 text-sm">
        {exam.blueprint.map((b) => (
          <li key={b.id}>
            <span className="font-semibold text-slate-800">
              {b.name}
              {b.count > 1 ? ` ×${b.count}` : ''}
            </span>
            <span className="text-slate-600"> — {[...new Set(b.topics)].join(', ')}</span>
          </li>
        ))}
      </ul>
      {years.length ? (
        <p className="mt-2 text-xs text-slate-500">{t('basedOnPapers', { n: exam.basedOn.length, from: Math.min(...years), to: Math.max(...years) })}</p>
      ) : null}
      {exam.missing.length ? <p className="mt-2 text-xs font-medium text-amber-700">{t('examMissing', { list: exam.missing.join(', ') })}</p> : null}
    </div>
  );
}

function Generator({ t, defaultSubject }: { t: TFunc; defaultSubject: Subject }) {
  const busy = useMockExams((s) => s.busy);
  const error = useMockExams((s) => s.error);
  const run = useMockExams((s) => s.run);
  const clearError = useMockExams((s) => s.clearError);
  const [subject, setSubject] = useState<Subject>(defaultSubject);
  const [difficulty, setDifficulty] = useState<MockDifficulty>('exam');
  const [course, setCourse] = useState<1 | 2>(2);
  const chip = (on: boolean) =>
    `rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${on ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`;
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 p-3">
      <div className="text-sm font-semibold text-slate-800">{t('genExamTitle')}</div>
      <p className="mb-2 text-xs text-slate-500">{t('genExamHint')}</p>
      <div className="mb-2 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {MOCK_SUBJECTS.map((s) => (
          <button key={s} type="button" onClick={() => setSubject(s)} className={chip(subject === s)}>
            {t(s)}
          </button>
        ))}
      </div>
      {subject === 'math' ? (
        <div className="mb-2 flex gap-1 rounded-xl bg-slate-100 p-1">
          {([1, 2] as const).map((c) => (
            <button key={c} type="button" onClick={() => setCourse(c)} className={`flex-1 ${chip(course === c)}`}>
              {t('courseLabel', { n: c })}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1">
        {(['easy', 'exam', 'hard'] as const).map((d) => (
          <button key={d} type="button" onClick={() => setDifficulty(d)} className={`flex-1 ${chip(difficulty === d)}`}>
            {d === 'easy' ? t('diffEasier') : d === 'hard' ? t('diffHarder') : t('diffLikeExam')}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void run({ subject, difficulty, ...(subject === 'math' ? { course } : {}) })}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? <SpinnerIcon className="h-4 w-4" /> : null}
        {busy ? t('genExamWorking') : t('genExamBtn')}
      </button>
      {error ? (
        <div className="mt-2" onClick={clearError}>
          <ErrorNote>{errorMessage(error, t)}</ErrorNote>
        </div>
      ) : null}
    </div>
  );
}
