import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, 'data', 'eju');

export type Subject = 'physics' | 'chemistry' | 'biology' | 'math';
export const SUBJECTS: Subject[] = ['physics', 'chemistry', 'biology', 'math'];

interface LocalizedName {
  en: string;
  ja: string;
}
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

export function topicsFor(subject: Subject, lang: 'en' | 'ja') {
  const kb = getKB(subject);
  if (!kb) return [];
  return kb.topics.map((t) => ({ id: t.id, name: t.name[lang] || t.name.en }));
}

export function topicName(subject: Subject, topicId: string, lang: 'en' | 'ja'): string {
  const t = getKB(subject)?.topics.find((x) => x.id === topicId);
  return t ? t.name[lang] || t.name.en : topicId;
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
