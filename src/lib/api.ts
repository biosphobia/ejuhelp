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
  /** The EJU subject this concept belongs to (server-judged from the concept). */
  subject?: Subject;
}

export type ProfileKind = 'style' | 'struggle' | 'strength';
export interface ProfileNoteDTO {
  kind: ProfileKind;
  text: string;
}

export interface AskResponse {
  text: string;
  keyPoints: KeyPointDTO[];
  /** Durable observations about the learner the coach made this turn. */
  profile: ProfileNoteDTO[];
}
export const askClaude = (p: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  context?: string;
  profile?: string[];
}) => call<AskResponse>('claude/ask', p);

export type Difficulty = 'easy' | 'medium' | 'hard';
export interface GenQuestion {
  id: string;
  topic: string;
  prompt: string;
  choices?: string[];
  answerIndex: number; // 0-based correct choice, or -1 if not multiple-choice
  answer: string;
  explanation: string;
  /** Optional simple SVG schematic of the setup, to copy onto the whiteboard. */
  figure?: string;
  /** For mock-exam questions: 1-based page of the original PDF this question is on. */
  page?: number;
  /** For mock-exam questions: the 1-based PDF page(s) this question spans (a math 大問
   *  can run over two pages). When set, the viewer shows exactly these pages. */
  pages?: number[];
  /** Optional [y0,y1] vertical crop (page-height fractions) when several questions share
   *  a page, so the viewer shows just this question's region of the page. */
  rect?: [number, number];
}
export interface GenerateResponse {
  questions: GenQuestion[];
}
export const generateQuestions = (p: {
  subject: Subject;
  lang: Lang;
  /** Sub-topic / topic ids to draw from; questions are spread randomly across them. */
  topics?: string[];
  difficulty: Difficulty;
  count: number;
  focus?: { topics?: string[]; tags?: string[] };
}) => call<GenerateResponse>('claude/generate', p);

export interface CheckResponse {
  feedback: string;
  correct: 'yes' | 'no' | 'partial' | 'unknown';
  /** Subject the coach inferred the work belongs to (''/empty if unsure). */
  subject: Subject | '';
  topic: string;
  errorTags: string[];
  /** 0-based choice the student concluded for an MCQ, or -1 if none/unclear. */
  studentAnswerIndex: number;
  /** Memorize-worthy concepts this problem tests, for the Mindmap. */
  keyPoints: KeyPointDTO[];
  /** Durable observations about the learner, from how they solved this. */
  profile: ProfileNoteDTO[];
}
export const checkWork = (p: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  /** Official answer for the attached question, so grading is checked against it. */
  answer?: string;
  /** Reference worked solution, to pinpoint the student's first mistake. */
  solution?: string;
  note?: string;
  messages?: ChatMessage[];
  profile?: string[];
  /** The image is only the region the student selected, not the whole page. */
  selection?: boolean;
}) => call<CheckResponse>('claude/check', p);

/** Analyse the whiteboard and HELP the student (explanation, not grading). */
export const explainBoard = (p: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  note?: string;
  messages?: ChatMessage[];
  profile?: string[];
  /** The image is only the region the student selected, not the whole page. */
  selection?: boolean;
}) => call<AskResponse>('claude/explain', p);

export interface ConceptsResponse {
  concepts: KeyPointDTO[];
}
/** Extract + categorize Mindmap concepts from arbitrary study material. */
export const extractConcepts = (p: { subject: Subject; lang: Lang; text: string }) =>
  call<ConceptsResponse>('claude/concepts', p);

/** A concept passed to the Mindmap coach so it can reference/edit existing nodes. */
export interface MindmapConceptDTO {
  id: string;
  kind: 'formula' | 'fact';
  text: string;
  category: string;
  /** Whether the student starred (favourited) this concept. */
  starred?: boolean;
}
export type MindmapOp =
  | { op: 'add'; kind: 'formula' | 'fact'; text: string; category: string }
  | { op: 'remove'; id: string }
  | { op: 'update'; id: string; text?: string; kind?: 'formula' | 'fact'; category?: string };
export interface MindmapCoachResponse {
  text: string;
  ops: MindmapOp[];
}
export const mindmapCoach = (p: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  concepts: MindmapConceptDTO[];
}) => call<MindmapCoachResponse>('claude/mindmap-coach', p);

export interface TopicsResponse {
  topics: { id: string; name: string }[];
  subtopics: { id: string; name: string; group: string; topicId: string }[];
}
export const fetchTopics = (p: { subject: Subject; lang: Lang }) =>
  call<TopicsResponse>('eju/topics', p);

// ── Mindmap node endpoints ──
export interface TopicAttemptDTO {
  prompt?: string;
  correct?: boolean;
  errorTags?: string[];
  reasoning?: string;
}
/** Beginner-friendly EJU study sheet for one topic/subtopic (cached on the client). */
export const fetchStudySheet = (p: { subject: Subject; lang: Lang; topicId: string }) =>
  call<{ text: string }>('claude/study-sheet', p);
/** Condense a coach reply into a short plain-text note for the whiteboard. */
export const fetchNoteSummary = (p: { subject: Subject; lang: Lang; text: string }) =>
  call<{ text: string }>('claude/note-summary', p);
/** Big-picture strength/weakness read for a node, from the student's attempts on it. */
export const fetchTopicMastery = (p: {
  subject: Subject;
  lang: Lang;
  topicId: string;
  history: TopicAttemptDTO[];
}) => call<{ text: string }>('claude/topic-mastery', p);

export interface LessonPlanLessonDTO {
  id: string;
  label: string;
  why: string;
}
export interface LessonPlanPhaseDTO {
  title: string;
  lessons: LessonPlanLessonDTO[];
}
/** A structured, prioritized EJU study path (ordered phases of topic-node lessons). */
export const fetchLessonPlan = (p: { subject: Subject; lang: Lang; weak?: string[] }) =>
  call<{ phases: LessonPlanPhaseDTO[] }>('claude/lesson-plan', p);

export interface ExamMeta {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  count: number;
  /** Google Drive file id of the original EJU PDF (for the zoomable embed). */
  pdfId?: string;
}
export interface Exam {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  /** Google Drive file id of the original EJU PDF (for the zoomable embed). */
  pdfId?: string;
  questions: GenQuestion[];
}
export const fetchExams = () => call<{ exams: ExamMeta[] }>('eju/exams', {});
export const fetchExam = (id: string, lang: Lang) => call<Exam>('eju/exam', { id, lang });
