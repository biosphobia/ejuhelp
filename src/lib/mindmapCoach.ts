import { create } from 'zustand';
import { mindmapCoach as callMindmapCoach, type ChatMessage } from './api';
import { useUI } from './ui';
import { useMindmap } from './mindmap';

export interface MindmapChange {
  added: number;
  removed: number;
  updated: number;
}

interface MindmapCoachState {
  messages: ChatMessage[];
  busy: boolean;
  error: unknown | null;
  /** Summary of edits the most recent reply applied to the map (null if none). */
  lastChange: MindmapChange | null;
  send: (text: string) => Promise<void>;
  reset: () => void;
}

/** Conversational coach scoped to the active subject's Mindmap: searches it and
 *  applies the edits it returns straight into the (persisted) mindmap store. */
export const useMindmapCoach = create<MindmapCoachState>((set, get) => ({
  messages: [],
  busy: false,
  error: null,
  lastChange: null,
  reset: () => set({ messages: [], error: null, lastChange: null }),
  send: async (text) => {
    const t = text.trim();
    if (!t || get().busy) return;
    const { subject, lang } = useUI.getState();
    const concepts = useMindmap
      .getState()
      .concepts.filter((c) => c.subject === subject)
      .map((c) => ({ id: c.id, kind: c.kind, text: c.text, category: c.topic, starred: !!c.starred }));
    const next: ChatMessage[] = [...get().messages, { role: 'user', content: t }];
    set({ messages: next, busy: true, error: null, lastChange: null });
    try {
      const res = await callMindmapCoach({ subject, lang, messages: next, concepts });
      const change = useMindmap.getState().applyOps(subject, res.ops ?? []);
      const touched = change.added || change.removed || change.updated;
      set({
        messages: [...next, { role: 'assistant', content: res.text }],
        lastChange: touched ? change : null,
      });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
}));
