import type { Subject } from './ui';

// The pre-authored study sheets are substantial (a condensed EJU textbook per node), so
// rather than bundle all four subjects into the initial JS, each subject's sheet map is a
// separate chunk loaded on demand the first time a topic in that subject is opened, then
// cached in memory. No API, no auth — just a small static asset the service worker caches.
type SheetMap = Record<string, string>;

const loaders: Record<Subject, () => Promise<{ default: SheetMap }>> = {
  math: () => import('../../server/data/eju/sheets/math.json'),
  physics: () => import('../../server/data/eju/sheets/physics.json'),
  chemistry: () => import('../../server/data/eju/sheets/chemistry.json'),
  biology: () => import('../../server/data/eju/sheets/biology.json'),
};

const cache: Partial<Record<Subject, SheetMap>> = {};

/** The pre-authored EJU study sheet for a taxonomy node, or undefined if it isn't baked.
 *  Loads (and caches) the subject's sheet chunk on first use. */
export async function loadStaticSheet(subject: Subject, nodeId: string): Promise<string | undefined> {
  let map = cache[subject];
  if (!map) {
    try {
      map = (await loaders[subject]()).default as SheetMap;
      cache[subject] = map;
    } catch {
      return undefined;
    }
  }
  const t = map[nodeId];
  return typeof t === 'string' && t.trim() ? t : undefined;
}
