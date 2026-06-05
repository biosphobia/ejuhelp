import { create } from 'zustand';
import { SUBJECTS, type Subject } from './ui';
import type { KeyPointDTO, MindmapOp } from './api';

const newId = () => Math.random().toString(36).slice(2, 10);

export type ConceptKind = 'formula' | 'fact';

/** Sentinel grouping key for concepts with no (or an unrecognized) category. */
export const GENERAL_KEY = '__general';

/** A single important concept captured during study, shown as a node on the Mindmap. */
export interface Concept {
  id: string;
  ts: number;
  subject: Subject;
  /** Canonical category id this concept belongs to; '' → General. */
  topic: string;
  kind: ConceptKind;
  text: string;
}

// ── similarity: decide whether an incoming concept is the SAME as an existing one,
// so we update it in place instead of spawning yet another near-duplicate node. ──

/** Normalized formula signatures ($...$ blocks that contain an operator). */
function formulaSigs(s: string): string[] {
  const out: string[] = [];
  const re = /\$+([^$]+)\$+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const f = m[1].replace(/[\s{}\\]/g, '').toLowerCase();
    if (f.length >= 3 && /[=+\-*/^_]/.test(f)) out.push(f);
  }
  return out;
}
function tokenSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length >= 3)
  );
}
/** Same core formula, or high word overlap → treat as the same concept. */
function similar(a: string, b: string): boolean {
  const fa = formulaSigs(a);
  const fb = formulaSigs(b);
  for (const x of fa) if (fb.includes(x)) return true;
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size < 2 || B.size < 2) return false;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter) >= 0.6;
}

/** Add a concept, or update the existing similar one (same subject) in place. */
function upsertConcept(
  concepts: Concept[],
  subject: Subject,
  c: { text: string; kind: ConceptKind; topic: string }
): { concepts: Concept[]; added: boolean; updated: boolean } {
  const idx = concepts.findIndex((x) => x.subject === subject && similar(x.text, c.text));
  if (idx >= 0) {
    const ex = concepts[idx];
    // Keep the more informative (longer) wording; adopt a real category if we now have one.
    const text = c.text.length > ex.text.length ? c.text : ex.text;
    const next = concepts.slice();
    next[idx] = { ...ex, text, kind: c.kind, topic: c.topic || ex.topic, ts: Date.now() };
    return { concepts: next, added: false, updated: true };
  }
  return {
    concepts: [{ id: newId(), ts: Date.now(), subject, topic: c.topic, kind: c.kind, text: c.text }, ...concepts],
    added: true,
    updated: false,
  };
}

const subjectOf = (s: unknown, fallback: Subject): Subject =>
  (SUBJECTS as readonly string[]).includes(s as string) ? (s as Subject) : fallback;

interface MindmapState {
  concepts: Concept[];
  rev: number;
  /** Merge freshly-extracted concepts. Each concept goes under the subject the
   *  server judged it to belong to (so a math note never lands in physics), and
   *  updates a similar existing node rather than duplicating it. Returns # changed. */
  addMany: (defaultSubject: Subject, kps: KeyPointDTO[]) => number;
  remove: (id: string) => void;
  /** Apply a batch of coach-issued edits (add/remove/update). Returns what changed. */
  applyOps: (subject: Subject, ops: MindmapOp[]) => { added: number; removed: number; updated: number };
  /** Clear every concept for one subject (the Mindmap is per-subject). */
  clearSubject: (subject: Subject) => void;
  load: (concepts: Concept[]) => void;
}

const LIMIT = 600;

export const useMindmap = create<MindmapState>((set, get) => ({
  concepts: [],
  rev: 0,
  addMany: (defaultSubject, kps) => {
    let changed = 0;
    set((s) => {
      let concepts = s.concepts;
      for (const k of kps) {
        const text = k?.text?.trim();
        if (!text) continue;
        const r = upsertConcept(concepts, subjectOf(k.subject, defaultSubject), {
          text,
          kind: k.kind === 'fact' ? 'fact' : 'formula',
          topic: (k.topic ?? '').trim(),
        });
        concepts = r.concepts;
        if (r.added || r.updated) changed++;
      }
      return changed ? { concepts: concepts.slice(0, LIMIT), rev: s.rev + 1 } : s;
    });
    return changed;
  },
  remove: (id) => set((s) => ({ concepts: s.concepts.filter((c) => c.id !== id), rev: s.rev + 1 })),
  applyOps: (subject, ops) => {
    let added = 0;
    let removed = 0;
    let updated = 0;
    set((s) => {
      let concepts = s.concepts;
      for (const op of ops) {
        if (op.op === 'remove') {
          const before = concepts.length;
          concepts = concepts.filter((c) => c.id !== op.id);
          if (concepts.length < before) removed++;
        } else if (op.op === 'update') {
          concepts = concepts.map((c) => {
            if (c.id !== op.id) return c;
            updated++;
            return {
              ...c,
              ...(op.text?.trim() ? { text: op.text.trim() } : {}),
              ...(op.kind ? { kind: op.kind } : {}),
              ...(op.category !== undefined ? { topic: op.category.trim() } : {}),
            };
          });
        } else if (op.op === 'add') {
          const text = op.text?.trim();
          if (!text) continue;
          const r = upsertConcept(concepts, subject, {
            text,
            kind: op.kind === 'fact' ? 'fact' : 'formula',
            topic: (op.category ?? '').trim(),
          });
          concepts = r.concepts;
          if (r.added) added++;
          else if (r.updated) updated++;
        }
      }
      if (!added && !removed && !updated) return s;
      return { concepts: concepts.slice(0, LIMIT), rev: s.rev + 1 };
    });
    return { added, removed, updated };
  },
  clearSubject: (subject) =>
    set((s) => ({ concepts: s.concepts.filter((c) => c.subject !== subject), rev: s.rev + 1 })),
  load: (concepts) => set((s) => ({ concepts: Array.isArray(concepts) ? concepts : [], rev: s.rev + 1 })),
}));

/** Stable grouping key for a concept: its canonical category id, or the General sentinel. */
export const categoryKeyOf = (c: Concept) => c.topic.trim() || GENERAL_KEY;
