import { useBoard } from '../lib/board';
import { useUI } from '../lib/ui';
import { useT } from '../i18n';
import { resetView } from '../whiteboard/view';
import NotebookButton from './NotebookButton';
import {
  ChevronLeft,
  ChevronRight,
  PlusIcon,
  TrashIcon,
  ResetIcon,
  CalendarIcon,
} from './icons';

export default function PageBar() {
  const t = useT();
  // Select only primitives so this bar does NOT re-render on every drawn stroke.
  const total = useBoard((s) => s.pages.length);
  const index = useBoard((s) => s.pages.findIndex((p) => p.id === s.currentPageId));
  const currentPageId = useBoard((s) => s.currentPageId);
  const goToPage = useBoard((s) => s.goToPage);
  const addPage = useBoard((s) => s.addPage);
  const deletePage = useBoard((s) => s.deletePage);
  const toggleMindmap = useUI((s) => s.toggleMindmap);

  const go = (delta: number) => {
    const st = useBoard.getState();
    const next = st.pages[index + delta];
    if (next) goToPage(next.id);
  };

  return (
    <div className="bottom-bar-safe pointer-events-auto absolute left-1/2 flex max-w-[96vw] -translate-x-1/2 items-center gap-1 rounded-2xl bg-white/90 p-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur">
      <button
        type="button"
        title={t('studyPlan')}
        aria-label={t('studyPlan')}
        onClick={toggleMindmap}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <CalendarIcon />
      </button>

      <span className="mx-1 h-7 w-px bg-slate-200" />

      <NotebookButton />

      <span className="mx-1 h-7 w-px bg-slate-200" />

      <button
        type="button"
        title={t('resetView')}
        aria-label={t('resetView')}
        onClick={resetView}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <ResetIcon />
      </button>

      <span className="mx-1 h-7 w-px bg-slate-200" />

      <button
        type="button"
        title="prev"
        aria-label="previous page"
        disabled={index <= 0}
        onClick={() => go(-1)}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronLeft />
      </button>

      <div className="min-w-[64px] select-none px-1.5 text-center text-sm font-medium text-slate-700">
        {t('pageOf', { n: index + 1, total })}
      </div>

      <button
        type="button"
        title="next"
        aria-label="next page"
        disabled={index >= total - 1}
        onClick={() => go(1)}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronRight />
      </button>

      <span className="mx-1 h-7 w-px bg-slate-200" />

      <button
        type="button"
        title={t('addPage')}
        aria-label={t('addPage')}
        onClick={() => addPage()}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <PlusIcon />
      </button>
      <button
        type="button"
        title={t('deletePage')}
        aria-label={t('deletePage')}
        onClick={() => deletePage(currentPageId)}
        className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
