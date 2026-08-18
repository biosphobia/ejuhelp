import type { Subject } from './ui';
import type { SubjectTree } from './studymap';

// The study calendar is computed entirely on the client (no API) from the exam date and
// the topic taxonomy. The model is only used later, when the student actually runs a
// day's drill/quiz (question generation). The schedule is a progressive,
// spaced-repetition rhythm: learn every topic, revisit it on a spacing schedule, then
// drill everything, then sprint with mixed mock sets — so every topic is covered many
// times and understood, not crammed.

export type TaskKind = 'learn' | 'review' | 'drill' | 'quiz' | 'mock';
export type Phase = 'learn' | 'drill' | 'sprint';
export interface CalTask {
  id: string;
  kind: TaskKind;
  subject: Subject;
  nodeId?: string; // node-specific (learn / review / drill)
  label: string;
  topicIds?: string[]; // mixed quiz/mock: subtopic ids to draw questions from
}
export interface DayPlan {
  index: number;
  date: Date;
  phase: Phase;
  tasks: CalTask[];
  daysToExam: number;
}

interface Unit {
  subject: Subject;
  id: string;
  label: string;
}
const MS = 86400000;

export const startOfDay = (d: Date = new Date()): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const parseDate = (s: string): Date => startOfDay(new Date(s + 'T00:00:00'));
export const addDays = (d: Date, n: number): Date => new Date(startOfDay(d).getTime() + n * MS);
export const daysBetween = (a: Date, b: Date): number => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS);

const fmtDate = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** The EJU exam date is fixed (Nov 8). Use the next upcoming one so the plan always runs
 *  through the exam without the student setting anything. */
export function ejuExamDate(): string {
  const now = startOfDay();
  const y = now.getFullYear();
  const thisYear = startOfDay(new Date(y, 10, 8)); // month 10 = November
  const target = now.getTime() <= thisYear.getTime() ? thisYear : startOfDay(new Date(y + 1, 10, 8));
  return fmtDate(target);
}

/** The plan's FIXED first day. Once stored it never moves, so the schedule actually
 *  advances day by day (before this, day 0 was always "today": the plan silently
 *  re-based itself every morning, repeated the first topics forever, and could never
 *  finish the syllabus). Falls back to today for a fresh install. */
export function effectivePlanStart(stored: string | null | undefined, examDate: string): string {
  if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) {
    // A start after the exam would produce a negative-length plan — reset to today.
    if (parseDate(stored).getTime() <= parseDate(examDate).getTime()) return stored;
  }
  return fmtDate(startOfDay());
}

export const todayStr = (): string => fmtDate(startOfDay());

/** Inclusive number of days from the plan start through the exam day (>= 1). */
export function totalDays(examDate: string, planStart: string): number {
  return Math.max(1, daysBetween(parseDate(planStart), parseDate(examDate)) + 1);
}

/** Today's index within the plan, clamped into [0, D-1]. */
export function todayIndex(examDate: string, planStart: string): number {
  const D = totalDays(examDate, planStart);
  return Math.min(Math.max(0, daysBetween(parseDate(planStart), startOfDay())), D - 1);
}

/** Every subtopic across the chosen subjects, interleaved round-robin so each subject is
 *  touched from day one. */
function buildUnits(subjects: Subject[], trees: Partial<Record<Subject, SubjectTree>>): Unit[] {
  const per: Partial<Record<Subject, Unit[]>> = {};
  for (const s of subjects) per[s] = (trees[s] ?? []).flatMap((t) => t.subs.map((sub) => ({ subject: s, id: sub.id, label: sub.label })));
  const out: Unit[] = [];
  for (let i = 0, more = true; more; i++) {
    more = false;
    for (const s of subjects) {
      const u = per[s]?.[i];
      if (u) {
        out.push(u);
        more = true;
      }
    }
  }
  return out;
}

// Spaced-repetition revisit days after first learning a topic — expanding intervals so a
// topic learned early is refreshed again weeks later (long-term retention).
const REVIEW_OFFSETS = [2, 6, 14, 30];

export function phaseSplit(D: number): { learnDays: number; drillDays: number } {
  const learnDays = Math.max(1, Math.round(D * 0.6));
  const drillDays = Math.min(Math.max(0, Math.round(D * 0.25)), Math.max(0, D - learnDays));
  return { learnDays, drillDays };
}

export function phaseOf(index: number, D: number): Phase {
  const { learnDays, drillDays } = phaseSplit(D);
  return index < learnDays ? 'learn' : index < learnDays + drillDays ? 'drill' : 'sprint';
}

/** Build one day's plan deterministically, anchored to the FIXED plan start date. */
export function buildDay(
  index: number,
  examDate: string,
  planStart: string,
  subjects: Subject[],
  trees: Partial<Record<Subject, SubjectTree>>,
  weakIds: Set<string>
): DayPlan {
  const D = totalDays(examDate, planStart);
  const date = addDays(parseDate(planStart), index);
  const units = buildUnits(subjects, trees);
  const U = Math.max(1, units.length);
  const { learnDays, drillDays } = phaseSplit(D);
  const phase = phaseOf(index, D);
  const newPerDay = Math.max(1, Math.ceil(U / learnDays));
  const introDay = (k: number) => Math.floor(k / newPerDay);
  const tasks: CalTask[] = [];
  // Task ids embed the plan anchor, so completed-marks stay valid day after day and a
  // deliberate "restart plan" cleanly invalidates the old ones.
  const tid = (kind: TaskKind, subj: Subject, key: string) => `${planStart}|${examDate}|${index}|${kind}|${subj}|${key}`;

  if (units.length && phase === 'learn') {
    for (let k = index * newPerDay; k < Math.min(units.length, (index + 1) * newPerDay); k++) {
      const u = units[k];
      tasks.push({ id: tid('learn', u.subject, u.id), kind: 'learn', subject: u.subject, nodeId: u.id, label: u.label });
    }
    for (let k = 0; k < units.length; k++) {
      const d = introDay(k);
      if (d < index && REVIEW_OFFSETS.includes(index - d)) {
        const u = units[k];
        tasks.push({ id: tid('review', u.subject, u.id), kind: 'review', subject: u.subject, nodeId: u.id, label: u.label });
      }
    }
    // Weekly consolidation: a cumulative mixed quiz per subject over everything learned so
    // far — active recall across topics, which builds the transfer to new question types.
    if (index > 0 && index % 7 === 6) {
      for (const s of subjects) {
        const learned: string[] = [];
        for (let k = 0; k < units.length; k++) if (units[k].subject === s && introDay(k) <= index) learned.push(units[k].id);
        if (learned.length >= 2) tasks.push({ id: tid('quiz', s, 'cum'), kind: 'quiz', subject: s, label: s, topicIds: learned.slice(-10) });
      }
    }
  } else if (units.length && phase === 'drill') {
    const j = index - learnDays;
    const drillPerDay = Math.max(1, Math.ceil(U / Math.max(1, drillDays)));
    for (let n = 0; n < drillPerDay; n++) {
      const u = units[(j * drillPerDay + n) % U];
      tasks.push({ id: tid('drill', u.subject, u.id), kind: 'drill', subject: u.subject, nodeId: u.id, label: u.label });
    }
    for (const s of subjects) {
      const w = units.filter((u) => u.subject === s && weakIds.has(`${s}:${u.id}`)).map((u) => u.id).slice(0, 8);
      tasks.push({ id: tid('quiz', s, 'mix'), kind: 'quiz', subject: s, label: s, topicIds: w });
    }
  } else if (units.length) {
    // sprint: mixed full sets + weak-point cleanup
    for (const s of subjects) tasks.push({ id: tid('mock', s, 'mock'), kind: 'mock', subject: s, label: s });
    for (const s of subjects) {
      const weak = units.filter((u) => u.subject === s && weakIds.has(`${s}:${u.id}`)).slice(0, 2);
      for (const u of weak) tasks.push({ id: tid('drill', u.subject, u.id), kind: 'drill', subject: u.subject, nodeId: u.id, label: u.label });
    }
  }
  return { index, date, phase, tasks, daysToExam: daysBetween(date, parseDate(examDate)) };
}
