import type { ReactNode } from 'react';
import { useUI } from '../lib/ui';
import { useT } from '../i18n';
import { CloseIcon } from './icons';

/** Right-hand drawer that opens beside the tab rail. */
export default function Panel({
  title,
  children,
  footer,
  wide,
  headerExtra,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider drawer for content-heavy panels (tables, charts). */
  wide?: boolean;
  /** Extra controls rendered in the header next to the close button. */
  headerExtra?: ReactNode;
}) {
  const t = useT();
  const closePanel = useUI((s) => s.closePanel);

  return (
    <div
      className={`selectable pointer-events-auto absolute inset-y-0 right-0 z-30 flex w-full flex-col bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_20px_50px_-20px_rgba(15,23,42,0.35)] transition-[max-width] duration-200 safe-pad-top ${
        wide ? 'sm:max-w-[720px]' : 'sm:max-w-[420px]'
      }`}
    >
      <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
        <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-slate-900">{title}</h2>
        {headerExtra}
        <button
          type="button"
          aria-label={t('close')}
          title={t('close')}
          onClick={closePanel}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>
      </header>
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-3">{children}</div>
      {footer ? <div className="border-t border-slate-100 p-3">{footer}</div> : null}
    </div>
  );
}

/** Small subject picker reused across panels. */
export function SubjectChips({ extra }: { extra?: ReactNode }) {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const setSubject = useUI((s) => s.setSubject);
  const subjects = ['physics', 'chemistry', 'biology', 'math'] as const;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1">
      <div className="flex gap-0.5 rounded-xl bg-slate-100 p-0.5">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            className={`rounded-lg px-2.5 py-1 text-[13px] font-medium transition ${
              subject === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t(s)}
          </button>
        ))}
      </div>
      {extra}
    </div>
  );
}
