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

// ─────────────────────────── Sync (localStorage + Firestore) ───────────────────────────
type AnyStore<S> = {
  getState: () => S;
  subscribe: (l: (s: S, p: S) => void) => () => void;
};

function attachSync<S extends { rev: number }>(
  store: AnyStore<S>,
  lsKey: string,
  docId: string,
  getData: (s: S) => unknown,
  setData: (s: S, data: any) => void
) {
  try {
    const raw = localStorage.getItem(lsKey);
    if (raw) setData(store.getState(), JSON.parse(raw));
  } catch (e) {
    console.warn(`[userdata] local hydrate ${lsKey} failed`, e);
  }
  let last = store.getState().rev;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const saveLocal = () => {
    try {
      localStorage.setItem(lsKey, JSON.stringify(getData(store.getState())));
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
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      saveLocal();
      void saveCloud();
    }, 1000);
  });

  useAuth.subscribe((s, prev) => {
    if (s.user && s.user !== prev.user && db) {
      void (async () => {
        try {
          const snap = await getDoc(doc(db!, 'users', s.user!.uid, 'data', docId));
          if (snap.exists()) setData(store.getState(), snap.data());
          else void saveCloud();
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
