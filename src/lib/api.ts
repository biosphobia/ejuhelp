import { getIdToken } from './auth';
import type { Subject, Lang } from './ui';
import { useApiStore } from './apiStore';

export class ApiError extends Error {
  status: number;
  code: string;
  detail?: string;
  constructor(code: string, status: number, detail?: string) {
    super(detail || code);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

/** Thrown locally (no network call) when the page has nothing to check. */
export class EmptyBoardError extends Error {
  constructor() {
    super('empty_board');
  }
}

const newJobId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken().catch(() => null);
  const { activeModel, claudeKey, gptKey, geminiKey } = useApiStore.getState();
  const userKey = activeModel === 'claude' ? claudeKey : activeModel === 'gpt' ? gptKey : activeModel === 'gemini' ? geminiKey : undefined;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userKey ? { 'x-user-api-key': userKey } : {}),
  };
}

const PENDING = Symbol('pending');
type Answer<T> = T | typeof PENDING;

async function readResponse<T>(res: Response): Promise<Answer<T>> {
  if (res.status === 202) return PENDING;
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(
      String(data?.error ?? 'request_failed'),
      res.status,
      typeof data?.message === 'string' ? (data.message as string) : undefined
    );
  }
  return data as T;
}

/** Sleep, but wake early when the device comes back (tab visible again / online). */
function waitAwake(ms: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('online', finish);
      resolve();
    };
    const onWake = () => {
      if (document.visibilityState === 'visible') finish();
    };
    const timer = setTimeout(finish, ms);
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('online', finish);
  });
}

/** 5xx and 408/429 are worth retrying; a 400 will fail the same way every time. */
const isRetryableStatus = (s: number) => s >= 500 || s === 408 || s === 429;

/** Ask the server for the answer to a job that was already started. */
async function pollJob<T>(jobId: string): Promise<Answer<T>> {
  const res = await fetch(`/api/claude/job/${encodeURIComponent(jobId)}`, { headers: await authHeaders() });
  return readResponse<T>(res);
}

export interface CallOpts {
  /** Reuse an id from an earlier attempt so the server returns the same answer. */
  jobId?: string;
  /** Called with the id before the request goes out, so it can be saved for later. */
  onJob?: (jobId: string) => void;
  /** Give up after this long (default 15 minutes). The job stays on the server. */
  totalMs?: number;
}

/**
 * POST that survives the device sleeping. The request carries a job id; if the
 * connection dies the server keeps working, and every retry (or a later poll)
 * returns that same answer instead of starting again.
 */
async function call<T>(path: string, body: unknown, opts: CallOpts = {}): Promise<T> {
  const jobId = opts.jobId ?? newJobId();
  opts.onJob?.(jobId);
  const deadline = Date.now() + (opts.totalMs ?? 15 * 60_000);
  const { activeModel } = useApiStore.getState();
  let attempt = 0;
  let started = Boolean(opts.jobId); // a resumed call already has work running

  while (true) {
    try {
      let out: Answer<T>;
      if (started) {
        out = await pollJob<T>(jobId);
      } else {
        const res = await fetch(`/api/${path}`, {
          method: 'POST',
          headers: await authHeaders(),
          body: JSON.stringify({ ...(body as Record<string, unknown>), model: activeModel, jobId }),
        });
        out = await readResponse<T>(res);
        started = true;
      }
      if (out !== PENDING) return out as T;
      attempt = 0; // the server is working on it; keep checking calmly
      await waitAwake(2500);
    } catch (e) {
      // The job vanished (server restarted): start it again from scratch.
      if (e instanceof ApiError && e.code === 'job_gone') {
        started = false;
        await waitAwake(500);
      } else if (e instanceof ApiError && !isRetryableStatus(e.status)) {
        throw e;
      } else {
        // Network hiccup or 5xx. The job id makes retrying safe: the server
        // either resumes the same work or hands back the finished answer.
        attempt++;
        await waitAwake(Math.min(15_000, 800 * 2 ** Math.min(attempt, 4)));
      }
    }
    if (Date.now() > deadline) throw new ApiError('timeout', 504);
  }
}

export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface KeyPointDTO {
  kind: 'formula' | 'fact';
  text: string;
  topic?: string;
}

/** Structured takeaway the coach appends to each answer. */
export interface AskSummary {
  keyIdea: string;
  formulas: string[];
  traps: string[];
  nextQuestions: string[];
  topicId?: string;
}

export interface AskResponse {
  text: string;
  keyPoints: KeyPointDTO[];
  summary?: AskSummary | null;
  /** Practice questions the coach wrote on request (sent to the practice panel). */
  questions?: GenQuestion[];
}
export const askClaude = (p: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  context?: string;
  /** Study notes the student is currently reading (from the EJU calendar). */
  notes?: string;
  /** PNG capture of the current whiteboard page, so the coach can read handwritten notes. */
  imageDataUrl?: string;
  profile?: string[];
}, opts?: CallOpts) => call<AskResponse>('claude/ask', p, opts);

export type Difficulty = 'easy' | 'medium' | 'hard';
export interface GenQuestion {
  id: string;
  topic: string;
  /** Knowledge-base subtopic id the question was generated for (links back to the notes). */
  topicId?: string;
  prompt: string;
  choices?: string[];
  answerIndex: number; // 0-based correct choice, or -1 if not multiple-choice
  answer: string;
  explanation: string;
  /** A nudge toward the first step that does not give the answer away. */
  hint?: string;
  /** The one idea the question tests. */
  keyIdea?: string;
  /** Why each option is right / which mistake produces it (same order as choices). */
  choiceNotes?: string[];
  /** The typical mistake this question catches. */
  trap?: string;
  /** Set on real past-paper questions (e.g. "EJU 2019-1"). */
  source?: string;
}
export interface GenerateResponse {
  questions: GenQuestion[];
}
export const generateQuestions = (p: {
  subject: Subject;
  lang: Lang;
  topic?: string;
  difficulty: Difficulty;
  count: number;
  focus?: { topics?: string[]; tags?: string[] };
  /** Ask for variants of one question (same idea, new numbers / angle). */
  similarTo?: { prompt: string; answer?: string };
  /** The note's core idea so questions test what was just studied. */
  noteCore?: string;
}, opts?: CallOpts) => call<GenerateResponse>('claude/generate', p, opts);

export interface CheckResponse {
  feedback: string;
  correct: 'yes' | 'no' | 'partial' | 'unknown';
  topic: string;
  errorTags: string[];
  /** 0-based choice the student concluded for an MCQ, or -1 if none/unclear. */
  studentAnswerIndex: number;
}
export const checkWork = (p: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  profile?: string[];
}, opts?: CallOpts) => call<CheckResponse>('claude/check', p, opts);

export interface TidyBlock {
  kind: 'h1' | 'h2' | 'p' | 'bullet' | 'formula' | 'added' | 'fix';
  text: string;
}
export interface TidyRegion {
  kind: 'keep' | 'text';
  box: [number, number, number, number];
  label?: string;
  blocks?: TidyBlock[];
}
export interface TidyResponse {
  title: string;
  regions: TidyRegion[];
  note: string;
  observations: string[];
}
/** Rewrite a handwritten page as clean notes (returned as text blocks for the board). */
export const tidyPage = (p: { subject: Subject; lang: Lang; imageDataUrl: string; hint?: string; profile?: string[] }, opts?: CallOpts) =>
  call<TidyResponse>('claude/tidy', p, opts);

export interface KeyPointsResponse {
  keyPoints: KeyPointDTO[];
}
export const generateKeyPoints = (p: { subject: Subject; lang: Lang; topic?: string }) =>
  call<KeyPointsResponse>('claude/keypoints', p);

export interface TopicsResponse {
  topics: { id: string; name: string }[];
  subtopics: { id: string; name: string; group: string }[];
}
export const fetchTopics = (p: { subject: Subject; lang: Lang }) =>
  call<TopicsResponse>('eju/topics', p);

export interface ExamMeta {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  count: number;
}
export interface Exam {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  questions: GenQuestion[];
}
/** Real past EJU questions on one subtopic (physics / chemistry have rich extractions). */
export interface PastQuestion extends GenQuestion {
  source: string;
}
export const fetchPastQuestions = (p: { subject: Subject; topic: string; lang: Lang; limit?: number }) =>
  call<{ questions: PastQuestion[] }>('eju/past', p);

export const fetchExams = () => call<{ exams: ExamMeta[] }>('eju/exams', {});
export const fetchExam = (id: string, lang: Lang) => call<Exam>('eju/exam', { id, lang });
