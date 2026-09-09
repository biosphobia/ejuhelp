// Wire format of a saved page, plus splitting/reassembly across Firestore docs.
// Pure functions with no browser or Firebase dependency, so they are unit-testable.
import type { InkColor, ShapeKind, TextBlock } from './board';

export type CStroke = { i: string; c: InkColor; s: number; p: number[][]; sh?: ShapeKind };
export type CPage = { id: string; v: [number, number, number]; st: CStroke[]; nb?: string; t?: string; tx?: TextBlock[]; src?: string };
export type ChunkDoc = { id: string; data: any };

const CLOUD_PART_MAX = 800_000; // bytes of JSON per Firestore doc (cap is ~1 MB)

/** Split a page whose JSON exceeds the Firestore doc cap into several docs:
 *  `<id>` carries the metadata and the first strokes (+ `parts`), `<id>~1`… the rest.
 *  No page is ever skipped for being big. */
export function chunkPage(enc: CPage): ChunkDoc[] {
  const json = JSON.stringify(enc);
  if (json.length <= CLOUD_PART_MAX) return [{ id: enc.id, data: enc }];
  const perPart = Math.max(1, Math.floor((enc.st.length * CLOUD_PART_MAX) / json.length));
  const chunks: CStroke[][] = [];
  for (let i = 0; i < enc.st.length; i += perPart) chunks.push(enc.st.slice(i, i + perPart));
  if (!chunks.length) chunks.push([]);
  const out: ChunkDoc[] = [{ id: enc.id, data: { ...enc, st: chunks[0], parts: chunks.length } }];
  for (let i = 1; i < chunks.length; i++) out.push({ id: `${enc.id}~${i}`, data: { id: enc.id, part: i, st: chunks[i] } });
  return out;
}

/** Reassemble docs written by chunkPage. */
export function assemblePages(docs: ChunkDoc[]): CPage[] {
  const heads = new Map<string, any>();
  const parts = new Map<string, any[]>();
  for (const d of docs) {
    const m = /^(.*)~(\d+)$/.exec(d.id);
    if (m) {
      const list = parts.get(m[1]) ?? [];
      list.push(d.data);
      parts.set(m[1], list);
    } else heads.set(d.id, d.data);
  }
  const out: CPage[] = [];
  for (const [id, head] of heads) {
    const extra = (parts.get(id) ?? []).sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
    const st = [...(head.st ?? []), ...extra.flatMap((e) => e.st ?? [])];
    const { parts: _p, ...rest } = head;
    out.push({ ...rest, st });
  }
  return out;
}

