import { INK_HEX, type InkColor, type Pt, type Stroke, newId } from '../lib/board';

// A text note is a Stroke with `text` set. Its `points` are the 4 corners of the note's
// box (TL, TR, BR, BL) in world coordinates. Because the whole object is just those 4
// points, the existing selection tool moves / scales / rotates / duplicates / deletes it
// for free — we derive the font size and rotation from the box at render time.

export const NOTE_LINE_H = 1.4; // line height as a multiple of font size
const NOTE_PAD = 0.5; // horizontal + vertical padding, as a multiple of font size
const BASE_FONT = 18; // world units at creation (≈18px on screen at zoom 1)
const MAX_WIDTH = 320; // wrap width in world units at the base font
const FONT_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// A shared offscreen canvas just for measuring text widths.
let measureCtx: CanvasRenderingContext2D | null = null;
function measurer(): CanvasRenderingContext2D {
  if (!measureCtx) {
    const c = document.createElement('canvas');
    measureCtx = c.getContext('2d');
  }
  return measureCtx!;
}
function measure(line: string, font: number): number {
  const ctx = measurer();
  ctx.font = `${font}px ${FONT_STACK}`;
  return ctx.measureText(line).width;
}

/** Word-wrap `text` (honoring existing newlines) to at most `maxWidth` at `font`. */
function wrap(text: string, font: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.replace(/\r/g, '').split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push('');
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const next = `${line} ${words[i]}`;
      if (measure(next, font) <= maxWidth) line = next;
      else {
        out.push(line);
        line = words[i];
      }
    }
    out.push(line);
  }
  return out.length ? out : [''];
}

/** Build a text-note stroke, wrapped and centered on `center` (world coords). */
export function makeTextNote(text: string, color: InkColor, center: { x: number; y: number }): Stroke {
  const clean = (text || '').trim() || '…';
  const lines = wrap(clean, BASE_FONT, MAX_WIDTH);
  const pad = BASE_FONT * NOTE_PAD;
  const contentW = Math.max(1, ...lines.map((l) => measure(l, BASE_FONT)));
  const boxW = contentW + pad * 2;
  const boxH = lines.length * BASE_FONT * NOTE_LINE_H + pad * 2;
  const hw = boxW / 2;
  const hh = boxH / 2;
  const cx = center.x;
  const cy = center.y;
  const corner = (x: number, y: number): Pt => ({ x, y, p: 0.5 });
  return {
    id: newId(),
    color,
    size: BASE_FONT,
    text: lines.join('\n'),
    points: [
      corner(cx - hw, cy - hh), // TL
      corner(cx + hw, cy - hh), // TR
      corner(cx + hw, cy + hh), // BR
      corner(cx - hw, cy + hh), // BL
    ],
  };
}

function shiftNote(n: Stroke, dx: number, dy: number): Stroke {
  return { ...n, points: n.points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) };
}

/** Build ONE text note per line, stacked vertically and centered on `center`, so each row
 *  is an independent object the selection tool can move / edit on its own. */
export function makeTextNotes(text: string, color: InkColor, center: { x: number; y: number }): Stroke[] {
  const lines = (text || '').replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [makeTextNote(lines[0] ?? '…', color, center)];
  const gap = BASE_FONT * 0.3;
  // Build each row at the origin first, measure its height, then stack.
  const built = lines.map((l) => makeTextNote(l, color, { x: 0, y: 0 }));
  const heights = built.map((n) => textNoteGeom(n)?.boxH ?? BASE_FONT);
  const total = heights.reduce((a, b) => a + b, 0) + gap * (built.length - 1);
  let y = center.y - total / 2;
  const out: Stroke[] = [];
  for (let i = 0; i < built.length; i++) {
    const cy = y + heights[i] / 2;
    y += heights[i] + gap;
    out.push(shiftNote(built[i], center.x, cy));
  }
  return out;
}

interface NoteGeom {
  ox: number;
  oy: number;
  angle: number;
  boxW: number;
  boxH: number;
  font: number;
  lines: string[];
}

/** Derive the render geometry (origin, rotation, font size) from the box corners. */
export function textNoteGeom(stroke: Stroke): NoteGeom | null {
  const p = stroke.points;
  if (stroke.text == null || p.length < 4) return null;
  const [tl, tr, , bl] = p;
  const angle = Math.atan2(tr.y - tl.y, tr.x - tl.x);
  const boxW = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const boxH = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const lines = stroke.text.split('\n');
  // boxH = lines*font*LINE_H + 2*pad, pad = font*NOTE_PAD  → solve for font.
  const font = boxH / (lines.length * NOTE_LINE_H + 2 * NOTE_PAD);
  return { ox: tl.x, oy: tl.y, angle, boxW, boxH, font, lines };
}

const FILL_RGB: Record<string, string> = {
  '#111827': '17,24,39',
  '#dc2626': '220,38,38',
  '#2563eb': '37,99,235',
  '#16a34a': '22,163,74',
};

/** Draw a text note: a lightly-tinted rounded card with the wrapped text. */
export function drawTextNote(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const g = textNoteGeom(stroke);
  if (!g || g.font <= 0) return;
  const hex = INK_HEX[stroke.color];
  const rgb = FILL_RGB[hex] ?? '17,24,39';
  const pad = g.font * NOTE_PAD;
  const radius = Math.min(g.font * 0.6, g.boxW / 2, g.boxH / 2);

  ctx.save();
  ctx.translate(g.ox, g.oy);
  ctx.rotate(g.angle);

  // card background + border
  ctx.beginPath();
  roundRect(ctx, 0, 0, g.boxW, g.boxH, radius);
  ctx.fillStyle = `rgba(${rgb},0.08)`;
  ctx.fill();
  ctx.lineWidth = Math.max(0.5, g.font * 0.06);
  ctx.strokeStyle = `rgba(${rgb},0.45)`;
  ctx.stroke();

  // text
  ctx.fillStyle = hex;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = `${g.font}px ${FONT_STACK}`;
  for (let i = 0; i < g.lines.length; i++) {
    ctx.fillText(g.lines[i], pad, pad + i * g.font * NOTE_LINE_H);
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Eraser hit-test: is (x,y) within `r` of the note's (possibly rotated) box? */
export function textNoteHit(stroke: Stroke, x: number, y: number, r: number): boolean {
  const g = textNoteGeom(stroke);
  if (!g) return false;
  // transform the query point into the box's local frame
  const dx = x - g.ox;
  const dy = y - g.oy;
  const cos = Math.cos(-g.angle);
  const sin = Math.sin(-g.angle);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return lx >= -r && lx <= g.boxW + r && ly >= -r && ly <= g.boxH + r;
}
