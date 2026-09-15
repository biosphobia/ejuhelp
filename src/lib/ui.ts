import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'en' | 'ja' | 'zh' | 'tr';
export const LANGS: Lang[] = ['en', 'ja', 'zh', 'tr'];
export type Subject = 'physics' | 'chemistry' | 'biology' | 'math';
export type PanelId =
  | 'plan'
  | 'ask'
  | 'generate'
  | 'exams'
  | 'notes'
  | 'progress'
  | 'timer'
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
  /** Bumped when a synced setting (lang, subject, fingerDraw) changes; see sync.ts. */
  rev: number;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  setSubject: (s: Subject) => void;
  openPanel: (p: PanelId) => void;
  closePanel: () => void;
  setLauncherOpen: (b: boolean) => void;
  setFingerDraw: (b: boolean) => void;
  /** Apply settings from the device/cloud sync. Unknown or missing values keep the current ones. */
  loadSettings: (data: { lang?: Lang; subject?: Subject; fingerDraw?: boolean } | null | undefined) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      subject: 'physics',
      panel: null,
      launcherOpen: false,
      fingerDraw: false, // default: pen draws, fingers navigate (pan / pinch-zoom)
      rev: 0,
      setLang: (lang) => set((s) => ({ lang, rev: s.rev + 1 })),
      toggleLang: () => set((s) => ({ lang: LANGS[(LANGS.indexOf(get().lang) + 1) % LANGS.length], rev: s.rev + 1 })),
      setSubject: (subject) => set((s) => ({ subject, rev: s.rev + 1 })),
      openPanel: (panel) => set({ panel, launcherOpen: false }),
      closePanel: () => set({ panel: null }),
      setLauncherOpen: (launcherOpen) => set({ launcherOpen }),
      setFingerDraw: (fingerDraw) => set((s) => ({ fingerDraw, rev: s.rev + 1 })),
      loadSettings: (data) =>
        set((s) => ({
          lang: LANGS.includes(data?.lang as Lang) ? (data!.lang as Lang) : s.lang,
          subject: SUBJECTS.includes(data?.subject as Subject) ? (data!.subject as Subject) : s.subject,
          fingerDraw: typeof data?.fingerDraw === 'boolean' ? data.fingerDraw : s.fingerDraw,
          rev: s.rev + 1,
        })),
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
