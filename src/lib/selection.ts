import { create } from 'zustand';

/** The strokes currently selected with the select tool (ids). Published by the
 *  whiteboard so the coach can scope "check / explain" to just that region. */
interface SelectionState {
  ids: string[];
  set: (ids: string[]) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  ids: [],
  set: (ids) => set({ ids }),
}));
