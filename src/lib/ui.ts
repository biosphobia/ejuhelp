import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'en' | 'ja';
export type Subject = 'physics' | 'chemistry' | 'biology' | 'math';
export type PanelId =
  | 'ask'
  | 'generate'
  | 'notes'
  | 'check'
  | 'settings'
  | 'account'
  | null;

export const SUBJECTS: Subject[] = ['physics', 'chemistry', 'biology', 'math'];

interface UIState {
  lang: Lang;
  subject: Subject;
  panel: PanelId;
  launcherOpen: boolean;
  /** When true, a single finger (or a Pencil that reports as touch) draws; two fingers pan/zoom.
   *  When false, only a real pen/stylus draws and any touch navigates (palm rejection). */
  fingerDraw: boolean;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  setSubject: (s: Subject) => void;
  openPanel: (p: PanelId) => void;
  closePanel: () => void;
  setLauncherOpen: (b: boolean) => void;
  setFingerDraw: (b: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      subject: 'physics',
      panel: null,
      launcherOpen: false,
      fingerDraw: true,
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'en' ? 'ja' : 'en' }),
      setSubject: (subject) => set({ subject }),
      openPanel: (panel) => set({ panel, launcherOpen: false }),
      closePanel: () => set({ panel: null }),
      setLauncherOpen: (launcherOpen) => set({ launcherOpen }),
      setFingerDraw: (fingerDraw) => set({ fingerDraw }),
    }),
    {
      name: 'eju-ui',
      partialize: (s) => ({ lang: s.lang, subject: s.subject, fingerDraw: s.fingerDraw }),
    }
  )
);
