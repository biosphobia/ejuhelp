import { create } from 'zustand';
import type { GenQuestion } from './api';
import type { Subject } from './ui';

/** Everything the practice generator produced, kept per subject until the user clears it. */
export interface GeneratedSet {
  questions: GenQuestion[];
  /** When this set was generated. */
  ts: number;
}

interface GeneratedState {
  sets: Partial<Record<Subject, GeneratedSet>>;
  /** Bumped whenever `sets` change; drives local + cloud autosave. */
  rev: number;
  setQuestions: (subject: Subject, questions: GenQuestion[]) => void;
  /** Insert questions right after `afterId` (or at the end) without dropping the rest. */
  addQuestions: (subject: Subject, questions: GenQuestion[], afterId?: string) => void;
  /** Wipe one subject's set, or every subject's when omitted. */
  clear: (subject?: Subject) => void;
  /** Replace all sets from a saved copy (localStorage / Firestore). */
  load: (sets: Partial<Record<Subject, GeneratedSet>>) => void;
}

const SUBJECT_KEYS: Subject[] = ['physics', 'chemistry', 'biology', 'math'];

function sanitize(raw: any): Partial<Record<Subject, GeneratedSet>> {
  const out: Partial<Record<Subject, GeneratedSet>> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const k of SUBJECT_KEYS) {
    const v = raw[k];
    if (v && Array.isArray(v.questions) && v.questions.length) {
      out[k] = { questions: v.questions, ts: typeof v.ts === 'number' ? v.ts : Date.now() };
    }
  }
  return out;
}

export const useGenerated = create<GeneratedState>((set) => ({
  sets: {},
  rev: 0,
  setQuestions: (subject, questions) =>
    set((s) => ({
      sets: { ...s.sets, [subject]: { questions, ts: Date.now() } },
      rev: s.rev + 1,
    })),
  addQuestions: (subject, questions, afterId) =>
    set((s) => {
      const cur = s.sets[subject]?.questions ?? [];
      const i = afterId ? cur.findIndex((q) => q.id === afterId) : -1;
      const next = i >= 0 ? [...cur.slice(0, i + 1), ...questions, ...cur.slice(i + 1)] : [...cur, ...questions];
      return { sets: { ...s.sets, [subject]: { questions: next, ts: s.sets[subject]?.ts ?? Date.now() } }, rev: s.rev + 1 };
    }),
  clear: (subject) =>
    set((s) => {
      if (!subject) return { sets: {}, rev: s.rev + 1 };
      const { [subject]: _drop, ...rest } = s.sets;
      return { sets: rest, rev: s.rev + 1 };
    }),
  load: (sets) => set((s) => ({ sets: sanitize(sets), rev: s.rev + 1 })),
}));
