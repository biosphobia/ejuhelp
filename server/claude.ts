import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { systemContextFor, labelFor, exemplarsFor, subtopicsFor, type Subject } from './eju';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
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

function systemBlocks(subject: Subject, lang: Lang, extra?: string) {
  const blocks: any[] = [
    { type: 'text', text: GLOBAL_INSTRUCTIONS },
    // CRITICAL: We restored the cache_control block for EJU Context
    { type: 'text', text: systemContextFor(subject), cache_control: { type: 'ephemeral' } },
    { type: 'text', text: langLine(lang) },
  ];
  if (extra) blocks.push({ type: 'text', text: extra });
  return blocks;
}

// ─── UNIVERSAL ROUTER ───
// Preserves perfect Claude caching while translating for Gemini/GPT
async function executeModelCall(
  modelType: string | undefined,
  userKey: string | undefined,
  subject: Subject,
  lang: Lang,
  extraSystem: string | undefined,
  messages: any[],
  maxTokens: number
): Promise<string> {
  const targetModel = modelType || 'gemini';
  const sysBlocks = systemBlocks(subject, lang, extraSystem);

  // Dev aid: print the exact prompt instead of calling any model.
  if (process.env.EJU_DRY_RUN) {
    const sys = sysBlocks.map((b) => (b.cache_control ? `[EJU knowledge base: ${b.text.length} chars]` : b.text)).join('\n\n');
    const user = messages
      .map(
        (m) =>
          `--- ${m.role} ---\n` +
          (typeof m.content === 'string'
            ? m.content
            : m.content.map((p: any) => (p.type === 'text' ? p.text : `[${p.type}]`)).join('\n'))
      )
      .join('\n');
    console.log(`\n===== DRY RUN (${targetModel}, max ${maxTokens}) =====\n${sys}\n${user}\n===== END =====`);
    return '';
  }

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
      topic: typeof k.topic === 'string' && k.topic ? k.topic : undefined,
    }));
}

// ─── Formatting helpers shared by coach replies ───
// Figures the client can draw natively (see src/ui/diagrams.tsx). The model may
// embed one with a ":::fig <id>" line when it genuinely helps.
const FIGURE_LIBRARY: [string, string, Subject][] = [
  ['projectile', 'projectile motion: parabola with vx constant and vy changing', 'physics'],
  ['incline-fbd', 'free-body diagram of a block on an incline (N, mg components, friction)', 'physics'],
  ['torque', 'lever / torque balance about a pivot', 'physics'],
  ['circular', 'uniform circular motion: velocity tangent, centripetal force inward', 'physics'],
  ['shm-energy', 'simple harmonic motion: KE / PE exchange vs displacement', 'physics'],
  ['collision', '1-D collision before/after momentum diagram', 'physics'],
  ['pv-diagram', 'p-V diagram: isothermal, adiabatic, isobaric, isochoric; work = area', 'physics'],
  ['maxwell-speeds', 'molecular speed distribution at two temperatures', 'physics'],
  ['wave-snapshot', 'wave y-x snapshot showing wavelength and amplitude', 'physics'],
  ['standing-wave', 'standing wave on a string / in a pipe: nodes and antinodes', 'physics'],
  ['doppler', 'Doppler effect: source moving, wavefronts compressed ahead', 'physics'],
  ['refraction', 'refraction at a boundary (Snell), critical angle', 'physics'],
  ['lens', 'convex lens ray diagram, image formation', 'physics'],
  ['young', "Young's double slit: path difference d sin θ", 'physics'],
  ['thin-film', 'thin-film interference reflection paths', 'physics'],
  ['field-lines', 'electric field lines and equipotentials of point charges', 'physics'],
  ['capacitor', 'parallel-plate capacitor, dielectric, series/parallel', 'physics'],
  ['circuit', 'DC circuit with series/parallel resistors', 'physics'],
  ['wire-field', 'magnetic field around a straight current (right-hand rule)', 'physics'],
  ['left-hand', "Fleming's left-hand rule: F = IBL", 'physics'],
  ['induction', 'electromagnetic induction: flux change and induced EMF direction', 'physics'],
  ['ac-phase', 'AC phase relations for R, L, C', 'physics'],
  ['photoelectric', 'photoelectric effect: K_max vs frequency, work function', 'physics'],
  ['bohr', 'Bohr model energy levels and transitions', 'physics'],
  ['decay', 'radioactive decay curve, half-life', 'physics'],
  ['titration-curve', 'pH titration curves (strong/weak acid vs base, indicator ranges)', 'chemistry'],
  ['vapor-pressure', 'vapour pressure vs temperature, boiling point', 'chemistry'],
  ['phase-diagram', 'phase diagram (water / CO2), triple and critical points', 'chemistry'],
  ['unit-cells', 'crystal unit cells: sc, bcc, fcc atoms per cell', 'chemistry'],
  ['energy-diagram', 'reaction energy diagram: activation energy, ΔH, catalyst', 'chemistry'],
  ['equilibrium-shift', "Le Chatelier: equilibrium shift on changing conditions", 'chemistry'],
  ['daniell', 'Daniell cell: electrodes, ion flow, salt bridge', 'chemistry'],
  ['electrolysis', 'electrolysis cell: cathode/anode products', 'chemistry'],
  ['alcohol-oxidation', 'alcohol → aldehyde/ketone → carboxylic acid oxidation chain', 'chemistry'],
  ['atp', 'ATP / ADP energy cycle', 'biology'],
  ['mitochondrion', 'mitochondrion structure and respiration stages', 'biology'],
  ['chloroplast', 'chloroplast structure, light-dependent and Calvin cycle', 'biology'],
  ['nitrogen-cycle', 'nitrogen cycle', 'biology'],
  ['replication-fork', 'DNA replication fork, leading/lagging strands', 'biology'],
  ['central-dogma', 'DNA → RNA → protein', 'biology'],
  ['recombinant', 'recombinant DNA / plasmid steps', 'biology'],
  ['linkage', 'linkage and crossing over', 'biology'],
  ['meiosis', 'meiosis stages and chromosome numbers', 'biology'],
  ['embryo-sac', 'angiosperm embryo sac and double fertilisation', 'biology'],
  ['gastrula', 'frog / sea urchin development stages', 'biology'],
  ['circulation', 'human circulatory system (heart chambers, vessels)', 'biology'],
  ['oxygen-dissociation', 'oxygen dissociation curves (Hb, myoglobin, fetal)', 'biology'],
  ['nephron', 'nephron: filtration, reabsorption, concentration', 'biology'],
  ['blood-sugar', 'blood sugar regulation: insulin / glucagon feedback', 'biology'],
  ['thermoregulation', 'body temperature regulation feedback', 'biology'],
  ['immune-response', 'innate vs adaptive immunity overview', 'biology'],
  ['antibody-response', 'primary vs secondary antibody response', 'biology'],
  ['action-potential', 'action potential trace with threshold and phases', 'biology'],
  ['eye', 'eye structure and accommodation', 'biology'],
  ['sarcomere', 'sarcomere / sliding filament', 'biology'],
  ['auxin-response', 'auxin concentration response of root vs shoot', 'biology'],
  ['photoperiod', 'photoperiodism: long-day / short-day plants', 'biology'],
  ['survivorship', 'survivorship curves types I–III', 'biology'],
  ['energy-flow', 'ecosystem energy flow pyramid', 'biology'],
  ['plant-tree', 'plant classification tree', 'biology'],
];

const formatDirective = (subject: Subject) =>
  'FORMATTING TOOLKIT (use only what genuinely helps understanding; never decorate for its own sake):\n' +
  '- Tables: GitHub pipe tables ("| a | b |" with a "|---|---|" separator row) for comparisons, formula lists, sign conventions, step tables.\n' +
  '- Callouts: a line starting with "> " for a warning, trap, or memory hook (one or two sentences).\n' +
  '- Charts: a fenced block ```chart containing ONLY a JSON object, either ' +
  '{"type":"line","title":"...","xLabel":"...","yLabel":"...","series":[{"name":"...","points":[[x,y],...]}],"vlines":[{"x":1,"label":"..."}],"hlines":[{"y":1,"label":"..."}]} ' +
  'or {"type":"bar","title":"...","categories":["..."],"values":[1,2],"yLabel":"..."}. ' +
  'Use 6-40 points per series, plain numbers only, at most 3 series. Use a chart whenever the idea is a relationship between two quantities (v-t, p-V, pH vs volume, K_max vs f, …).\n' +
  '- Figures: a line ":::fig <id>" inserts a ready-made diagram. Available ids (use the exact id): ' +
  FIGURE_LIBRARY.filter((f) => f[2] === subject).map(([id, d]) => `${id} (${d})`).join('; ') +
  '.\n- Use "###" headings to separate steps of a longer explanation. Keep paragraphs short.';

// ─── Ask ───
// The reply is plain Markdown (so LaTeX/backslashes pass through untouched — never
// JSON-encoded), followed by a delimited summary JSON block we strip off.
const SUMMARY_MARK = '###SUMMARY###';
const KEYPOINTS_MARK = '###KEYPOINTS###';

export interface AskSummary {
  /** One or two sentences: the single idea to remember. */
  keyIdea: string;
  /** Formulas / facts worth pinning, LaTeX allowed. */
  formulas: string[];
  /** Common EJU traps on this point. */
  traps: string[];
  /** 2-3 short follow-up questions the student should ask/answer next. */
  nextQuestions: string[];
  /** Subtopic id from the knowledge base if the reply clearly maps to one. */
  topicId?: string;
}

const ASK_DIRECTIVE =
  // Teaching style: beginner-friendly, then exam-ready.
  'Teach as a patient tutor whose student may be new to the topic and is sitting the EJU exam very soon. ' +
  'Explain in plain, everyday language a beginner can follow: avoid jargon, and whenever a technical term is ' +
  'unavoidable, define it in simple words the first time you use it. Build intuition first — a short analogy ' +
  'or a concrete example with real numbers — then walk through the reasoning step by step instead of just ' +
  'stating the result. Keep sentences short. For these coaching replies, favour a clear, complete explanation ' +
  'over terseness (this overrides the general "be concise" instruction), but stay on point and do not ramble. ' +
  'Because the exam is near, make the must-know parts impossible to miss: bold the key terms and results. ' +
  'If the student is answering a practice question, do not just confirm: explain why each wrong choice is tempting. ' +
  // Formatting.
  'Write your reply directly as GitHub-flavored Markdown with LaTeX math ($...$ inline, $$...$$ display), ' +
  'using the formatting toolkit above where it helps. Do NOT wrap the reply in JSON and do NOT put the whole reply in a code fence. ' +
  'Do NOT write an "Exam essentials" section in the prose — that information goes in the summary block instead. ' +
  // Structured summary (machine-parsed → shown as a takeaway card).
  `After the reply, write a line that is exactly "${SUMMARY_MARK}" and then ONE JSON object on the following lines and nothing after it: ` +
  '{"keyIdea":"<one or two plain sentences: the single thing to remember>","formulas":["<formula or fact to memorise, LaTeX allowed>", ...up to 4],' +
  '"traps":["<a specific EJU mistake and how to avoid it>", ...up to 3],"nextQuestions":["<short follow-up question the student could ask next to deepen understanding or check themselves>", ...2-3],' +
  '"topicId":"<the knowledge-base subtopic id this is mostly about, or empty>"}. ' +
  'Write the summary strings in the same language as the reply. Escape backslashes as \\\\ inside the JSON.';

function cleanSummary(v: any): AskSummary | null {
  if (!v || typeof v !== 'object') return null;
  const strs = (a: any, max: number) =>
    Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()).map((x) => String(x).trim()).slice(0, max) : [];
  const keyIdea = typeof v.keyIdea === 'string' ? v.keyIdea.trim() : '';
  const s: AskSummary = {
    keyIdea,
    formulas: strs(v.formulas, 4),
    traps: strs(v.traps, 3),
    nextQuestions: strs(v.nextQuestions, 3),
    topicId: typeof v.topicId === 'string' && v.topicId.trim() ? v.topicId.trim() : undefined,
  };
  if (!s.keyIdea && !s.formulas.length && !s.traps.length && !s.nextQuestions.length) return null;
  return s;
}

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

const TRIPLE = '"""';

/** What the coach has learned so far about this student's handwriting and note habits. */
function profileCtx(profile?: string[]): string | undefined {
  const list = (profile ?? []).map((x) => String(x).trim()).filter(Boolean).slice(0, 40);
  if (!list.length) return undefined;
  return (
    "Known habits of THIS student's handwriting and note-taking, learned from earlier pages (use them to read the page correctly):\n" +
    list.map((x) => `- ${x}`).join('\n')
  );
}
const OBSERVE_DIRECTIVE =
  'Also return "observations": 0-4 short, specific, reusable facts about how THIS student writes that would help read their future pages ' +
  '(letter or kana shapes that look like something else, abbreviations and symbols they use, words they write in hiragana or in English, layout habits). ' +
  'Only include things you actually saw and that are not already in the known habits. Write them in the same language as the student\'s UI. No praise, no generalities.';

export async function ask(args: {
  subject: Subject;
  lang: Lang;
  messages: ChatMessage[];
  /** The question the student is currently looking at, so "this question" resolves. */
  context?: string;
  /** Study notes the student is reviewing, so follow-ups build on them. */
  notes?: string;
  /** A capture of the student's own handwritten page, attached to the latest message. */
  imageDataUrl?: string;
  /** Known handwriting / note habits of this student. */
  profile?: string[];
  model?: string;
  userKey?: string;
}): Promise<{ text: string; keyPoints: KeyPointDTO[]; summary: AskSummary | null }> {
  const messages: any[] = args.messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  if (!messages.length) return { text: '', keyPoints: [], summary: null };

  let imageCtx: string | undefined;
  const im = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (im && messages[messages.length - 1].role === 'user') {
    const [, media_type, data] = im;
    const last = messages[messages.length - 1];
    last.content = [
      { type: 'image', source: { type: 'base64', media_type, data } },
      { type: 'text', text: last.content },
    ];
    imageCtx =
      "The image attached to the latest message is a capture of the student's OWN handwritten notebook page. " +
      'Read the handwriting carefully (it may be rough, abbreviated or partly in Japanese). Work from what is actually written; ' +
      'if something is illegible, say which part rather than guessing. When asked to tidy or rewrite the notes, produce clean, ' +
      'well-structured study notes in Markdown that keep the student\'s own order of ideas where sensible.';
  }

  const ctx = args.context?.trim()
    ? `The student is currently looking at this specific question:\n${TRIPLE}\n${args.context.trim()}\n${TRIPLE}\n` +
      'When the student says "this", "this question", "this problem", "これ", "この問題" or similar, they are ' +
      'referring to the question above — answer about it directly. Do not ask which question they mean.'
    : undefined;
  const notesCtx = args.notes?.trim()
    ? `The student is currently reviewing these study notes:\n${TRIPLE}\n${args.notes.trim()}\n${TRIPLE}\n` +
      'Treat the notes as the shared starting point: build on them, do not repeat them wholesale, and when the ' +
      'student asks "why" go one level deeper into the underlying logic. Point out if a note is being misread.'
    : undefined;
  const ids =
    'Subtopic ids you may use for "topicId" (id = name): ' +
    subtopicsFor(args.subject, 'en').map((s) => `${s.id} = ${s.name}`).join('; ') +
    '.';
  const extra = [ctx, notesCtx, imageCtx, imageCtx ? profileCtx(args.profile) : undefined, formatDirective(args.subject), ASK_DIRECTIVE, ids]
    .filter(Boolean)
    .join('\n\n');

  const raw = await executeModelCall(args.model, args.userKey, args.subject, args.lang, extra, messages, 8000);

  const si = raw.indexOf(SUMMARY_MARK);
  const ki = raw.indexOf(KEYPOINTS_MARK);
  const cut = [si, ki].filter((i) => i >= 0);
  const end = cut.length ? Math.min(...cut) : -1;
  const text = (end >= 0 ? raw.slice(0, end) : raw).trim();

  let summary: AskSummary | null = null;
  if (si >= 0) summary = cleanSummary(extractJson<any>(raw.slice(si + SUMMARY_MARK.length), null));

  let keyPoints: KeyPointDTO[] = [];
  if (summary) {
    keyPoints = summary.formulas.map((f) => ({ kind: 'formula' as const, text: f, topic: summary!.topicId }));
  } else if (ki >= 0) {
    keyPoints = parseKeyPointLines(raw.slice(ki + KEYPOINTS_MARK.length));
  }
  return { text: text || raw.trim(), keyPoints, summary };
}

// ─── Generate Questions ───
export interface GenQuestion {
  id: string;
  topic: string;
  /** Knowledge-base subtopic id when the request targeted one (links back to notes). */
  topicId?: string;
  prompt: string;
  choices?: string[];
  answerIndex: number;
  answer: string;
  explanation: string;
  /** A nudge that does not give the answer away. */
  hint?: string;
  /** The one idea this question is really testing. */
  keyIdea?: string;
  /** Per-choice note: why each wrong option is tempting (same order as choices). */
  choiceNotes?: string[];
  /** The typical mistake this question catches. */
  trap?: string;
}

export async function generate(args: {
  subject: Subject;
  lang: Lang;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  focus?: { topics?: string[]; tags?: string[] };
  /** Make variants of this question (same concept, new numbers / situation). */
  similarTo?: { prompt: string; answer?: string };
  /** The note's core idea for this topic, so questions test what the notes teach. */
  noteCore?: string;
  model?: string;
  userKey?: string;
}): Promise<{ questions: GenQuestion[] }> {
  const n = Math.max(1, Math.min(5, args.count || 3));
  const tName = args.topic ? labelFor(args.subject, args.topic, args.lang) : null;
  const exemplars = exemplarsFor(args.subject, args.topic, args.lang, args.similarTo ? 1 : 3);

  const parts: string[] = [];
  if (args.similarTo) {
    parts.push(
      `Write ${n} NEW question(s) that test the same concept as the question below, but with different numbers, a different situation or a different angle (for example swap what is given and what is asked). Never repeat the original.`,
      `Original question:\n${TRIPLE}\n${args.similarTo.prompt.trim()}\n${TRIPLE}` +
        (args.similarTo.answer ? `\nIts answer: ${args.similarTo.answer.trim()}` : '')
    );
  } else {
    parts.push(
      `Generate ${n} EJU-style ${args.subject} question(s)${tName ? ` specifically on: ${tName}` : ' across the most exam-relevant topics'}.`
    );
  }
  parts.push(`Difficulty: ${args.difficulty} ("medium" = typical EJU exam level; "easy" = the first step a beginner must master; "hard" = combines two ideas like the hardest EJU items).`);
  parts.push(
    'Match the authentic EJU question style: short scenario, concrete numbers with SI units, one clear thing asked, ' +
      'usually 4-6 choices where every wrong choice is the result of a SPECIFIC common mistake (wrong sign, forgot a factor of 2, unit slip, used the wrong formula), not a random number. ' +
      'Quantitative questions should be solvable in 2-4 lines by hand. Do not rely on a figure the student cannot see: describe any setup fully in words.'
  );
  if (exemplars.length) {
    parts.push(
      'Here are real past EJU questions on this topic. Imitate their STYLE, scope and difficulty only — do NOT copy their numbers, wording or answers:\n' +
        exemplars
          .map(
            (e, i) =>
              `[${i + 1}] (${e.source}) ${e.prompt}` +
              (e.choices?.length ? `\nChoices: ${e.choices.map((c, j) => `(${j + 1}) ${c}`).join('  ')}` : '') +
              (e.answer ? `\nAnswer: ${e.answer}` : '')
          )
          .join('\n\n')
    );
  }
  if (args.noteCore) {
    parts.push(`The student has just studied this core idea; make sure the questions test it directly:\n${TRIPLE}\n${args.noteCore.trim()}\n${TRIPLE}`);
  }
  if (args.focus && (args.focus.topics?.length || args.focus.tags?.length)) {
    if (args.focus.topics?.length)
      parts.push(`Personalize: the student is currently weakest in: ${args.focus.topics.join('; ')}. Prioritize these.`);
    if (args.focus.tags?.length)
      parts.push(
        `They frequently make these mistakes: ${args.focus.tags.join(', ')}. Design questions that specifically probe and help fix them (e.g. require careful unit conversion if "units").`
      );
  }
  parts.push(
    'For each question also write: a hint (a nudge toward the first step, never the answer), the key idea being tested (one sentence), ' +
      'a note per choice explaining why that option is right or which mistake produces it, the trap most students fall into, ' +
      'and an explanation written for a total beginner: state the idea in plain words, then show every step with numbers, then the answer, then a one-line "how to recognise this type next time".'
  );
  parts.push(`Write everything in ${writeLang(args.lang)}.`);
  parts.push(
    'Respond with ONLY a single JSON object, no other text or code fences: ' +
      '{"questions":[{"topic":"<sub-topic name>","prompt":"...","choices":["..."],"answerIndex":<0-based index of the correct choice, or -1 if not multiple-choice>,' +
      '"answer":"<correct answer in words>","hint":"...","keyIdea":"...","choiceNotes":["<one per choice, same order>"],"trap":"...","explanation":"<beginner-friendly worked solution in Markdown with LaTeX>"}]}.'
  );

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [{ role: 'user', content: parts.join('\n\n') }], 16000
  );

  const parsed = extractJson<{ questions?: any[] }>(raw, { questions: [] });
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const str = (v: any) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const questions: GenQuestion[] = (parsed.questions ?? []).map((q: any, i: number) => {
    const choices = Array.isArray(q.choices) && q.choices.length ? q.choices.map(String) : undefined;
    const idx = Number.isInteger(q.answerIndex) ? q.answerIndex : -1;
    const notes = Array.isArray(q.choiceNotes) && choices && q.choiceNotes.length === choices.length ? q.choiceNotes.map(String) : undefined;
    return {
      id: `${stamp}-${i}`,
      topic: String(q.topic ?? tName ?? ''),
      topicId: args.topic,
      prompt: String(q.prompt ?? ''),
      choices,
      answerIndex: choices && idx >= 0 && idx < choices.length ? idx : -1,
      answer: String(q.answer ?? ''),
      explanation: String(q.explanation ?? ''),
      hint: str(q.hint),
      keyIdea: str(q.keyIdea),
      choiceNotes: notes,
      trap: str(q.trap),
    };
  }).filter((q) => q.prompt);
  return { questions };
}

// ─── Check Work ───
const ERROR_TAGS = ['units', 'sign', 'arithmetic', 'algebra', 'concept', 'formula', 'misread', 'incomplete', 'none'];
const CHECK_META_MARK = '###META###';

export interface CheckResult {
  feedback: string;
  correct: 'yes' | 'no' | 'partial' | 'unknown';
  topic: string;
  errorTags: string[];
  /** If the attached question is multiple-choice and the work clearly concludes one
   *  option, the 0-based index of that choice (counting the listed options in order); else -1. */
  studentAnswerIndex: number;
}

export async function check(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  question?: string;
  profile?: string[];
  model?: string;
  userKey?: string;
}): Promise<CheckResult> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const instructions = [
    args.question
      ? `The student is attempting this EJU question:\n"""\n${args.question}\n"""\n`
      : 'No specific question is attached.\n',
    "The image is a capture of the student's OWN handwritten work on a whiteboard.",
    profileCtx(args.profile) ?? '',
    'Grade ONLY what is actually written in the image. Do NOT solve the problem yourself, and never report an answer or conclusion that is not physically written on the page.',
    'CRITICAL: If the page is blank, almost blank, or shows no genuine solution attempt (only the question text, doodles, or a few stray marks), do NOT grade it — set correct to "unknown", and in the feedback say there is nothing to check yet and invite the student to write their working. An empty or missing solution is never "correct".',
    '',
    'First write the FEEDBACK as Markdown with LaTeX math ($...$ inline, $$...$$ display), in plain beginner-friendly language (define any jargon): briefly transcribe the key readable steps; state whether the written work is correct; pinpoint the FIRST error precisely and explain in simple terms WHY it is wrong; give a short hint to fix it (reveal the full answer only if the work is already complete and correct); finish with a one-line encouraging summary.',
    `Write the feedback in ${writeLang(args.lang)}.`,
    `Then, on a new line, write exactly ${CHECK_META_MARK} and, on the next line, a single-line JSON object (and nothing after it):`,
    `{"correct":"yes"|"no"|"partial"|"unknown","topic":"<specific EJU sub-topic in English>","errorTags":[subset of ${JSON.stringify(ERROR_TAGS)}; use ["none"] when correct and [] when unknown],"studentAnswerIndex":<for a multiple-choice question, the 0-based index of the option the WRITTEN work clearly concludes, counting the listed choices in order; use -1 if it is not multiple-choice or no final choice is written>}`,
    '("partial" = on the right track but incomplete or with a fixable slip.)',
  ].join('\n');

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data } },
          { type: 'text', text: instructions },
        ],
      },
    ], 4000
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
  return {
    feedback: feedback || String(raw ?? ''),
    correct,
    topic: String(p.topic ?? ''),
    errorTags,
    studentAnswerIndex,
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

// ─── Tidy a handwritten page ───
export interface TidyBlock {
  kind: 'h1' | 'h2' | 'p' | 'bullet' | 'formula' | 'added' | 'fix';
  text: string;
}
export interface TidyResult {
  title: string;
  blocks: TidyBlock[];
  /** Short note to the student about what was changed / could not be read. */
  note: string;
  /** New facts about this student's handwriting, to remember for next time. */
  observations: string[];
}

/**
 * Turn a photo of the student's own rough page into clean notes. The student may
 * write fast: bad handwriting, abbreviations, hiragana instead of kanji, mixed
 * languages, crossed-out bits. We reconstruct what they meant, keep their order
 * and language, fix errors, and add only what is essential — marked so the
 * student can tell their own notes from the coach's additions.
 */
export async function tidy(args: {
  subject: Subject;
  lang: Lang;
  imageDataUrl: string;
  /** Optional page title / context typed by the student. */
  hint?: string;
  /** Known handwriting / note habits of this student. */
  profile?: string[];
  model?: string;
  userKey?: string;
}): Promise<TidyResult> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(args.imageDataUrl ?? '');
  if (!m) throw Object.assign(new Error('bad_image'), { status: 400 });
  const [, media_type, data] = m;

  const instructions = [
    "The image is the student's OWN rough notebook page, written quickly in class.",
    'Expect: messy handwriting, abbreviations, arrows, half-finished sentences, crossed-out parts, doodles, and Japanese written in hiragana where the student forgot the kanji (e.g. こうかく for 光角, はんのうねつ for 反応熱). Mixed Japanese/English is normal.',
    'Your job: rewrite the page as clean, well-organised study notes that say what the student MEANT.',
    'Rules:',
    '1. Keep the student\'s language(s). If a line is Japanese, keep it Japanese and write the proper kanji; do not translate. Keep technical terms as the student uses them (add the standard term in brackets only if theirs is wrong).',
    '2. Keep the student\'s order and structure where it makes sense; merge fragments into complete, short sentences; expand abbreviations.',
    '3. Remove noise: crossed-out text, doodles, duplicates, things unrelated to the topic.',
    '4. Fix mistakes silently in the text but ALSO list each fix as a "fix" block ("was X → now Y").',
    '5. Add only what is essential for the EJU and clearly missing (a defining formula, a unit, the key condition); mark every addition as an "added" block so the student knows it is not theirs. Never pad.',
    '6. If part of the page is illegible, say so in the note (which part, your best guess) instead of inventing content.',
    '7. Formulas: write them in plain text, not LaTeX (v = v₀ + at, F = ma, [H⁺][OH⁻] = 10⁻¹⁴). Use Unicode sub/superscripts.',
    args.hint ? `The student labelled this page: "${args.hint}".` : '',
    profileCtx(args.profile) ?? '',
    OBSERVE_DIRECTIVE,
    `The subject is ${args.subject}. If the notes are in a language other than the student's UI language (${writeLang(args.lang)}), still keep the notes' own language.`,
    'Respond with ONLY a single JSON object, no code fences: {"title":"<short title for the page>","blocks":[{"kind":"h1"|"h2"|"p"|"bullet"|"formula"|"added"|"fix","text":"..."}],"note":"<one or two sentences to the student: what you changed, anything you could not read>","observations":["..."]}.',
    'Use h1 once for the topic, h2 for sections, bullet for list items, p for short prose, formula for a formula on its own line. Keep blocks short (a line or two each).',
  ]
    .filter(Boolean)
    .join('\n');

  const raw = await executeModelCall(
    args.model, args.userKey, args.subject, args.lang, undefined, [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data } },
          { type: 'text', text: instructions },
        ],
      },
    ], 6000
  );
  const p = extractJson<Partial<TidyResult>>(raw, {});
  const kinds = ['h1', 'h2', 'p', 'bullet', 'formula', 'added', 'fix'];
  const blocks: TidyBlock[] = (Array.isArray(p.blocks) ? p.blocks : [])
    .filter((b: any) => b && typeof b.text === 'string' && b.text.trim())
    .map((b: any) => ({ kind: kinds.includes(b.kind) ? b.kind : 'p', text: String(b.text).trim() }));
  if (!blocks.length) throw Object.assign(new Error('tidy_failed'), { status: 502 });
  return {
    title: typeof p.title === 'string' && p.title.trim() ? p.title.trim() : '',
    blocks,
    note: typeof p.note === 'string' ? p.note.trim() : '',
    observations: (Array.isArray(p.observations) ? p.observations : []).filter((x: any) => typeof x === 'string' && x.trim()).map((x: string) => x.trim()).slice(0, 4),
  };
}
