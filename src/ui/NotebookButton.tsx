import { useEffect, useRef, useState } from 'react';
import { useNotebook, NOTEBOOKS, NOTEBOOK_LABEL, NOTEBOOK_COLOR } from '../lib/notebooks';
import { switchNotebook } from '../lib/persistence';
import { useT } from '../i18n';
import { NotesIcon } from './icons';

/** Notebook switcher, embedded as the left segment of the page bar. */
export default function NotebookButton() {
  const t = useT();
  const active = useNotebook((s) => s.active);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when tapping anywhere outside (works regardless of the bar's transform).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open ? (
        <div className="absolute bottom-full left-0 mb-2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
          {NOTEBOOKS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                switchNotebook(id);
                setOpen(false);
              }}
              className={`flex w-44 items-center gap-2 px-3 py-2 text-left text-sm font-medium transition ${
                id === active ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <NotesIcon className="h-4 w-4 shrink-0" style={{ color: NOTEBOOK_COLOR[id] }} />
              {t(NOTEBOOK_LABEL[id])}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        title={t('notebook')}
        aria-label={`${t('notebook')}: ${t(NOTEBOOK_LABEL[active])}`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-1.5 rounded-xl px-2.5 transition ${
          open ? 'bg-slate-100' : 'hover:bg-slate-100'
        }`}
      >
        <NotesIcon className="h-5 w-5 shrink-0" style={{ color: NOTEBOOK_COLOR[active] }} />
        <span className="hidden max-w-[6rem] truncate text-sm font-semibold text-slate-700 sm:inline">
          {t(NOTEBOOK_LABEL[active])}
        </span>
      </button>
    </div>
  );
}
