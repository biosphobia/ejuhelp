import { useEffect, useState } from 'react';
import Panel from '../Panel';
import QuestionCard from '../QuestionCard';
import { ErrorNote, errorMessage } from '../atoms';
import { SpinnerIcon, ChevronLeft } from '../icons';
import { fetchExams, fetchExam, type ExamMeta, type Exam, type GenQuestion } from '../../lib/api';
import { usePinned } from '../../lib/pinned';
import { useExamView } from '../../lib/examView';
import { useUI } from '../../lib/ui';
import { useT } from '../../i18n';

export default function ExamsPanel() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const closePanel = useUI((s) => s.closePanel);
  const pinManyTagged = usePinned((s) => s.pinManyTagged);
  const openExam = useExamView((s) => s.open);

  const [exams, setExams] = useState<ExamMeta[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
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

  const open = async (id: string) => {
    setBusy(true);
    setErr(null);
    try {
      setExam(await fetchExam(id, lang));
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  // ── Reviewing one exam ──
  if (exam) {
    const e = exam;
    const popOut = (i: number) => {
      openExam(e, i);
      closePanel();
    };
    const back = (
      <button
        type="button"
        onClick={() => setExam(null)}
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ChevronLeft className="h-4 w-4" /> {t('backToExams')}
      </button>
    );

    // PDF-backed exam: tap a question to pop the real paper onto the board and solve.
    if (e.pdfId) {
      return (
        <Panel title={e.title}>
          {back}
          <p className="mb-3 text-xs text-slate-500">{t('examSolveHint')}</p>
          {e.source ? <p className="mb-3 text-[11px] text-slate-400">{e.source}</p> : null}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {e.questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => popOut(i)}
                className="rounded-xl border border-slate-200 px-2 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50"
              >
                {(q as GenQuestion & { number?: number }).number ?? i + 1}
              </button>
            ))}
          </div>
        </Panel>
      );
    }

    // Fallback (no PDF mapped): the transcribed question cards.
    return (
      <Panel title={e.title}>
        <div className="mb-3 flex items-center justify-between gap-2">
          {back}
          <button
            type="button"
            onClick={() => pinManyTagged(e.questions.map((q) => ({ ...q, subject: e.subject })))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            📌 {t('pinAll')}
          </button>
        </div>
        {e.source ? <p className="mb-3 text-[11px] text-slate-400">{e.source}</p> : null}
        <div className="space-y-3">
          {e.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              subject={e.subject}
              q={q}
              label={(q as GenQuestion & { number?: number }).number ?? i + 1}
            />
          ))}
        </div>
      </Panel>
    );
  }

  // ── Choosing an exam ──
  const years = [...new Set(exams.map((e) => e.year))].sort((a, b) => b - a);

  return (
    <Panel title={t('examsTitle')}>
      <p className="mb-3 text-xs text-slate-500">{t('examsHint')}</p>
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
                      onClick={() => void open(e.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {t(e.subject)} · {t('sessionLabel', { n: e.session })}
                        </span>
                        <span className="block text-xs text-slate-400">{e.title}</span>
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
