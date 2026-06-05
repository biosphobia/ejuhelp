import { create } from 'zustand';
import type { Subject } from './ui';
import type { KeyPointDTO, MindmapOp } from './api';

const newId = () => Math.random().toString(36).slice(2, 10);
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export type ConceptKind = 'formula' | 'fact';

/** Sentinel grouping key for concepts with no (or an unrecognized) category. */
export const GENERAL_KEY = '__general';

/** A single important concept captured during study, shown as a node on the Mindmap. */
export interface Concept {
  id: string;
  ts: number;
  subject: Subject;
  /** Category (free-text topic from the coach) this concept belongs to; '' → General. */
  topic: string;
  kind: ConceptKind;
  text: string;
}

interface MindmapState {
  concepts: Concept[];
  rev: number;
  /** Merge freshly-extracted concepts for a subject, de-duplicating by text. Returns how many were new. */
  addMany: (subject: Subject, kps: KeyPointDTO[]) => number;
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
  addMany: (subject, kps) => {
    const existing = new Set(get().concepts.map((c) => `${c.subject}:${norm(c.text)}`));
    const fresh: Concept[] = [];
    for (const k of kps) {
      if (!k?.text?.trim()) continue;
      const key = `${subject}:${norm(k.text)}`;
      if (existing.has(key)) continue;
      existing.add(key);
      fresh.push({
        id: newId(),
        ts: Date.now(),
        subject,
        topic: (k.topic ?? '').trim(),
        kind: k.kind === 'fact' ? 'fact' : 'formula',
        text: k.text.trim(),
      });
    }
    if (fresh.length) set((s) => ({ concepts: [...fresh, ...s.concepts].slice(0, LIMIT), rev: s.rev + 1 }));
    return fresh.length;
  },
  remove: (id) => set((s) => ({ concepts: s.concepts.filter((c) => c.id !== id), rev: s.rev + 1 })),
  applyOps: (subject, ops) => {
    let added = 0;
    let removed = 0;
    let updated = 0;
    set((s) => {
      let concepts = s.concepts;
      // Track existing text so coach-added concepts don't duplicate ones we have.
      const seen = new Set(concepts.filter((c) => c.subject === subject).map((c) => norm(c.text)));
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
          if (!text || seen.has(norm(text))) continue;
          seen.add(norm(text));
          concepts = [
            {
              id: newId(),
              ts: Date.now(),
              subject,
              topic: (op.category ?? '').trim(),
              kind: op.kind === 'fact' ? 'fact' : 'formula',
              text,
            },
            ...concepts,
          ];
          added++;
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
