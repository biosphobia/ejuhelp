import Panel from '../Panel';
import { PrimaryButton } from '../atoms';
import { useAuth } from '../../lib/auth';
import { useT } from '../../i18n';
import { UserIcon } from '../icons';

export default function AccountPanel() {
  const t = useT();
  const configured = useAuth((s) => s.configured);
  const user = useAuth((s) => s.user);
  const signIn = useAuth((s) => s.signIn);
  const signOut = useAuth((s) => s.signOut);

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
          <p className="text-sm text-emerald-700">{t('syncOn')}</p>
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
