import { useUI } from '../lib/ui';
import AskPanel from './panels/AskPanel';
import GeneratePanel from './panels/GeneratePanel';
import NotesPanel from './panels/NotesPanel';
import CheckPanel from './panels/CheckPanel';
import ProgressPanel from './panels/ProgressPanel';
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
    case 'check':
      return <CheckPanel />;
    case 'progress':
      return <ProgressPanel />;
    case 'settings':
      return <SettingsPanel />;
    case 'account':
      return <AccountPanel />;
    default:
      return null;
  }
}
