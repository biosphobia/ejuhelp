import { useState } from 'react';
import { useNotebook, NOTEBOOKS, NOTEBOOK_LABEL } from '../lib/notebooks';
import { switchNotebook } from '../lib/persistence';
import { useT } from '../i18n';
import { NotesIcon } from './icons';

/** Compact switcher (just above the page bar) for the per-subject whiteboards. */
export default function NotebookBar() {
  const t = useT();
  const active = useNotebook((s) => s.active);
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[4.75rem] z-20 flex justify-center">
      <div className="pointer-events-auto relative">
        {open ? (
          <>
            {/* click-away backdrop */}
            <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 cursor-default" />
            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
              {NOTEBOOKS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    switchNotebook(id);
                    setOpen(false);
                  }}
                  className={`flex w-40 items-center gap-2 px-3 py-2 text-left text-sm font-medium transition ${
                    id === active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <NotesIcon className="h-4 w-4 shrink-0" />
                  {t(NOTEBOOK_LABEL[id])}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <button
          type="button"
          title={t('notebook')}
          aria-label={t('notebook')}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-black/5 backdrop-blur"
        >
          <NotesIcon className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="max-w-[7.5rem] truncate">{t(NOTEBOOK_LABEL[active])}</span>
        </button>
      </div>
    </div>
  );
}
