import Panel, { SubjectChips } from '../Panel';
import { Label } from '../atoms';
import { useUI, type Lang } from '../../lib/ui';
import { useDebug } from '../../lib/debug';
import { useT } from '../../i18n';
import { GlobeIcon } from '../icons';
import { useApiStore } from '../../lib/apiStore';
import { useProfile } from '../../lib/profile';
import { TrashIcon } from '../icons';

export default function SettingsPanel() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const setLang = useUI((s) => s.setLang);
  const fingerDraw = useUI((s) => s.fingerDraw);
  const setFingerDraw = useUI((s) => s.setFingerDraw);
  const debugEnabled = useDebug((s) => s.enabled);
  const setDebug = useDebug((s) => s.setEnabled);
  const habits = useProfile((s) => s.habits);
  const removeHabit = useProfile((s) => s.remove);
  const clearHabits = useProfile((s) => s.clear);

  // BYOK State
  const activeModel = useApiStore((s) => s.activeModel);
  const claudeKey = useApiStore((s) => s.claudeKey);
  const gptKey = useApiStore((s) => s.gptKey);
  const geminiKey = useApiStore((s) => s.geminiKey);
  const setModel = useApiStore((s) => s.setModel);
  const setKeys = useApiStore((s) => s.setKeys);

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
        <div className="grid grid-cols-2 gap-2">
          <LangBtn value="en" label="English" />
          <LangBtn value="ja" label="日本語" />
          <LangBtn value="zh" label="中文" />
          <LangBtn value="tr" label="Türkçe" />
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

      {/* AI Model Selection & BYOK Inputs */}
      <div className="mb-6">
        <Label>{t('aiModel')}</Label>
        <div className="flex gap-2">
          <ModeBtn on={activeModel === 'gemini'} onClick={() => setModel('gemini')} label="Gemini" />
          <ModeBtn on={activeModel === 'claude'} onClick={() => setModel('claude')} label="Claude" />
          <ModeBtn on={activeModel === 'gpt'} onClick={() => setModel('gpt')} label="GPT" />
        </div>

        {activeModel === 'claude' && (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">Claude {t('apiKey')}</label>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setKeys(e.target.value, gptKey, geminiKey)}
              placeholder="sk-ant-..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 transition"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">{t('apiKeyStoredLocally')}</p>
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                {t('getKey')}
              </a>
            </div>
          </div>
        )}

        {activeModel === 'gpt' && (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">OpenAI {t('apiKey')}</label>
            <input
              type="password"
              value={gptKey}
              onChange={(e) => setKeys(claudeKey, e.target.value, geminiKey)}
              placeholder="sk-..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 transition"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">{t('apiKeyStoredLocally')}</p>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                {t('getKey')}
              </a>
            </div>
          </div>
        )}

        {activeModel === 'gemini' && (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">Gemini {t('apiKey')} ({t('optional')})</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setKeys(claudeKey, gptKey, e.target.value)}
              placeholder={t('geminiKeyPlaceholder')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 transition"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">{t('apiKeyStoredLocally')}</p>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                {t('getKey')}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <Label>{t('defaultSubject')}</Label>
        <SubjectChips />
      </div>

      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between">
          <Label>{t('handwritingProfile')}</Label>
          {habits.length ? (
            <button type="button" onClick={clearHabits} className="text-xs font-semibold text-slate-400 hover:text-red-600">
              {t('clearAll')}
            </button>
          ) : null}
        </div>
        {habits.length ? (
          <ul className="space-y-1">
            {habits.map((h) => (
              <li key={h.id} className="flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800">
                <span className="min-w-0 flex-1">{h.text}</span>
                <button type="button" aria-label={t('close')} onClick={() => removeHabit(h.id)} className="shrink-0 text-slate-300 hover:text-red-600">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 text-sm text-slate-400">{t('handwritingEmpty')}</p>
        )}
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
