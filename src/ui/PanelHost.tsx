import { useUI } from '../lib/ui';
import AskPanel from './panels/AskPanel';
import PlanPanel from './panels/PlanPanel';
import GeneratePanel from './panels/GeneratePanel';
import ExamsPanel from './panels/ExamsPanel';
import NotesPanel from './panels/NotesPanel';
import ProgressPanel from './panels/ProgressPanel';
import TimerPanel from './panels/TimerPanel';
import SettingsPanel from './panels/SettingsPanel';
import AccountPanel from './panels/AccountPanel';

export default function PanelHost() {
  const panel = useUI((s) => s.panel);
  switch (panel) {
    case 'plan':
      return <PlanPanel />;
    case 'ask':
      return <AskPanel />;
    case 'generate':
      return <GeneratePanel />;
    case 'exams':
      return <ExamsPanel />;
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
