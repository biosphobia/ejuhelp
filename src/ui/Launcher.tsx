import { useUI, type PanelId } from '../lib/ui';
import { useT, type StringKey } from '../i18n';
import {
  AskIcon,
  GenerateIcon,
  ExamIcon,
  ChartIcon,
  TimerIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
} from './icons';

type Item = { id: Exclude<PanelId, null>; label: StringKey; Icon: typeof AskIcon };

const PRIMARY: Item[] = [
  { id: 'ask', label: 'askCoach', Icon: AskIcon },
  { id: 'generate', label: 'generate', Icon: GenerateIcon },
  { id: 'exams', label: 'exams', Icon: ExamIcon },
  // Weak-point/progress analysis now lives per-topic in the Mindmap.
  { id: 'timer', label: 'timer', Icon: TimerIcon },
];
const SECONDARY: Item[] = [
  { id: 'settings', label: 'settings', Icon: SettingsIcon },
  { id: 'account', label: 'account', Icon: UserIcon },
];

export default function Launcher() {
  const t = useT();
  const open = useUI((s) => s.launcherOpen);
  const setOpen = useUI((s) => s.setLauncherOpen);
  const openPanel = useUI((s) => s.openPanel);

  const Row = ({ id, label, Icon }: Item) => (
    <button
      type="button"
      onClick={() => openPanel(id)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="whitespace-nowrap text-sm font-medium">{t(label)}</span>
    </button>
  );

  return (
    <div className="pointer-events-auto absolute right-0 top-1/2 z-20 -translate-y-1/2 safe-pad-right">
      <div className="flex items-center">
        {/* Expanding menu */}
        <div
          className={`mr-1 overflow-hidden rounded-2xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur transition-all duration-200 ${
            open ? 'w-52 opacity-100' : 'pointer-events-none w-0 opacity-0'
          }`}
        >
          <div className="w-52 p-2">
            {PRIMARY.map((it) => (
              <Row key={it.id} {...it} />
            ))}
            <div className="my-1 h-px bg-slate-200" />
            {SECONDARY.map((it) => (
              <Row key={it.id} {...it} />
            ))}
          </div>
        </div>

        {/* The always-present tab */}
        <button
          type="button"
          aria-label={t('menu')}
          title={t('menu')}
          onClick={() => setOpen(!open)}
          className={`grid h-14 w-9 place-items-center rounded-l-2xl shadow-lg ring-1 ring-black/5 backdrop-blur transition ${
            open ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
          }`}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
