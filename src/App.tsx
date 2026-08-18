import { useEffect } from 'react';
import Whiteboard from './whiteboard/Whiteboard';
import Toolbar from './ui/Toolbar';
import PageBar from './ui/PageBar';
import Launcher from './ui/Launcher';
import PanelHost from './ui/PanelHost';
import BoardQuestions from './ui/BoardQuestions';
import BoardExam from './ui/BoardExam';
import BoardTimer from './ui/BoardTimer';
import DebugHud from './ui/DebugHud';
import Mindmap from './mindmap/Mindmap';
import NodeDetail from './mindmap/NodeDetail';
import { useUI } from './lib/ui';
import { useStudyMap } from './lib/studymap';
import { useSync } from './lib/sync';
import { initPersistence } from './lib/persistence';
import { initUserData } from './lib/userdata';
import { useT } from './i18n';
import './lib/auth'; // registers the Firebase auth listener on load

/** Impossible-to-miss warning when work cannot be committed to ANY on-device store —
 *  from that moment new notes exist only in memory, so the user must act, not find
 *  out after the next reload. */
function StorageAlarm() {
  const t = useT();
  const local = useSync((s) => s.local);
  if (local !== 'failing') return null;
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg safe-pad-top">
      {t('localSaveFailing')}
    </div>
  );
}

export default function App() {
  const mode = useUI((s) => s.mode);
  const openNode = useStudyMap((s) => s.openNode);
  const setOpenNode = useStudyMap((s) => s.setOpenNode);

  useEffect(() => {
    initPersistence();
    initUserData();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-screen drawing surface (always mounted so its state/persistence is preserved) */}
      <Whiteboard />

      {/* Floating UI — empty areas pass touches through to the canvas */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {mode === 'board' ? (
          <>
            <Toolbar />
            <PageBar />
            <BoardQuestions />
            <BoardExam />
            <BoardTimer />
            <Launcher />
          </>
        ) : (
          <Mindmap />
        )}
        {/* Panels (e.g. the coach) float above either surface */}
        <PanelHost />
        {/* Node detail (study sheet + practice), openable from the calendar or the side menu */}
        {openNode ? (
          <NodeDetail
            subject={openNode.subject}
            nodeId={openNode.id}
            label={openNode.label}
            isTopic={openNode.isTopic}
            subIds={openNode.subIds}
            onClose={() => setOpenNode(null)}
          />
        ) : null}
        <DebugHud />
        <StorageAlarm />
      </div>
    </div>
  );
}
