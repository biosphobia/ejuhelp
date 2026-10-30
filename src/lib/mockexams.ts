import { create } from 'zustand';
import { generateMockExam, type GeneratedExam, type MockDifficulty } from './api';
import { useUI, type Subject } from './ui';

/** How one sitting of an exam went (generated or past paper). */
export interface ExamResult {
  examId: string;
  /** question id → chosen option index (multiple choice). */
  picked: Record<string, number>;
  /** question id → box label → what was written (math). */
  blanks: Record<string, Record<string, string>>;
  correct: number;
  /** Questions that can be scored (multiple choice or boxes). */
  total: number;
  startedAt: number;
  finishedAt: number;
}

export interface MockRequest {
  subject: Subject;
  difficulty: MockDifficulty;
  course?: 1 | 2;
}
export interface PendingMock extends MockRequest {
  jobId: string;
  ts: number;
}

/** Exams kept per account (the newest ones). */
const KEEP = 8;
/** The account copy is one document: stay well under Firestore's 1 MiB. */
const MAX_JSON = 750_000;

interface MockExamsState {
  exams: GeneratedExam[];
  /** Ids of exams deleted here, so another device's copy does not bring them back. */
  removed: string[];
  /** Latest result per exam id (generated exams and past papers). */
  results: Record<string, ExamResult>;
  pending: PendingMock | null;
  busy: boolean;
  error: unknown | null;
  rev: number;
  run: (req: MockRequest) => Promise<void>;
  resume: () => Promise<void>;
  remove: (id: string) => void;
  saveResult: (r: ExamResult) => void;
  clearError: () => void;
  load: (data: { exams?: unknown; results?: unknown; removed?: unknown; pending?: unknown } | null | undefined) => void;
}

/** Combine two copies (device and account): every exam and result from either side is kept, deletions win. */
export function mergeMockExams(a: any, b: any, aIsNewer: boolean) {
  const removed = [...new Set([...(Array.isArray(a?.removed) ? a.removed : []), ...(Array.isArray(b?.removed) ? b.removed : [])])]
    .filter((x) => typeof x === 'string')
    .sort()
    .slice(-60);
  const gone = new Set(removed);
  const byId = new Map<string, GeneratedExam>();
  for (const e of [...(Array.isArray(b?.exams) ? b.exams : []), ...(Array.isArray(a?.exams) ? a.exams : [])]) if (validExam(e) && !gone.has(e.id)) byId.set(e.id, e);
  const results: Record<string, ExamResult> = {};
  for (const src of [b?.results, a?.results])
    for (const [k, v] of Object.entries((src && typeof src === 'object' ? src : {}) as Record<string, ExamResult>))
      if (v && typeof v.finishedAt === 'number' && (!results[k] || v.finishedAt > results[k].finishedAt) && !gone.has(k)) results[k] = v;
  const lead = aIsNewer ? a : b;
  return { exams: cap([...byId.values()], results), results, removed, pending: lead?.pending ?? null };
}

const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Newest first, capped by count and by size. */
function cap(exams: GeneratedExam[], results: Record<string, ExamResult>) {
  let out = [...exams].sort((a, b) => b.generatedAt - a.generatedAt).slice(0, KEEP);
  while (out.length > 1 && JSON.stringify({ out, results }).length > MAX_JSON) out = out.slice(0, -1);
  return out;
}

function validExam(e: any): e is GeneratedExam {
  return e && typeof e.id === 'string' && typeof e.subject === 'string' && Array.isArray(e.questions) && typeof e.generatedAt === 'number';
}

export const useMockExams = create<MockExamsState>((set, get) => {
  const finish = (exam: GeneratedExam) =>
    set((s) => ({ exams: cap([plain(exam), ...s.exams.filter((e) => e.id !== exam.id)], s.results), rev: s.rev + 1 }));
  return {
    exams: [],
    removed: [],
    results: {},
    pending: null,
    busy: false,
    error: null,
    rev: 0,
    clearError: () => set({ error: null }),
    run: async (req) => {
      if (get().busy) return;
      set({ busy: true, error: null });
      let jobId: string | undefined;
      try {
        const exam = await generateMockExam(
          { ...req, lang: useUI.getState().lang },
          {
            onJob: (id) => {
              jobId = id;
              const p: PendingMock = { subject: req.subject, difficulty: req.difficulty, jobId: id, ts: Date.now(), ...(req.course ? { course: req.course } : {}) };
              set((s) => ({ pending: p, rev: s.rev + 1 }));
            },
          }
        );
        // Another device signed into the account may have applied it already.
        if (!jobId || get().pending?.jobId === jobId) finish(exam);
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
      set({ busy: true, error: null });
      try {
        const exam = await generateMockExam(
          { subject: p.subject, difficulty: p.difficulty, course: p.course, lang: useUI.getState().lang },
          { jobId: p.jobId }
        );
        if (get().pending?.jobId === p.jobId) finish(exam);
      } catch (e) {
        if (get().pending?.jobId === p.jobId) set({ error: e });
      } finally {
        set((s) => ({ busy: false, pending: s.pending?.jobId === p.jobId ? null : s.pending, rev: s.rev + 1 }));
      }
    },
    remove: (id) =>
      set((s) => {
        const { [id]: _drop, ...results } = s.results;
        return { exams: s.exams.filter((e) => e.id !== id), results, removed: [...s.removed.filter((x) => x !== id), id].sort().slice(-60), rev: s.rev + 1 };
      }),
    saveResult: (r) => set((s) => ({ results: { ...s.results, [r.examId]: plain(r) }, rev: s.rev + 1 })),
    load: (data) =>
      set((s) => {
        const exams = Array.isArray(data?.exams) ? (data!.exams as unknown[]).filter(validExam) : [];
        const results: Record<string, ExamResult> = {};
        if (data?.results && typeof data.results === 'object')
          for (const [k, v] of Object.entries(data.results as Record<string, any>))
            if (v && typeof v.correct === 'number' && typeof v.total === 'number') results[k] = v as ExamResult;
        const pending = data?.pending as PendingMock | null | undefined;
        const removed = Array.isArray(data?.removed) ? (data!.removed as unknown[]).filter((x): x is string => typeof x === 'string').slice(-60) : [];
        return {
          exams: cap(exams.filter((e) => !removed.includes(e.id)), results),
          removed,
          results,
          pending: pending === undefined ? s.pending : pending && typeof pending.jobId === 'string' ? pending : null,
          rev: s.rev + 1,
        };
      }),
  };
});
