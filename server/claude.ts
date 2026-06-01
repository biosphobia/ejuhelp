import Anthropic from '@anthropic-ai/sdk';
import { systemContextFor, labelFor, type Subject } from './eju';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const USE_THINKING = process.env.ANTHROPIC_THINKING !== 'off';

type Lang = 'en' | 'ja';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface KeyPointDTO {
  kind: 'formula' | 'fact';
  text: string;
  topic?: string;
}

let defaultClient: Anthropic | null = null;

function getClient(userKey?: string): Anthropic {
  if (userKey) {
    return new Anthropic({ apiKey: userKey });
  }
  if (!defaultClient) {
    defaultClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return defaultClient;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Create a message. If the model/SDK rejects a newer parameter with a 400,
 * retry once without `thinking` so the call still succeeds on older models.
 */
async function createMessage(params: any, userKey?: string): Promise<any> {
  const client = getClient(userKey);
  try {
    return await client.messages.create(params);
  } catch (e: any) {
    const status = e?.status;
    if (status === 400 && params.thinking) {
      const { thinking, ...rest } = params;
      console.warn('[claude] 400 with thinking; retrying without it:', e?.error?.error?.message ?? e?.message);
      return await client.messages.create(rest);
    }
    throw e;
  }
}

function baseParams(subject: Subject, lang: Lang, opts: { maxTokens: number; extra?: string }) {
  const p: any = {
    model: MODEL,
    max_tokens: opts.maxTokens,
    system: systemBlocks(subject, lang, opts.extra),
  };
  if (USE_THINKING) p.thinking = { type: 'adaptive' };
  return p;
}

const GLOBAL_INSTRUCTIONS =
  'You are an expert tutor and question-writer for the EJU (Examination for Japanese University ' +
  'Admission for International Students). You help students study efficiently and accurately. Be ' +
  'concise and exam-focused. Render math/science notation in clear plain text (e.g. x^2, sqrt(x), ' +
  '1/2, H2O, ->, Δ) so it reads well in a simple notes view — do not use LaTeX or `$` unless asked. ' +
  'Never invent claims about the EJU format; rely on the knowledge base provided below.';

const langLine = (lang: Lang) =>
  lang === 'ja' ? 'Always respond in Japanese (日本語).' : 'Always respond in English.';

function systemBlocks(subject: Subject, lang: Lang, extra?: string) {
  const blocks: any[] = [
    { type: 'text', text: GLOBAL_INSTRUCTIONS },
    { type: 'text', text: systemContextFor(subject), cache_control: { type: 'ephemeral' } },
    { type: 'text', text: langLine(lang) },
  ];
  if (extra) blocks.push({ type: 'text', text: extra });
  return blocks;
}

function textOf(message: { content?: Array<{ type: string; text?: string }> }): string {
  return (message.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('\n')
    .trim();
}

/** Robustly pull a JSON value out of a model reply (handles code fences / stray prose). */
function extractJson<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  let s = raw.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)
```/i.exec(s);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    /* fall through */
  }
  const startObj = s.indexOf('{');
  const startArr = s.indexOf('[');
  let start = -1;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);
  const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(s.slice(start, end + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  return fallback;
}

const writeLang = (lang: Lang) => (lang === 'ja' ? 'Japanese' : 'English');

function cleanKeyPoints(arr: any): KeyPointDTO[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((k) => k && typeof k.text === 'string' && k.text.trim())
    .slice(0, 6)
    .map((k) => ({
      kind: k.kind === 'fact' ? 'fact' : 'formula',
      text: String(k.text).trim(),
      topic: typeof k.topic === 'string' && k.topic ? k.topic : undefined,
    }));
}

// ─── Ask: conversational tutor that also auto-extracts memorize-worthy points ───
const ASK_DIRECTIVE =
  'Respond with ONLY a single JSON object and no other text or code fences: ' +
  '{"answer": "<your full tutoring reply, markdown allowed>", "keyPoints": [{"kind":"formula"|"fact","text":"...","topic":"..."}]}. ' +
  'Put 0-4 genuinely memorize-worthy formulas/key facts from your reply in "keyPoints" (empty array if none).';

export async function ask(args: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  userKey?: string;
}): Promise<{ text: string; keyPoints: KeyPointDTO[] }> {
  const messages = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return { text: '', keyPoints: [] };

  const r = await createMessage({
    ...baseParams(args.subject, args.lang, { maxTokens: 8000, extra: ASK_DIRECTIVE }),
    messages,
  }, args.userKey);
  
  const raw = textOf(r);
  const parsed = extractJson<{ answer?: string; keyPoints?: any } | null>(raw, null);
  if (!parsed) return { text: raw, keyPoints: [] }; // graceful: show the reply even if not JSON
  return { text: String(parsed.answer ?? raw), keyPoints: cleanKeyPoints(parsed.keyPoints) };
}

// ─── Generate EJU-style questions (with optional weak-point focus) ───
export interface GenQuestion {
  id: string;
  topic: string;
  prompt: string;
  choices?: string[];
  answerIndex: number;
  answer: string;
  explanation: string;
}

export async function generate(args: {
  subject: Subject;
  lang: Lang;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  focus?: { topics?: string[]; tags?: string[] };
  userKey?: string;
}): Promise<{ questions: GenQuestion[] }> {
  const n = Math.max(1, Math.min(5, args.count || 3));
  const tName = args.topic ? labelFor(args.subject, args.topic, args.lang) : null;

  const parts = [
    `Generate ${n} EJU-style ${args.subject} question(s)${tName ? ` specifically on: ${tName}` : ' across the most exam-relevant topics'}.`,
    `Difficulty: ${args.difficulty} ("medium" = typical EJU exam level).`,
    'Match the authentic EJU question style, format, topic scope, and difficulty from the knowledge base.',
    'Prefer multiple-choice with 4-5 plausible choices.',
  ];
  if (args.focus && (args.focus.topics?.length || args.focus.tags?.length)) {
    if (args.focus.topics?.length)
      parts.push(`Personalize: the student is currently weakest in: ${args.focus.topics.join('; ')}. Prioritize these.`);
    if (args.focus.tags?.length)
      parts.push(
        `They frequently make these mistakes: ${args.focus.tags.join(', ')}. Design questions that specifically probe and help fix them (e.g. require careful unit conversion if "units").`
      );
  }
  parts.push(`Write everything in ${writeLang(args.lang)}.`);
  parts.push(
    'Respond with ONLY a single JSON object, no other text or code fences: ' +
      '{"questions":[{"topic":"<sub-topic>","prompt":"...","choices":["..."],"answerIndex":<0-based index of the correct choice, or -1 if not multiple-choice>,"answer":"<correct answer in words>","explanation":"<clear worked solution>"}]}.'
  );

  const r = await createMessage({
    ...baseParams(args.subject, args.lang, { maxTokens: 16000 }),
    messages: [{ role: 'user', content: parts.join(' ') }],
  }, args.userKey);
  
  const parsed = extractJson<{ questions?: any[] }>(textOf(r), { questions: [] });
  const questions: GenQuestion[] = (parsed.questions ?? []).map((q: any, i: number) => {
    const choices = Array.isArray(q.choices) && q.choices.length ? q.choices.map(String) : undefined;
    const idx = Number.isInteger(q.answerIndex) ? q.answerIndex : -1;
    return {
      id: `${Date.now().toString(36)}-${i}`,
      topic: String(q.topic ?? tName ?? ''),
      prompt: String(q.prompt ?? ''),
      choices,
      answerIndex: choices && idx >= 0 && idx < choices.length ? idx : -1,
      answer: String(q.answer ?? ''),
      explanation: String(q.explanation ?? ''),
    };
  });
  return { questions };
}

// ─── Check handwritten work: structured grading that classifies the error type ───
const ERROR_TAGS = ['units', 'sign', 'arithmetic', 'algebra', 'concept', 'formula', 'misread', 'incomplete', 'none'];

export interface CheckResult {
  feedback: string;
  correct: 'yes' | 'no' | 'partial' | 'unknown';
  topic: string;
  errorTags: string[];
}

export async function check(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  userKey?: string;
}): Promise<CheckResult> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const instructions = [
    args.question
      ? `The student is working on this EJU practice question:\n"""\n${args.question}\n"""\n`
      : 'The student has written some work below (no specific question attached).\n',
    "The image is the student's handwritten work captured from a whiteboard.",
    'Respond with ONLY a single JSON object, no other text or code fences:',
    '{"feedback":"<markdown with short headings: transcribe the key readable steps; say whether it is correct; pinpoint the FIRST error precisely; give a short hint to fix it without revealing the full answer unless already complete; end with a one-line encouraging summary>",',
    `"correct":"yes"|"no"|"partial"|"unknown" (partial = on the right track but incomplete/with a fixable slip${args.question ? '' : '; often "unknown" with no question attached'}),`,
    '"topic":"<the specific EJU sub-topic>",',
    `"errorTags":[ subset of ${JSON.stringify(ERROR_TAGS)} ; use ["none"] if correct ]}.`,
    `Write "feedback" in ${writeLang(args.lang)}.`,
  ].join('\n');

  const r = await createMessage({
    ...baseParams(args.subject, args.lang, { maxTokens: 4000 }),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data } },
          { type: 'text', text: instructions },
        ],
      },
    ],
  }, args.userKey);
  
  const raw = textOf(r);
  const p = extractJson<Partial<CheckResult>>(raw, {});
  const correct = (['yes', 'no', 'partial', 'unknown'] as const).includes(p.correct as any)
    ? (p.correct as CheckResult['correct'])
    : 'unknown';
  const errorTags = Array.isArray(p.errorTags) ? p.errorTags.filter((t) => ERROR_TAGS.includes(t)) : [];
  return {
    feedback: String(p.feedback ?? raw ?? ''),
    correct,
    topic: String(p.topic ?? ''),
    errorTags,
  };
}

// ─── Key points generator (formulas/facts to memorize) ───
export async function keypoints(args: {
  subject: Subject;
  lang: Lang;
  topic?: string;
  userKey?: string;
}): Promise<{ keyPoints: KeyPointDTO[] }> {
  const tName = args.topic ? labelFor(args.subject, args.topic, args.lang) : null;
  const userText = [
    `List the most important must-memorize formulas and key facts for EJU ${args.subject}${tName ? ` on: ${tName}` : ''}.`,
    'Focus strictly on what a student must recall in the exam, based on the past-paper archetypes. Return 5-10 concise key points.',
    `Write each point in ${writeLang(args.lang)}.`,
    'Respond with ONLY a single JSON object, no other text or code fences: {"keyPoints":[{"kind":"formula"|"fact","text":"...","topic":"..."}]}.',
  ].join(' ');

  const r = await createMessage({
    ...baseParams(args.subject, args.lang, { maxTokens: 4000 }),
    messages: [{ role: 'user', content: userText }],
  }, args.userKey);
  
  const parsed = extractJson<{ keyPoints?: any }>(textOf(r), {});
  return { keyPoints: cleanKeyPoints(parsed.keyPoints) };
}
