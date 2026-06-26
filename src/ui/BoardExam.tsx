import { Suspense, lazy, useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import { useExamView } from '../lib/examView';
import { usePractice } from '../lib/practice';
import { useT } from '../i18n';
import { ChevronLeft, ChevronRight, CloseIcon, ExamIcon, SpinnerIcon } from './icons';

// pdf.js is heavy — only pull it in when an exam is actually opened on the board.
const PdfView = lazy(() => import('./PdfView'));

const LETTERS = 'ABCDE';
const WIDTH = 460;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** A mock-exam paper popped onto the board: a draggable, zoomable per-question PDF
 *  view. The question text isn't shown (it's on the PDF), but each question still
 *  scopes the coach so Check my work / Explain grade against the right one. */
export default function BoardExam() {
  const t = useT();
  const exam = useExamView((s) => s.exam);
  const index = useExamView((s) => s.index);
  const collapsed = useExamView((s) => s.collapsed);
  const pos = useExamView((s) => s.pos);
  const setIndex = useExamView((s) => s.setIndex);
  const setCollapsed = useExamView((s) => s.setCollapsed);
  const setPos = useExamView((s) => s.setPos);
  const close = useExamView((s) => s.close);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);

  const q = exam?.questions[index];

  // Point the coach at the current question (without showing its text).
  useEffect(() => {
    if (!exam || !q) return;
    const ch = q.choices?.length ? '\n' + q.choices.map((c, k) => `${LETTERS[k]}. ${c}`).join('\n') : '';
    setActiveQuestion(`${q.prompt}${ch}`, { ...q, subject: exam.subject });
  }, [exam, index, q, setActiveQuestion]);

  if (!exam || !q) return null;

  const left = pos ? pos.x : Math.max(8, window.innerWidth - WIDTH - 16);
  const top = pos ? pos.y : 64;

  const startDrag = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const bx = left;
    const by = top;
    const move = (ev: PointerEvent) => {
      setPos({
        x: clamp(bx + (ev.clientX - sx), 4, window.innerWidth - 90),
        y: clamp(by + (ev.clientY - sy), 4, window.innerHeight - 60),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  };

  const closeAll = () => {
    setActiveQuestion(null);
    close();
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        style={{ left, top }}
        className="pointer-events-auto absolute z-20 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur"
      >
        <ExamIcon className="h-4 w-4" />
        {t('question')} {index + 1}/{exam.questions.length}
      </button>
    );
  }

  return (
    <div
      style={{ left, top, width: WIDTH, height: '78vh' }}
      className="pointer-events-auto absolute z-20 flex max-h-[88vh] max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-black/20"
    >
      <div
        onPointerDown={startDrag}
        className="flex cursor-move touch-none items-center justify-between gap-2 bg-slate-800 px-3 py-2 text-white"
      >
        <span className="min-w-0 truncate text-xs font-semibold">{exam.title}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            disabled={index <= 0}
            aria-label="previous question"
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-semibold tabular-nums">
            {index + 1}/{exam.questions.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex(index + 1)}
            disabled={index >= exam.questions.length - 1}
            aria-label="next question"
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="collapse"
            className="grid h-7 w-7 place-items-center rounded-lg text-base hover:bg-white/15"
          >
            –
          </button>
          <button
            type="button"
            onClick={closeAll}
            aria-label={t('close')}
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {exam.pdfId ? (
          <Suspense
            fallback={
              <div className="grid h-full place-items-center text-slate-400">
                <SpinnerIcon className="h-5 w-5" />
              </div>
            }
          >
            <PdfView url={`/api/eju/pdf/${exam.pdfId}`} initialPage={q.page ?? 1} />
          </Suspense>
        ) : (
          <div className="grid h-full place-items-center p-4 text-center text-sm text-slate-300">{t('pdfLoadError')}</div>
        )}
      </div>
    </div>
  );
}
