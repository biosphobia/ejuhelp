import type { ReactNode } from 'react';
import { useUI } from '../lib/ui';
import { useT } from '../i18n';
import { CloseIcon } from './icons';

export default function Panel({
  title,
  children,
  footer,
  dark,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Dark colour scheme (used by the Mindmap coach to match the dark map). */
  dark?: boolean;
}) {
  const t = useT();
  const closePanel = useUI((s) => s.closePanel);

  const shell = dark
    ? 'bg-slate-900 text-slate-100 ring-white/10'
    : 'bg-white text-slate-900 ring-black/10';
  const edge = dark ? 'border-white/10' : 'border-slate-100';
  const closeBtn = dark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100';

  return (
    <div
      className={`selectable pointer-events-auto absolute inset-y-0 right-0 z-30 flex w-full max-w-[440px] flex-col shadow-2xl ring-1 safe-pad-top ${shell}`}
    >
      <header className={`flex items-center justify-between border-b px-4 py-3 ${edge}`}>
        <h2 className="text-base font-semibold">{title}</h2>
        <button
          type="button"
          aria-label={t('close')}
          title={t('close')}
          onClick={closePanel}
          className={`grid h-9 w-9 place-items-center rounded-xl ${closeBtn}`}
        >
          <CloseIcon />
        </button>
      </header>
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-3">{children}</div>
      {footer ? <div className={`border-t p-3 ${edge}`}>{footer}</div> : null}
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
