import { useUI, type PanelId } from '../lib/ui';
import { useT, type StringKey } from '../i18n';
import { AskIcon, GenerateIcon, ExamIcon, TimerIcon, CalendarIcon, SettingsIcon, UserIcon } from './icons';

type Item = { id: Exclude<PanelId, null>; label: StringKey; Icon: typeof AskIcon };

const PRIMARY: Item[] = [
  { id: 'plan', label: 'plan', Icon: CalendarIcon },
  { id: 'ask', label: 'askCoach', Icon: AskIcon },
  { id: 'generate', label: 'generate', Icon: GenerateIcon },
  { id: 'exams', label: 'exams', Icon: ExamIcon },
  { id: 'timer', label: 'timer', Icon: TimerIcon },
];
const SECONDARY: Item[] = [
  { id: 'settings', label: 'settings', Icon: SettingsIcon },
  { id: 'account', label: 'account', Icon: UserIcon },
];

/** Slim vertical tab rail on the right edge. Tapping a tab opens its panel to the
 *  left of the rail; tapping the active tab closes it. Stays out of the way of the
 *  canvas: a single 44px column, translucent until hovered. */
export default function Launcher() {
  const t = useT();
  const panel = useUI((s) => s.panel);
  const openPanel = useUI((s) => s.openPanel);
  const closePanel = useUI((s) => s.closePanel);

  const Tab = ({ id, label, Icon }: Item) => {
    const active = panel === id;
    return (
      <button
        type="button"
        title={t(label)}
        aria-label={t(label)}
        aria-pressed={active}
        onClick={() => (active ? closePanel() : openPanel(id))}
        className={`group relative grid h-10 w-10 place-items-center rounded-xl transition ${
          active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover:opacity-100">
          {t(label)}
        </span>
      </button>
    );
  };

  return (
    <div
      className={`pointer-events-auto absolute right-1.5 top-1/2 z-20 -translate-y-1/2 safe-pad-right ${
        panel ? 'hidden sm:block' : ''
      }`}
    >
      <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white/85 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur">
        {PRIMARY.map((it) => (
          <Tab key={it.id} {...it} />
        ))}
        <span className="my-0.5 h-px w-6 bg-slate-200" />
        {SECONDARY.map((it) => (
          <Tab key={it.id} {...it} />
        ))}
      </div>
    </div>
  );
}
