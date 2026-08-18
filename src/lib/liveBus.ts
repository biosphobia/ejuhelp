// Tiny op bus between the data stores and the live-sync layer (lib/live.ts).
//
// Stores publish a semantic op AFTER applying a local mutation; the live layer forwards
// it to the user's other devices. When the live layer applies a REMOTE op it wraps the
// store calls in `applyingRemote()`, which suppresses re-publication — otherwise every
// op would echo back and forth forever. Kept as a leaf module (no imports) so board /
// persistence / live can all use it without cycles.

import type { Stroke, Viewport, Pt } from './board';

export type BoardOp =
  | { t: 'stroke-add'; pageId: string; strokes: Stroke[] }
  | { t: 'stroke-erase'; pageId: string; ids: string[] }
  | { t: 'stroke-update'; pageId: string; updates: { id: string; points: Pt[] }[] }
  /** Full replacement of one page's strokes (undo, clear). */
  | { t: 'page-set'; pageId: string; strokes: Stroke[] }
  | { t: 'page-add'; pageId: string; afterId: string | null }
  | { t: 'page-del'; pageId: string }
  | { t: 'page-go'; pageId: string }
  | { t: 'viewport'; pageId: string; v: Viewport }
  | { t: 'notebook'; id: string };

type Listener = (op: BoardOp) => void;

const listeners = new Set<Listener>();
let remoteDepth = 0;

/** True while a remote op is being applied to the stores (suppresses re-publication). */
export const isRemoteApply = () => remoteDepth > 0;

/** Run store mutations that came from ANOTHER device, without echoing them back out. */
export function applyingRemote<T>(fn: () => T): T {
  remoteDepth++;
  try {
    return fn();
  } finally {
    remoteDepth--;
  }
}

/** Publish a locally-originated op to the live layer (no-op during remote apply). */
export function emitOp(op: BoardOp) {
  if (remoteDepth > 0) return;
  for (const l of listeners) l(op);
}

export function onOp(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
