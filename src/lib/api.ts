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

async function call<T>(path: string, body: unknown): Promise<T> {
  const token = await getIdToken();
  
  const { activeModel, claudeKey, gptKey, geminiKey } = useApiStore.getState();
  const userKey = activeModel === 'claude' ? claudeKey : activeModel === 'gpt' ? gptKey : activeModel === 'gemini' ? geminiKey : undefined;

  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userKey ? { 'x-user-api-key': userKey } : {}),
    },
    body: JSON.stringify({ ...(body as Record<string, unknown>), model: activeModel }),
  });
  
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
}
export const askClaude = (p: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  context?: string;
  /** Study notes the student is currently reading (from the EJU calendar). */
  notes?: string;
}) =>
  call<AskResponse>('claude/ask', p);

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
}) => call<GenerateResponse>('claude/generate', p);

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
}) => call<CheckResponse>('claude/check', p);

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
