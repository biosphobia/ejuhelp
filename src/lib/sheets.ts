import type { Subject } from './ui';
import chemistry from '../../server/data/eju/sheets/chemistry.json';
import physics from '../../server/data/eju/sheets/physics.json';
import math from '../../server/data/eju/sheets/math.json';
import biology from '../../server/data/eju/sheets/biology.json';

// The pre-authored study sheets are bundled straight into the client so a lesson renders
// instantly — no network request, no auth round-trip, no API tokens. (The server keeps its
// own copy only as a fallback for any node that hasn't been baked yet.)
const SHEETS: Record<Subject, Record<string, string>> = {
  chemistry: chemistry as Record<string, string>,
  physics: physics as Record<string, string>,
  math: math as Record<string, string>,
  biology: biology as Record<string, string>,
};

/** The pre-authored EJU study sheet for a taxonomy node, or undefined if it isn't baked. */
export function staticSheet(subject: Subject, nodeId: string): string | undefined {
  const t = SHEETS[subject]?.[nodeId];
  return typeof t === 'string' && t.trim() ? t : undefined;
}
