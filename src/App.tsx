import { useEffect } from 'react';
import Whiteboard from './whiteboard/Whiteboard';
import Toolbar from './ui/Toolbar';
import PageBar from './ui/PageBar';
import Launcher from './ui/Launcher';
import PanelHost from './ui/PanelHost';
import BoardQuestions from './ui/BoardQuestions';
import DebugHud from './ui/DebugHud';
import { initPersistence } from './lib/persistence';
import { initUserData } from './lib/userdata';
import './lib/auth'; // registers the Firebase auth listener on load

export default function App() {
  useEffect(() => {
    initPersistence();
    initUserData();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-screen drawing surface */}
      <Whiteboard />

      {/* Floating UI — empty areas pass touches through to the canvas */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <Toolbar />
        <PageBar />
        <BoardQuestions />
        <Launcher />
        <PanelHost />
        <DebugHud />
      </div>
    </div>
  );
}
