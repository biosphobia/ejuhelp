import Panel, { SubjectChips } from '../Panel';
import { Label } from '../atoms';
import { useUI, type Lang } from '../../lib/ui';
import { useT } from '../../i18n';
import { GlobeIcon } from '../icons';

export default function SettingsPanel() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const setLang = useUI((s) => s.setLang);

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

      <div>
        <Label>{t('defaultSubject')}</Label>
        <SubjectChips />
      </div>
    </Panel>
  );
}
