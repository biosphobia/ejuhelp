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
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  setSubject: (s: Subject) => void;
  openPanel: (p: PanelId) => void;
  closePanel: () => void;
  setLauncherOpen: (b: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      subject: 'physics',
      panel: null,
      launcherOpen: false,
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'en' ? 'ja' : 'en' }),
      setSubject: (subject) => set({ subject }),
      openPanel: (panel) => set({ panel, launcherOpen: false }),
      closePanel: () => set({ panel: null }),
      setLauncherOpen: (launcherOpen) => set({ launcherOpen }),
    }),
    {
      name: 'eju-ui',
      partialize: (s) => ({ lang: s.lang, subject: s.subject }),
    }
  )
);
