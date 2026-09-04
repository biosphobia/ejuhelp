import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Subject } from './ui';
import type { KeyPointDTO } from './api';
import { useAuth } from './auth';
import { db } from './firebase';

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

// ─────────────────────────── Personal key points ───────────────────────────
export interface KeyPoint {
  id: string;
  ts: number;
  subject: Subject;
  topic?: string;
  kind: 'formula' | 'fact';
  text: string;
}

interface KeyPointsState {
  items: KeyPoint[];
  rev: number;
  addMany: (subject: Subject, kps: KeyPointDTO[]) => number;
  remove: (id: string) => void;
  clear: () => void;
  load: (items: KeyPoint[]) => void;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const KP_LIMIT = 400;

export const useKeyPoints = create<KeyPointsState>((set, get) => ({
  items: [],
  rev: 0,
  addMany: (subject, kps) => {
    const existing = new Set(get().items.map((i) => `${i.subject}:${norm(i.text)}`));
    const fresh: KeyPoint[] = [];
    for (const k of kps) {
      if (!k?.text?.trim()) continue;
      const key = `${subject}:${norm(k.text)}`;
      if (existing.has(key)) continue;
      existing.add(key);
      fresh.push({
        id: newId(),
        ts: Date.now(),
        subject,
        topic: k.topic,
        kind: k.kind === 'fact' ? 'fact' : 'formula',
        text: k.text.trim(),
      });
    }
    if (fresh.length) set((s) => ({ items: [...fresh, ...s.items].slice(0, KP_LIMIT), rev: s.rev + 1 }));
    return fresh.length;
  },
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id), rev: s.rev + 1 })),
  clear: () => set((s) => ({ items: [], rev: s.rev + 1 })),
  load: (items) => set((s) => ({ items: Array.isArray(items) ? items : [], rev: s.rev + 1 })),
}));

// ─────────────────────────── Sync (localStorage + Firestore) ───────────────────────────
type AnyStore<S> = {
  getState: () => S;
  subscribe: (l: (s: S, p: S) => void) => () => void;
};

/**
 * Mirror a zustand store (anything with a `rev` counter) to localStorage and,
 * when signed in, to Firestore at users/{uid}/data/{docId}.
 *
 * `delay` is the debounce in ms before a save fires after a change. Pass 0 to
 * persist immediately (used for chat history and generated questions, which
 * change rarely but must never be lost).
 */
export function attachSync<S extends { rev: number }>(
  store: AnyStore<S>,
  lsKey: string,
  docId: string,
  getData: (s: S) => unknown,
  setData: (s: S, data: any) => void,
  delay = 1000
) {
  try {
    const raw = localStorage.getItem(lsKey);
    if (raw) setData(store.getState(), JSON.parse(raw));
  } catch (e) {
    console.warn(`[userdata] local hydrate ${lsKey} failed`, e);
  }
  let last = store.getState().rev;
  let timer: ReturnType<typeof setTimeout> | undefined;
  // True while applying a snapshot we just pulled from Firestore, so the
  // resulting rev bump is mirrored locally but not written straight back.
  let hydratingFromCloud = false;

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

  const flush = () => {
    saveLocal();
    if (!hydratingFromCloud) void saveCloud();
  };

  store.subscribe((s) => {
    if (s.rev === last) return;
    last = s.rev;
    if (delay <= 0) {
      flush();
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, delay);
  });

  useAuth.subscribe((s, prev) => {
    if (s.user && s.user !== prev.user && db) {
      void (async () => {
        try {
          const snap = await getDoc(doc(db!, 'users', s.user!.uid, 'data', docId));
          if (snap.exists()) {
            hydratingFromCloud = true;
            try {
              setData(store.getState(), snap.data());
            } finally {
              hydratingFromCloud = false;
            }
          } else void saveCloud();
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
  attachSync(
    useKeyPoints,
    'eju-keypoints',
    'keypoints',
    (s) => ({ items: s.items }),
    (s, data) => s.load(data?.items ?? [])
  );
}
