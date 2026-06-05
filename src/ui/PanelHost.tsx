import { useUI } from '../lib/ui';
import AskPanel from './panels/AskPanel';
import GeneratePanel from './panels/GeneratePanel';
import ExamsPanel from './panels/ExamsPanel';
import ProgressPanel from './panels/ProgressPanel';
import TimerPanel from './panels/TimerPanel';
import SettingsPanel from './panels/SettingsPanel';
import AccountPanel from './panels/AccountPanel';
import MindmapCoachPanel from './panels/MindmapCoachPanel';

export default function PanelHost() {
  const panel = useUI((s) => s.panel);
  switch (panel) {
    case 'ask':
      return <AskPanel />;
    case 'generate':
      return <GeneratePanel />;
    case 'exams':
      return <ExamsPanel />;
    case 'progress':
      return <ProgressPanel />;
    case 'timer':
      return <TimerPanel />;
    case 'settings':
      return <SettingsPanel />;
    case 'account':
      return <AccountPanel />;
    case 'mindmapCoach':
      return <MindmapCoachPanel />;
    default:
      return null;
  }
}
