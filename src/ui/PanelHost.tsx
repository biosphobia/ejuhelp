import { useUI } from '../lib/ui';
import AskPanel from './panels/AskPanel';
import GeneratePanel from './panels/GeneratePanel';
import NotesPanel from './panels/NotesPanel';
import ProgressPanel from './panels/ProgressPanel';
import TimerPanel from './panels/TimerPanel';
import SettingsPanel from './panels/SettingsPanel';
import AccountPanel from './panels/AccountPanel';

export default function PanelHost() {
  const panel = useUI((s) => s.panel);
  switch (panel) {
    case 'ask':
      return <AskPanel />;
    case 'generate':
      return <GeneratePanel />;
    case 'notes':
      return <NotesPanel />;
    case 'progress':
      return <ProgressPanel />;
    case 'timer':
      return <TimerPanel />;
    case 'settings':
      return <SettingsPanel />;
    case 'account':
      return <AccountPanel />;
    default:
      return null;
  }
}
