import { create } from 'zustand';
import type { Subject } from './ui';

/** Spaced-review schedule: after the n-th review, the next one is due this many days later. */
export const INTERVALS_DAYS = [1, 3, 7, 14, 30];
const DAY = 86_400_000;

export interface ReviewEntry {
  /** Last review, ms since epoch. */
  last: number;
  /** Number of times reviewed. */
  count: number;
  /** Next due, ms since epoch (start of day). */
  due: number;
}

/** Key = `${subject}:${subtopicId}`. */
export type ReviewMap = Record<string, ReviewEntry>;

interface ReviewState {
  reviews: ReviewMap;
  /** EJU exam day as YYYY-MM-DD. */
  examDate: string;
  rev: number;
  markReviewed: (subject: Subject, id: string) => void;
  unmark: (subject: Subject, id: string) => void;
  setExamDate: (d: string) => void;
  load: (data: { reviews?: ReviewMap; examDate?: string }) => void;
}

export const keyOf = (subject: Subject, id: string) => `${subject}:${id}`;

/** Start of the local day, ms. */
export const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Next EJU is the November session (2nd Sunday of November).
const DEFAULT_EXAM = '2026-11-08';

export const useReview = create<ReviewState>((set) => ({
  reviews: {},
  examDate: DEFAULT_EXAM,
  rev: 0,
  markReviewed: (subject, id) =>
    set((s) => {
      const k = keyOf(subject, id);
      const prev = s.reviews[k];
      const count = (prev?.count ?? 0) + 1;
      const gap = INTERVALS_DAYS[Math.min(count - 1, INTERVALS_DAYS.length - 1)];
      const now = Date.now();
      return {
        reviews: { ...s.reviews, [k]: { last: now, count, due: startOfDay(now) + gap * DAY } },
        rev: s.rev + 1,
      };
    }),
  unmark: (subject, id) =>
    set((s) => {
      const { [keyOf(subject, id)]: _drop, ...rest } = s.reviews;
      return { reviews: rest, rev: s.rev + 1 };
    }),
  setExamDate: (examDate) => set((s) => (/^\d{4}-\d{2}-\d{2}$/.test(examDate) ? { examDate, rev: s.rev + 1 } : s)),
  load: (data) =>
    set((s) => ({
      reviews: data?.reviews && typeof data.reviews === 'object' ? data.reviews : {},
      examDate: typeof data?.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.examDate) ? data.examDate : s.examDate,
      rev: s.rev + 1,
    })),
}));

export type ReviewStatus = 'new' | 'due' | 'ok';

export function statusOf(entry: ReviewEntry | undefined, now = Date.now()): ReviewStatus {
  if (!entry) return 'new';
  return entry.due <= now ? 'due' : 'ok';
}

/** Days from today (local) until the exam date; negative once it has passed. */
export function daysUntil(examDate: string, now = Date.now()): number {
  const [y, m, d] = examDate.split('-').map(Number);
  const exam = new Date(y, m - 1, d).getTime();
  return Math.round((exam - startOfDay(now)) / DAY);
}
