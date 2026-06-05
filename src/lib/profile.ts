import { create } from 'zustand';

const newId = () => Math.random().toString(36).slice(2, 10);
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** style = how they like things explained; struggle = what they find hard; strength = what they're solid on. */
export type ProfileKind = 'style' | 'struggle' | 'strength';

export interface ProfileNote {
  id: string;
  ts: number;
  kind: ProfileKind;
  text: string;
}

export interface ProfileNoteDTO {
  kind: ProfileKind;
  text: string;
}

interface ProfileState {
  notes: ProfileNote[];
  rev: number;
  /** Merge coach-observed notes about the learner, de-duplicated by kind+text. Returns # new. */
  addNotes: (dtos: ProfileNoteDTO[]) => number;
  remove: (id: string) => void;
  clear: () => void;
  load: (notes: ProfileNote[]) => void;
}

const CAP = 60;
const KINDS: ProfileKind[] = ['style', 'struggle', 'strength'];

export const useLearnerProfile = create<ProfileState>((set, get) => ({
  notes: [],
  rev: 0,
  addNotes: (dtos) => {
    const existing = new Set(get().notes.map((n) => `${n.kind}:${norm(n.text)}`));
    const fresh: ProfileNote[] = [];
    for (const d of dtos) {
      const text = d?.text?.trim();
      if (!text) continue;
      const kind = KINDS.includes(d.kind) ? d.kind : 'style';
      const key = `${kind}:${norm(text)}`;
      if (existing.has(key)) continue;
      existing.add(key);
      fresh.push({ id: newId(), ts: Date.now(), kind, text });
    }
    if (fresh.length) set((s) => ({ notes: [...fresh, ...s.notes].slice(0, CAP), rev: s.rev + 1 }));
    return fresh.length;
  },
  remove: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id), rev: s.rev + 1 })),
  clear: () => set((s) => ({ notes: [], rev: s.rev + 1 })),
  load: (notes) => set((s) => ({ notes: Array.isArray(notes) ? notes : [], rev: s.rev + 1 })),
}));

/** Compact, human-readable lines describing the learner, for the coach's context. */
export function learnerProfileLines(): string[] {
  return useLearnerProfile.getState().notes.slice(0, 30).map((n) => `(${n.kind}) ${n.text}`);
}
