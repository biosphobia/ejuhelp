import { create } from 'zustand';
import { generateQuestions, type Difficulty, type GenQuestion } from './api';
import { useUI, type Subject } from './ui';
import { loadNotes } from '../data/notes';

/** Everything the practice generator produced, kept per subject until the user clears it. */
export interface GeneratedSet {
  questions: GenQuestion[];
  /** When this set was generated. */
  ts: number;
}

/** Parameters of a generation request, kept so it can be resumed or retried. */
export interface GenRequest {
  subject: Subject;
  topic?: string;
  difficulty: Difficulty;
  count: number;
  focus?: { topics?: string[]; tags?: string[] };
  noteCore?: string;
}
export interface PendingGen extends GenRequest {
  jobId: string;
  ts: number;
}

interface GeneratedState {
  sets: Partial<Record<Subject, GeneratedSet>>;
  /** Bumped whenever `sets` change; drives local + cloud autosave. */
  rev: number;
  /** A request whose answer has not arrived yet (survives closing the panel or a reload). */
  pending: PendingGen | null;
  busy: boolean;
  error: unknown | null;
  /** Generate a set; the questions land in `sets` whenever the answer arrives. */
  run: (req: GenRequest) => Promise<void>;
  /** Pick up an interrupted generation (device slept, app closed). */
  resume: () => Promise<void>;
  clearError: () => void;
  setQuestions: (subject: Subject, questions: GenQuestion[]) => void;
  /** Insert questions right after `afterId` (or at the end) without dropping the rest. */
  addQuestions: (subject: Subject, questions: GenQuestion[], afterId?: string) => void;
  /** Wipe one subject's set, or every subject's when omitted. */
  clear: (subject?: Subject) => void;
  /** Replace all sets from a saved copy (localStorage / Firestore). */
  load: (sets: Partial<Record<Subject, GeneratedSet>>, pending?: PendingGen | null) => void;
}

const SUBJECT_KEYS: Subject[] = ['physics', 'chemistry', 'biology', 'math'];

/** The study note's core idea for a subtopic, so generated questions test what was read. */
export async function noteCoreFor(subject: Subject, topic: string | undefined, lang: string): Promise<string | undefined> {
  if (!topic) return undefined;
  const data = await loadNotes(subject).catch(() => null);
  const n = data?.notes[topic];
  return n ? n.core[lang === 'ja' ? 'ja' : 'en'] : undefined;
}

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

export const useGenerated = create<GeneratedState>((set, get) => ({
  sets: {},
  rev: 0,
  pending: null,
  busy: false,
  error: null,
  clearError: () => set({ error: null }),
  run: async (req) => {
    if (get().busy) return;
    set({ busy: true, error: null });
    const lang = useUI.getState().lang;
    try {
      const res = await generateQuestions(
        { subject: req.subject, lang, topic: req.topic, difficulty: req.difficulty, count: req.count, focus: req.focus, noteCore: req.noteCore },
        { onJob: (jobId) => set((s) => ({ pending: { ...req, jobId, ts: Date.now() }, rev: s.rev + 1 })) }
      );
      set((s) => ({
        sets: { ...s.sets, [req.subject]: { questions: res.questions, ts: Date.now() } },
        rev: s.rev + 1,
      }));
    } catch (e) {
      set({ error: e });
    } finally {
      set((s) => ({ busy: false, pending: null, rev: s.rev + 1 }));
    }
  },
  resume: async () => {
    const p = get().pending;
    if (!p || get().busy) return;
    if (Date.now() - p.ts > 40 * 60_000) {
      set((s) => ({ pending: null, rev: s.rev + 1 }));
      return;
    }
    const lang = useUI.getState().lang;
    set({ busy: true, error: null });
    try {
      const res = await generateQuestions(
        { subject: p.subject, lang, topic: p.topic, difficulty: p.difficulty, count: p.count, focus: p.focus, noteCore: p.noteCore },
        { jobId: p.jobId }
      );
      set((s) => ({ sets: { ...s.sets, [p.subject]: { questions: res.questions, ts: Date.now() } }, rev: s.rev + 1 }));
    } catch (e) {
      set({ error: e });
    } finally {
      set((s) => ({ busy: false, pending: null, rev: s.rev + 1 }));
    }
  },
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
      if (!subject) return { sets: {}, pending: null, rev: s.rev + 1 };
      const { [subject]: _drop, ...rest } = s.sets;
      return { sets: rest, rev: s.rev + 1 };
    }),
  load: (sets, pending) =>
    set((s) => ({
      sets: sanitize(sets),
      pending: pending && typeof pending.jobId === 'string' ? pending : s.pending,
      rev: s.rev + 1,
    })),
}));
