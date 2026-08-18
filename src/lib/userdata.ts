import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Subject } from './ui';
import { useAuth } from './auth';
import { db } from './firebase';
import { useGenerated } from './generated';
import { useMindmap } from './mindmap';
import { useLearnerProfile } from './profile';

const newId = () => Math.random().toString(36).slice(2, 10);

// ─────────────────────────── Progress / weak points ───────────────────────────
export interface Attempt {
  id: string;
  ts: number;
  subject: Subject;
  topic: string;
  correct: boolean;
  source: 'quiz' | 'check';
  errorTags?: string[];
  /** The question prompt and the coach's read of the student's working — so the Mindmap
   *  node can show the real question and their thinking process, not just a tally. */
  prompt?: string;
  reasoning?: string;
}

interface ProgressState {
  attempts: Attempt[];
  rev: number;
  addAttempt: (a: Omit<Attempt, 'id' | 'ts'>) => void;
  reset: () => void;
  loadAttempts: (a: Attempt[]) => void;
}

const ATTEMPT_LIMIT = 500;

export const useProgress = create<ProgressState>((set) => ({
  attempts: [],
  rev: 0,
  addAttempt: (a) =>
    set((s) => ({
      attempts: [...s.attempts, { ...a, id: newId(), ts: Date.now() }].slice(-ATTEMPT_LIMIT),
      rev: s.rev + 1,
    })),
  reset: () => set((s) => ({ attempts: [], rev: s.rev + 1 })),
  loadAttempts: (attempts) =>
    set((s) => ({ attempts: Array.isArray(attempts) ? attempts : [], rev: s.rev + 1 })),
}));

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  acc: number;
}
export interface ProgressSummary {
  total: number;
  correct: number;
  topics: TopicStat[]; // worst-first
  tags: { tag: string; count: number }[]; // most common mistakes first
}

export function summarize(attempts: Attempt[]): ProgressSummary {
  const perTopic: Record<string, { correct: number; total: number }> = {};
  const tagCounts: Record<string, number> = {};
  let correct = 0;
  for (const a of attempts) {
    const k = a.topic || 'general';
    (perTopic[k] ??= { correct: 0, total: 0 }).total++;
    if (a.correct) {
      perTopic[k].correct++;
      correct++;
    }
    for (const t of a.errorTags ?? []) {
      if (t && t !== 'none') tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
  }
  const topics = Object.entries(perTopic)
    .map(([topic, v]) => ({ topic, correct: v.correct, total: v.total, acc: v.total ? v.correct / v.total : 0 }))
    .sort((a, b) => a.acc - b.acc || b.total - a.total);
  const tags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
  return { total: attempts.length, correct, topics, tags };
}

/** Compact focus payload for weak-point-targeted generation. */
export function focusFromSummary(s: ProgressSummary): { topics: string[]; tags: string[] } {
  return {
    topics: s.topics.filter((t) => t.acc < 1).slice(0, 4).map((t) => t.topic),
    tags: s.tags.slice(0, 3).map((t) => t.tag),
  };
}

/** A compact, attempt-derived read of the student's strengths/weaknesses for the coach
 *  to personalize against — overall accuracy, weak/strong topics, recurring mistakes.
 *  Tagged so the server directive can act on each line. Empty until there's enough data. */
export function learnerSnapshotLines(subject?: Subject): string[] {
  const attempts = useProgress.getState().attempts.filter((a) => !subject || (a.subject || subject) === subject);
  if (attempts.length < 3) return [];
  const s = summarize(attempts);
  const pct = (n: number) => Math.round(n * 100);
  const lines: string[] = [`(performance) overall accuracy ${pct(s.correct / Math.max(1, s.total))}% over ${s.total} graded questions`];
  const weak = s.topics.filter((t) => t.total >= 2 && t.acc < 0.6).slice(0, 5).map((t) => `${t.topic} (${pct(t.acc)}%)`);
  if (weak.length) lines.push(`(struggle) weaker topics — needs fuller, simpler explanations: ${weak.join(', ')}`);
  const strong = s.topics.filter((t) => t.total >= 2 && t.acc >= 0.8).slice(0, 4).map((t) => t.topic);
  if (strong.length) lines.push(`(strength) strong topics — can be concise and go deeper: ${strong.join(', ')}`);
  const tags = s.tags.slice(0, 3).map((t) => t.tag);
  if (tags.length) lines.push(`(struggle) recurring mistake types to watch for and pre-empt: ${tags.join(', ')}`);
  return lines;
}

// ─────────────────────────── Sync (localStorage + Firestore) ───────────────────────────
type AnyStore<S> = {
  getState: () => S;
  subscribe: (l: (s: S, p: S) => void) => () => void;
};

/** Does a store payload hold any real content (a non-empty array/object value)? Used to
 *  stamp legacy local payloads that predate updatedAt. */
function looksNonEmpty(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  for (const v of Object.values(data as Record<string, unknown>)) {
    if (Array.isArray(v) && v.length) return true;
    if (v && typeof v === 'object' && Object.keys(v).length) return true;
  }
  return false;
}

function attachSync<S extends { rev: number }>(
  store: AnyStore<S>,
  lsKey: string,
  docId: string,
  getData: (s: S) => unknown,
  setData: (s: S, data: any) => void
) {
  // Freshness stamp of what this device currently holds. The cloud copy may only
  // REPLACE local state when it is strictly newer — before this, signing in (which now
  // happens automatically ~1s after launch via the anonymous backup account) blindly
  // overwrote just-hydrated local data with a stale cloud copy. Close the tab within
  // the cloud debounce and your newest generated questions/attempts were gone for good.
  let localStamp = 0;
  try {
    const raw = localStorage.getItem(lsKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      setData(store.getState(), parsed);
      // Legacy payloads predate the stamp: local saves are synchronous/immediate, so
      // treat existing local content as current rather than letting old cloud win.
      localStamp = typeof parsed?.updatedAt === 'number' ? parsed.updatedAt : looksNonEmpty(parsed) ? Date.now() : 0;
    }
  } catch (e) {
    console.warn(`[userdata] local hydrate ${lsKey} failed`, e);
  }
  let last = store.getState().rev;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const saveLocal = () => {
    try {
      localStamp = Date.now();
      localStorage.setItem(lsKey, JSON.stringify({ ...(getData(store.getState()) as object), updatedAt: localStamp }));
    } catch (e) {
      console.warn(`[userdata] local save ${lsKey} failed`, e);
    }
  };
  const saveCloud = async () => {
    const { user } = useAuth.getState();
    if (!user || !db) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'data', docId), {
        ...(getData(store.getState()) as object),
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn(`[userdata] cloud save ${docId} failed`, e);
    }
  };

  store.subscribe((s) => {
    if (s.rev === last) return;
    last = s.rev;
    // Local write is IMMEDIATE and synchronous — a reload right after an answer/attempt
    // can therefore never drop it. Only the network write is debounced.
    saveLocal();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void saveCloud();
    }, 1000);
  });

  // Force the pending cloud write out when the app is hidden/closed. (Firestore's
  // persistent cache journals it even if the network send can't finish in time.)
  const flushCloud = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
      void saveCloud();
    }
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushCloud();
    });
  }
  if (typeof window !== 'undefined') window.addEventListener('pagehide', flushCloud);

  useAuth.subscribe((s, prev) => {
    if (s.user && s.user !== prev.user && db) {
      void (async () => {
        try {
          const snap = await getDoc(doc(db!, 'users', s.user!.uid, 'data', docId));
          const cloudData = snap.exists() ? snap.data() : null;
          const cloudStamp = typeof (cloudData as { updatedAt?: number } | null)?.updatedAt === 'number' ? (cloudData as { updatedAt: number }).updatedAt : 0;
          if (cloudData && cloudStamp > localStamp) {
            // Cloud is genuinely newer (another device worked more recently) → adopt it.
            setData(store.getState(), cloudData);
            localStamp = cloudStamp;
          } else {
            // Local is newer (or the cloud copy doesn't exist) → push local up instead
            // of letting a stale cloud copy erase it.
            void saveCloud();
          }
        } catch (e) {
          console.warn(`[userdata] cloud hydrate ${docId} failed`, e);
        }
      })();
    }
  });
}

let started = false;
export function initUserData() {
  if (started) return;
  started = true;
  attachSync(
    useProgress,
    'eju-progress',
    'progress',
    (s) => ({ attempts: s.attempts }),
    (s, data) => s.loadAttempts(data?.attempts ?? [])
  );
  // NOTE: the storage keys carry a version suffix. Bumping it abandons the old
  // localStorage/Firestore data, cleanly wiping Mindmaps built before the
  // categorization/merge fixes so they rebuild fresh.
  attachSync(
    useMindmap,
    'eju-mindmap-v3',
    'mindmap-v3',
    (s) => ({ concepts: s.concepts }),
    (s, data) => s.load(data?.concepts ?? [])
  );
  attachSync(
    useLearnerProfile,
    'eju-profile',
    'profile',
    (s) => ({ notes: s.notes }),
    (s, data) => s.load(data?.notes ?? [])
  );
  attachSync(
    useGenerated,
    'eju-generated-v2',
    'generated',
    (s) => ({ questions: s.questions, selected: s.selected }),
    (s, data) => s.load(data ?? {})
  );
}
