import { useEffect, useRef, useState } from 'react';
import { useBoard, notebookOf, NOTEBOOKS, type NotebookMeta, type SubjectId } from '../lib/board';
import { useUI } from '../lib/ui';
import { useTidy } from '../lib/tidy';
import { useT, type TFunc } from '../i18n';
import { resetView } from '../whiteboard/view';
import { errorMessage } from './atoms';
import { ChevronLeft, ChevronRight, PlusIcon, TrashIcon, ResetIcon, SpinnerIcon } from './icons';
import PeriodicTable from './PeriodicTable';

const MANAGE = '__manage__';

const Btn = ({ title, onClick, disabled, children, active }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; active?: boolean }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className={`grid h-9 w-9 place-items-center rounded-lg transition disabled:opacity-30 ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);

const nbName = (nb: NotebookMeta, t: TFunc) => nb.name || t(nb.id as SubjectId);

/** Bottom bar: notebook switch (with a manager), page navigation, page list with
 *  titles and reordering, coach tidy-up, and the periodic table for chemistry. */
export default function PageBar() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const setSubject = useUI((s) => s.setSubject);
  // Select only primitives so this bar does NOT re-render on every drawn stroke.
  const notebook = useBoard((s) => s.notebook);
  const notebooks = useBoard((s) => s.notebooks);
  const currentPageId = useBoard((s) => s.currentPageId);
  const pageIds = useBoard((s) => s.pages.filter((p) => notebookOf(p) === s.notebook).map((p) => p.id).join(','));
  const title = useBoard((s) => s.pages.find((p) => p.id === s.currentPageId)?.title ?? '');
  const goToPage = useBoard((s) => s.goToPage);
  const addPage = useBoard((s) => s.addPage);
  const deletePage = useBoard((s) => s.deletePage);
  const setNotebook = useBoard((s) => s.setNotebook);
  const tidyBusy = useTidy((s) => s.busy);
  const tidyNote = useTidy((s) => s.note);
  const tidyErr = useTidy((s) => s.error);
  const runTidy = useTidy((s) => s.run);
  const dismissTidy = useTidy((s) => s.dismiss);

  const ids = pageIds ? pageIds.split(',') : [];
  const index = ids.indexOf(currentPageId);
  const total = ids.length;

  const [list, setList] = useState(false);
  const [manage, setManage] = useState(false);
  const [table, setTable] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!list && !manage) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setList(false);
        setManage(false);
      }
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [list, manage]);

  const go = (delta: number) => {
    const next = ids[index + delta];
    if (next) goToPage(next);
  };
  const pickNotebook = (id: string) => {
    if (id === MANAGE) {
      setManage(true);
      setList(false);
      return;
    }
    const nb = notebooks.find((n) => n.id === id);
    if (!nb) return;
    setNotebook(id);
    if (nb.subject !== subject) setSubject(nb.subject);
  };
  const label = title || t('pageOf', { n: index + 1, total });

  return (
    <div ref={wrap} className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
      {list ? <PageList ids={ids} currentId={currentPageId} onPick={(id) => goToPage(id)} t={t} /> : null}
      {manage ? <NotebookManager onClose={() => setManage(false)} t={t} /> : null}
      {tidyNote !== null || tidyErr ? (
        <div className="selectable absolute bottom-full left-1/2 mb-2 w-80 -translate-x-1/2 rounded-2xl bg-white p-3 text-sm shadow-xl ring-1 ring-black/10">
          {tidyErr ? (
            <p className="text-red-700">{errorMessage(tidyErr, t)}</p>
          ) : (
            <>
              {tidyNote ? <p className="text-slate-700">{tidyNote}</p> : <p className="text-slate-700">✨</p>}
              <p className="mt-1 text-[11px] text-slate-400">{t('tidyLegend')}</p>
            </>
          )}
          <button type="button" onClick={dismissTidy} className="mt-2 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {t('done')}
          </button>
        </div>
      ) : null}

      <div className="flex max-w-[96vw] items-center gap-0.5 rounded-2xl bg-white/85 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur">
        {/* Notebook switch */}
        <select
          value={notebook}
          aria-label={t('notebooks')}
          title={t('notebooks')}
          onChange={(e) => pickNotebook(e.target.value)}
          className="h-9 max-w-[8.5rem] cursor-pointer rounded-lg bg-transparent pl-2 pr-6 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-100"
        >
          {notebooks.map((nb) => (
            <option key={nb.id} value={nb.id}>
              {nbName(nb, t)}
            </option>
          ))}
          <option value={MANAGE}>{t('manageNotebooks')}…</option>
        </select>
        {subject === 'chemistry' ? (
          <button type="button" onClick={() => setTable(true)} title={t('periodicTable')} aria-label={t('periodicTable')} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100">
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
          onClick={() => {
            setList((v) => !v);
            setManage(false);
          }}
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
        <Btn title={tidyBusy ? t('tidyBusy') : t('tidyPage')} onClick={() => void runTidy()} disabled={tidyBusy} active={tidyBusy}>
          {tidyBusy ? <SpinnerIcon className="h-4 w-4" /> : <span className="text-base leading-none">✨</span>}
        </Btn>
      </div>
      {table ? <PeriodicTable onClose={() => setTable(false)} /> : null}
    </div>
  );
}

function PageList({ ids, currentId, onPick, t }: { ids: string[]; currentId: string; onPick: (id: string) => void; t: TFunc }) {
  const pages = useBoard((s) => s.pages);
  const notebooks = useBoard((s) => s.notebooks);
  const notebook = useBoard((s) => s.notebook);
  const setPageTitle = useBoard((s) => s.setPageTitle);
  const movePage = useBoard((s) => s.movePage);
  const movePageToNotebook = useBoard((s) => s.movePageToNotebook);
  const byId = new Map(pages.map((p) => [p.id, p]));
  const cur = byId.get(currentId);
  const [draft, setDraft] = useState(cur?.title ?? '');
  useEffect(() => setDraft(cur?.title ?? ''), [currentId, cur?.title]);
  return (
    <div className="selectable absolute bottom-full left-1/2 mb-2 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
      <div className="flex gap-1.5 border-b border-slate-100 p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setPageTitle(currentId, draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          placeholder={t('pageTitlePlaceholder')}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400"
        />
        <select
          value=""
          aria-label={t('moveToNotebook')}
          title={t('moveToNotebook')}
          onChange={(e) => e.target.value && movePageToNotebook(currentId, e.target.value)}
          className="w-9 cursor-pointer rounded-lg border border-slate-200 bg-white text-center text-sm text-slate-600"
        >
          <option value="">⇄</option>
          {notebooks
            .filter((nb) => nb.id !== notebook)
            .map((nb) => (
              <option key={nb.id} value={nb.id}>
                {t('moveToNotebook')} {nbName(nb, t)}
              </option>
            ))}
        </select>
      </div>
      <ul className="thin-scroll max-h-64 overflow-y-auto py-1">
        {ids.map((id, i) => {
          const pg = byId.get(id);
          const n = (pg?.strokes.length ?? 0) + (pg?.texts?.length ?? 0);
          const active = id === currentId;
          return (
            <li key={id} className={`flex items-center ${active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
              <button type="button" onClick={() => onPick(id)} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5 text-left text-sm">
                <span className={`w-5 shrink-0 text-xs tabular-nums ${active ? 'text-slate-300' : 'text-slate-400'}`}>{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{pg?.title || t('untitledPage')}</span>
                <span className={`shrink-0 text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{n ? t('strokesCount', { n }) : t('emptyPage')}</span>
              </button>
              <button type="button" title={t('movePageUp')} aria-label={t('movePageUp')} disabled={i === 0} onClick={() => movePage(id, -1)} className="grid h-7 w-6 place-items-center text-xs opacity-70 hover:opacity-100 disabled:opacity-20">
                ▲
              </button>
              <button type="button" title={t('movePageDown')} aria-label={t('movePageDown')} disabled={i === ids.length - 1} onClick={() => movePage(id, 1)} className="mr-1 grid h-7 w-6 place-items-center text-xs opacity-70 hover:opacity-100 disabled:opacity-20">
                ▼
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NotebookManager({ onClose, t }: { onClose: () => void; t: TFunc }) {
  const notebooks = useBoard((s) => s.notebooks);
  const addNotebook = useBoard((s) => s.addNotebook);
  const renameNotebook = useBoard((s) => s.renameNotebook);
  const moveNotebook = useBoard((s) => s.moveNotebook);
  const deleteNotebook = useBoard((s) => s.deleteNotebook);
  const [name, setName] = useState('');
  const [subj, setSubj] = useState<SubjectId>('physics');
  const builtin = (id: string) => NOTEBOOKS.includes(id as SubjectId);
  return (
    <div className="selectable absolute bottom-full left-1/2 mb-2 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <span className="text-sm font-semibold text-slate-800">{t('notebooks')}</span>
        <button type="button" onClick={onClose} className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
          {t('done')}
        </button>
      </div>
      <ul className="thin-scroll max-h-56 overflow-y-auto py-1">
        {notebooks.map((nb, i) => (
          <li key={nb.id} className="flex items-center gap-1 px-2 py-1 text-sm text-slate-700">
            {builtin(nb.id) ? (
              <span className="min-w-0 flex-1 truncate px-1 font-medium">{nbName(nb, t)}</span>
            ) : (
              <input
                defaultValue={nb.name}
                aria-label={t('rename')}
                onBlur={(e) => renameNotebook(nb.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-slate-400"
              />
            )}
            <span className="shrink-0 text-[10px] text-slate-400">{t(nb.subject)}</span>
            <button type="button" title={t('movePageUp')} aria-label={t('movePageUp')} disabled={i === 0} onClick={() => moveNotebook(nb.id, -1)} className="grid h-7 w-6 place-items-center text-xs text-slate-500 hover:text-slate-900 disabled:opacity-20">
              ▲
            </button>
            <button type="button" title={t('movePageDown')} aria-label={t('movePageDown')} disabled={i === notebooks.length - 1} onClick={() => moveNotebook(nb.id, 1)} className="grid h-7 w-6 place-items-center text-xs text-slate-500 hover:text-slate-900 disabled:opacity-20">
              ▼
            </button>
            {builtin(nb.id) ? (
              <span className="w-6" />
            ) : (
              <button type="button" title={t('deleteNotebook')} aria-label={t('deleteNotebook')} onClick={() => deleteNotebook(nb.id)} className="grid h-7 w-6 place-items-center text-slate-400 hover:text-red-600">
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="flex gap-1.5 border-t border-slate-100 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const id = addNotebook(name, subj);
          setName('');
          useBoard.getState().setNotebook(id);
          useUI.getState().setSubject(subj);
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('notebookName')} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400" />
        <select value={subj} onChange={(e) => setSubj(e.target.value as SubjectId)} aria-label={t('subject')} className="rounded-lg border border-slate-200 bg-white px-1 text-xs text-slate-700">
          {NOTEBOOKS.map((s) => (
            <option key={s} value={s}>
              {t(s)}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!name.trim()} className="rounded-lg bg-slate-900 px-2.5 text-xs font-semibold text-white disabled:opacity-40">
          <PlusIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
