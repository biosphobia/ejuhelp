import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchTopics, fetchStudySheet, fetchTopicMastery, type TopicAttemptDTO } from './api';
import { loadStaticSheet } from './sheets';
import { useProgress, type Attempt } from './userdata';
import { useUI, type Subject } from './ui';

// ── Taxonomy tree (the Mindmap backbone) ──
export interface SubNode {
  id: string;
  label: string;
}
export interface TopicNode {
  id: string;
  label: string;
  subs: SubNode[];
}
export type SubjectTree = TopicNode[];

/** What a tap on a node opens (the NodeDetail view). */
export interface OpenNode {
  subject: Subject;
  id: string;
  label: string;
  isTopic: boolean;
  subIds: string[];
}

const norm = (s: string) =>
  s.toLowerCase().replace(/[（(].*?[)）]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Match an attempt's coach-assigned topic (always English) to a node id. Tries exact,
// then containment either way, against every topic/subtopic English label.
function buildMatcher(enTopics: { id: string; name: string }[], enSubs: { id: string; name: string; topicId: string }[]) {
  const entries: { id: string; n: string }[] = [];
  for (const t of enTopics) entries.push({ id: t.id, n: norm(t.name) });
  for (const s of enSubs) entries.push({ id: s.id, n: norm(s.name) });
  return (topic: string): string | null => {
    const q = norm(topic || '');
    if (!q) return null;
    let best = entries.find((e) => e.n === q);
    if (best) return best.id;
    best = entries.find((e) => e.n && (q.includes(e.n) || e.n.includes(q)));
    return best ? best.id : null;
  };
}

interface Cached {
  text: string;
  ts: number;
}
const key = (subject: Subject, nodeId: string) => `${subject}:${nodeId}`;

interface StudyMapState {
  trees: Partial<Record<Subject, SubjectTree>>;
  subParent: Partial<Record<Subject, Record<string, string>>>; // subId -> topicId
  matchers: Partial<Record<Subject, (t: string) => string | null>>;
  treeLang: Partial<Record<Subject, string>>;
  loadingTree: Partial<Record<Subject, boolean>>;
  sheets: Record<string, Cached>;
  reads: Record<string, Cached>;
  busy: Record<string, boolean>;
  rev: number;

  // Study calendar: which subjects to study, and which tasks are done. The exam date is
  // fixed (EJU Nov 8) and the day-by-day plan is computed locally (lib/calendar.ts) — no API.
  planSubjects: Subject[];
  done: Record<string, true>; // keyed by calendar task id

  // The node whose detail (study sheet / practice) is open, rendered globally so it can be
  // opened from the calendar OR the whiteboard side menu. Transient (not persisted).
  openNode: OpenNode | null;

  ensureTree: (subject: Subject) => Promise<void>;
  studySheet: (subject: Subject, nodeId: string, force?: boolean) => Promise<void>;
  masteryRead: (subject: Subject, nodeId: string, force?: boolean) => Promise<void>;
  setPlanSubjects: (subjects: Subject[]) => void;
  toggleTask: (taskId: string) => void;
  setOpenNode: (n: OpenNode | null) => void;
}

export const useStudyMap = create<StudyMapState>()(
  persist(
    (set, get) => ({
      trees: {},
      subParent: {},
      matchers: {},
      treeLang: {},
      loadingTree: {},
      sheets: {},
      reads: {},
      busy: {},
      rev: 0,
      planSubjects: [],
      done: {},
      openNode: null,

      setPlanSubjects: (subjects) => set((s) => ({ planSubjects: subjects, rev: s.rev + 1 })),

      setOpenNode: (openNode) => set({ openNode }),

      toggleTask: (taskId) =>
        set((s) => {
          const done = { ...s.done };
          if (done[taskId]) delete done[taskId];
          else done[taskId] = true;
          return { done, rev: s.rev + 1 };
        }),

      ensureTree: async (subject) => {
        const lang = useUI.getState().lang;
        const st = get();
        if (st.trees[subject] && st.treeLang[subject] === lang) return;
        if (st.loadingTree[subject]) return;
        set((s) => ({ loadingTree: { ...s.loadingTree, [subject]: true } }));
        try {
          // Display tree in the user's language; English tree only to build the matcher
          // (the coach always tags attempts with an English sub-topic).
          const [disp, en] = await Promise.all([
            fetchTopics({ subject, lang }),
            lang === 'en' ? Promise.resolve(null) : fetchTopics({ subject, lang: 'en' }),
          ]);
          const tree: SubjectTree = disp.topics.map((t) => ({
            id: t.id,
            label: t.name,
            subs: disp.subtopics.filter((s) => s.topicId === t.id).map((s) => ({ id: s.id, label: s.name })),
          }));
          const parent: Record<string, string> = {};
          for (const s of disp.subtopics) parent[s.id] = s.topicId;
          const enT = (en ?? disp).topics;
          const enS = (en ?? disp).subtopics;
          const matcher = buildMatcher(enT, enS);
          set((s) => ({
            trees: { ...s.trees, [subject]: tree },
            subParent: { ...s.subParent, [subject]: parent },
            matchers: { ...s.matchers, [subject]: matcher },
            treeLang: { ...s.treeLang, [subject]: lang },
            loadingTree: { ...s.loadingTree, [subject]: false },
          }));
        } catch {
          set((s) => ({ loadingTree: { ...s.loadingTree, [subject]: false } }));
        }
      },

      studySheet: async (subject, nodeId, force) => {
        const k = key(subject, nodeId);
        const st = get();
        if (!force && st.sheets[k]?.text) return;
        // Instant path: the sheet is baked into the client (a per-subject chunk loaded on
        // demand) — no network/auth/API. Only nodes that haven't been baked fall through.
        const local = await loadStaticSheet(subject, nodeId);
        if (local) {
          set((s) => ({ sheets: { ...s.sheets, [k]: { text: local, ts: Date.now() } }, rev: s.rev + 1 }));
          return;
        }
        if (st.busy['sheet:' + k]) return;
        set((s) => ({ busy: { ...s.busy, ['sheet:' + k]: true } }));
        try {
          const r = await fetchStudySheet({ subject, lang: useUI.getState().lang, topicId: nodeId });
          set((s) => ({ sheets: { ...s.sheets, [k]: { text: r.text, ts: Date.now() } }, busy: { ...s.busy, ['sheet:' + k]: false }, rev: s.rev + 1 }));
        } catch {
          set((s) => ({ busy: { ...s.busy, ['sheet:' + k]: false } }));
        }
      },

      masteryRead: async (subject, nodeId, force) => {
        const k = key(subject, nodeId);
        const st = get();
        const hist = attemptsForNode(subject, nodeId).map((a) => ({
          prompt: a.prompt,
          correct: a.correct,
          errorTags: a.errorTags,
          reasoning: a.reasoning,
        })) as TopicAttemptDTO[];
        if (!hist.length) {
          set((s) => ({ reads: { ...s.reads, [k]: { text: '', ts: Date.now() } } }));
          return;
        }
        // Cheap freshness check: skip if cached after the latest attempt (unless forced).
        const latest = attemptsForNode(subject, nodeId).reduce((m, a) => Math.max(m, a.ts), 0);
        if (!force && st.reads[k]?.text && st.reads[k].ts >= latest) return;
        if (st.busy['read:' + k]) return;
        set((s) => ({ busy: { ...s.busy, ['read:' + k]: true } }));
        try {
          const r = await fetchTopicMastery({ subject, lang: useUI.getState().lang, topicId: nodeId, history: hist });
          set((s) => ({ reads: { ...s.reads, [k]: { text: r.text, ts: Date.now() } }, busy: { ...s.busy, ['read:' + k]: false }, rev: s.rev + 1 }));
        } catch {
          set((s) => ({ busy: { ...s.busy, ['read:' + k]: false } }));
        }
      },
    }),
    {
      name: 'eju-studymap',
      // Persist the generated caches + chosen subjects + task completion; tree/matcher refetch.
      partialize: (s) => ({ sheets: s.sheets, reads: s.reads, planSubjects: s.planSubjects, done: s.done }),
    }
  )
);

// ── Mastery aggregation (derived from the synced attempts) ──
export interface NodeStat {
  total: number;
  correct: number;
  /** 'none' | 'weak' | 'improving' | 'strong' */
  level: 'none' | 'weak' | 'improving' | 'strong';
  lastTs: number;
}

/** All attempts that belong to a node: for a subtopic, ones matched to it; for a topic,
 *  ones matched to it OR any of its subtopics. */
export function attemptsForNode(subject: Subject, nodeId: string): Attempt[] {
  const st = useStudyMap.getState();
  const match = st.matchers[subject];
  const tree = st.trees[subject];
  const all = useProgress.getState().attempts.filter((a) => (a.subject || subject) === subject);
  if (!match) return [];
  const topic = tree?.find((t) => t.id === nodeId);
  const ids = topic ? new Set<string>([nodeId, ...topic.subs.map((s) => s.id)]) : new Set<string>([nodeId]);
  return all.filter((a) => {
    const id = match(a.topic);
    return id != null && ids.has(id);
  });
}

export function nodeStat(subject: Subject, nodeId: string): NodeStat {
  const at = attemptsForNode(subject, nodeId);
  const total = at.length;
  const correct = at.filter((a) => a.correct).length;
  const lastTs = at.reduce((m, a) => Math.max(m, a.ts), 0);
  let level: NodeStat['level'] = 'none';
  if (total > 0) {
    const acc = correct / total;
    level = total < 2 ? 'weak' : acc >= 0.8 ? 'strong' : acc >= 0.5 ? 'improving' : 'weak';
  }
  return { total, correct, level, lastTs };
}

/** Subtopic ids the student is weak on, as a `${subject}:${id}` set — used by the study
 *  calendar to prioritize drills/quizzes. Reads live tree + attempt state. */
export function weakNodeIds(subjects: Subject[]): Set<string> {
  const st = useStudyMap.getState();
  const set = new Set<string>();
  for (const s of subjects)
    for (const top of st.trees[s] ?? [])
      for (const sub of top.subs) if (nodeStat(s, sub.id).level === 'weak') set.add(`${s}:${sub.id}`);
  return set;
}

export const LEVEL_COLOR: Record<NodeStat['level'], string> = {
  none: 'bg-slate-700 text-slate-300 ring-slate-600',
  weak: 'bg-rose-500/20 text-rose-200 ring-rose-500/40',
  improving: 'bg-amber-500/20 text-amber-100 ring-amber-500/40',
  strong: 'bg-emerald-500/20 text-emerald-100 ring-emerald-500/40',
};
