// Study-note format for the EJU calendar topic tree.
//
// Each subtopic in the knowledge base (server/data/eju/<subject>.json) gets one
// note. Notes are written in English and Japanese; other UI languages read the
// English text. The body is Markdown (headings, lists, **bold**, $LaTeX$) plus
// three extra block types understood by <Markdown>:
//   | a | b |         GitHub-style pipe tables (a |---| separator row is optional)
//   > text            a highlighted callout box
//   :::fig <id>       an inline SVG diagram from src/ui/diagrams.tsx
import type { Subject } from '../../lib/ui';

export interface BiText {
  en: string;
  ja: string;
}
export interface BiList {
  en: string[];
  ja: string[];
}

export interface Note {
  /** Subtopic id, matching the knowledge-base taxonomy. */
  id: string;
  /** The one idea to hold in your head — the underlying logic, in a sentence or two. */
  core: BiText;
  /** Main explanation (Markdown, see above). Short sections, worked logic, figures where they save time. */
  body: BiText;
  /** How the EJU actually asks this (from the past-paper archetypes). */
  exam: BiList;
  /** Traps and exceptions. */
  traps: BiList;
  /** Suggested follow-up questions for the coach. */
  followups: BiList;
}

export interface TreeSubtopic {
  id: string;
  name: BiText;
}
export interface TreeTopic {
  id: string;
  name: BiText;
  subtopics: TreeSubtopic[];
}
export interface SubjectNotes {
  subject: Subject;
  tree: TreeTopic[];
  notes: Record<string, Note>;
}
