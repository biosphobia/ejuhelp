import { create } from 'zustand';
import type { StringKey } from '../i18n';

/** A separate whiteboard the user can switch between at the bottom bar. */
export type NotebookId = 'physics' | 'chemistry' | 'biology' | 'math' | 'general';

export const NOTEBOOKS: NotebookId[] = ['physics', 'chemistry', 'biology', 'math', 'general'];
export const DEFAULT_NOTEBOOK: NotebookId = 'general';

/** i18n key for each notebook's label. */
export const NOTEBOOK_LABEL: Record<NotebookId, StringKey> = {
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  math: 'math',
  general: 'general',
};

/** At-a-glance colour cue per notebook (used to tint the switcher icon). */
export const NOTEBOOK_COLOR: Record<NotebookId, string> = {
  physics: '#2563eb',
  chemistry: '#7c3aed',
  biology: '#10b981',
  math: '#e11d48',
  general: '#64748b',
};

interface NotebookState {
  active: NotebookId;
  /** Set the active notebook id. The actual page swap/save is driven by persistence. */
  _setActive: (id: NotebookId) => void;
}

export const useNotebook = create<NotebookState>((set) => ({
  active: DEFAULT_NOTEBOOK,
  _setActive: (active) => set({ active }),
}));
