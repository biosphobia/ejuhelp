import { useState } from 'react';
import Panel from '../Panel';
import { PrimaryButton } from '../atoms';
import { useAuth } from '../../lib/auth';
import { useSync } from '../../lib/sync';
import { useLearnerProfile, type ProfileKind } from '../../lib/profile';
import { useT, type StringKey } from '../../i18n';
import { UserIcon, ChartIcon, SpinnerIcon } from '../icons';

const KIND_LABEL: Record<ProfileKind, StringKey> = {
  style: 'profileStyle',
  struggle: 'profileStruggle',
  strength: 'profileStrength',
};
const KIND_CLS: Record<ProfileKind, string> = {
  style: 'bg-sky-50 text-sky-700',
  struggle: 'bg-amber-50 text-amber-700',
  strength: 'bg-emerald-50 text-emerald-700',
};

export default function AccountPanel() {
  const t = useT();
  const configured = useAuth((s) => s.configured);
  const user = useAuth((s) => s.user);
  const signIn = useAuth((s) => s.signIn);
  const signOut = useAuth((s) => s.signOut);
  const cloud = useSync((s) => s.cloud);
  const cloudDetail = useSync((s) => s.detail);

  const notes = useLearnerProfile((s) => s.notes);
  const removeNote = useLearnerProfile((s) => s.remove);
  const clearProfile = useLearnerProfile((s) => s.clear);
  const [showDiag, setShowDiag] = useState(false);

  return (
    <Panel title={t('account')}>
      {!configured ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
          {t('authNotConfigured')}
        </div>
      ) : user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-slate-500">
                <UserIcon />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs text-slate-400">{t('signedInAs')}</div>
              <div className="truncate font-medium text-slate-800">
                {user.displayName || user.email}
              </div>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
              cloud === 'error'
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
                : cloud === 'saving'
                ? 'bg-slate-50 text-slate-600 ring-1 ring-slate-100'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
            }`}
          >
            {cloud === 'saving' || cloud === 'local' ? <SpinnerIcon className="h-4 w-4 shrink-0" /> : null}
            <div className="min-w-0">
              <div>
                {cloud === 'saving'
                  ? t('cloudSaving')
                  : cloud === 'error'
                  ? t('cloudError')
                  : cloud === 'saved'
                  ? t('cloudSaved')
                  : /* signed in but not reconciled yet */ t('cloudChecking')}
              </div>
              {cloud === 'error' && cloudDetail ? (
                <div className="mt-0.5 break-words font-mono text-[11px] font-normal text-amber-700/80">{cloudDetail}</div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {t('signOut')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t('syncOff')}</p>
          <PrimaryButton onClick={() => void signIn()}>{t('signInGoogle')}</PrimaryButton>
        </div>
      )}
    </Panel>
  );
}
