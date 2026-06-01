import getStroke from 'perfect-freehand';
import { INK_HEX, type Pt, type Stroke } from '../lib/board';

// Convert a list of pressure points into a filled outline polygon.
export function strokeOutline(points: Pt[], size: number): number[][] {
  return getStroke(
    points.map((p) => [p.x, p.y, p.p]),
    {
      size,
      thinning: 0.55,
      smoothing: 0.5,
      streamline: 0.45,
      simulatePressure: false, // pressure is supplied (pen) or constant (mouse/touch)
      last: true,
    }
  ) as number[][];
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const outline = strokeOutline(stroke.points, stroke.size);
  if (outline.length < 2) return;
  ctx.fillStyle = INK_HEX[stroke.color];
  ctx.beginPath();
  ctx.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i][0], outline[i][1]);
  }
  ctx.closePath();
  ctx.fill();
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
  if (pts.length === 1) {
    return Math.hypot(pts[0].x - x, pts[0].y - y) <= reach;
  }
  for (let i = 1; i < pts.length; i++) {
    if (distToSegment(x, y, pts[i - 1], pts[i]) <= reach) return true;
  }
  return false;
}
