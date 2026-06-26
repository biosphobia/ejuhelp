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

/** Canonical top-level categories for the Mindmap, with English labels for prompts. */
export function categoryChoicesFor(subject: Subject): { id: string; label: string }[] {
  return topicsFor(subject, 'en').map((t) => ({ id: t.id, label: t.name }));
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
  /** 1-based page of the original PDF this question is on (for the per-question viewer). */
  page?: number;
  /** 1-based PDF page(s) this question spans (a math 大問 can run over two pages). */
  pages?: number[];
  /** Optional [y0,y1] vertical crop (page-height fractions) when several questions share
   *  a page, so the viewer shows just this question's region. */
  rect?: [number, number];
}
export interface MockExam {
  id: string;
  year: number;
  session: number;
  subject: Subject;
  title: string;
  source?: string;
  /** Google Drive file id of the original EJU PDF, for the zoomable embed. */
  pdfId?: string;
  questions: MockQuestion[];
}

// Map of exam id -> Google Drive file id of the original EJU question PDF, so the
// app can embed Drive's zoomable preview. (Several subject exams from the same
// session share the one combined "science" booklet.)
let pdfMapCache: Record<string, string> | null = null;
function pdfMap(): Record<string, string> {
  if (!pdfMapCache) {
    try {
      pdfMapCache = JSON.parse(readFileSync(join(DATA_DIR, 'pdf-map.json'), 'utf8')) as Record<string, string>;
    } catch {
      pdfMapCache = {};
    }
  }
  return pdfMapCache;
}
export function pdfIdFor(examId: string): string | undefined {
  const id = pdfMap()[examId];
  return typeof id === 'string' && id ? id : undefined;
}

// Per-question page maps for the viewer: examId -> { questionId -> { pages, rect? } }.
// `pages` are 1-based PDF pages; `rect` is an optional [y0,y1] vertical crop (as page-
// height fractions) used when several questions share a page so the viewer can show one
// question per view. Physics is derived by formula (see below); chemistry/math are
// pre-computed (chemistry by OCR of the scanned booklets, math by parsing the text
// layer) and live in exam-pages.json. An exam only opens the PDF viewer when it has pages.
export interface QuestionPlacement {
  pages: number[];
  rect?: [number, number];
}
let examPagesCache: Record<string, Record<string, QuestionPlacement>> | null = null;
function examPagesMap(): Record<string, Record<string, QuestionPlacement>> {
  if (!examPagesCache) {
    try {
      examPagesCache = JSON.parse(readFileSync(join(DATA_DIR, 'exam-pages.json'), 'utf8'));
    } catch {
      examPagesCache = {};
    }
  }
  return examPagesCache!;
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
  patternTags?: string[];
  page?: number;
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
function richToMockQuestion(
  q: RichQuestion,
  lang: Lang,
  subject: Subject,
  pageMap?: Record<string, QuestionPlacement>,
): MockQuestion {
  const loc: 'ja' | 'en' = lang === 'ja' ? 'ja' : 'en';
  // Prefer the short-id block name (physics/chem), else the syllabus topic name.
  const block = q.topicId
    ? BLOCK_NAME[q.topicId]
      ? pick(BLOCK_NAME[q.topicId], lang)
      : labelFor(subject, q.topicId, lang)
    : '';
  const topic = [block, q.subtopic].filter(Boolean).join(' · ');
  let prompt = q[loc]?.prompt ?? q.en.prompt;
  const fig = q.figure?.[loc] ?? q.figure?.en;
  if (fig) prompt += `\n\n*${loc === 'ja' ? '図' : 'Figure'}: ${fig}*`;
  // 1-based PDF page(s) + optional crop for the viewer. EJU physics booklets are
  // standardized — 3 pages of front matter then exactly one sub-question (問) per page —
  // so question N is on page N+3 (verified across every mapped year, text & scanned
  // alike). Chemistry/math come from the pre-computed exam-pages.json: a math 大問 (one
  // question) may span two pages; several short chemistry questions may share a page, in
  // which case `rect` crops the page to just this question so each view is one question.
  const placement: QuestionPlacement | undefined =
    subject === 'physics' && q.answerRow ? { pages: [q.answerRow + 3] } : pageMap?.[q.id];
  const pages = placement?.pages;
  return {
    id: q.id,
    number: q.answerRow,
    topic,
    prompt,
    choices: q[loc]?.choices ?? q.en.choices,
    answerIndex: q.answerIndex,
    answer: q.answer?.[loc] ?? q.answer?.en ?? '',
    explanation: q.explanation?.[loc] ?? q.explanation?.en ?? '',
    page: pages?.[0] ?? q.page,
    pages: pages && pages.length ? pages : undefined,
    rect: placement?.rect,
  };
}

function richToMockExam(ex: RichExam, lang: Lang): MockExam {
  const { questions, ...meta } = ex;
  const pageMap = examPagesMap()[ex.id];
  // One question per view: each rich question becomes one entry. A math 大問 that runs
  // over two pages stays a single question (shown as both pages); chemistry questions
  // that share a page each carry a crop rect so the view shows just that question.
  return { ...meta, questions: questions.map((q) => richToMockQuestion(q, lang, ex.subject, pageMap)) };
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
    .map(({ questions, ...meta }) => ({ ...meta, count: questions.length, pdfId: examPdfId(meta.id, meta.subject) }))
    .sort((a, b) => b.year - a.year || b.session - a.session || a.subject.localeCompare(b.subject));
}

export function mockExam(id: string, lang: Lang = 'en'): MockExam | null {
  const e = allExams(lang).find((ex) => ex.id === id);
  return e ? { ...e, pdfId: examPdfId(id, e.subject) } : null;
}

// An exam exposes the original PDF to the per-question viewer only when we can place
// every question on an exact page: physics by formula (page = N+3), chemistry/math from
// the pre-computed exam-pages.json. Exams without a verified page map (e.g. years whose
// booklet is a scan we haven't OCR-mapped yet) fall back to transcribed question cards,
// which the coach still grades against the real answer — never a wrong page.
function examPdfId(id: string, subject: Subject): string | undefined {
  if (subject === 'physics') return pdfIdFor(id);
  return examPagesMap()[id] ? pdfIdFor(id) : undefined;
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

// The full knowledge base across every subject, for flows where the student has
// NOT picked a subject (Ask Coach) and the coach must infer it. Built once and
// kept byte-identical so it caches as a single stable prompt-cache block.
/** Resolve a subtopic OR topic id to its parent category (topic) id. */
export function categoryOf(subject: Subject, id: string): string | null {
  const kb = getKB(subject);
  if (!kb) return null;
  for (const t of kb.topics) {
    if (t.id === id) return t.id;
    for (const s of t.subtopics ?? []) if (s.id === id) return t.id;
  }
  return null;
}

// ── Past-paper archetypes used to ground generation in real EJU patterns ──
// A real, previously-asked EJU question, distilled to what's useful as a style
// reference for the generator (NOT to be copied — only emulated).
export interface PastExample {
  category: string;
  subtopic?: string;
  patternTags?: string[];
  prompt: string;
  choices?: string[];
  answer: string;
  source: string;
}

// Past-question files tag physics with short category ids; the syllabus taxonomy
// uses long ones. Bridge them so a selected sub-topic can find its real questions.
const RICH_TOPIC_ALIAS: Record<string, string> = {
  mechanics: 'mech',
  thermodynamics: 'thermo',
  waves: 'waves',
  electromagnetism: 'em',
  'atomic-physics': 'atoms',
};

const richLoc = (q: RichQuestion, lang: Lang) => {
  const loc: 'ja' | 'en' = lang === 'ja' ? 'ja' : 'en';
  return {
    prompt: q[loc]?.prompt ?? q.en.prompt,
    choices: q[loc]?.choices ?? q.en.choices,
    answer: q.answer?.[loc] ?? q.answer?.en ?? '',
  };
};

/** Every verified past question for a subject, localized and flattened. */
export function pastExamplePool(subject: Subject, lang: Lang): PastExample[] {
  const out: PastExample[] = [];
  for (const ex of loadRichExams()) {
    if (ex.subject !== subject) continue;
    for (const q of ex.questions) {
      const l = richLoc(q, lang);
      if (!l.prompt?.trim()) continue;
      out.push({
        category: q.topicId ?? '',
        subtopic: q.subtopic,
        patternTags: q.patternTags,
        prompt: l.prompt,
        choices: l.choices,
        answer: l.answer,
        source: ex.id,
      });
    }
  }
  return out;
}

// Searchable terms (id words + sub-topic names + keywords) for a syllabus id.
function termsForId(subject: Subject, id: string): string[] {
  const words = new Set<string>();
  const add = (s?: string) => {
    for (const w of (s ?? '').toLowerCase().split(/[^a-z0-9]+/)) if (w.length > 2) words.add(w);
  };
  add(id);
  const kb = getKB(subject);
  if (kb) {
    for (const t of kb.topics) {
      for (const s of t.subtopics ?? []) {
        if (s.id !== id) continue;
        add(s.name.en);
        for (const k of s.keywords ?? []) add(k);
      }
      if (t.id === id) add(t.name.en);
    }
  }
  return [...words];
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * For each target sub-topic/topic id, pick the most relevant real past question
 * to use as a style reference (matched by category, then by keyword overlap),
 * avoiding reusing the same example twice. Returns null where there's no data
 * (e.g. subjects whose past papers aren't ingested yet).
 */
export function chooseArchetypeExamples(
  subject: Subject,
  targetIds: string[],
  lang: Lang
): (PastExample | null)[] {
  const pool = pastExamplePool(subject, lang);
  if (!pool.length) return targetIds.map(() => null);
  const used = new Set<string>();
  return targetIds.map((id) => {
    const cat = categoryOf(subject, id);
    const richCat = cat ? RICH_TOPIC_ALIAS[cat] ?? cat : null;
    const candidates = shuffle(richCat ? pool.filter((p) => p.category === richCat) : pool);
    if (!candidates.length) return null;
    const terms = termsForId(subject, id);
    let best: PastExample | null = null;
    let bestScore = -Infinity;
    for (const c of candidates) {
      if (used.has(c.prompt)) continue;
      const hay = `${c.subtopic ?? ''} ${(c.patternTags ?? []).join(' ')}`.toLowerCase();
      let score = 0;
      for (const w of terms) if (hay.includes(w)) score++;
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (best) used.add(best.prompt);
    return best;
  });
}

/** N random past questions across the whole subject, as style anchors for a mixed set. */
export function randomArchetypeExamples(subject: Subject, lang: Lang, n: number): PastExample[] {
  return shuffle(pastExamplePool(subject, lang)).slice(0, Math.max(0, n));
}

let allContextCache: string | null = null;
export function systemContextForAll(): string {
  if (allContextCache) return allContextCache;
  const header =
    '# EJU multi-subject knowledge base\n\n' +
    'The student has NOT pre-selected a subject. The knowledge bases for every EJU science and ' +
    'mathematics subject are included below, separated by horizontal rules. Work out which subject ' +
    "and topic the student's question, attached question, or handwritten work belongs to, then ground " +
    "your answer in that subject's syllabus, question archetypes and past-paper patterns. Never ask the " +
    'student to pick a subject. If a question genuinely spans subjects, draw on every part that applies.\n\n';
  const body = SUBJECTS.map((s) => systemContextFor(s)).join('\n\n---\n\n');
  allContextCache = header + body;
  return allContextCache;
}
