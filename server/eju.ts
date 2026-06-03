import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, 'data', 'eju');

export type Subject = 'physics' | 'chemistry' | 'biology' | 'math';
export const SUBJECTS: Subject[] = ['physics', 'chemistry', 'biology', 'math'];

export type Lang = 'en' | 'ja' | 'zh' | 'tr';

interface LocalizedName {
  en: string;
  ja: string;
  zh?: string;
  tr?: string;
}

// The topic taxonomy currently ships en/ja labels; zh/tr fall back to English.
const pick = (n: LocalizedName, lang: Lang): string => n[lang] || n.en;
interface Subtopic {
  id: string;
  name: LocalizedName;
  keywords?: string[];
}
interface Topic {
  id: string;
  name: LocalizedName;
  subtopics?: Subtopic[];
}
interface Archetype {
  topicId: string;
  description: string;
  exampleStem?: string;
  sourceYear?: string;
}
interface SubjectKB {
  subject: string;
  displayName: LocalizedName;
  examFormat?: string;
  topics: Topic[];
  questionArchetypes?: Archetype[];
  styleNotes?: string;
  sources?: string[];
  constants?: unknown;
  taxonomyNote?: string;
  status?: string;
}

const RAW_SYLLABUS: Partial<Record<Subject, string>> = {
  physics: 'physics_syllabus_2026.md',
  chemistry: 'chemistry_syllabus_2026.md',
};

function loadKB(subject: Subject): SubjectKB | null {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, `${subject}.json`), 'utf8')) as SubjectKB;
  } catch (e) {
    console.warn(`[eju] could not load ${subject}.json:`, (e as Error).message);
    return null;
  }
}

function loadRaw(filename: string): string {
  try {
    return readFileSync(join(DATA_DIR, 'raw', filename), 'utf8');
  } catch {
    return '';
  }
}

const kbCache = new Map<Subject, SubjectKB | null>();
export function getKB(subject: Subject): SubjectKB | null {
  if (!kbCache.has(subject)) kbCache.set(subject, loadKB(subject));
  return kbCache.get(subject) ?? null;
}

export function topicsFor(subject: Subject, lang: Lang) {
  const kb = getKB(subject);
  if (!kb) return [];
  return kb.topics.map((t) => ({ id: t.id, name: pick(t.name, lang) }));
}

/** Flattened subtopics with their parent topic name as `group` (for grouped selects). */
export function subtopicsFor(subject: Subject, lang: Lang) {
  const kb = getKB(subject);
  if (!kb) return [];
  const out: { id: string; name: string; group: string }[] = [];
  for (const t of kb.topics) {
    const group = pick(t.name, lang);
    for (const s of t.subtopics ?? []) {
      out.push({ id: s.id, name: pick(s.name, lang), group });
    }
  }
  return out;
}

/** Resolve a topic OR subtopic id to a human label. */
export function labelFor(subject: Subject, id: string, lang: Lang): string {
  const kb = getKB(subject);
  if (!kb) return id;
  for (const t of kb.topics) {
    if (t.id === id) return pick(t.name, lang);
    for (const s of t.subtopics ?? []) {
      if (s.id === id) return pick(s.name, lang);
    }
  }
  return id;
}

// Backwards-compatible alias.
export const topicName = labelFor;

// ─────────────────────────── Mock exams (past-paper review) ───────────────────────────
export interface MockQuestion {
  id: string;
  number?: number;
  topic: string;
  prompt: string;
  choices?: string[];
  answerIndex: number;
  answer: string;
  explanation: string;
}
export interface MockExam {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  questions: MockQuestion[];
}

let mockExamsCache: MockExam[] | null = null;
function loadMockExams(): MockExam[] {
  if (mockExamsCache) return mockExamsCache;
  try {
    const raw = JSON.parse(readFileSync(join(DATA_DIR, 'mock-exams.json'), 'utf8'));
    mockExamsCache = Array.isArray(raw?.exams) ? (raw.exams as MockExam[]) : [];
  } catch (e) {
    console.warn('[eju] could not load mock-exams.json:', (e as Error).message);
    mockExamsCache = [];
  }
  return mockExamsCache;
}

// ── Rich per-paper extractions (bilingual, figure-described, verified) ──
// These live in data/eju/past-questions/<subject>/*.json and are localized on the
// fly. When a rich exam shares an id with a legacy mock-exams.json entry, the rich
// (more complete) version wins.
interface RichLoc {
  prompt: string;
  choices?: string[];
}
interface RichQuestion {
  id: string;
  answerRow?: number;
  topicId?: string;
  subtopic?: string;
  hasFigure?: boolean;
  figure?: Partial<Record<Lang, string>>;
  ja: RichLoc;
  en: RichLoc;
  answerIndex: number;
  answer: Partial<Record<Lang, string>>;
  explanation: Partial<Record<Lang, string>>;
}
interface RichExam {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  questions: RichQuestion[];
}

const BLOCK_NAME: Record<string, LocalizedName> = {
  mech: { en: 'Mechanics', ja: '力学' },
  thermo: { en: 'Thermodynamics', ja: '熱力学' },
  waves: { en: 'Waves', ja: '波動' },
  em: { en: 'Electricity & Magnetism', ja: '電気と磁気' },
  atoms: { en: 'Atoms', ja: '原子' },
  // Chemistry topic categories (match data/eju/chemistry.json topic ids)
  'matter-structure': { en: 'Structure of Matter', ja: '物質の構成' },
  'states-and-change': { en: 'State & Change of Substances', ja: '物質の状態と変化' },
  inorganic: { en: 'Inorganic Chemistry', ja: '無機化学' },
  organic: { en: 'Organic Chemistry', ja: '有機化学' },
};

let richExamsCache: RichExam[] | null = null;
function loadRichExams(): RichExam[] {
  if (richExamsCache) return richExamsCache;
  const out: RichExam[] = [];
  for (const subject of SUBJECTS) {
    const dir = join(DATA_DIR, 'past-questions', subject);
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    } catch {
      continue; // no folder for this subject yet
    }
    for (const f of files) {
      try {
        out.push(JSON.parse(readFileSync(join(dir, f), 'utf8')) as RichExam);
      } catch (e) {
        console.warn(`[eju] could not load past-questions/${subject}/${f}:`, (e as Error).message);
      }
    }
  }
  richExamsCache = out;
  return out;
}

/** Localize one rich question into the flat MockQuestion shape (en for zh/tr). */
function richToMockQuestion(q: RichQuestion, lang: Lang): MockQuestion {
  const loc: 'ja' | 'en' = lang === 'ja' ? 'ja' : 'en';
  const block = q.topicId ? pick(BLOCK_NAME[q.topicId] ?? { en: q.topicId, ja: q.topicId }, lang) : '';
  const topic = [block, q.subtopic].filter(Boolean).join(' · ');
  let prompt = q[loc]?.prompt ?? q.en.prompt;
  const fig = q.figure?.[loc] ?? q.figure?.en;
  if (fig) prompt += `\n\n*${loc === 'ja' ? '図' : 'Figure'}: ${fig}*`;
  return {
    id: q.id,
    number: q.answerRow,
    topic,
    prompt,
    choices: q[loc]?.choices ?? q.en.choices,
    answerIndex: q.answerIndex,
    answer: q.answer?.[loc] ?? q.answer?.en ?? '',
    explanation: q.explanation?.[loc] ?? q.explanation?.en ?? '',
  };
}

function richToMockExam(ex: RichExam, lang: Lang): MockExam {
  const { questions, ...meta } = ex;
  return { ...meta, questions: questions.map((q) => richToMockQuestion(q, lang)) };
}

/** Legacy + rich exams merged by id (rich wins), localized to `lang`. */
function allExams(lang: Lang): MockExam[] {
  const byId = new Map<string, MockExam>();
  for (const e of loadMockExams()) byId.set(e.id, e);
  for (const e of loadRichExams()) byId.set(e.id, richToMockExam(e, lang));
  return [...byId.values()];
}

/** Exam metadata (no questions) plus a question count, newest first. */
export function mockExamList() {
  return allExams('en')
    .map(({ questions, ...meta }) => ({ ...meta, count: questions.length }))
    .sort((a, b) => b.year - a.year || b.session - a.session || a.subject.localeCompare(b.subject));
}

export function mockExam(id: string, lang: Lang = 'en'): MockExam | null {
  return allExams(lang).find((e) => e.id === id) ?? null;
}

// Build the (large, stable) per-subject system context. This is what we mark
// for prompt caching, so it must be byte-identical across requests for a subject.
const contextCache = new Map<Subject, string>();
export function systemContextFor(subject: Subject): string {
  if (contextCache.has(subject)) return contextCache.get(subject)!;
  const kb = getKB(subject);
  const name = kb?.displayName?.en ?? subject;
  let ctx = `# EJU ${name} — exam knowledge base\n\n`;
  ctx +=
    'Reference material distilled from the official EJU syllabus and a decade of past papers. ' +
    'Use it to ground every answer and to generate questions in the authentic EJU style, scope, and difficulty.\n\n';

  if (kb?.examFormat) ctx += `## Exam format\n${kb.examFormat}\n\n`;

  if (kb?.topics?.length) {
    ctx += '## Topic taxonomy\n';
    for (const t of kb.topics) {
      ctx += `- ${t.id}: ${t.name.en} / ${t.name.ja}\n`;
      for (const s of t.subtopics ?? []) {
        const kw = s.keywords?.length ? ` — ${s.keywords.join(', ')}` : '';
        ctx += `  - ${s.name.en} / ${s.name.ja}${kw}\n`;
      }
    }
    ctx += '\n';
  }

  if (kb?.questionArchetypes?.length) {
    ctx += '## Question archetypes observed in past papers\n';
    for (const a of kb.questionArchetypes) {
      ctx += `- [${a.topicId}] ${a.description}`;
      if (a.exampleStem) ctx += `\n    e.g. "${a.exampleStem}"`;
      if (a.sourceYear) ctx += ` (source: ${a.sourceYear})`;
      ctx += '\n';
    }
    ctx += '\n';
  }

  if (kb?.constants) ctx += `## Printed constants / conventions\n${JSON.stringify(kb.constants)}\n\n`;
  if (kb?.styleNotes) ctx += `## Style notes for authentic question generation\n${kb.styleNotes}\n\n`;
  if (kb?.taxonomyNote) ctx += `## Note on taxonomy\n${kb.taxonomyNote}\n\n`;

  const rawName = RAW_SYLLABUS[subject];
  if (rawName) {
    const raw = loadRaw(rawName);
    if (raw) ctx += `## Official 2026 syllabus (verbatim)\n${raw}\n`;
  }

  if (subject === 'math' && !kb?.topics?.length) {
    ctx +=
      '\nIMPORTANT: Past EJU mathematics papers have not yet been ingested into this knowledge base. ' +
      'Generate questions from the official EJU Mathematics scope — Course 1 (Basic) and Course 2 (Advanced) — ' +
      'using standard, well-established knowledge of the exam. The EJU math answer format is digit-by-digit ' +
      'fill-in-the-blank (each box is a single digit 0-9 or a minus sign).\n';
  }

  contextCache.set(subject, ctx);
  return ctx;
}
