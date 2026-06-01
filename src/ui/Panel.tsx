import type { ReactNode } from 'react';
import { useUI } from '../lib/ui';
import { useT } from '../i18n';
import { CloseIcon } from './icons';

export default function Panel({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const t = useT();
  const closePanel = useUI((s) => s.closePanel);

  return (
    <div className="selectable pointer-events-auto absolute inset-y-0 right-0 z-30 flex w-full max-w-[440px] flex-col bg-white shadow-2xl ring-1 ring-black/10 safe-pad-top">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <button
          type="button"
          aria-label={t('close')}
          title={t('close')}
          onClick={closePanel}
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
        >
          <CloseIcon />
        </button>
      </header>
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-3">{children}</div>
      {footer ? <div className="border-t border-slate-100 p-3">{footer}</div> : null}
    </div>
  );
}

/** Small subject picker reused across panels. */
export function SubjectChips() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const setSubject = useUI((s) => s.setSubject);
  const subjects = ['physics', 'chemistry', 'biology', 'math'] as const;
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {subjects.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSubject(s)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            subject === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {t(s)}
        </button>
      ))}
    </div>
  );
}
