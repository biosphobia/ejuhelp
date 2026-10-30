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
  /** Best-matching knowledge-base subtopic id (links the question to its study note). */
  topicId?: string;
  prompt: string;
  choices?: string[];
  answerIndex: number;
  answer: string;
  explanation: string;
  /** Math: each box and its digits (the prompt marks boxes as [A], [BC], …). */
  blanks?: { label: string; answer: string }[];
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
  blanks?: { label: string; answer: string }[];
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
function richToMockQuestion(q: RichQuestion, lang: Lang, subject: Subject): MockQuestion {
  const loc: 'ja' | 'en' = lang === 'ja' ? 'ja' : 'en';
  const kbTopic = q.topicId ? getKB(subject)?.topics?.find((t) => t.id === q.topicId)?.name : undefined;
  const block = q.topicId ? pick(BLOCK_NAME[q.topicId] ?? kbTopic ?? { en: q.topicId, ja: q.topicId }, lang) : '';
  const topic = [block, q.subtopic].filter(Boolean).join(' · ');
  let prompt = q[loc]?.prompt ?? q.en.prompt;
  const fig = q.figure?.[loc] ?? q.figure?.en;
  if (fig) prompt += `\n\n*${loc === 'ja' ? '図' : 'Figure'}: ${fig}*`;
  return {
    id: q.id,
    number: q.answerRow,
    topic,
    topicId: subtopicForRich(subject, q),
    prompt,
    choices: q[loc]?.choices ?? q.en.choices,
    answerIndex: q.answerIndex,
    answer: q.answer?.[loc] ?? q.answer?.en ?? '',
    explanation: q.explanation?.[loc] ?? q.explanation?.en ?? '',
    ...(Array.isArray(q.blanks) && q.blanks.length ? { blanks: q.blanks } : {}),
  };
}

function richToMockExam(ex: RichExam, lang: Lang): MockExam {
  const { questions, ...meta } = ex;
  return { ...meta, questions: questions.map((q) => richToMockQuestion(q, lang, ex.subject)) };
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

// ─────────────────────────── Exemplars for question generation ───────────────────────────
// Physics rich files tag questions with a short block id; map it to taxonomy topic ids.
const BLOCK_TO_TOPIC: Record<string, string> = {
  mech: 'mechanics',
  thermo: 'thermodynamics',
  waves: 'waves',
  em: 'electromagnetism',
  atoms: 'atomic-physics',
};

export interface Exemplar {
  source: string;
  prompt: string;
  choices?: string[];
  answer: string;
}

/**
 * Real past-paper questions that best match a subtopic (by keyword overlap with the
 * question's subtopic text and pattern tags, then by topic block). Used as style
 * exemplars so generated questions look and feel like the EJU.
 */
// Extra search terms for subtopics whose knowledge-base keywords rarely appear in
// question text (the KB lists law names; questions say "ideal gas", "orbit", …).
const EXTRA_KEYWORDS: Record<string, string[]> = {
  'ideal-gas': ['ideal gas', 'state equation', 'boyle', 'charles', 'pv=nrt', '理想気体', 'ボイル', 'シャルル'],
  'potential-energy': ['potential energy', 'mechanical energy', 'energy conservation', 'conservation of energy', 'spring', 'elastic', '位置エネルギー', '力学的エネルギー', 'エネルギー保存', 'ばね'],
  shm: ['simple harmonic', 'harmonic', 'oscillat', 'pendulum', 'period of', '単振動', '振り子', '周期'],
  doppler: ['doppler', 'ドップラー'],
  sound: ['resonance', 'air column', 'pipe', 'string', 'beat', 'overtone', '共鳴', '気柱', '弦', 'うなり'],
  light: ['refraction', 'reflection', 'lens', 'mirror', 'snell', 'total internal', 'critical angle', '屈折', 'レンズ', '全反射'],
  'circular-motion': ['circular', 'centripetal', 'conical', 'angular velocity', '円運動', '向心'],
  'friction-resistance': ['friction', 'coefficient', 'air resistance', 'terminal', '摩擦', '空気抵抗', '終端'],
  'inertial-force': ['inertial', 'centrifugal', 'elevator', 'accelerating', 'non-inertial', '慣性力', '遠心力', 'エレベーター'],
  'light-interference': ['interference', 'young', 'grating', 'thin film', 'wedge', 'path difference', '干渉', '回折', '薄膜'],
  'ac-circuits': ['alternating', 'inductor', 'coil', 'impedance', 'reactance', 'rms', 'effective', '交流', 'コイル', '実効値'],
  semiconductors: ['semiconductor', 'diode', 'p-type', 'n-type', '半導体', 'ダイオード'],
  'em-induction': ['induced', 'induction', 'emf', 'flux', 'faraday', 'lenz', 'sliding rod', '誘導', '磁束', 'レンツ'],
  'elementary-particles': ['quark', 'lepton', 'neutrino', 'elementary particle', 'クォーク', '素粒子'],
  'atoms-nuclei': ['nucleus', 'nuclear', 'half-life', 'decay', 'alpha', 'beta', 'isotope', 'mass defect', '原子核', '半減期', '崩壊'],
  'electrons-light': ['photoelectric', 'photon', 'de broglie', 'x-ray', 'work function', 'bohr', '光電', '光子', '物質波', 'ボーア'],
  'newtons-laws': ['equation of motion', 'pulley', 'tension', 'two blocks', 'acceleration of the', '運動方程式', '滑車'],
  gravitation: ['gravitation', 'orbit', 'satellite', 'kepler', 'planet', '万有引力', '衛星', '惑星'],
  'conductors-dielectrics': ['dielectric', 'conductor', 'electrostatic induction', 'polarization', '誘電体', '静電誘導'],
  'magnetic-force': ['lorentz', 'moving charge', 'magnetic force', 'current-carrying', 'cyclotron', 'ローレンツ', '電流が受ける'],
  'solid-structure': ['crystal', 'unit cell', 'lattice', 'coordination', '結晶', '単位格子', '面心', '体心'],
  stoichiometry: ['reaction equation', 'yield', 'excess', 'limiting', 'mass of', 'volume of gas', '化学反応式', '過不足'],
  biomolecules: ['amino acid', 'protein', 'glucose', 'sugar', 'peptide', 'starch', 'アミノ酸', 'タンパク質', 'グルコース', 'デンプン'],
  thermochemistry: ['enthalpy', 'heat of', 'hess', 'bond energy', 'calorimeter', '反応熱', 'ヘス', '結合エネルギー'],
};

interface ScoredRich {
  score: number;
  /** Number of keyword hits (0 = matched only by topic block). */
  hits: number;
  q: RichQuestion;
  ex: RichExam;
}

/** Rank every rich past-paper question by how well it matches a subtopic. */
function scoreRich(subject: Subject, subtopicId: string | undefined): { scored: ScoredRich[]; kws: string[]; topicId?: string } {
  const kb = getKB(subject);
  if (!kb) return { scored: [], kws: [] };
  let topicId: string | undefined;
  let keywords: string[] = [];
  for (const t of kb.topics) {
    if (t.id === subtopicId) {
      topicId = t.id;
      keywords = (t.subtopics ?? []).flatMap((s) => [s.name.en, ...(s.keywords ?? [])]);
    }
    for (const s of t.subtopics ?? []) {
      if (s.id === subtopicId) {
        topicId = t.id;
        keywords = [s.name.en, ...(s.keywords ?? [])];
      }
    }
  }
  const kws = [...keywords, ...(subtopicId ? EXTRA_KEYWORDS[subtopicId] ?? [] : [])]
    .map((k) => k.toLowerCase())
    .filter((k) => k.length > 2);
  if (!kws.length && !topicId) return { scored: [], kws };
  const scored: ScoredRich[] = [];
  const nameKw = kws[0]; // the subtopic's own English name comes first
  for (const ex of loadRichExams()) {
    if (ex.subject !== subject) continue;
    for (const q of ex.questions) {
      const hay = `${q.subtopic ?? ''} ${(q as any).patternTags?.join(' ') ?? ''}`.toLowerCase();
      const body = `${q.en?.prompt ?? ''} ${q.ja?.prompt ?? ''}`.toLowerCase();
      let hits = 0;
      let score = 0;
      for (const k of kws) {
        if (hay.includes(k)) {
          hits++;
          score += k === nameKw ? 6 : 3;
        } else if (body.includes(k)) {
          hits++;
          score += 1;
        }
      }
      const qTopic = q.topicId ? BLOCK_TO_TOPIC[q.topicId] ?? q.topicId : undefined;
      if (topicId && qTopic === topicId) score += 1;
      if (!q.hasFigure) score += 0.5; // text-only questions are easier to imitate
      if (score > 0) scored.push({ score, hits, q, ex });
    }
  }
  // Recent papers count for more: they show the exam as it is set now.
  for (const s of scored) s.score *= recencyWeight(s.ex.year);
  scored.sort((a, b) => b.score - a.score || b.ex.year - a.ex.year);
  return { scored, kws, topicId };
}

/** Weight of a past paper by its year: 2010 counts 1.0, rising to 2.0 for the newest papers. */
export function recencyWeight(year: number): number {
  return 1 + Math.max(0, Math.min(1, (year - 2010) / 15));
}

/** Keyword lists per subtopic id, built once per subject. */
const kwCache = new Map<Subject, { id: string; topicId: string; kws: string[] }[]>();
function subtopicKeywords(subject: Subject) {
  let out = kwCache.get(subject);
  if (out) return out;
  out = [];
  const kb = getKB(subject);
  for (const t of kb?.topics ?? []) {
    for (const st of t.subtopics ?? []) {
      const kws = [st.name.en, ...(st.keywords ?? []), ...(EXTRA_KEYWORDS[st.id] ?? [])]
        .map((k) => k.toLowerCase())
        .filter((k) => k.length > 2);
      out.push({ id: st.id, topicId: t.id, kws });
    }
  }
  kwCache.set(subject, out);
  return out;
}

const subtopicCache = new Map<string, string | undefined>();
/** The knowledge-base subtopic that best describes one rich question (or undefined). */
function subtopicForRich(subject: Subject, q: RichQuestion): string | undefined {
  const key = `${subject}:${q.id}`;
  if (subtopicCache.has(key)) return subtopicCache.get(key);
  const hay = `${q.subtopic ?? ''} ${(q as any).patternTags?.join(' ') ?? ''}`.toLowerCase();
  const body = `${q.en?.prompt ?? ''} ${q.ja?.prompt ?? ''}`.toLowerCase();
  const qTopic = q.topicId ? BLOCK_TO_TOPIC[q.topicId] ?? q.topicId : undefined;
  let best: string | undefined;
  let bestScore = 0;
  for (const st of subtopicKeywords(subject)) {
    let score = 0;
    for (const k of st.kws) {
      if (hay.includes(k)) score += k === st.kws[0] ? 6 : 3;
      else if (body.includes(k)) score += 1;
    }
    if (score > 0 && qTopic && st.topicId === qTopic) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = st.id;
    }
  }
  subtopicCache.set(key, best);
  return best;
}

export interface PastQuestion extends MockQuestion {
  topicId?: string;
  source: string;
}

/**
 * Real past EJU questions on one subtopic, newest first among the best matches,
 * in the same shape the practice panel renders. Only keyword matches count —
 * a question merely from the same block is not "on this topic".
 */
export function pastQuestionsFor(subject: Subject, subtopicId: string, lang: Lang, limit = 10): PastQuestion[] {
  const { scored } = scoreRich(subject, subtopicId);
  return scored
    .filter((s) => s.hits > 0)
    .slice(0, Math.max(1, Math.min(30, limit)))
    .map(({ q, ex }) => ({
      ...richToMockQuestion(q, lang, subject),
      topicId: subtopicId,
      source: `EJU ${ex.year}-${ex.session}`,
    }));
}

/**
 * Real past-paper questions that best match a subtopic (by keyword overlap with the
 * question's subtopic text and pattern tags, then by topic block). Used as style
 * exemplars so generated questions look and feel like the EJU.
 */
export function exemplarsFor(subject: Subject, subtopicId: string | undefined, lang: Lang, n = 3): Exemplar[] {
  const { scored, kws } = scoreRich(subject, subtopicId);
  const loc: 'ja' | 'en' = lang === 'ja' ? 'ja' : 'en';
  return scored.slice(0, n).map(({ q, ex }) => {
    let prompt = q[loc]?.prompt ?? q.en.prompt;
    const fig = q.figure?.[loc] ?? q.figure?.en;
    if (fig) prompt += `\n[${loc === 'ja' ? '図' : 'Figure'}: ${fig}]`;
    return {
      source: `EJU ${ex.year} session ${ex.session}`,
      prompt,
      choices: q[loc]?.choices ?? q.en.choices,
      answer: q.answer?.[loc] ?? q.answer?.en ?? '',
    };
  });
}

// ─────────────────────────── Mock-exam blueprint ───────────────────────────
// What a full mock exam should contain, read off the past papers: the paper's real
// block structure, and per block which subtopics come up, weighted by how often they
// appeared (recent papers count more) with a boost for topics that are regular but
// were left out of the two latest papers (the EJU rotates topics). Each generated
// exam samples its subtopics from these weights, so no two are the same.

export interface BlueprintTopic {
  id: string;
  name: string;
  /** Recency-weighted number of past-paper questions on it. */
  weight: number;
  /** Year it last appeared (0 = not in the papers we have). */
  lastSeen: number;
}
export interface BlueprintBlock {
  id: string;
  name: string;
  count: number;
  /** Subtopics picked for this exam (one per question; a subtopic may repeat). */
  picked: string[];
  /** The most likely subtopics for this block, most likely first. */
  likely: BlueprintTopic[];
  /** Extra instruction for the writer (math parts). */
  brief?: string;
}
export interface Blueprint {
  subject: Subject;
  course?: 1 | 2;
  minutes: number;
  blocks: BlueprintBlock[];
  /** Past papers the blueprint was built from. */
  papers: string[];
}

function subtopicName(subject: Subject, id: string, lang: Lang): string {
  for (const t of getKB(subject)?.topics ?? []) for (const st of t.subtopics ?? []) if (st.id === id) return pick(st.name, lang);
  return id;
}
function topicOfSubtopic(subject: Subject, id: string): string | undefined {
  for (const t of getKB(subject)?.topics ?? []) if ((t.subtopics ?? []).some((st) => st.id === id)) return t.id;
  return undefined;
}

/** Recency-weighted subtopic statistics over every past paper of a subject. */
function subtopicStats(subject: Subject, inTopic?: (topicId: string | undefined) => boolean) {
  const exams = loadRichExams().filter((e) => e.subject === subject);
  const years = [...new Set(exams.map((e) => e.year * 10 + e.session))].sort((a, b) => b - a);
  const recent = new Set(years.slice(0, 2));
  const stats = new Map<string, { weight: number; lastSeen: number; recent: boolean }>();
  for (const ex of exams) {
    for (const q of ex.questions) {
      const st = subtopicForRich(subject, q);
      if (!st) continue;
      if (inTopic && !inTopic(topicOfSubtopic(subject, st))) continue;
      const cur = stats.get(st) ?? { weight: 0, lastSeen: 0, recent: false };
      cur.weight += recencyWeight(ex.year);
      cur.lastSeen = Math.max(cur.lastSeen, ex.year);
      if (recent.has(ex.year * 10 + ex.session)) cur.recent = true;
      stats.set(st, cur);
    }
  }
  return stats;
}

/** Weighted sampling of `n` subtopics: distinct while possible, then repeats by weight. */
function sampleTopics(likely: BlueprintTopic[], n: number, rnd: () => number): string[] {
  const out: string[] = [];
  // Sharpened weights: frequent topics clearly lead (it is a prediction), rarer ones still turn up.
  const w = (t: BlueprintTopic) => Math.pow(t.weight, 1.6);
  let pool = likely.filter((t) => t.weight > 0);
  while (out.length < n && pool.length) {
    const total = pool.reduce((a, t) => a + w(t), 0);
    let r = rnd() * total;
    let i = 0;
    for (; i < pool.length - 1; i++) {
      r -= w(pool[i]);
      if (r <= 0) break;
    }
    out.push(pool[i].id);
    pool = pool.filter((_, j) => j !== i);
    if (!pool.length && out.length < n) pool = likely.filter((t) => t.weight > 0);
  }
  return out;
}

function likelyFor(subject: Subject, lang: Lang, topicIds: string[]): BlueprintTopic[] {
  const want = new Set(topicIds);
  const stats = subtopicStats(subject, (t) => t !== undefined && want.has(t));
  const out: BlueprintTopic[] = [];
  for (const t of getKB(subject)?.topics ?? []) {
    if (!want.has(t.id)) continue;
    for (const st of t.subtopics ?? []) {
      const s = stats.get(st.id);
      // Regular topics missing from the two latest papers are "due".
      const w = s ? s.weight * (s.recent ? 1 : 1.35) : 0.4; // syllabus topics never seen keep a small chance
      out.push({ id: st.id, name: pick(st.name, lang), weight: Math.round(w * 100) / 100, lastSeen: s?.lastSeen ?? 0 });
    }
  }
  return out.sort((a, b) => b.weight - a.weight);
}

// EJU Mathematics part layout (Course 1 / Course 2) and the topics each part draws on,
// from the official syllabus and the papers: I and II are two 問 each, III and IV one long problem.
const MATH_PARTS: Record<1 | 2, { id: string; name: string; topics: string[]; brief: string; prefer?: string[] }[]> = {
  1: [
    { id: 'I-1', name: 'I 問1', topics: ['quadratic-functions'], brief: 'Quadratic function: vertex, max/min on an interval, conditions on coefficients.' },
    { id: 'I-2', name: 'I 問2', topics: ['counting-probability', 'numbers-expressions'], brief: 'Probability or counting with dice/cards/balls, or sets and propositions.' },
    { id: 'II-1', name: 'II 問1', topics: ['numbers-expressions', 'quadratic-functions'], brief: 'Equations/inequalities with absolute values or parameters, or a quadratic inequality.' },
    { id: 'II-2', name: 'II 問2', topics: ['counting-probability', 'numbers-expressions'], brief: 'Data analysis or probability, or real numbers and expressions.' },
    { id: 'III', name: 'III', topics: ['integers'], brief: 'Integers: divisors, gcd/lcm, remainders, integer solutions of an equation.' },
    { id: 'IV', name: 'IV', topics: ['geometry-trig'], brief: 'Plane figures with trigonometry: sine/cosine rules, areas, circles.' },
  ],
  2: [
    { id: 'I-1', name: 'I 問1', topics: ['quadratic-functions', 'numbers-expressions'], brief: 'Quadratic function with a parameter: case analysis of max/min on an interval.' },
    { id: 'I-2', name: 'I 問2', topics: ['counting-probability'], brief: 'Probability or counting (cards, dice, balls, paths), often several sub-steps.' },
    { id: 'II-1', name: 'II 問1', topics: ['sequences', 'vectors', 'exp-log'], brief: 'Sequences (recurrences, sums) or vectors, guided step by step.' },
    { id: 'II-2', name: 'II 問2', topics: ['expressions-proofs', 'coordinate-geometry', 'trig-functions', 'exp-log'], brief: 'Complex numbers, figures and equations, trigonometric or exponential/log equations.' },
    { id: 'III', name: 'III', topics: ['calculus', 'trig-functions', 'exp-log'], brief: 'Calculus: derivatives of a composite function, extreme values, tangents.', prefer: ['differentiation'] },
    { id: 'IV', name: 'IV', topics: ['calculus'], brief: 'Integration: areas, volumes, definite integrals, often with substitution.', prefer: ['integration'] },
  ],
};

/** A fresh blueprint for one mock exam (random within the weights; pass `seed` to reproduce). */
export function examBlueprint(subject: Subject, lang: Lang, opts: { course?: 1 | 2; seed?: number } = {}): Blueprint {
  let seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
  const exams = loadRichExams().filter((e) => e.subject === subject).sort((a, b) => b.year - a.year || b.session - a.session);
  const papers = exams.map((e) => `${e.year}-${e.session}`);
  if (subject === 'physics') {
    // Block layout of the newest paper (I Mechanics … V Atoms).
    const latest = exams[0] as unknown as { structure?: { blocks?: { id: string; topicId: string; name: LocalizedName; questionCount: number }[] } };
    const blocks = latest?.structure?.blocks ?? [
      { id: 'I', topicId: 'mech', name: { en: 'Mechanics', ja: '力学' }, questionCount: 6 },
      { id: 'II', topicId: 'thermo', name: { en: 'Thermodynamics', ja: '熱力学' }, questionCount: 3 },
      { id: 'III', topicId: 'waves', name: { en: 'Waves', ja: '波動' }, questionCount: 3 },
      { id: 'IV', topicId: 'em', name: { en: 'Electricity & Magnetism', ja: '電気と磁気' }, questionCount: 6 },
      { id: 'V', topicId: 'atoms', name: { en: 'Atoms', ja: '原子' }, questionCount: 1 },
    ];
    return {
      subject,
      minutes: 40,
      papers,
      blocks: blocks.map((b) => {
        const likely = likelyFor(subject, lang, [BLOCK_TO_TOPIC[b.topicId] ?? b.topicId]);
        return { id: b.id, name: pick(b.name, lang), count: b.questionCount, picked: sampleTopics(likely, b.questionCount, rnd), likely: likely.slice(0, 6) };
      }),
    };
  }
  if (subject === 'chemistry') {
    // 20 items; how many per category, averaged over the papers with recent ones counting more.
    const cats = (getKB(subject)?.topics ?? []).map((t) => t.id);
    const share = new Map<string, number>();
    let wsum = 0;
    for (const ex of exams) {
      const w = recencyWeight(ex.year);
      wsum += w;
      for (const q of ex.questions) if (q.topicId) share.set(q.topicId, (share.get(q.topicId) ?? 0) + w);
    }
    const raw = cats.map((c) => ({ c, n: wsum ? (share.get(c) ?? 0) / wsum : 5 }));
    const counts = raw.map((r) => Math.max(1, Math.floor(r.n)));
    // distribute the rest to the largest remainders until there are 20
    const order = raw.map((r, i) => ({ i, rem: r.n - Math.floor(r.n) })).sort((a, b) => b.rem - a.rem);
    for (let k = 0; counts.reduce((a, b) => a + b, 0) < 20; k++) counts[order[k % order.length].i]++;
    while (counts.reduce((a, b) => a + b, 0) > 20) counts[counts.indexOf(Math.max(...counts))]--;
    return {
      subject,
      minutes: 40,
      papers,
      blocks: cats.map((c, i) => {
        const likely = likelyFor(subject, lang, [c]);
        const t = getKB(subject)!.topics.find((x) => x.id === c)!;
        return { id: c, name: pick(t.name, lang), count: counts[i], picked: sampleTopics(likely, counts[i], rnd), likely: likely.slice(0, 6) };
      }),
    };
  }
  // Mathematics: one long blank-format problem per part.
  const course = opts.course ?? 2;
  const used = new Set<string>();
  return {
    subject,
    course,
    minutes: 80,
    papers: exams.map((e) => `${e.year}-${e.session}${(e as unknown as { course?: number }).course ? ` C${(e as unknown as { course?: number }).course}` : ''}`),
    blocks: MATH_PARTS[course].map((part) => {
      const likely = (getKB('math')?.topics ?? [])
        .filter((t) => part.topics.includes(t.id))
        .flatMap((t) => (t.subtopics ?? []).map((st) => ({ id: st.id, name: pick(st.name, lang), weight: part.topics.indexOf(t.id) === 0 ? 2 : 1, lastSeen: 0 })));
      // subtopics the math papers we have already used for this part count a little more
      const seen = subtopicStats('math');
      for (const l of likely) {
        const s = seen.get(l.id);
        if (s) {
          l.weight += s.weight * 0.5;
          l.lastSeen = s.lastSeen;
        }
      }
      for (const l of likely) if (part.prefer?.includes(l.id)) l.weight *= 3;
      likely.sort((a, b) => b.weight - a.weight);
      // no two parts on the same subtopic while there is a choice
      const fresh = likely.filter((l) => !used.has(l.id));
      const picked = sampleTopics(fresh.length ? fresh : likely, 1, rnd);
      picked.forEach((id) => used.add(id));
      return { id: part.id, name: part.name, count: 1, picked, likely: likely.slice(0, 6), brief: part.brief };
    }),
  };
}

export { subtopicName };

/** Short facts about how the newest papers of a subject are set (from their `patterns`), for question writers. */
export function examPatternsFor(subject: Subject): string {
  const ex = loadRichExams()
    .filter((e) => e.subject === subject)
    .sort((a, b) => b.year - a.year || b.session - a.session)[0] as unknown as
    | { year: number; patterns?: { blockSkeleton?: string; answerFormat?: string; notes?: string; archetypes?: { tag: string; desc: string; examples?: string[] }[] } }
    | undefined;
  const p = ex?.patterns;
  if (!p) return '';
  const arche = (p.archetypes ?? [])
    .slice()
    .sort((a, b) => (b.examples?.length ?? 0) - (a.examples?.length ?? 0))
    .slice(0, 6)
    .map((a) => `${a.tag} (${a.desc})`)
    .join('; ');
  return [
    `How the EJU ${subject} paper is set (newest paper we have, ${ex!.year}):`,
    p.blockSkeleton,
    p.answerFormat,
    p.notes,
    arche ? `Most common question types: ${arche}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 1400);
}
