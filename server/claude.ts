import Anthropic from '@anthropic-ai/sdk';
import { systemContextFor, getKB, topicName, type Subject } from './eju';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const EFFORT = (process.env.ANTHROPIC_EFFORT || 'medium') as 'low' | 'medium' | 'high' | 'max';

type Lang = 'en' | 'ja';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

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

// system = stable global + cached subject KB + tiny language directive (after the cache breakpoint)
function systemBlocks(subject: Subject, lang: Lang) {
  return [
    { type: 'text', text: GLOBAL_INSTRUCTIONS },
    { type: 'text', text: systemContextFor(subject), cache_control: { type: 'ephemeral' } },
    { type: 'text', text: langLine(lang) },
  ];
}

function textOf(message: { content?: Array<{ type: string; text?: string }> }): string {
  return (message.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('\n')
    .trim();
}

export async function ask(args: { subject: Subject; lang: Lang; messages: ChatMessage[] }): Promise<string> {
  const messages = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return '';

  const params: any = {
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT },
    system: systemBlocks(args.subject, args.lang),
    messages,
  };
  const r = await getClient().messages.create(params);
  return textOf(r);
}

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
          answer: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['topic', 'prompt', 'answer', 'explanation'],
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
  answer: string;
  explanation: string;
}

export async function generate(args: {
  subject: Subject;
  lang: Lang;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}): Promise<{ questions: GenQuestion[] }> {
  const n = Math.max(1, Math.min(5, args.count || 3));
  const tName = args.topic ? topicName(args.subject, args.topic, args.lang) : null;
  const userText = [
    `Generate ${n} EJU-style ${args.subject} question(s)${tName ? ` on the topic: ${tName}` : ' across the most exam-relevant topics'}.`,
    `Difficulty: ${args.difficulty} ("medium" = typical EJU exam level).`,
    'Match the authentic EJU question style, format, topic scope, and difficulty from the knowledge base.',
    'Most EJU science questions are multiple-choice: when appropriate include 4-5 plausible choices and set "answer" to the correct one. Otherwise leave choices empty and put the final answer in "answer".',
    '"topic" = the specific sub-topic. "explanation" = a clear, student-friendly worked solution.',
    `Write everything in ${args.lang === 'ja' ? 'Japanese' : 'English'}.`,
  ].join(' ');

  const params: any = {
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT, format: { type: 'json_schema', schema: QUESTION_SCHEMA } },
    system: systemBlocks(args.subject, args.lang),
    messages: [{ role: 'user', content: userText }],
  };

  const r = await getClient().messages.create(params);
  const raw = textOf(r);
  let parsed: { questions?: any[] } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { questions: [] };
  }
  const questions: GenQuestion[] = (parsed.questions ?? []).map((q: any, i: number) => ({
    id: `${Date.now().toString(36)}-${i}`,
    topic: String(q.topic ?? tName ?? ''),
    prompt: String(q.prompt ?? ''),
    choices: Array.isArray(q.choices) && q.choices.length ? q.choices.map(String) : undefined,
    answer: String(q.answer ?? ''),
    explanation: String(q.explanation ?? ''),
  }));
  return { questions };
}

export async function check(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
}): Promise<string> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) {
    throw Object.assign(new Error('bad_image'), { status: 400 });
  }
  const [, media_type, data] = m;

  const instructions = [
    args.question
      ? `The student is working on this EJU practice question:\n"""\n${args.question}\n"""\n`
      : 'The student has written some work below (no specific question attached).\n',
    "The image is the student's handwritten work captured from a whiteboard.",
    'Do the following:',
    '1. Briefly transcribe the key steps you can read (note anything illegible).',
    args.question
      ? '2. Decide whether the solution is correct and complete for the question.'
      : '2. Assess whether the reasoning is sound.',
    '3. Pinpoint the first error or misconception, if any — be specific about where.',
    '4. Give a short hint to fix it, WITHOUT revealing the full answer unless the work is already complete.',
    '5. End with a one-line encouraging summary.',
    `Use clear short headings. Write in ${args.lang === 'ja' ? 'Japanese' : 'English'}.`,
  ].join('\n');

  const params: any = {
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT === 'low' ? 'medium' : EFFORT },
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
  return textOf(r);
}

export async function notes(args: { subject: Subject; lang: Lang; topic?: string }): Promise<string> {
  const tName = args.topic ? topicName(args.subject, args.topic, args.lang) : null;
  const userText = [
    `Produce concise, high-yield EJU ${args.subject} key-point notes${tName ? ` for the topic: ${tName}` : ''}.`,
    'Prioritize what is most likely to be tested, based on the past-paper archetypes in the knowledge base.',
    'Use short bullet points, **bold** key terms, must-know formulas/relationships, and a short "Common traps" list.',
    `Write in ${args.lang === 'ja' ? 'Japanese' : 'English'}.`,
  ].join(' ');

  const params: any = {
    model: MODEL,
    max_tokens: 6000,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT },
    system: systemBlocks(args.subject, args.lang),
    messages: [{ role: 'user', content: userText }],
  };
  const r = await getClient().messages.create(params);
  return textOf(r);
}

// expose for potential callers
export { getKB };
