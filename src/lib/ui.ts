import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'en' | 'ja' | 'zh' | 'tr';
export const LANGS: Lang[] = ['en', 'ja', 'zh', 'tr'];
export type Subject = 'physics' | 'chemistry' | 'biology' | 'math';
export type PanelId =
  | 'ask'
  | 'generate'
  | 'exams'
  | 'progress'
  | 'timer'
  | 'settings'
  | 'account'
  | null;
/** Top-level app surface: the whiteboard, or the full-screen Mindmap. */
export type Mode = 'board' | 'mindmap';

export const SUBJECTS: Subject[] = ['physics', 'chemistry', 'biology', 'math'];

interface UIState {
  lang: Lang;
  subject: Subject;
  panel: PanelId;
  /** Which top-level surface is showing. Not persisted — the app always opens on the board. */
  mode: Mode;
  launcherOpen: boolean;
  /** When true, a single finger (or a Pencil that reports as touch) draws; two fingers pan/zoom.
   *  When false, only a real pen/stylus draws and any touch navigates (palm rejection). */
  fingerDraw: boolean;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  setSubject: (s: Subject) => void;
  openPanel: (p: PanelId) => void;
  closePanel: () => void;
  setMode: (m: Mode) => void;
  /** Flip between the board and the Mindmap, closing any open menu/panel. */
  toggleMindmap: () => void;
  setLauncherOpen: (b: boolean) => void;
  setFingerDraw: (b: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      subject: 'physics',
      panel: null,
      mode: 'board',
      launcherOpen: false,
      fingerDraw: false, // default: pen draws, fingers navigate (pan / pinch-zoom)
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: LANGS[(LANGS.indexOf(get().lang) + 1) % LANGS.length] }),
      setSubject: (subject) => set({ subject }),
      openPanel: (panel) => set({ panel, launcherOpen: false }),
      closePanel: () => set({ panel: null }),
      setMode: (mode) => set({ mode }),
      toggleMindmap: () =>
        set((s) => ({ mode: s.mode === 'mindmap' ? 'board' : 'mindmap', panel: null, launcherOpen: false })),
      setLauncherOpen: (launcherOpen) => set({ launcherOpen }),
      setFingerDraw: (fingerDraw) => set({ fingerDraw }),
    }),
    {
      name: 'eju-ui',
      version: 1,
      // Drop the old fingerDraw value so the new default (fingers navigate) applies.
      migrate: (persisted: any, version: number) => {
        if (version < 1 && persisted && 'fingerDraw' in persisted) delete persisted.fingerDraw;
        return persisted;
      },
      partialize: (s) => ({ lang: s.lang, subject: s.subject, fingerDraw: s.fingerDraw }),
    }
  )
);
