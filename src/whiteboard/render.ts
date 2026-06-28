import { getStroke } from 'perfect-freehand';
import { INK_HEX, type Pt, type Stroke } from '../lib/board';

// Translate one of the ink hex colors to an rgba string at the given alpha — used
// for the light interior fill of shapes.
const FILL_RGB: Record<string, string> = {
  '#111827': '17,24,39',
  '#dc2626': '220,38,38',
  '#2563eb': '37,99,235',
  '#16a34a': '22,163,74',
};
function fillFor(hex: string, alpha: number): string {
  return `rgba(${FILL_RGB[hex] ?? '17,24,39'},${alpha})`;
}

// Closed, lightly-filled polygon (triangle / square / sampled circle). Corners are
// the literal points, so straight edges stay crisp.
function drawShape(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const pts = stroke.points;
  if (pts.length < 2) return;
  const hex = INK_HEX[stroke.color];
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fillFor(hex, 0.16);
  ctx.fill();
  ctx.strokeStyle = hex;
  ctx.lineWidth = stroke.size;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

// perfect-freehand options tuned for a natural pen feel. `thinning` makes the line
// swell and taper with pressure/speed; `streamline`/`smoothing` iron out hand jitter
// without lagging the nib.
function freehandOptions(stroke: Stroke, hasRealPressure: boolean, live: boolean) {
  return {
    size: stroke.size * 1.15, // a touch bolder than the old constant width
    thinning: 0.62,
    smoothing: 0.55,
    streamline: 0.5,
    // Real stylus pressure when we have it; otherwise let the library infer pressure
    // from speed (fast = thin, slow = thick) so finger/mouse ink still has life.
    simulatePressure: !hasRealPressure,
    easing: (t: number) => t,
    start: { cap: true, taper: 0 },
    // Don't taper the moving end while the stroke is still being drawn.
    end: { cap: true, taper: 0 },
    last: !live,
  };
}

// Build a filled canvas path from a perfect-freehand outline using quadratic curves
// between the outline midpoints (the library's recommended smooth fill).
function fillOutline(ctx: CanvasRenderingContext2D, outline: number[][]) {
  if (outline.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i - 1];
    const [x1, y1] = outline[i];
    ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  ctx.closePath();
  ctx.fill();
}

/** Ink renderer. Freehand strokes are rendered as pressure/velocity-varying filled
 *  outlines (perfect-freehand) for a real-pen feel; geometric shapes stay crisp.
 *  Pass {live:true} while a stroke is still being drawn so its moving end isn't
 *  prematurely tapered. */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, opts?: { live?: boolean }) {
  const pts = stroke.points;
  if (!pts.length) return;
  if (stroke.shape) {
    drawShape(ctx, stroke);
    return;
  }
  const hex = INK_HEX[stroke.color];

  if (pts.length === 1) {
    // A tap: a single round dot sized to the pen.
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, Math.max(0.75, (stroke.size * 1.15) / 2), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const hasRealPressure = pts.some((p) => p.p !== pts[0].p);
  const input = pts.map((p) => [p.x, p.y, p.p] as [number, number, number]);
  const outline = getStroke(input, freehandOptions(stroke, hasRealPressure, opts?.live ?? false)) as number[][];
  if (outline.length < 2) return;
  ctx.fillStyle = hex;
  fillOutline(ctx, outline);
}

function distToSegment(px: number, py: number, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

/** True if the eraser circle (world coords, radius r) touches the stroke. */
export function strokeHit(stroke: Stroke, x: number, y: number, r: number): boolean {
  const reach = r + stroke.size / 2;
  const pts = stroke.points;
  if (pts.length === 1) return Math.hypot(pts[0].x - x, pts[0].y - y) <= reach;
  for (let i = 1; i < pts.length; i++) {
    if (distToSegment(x, y, pts[i - 1], pts[i]) <= reach) return true;
  }
  return false;
}
