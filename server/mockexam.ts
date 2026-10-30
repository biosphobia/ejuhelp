import { generate, type GenQuestion } from './claude';
import { examBlueprint, subtopicName, type Blueprint, type Subject, type Lang } from './eju';

export type MockDifficulty = 'easy' | 'exam' | 'hard';

export interface GeneratedExam {
  id: string;
  subject: Subject;
  course?: 1 | 2;
  difficulty: MockDifficulty;
  title: string;
  minutes: number;
  generatedAt: number;
  /** Per block: name, how many questions and the subtopics they test. */
  blueprint: { id: string; name: string; count: number; topics: string[]; likely: string[] }[];
  /** Past papers the blueprint was read from. */
  basedOn: string[];
  questions: (GenQuestion & { number: number; block: string })[];
  /** Blocks that could not be written (the rest of the exam is still usable). */
  missing: string[];
}

const SUBJECT_NAME: Record<Subject, string> = { physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', math: 'Mathematics' };

/**
 * A full mock exam: the blueprint (real block layout, subtopics sampled from
 * recency-weighted past-paper frequencies) is written block by block in parallel,
 * each block told where it sits in the paper so the whole reads like one exam.
 */
export async function generateMockExam(args: {
  subject: Subject;
  lang: Lang;
  difficulty: MockDifficulty;
  course?: 1 | 2;
  model?: string;
  userKey?: string;
}): Promise<GeneratedExam> {
  const bp: Blueprint = examBlueprint(args.subject, args.lang, { course: args.course });
  const genDifficulty = args.difficulty === 'exam' ? 'exam' : args.difficulty;
  const writeBlock = (b: Blueprint['blocks'][number], i: number) => {
    const firstNo = bp.blocks.slice(0, i).reduce((a, x) => a + x.count, 0) + 1;
    const where =
      args.subject === 'math'
        ? `This is part ${b.name} of a full EJU Mathematics Course ${bp.course} mock exam (${bp.blocks.length} parts, ${bp.minutes} minutes). ${b.brief ?? ''} ` +
          'Write exactly ONE problem for this part, with the length and depth of a real EJU part (8-15 boxes).'
        : `This is block ${b.id} (${b.name}) of a full EJU ${SUBJECT_NAME[args.subject]} mock exam: questions ${firstNo}–${firstNo + b.count - 1} of ${bp.blocks.reduce((a, x) => a + x.count, 0)}. ` +
          `Write exactly ${b.count} question(s), one for each listed topic in order, each self-contained like a real EJU item.`;
    const topics = [...new Set(b.picked)];
    return generate({
      subject: args.subject,
      lang: args.lang,
      topic: topics.length === 1 ? topics[0] : undefined,
      topics: topics.length > 1 ? topics : undefined,
      difficulty: genDifficulty,
      count: b.count,
      context: where,
      model: args.model,
      userKey: args.userKey,
    });
  };
  // Every block in parallel; a block that fails is tried once more on its own.
  let results = await Promise.allSettled(bp.blocks.map(writeBlock));
  const retry = results.map((r, i) => (r.status === 'rejected' || !r.value.questions.length ? i : -1)).filter((i) => i >= 0);
  if (retry.length) {
    const again = await Promise.allSettled(retry.map((i) => writeBlock(bp.blocks[i], i)));
    results = results.map((r, i) => (retry.includes(i) ? again[retry.indexOf(i)] : r));
  }
  if (results.every((r) => r.status === 'rejected')) throw (results[0] as PromiseRejectedResult).reason;

  const questions: GeneratedExam['questions'] = [];
  const missing: string[] = [];
  results.forEach((r, i) => {
    const b = bp.blocks[i];
    const qs = r.status === 'fulfilled' ? r.value.questions.slice(0, b.count) : [];
    if (qs.length < b.count) missing.push(`${b.name} (${b.count - qs.length})`);
    for (const q of qs) questions.push({ ...q, id: `${q.id}-${b.id}`, block: b.name, number: questions.length + 1 });
  });
  const stamp = Date.now();
  const course = args.subject === 'math' ? bp.course : undefined;
  return {
    id: `gen-${args.subject}-${stamp.toString(36)}`,
    subject: args.subject,
    ...(course ? { course } : {}),
    difficulty: args.difficulty,
    title: `${SUBJECT_NAME[args.subject]}${course ? ` (Course ${course})` : ''}`,
    minutes: bp.minutes,
    generatedAt: stamp,
    blueprint: bp.blocks.map((b) => ({
      id: b.id,
      name: b.name,
      count: b.count,
      topics: b.picked.map((id) => subtopicName(args.subject, id, args.lang)),
      likely: b.likely.slice(0, 4).map((l) => l.name),
    })),
    basedOn: bp.papers,
    questions,
    missing,
  };
}
