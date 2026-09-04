import { useEffect, useRef, useState } from 'react';
import { useBoard, notebookOf, NOTEBOOKS } from '../lib/board';
import { useUI, type Subject } from '../lib/ui';
import { useT } from '../i18n';
import { resetView } from '../whiteboard/view';
import { ChevronLeft, ChevronRight, PlusIcon, TrashIcon, ResetIcon } from './icons';
import PeriodicTable from './PeriodicTable';

const Btn = ({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
  >
    {children}
  </button>
);

/** Bottom bar: notebook (subject) switch, page navigation, page list with titles,
 *  and the periodic table for the chemistry notebook. */
export default function PageBar() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const setSubject = useUI((s) => s.setSubject);
  // Select only primitives so this bar does NOT re-render on every drawn stroke.
  const notebook = useBoard((s) => s.notebook);
  const currentPageId = useBoard((s) => s.currentPageId);
  const pageIds = useBoard((s) => s.pages.filter((p) => notebookOf(p) === s.notebook).map((p) => p.id).join(','));
  const title = useBoard((s) => s.pages.find((p) => p.id === s.currentPageId)?.title ?? '');
  const goToPage = useBoard((s) => s.goToPage);
  const addPage = useBoard((s) => s.addPage);
  const deletePage = useBoard((s) => s.deletePage);
  const setPageTitle = useBoard((s) => s.setPageTitle);

  const ids = pageIds ? pageIds.split(',') : [];
  const index = ids.indexOf(currentPageId);
  const total = ids.length;

  const [list, setList] = useState(false);
  const [table, setTable] = useState(false);
  const [draft, setDraft] = useState(title);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => setDraft(title), [title, currentPageId]);
  useEffect(() => {
    if (!list) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setList(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [list]);

  const go = (delta: number) => {
    const next = ids[index + delta];
    if (next) goToPage(next);
  };
  const label = title || t('pageOf', { n: index + 1, total });

  return (
    <div ref={wrap} className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
      {list ? (
        <PageList
          ids={ids}
          currentId={currentPageId}
          draft={draft}
          setDraft={setDraft}
          onRename={() => setPageTitle(currentPageId, draft)}
          onPick={(id) => {
            goToPage(id);
            setList(false);
          }}
          t={t}
        />
      ) : null}
      <div className="flex max-w-[96vw] items-center gap-0.5 rounded-2xl bg-white/85 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur">
        {/* Notebook switch */}
        <select
          value={notebook}
          aria-label={t('subject')}
          title={t('subject')}
          onChange={(e) => setSubject(e.target.value as Subject)}
          className="h-9 max-w-[8.5rem] cursor-pointer rounded-lg bg-transparent pl-2 pr-6 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-100"
        >
          {NOTEBOOKS.map((nb) => (
            <option key={nb} value={nb}>
              {t(nb)}
            </option>
          ))}
        </select>
        {subject === 'chemistry' ? (
          <button
            type="button"
            onClick={() => setTable(true)}
            title={t('periodicTable')}
            aria-label={t('periodicTable')}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-sky-100 text-[10px] font-bold text-sky-900" aria-hidden>
              Na
            </span>
          </button>
        ) : null}

        <span className="mx-0.5 h-6 w-px bg-slate-200" />

        <Btn title={t('resetView')} onClick={resetView}>
          <ResetIcon />
        </Btn>
        <Btn title="previous page" onClick={() => go(-1)} disabled={index <= 0}>
          <ChevronLeft />
        </Btn>
        <button
          type="button"
          onClick={() => setList((v) => !v)}
          title={t('pages')}
          aria-expanded={list}
          className="h-9 max-w-[9rem] min-w-[4.5rem] truncate rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {label}
        </button>
        <Btn title="next page" onClick={() => go(1)} disabled={index >= total - 1}>
          <ChevronRight />
        </Btn>

        <span className="mx-0.5 h-6 w-px bg-slate-200" />

        <Btn title={t('addPage')} onClick={addPage}>
          <PlusIcon />
        </Btn>
        <Btn title={t('deletePage')} onClick={() => deletePage(currentPageId)}>
          <TrashIcon />
        </Btn>
      </div>
      {table ? <PeriodicTable onClose={() => setTable(false)} /> : null}
    </div>
  );
}

function PageList({
  ids,
  currentId,
  draft,
  setDraft,
  onRename,
  onPick,
  t,
}: {
  ids: string[];
  currentId: string;
  draft: string;
  setDraft: (s: string) => void;
  onRename: () => void;
  onPick: (id: string) => void;
  t: ReturnType<typeof useT>;
}) {
  const pages = useBoard((s) => s.pages);
  const byId = new Map(pages.map((p) => [p.id, p]));
  return (
    <div className="selectable absolute bottom-full left-1/2 mb-2 w-72 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
      <div className="border-b border-slate-100 p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={onRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          placeholder={t('pageTitlePlaceholder')}
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <ul className="thin-scroll max-h-64 overflow-y-auto py-1">
        {ids.map((id, i) => {
          const pg = byId.get(id);
          const n = pg?.strokes.length ?? 0;
          const active = id === currentId;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onPick(id)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className={`w-5 shrink-0 text-xs tabular-nums ${active ? 'text-slate-300' : 'text-slate-400'}`}>{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{pg?.title || t('untitledPage')}</span>
                <span className={`shrink-0 text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{n ? t('strokesCount', { n }) : t('emptyPage')}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
