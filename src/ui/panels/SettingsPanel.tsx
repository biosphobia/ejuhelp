import Panel, { SubjectChips } from '../Panel';
import { Label } from '../atoms';
import { useUI, type Lang } from '../../lib/ui';
import { useDebug } from '../../lib/debug';
import { useT } from '../../i18n';
import { GlobeIcon } from '../icons';

export default function SettingsPanel() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const setLang = useUI((s) => s.setLang);
  const fingerDraw = useUI((s) => s.fingerDraw);
  const setFingerDraw = useUI((s) => s.setFingerDraw);
  const debugEnabled = useDebug((s) => s.enabled);
  const setDebug = useDebug((s) => s.setEnabled);

  const LangBtn = ({ value, label }: { value: Lang; label: string }) => (
    <button
      type="button"
      onClick={() => setLang(value)}
      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        lang === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Panel title={t('settingsTitle')}>
      <div className="mb-6">
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <GlobeIcon className="h-4 w-4" /> {t('language')}
          </span>
        </Label>
        <div className="flex gap-2">
          <LangBtn value="en" label="English" />
          <LangBtn value="ja" label="日本語" />
        </div>
      </div>

      <div className="mb-6">
        <Label>{t('inputMode')}</Label>
        <div className="flex gap-2">
          <ModeBtn on={fingerDraw} onClick={() => setFingerDraw(true)} label={t('fingerDraw')} />
          <ModeBtn on={!fingerDraw} onClick={() => setFingerDraw(false)} label={t('pencilOnly')} />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{t('inputHint')}</p>
      </div>

      <div className="mb-6">
        <Label>{t('defaultSubject')}</Label>
        <SubjectChips />
      </div>

      <div>
        <Label>{t('diagnostics')}</Label>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl p-2 hover:bg-slate-50">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={debugEnabled}
            onChange={(e) => setDebug(e.target.checked)}
          />
          <span className="text-sm">
            <span className="font-medium text-slate-800">{t('diagnosticsToggle')}</span>
            <span className="block text-xs text-slate-500">{t('diagnosticsHint')}</span>
          </span>
        </label>
        <div className="mt-2 px-2 text-xs tabular-nums text-slate-400">
          {t('version')}: v{__APP_VERSION__} · {__BUILD_ID__}
        </div>
      </div>
    </Panel>
  );
}

function ModeBtn({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
