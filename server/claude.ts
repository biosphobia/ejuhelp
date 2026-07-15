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
  nodeContext,
  topicsFor,
  subtopicsFor,
  staticStudySheet,
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
  /** The EJU subject this concept belongs to (judged from the concept itself). */
  subject?: Subject;
}

// A durable observation about HOW the student learns/communicates, accumulated
// across sessions and fed back so the coach can adapt.
export type ProfileKind = 'style' | 'struggle' | 'strength';
export interface ProfileNoteDTO {
  kind: ProfileKind;
  text: string;
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

// Questions are always GENERATED in one fixed base language so the generation method
// (grounding, archetypes, difficulty, math verification) is identical regardless of the
// user's language. The output is then translated to the selected language. EJU booklets
// are themselves bilingual JA/EN, so English is a faithful base.
const GEN_LANG: Lang = 'en';

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

// Pin a category string to a canonical top-level taxonomy id for the subject
// (or '' → General). Matches by id, label, then a loose contains check.
function canonicalCategory(subject: Subject, raw0: string | undefined): string {
  const choices = categoryChoicesFor(subject);
  if (!choices.length) return '';
  const raw = (raw0 ?? '').trim().toLowerCase();
  if (!raw) return '';
  for (const c of choices) if (c.id.toLowerCase() === raw || c.label.toLowerCase() === raw) return c.id;
  for (const c of choices) {
    const cid = c.id.toLowerCase();
    const lab = c.label.toLowerCase();
    if (raw.includes(cid) || raw.includes(lab) || lab.includes(raw)) return c.id;
  }
  return '';
}

const isSubjectStr = (s: any): s is Subject => (SUBJECTS as readonly string[]).includes(s);

// Pin each concept to (a) the subject it really belongs to — judged from the
// concept, NOT the conversation, so a math note in a physics chat lands in math —
// and (b) a canonical taxonomy category within that subject (bounded, never invented).
function finalizeConcepts(defaultSubject: Subject, kps: KeyPointDTO[]): KeyPointDTO[] {
  return kps.map((k) => {
    const subject = isSubjectStr(k.subject) ? k.subject : defaultSubject;
    return { ...k, subject, topic: canonicalCategory(subject, k.topic) };
  });
}

// How every captured concept must be written: a self-contained, contextual line —
// never a bare formula. Reused across all the extraction prompts.
const CONCEPT_TEXT_RULE =
  'Write each concept as ONE self-contained line that NAMES the concept and what it is for, then gives the ' +
  'formula, then briefly defines its symbols/units — never a bare formula or a fragment with no context. ' +
  'For example: "Newton\'s second law — net force equals mass times acceleration: $F=ma$ ($F$ in N, $m$ mass in kg, ' +
  '$a$ acceleration in m/s²)."';

// ─── Learner profile ───
// A compact, per-student memory of how they like to learn (built up by the coach,
// fed back into its context). Adapts answers without re-asking every time.
const PROFILE_MARK = '###PROFILE###';

function learnerProfileDirective(profile?: string[]): string | undefined {
  const list = (profile ?? []).map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
  if (!list.length) return undefined;
  return (
    'What you know about THIS student — their measured performance and how they learn. TUNE your answer to it:\n' +
    '- On their WEAKER topics (low accuracy / listed as struggles): explain more thoroughly, in simpler language, with ' +
    'more scaffolding, intuition and worked detail; do not assume prior fluency.\n' +
    '- On their STRONGER topics: be more concise and you can go deeper/faster.\n' +
    '- Pre-empt their RECURRING mistake types (e.g. if they make sign or unit errors, call out exactly where those ' +
    'slips happen and how to avoid them).\n' +
    '- Match their preferred communication style and language (e.g. if they keep asking for an easier explanation, ' +
    'slow down and use analogies).\n' +
    'Adapt naturally — never mention or quote this profile to the student:\n' +
    list.map((s) => `- ${s}`).join('\n')
  );
}

function cleanProfileNotes(arr: any): ProfileNoteDTO[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((p) => p && typeof p.text === 'string' && p.text.trim())
    .slice(0, 3)
    .map(
      (p) =>
        ({
          kind: /strength/i.test(p.kind) ? 'strength' : /struggle/i.test(p.kind) ? 'struggle' : 'style',
          text: String(p.text).trim(),
        }) as ProfileNoteDTO
    );
}

function parseProfileLines(block: string): ProfileNoteDTO[] {
  return block
    .split('\n')
    .map((l) => l.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const [kind, ...rest] = l.split('|');
      const text = rest.join('|').trim();
      const k: ProfileKind = /strength/i.test(kind ?? '')
        ? 'strength'
        : /struggle/i.test(kind ?? '')
          ? 'struggle'
          : 'style';
      return { kind: k, text } as ProfileNoteDTO;
    })
    .filter((n) => n.text)
    .slice(0, 3);
}

// Split a coach reply into the human text and its optional trailing machine blocks
// (key points, then learner-profile observations). Tolerates either block order.
function sliceCoachReply(raw: string): { text: string; keyBlock: string; profBlock: string } {
  const ki = raw.indexOf(KEYPOINTS_MARK);
  const pi = raw.indexOf(PROFILE_MARK);
  const marks = [ki, pi].filter((x) => x >= 0);
  const textEnd = marks.length ? Math.min(...marks) : raw.length;
  const text = raw.slice(0, textEnd).trim();
  let keyBlock = '';
  if (ki >= 0) keyBlock = raw.slice(ki + KEYPOINTS_MARK.length, pi > ki ? pi : raw.length);
  let profBlock = '';
  if (pi >= 0) profBlock = raw.slice(pi + PROFILE_MARK.length, ki > pi ? ki : raw.length);
  return { text, keyBlock, profBlock };
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
  `line that is exactly "${KEYPOINTS_MARK}" and then 1-4 lines, one concept per line, each formatted as ` +
  '`subject | kind | category | text`. subject is the EJU subject the concept belongs to (physics, chemistry, ' +
  'biology, or math) — judge it from the concept itself, NOT from the rest of the conversation. kind is the ' +
  'word formula or fact. category MUST be the single best-fitting top-level topic id from THAT subject\'s Topic ' +
  'taxonomy in the knowledge base above (e.g. for physics: mechanics, waves, electromagnetism) — never invent one. ' +
  CONCEPT_TEXT_RULE +
  ' Use the | character only as the field separator.' +
  // Learner-profile capture (machine-parsed; separate memory of HOW they learn).
  ' Finally, ONLY if this exchange reveals something DURABLE about how this student learns or communicates ' +
  '(e.g. they repeatedly ask for an easier/simpler explanation, want step-by-step, prefer analogies, seem confused ' +
  'by a particular topic, prefer brevity, or write in a certain language), add a line that is exactly ' +
  `"${PROFILE_MARK}" and then 1-3 lines, each "kind | note", where kind is style, struggle, or strength and note is ` +
  'a short third-person observation (e.g. "style | prefers simple, beginner-level explanations with analogies"; ' +
  '"struggle | finds projectile motion confusing"). Do not record one-offs or notes already in the student profile ' +
  'above. Put the KEYPOINTS block (if any) before the PROFILE block, and write nothing after these lines.';

function parseKeyPointLines(block: string): KeyPointDTO[] {
  return block
    .split('\n')
    .map((l) => l.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split('|').map((s) => s.trim());
      // New format: subject | kind | category | text. Tolerate older/looser shapes.
      let subject: string | undefined;
      let kind: string;
      let topic: string | undefined;
      let text: string;
      if (parts.length >= 4) {
        [subject, kind, topic] = parts;
        text = parts.slice(3).join('|').trim();
      } else if (parts.length === 3) {
        [kind, topic] = parts;
        text = parts[2];
      } else {
        kind = parts[0] ?? '';
        text = parts.slice(1).join('|').trim();
      }
      return {
        kind: /fact/i.test(kind ?? '') ? 'fact' : 'formula',
        text: (text ?? '').trim(),
        topic: topic || undefined,
        subject: isSubjectStr(subject) ? subject : undefined,
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
  /** Compact learner-profile lines from past sessions, to tailor the answer. */
  profile?: string[];
  model?: string;
  userKey?: string;
}): Promise<{ text: string; keyPoints: KeyPointDTO[]; profile: ProfileNoteDTO[] }> {
  const messages = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return { text: '', keyPoints: [], profile: [] };

  const ctx = args.context?.trim()
    ? `The student is currently looking at this specific question:\n"""\n${args.context.trim()}\n"""\n` +
      'When the student says "this", "this question", "this problem", "これ", "この問題" or similar, they are ' +
      'referring to the question above — answer about it directly. Do not ask which question they mean.'
    : undefined;
  const extra = [inferSubjectDirective(args.subject), ctx, learnerProfileDirective(args.profile), ASK_DIRECTIVE]
    .filter(Boolean)
    .join('\n\n');

  const raw = await executeModelCall(args.model, args.userKey, args.subject, args.lang, extra, messages, 8000, true);

  const { text, keyBlock, profBlock } = sliceCoachReply(raw);
  return {
    text: text || raw.trim(),
    keyPoints: finalizeConcepts(args.subject, keyBlock ? parseKeyPointLines(keyBlock) : []),
    profile: profBlock ? parseProfileLines(profBlock) : [],
  };
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
  /** Optional simple SVG schematic of the setup, for the student to copy onto the whiteboard. */
  figure?: string;
}

// Defence-in-depth for model-produced SVG (we also render it via an <img> data URI,
// which can't execute scripts): keep it an <svg>, drop scripts/handlers, cap size.
function sanitizeSvg(svg: unknown): string | undefined {
  if (typeof svg !== 'string') return undefined;
  // Drop any leading XML declaration / DOCTYPE / BOM the model sometimes prepends,
  // then require an actual <svg> root. (Without this, "<?xml …?><svg>" was rejected,
  // so the diagram silently never appeared.)
  let s = svg.replace(/^﻿/, '').trim();
  s = s.replace(/^<\?xml[\s\S]*?\?>\s*/i, '').replace(/^<!DOCTYPE[\s\S]*?>\s*/i, '').trim();
  const start = s.search(/<svg[\s>]/i);
  if (start === -1) return undefined;
  s = s.slice(start);
  const end = s.toLowerCase().lastIndexOf('</svg>');
  if (end !== -1) s = s.slice(0, end + 6);
  if (s.length > 12000) return undefined;
  s = s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .trim();
  // An <svg> shown via an <img> data URI MUST declare the SVG namespace or browsers
  // refuse to render it (the diagram shows a broken-image icon). Models routinely omit
  // it, so add it when missing.
  if (!/<svg[^>]*\bxmlns\s*=/i.test(s)) {
    s = s.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return s;
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
  const isMath = args.subject === 'math';

  const parts: string[] = [
    `Generate ${n} EJU-style ${args.subject} question(s) that closely match what really appears on the exam.`,
    `Difficulty: ${args.difficulty} ("medium" = typical EJU exam level).`,
    // Hard grounding in the analyzed past-paper patterns.
    'Ground every question in the documented past-paper archetypes, pattern tags, style notes, printed constants and answer formats in the knowledge base above: mirror the authentic EJU phrasing, structure, figure usage, choice design and difficulty.',
    'CRITICAL: do NOT copy or merely renumber any past question. Invent a genuinely new scenario — different context, values and framing — that tests the SAME underlying concept and fits the same archetype, i.e. the kind of question highly likely to appear on an upcoming EJU.',
    'Draw on the BREADTH of patterns seen across a decade of EJU papers — the recurring setups, how each topic is typically tested, the phrasing, the multi-step structure and the difficulty curve — so the question genuinely feels like it belongs on the EJU. Capture the pattern and flavour faithfully, but you have real creative freedom in the scenario: do not mimic a single example, and never produce a thinly-disguised value-swap of a past question.',
    isMath
      ? 'FORMAT — EJU Mathematics is NOT multiple choice; it is fill-in-the-blank with single-character answer boxes. CRITICAL: every box holds exactly ONE character — a digit 0-9 or a minus sign — so a number needs one box PER character. Write a numeric blank as a single \\boxed{} whose label has one consecutive capital letter for EACH digit, plus a leading letter for the minus sign when the value can be negative. Examples: the value 14 → \\boxed{AB} (A=1, B=4); the value -3 → \\boxed{AB} (A is the minus sign, B=3); a single digit 5 → \\boxed{A}; a fraction 2/5 → \\dfrac{\\boxed{A}}{\\boxed{B}}. NEVER put a whole multi-digit number or an expression inside one single-letter box. ACCURACY IS PARAMOUNT: before you write a question, SOLVE it completely, then size every box to the EXACT number of characters in its computed value — a single-digit value MUST be a single-letter box (e.g. \\boxed{C}), never two letters; a two-digit or negative value gets two letters; and make sure the whole setup is mathematically consistent with one unique, correct answer (e.g. the intersection of two finite intervals is itself a finite interval, so an inequality describing it must be the bounded form). Label the boxes with consecutive letters A, B, C, … in reading order, exactly like the real example(s) above (which write multi-digit blanks as \\boxed{AB}, \\boxed{IJK}, etc.). Write each question as a clear, SELF-CONTAINED problem (a handful of boxes — not a whole 大問). A sub-part may ask the student to choose the correct expression for a box from a printed numbered list ⓪①②…; you may keep that style. Do NOT give multiple-choice options for the question itself — the student solves it by hand and writes each box.'
      : 'Prefer multiple-choice with 4-5 plausible options where each distractor reflects a realistic student mistake.',
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
    const examples = chooseArchetypeExamples(args.subject, assigned, GEN_LANG);
    parts.push('Assign the questions to topics exactly as follows (chosen at random for you). Set each question\'s "topic" field to its assigned sub-topic:');
    assigned.forEach((id, i) => {
      const label = labelFor(args.subject, id, GEN_LANG);
      const ex = examples[i];
      parts.push(
        ex
          ? `Question ${i + 1}: topic "${label}". Emulate the STYLE, STRUCTURE and DIFFICULTY of this real EJU question — but write a brand-new question with a different scenario and different numbers; do NOT reproduce it: ${exampleToText(ex)}`
          : `Question ${i + 1}: topic "${label}".`
      );
    });
  } else {
    const examples = randomArchetypeExamples(args.subject, GEN_LANG, n);
    if (examples.length) {
      parts.push('Spread the questions across the most exam-relevant topics. Emulate the STYLE, STRUCTURE and DIFFICULTY of these real past questions, each on its own fresh scenario (do NOT reproduce them):');
      examples.forEach((ex, i) => parts.push(`${i + 1}. ${exampleToText(ex)}`));
    } else {
      parts.push('Spread the questions across the most exam-relevant topics for this subject.');
    }
  }

  if (!isMath) {
    parts.push(
      'FIGURE: Decide per question whether a diagram is needed — do NOT force one on every question. ' +
        'A diagram IS needed when the setup is spatial/physical and hard to grasp from words alone (inclined planes, pulleys, blocks & forces/free-body, circuits, optics & ray diagrams, wave snapshots, projectile/geometry setups, labelled graphs). ' +
        'A diagram is NOT needed for purely numeric, conceptual or definition questions — for those set "figure" to "" (empty string). ' +
        'When you DO include a figure, output a SIMPLE, clean, LABELED SVG schematic the student can copy onto their whiteboard (a rough map, not a polished illustration). Requirements so it renders: start the string with "<svg" (NO "<?xml ...?>" prologue), include xmlns="http://www.w3.org/2000/svg" (REQUIRED — it will not render without it), include a viewBox (e.g. viewBox="0 0 320 200") AND width="320" height="200", and draw with VISIBLE strokes — every shape needs stroke="#111" (and fill="none" or a light fill); never rely on a default/none color or it will be invisible. ' +
        'Use only <line>/<rect>/<circle>/<ellipse>/<path>/<polygon>/<polyline>/<text> plus small arrowheads, and label the key quantities. No <script>, <style>/CSS, <image>, <foreignObject> or external references. This matters most for PHYSICS.'
    );
  }

  parts.push(`Write everything in ${writeLang(GEN_LANG)}.`);
  parts.push(
    isMath
      ? 'Respond with ONLY a single JSON object, no other text or code fences: ' +
          '{"questions":[{"topic":"<sub-topic>","prompt":"<the full question with all math in LaTeX; write each numeric blank as one \\\\boxed{} whose label has one letter per digit (+ a leading letter for a minus sign), e.g. \\\\boxed{AB} for a two-digit or negative value>","choices":[],"answerIndex":-1,"answer":"<the value of EVERY box-group so the work can be graded, e.g. AB=14, C=5, DE=-3, F/G=2/5>","explanation":"<a clear, step-by-step worked solution that derives each box value>"}]}.'
      : 'Respond with ONLY a single JSON object, no other text or code fences: ' +
          '{"questions":[{"topic":"<sub-topic>","prompt":"...","choices":["..."],"answerIndex":<0-based index of the correct choice, or -1 if not multiple-choice>,"answer":"<correct answer in words>","explanation":"<clear worked solution>","figure":"<optional simple labeled SVG schematic of the setup, or empty string>"}]}.'
  );

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, GEN_LANG, undefined, [{ role: 'user', content: parts.join('\n') }], 16000
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
      figure: sanitizeSvg(q.figure),
    };
  });
  // Math is digit-fill with strict box layouts where a wrong question teaches the
  // student wrong — run an independent verification pass that re-solves each one
  // and fixes/drops it before returning. (Verification runs in the base language too.)
  const base = isMath ? await verifyMathQuestions({ ...args, lang: GEN_LANG }, questions) : questions;
  // Generation is language-independent; the OUTPUT is translated to the student's
  // chosen language as a separate step that leaves the math/figures untouched.
  const translated = await translateQuestions(base, args.subject, args.lang, args.model, args.userKey);
  return { questions: translated };
}

// Translate generated questions into the student's language WITHOUT changing the
// problems. Only the natural-language wording is translated — all LaTeX, \boxed{} box
// labels, numbers, units, formulas, choice order and figures are preserved verbatim, so
// the generation method (and the math) is untouched.
async function translateQuestions(
  questions: GenQuestion[],
  subject: Subject,
  lang: Lang,
  model?: string,
  userKey?: string
): Promise<GenQuestion[]> {
  if (lang === GEN_LANG || !questions.length) return questions;
  const payload = questions.map((q, i) => ({
    n: i + 1,
    topic: q.topic,
    prompt: q.prompt,
    choices: q.choices ?? null,
    answer: q.answer,
    explanation: q.explanation,
  }));
  const userText = [
    `Translate these EJU ${subject} practice questions into ${LANG_NAME[lang]}. This is ONLY a translation — do NOT solve, change, add, remove, reorder or renumber anything; keep the exact same questions and meaning.`,
    'PRESERVE VERBATIM, do not translate or alter: every LaTeX expression (anything between $...$ or $$...$$), every \\boxed{...} and the letters inside it, all numbers, variable names, units, chemical formulas, and the number and order of the choices. Keep answer-key strings such as "AB=14, C=5, DE=-3" exactly as given.',
    `Translate only the surrounding natural-language wording (topic label, question prose, the wording of each choice, explanation prose) into ${LANG_NAME[lang]}.`,
    'Respond with ONLY a JSON object, no code fences: {"questions":[{"n":1,"topic":"...","prompt":"...","choices":["..."] or null,"answer":"...","explanation":"..."}, ...]} — same order and count as the input.',
    '',
    JSON.stringify(payload),
  ].join('\n');
  try {
    const raw = await executeModelCall(model, userKey, subject, lang, undefined, [{ role: 'user', content: userText }], 16000);
    const parsed = extractJson<{ questions?: any[] }>(raw, { questions: [] });
    const byN = new Map<number, any>();
    for (const q of parsed.questions ?? []) if (q && Number.isInteger(q.n)) byN.set(Number(q.n), q);
    return questions.map((q, i) => {
      const tr = byN.get(i + 1);
      if (!tr) return q;
      const str = (v: any, fallback: string) => (typeof v === 'string' && v.trim() ? v : fallback);
      // Only adopt translated choices if the count matches (keeps answerIndex valid).
      const choices =
        Array.isArray(tr.choices) && q.choices && tr.choices.length === q.choices.length
          ? tr.choices.map(String)
          : q.choices;
      return {
        ...q,
        topic: str(tr.topic, q.topic),
        prompt: str(tr.prompt, q.prompt),
        choices,
        answer: str(tr.answer, q.answer),
        explanation: typeof tr.explanation === 'string' ? tr.explanation : q.explanation,
      };
    });
  } catch {
    return questions; // on any failure keep the base-language questions rather than nothing
  }
}

// Independently re-solve each generated math question and correct it: enforce a
// unique, well-posed problem, a correct answer, and box labels whose letter count
// matches each value exactly (one letter per digit, + a leading letter if negative).
async function verifyMathQuestions(
  args: { lang: Lang; model?: string; userKey?: string },
  questions: GenQuestion[]
): Promise<GenQuestion[]> {
  if (!questions.length) return questions;
  const payload = questions.map((q, i) => ({ n: i + 1, topic: q.topic, prompt: q.prompt, answer: q.answer, explanation: q.explanation }));
  const userText = [
    'You are a meticulous EJU Mathematics checker. Accuracy is critical — a wrong practice question teaches the student something wrong. For EACH question below, solve it independently from scratch and correct any problem so it is fully accurate and well-posed:',
    '1) The setup must be mathematically consistent and have a UNIQUE correct answer (e.g. the intersection of two finite intervals is itself a finite interval, so an inequality describing it must be the bounded form, not an unbounded one).',
    '2) Re-derive the answer yourself and make sure it is correct.',
    '3) The answer-box layout MUST match the answer EXACTLY: each \\boxed{} label contains exactly one letter per character of that box value — one letter per digit, plus a leading letter ONLY if the value is negative. A single-digit value MUST be a single-letter box (e.g. \\boxed{C}); never give a box more letters than its value has characters.',
    '4) The "answer" field must list each box-group as letters=value with matching lengths (e.g. AB=14, C=5, DE=-3), and the prompt must label boxes with consecutive letters A, B, C, … in reading order.',
    'Rewrite the prompt, answer and explanation as needed. If a question is unsalvageable or you are not fully confident it is correct, OMIT it.',
    `Write everything in ${writeLang(args.lang)}.`,
    'Respond with ONLY a JSON object, no code fences: {"questions":[{"topic":"...","prompt":"...","answer":"...","explanation":"..."}]} — include only questions you have verified as fully correct.',
    '',
    'Questions to verify:',
    JSON.stringify(payload),
  ].join('\n');
  try {
    const raw = await executeModelCall(args.model, args.userKey, 'math', args.lang, undefined, [{ role: 'user', content: userText }], 16000);
    const parsed = extractJson<{ questions?: any[] }>(raw, { questions: [] });
    const out: GenQuestion[] = (parsed.questions ?? [])
      .filter((q: any) => q && typeof q.prompt === 'string' && q.prompt.trim())
      .map((q: any, i: number) => ({
        id: `${Date.now().toString(36)}-v${i}`,
        topic: String(q.topic ?? ''),
        prompt: String(q.prompt ?? ''),
        choices: undefined,
        answerIndex: -1,
        answer: String(q.answer ?? ''),
        explanation: String(q.explanation ?? ''),
      }));
    // Use the verified set when we got one; otherwise fall back (likely a parse hiccup).
    return out.length ? out : questions;
  } catch {
    return questions;
  }
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
  /** Durable observations about the learner, distilled from how they solved this. */
  profile: ProfileNoteDTO[];
}

export async function check(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  /** Official answer for the attached question, so grading is checked against it. */
  answer?: string;
  /** Reference worked solution, to pinpoint the student's first mistake. */
  solution?: string;
  /** A note the student typed alongside the request, to steer the feedback. */
  note?: string;
  /** Recent conversation, so repeated checks stay anchored to the same question. */
  messages?: ChatMessage[];
  profile?: string[];
  /** The image is only the region the student selected, not the whole page. */
  selection?: boolean;
  model?: string;
  userKey?: string;
}): Promise<CheckResult> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const note = args.note?.trim();
  const answer = args.answer?.trim();
  const solution = args.solution?.trim();
  const isMath = args.subject === 'math';
  const instructions = [
    args.question
      ? `The student is attempting this EJU question. ALWAYS grade against THIS question — even if you have already checked their work earlier in the conversation:\n"""\n${args.question}\n"""\n`
      : 'No specific question is attached — work out from the page what is being solved.\n',
    // Authoritative answer/solution (when the question is a known one): grade against
    // these so the verdict is reliable; for EJU math, the answer lists each labelled
    // box's value — check the student's written boxes against it.
    answer
      ? `The OFFICIAL correct answer to this question is (treat as authoritative — judge the written work against it, and use it to pinpoint exactly where they went wrong):\n"""\n${answer}\n"""\n`
      : '',
    solution
      ? `Reference worked solution (for your reasoning only — use it to locate the first mistake; do NOT paste it back verbatim):\n"""\n${solution}\n"""\n`
      : '',
    answer
      ? 'Even with the answer above, still grade ONLY what the student actually wrote: do not credit a correct result they did not write, and if their work is incomplete or wrong give a hint toward the fix rather than just revealing the answer.'
      : '',
    inferSubjectDirective(args.subject),
    learnerProfileDirective(args.profile) ?? '',
    'Use the conversation so far as context: if you and the student have been discussing a specific problem, concept or approach, interpret and check the page in light of that discussion rather than starting from scratch.',
    args.selection
      ? "NOTE: the image is ONLY the region the student selected from a larger whiteboard — evaluate JUST this part, and do not treat the cropped-out surroundings as missing, blank, or incomplete."
      : "The image is a capture of the student's OWN handwritten work on a whiteboard.",
    'Grade ONLY what is actually written in the image. Do NOT solve the problem yourself, and never report an answer or conclusion that is not physically written on the page.',
    'This is a fast exam-prep app: the student writes ROUGH working and routinely SKIPS obvious intermediate steps (arithmetic, simple algebra, rearranging) they clearly did in their head. Do NOT penalize missing in-between steps — if each written line follows correctly from the previous one and the method and conclusion are right, fill in the omitted routine steps yourself and count the work as correct. Only flag a GENUINE error (a wrong value, a wrong method, or a real logical leap that does not follow) — never mere brevity or skipped routine algebra. If they are clearly on the right path, treat it as correct rather than wrong.',
    'CRITICAL: If the page is blank, almost blank, or shows no genuine solution attempt (only the question text, doodles, or a few stray marks), do NOT grade it — set correct to "unknown", and in the feedback say there is nothing to check yet and invite the student to write their working. An empty or missing solution is never "correct".',
    isMath
      ? 'PARTIAL MATH ANSWERS — IMPORTANT, this OVERRIDES the feedback structure below: EJU math answers are split into lettered boxes the student fills in over time. Check ONLY the boxes they have actually written, and keep the feedback SHORT and to the point. If every written box is correct, set "correct":"yes" and treat unwritten boxes as simply not done yet (NOT mistakes). Do NOT lecture about what is missing, do NOT restate the question, and do NOT re-derive the whole solution — at most one brief closing clause like "(B, C still to do)". Use "no"/"partial" only when a box they actually wrote is wrong, and then point out just that one box in a sentence or two. (Example: if only A, B, C are written and all are right, reply with a short confirmation that A, B, C are correct.)'
      : '',
    '',
    'First write the FEEDBACK as Markdown with LaTeX math ($...$ inline, $$...$$ display), in plain beginner-friendly language (define any jargon): briefly transcribe the key readable steps; state whether the written work is correct; pinpoint the FIRST error precisely and explain in simple terms WHY it is wrong; give a short hint to fix it (reveal the full answer only if the work is already complete and correct); finish with a one-line encouraging summary.',
    `Write the feedback in ${writeLang(args.lang)}.`,
    `Then, on a new line, write exactly ${CHECK_META_MARK} and, on the next line, a single-line JSON object (and nothing after it):`,
    `{"correct":"yes"|"no"|"partial"|"unknown","subject":"physics"|"chemistry"|"biology"|"math" (whichever subject this work belongs to),"topic":"<specific EJU sub-topic in English>","errorTags":[subset of ${JSON.stringify(ERROR_TAGS)}; use ["none"] when correct and [] when unknown],"studentAnswerIndex":<for a multiple-choice question, the 0-based index of the option the WRITTEN work clearly concludes, counting the listed choices in order; use -1 if it is not multiple-choice or no final choice is written>,"keyPoints":[{"kind":"formula"|"fact","text":"<one concise, self-contained, memorizable concept this problem tests>","category":"<best-fitting top-level topic id from the taxonomy>"}] (0-4 items, only genuinely memorize-worthy concepts; [] if none),"profile":[{"kind":"style"|"struggle"|"strength","text":"<short third-person note about a DURABLE, likely-recurring pattern in how this student works (e.g. \\"struggle | recurring sign errors when expanding brackets\\", \\"strength | sets up equations correctly\\") — NOT a one-off slip, and not anything already in the student profile above>"}] (0-2 items, [] if nothing durable)}`,
    '("partial" = on the right track but incomplete or with a fixable slip.)',
    `For each keyPoints text: ${CONCEPT_TEXT_RULE}`,
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
  const keyPoints = finalizeConcepts(subject || args.subject, cleanKeyPoints((p as any).keyPoints));
  return {
    feedback: feedback || String(raw ?? ''),
    correct,
    subject,
    topic: String(p.topic ?? ''),
    errorTags,
    studentAnswerIndex,
    keyPoints,
    profile: cleanProfileNotes((p as any).profile),
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
  profile?: string[];
  /** The image is only the region the student selected, not the whole page. */
  selection?: boolean;
  model?: string;
  userKey?: string;
}): Promise<{ text: string; keyPoints: KeyPointDTO[]; profile: ProfileNoteDTO[] }> {
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
    learnerProfileDirective(args.profile),
    'Use the conversation so far as context — if you have been discussing something specific with the student, build your help on that rather than starting cold.',
    args.selection
      ? "NOTE: the image is ONLY the region the student selected from a larger whiteboard — help with JUST this part; do not treat the cropped-out surroundings as missing or blank."
      : "The image is a capture of the student's OWN handwriting/work on a whiteboard.",
    'Read what is on the page, then HELP them: explain the relevant concept and the method in simple terms, clarify wherever they seem stuck or confused, and show the correct approach step by step. This is teaching, NOT grading — be encouraging, do not reduce it to a verdict or score. Build on what they have already written when it is on the right track; if the page is essentially empty, teach the topic the question is about.',
    ASK_DIRECTIVE,
  ]
    .filter(Boolean)
    .join('\n\n');

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

  const { text, keyBlock, profBlock } = sliceCoachReply(raw);
  return {
    text: text || raw.trim(),
    keyPoints: finalizeConcepts(args.subject, keyBlock ? parseKeyPointLines(keyBlock) : []),
    profile: profBlock ? parseProfileLines(profBlock) : [],
  };
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
    'Be comprehensive but concise: capture only genuinely important, exam-relevant formulas and facts — skip trivia and do not restate the question.',
    CONCEPT_TEXT_RULE,
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
  return { concepts: finalizeConcepts(args.subject, kps) };
}

// ─── Mindmap nodes: per-topic study sheet + mastery read ───

/** A beginner-friendly, EJU-focused study sheet for one taxonomy node (topic/subtopic):
 *  what it is, must-memorize formulas, core concepts, what the EJU actually tests, and
 *  pitfalls. Topic-general (same for everyone) so the client caches it. */
export async function topicStudySheet(args: {
  subject: Subject;
  lang: Lang;
  topicId: string;
  model?: string;
  userKey?: string;
}): Promise<{ text: string }> {
  // Prefer the pre-authored static sheet: instant, no API tokens. Only generate for nodes
  // that haven't been baked yet.
  const baked = staticStudySheet(args.subject, args.topicId);
  if (baked) return { text: baked };
  const node = nodeContext(args.subject, args.topicId, args.lang);
  if (!node) return { text: '' };
  const scope =
    node.kind === 'subtopic'
      ? `the EJU ${args.subject} sub-topic "${node.label}" (part of "${node.parentLabel}")${node.keywords?.length ? `, covering: ${node.keywords.join(', ')}` : ''}`
      : `the EJU ${args.subject} topic "${node.label}"${node.children?.length ? `, which includes: ${node.children.join(', ')}` : ''}`;
  const userText = [
    `Write a concise EJU study sheet for ${scope}.`,
    'Audience: a student preparing for the EJU who may be NEW to this topic. Make it genuinely easy to understand — define terms in plain language — while staying exam-focused and complete enough to score well.',
    'Ground it in what PROVABLY recurs on real EJU papers (the archetypes, patterns, printed constants and style notes in the knowledge base above). Include, as relevant:',
    '- a one or two sentence plain-language intro: what this topic is and why it matters on the EJU;',
    '- the must-MEMORIZE formulas (as $...$ LaTeX) with a few words on what each symbol means;',
    '- the core concepts/facts the exam tests;',
    '- what the EJU actually ASKS here — the recurring question types/setups (the trends), so the student knows what to expect;',
    '- the common mistakes/pitfalls to avoid.',
    'Be PROMPT and tight — short bullet lines, no padding. Use Markdown headings/bullets and LaTeX for ALL math.',
    `Write it in ${writeLang(args.lang)}.`,
    'Respond with ONLY the study sheet as Markdown (no preamble, no code fences).',
  ].join('\n');
  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 3000, false
  );
  return { text: raw.trim() };
}

/** Condense a coach reply into a short, whiteboard-friendly plain-text note. Plain text
 *  only (no Markdown/LaTeX) since it's drawn on the canvas, not rendered as rich text. */
export async function noteSummary(args: {
  subject: Subject;
  lang: Lang;
  text: string;
  /** Notes already on the whiteboard, so the summary doesn't repeat them. */
  existing?: string[];
  model?: string;
  userKey?: string;
}): Promise<{ text: string }> {
  const src = (args.text ?? '').trim();
  if (!src) return { text: '' };
  const existing = (args.existing ?? [])
    .map((s) => String(s).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 60);
  const userText = [
    'Condense the material below into a compact study NOTE to hand-write on a whiteboard.',
    'Rules:',
    '- No Markdown (no #, *, -, backticks, tables). Write MATH as inline LaTeX between $...$ (e.g. $v = v_0 + at$, $\\frac{a}{b}$, $\\sqrt{2}$, $\\theta$, $\\mathrm{H_2SO_4}$); everything else plain text.',
    '- First line: a short title (a few words). Then 2 to 6 very concise point lines, one idea each.',
    '- Keep the whole note under ~50 words. Capture only the key takeaways a student should remember.',
    existing.length
      ? '- The whiteboard ALREADY has the notes listed below. Do NOT repeat any point that is already there — only add NEW, complementary points. If everything important is already noted, reply with just a title line and nothing else.'
      : '',
    `- Write it in ${writeLang(args.lang)}.`,
    'Respond with ONLY the note text (no preamble).',
    existing.length ? '\nAlready on the whiteboard (do not repeat):\n' + existing.map((e) => `• ${e}`).join('\n') : '',
    '',
    'Material:',
    src.slice(0, 4000),
  ]
    .filter(Boolean)
    .join('\n');
  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 600, false
  );
  return { text: raw.trim() };
}

/** Revise an existing whiteboard note per the student's request, returning fresh plain
 *  note text (one idea per line) that replaces the selected rows. */
export async function noteRevise(args: {
  subject: Subject;
  lang: Lang;
  note: string;
  instruction: string;
  model?: string;
  userKey?: string;
}): Promise<{ text: string }> {
  const note = (args.note ?? '').trim();
  if (!note) return { text: '' };
  const instr = (args.instruction ?? '').trim();
  const userText = [
    'A student has this study note selected on their whiteboard:',
    '"""',
    note,
    '"""',
    `Their request: ${instr || 'Improve and clarify this note.'}`,
    'Rewrite the note to satisfy the request, as a compact whiteboard note. Rules:',
    '- No Markdown. Write MATH as inline LaTeX between $...$ (e.g. $v = v_0 + at$, $\\frac{a}{b}$, $\\sqrt{2}$, $\\theta$); everything else plain text.',
    '- One idea per line (each line becomes its own row). Optionally a short title line first.',
    '- Keep it tight — under ~60 words. Answer the request; do not just restate the old note.',
    `- Write it in ${writeLang(args.lang)}.`,
    'Respond with ONLY the revised note text.',
  ].join('\n');
  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 700, false
  );
  return { text: raw.trim() };
}

export interface TopicAttempt {
  prompt?: string;
  correct?: boolean;
  errorTags?: string[];
  /** The coach's read of the student's working (their "thinking process"), if any. */
  reasoning?: string;
}

/** A big-picture strength/weakness read for one node, distilled from the student's own
 *  attempts on it. User-specific, so the client regenerates it when the node is opened. */
export async function topicMastery(args: {
  subject: Subject;
  lang: Lang;
  topicId: string;
  history: TopicAttempt[];
  model?: string;
  userKey?: string;
}): Promise<{ text: string }> {
  const node = nodeContext(args.subject, args.topicId, args.lang);
  if (!node) return { text: '' };
  const hist = (args.history ?? []).slice(-20);
  if (!hist.length) return { text: '' };
  const lines = hist.map((h, i) => {
    const v = h.correct === true ? 'correct' : h.correct === false ? 'wrong' : 'attempted';
    const tags = h.errorTags?.length ? ` [${h.errorTags.join(', ')}]` : '';
    const q = (h.prompt ?? '').replace(/\s+/g, ' ').slice(0, 160);
    const r = (h.reasoning ?? '').replace(/\s+/g, ' ').slice(0, 220);
    return `${i + 1}. (${v})${tags} Q: ${q}${r ? ` — their work: ${r}` : ''}`;
  });
  const userText = [
    `Analyze this student's performance on the EJU ${args.subject} topic "${node.label}"${node.parentLabel ? ` (under "${node.parentLabel}")` : ''} and give a BIG-PICTURE read of their strengths and weaknesses on it.`,
    'Here is a log of their recent attempts on this topic — whether each was right or wrong, the error tags, and notes on their working:',
    ...lines,
    '',
    'Write a short, plain-language read (for the student to see and the coach to use): what they are doing WELL here, what they consistently STRUGGLE with (recurring patterns, not one-off slips), and the 1-3 most useful things to focus on next. Be specific and encouraging; do not just restate individual questions. If there is too little data to judge, say so in one line.',
    `Write it in ${writeLang(args.lang)} as short Markdown (a few bullets).`,
    'Respond with ONLY the read (no preamble, no code fences).',
  ].join('\n');
  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 1500, false
  );
  return { text: raw.trim() };
}

// ─── Lesson plan ───
// A structured, prioritized path through the taxonomy nodes that takes a student to a
// high EJU score in a few months. Each lesson references a real node id, so the client
// links it to that node's study sheet/practice.
export interface LessonPlanLesson {
  id: string;
  label: string;
  why: string;
}
export interface LessonPlanPhase {
  title: string;
  lessons: LessonPlanLesson[];
}

export async function lessonPlan(args: {
  subject: Subject;
  lang: Lang;
  weak?: string[];
  model?: string;
  userKey?: string;
}): Promise<{ phases: LessonPlanPhase[] }> {
  const topics = topicsFor(args.subject, 'en');
  const subs = subtopicsFor(args.subject, 'en');
  if (!topics.length) return { phases: [] };
  const catalog = [
    ...topics.map((t) => `${t.id}: ${t.name} (major topic)`),
    ...subs.map((s) => `${s.id}: ${s.name} (sub-topic of ${s.group})`),
  ].join('\n');
  const weak = (args.weak ?? []).map((w) => String(w).trim()).filter(Boolean).slice(0, 8);
  const userText = [
    `Build a structured, prioritized EJU ${args.subject} study plan that takes a motivated student from the basics to a HIGH EJU score in a few months of focused study.`,
    'Organize it into 3–5 PHASES in a sensible learning order (e.g. foundations → core high-yield topics → advanced & integration → exam-readiness / weak-point cleanup). Give each phase a short, motivating title.',
    'Each phase has an ORDERED list of lessons. Every lesson MUST be one of the taxonomy nodes in the catalog below, referenced by its EXACT id. Order lessons by what PROVABLY recurs most on real EJU papers AND by prerequisite order (foundational ideas before things that build on them).',
    'Cover the EJU-relevant nodes (you may leave out clearly peripheral ones), each at most once. Do NOT invent nodes or ids, and do NOT output anything not in the catalog.',
    weak.length
      ? `The student is currently WEAK on: ${weak.join(', ')}. Give these extra priority — schedule them a little earlier and make sure they are included.`
      : '',
    'For each lesson give a ONE-LINE "why": what it covers and why it is high-yield on the EJU. Be concrete and exam-focused, not generic.',
    `Write the phase titles and the "why" lines in ${writeLang(args.lang)}.`,
    'Respond with ONLY JSON, no code fences: {"phases":[{"title":"...","lessons":[{"id":"<node id from the catalog>","why":"..."}]}]}.',
    '',
    'Taxonomy catalog (id: label):',
    catalog,
  ].join('\n');
  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: userText }], 4000, false
  );
  const parsed = extractJson<{ phases?: any[] }>(raw, { phases: [] });
  const valid = new Set<string>([...topics.map((t) => t.id), ...subs.map((s) => s.id)]);
  const seen = new Set<string>();
  const phases: LessonPlanPhase[] = (parsed.phases ?? [])
    .map((p: any) => ({
      title: String(p?.title ?? '').trim() || 'Study',
      lessons: (Array.isArray(p?.lessons) ? p.lessons : [])
        .map((l: any) => ({ id: String(l?.id ?? '').trim(), why: String(l?.why ?? '').trim() }))
        .filter((l: any) => valid.has(l.id) && !seen.has(l.id) && (seen.add(l.id), true))
        .map((l: any) => ({ id: l.id, label: labelFor(args.subject, l.id, args.lang), why: l.why })),
    }))
    .filter((p: LessonPlanPhase) => p.lessons.length);
  return { phases };
}

// ─── Mindmap coach ───
// Conversational assistant that operates ON the student's saved Mindmap: it can
// search/explain what's there and add/remove/edit concepts on request. Returns a
// reply plus a list of validated operations for the client to apply.
export type MindmapConcept = { id: string; kind: 'formula' | 'fact'; text: string; category: string; starred?: boolean };
export type MindmapOp =
  | { op: 'add'; kind: 'formula' | 'fact'; text: string; category: string }
  | { op: 'remove'; id: string }
  | { op: 'update'; id: string; text?: string; kind?: 'formula' | 'fact'; category?: string };

const MINDMAP_OPS_MARK = '###MINDMAP_OPS###';

function sanitizeOps(subject: Subject, arr: any, validIds: Set<string>): MindmapOp[] {
  if (!Array.isArray(arr)) return [];
  const out: MindmapOp[] = [];
  for (const o of arr.slice(0, 40)) {
    if (!o || typeof o !== 'object') continue;
    if (o.op === 'add' && typeof o.text === 'string' && o.text.trim()) {
      out.push({
        op: 'add',
        kind: o.kind === 'fact' ? 'fact' : 'formula',
        text: String(o.text).trim(),
        category: canonicalCategory(subject, o.category),
      });
    } else if (o.op === 'remove' && typeof o.id === 'string' && validIds.has(o.id)) {
      out.push({ op: 'remove', id: o.id });
    } else if (o.op === 'update' && typeof o.id === 'string' && validIds.has(o.id)) {
      const u: MindmapOp = { op: 'update', id: o.id };
      if (typeof o.text === 'string' && o.text.trim()) u.text = o.text.trim();
      if (o.kind === 'formula' || o.kind === 'fact') u.kind = o.kind;
      if (typeof o.category === 'string') u.category = canonicalCategory(subject, o.category);
      if (u.text || u.kind || u.category !== undefined) out.push(u);
    }
  }
  return out;
}

export async function mindmapCoach(args: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  concepts: MindmapConcept[];
  model?: string;
  userKey?: string;
}): Promise<{ text: string; ops: MindmapOp[] }> {
  const messages = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return { text: '', ops: [] };

  const choices = categoryChoicesFor(args.subject);
  const catList = choices.length ? choices.map((c) => `${c.id} (${c.label})`).join(', ') : '(none defined)';
  const catLabel = new Map(choices.map((c) => [c.id, c.label]));
  const listing = args.concepts.length
    ? args.concepts
        .map((c) => `- [${c.id}]${c.starred ? ' ★' : ''} (${catLabel.get(c.category) ?? 'General'}) ${c.kind}: ${c.text}`)
        .join('\n')
    : '(the Mindmap is currently empty for this subject)';
  const starred = args.concepts.filter((c) => c.starred).length;

  const directive = [
    `You are the student's Mindmap assistant for EJU ${args.subject}. Their Mindmap is a personal, saved ` +
      'collection of key concepts (formulas/facts) grouped into categories. Its CURRENT content for this subject ' +
      '(each line is "[id] (category) kind: text"; a ★ marks concepts the student starred as important):',
    listing,
    '',
    `Allowed categories — id (label): ${catList}. Never invent a new category.`,
    starred
      ? `The student has starred ${starred} concept(s) (marked ★) as their priorities — when they ask about their ` +
        'starred / favourite / important concepts, or ask you to review or quiz them, focus on those.'
      : '',
    '',
    'Help with the request. The student may want to SEARCH/REVIEW (find or explain what they already have — answer ' +
      'from the list and cite concepts), ADD important exam-relevant concepts, REMOVE concepts they name, or ' +
      'EDIT/RECATEGORIZE existing ones. Only change the map when they clearly ask you to; for pure questions just answer. ' +
      `Keep added/edited concepts exam-worthy. ${CONCEPT_TEXT_RULE}`,
    '',
    `Write a short, friendly reply in ${writeLang(args.lang)} as Markdown (LaTeX as $...$); briefly summarize any changes you make.`,
    `Then, ONLY if you are changing the map, append a final line that is exactly "${MINDMAP_OPS_MARK}" followed by a ` +
      'single-line JSON array of operations, and nothing after it. Each operation is one of: ' +
      '{"op":"add","kind":"formula"|"fact","text":"...","category":"<id>"}, {"op":"remove","id":"<existing id>"}, ' +
      '{"op":"update","id":"<existing id>","text":"..."(optional),"kind":"..."(optional),"category":"<id>"(optional)}. ' +
      'For remove/update use only ids that appear in the list above. If you are not changing anything, omit the marker entirely.',
  ].join('\n');

  const raw = await executeModelCall(args.model, args.userKey, args.subject, args.lang, directive, messages, 4000, false);

  const i = raw.indexOf(MINDMAP_OPS_MARK);
  const text = (i >= 0 ? raw.slice(0, i) : raw).trim();
  const ops =
    i >= 0
      ? sanitizeOps(args.subject, extractJson<any[]>(raw.slice(i + MINDMAP_OPS_MARK.length), []), new Set(args.concepts.map((c) => c.id)))
      : [];
  return { text: text || raw.trim(), ops };
}
