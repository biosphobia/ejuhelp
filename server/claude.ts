import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  systemContextFor,
  systemContextForAll,
  labelFor,
  categoryChoicesFor,
  chooseArchetypeExamples,
  randomArchetypeExamples,
  SUBJECTS,
  type PastExample,
  type Subject,
} from './eju';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const USE_THINKING = process.env.ANTHROPIC_THINKING !== 'off';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

type Lang = 'en' | 'ja' | 'zh' | 'tr';

// Name used both to tell the model which language to reply in and inside
// "Write everything in {…}" directives.
const LANG_NAME: Record<Lang, string> = {
  en: 'English',
  ja: 'Japanese (日本語)',
  zh: 'Simplified Chinese (简体中文)',
  tr: 'Turkish (Türkçe)',
};
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface KeyPointDTO {
  kind: 'formula' | 'fact';
  text: string;
  topic?: string;
}

let defaultClaudeClient: Anthropic | null = null;
function getClaudeClient(userKey?: string): Anthropic {
  if (userKey) return new Anthropic({ apiKey: userKey });
  if (!defaultClaudeClient) defaultClaudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return defaultClaudeClient;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);
}

const GLOBAL_INSTRUCTIONS =
  'You are an expert tutor and question-writer for the EJU (Examination for Japanese University ' +
  'Admission for International Students). You help students study efficiently and accurately. Be ' +
  'concise and exam-focused. Write ALL mathematical expressions, equations and formulas as LaTeX: ' +
  'use $...$ for inline math and $$...$$ for displayed equations (e.g. $v=u+at$, ' +
  '$$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$). Use \\frac, \\sqrt, ^{} , _{}, \\vec{} and Greek-letter ' +
  'commands; for chemistry use math mode with subscripts/superscripts (e.g. $\\mathrm{H_2O}$, ' +
  '$\\mathrm{SO_4^{2-}}$). Do not put ordinary prose inside math delimiters. When your reply is JSON, ' +
  'it MUST be valid: escape every backslash as \\\\ and every newline as \\n inside string values. ' +
  'Never invent claims about the EJU format; rely on the knowledge base provided below.';

const langLine = (lang: Lang) => `Always respond in ${LANG_NAME[lang]}.`;

function systemBlocks(subject: Subject, lang: Lang, extra?: string, allSubjects = false) {
  // When the student has not chosen a subject (Ask Coach), give the coach every
  // subject's knowledge base and let it infer; otherwise scope to one subject.
  const context = allSubjects ? systemContextForAll() : systemContextFor(subject);
  const blocks: any[] = [
    { type: 'text', text: GLOBAL_INSTRUCTIONS },
    // CRITICAL: We restored the cache_control block for EJU Context
    { type: 'text', text: context, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: langLine(lang) },
  ];
  if (extra) blocks.push({ type: 'text', text: extra });
  return blocks;
}

// Tells the coach to figure out the subject itself (used by the Ask Coach flows,
// where the student no longer picks one). `hint` is the subject the student was
// most recently studying — a soft tie-breaker only.
const inferSubjectDirective = (hint: Subject) =>
  'The student has not told you which subject this is. Silently work out which EJU subject and topic ' +
  'it concerns — from their message, any attached question, and any handwritten work — then answer using ' +
  `that subject's EJU syllabus and past-paper patterns. Do not ask them to choose a subject. If it is ` +
  `genuinely ambiguous, assume EJU ${hint}.`;

// ─── UNIVERSAL ROUTER ───
// Preserves perfect Claude caching while translating for Gemini/GPT
async function executeModelCall(
  modelType: string | undefined,
  userKey: string | undefined,
  subject: Subject,
  lang: Lang,
  extraSystem: string | undefined,
  messages: any[],
  maxTokens: number,
  allSubjects = false
): Promise<string> {
  const targetModel = modelType || 'gemini';
  const sysBlocks = systemBlocks(subject, lang, extraSystem, allSubjects);

  if (targetModel === 'gpt') {
    if (!userKey) throw Object.assign(new Error('Add your OpenAI API key in Settings to use GPT.'), { status: 400 });
    const client = new OpenAI({ apiKey: userKey });
    const systemText = sysBlocks.map(b => b.text).join('\n\n');

    const formattedMessages = messages.map(m => {
      let content = m.content;
      if (Array.isArray(content)) {
        content = content.map((p: any) => {
          if (p.type === 'text') return { type: 'text', text: p.text };
          if (p.type === 'image') return { type: 'image_url', image_url: { url: `data:${p.source.media_type};base64,${p.source.data}` } };
          return p;
        });
      }
      return { role: m.role, content };
    });

    const res = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'system', content: systemText }, ...formattedMessages] as any,
      max_tokens: maxTokens,
    });
    return res.choices[0].message.content || '';
  }

  else if (targetModel === 'gemini') {
    // Use the user's own key if they provided one, otherwise the server default.
    const apiKey = userKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw Object.assign(new Error('No Gemini API key (set GEMINI_API_KEY on the server, or add your own in Settings).'), { status: 400 });
    const client = new GoogleGenerativeAI(apiKey);
    const systemText = sysBlocks.map(b => b.text).join('\n\n');

    const model = client.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemText
    });

    const formattedMessages = messages.map(m => {
      const parts: any[] = [];
      if (Array.isArray(m.content)) {
        for (const p of m.content) {
          if (p.type === 'text') parts.push({ text: p.text });
          if (p.type === 'image') parts.push({ inlineData: { data: p.source.data, mimeType: p.source.media_type } });
        }
      } else {
        parts.push({ text: m.content });
      }
      return { role: m.role === 'assistant' ? 'model' : 'user', parts };
    });

    const res = await model.generateContent({ contents: formattedMessages });
    return res.response.text();
  } 
  
  else {
    // Claude Logic - Unmodified to perfectly preserve EJU caching
    const client = getClaudeClient(userKey);
    const p: any = {
      model: MODEL,
      max_tokens: maxTokens,
      system: sysBlocks,
      messages: messages
    };
    if (USE_THINKING) p.thinking = { type: 'adaptive' };

    try {
      const res = await client.messages.create(p);
      return (res.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
    } catch (e: any) {
      if (e?.status === 400 && p.thinking) {
        const { thinking, ...rest } = p;
        console.warn('[claude] 400 with thinking; retrying without it');
        const res = await client.messages.create(rest);
        return (res.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
      }
      throw e;
    }
  }
}

// LLMs routinely return JSON whose string values contain raw newlines (invalid)
// and single-backslash LaTeX like \frac or \sqrt (invalid escapes). Both make
// JSON.parse throw, which previously leaked the raw JSON to the user. This walks
// the text and repairs string contents: raw control chars are escaped, and any
// backslash that isn't a valid JSON escape (\" \\ \/ \uXXXX) is doubled — which
// is exactly what an unescaped LaTeX command needs.
function repairJson(s: string): string {
  let out = '';
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!inStr) {
      out += c;
      if (c === '"') inStr = true;
      continue;
    }
    if (c === '"') {
      inStr = false;
      out += c;
    } else if (c === '\\') {
      const next = s[i + 1];
      if (next === '"' || next === '\\' || next === '/') {
        out += c + next; // already a valid escape
        i++;
      } else if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(s.slice(i + 2, i + 6))) {
        out += s.slice(i, i + 6); // \uXXXX
        i += 5;
      } else {
        out += '\\\\'; // lone backslash (e.g. a LaTeX command) -> escape it
      }
    } else if (c === '\n') out += '\\n';
    else if (c === '\r') out += '\\r';
    else if (c === '\t') out += '\\t';
    else out += c;
  }
  return out;
}

function tryParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    /* try to repair */
  }
  try {
    return JSON.parse(repairJson(s)) as T;
  } catch {
    return null;
  }
}

function extractJson<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  let s = raw.trim();
  const fence = /\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/i.exec(s);
  if (fence) s = fence[1].trim();

  const direct = tryParse<T>(s);
  if (direct !== null) return direct;

  const startObj = s.indexOf('{');
  const startArr = s.indexOf('[');
  let start = -1;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);
  const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (start !== -1 && end > start) {
    const sliced = tryParse<T>(s.slice(start, end + 1));
    if (sliced !== null) return sliced;
  }
  return fallback;
}

const writeLang = (lang: Lang) => LANG_NAME[lang];

function cleanKeyPoints(arr: any): KeyPointDTO[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((k) => k && typeof k.text === 'string' && k.text.trim())
    .slice(0, 6)
    .map((k) => ({
      kind: k.kind === 'fact' ? 'fact' : 'formula',
      text: String(k.text).trim(),
      // Accept either `category` or the legacy `topic` field name.
      topic: typeof k.category === 'string' && k.category ? k.category : typeof k.topic === 'string' && k.topic ? k.topic : undefined,
    }));
}

// Pin each concept's category to a canonical top-level taxonomy id for the subject
// (or '' → General). This keeps the Mindmap to a bounded, sensible set of
// categories instead of a fresh bucket for every concept the model names.
function normalizeConceptCategories(subject: Subject, kps: KeyPointDTO[]): KeyPointDTO[] {
  const choices = categoryChoicesFor(subject);
  if (!choices.length) return kps.map((k) => ({ ...k, topic: '' }));
  const byId = new Map(choices.map((c) => [c.id.toLowerCase(), c.id]));
  const byLabel = new Map(choices.map((c) => [c.label.toLowerCase(), c.id]));
  return kps.map((k) => {
    const raw = (k.topic ?? '').trim().toLowerCase();
    let id = byId.get(raw) ?? byLabel.get(raw) ?? '';
    if (!id && raw) {
      for (const c of choices) {
        const cid = c.id.toLowerCase();
        const lab = c.label.toLowerCase();
        if (raw.includes(cid) || raw.includes(lab) || lab.includes(raw)) {
          id = c.id;
          break;
        }
      }
    }
    return { ...k, topic: id };
  });
}

// ─── Ask ───
// The reply is plain Markdown (so LaTeX/backslashes pass through untouched — never
// JSON-encoded), followed by an optional delimited key-points block we strip off.
const KEYPOINTS_MARK = '###KEYPOINTS###';
const ASK_DIRECTIVE =
  // Teaching style: beginner-friendly, then exam-ready.
  'Teach as a patient tutor whose student may be new to the topic and is sitting the EJU exam very soon. ' +
  'Explain in plain, everyday language a beginner can follow: avoid jargon, and whenever a technical term is ' +
  'unavoidable, define it in simple words the first time you use it. Build intuition first — a short analogy ' +
  'or a concrete example with real numbers — then walk through the reasoning step by step instead of just ' +
  'stating the result. Keep sentences short. For these coaching replies, favour a clear, complete explanation ' +
  'over terseness (this overrides the general "be concise" instruction), but stay on point and do not ramble. ' +
  'Because the exam is near, make the must-know parts impossible to miss: bold the key terms and results, and ' +
  'finish with a short "**Exam essentials**" section — a few bullets giving the formula(s) to memorise, the ' +
  'common traps/mistakes, and what EJU typically asks on this topic. ' +
  // Formatting.
  'Write your reply directly as GitHub-flavored Markdown with LaTeX math ($...$ inline, $$...$$ display). ' +
  'Do NOT wrap the reply in JSON and do NOT put it in a code fence. ' +
  // Key points (machine-parsed; separate from the human-facing "Exam essentials" bullets above).
  'After the reply, ONLY if it contains genuinely memorize-worthy formulas or key facts, add a final ' +
  `line that is exactly "${KEYPOINTS_MARK}" and then 1-4 lines, one point per line, each formatted as ` +
  '`kind | text | category`. kind is the word formula or fact. text is ONE concise, self-contained, ' +
  'memorizable statement (define the symbols; keep it short and clear). category MUST be the single ' +
  'best-fitting top-level topic id from the Topic taxonomy in the knowledge base above (e.g. for physics: ' +
  'mechanics, waves, electromagnetism) — never invent a new category. Write nothing after those lines.';

function parseKeyPointLines(block: string): KeyPointDTO[] {
  return block
    .split('\n')
    .map((l) => l.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const [kind, text, topic] = l.split('|').map((s) => s.trim());
      return {
        kind: /fact/i.test(kind ?? '') ? 'fact' : 'formula',
        text: (text ?? '').trim(),
        topic: topic || undefined,
      } as KeyPointDTO;
    })
    .filter((k) => k.text)
    .slice(0, 6);
}

// Normalize a short tail of prior conversation into model turns. Used by the
// board flows (check / explain) so they keep the thread instead of starting cold
// on every press — which is what made a second "Check my work" lose the question.
function historyTurns(messages?: ChatMessage[]) {
  const turns = (messages ?? [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  // We append a user turn (the image) right after this history, so it must end on
  // an assistant turn: drop a trailing unpaired user turn (e.g. from an earlier
  // failed call) to keep clean user/assistant alternation for every provider.
  if (turns.length && turns[turns.length - 1].role === 'user') turns.pop();
  const tail = turns.slice(-6);
  // The model APIs also expect the first turn to be the user's.
  while (tail.length && tail[0].role === 'assistant') tail.shift();
  return tail;
}

export async function ask(args: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  /** The question the student is currently looking at, so "this question" resolves. */
  context?: string;
  model?: string;
  userKey?: string;
}): Promise<{ text: string; keyPoints: KeyPointDTO[] }> {
  const messages = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return { text: '', keyPoints: [] };

  const ctx = args.context?.trim()
    ? `The student is currently looking at this specific question:\n"""\n${args.context.trim()}\n"""\n` +
      'When the student says "this", "this question", "this problem", "これ", "この問題" or similar, they are ' +
      'referring to the question above — answer about it directly. Do not ask which question they mean.'
    : undefined;
  const extra = [inferSubjectDirective(args.subject), ctx, ASK_DIRECTIVE].filter(Boolean).join('\n\n');

  const raw = await executeModelCall(args.model, args.userKey, args.subject, args.lang, extra, messages, 8000, true);

  const i = raw.indexOf(KEYPOINTS_MARK);
  const text = (i >= 0 ? raw.slice(0, i) : raw).trim();
  const keyPoints = i >= 0 ? parseKeyPointLines(raw.slice(i + KEYPOINTS_MARK.length)) : [];
  return { text: text || raw.trim(), keyPoints: normalizeConceptCategories(args.subject, keyPoints) };
}

// ─── Generate Questions ───
export interface GenQuestion {
  id: string;
  topic: string;
  prompt: string;
  choices?: string[];
  answerIndex: number;
  answer: string;
  explanation: string;
}

// Evenly spread n question slots across the chosen topics, in random order, so
// the set isn't lopsided and refills the bag when n exceeds the topic count.
function sampleAssign(ids: string[], n: number): string[] {
  const out: string[] = [];
  let bag: string[] = [];
  const draw = () => {
    if (!bag.length) {
      bag = [...ids];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop()!;
  };
  for (let i = 0; i < n; i++) out.push(draw());
  return out;
}

// Compact one real past question into a style reference (trimmed to bound tokens).
function exampleToText(ex: PastExample): string {
  const tags = ex.patternTags?.length ? ` · pattern: ${ex.patternTags.join(', ')}` : '';
  const head = `[real EJU ${ex.source}${ex.subtopic ? ` · ${ex.subtopic}` : ''}${tags}]`;
  let body = ex.prompt.replace(/\s+/g, ' ').trim();
  if (body.length > 420) body = body.slice(0, 420) + '…';
  const choices = ex.choices?.length
    ? ' Options: ' + ex.choices.map((c, i) => `(${'ABCDE'[i]}) ${c}`).join(' ').replace(/\s+/g, ' ').slice(0, 320)
    : '';
  return `${head} ${body}${choices}`;
}

export async function generate(args: {
  subject: Subject;
  lang: Lang;
  /** Sub-topic / topic ids the student selected; questions are spread randomly across them. */
  topics?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  focus?: { topics?: string[]; tags?: string[] };
  model?: string;
  userKey?: string;
}): Promise<{ questions: GenQuestion[] }> {
  const n = Math.max(1, Math.min(5, args.count || 3));
  const selected = (args.topics ?? []).filter((t) => typeof t === 'string' && t.trim());
  const focusing = Boolean(args.focus && (args.focus.topics?.length || args.focus.tags?.length));

  const parts: string[] = [
    `Generate ${n} EJU-style ${args.subject} question(s) that closely match what really appears on the exam.`,
    `Difficulty: ${args.difficulty} ("medium" = typical EJU exam level).`,
    // Hard grounding in the analyzed past-paper patterns.
    'Ground every question in the documented past-paper archetypes, pattern tags, style notes, printed constants and answer formats in the knowledge base above: mirror the authentic EJU phrasing, structure, figure usage, choice design and difficulty.',
    'CRITICAL: do NOT copy or merely renumber any past question. Invent a genuinely new scenario — different context, values and framing — that tests the SAME underlying concept and fits the same archetype, i.e. the kind of question highly likely to appear on an upcoming EJU.',
    'Prefer multiple-choice with 4-5 plausible options where each distractor reflects a realistic student mistake.',
  ];

  if (focusing) {
    if (args.focus!.topics?.length)
      parts.push(`Personalize: the student is currently weakest in: ${args.focus!.topics.join('; ')}. Prioritize and spread the questions across these.`);
    if (args.focus!.tags?.length)
      parts.push(
        `They frequently make these mistakes: ${args.focus!.tags.join(', ')}. Design questions that specifically probe and help fix them (e.g. require careful unit conversion if "units").`
      );
  } else if (selected.length) {
    const assigned = sampleAssign(selected, n);
    const examples = chooseArchetypeExamples(args.subject, assigned, args.lang);
    parts.push('Assign the questions to topics exactly as follows (chosen at random for you). Set each question\'s "topic" field to its assigned sub-topic:');
    assigned.forEach((id, i) => {
      const label = labelFor(args.subject, id, args.lang);
      const ex = examples[i];
      parts.push(
        ex
          ? `Question ${i + 1}: topic "${label}". Emulate the STYLE, STRUCTURE and DIFFICULTY of this real EJU question — but write a brand-new question with a different scenario and different numbers; do NOT reproduce it: ${exampleToText(ex)}`
          : `Question ${i + 1}: topic "${label}".`
      );
    });
  } else {
    const examples = randomArchetypeExamples(args.subject, args.lang, n);
    if (examples.length) {
      parts.push('Spread the questions across the most exam-relevant topics. Emulate the STYLE, STRUCTURE and DIFFICULTY of these real past questions, each on its own fresh scenario (do NOT reproduce them):');
      examples.forEach((ex, i) => parts.push(`${i + 1}. ${exampleToText(ex)}`));
    } else {
      parts.push('Spread the questions across the most exam-relevant topics for this subject.');
    }
  }

  parts.push(`Write everything in ${writeLang(args.lang)}.`);
  parts.push(
    'Respond with ONLY a single JSON object, no other text or code fences: ' +
      '{"questions":[{"topic":"<sub-topic>","prompt":"...","choices":["..."],"answerIndex":<0-based index of the correct choice, or -1 if not multiple-choice>,"answer":"<correct answer in words>","explanation":"<clear worked solution>"}]}.'
  );

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: parts.join('\n') }], 16000
  );

  const parsed = extractJson<{ questions?: any[] }>(raw, { questions: [] });
  const questions: GenQuestion[] = (parsed.questions ?? []).map((q: any, i: number) => {
    const choices = Array.isArray(q.choices) && q.choices.length ? q.choices.map(String) : undefined;
    const idx = Number.isInteger(q.answerIndex) ? q.answerIndex : -1;
    return {
      id: `${Date.now().toString(36)}-${i}`,
      topic: String(q.topic ?? ''),
      prompt: String(q.prompt ?? ''),
      choices,
      answerIndex: choices && idx >= 0 && idx < choices.length ? idx : -1,
      answer: String(q.answer ?? ''),
      explanation: String(q.explanation ?? ''),
    };
  });
  return { questions };
}

// ─── Check Work ───
const ERROR_TAGS = ['units', 'sign', 'arithmetic', 'algebra', 'concept', 'formula', 'misread', 'incomplete', 'none'];
const CHECK_META_MARK = '###META###';

export interface CheckResult {
  feedback: string;
  correct: 'yes' | 'no' | 'partial' | 'unknown';
  /** The EJU subject the coach inferred the work belongs to (for accurate stats). */
  subject: Subject | '';
  topic: string;
  errorTags: string[];
  /** If the attached question is multiple-choice and the work clearly concludes one
   *  option, the 0-based index of that choice (counting the listed options in order); else -1. */
  studentAnswerIndex: number;
  /** Memorize-worthy concepts this problem tests, for the Mindmap. */
  keyPoints: KeyPointDTO[];
}

export async function check(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  /** A note the student typed alongside the request, to steer the feedback. */
  note?: string;
  /** Recent conversation, so repeated checks stay anchored to the same question. */
  messages?: ChatMessage[];
  model?: string;
  userKey?: string;
}): Promise<CheckResult> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const note = args.note?.trim();
  const instructions = [
    args.question
      ? `The student is attempting this EJU question. ALWAYS grade against THIS question — even if you have already checked their work earlier in the conversation:\n"""\n${args.question}\n"""\n`
      : 'No specific question is attached — work out from the page what is being solved.\n',
    note
      ? `The student also typed this note/request — take it into account and address it directly in your feedback:\n"""\n${note}\n"""\n`
      : '',
    inferSubjectDirective(args.subject),
    "The image is a capture of the student's OWN handwritten work on a whiteboard.",
    'Grade ONLY what is actually written in the image. Do NOT solve the problem yourself, and never report an answer or conclusion that is not physically written on the page.',
    'CRITICAL: If the page is blank, almost blank, or shows no genuine solution attempt (only the question text, doodles, or a few stray marks), do NOT grade it — set correct to "unknown", and in the feedback say there is nothing to check yet and invite the student to write their working. An empty or missing solution is never "correct".',
    '',
    'First write the FEEDBACK as Markdown with LaTeX math ($...$ inline, $$...$$ display), in plain beginner-friendly language (define any jargon): briefly transcribe the key readable steps; state whether the written work is correct; pinpoint the FIRST error precisely and explain in simple terms WHY it is wrong; give a short hint to fix it (reveal the full answer only if the work is already complete and correct); finish with a one-line encouraging summary.',
    `Write the feedback in ${writeLang(args.lang)}.`,
    `Then, on a new line, write exactly ${CHECK_META_MARK} and, on the next line, a single-line JSON object (and nothing after it):`,
    `{"correct":"yes"|"no"|"partial"|"unknown","subject":"physics"|"chemistry"|"biology"|"math" (whichever subject this work belongs to),"topic":"<specific EJU sub-topic in English>","errorTags":[subset of ${JSON.stringify(ERROR_TAGS)}; use ["none"] when correct and [] when unknown],"studentAnswerIndex":<for a multiple-choice question, the 0-based index of the option the WRITTEN work clearly concludes, counting the listed choices in order; use -1 if it is not multiple-choice or no final choice is written>,"keyPoints":[{"kind":"formula"|"fact","text":"<one concise, self-contained, memorizable concept this problem tests>","category":"<best-fitting top-level topic id from the taxonomy>"}] (0-4 items, only genuinely memorize-worthy concepts; [] if none)}`,
    '("partial" = on the right track but incomplete or with a fixable slip.)',
  ].join('\n');

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [
      ...historyTurns(args.messages),
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data } },
          { type: 'text', text: instructions },
        ],
      },
    ], 4000, true
  );

  // Feedback is plain markdown before the marker; the small meta JSON follows it.
  const mi = raw.indexOf(CHECK_META_MARK);
  let feedback: string;
  let p: Partial<CheckResult>;
  if (mi >= 0) {
    feedback = raw.slice(0, mi).trim();
    p = extractJson<Partial<CheckResult>>(raw.slice(mi + CHECK_META_MARK.length), {});
  } else {
    // Model didn't follow the format — fall back to whatever we can recover.
    p = extractJson<Partial<CheckResult>>(raw, {});
    feedback = typeof p.feedback === 'string' && p.feedback.trim() ? p.feedback.trim() : raw.trim();
  }

  const correct = (['yes', 'no', 'partial', 'unknown'] as const).includes(p.correct as any)
    ? (p.correct as CheckResult['correct'])
    : 'unknown';
  const errorTags = Array.isArray(p.errorTags) ? p.errorTags.filter((t) => ERROR_TAGS.includes(t)) : [];
  const studentAnswerIndex = Number.isInteger(p.studentAnswerIndex) ? Number(p.studentAnswerIndex) : -1;
  const subject = (SUBJECTS as readonly string[]).includes(p.subject as any) ? (p.subject as Subject) : '';
  // Classify the captured concepts under whichever subject the work belongs to.
  const keyPoints = normalizeConceptCategories(subject || args.subject, cleanKeyPoints((p as any).keyPoints));
  return {
    feedback: feedback || String(raw ?? ''),
    correct,
    subject,
    topic: String(p.topic ?? ''),
    errorTags,
    studentAnswerIndex,
    keyPoints,
  };
}

// ─── Explain board ───
// Like "Check my work", but it HELPS the student with whatever is on the page
// (explanation / teaching) instead of grading it. Returns markdown plus the same
// optional machine-parsed key points the chat "ask" produces.
export async function explainBoard(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  note?: string;
  messages?: ChatMessage[];
  model?: string;
  userKey?: string;
}): Promise<{ text: string; keyPoints: KeyPointDTO[] }> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const note = args.note?.trim();
  const instructions = [
    args.question
      ? `The student is working on this EJU question. Keep your help anchored to THIS question:\n"""\n${args.question}\n"""\n`
      : 'No specific question is attached — infer from the page what they are working on.\n',
    note
      ? `The student typed this request — focus your help on exactly this:\n"""\n${note}\n"""\n`
      : 'The student tapped "Explain" without typing a request, so work out from the page what they most likely need help with (a step they seem stuck on, a concept, or the next move).',
    inferSubjectDirective(args.subject),
    "The image is a capture of the student's OWN handwriting/work on a whiteboard.",
    'Read what is on the page, then HELP them: explain the relevant concept and the method in simple terms, clarify wherever they seem stuck or confused, and show the correct approach step by step. This is teaching, NOT grading — be encouraging, do not reduce it to a verdict or score. Build on what they have already written when it is on the right track; if the page is essentially empty, teach the topic the question is about.',
    ASK_DIRECTIVE,
  ].join('\n\n');

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [
      ...historyTurns(args.messages),
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data } },
          { type: 'text', text: instructions },
        ],
      },
    ], 8000, true
  );

  const i = raw.indexOf(KEYPOINTS_MARK);
  const text = (i >= 0 ? raw.slice(0, i) : raw).trim();
  const keyPoints = i >= 0 ? parseKeyPointLines(raw.slice(i + KEYPOINTS_MARK.length)) : [];
  return { text: text || raw.trim(), keyPoints: normalizeConceptCategories(args.subject, keyPoints) };
}

// ─── Keypoints ───
export async function keypoints(args: {
  subject: Subject;
  lang: Lang;
  topic?: string;
  model?: string;
  userKey?: string;
}): Promise<{ keyPoints: KeyPointDTO[] }> {
  const tName = args.topic ? labelFor(args.subject, args.topic, args.lang) : null;
  const userText = [
    `List the most important must-memorize formulas and key facts for EJU ${args.subject}${tName ? ` on: ${tName}` : ''}.`,
    'Focus strictly on what a student must recall in the exam, based on the past-paper archetypes. Return 5-10 concise key points.',
    `Write each point in ${writeLang(args.lang)}.`,
    'Respond with ONLY a single JSON object, no other text or code fences: {"keyPoints":[{"kind":"formula"|"fact","text":"...","topic":"..."}]}.',
  ].join(' ');

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 4000
  );
  
  const parsed = extractJson<{ keyPoints?: any }>(raw, {});
  return { keyPoints: cleanKeyPoints(parsed.keyPoints) };
}

// ─── Extract concepts ───
// Subject-scoped concept extraction from arbitrary study material (a coach answer,
// a solved practice question + its explanation, …). Classifies each concept into a
// canonical taxonomy category so the Mindmap stays comprehensive but bounded.
export async function extractConcepts(args: {
  subject: Subject;
  lang: Lang;
  text: string;
  model?: string;
  userKey?: string;
}): Promise<{ concepts: KeyPointDTO[] }> {
  const text = (args.text ?? '').trim();
  if (!text) return { concepts: [] };
  const choices = categoryChoicesFor(args.subject);
  const catList = choices.length
    ? choices.map((c) => `${c.id} (${c.label})`).join(', ')
    : '(no preset categories — leave category blank)';
  const userText = [
    `From the EJU ${args.subject} study material below, extract the key concepts a student should remember for the exam.`,
    'Be comprehensive but concise: capture only genuinely important, exam-relevant formulas and facts — skip trivia and do not restate the question. Each concept must be ONE short, clear, self-contained statement (define the symbols).',
    `Classify EACH concept into exactly one of these category ids: ${catList}. Pick the single closest existing category — do NOT invent new categories.`,
    `Write each concept's text in ${writeLang(args.lang)}.`,
    'Respond with ONLY one JSON object, no prose or code fences: {"concepts":[{"kind":"formula"|"fact","text":"...","category":"<id>"}]} — 0 to 6 items.',
    '',
    'Study material:',
    '"""',
    text,
    '"""',
  ].join('\n');

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 2000, false
  );
  const parsed = extractJson<{ concepts?: any }>(raw, {});
  const kps = cleanKeyPoints(parsed.concepts);
  return { concepts: normalizeConceptCategories(args.subject, kps) };
}
