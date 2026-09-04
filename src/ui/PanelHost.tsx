import { Component, type ReactNode } from 'react';
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

class PanelBoundary extends Component<{ children: ReactNode; panelKey: string }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  componentDidUpdate(prev: { panelKey: string }) {
    if (prev.panelKey !== this.props.panelKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error)
      return (
        <div className="pointer-events-auto absolute inset-y-0 right-0 z-30 w-full max-w-[420px] bg-white p-4 text-sm text-red-700">
          <p className="font-semibold">Something went wrong in this panel.</p>
          <p className="mt-1 text-xs text-slate-500">{this.state.error}</p>
          <button type="button" onClick={() => useUI.getState().closePanel()} className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            Close
          </button>
        </div>
      );
    return this.props.children;
  }
}

export default function PanelHost() {
  const panel = useUI((s) => s.panel);
  return (
    <PanelBoundary panelKey={panel ?? ''}>
      <PanelSwitch panel={panel} />
    </PanelBoundary>
  );
}

function PanelSwitch({ panel }: { panel: ReturnType<typeof useUI.getState>['panel'] }) {
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
