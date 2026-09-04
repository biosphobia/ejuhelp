import type { Subject } from './ui';
import { TREES } from '../data/notes';
import { INTERVALS_DAYS, keyOf, startOfDay, type ReviewMap } from './review';

const DAY = 86_400_000;

export type PlanKind = 'new' | 'review' | 'revision';
export interface PlanItem {
  kind: PlanKind;
  subject: Subject;
  id: string;
}
/** startOfDay(ms) -> what to do that day. */
export type Plan = Map<number, PlanItem[]>;

export function parseDate(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

/**
 * A complete study plan from today to the exam:
 * - every not-yet-studied subtopic of the chosen subjects is spread evenly over
 *   the study days, alternating subjects so each day mixes them;
 * - each planned topic gets spaced reviews (1, 3, 7, 14, 30 days later);
 * - topics already studied keep the review dates from the review store;
 * - the last week (when there is time) is kept for revision and past papers.
 * The plan is recomputed from the current state every time, so it adapts as the
 * student marks topics reviewed or changes the exam date.
 */
export function buildPlan(opts: { subjects: Subject[]; reviews: ReviewMap; examDate: string; now?: number }): Plan {
  const plan: Plan = new Map();
  const today = startOfDay(opts.now ?? Date.now());
  const exam = parseDate(opts.examDate);
  const push = (date: number, item: PlanItem) => {
    if (date < today || date >= exam) return;
    const list = plan.get(date) ?? [];
    if (list.some((x) => x.kind === item.kind && x.subject === item.subject && x.id === item.id)) return;
    list.push(item);
    plan.set(date, list);
  };
  if (exam <= today) return plan;

  const totalDays = Math.round((exam - today) / DAY);
  const revisionDays = totalDays > 10 ? Math.min(7, Math.floor(totalDays / 3)) : 0;
  const studyDays = totalDays - revisionDays;

  // Existing review schedule (overdue → today).
  for (const [k, e] of Object.entries(opts.reviews)) {
    const [s, id] = k.split(':') as [Subject, string];
    if (!opts.subjects.includes(s)) continue;
    push(Math.max(today, e.due), { kind: 'review', subject: s, id });
  }

  // Queue of unstudied topics, alternating subjects.
  const perSubject = opts.subjects.map((s) =>
    TREES[s].flatMap((tp) => tp.subtopics.filter((st) => !opts.reviews[keyOf(s, st.id)]).map((st) => ({ subject: s, id: st.id })))
  );
  const queue: { subject: Subject; id: string }[] = [];
  const total = perSubject.reduce((n, a) => n + a.length, 0);
  const cursors = perSubject.map(() => 0);
  // Interleave proportionally: at each step take from the subject furthest behind its share.
  for (let n = 0; n < total; n++) {
    let best = -1;
    let bestRatio = Infinity;
    perSubject.forEach((arr, i) => {
      if (cursors[i] >= arr.length) return;
      const ratio = cursors[i] / arr.length;
      if (ratio < bestRatio) {
        bestRatio = ratio;
        best = i;
      }
    });
    queue.push(perSubject[best][cursors[best]++]);
  }

  const D = Math.max(1, studyDays);
  queue.forEach((t, i) => {
    const dayIdx = Math.floor((i * D) / queue.length);
    const date = today + dayIdx * DAY;
    push(date, { kind: 'new', ...t });
    for (const gap of INTERVALS_DAYS) push(date + gap * DAY, { kind: 'review', ...t });
  });

  for (let k = studyDays; k < totalDays; k++) {
    const date = today + k * DAY;
    push(date, { kind: 'revision', subject: opts.subjects[(k - studyDays) % Math.max(1, opts.subjects.length)] ?? 'physics', id: '' });
  }
  return plan;
}

export function countOf(items: PlanItem[] | undefined, kind: PlanKind): number {
  return items ? items.filter((i) => i.kind === kind).length : 0;
}
