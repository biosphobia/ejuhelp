import type { Page, Stroke } from './board';

/**
 * A few numbers that describe how this student writes, measured from their own
 * ink. Used to render tidied text so it looks like their hand rather than a font:
 * their slant, their letter size, their line spacing, how steady the line is,
 * and how thick their pen is.
 */
export interface HandStyle {
  /** Slant of near-vertical strokes in radians (positive = leaning right). */
  slant: number;
  /** Typical character height in world units. */
  size: number;
  /** Baseline-to-baseline distance as a multiple of size. */
  lineGap: number;
  /** 0 = ruler-straight, 1 = very shaky. */
  wobble: number;
  /** Pen width the student uses most. */
  width: number;
  /** Horizontal spacing factor (1 = normal). */
  spacing: number;
}

export const DEFAULT_HAND: HandStyle = { slant: 0.08, size: 24, lineGap: 1.5, wobble: 0.35, width: 3, spacing: 1 };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};

/** Strokes that look like handwriting (small, not long diagram lines). */
function inkStrokes(page: Page): Stroke[] {
  return page.strokes.filter((s) => !s.shape && s.points.length >= 3);
}

/** Measure the student's handwriting on a page. Null when there is not enough ink. */
export function measureHandStyle(page: Page): HandStyle | null {
  const strokes = inkStrokes(page);
  if (strokes.length < 12) return null;

  const heights: number[] = [];
  const widths: number[] = [];
  const centresY: number[] = [];
  const slants: number[] = [];
  const wobbles: number[] = [];
  const penWidths: number[] = [];

  for (const s of strokes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of s.points) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    const h = maxY - minY, w = maxX - minX;
    if (h > 400 || w > 600) continue; // a diagram line, not a letter
    heights.push(h);
    widths.push(w);
    centresY.push((minY + maxY) / 2);
    penWidths.push(s.size);
    // Slant: direction of segments that are mostly vertical.
    for (let i = 1; i < s.points.length; i++) {
      const dx = s.points[i].x - s.points[i - 1].x;
      const dy = s.points[i].y - s.points[i - 1].y;
      if (Math.abs(dy) > Math.abs(dx) * 1.5 && Math.abs(dy) > 4) slants.push(Math.atan2(dx * Math.sign(dy), Math.abs(dy)));
    }
    // Wobble: how far points stray from the straight chord between neighbours two apart.
    for (let i = 2; i < s.points.length; i++) {
      const a = s.points[i - 2], b = s.points[i], m = s.points[i - 1];
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      const d = Math.hypot(m.x - cx, m.y - cy);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      wobbles.push(d / len);
    }
  }
  if (heights.length < 10) return null;

  // Letter size: the typical stroke height, but a character is usually taller
  // than one stroke, so take the upper-middle of the distribution.
  const hs = [...heights].sort((a, b) => a - b);
  const size = clamp(hs[Math.floor(hs.length * 0.7)] * 1.15, 12, 60);

  // Line gap: cluster stroke centres into rows, measure the typical row distance.
  const ys = [...centresY].sort((a, b) => a - b);
  const rows: number[] = [];
  let cur = ys[0], n = 1, sum = ys[0];
  for (let i = 1; i < ys.length; i++) {
    if (ys[i] - cur > size * 0.8) {
      rows.push(sum / n);
      sum = 0; n = 0;
    }
    cur = ys[i]; sum += ys[i]; n++;
  }
  rows.push(sum / n);
  const gaps: number[] = [];
  for (let i = 1; i < rows.length; i++) gaps.push(rows[i] - rows[i - 1]);
  const lineGap = gaps.length ? clamp(median(gaps) / size, 1.15, 2.4) : DEFAULT_HAND.lineGap;

  const slant = clamp(median(slants), -0.35, 0.45);
  const wobble = clamp((median(wobbles) - 0.02) * 12, 0, 1);
  const width = clamp(median(penWidths), 1.5, 8);
  const spacing = clamp(median(widths) / size, 0.55, 1.3) / 0.8;

  return { slant, size, lineGap, wobble, width, spacing: clamp(spacing, 1, 1.25) };
}

/** Running blend so the style settles over many pages instead of jumping. */
export function blendHandStyle(prev: HandStyle | null | undefined, next: HandStyle, weight = 0.35): HandStyle {
  if (!prev) return next;
  const mix = (a: number, b: number) => a + (b - a) * weight;
  return {
    slant: mix(prev.slant, next.slant),
    size: mix(prev.size, next.size),
    lineGap: mix(prev.lineGap, next.lineGap),
    wobble: mix(prev.wobble, next.wobble),
    width: mix(prev.width, next.width),
    spacing: mix(prev.spacing, next.spacing),
  };
}
