import { getIdToken } from './auth';
import type { Subject, Lang } from './ui';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function call<T>(path: string, body: unknown): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(String(data?.error ?? 'request_failed'), res.status);
  }
  return data as T;
}

export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AskResponse {
  text: string;
}
export const askClaude = (p: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
}) => call<AskResponse>('claude/ask', p);

export type Difficulty = 'easy' | 'medium' | 'hard';
export interface GenQuestion {
  id: string;
  topic: string;
  prompt: string;
  choices?: string[];
  answer: string;
  explanation: string;
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
}) => call<GenerateResponse>('claude/generate', p);

export interface CheckResponse {
  text: string;
}
export const checkWork = (p: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
}) => call<CheckResponse>('claude/check', p);

export interface NotesResponse {
  text: string;
}
export const makeNotes = (p: {
  subject: Subject;
  lang: Lang;
  topic?: string;
}) => call<NotesResponse>('claude/notes', p);

export interface TopicsResponse {
  topics: { id: string; name: string }[];
}
export const fetchTopics = (p: { subject: Subject; lang: Lang }) =>
  call<TopicsResponse>('eju/topics', p);
