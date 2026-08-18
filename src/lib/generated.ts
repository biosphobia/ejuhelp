import { create } from 'zustand';
import { generateQuestions, type Difficulty, type GenQuestion } from './api';
import type { Subject, Lang } from './ui';

/** A generated question kept in the saved pool, tagged with its subject. */
export interface SavedQuestion extends GenQuestion {
  subject: Subject;
  addedAt: number;
}

/** Hard cap on the saved pool — older questions are culled past this. */
export const MAX_SAVED = 30;

interface GeneratedState {
  /** Saved questions, newest first; capped at MAX_SAVED and synced to the account. */
  questions: SavedQuestion[];
  /** Selected sub-topic / topic ids, per subject. */
  selected: Partial<Record<Subject, string[]>>;
  /** True while a generation request is in flight (lives in the store so closing
   *  the panel can't abort it and reopening still shows progress). */
  generating: boolean;
  genError: unknown | null;
  rev: number;
  /** Run a generation request; results are saved even if the panel is closed mid-flight. */
  generate: (params: {
    subject: Subject;
    lang: Lang;
    topics?: string[];
    difficulty: Difficulty;
    count: number;
    focus?: { topics?: string[]; tags?: string[] };
  }) => Promise<void>;
  /** Append a freshly generated set, keep the newest MAX_SAVED, cull the rest. */
  addResult: (subject: Subject, qs: GenQuestion[]) => void;
  removeQuestion: (id: string) => void;
  clearQuestions: () => void;
  setSelected: (subject: Subject, ids: string[]) => void;
  load: (data: { questions?: SavedQuestion[]; selected?: Partial<Record<Subject, string[]>> }) => void;
}

/** Item-level union of two saved-question payloads: every question present on EITHER
 *  side survives (deduped by id, newest first, capped). Used for cloud reconcile AND
 *  live device sync — a stale device can therefore never erase the other's pool, which
 *  whole-array "newest copy wins" allowed (its innocent save stamped the cloud newer
 *  and wiped questions generated elsewhere). `a`'s topic selection wins ties. */
export function mergeGeneratedData(
  a: { questions?: SavedQuestion[]; selected?: Partial<Record<Subject, string[]>> } | null | undefined,
  b: { questions?: SavedQuestion[]; selected?: Partial<Record<Subject, string[]>> } | null | undefined
): { questions: SavedQuestion[]; selected: Partial<Record<Subject, string[]>> } {
  const qa = Array.isArray(a?.questions) ? a!.questions! : [];
  const qb = Array.isArray(b?.questions) ? b!.questions! : [];
  const have = new Set(qa.map((q) => q.id));
  const questions = [...qa, ...qb.filter((q) => q && q.id && !have.has(q.id))]
    .sort((x, y) => (y.addedAt ?? 0) - (x.addedAt ?? 0))
    .slice(0, MAX_SAVED);
  return { questions, selected: { ...(b?.selected ?? {}), ...(a?.selected ?? {}) } };
}

export const useGenerated = create<GeneratedState>((set, get) => ({
  questions: [],
  selected: {},
  generating: false,
  genError: null,
  rev: 0,
  generate: async (params) => {
    if (get().generating) return;
    set({ generating: true, genError: null });
    try {
      const res = await generateQuestions(params);
      get().addResult(params.subject, res.questions);
    } catch (e) {
      set({ genError: e });
    } finally {
      set({ generating: false });
    }
  },
  addResult: (subject, qs) =>
    set((s) => {
      const now = Date.now();
      const fresh: SavedQuestion[] = qs.map((q) => ({ ...q, subject, addedAt: now }));
      const freshIds = new Set(fresh.map((q) => q.id));
      // New set on top; drop any id collisions; keep only the newest MAX_SAVED.
      const merged = [...fresh, ...s.questions.filter((q) => !freshIds.has(q.id))].slice(0, MAX_SAVED);
      return { questions: merged, rev: s.rev + 1 };
    }),
  removeQuestion: (id) =>
    set((s) => ({ questions: s.questions.filter((q) => q.id !== id), rev: s.rev + 1 })),
  clearQuestions: () => set((s) => ({ questions: [], rev: s.rev + 1 })),
  setSelected: (subject, ids) =>
    set((s) => ({ selected: { ...s.selected, [subject]: ids }, rev: s.rev + 1 })),
  load: (data) =>
    set((s) => ({
      questions: Array.isArray(data?.questions) ? data.questions.slice(0, MAX_SAVED) : [],
      selected: data?.selected && typeof data.selected === 'object' ? data.selected : {},
      rev: s.rev + 1,
    })),
}));
