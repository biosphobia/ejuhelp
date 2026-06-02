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

// Fast ink renderer: a smoothed polyline with round caps/joins. Much cheaper than
// recomputing a freehand outline polygon every frame — critical for smooth drawing
// on older iPads (1st-gen Apple Pencil).
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const pts = stroke.points;
  if (!pts.length) return;
  if (stroke.shape) {
    drawShape(ctx, stroke);
    return;
  }
  const hex = INK_HEX[stroke.color];

  if (pts.length === 1) {
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, Math.max(0.75, stroke.size / 2), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.strokeStyle = hex;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  // Quadratic smoothing through midpoints removes the jaggy "connect-the-dots" look.
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
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
