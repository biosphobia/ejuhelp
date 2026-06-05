import { create } from 'zustand';
import type { Subject } from './ui';
import type { KeyPointDTO } from './api';

const newId = () => Math.random().toString(36).slice(2, 10);
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export type ConceptKind = 'formula' | 'fact';

/** Default bucket for concepts the coach didn't tag with a topic. */
export const GENERAL_CATEGORY = 'General';

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
  clearSubject: (subject) =>
    set((s) => ({ concepts: s.concepts.filter((c) => c.subject !== subject), rev: s.rev + 1 })),
  load: (concepts) => set((s) => ({ concepts: Array.isArray(concepts) ? concepts : [], rev: s.rev + 1 })),
}));

/** The category label a concept belongs to, normalizing the empty/untagged case. */
export const categoryOf = (c: Concept) => c.topic.trim() || GENERAL_CATEGORY;
