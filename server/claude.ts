import Anthropic from '@anthropic-ai/sdk';
import { systemContextFor, labelFor, type Subject } from './eju';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const EFFORT = (process.env.ANTHROPIC_EFFORT || 'medium') as 'low' | 'medium' | 'high' | 'max';

type Lang = 'en' | 'ja';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface KeyPointDTO {
  kind: 'formula' | 'fact';
  text: string;
  topic?: string;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}
export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const GLOBAL_INSTRUCTIONS =
  'You are an expert tutor and question-writer for the EJU (Examination for Japanese University ' +
  'Admission for International Students). You help students study efficiently and accurately. Be ' +
  'concise and exam-focused. Render math/science notation in clear plain text (e.g. x^2, sqrt(x), ' +
  '1/2, H2O, ->, Δ) so it reads well in a simple notes view — do not use LaTeX or `$` unless asked. ' +
  'Never invent claims about the EJU format; rely on the knowledge base provided below.';

const langLine = (lang: Lang) =>
  lang === 'ja' ? 'Always respond in Japanese (日本語).' : 'Always respond in English.';

// system = stable global + cached subject KB + small per-call directives (after the cache breakpoint)
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

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const writeLang = (lang: Lang) => (lang === 'ja' ? 'Japanese' : 'English');

const KEYPOINT_ITEM = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['formula', 'fact'] },
    text: { type: 'string' },
    topic: { type: 'string' },
  },
  required: ['kind', 'text'],
};

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
const ASK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    answer: { type: 'string' },
    keyPoints: { type: 'array', items: KEYPOINT_ITEM },
  },
  required: ['answer', 'keyPoints'],
};
const ASK_DIRECTIVE =
  'Respond as JSON: put your full tutoring reply (markdown allowed) in "answer", and 0-4 genuinely ' +
  'memorize-worthy formulas or key facts from your reply in "keyPoints" (kind "formula" or "fact", ' +
  'with the relevant topic). Leave "keyPoints" empty if nothing is truly worth memorizing.';

export async function ask(args: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
}): Promise<{ text: string; keyPoints: KeyPointDTO[] }> {
  const messages = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return { text: '', keyPoints: [] };

  const params: any = {
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT, format: { type: 'json_schema', schema: ASK_SCHEMA } },
    system: systemBlocks(args.subject, args.lang, ASK_DIRECTIVE),
    messages,
  };
  const r = await getClient().messages.create(params);
  const parsed = parseJson<{ answer?: string; keyPoints?: any }>(textOf(r), {});
  return { text: String(parsed.answer ?? ''), keyPoints: cleanKeyPoints(parsed.keyPoints) };
}

// ─── Generate EJU-style questions (with optional weak-point focus) ───
const QUESTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          topic: { type: 'string' },
          prompt: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          answerIndex: { type: 'integer' },
          answer: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['topic', 'prompt', 'answerIndex', 'answer', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

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
}): Promise<{ questions: GenQuestion[] }> {
  const n = Math.max(1, Math.min(5, args.count || 3));
  const tName = args.topic ? labelFor(args.subject, args.topic, args.lang) : null;

  const parts = [
    `Generate ${n} EJU-style ${args.subject} question(s)${tName ? ` specifically on: ${tName}` : ' across the most exam-relevant topics'}.`,
    `Difficulty: ${args.difficulty} ("medium" = typical EJU exam level).`,
    'Match the authentic EJU question style, format, topic scope, and difficulty from the knowledge base.',
    'Prefer multiple-choice: include 4-5 plausible choices and set "answerIndex" to the 0-based index of the correct choice. For a non-multiple-choice question, leave "choices" empty and set "answerIndex" to -1.',
    'Always also fill "answer" with the correct answer in words, and "explanation" with a clear worked solution.',
    '"topic" = the specific sub-topic tested.',
  ];
  if (args.focus && (args.focus.topics?.length || args.focus.tags?.length)) {
    if (args.focus.topics?.length) {
      parts.push(`Personalize for this student — they are currently weakest in: ${args.focus.topics.join('; ')}. Prioritize these.`);
    }
    if (args.focus.tags?.length) {
      parts.push(
        `They frequently make these mistakes: ${args.focus.tags.join(', ')}. Design questions that specifically probe and help correct these (e.g. require careful unit conversion if "units"; sign-sensitive steps if "sign").`
      );
    }
  }
  parts.push(`Write everything in ${writeLang(args.lang)}.`);

  const params: any = {
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT, format: { type: 'json_schema', schema: QUESTION_SCHEMA } },
    system: systemBlocks(args.subject, args.lang),
    messages: [{ role: 'user', content: parts.join(' ') }],
  };

  const r = await getClient().messages.create(params);
  const parsed = parseJson<{ questions?: any[] }>(textOf(r), { questions: [] });
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
const CHECK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    feedback: { type: 'string' },
    correct: { type: 'string', enum: ['yes', 'no', 'partial', 'unknown'] },
    topic: { type: 'string' },
    errorTags: { type: 'array', items: { type: 'string', enum: ERROR_TAGS } },
  },
  required: ['feedback', 'correct', 'topic', 'errorTags'],
};

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
}): Promise<CheckResult> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const instructions = [
    args.question
      ? `The student is working on this EJU practice question:\n"""\n${args.question}\n"""\n`
      : 'The student has written some work below (no specific question attached).\n',
    "The image is the student's handwritten work captured from a whiteboard.",
    'Produce JSON:',
    '- "feedback": markdown with short headings — briefly transcribe the key readable steps; say whether it is correct; pinpoint the FIRST error/misconception precisely; give a short hint to fix it WITHOUT revealing the full answer unless already complete; end with a one-line encouraging summary.',
    `- "correct": "yes" if fully correct, "no" if wrong, "partial" if on the right track but incomplete/with a fixable slip, "unknown" if you cannot tell${args.question ? '' : ' (often "unknown" with no question attached)'}.`,
    '- "topic": the specific EJU sub-topic this work is about.',
    '- "errorTags": the kinds of mistakes present, from this set only: units, sign, arithmetic, algebra, concept, formula, misread, incomplete, none. Use ["none"] if correct.',
    `Write "feedback" in ${writeLang(args.lang)}.`,
  ].join('\n');

  const params: any = {
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: EFFORT === 'low' ? 'medium' : EFFORT,
      format: { type: 'json_schema', schema: CHECK_SCHEMA },
    },
    system: systemBlocks(args.subject, args.lang),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data } },
          { type: 'text', text: instructions },
        ],
      },
    ],
  };
  const r = await getClient().messages.create(params);
  const p = parseJson<Partial<CheckResult>>(textOf(r), {});
  const correct = (['yes', 'no', 'partial', 'unknown'] as const).includes(p.correct as any)
    ? (p.correct as CheckResult['correct'])
    : 'unknown';
  const errorTags = Array.isArray(p.errorTags)
    ? p.errorTags.filter((t) => ERROR_TAGS.includes(t))
    : [];
  return {
    feedback: String(p.feedback ?? ''),
    correct,
    topic: String(p.topic ?? ''),
    errorTags,
  };
}

// ─── Key points generator (formulas/facts to memorize) ───
const KP_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: { keyPoints: { type: 'array', items: KEYPOINT_ITEM } },
  required: ['keyPoints'],
};

export async function keypoints(args: {
  subject: Subject;
  lang: Lang;
  topic?: string;
}): Promise<{ keyPoints: KeyPointDTO[] }> {
  const tName = args.topic ? labelFor(args.subject, args.topic, args.lang) : null;
  const userText = [
    `List the most important must-memorize formulas and key facts for EJU ${args.subject}${tName ? ` on: ${tName}` : ''}.`,
    'Focus strictly on what a student must be able to recall in the exam, based on the past-paper archetypes.',
    'Return 5-10 concise key points, each tagged kind "formula" or "fact" with its topic.',
    `Write each point in ${writeLang(args.lang)}.`,
  ].join(' ');

  const params: any = {
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT, format: { type: 'json_schema', schema: KP_SCHEMA } },
    system: systemBlocks(args.subject, args.lang),
    messages: [{ role: 'user', content: userText }],
  };
  const r = await getClient().messages.create(params);
  const parsed = parseJson<{ keyPoints?: any }>(textOf(r), {});
  return { keyPoints: cleanKeyPoints(parsed.keyPoints) };
}
