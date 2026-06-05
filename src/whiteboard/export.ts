import { drawStroke } from './render';
import type { Page } from '../lib/board';

/**
 * Render a page's ink (ignoring current zoom/pan) to a white PNG data URL,
 * cropped to the content. Returns null if there's nothing to render.
 * `onlyIds` limits the render to those strokes (e.g. the current selection).
 */
export function exportPagePng(
  page: Page,
  opts?: { maxSide?: number; pad?: number; onlyIds?: string[] }
): string | null {
  const maxSide = opts?.maxSide ?? 1600;
  const pad = opts?.pad ?? 36;
  let strokes = page.strokes;
  if (opts?.onlyIds && opts.onlyIds.length) {
    const keep = new Set(opts.onlyIds);
    const sel = strokes.filter((s) => keep.has(s.id));
    if (sel.length) strokes = sel; // fall back to the whole page if nothing matched
  }
  if (!strokes.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    const half = s.size / 2 + 2;
    for (const p of s.points) {
      minX = Math.min(minX, p.x - half);
      minY = Math.min(minY, p.y - half);
      maxX = Math.max(maxX, p.x + half);
      maxY = Math.max(maxY, p.y + half);
    }
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const scale = Math.min(maxSide / (w + pad * 2), maxSide / (h + pad * 2), 3);
  const cw = Math.max(1, Math.round((w + pad * 2) * scale));
  const ch = Math.max(1, Math.round((h + pad * 2) * scale));

  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.setTransform(scale, 0, 0, scale, (pad - minX) * scale, (pad - minY) * scale);
  for (const s of strokes) drawStroke(ctx, s);
  return cv.toDataURL('image/png');
}
