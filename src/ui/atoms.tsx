import type { ReactNode } from 'react';
import { ApiError, EmptyBoardError } from '../lib/api';
import { SpinnerIcon } from './icons';
import { useT, type TFunc } from '../i18n';

export function PrimaryButton({
  onClick,
  busy,
  disabled,
  children,
}: {
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
    >
      {busy ? <SpinnerIcon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="my-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</div>;
}

/** Turn an API/network error into a friendly localized message. */
export function useErrorMessage() {
  const t = useT();
  return (e: unknown): string => errorMessage(e, t);
}

export function errorMessage(e: unknown, t: TFunc): string {
  if (e instanceof EmptyBoardError) return t('emptyBoard');
  if (e instanceof ApiError) {
    if (e.code === 'no_api_key') return t('needKey');
    if (e.code === 'auth_not_configured') return t('authBackendErr');
    if (e.code === 'missing_token' || e.code === 'invalid_token') return t('needSignIn');
    if (e.detail) return e.detail; // the real backend / Claude API message
  }
  return t('error');
}
