import { useEffect, useRef } from 'react';
import {
  MAX_SCALE,
  MIN_SCALE,
  newId,
  useBoard,
  INK_HEX,
  type InkColor,
  type Pt,
  type ShapeKind,
} from '../lib/board';
import { useUI } from '../lib/ui';
import { useDebug } from '../lib/debug';
import { useSelection } from '../lib/selection';
import { drawStroke, strokeHit } from './render';
import { boardEvents } from './view';

const ERASER_RADIUS = 14; // screen px
const STYLUS_MAX = 14; // px: a lone touch this tiny (and positive) is treated as a stylus tip
const CENTER_PAD = 0.1; // when framing content, keep ~10% breathing room on each side
const MAX_FIT_SCALE = 2; // don't blow small content up past 2x when framing it

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    // desynchronized = low-latency canvas (skips compositor sync) — noticeably less pen lag.
    const ctx = canvas.getContext('2d', { desynchronized: true })!;
    const cache = document.createElement('canvas');
    const cctx = cache.getContext('2d')!;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    const vp = { ...useBoard.getState().getCurrentPage().viewport };
    let lastPageId = useBoard.getState().currentPageId;
    let cacheDirty = true;
    let rafId = 0;
    let skipInvalidate = false;
    let penSeen = false; // once we've seen a real "pen" pointer, trust it for drawing
    let lastPenDown = 0; // perf time of the most recent pen/mouse pointerdown

    // interaction state
    let drawing: { color: InkColor; size: number; points: Pt[] } | null = null;
    // shapes tool: rubber-band a shape between two world points, commit on release
    let shapeDraft:
      | { kind: ShapeKind; color: InkColor; size: number; start: { x: number; y: number }; cur: { x: number; y: number } }
      | null = null;
    let shapePointer: number | null = null;
    let erasing = false;
    const pendingErase = new Set<string>();
    let eraserScreen: { x: number; y: number } | null = null;
    let drawId: number | null = null;
    let drawKind: 'pen' | 'finger' | 'touch-pen' | null = null; 
    let activeStylusTouchId: number | null = null; 
    let touchPenStartTime = 0; // Ensures we don't upgrade stale/stuck touches
    let liveLastIdx = 0; // last live stroke point already painted incrementally

    const touches = new Map<number, { x: number; y: number }>();
    let gestureActive = false;
    let gesture: { cx: number; cy: number; dist: number; vx: number; vy: number; scale: number } | null = null;

    // ---- selection (select tool: marquee -> move / scale / rotate / delete) ----
    type Live = { tx: number; ty: number; scale: number; rot: number };
    const IDENT: Live = { tx: 0, ty: 0, scale: 1, rot: 0 };
    const HANDLE_HIT = 24; // screen px
    let selectedIds: string[] = [];
    let selBox: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
    let marquee: { x0: number; y0: number; x1: number; y1: number } | null = null; // world coords
    const manipHidden = new Set<string>();
    type SnapVal = { color: InkColor; size: number; points: Pt[]; shape?: ShapeKind };
    let manip:
      | {
          type: 'marquee' | 'move' | 'scale' | 'rotate' | 'vertex';
          pointerId: number;
          startWorld: { x: number; y: number };
          center: { x: number; y: number };
          startDist: number;
          startAngle: number;
          snapshot: Map<string, SnapVal>;
          live: Live;
          // vertex-edit only: which shape and corner are being dragged + its live points
          shapeId?: string;
          vertexIndex?: number;
          livePoints?: Pt[];
        }
      | null = null;

    // ---- geometry ----
    const rect = () => canvas.getBoundingClientRect();
    function toWorld(clientX: number, clientY: number) {
      const r = rect();
      return { x: (clientX - r.left - vp.x) / vp.scale, y: (clientY - r.top - vp.y) / vp.scale };
    }
    function localPt(clientX: number, clientY: number) {
      const r = rect();
      return { x: clientX - r.left, y: clientY - r.top };
    }
    function toWorldPt(t: Touch): Pt {
      const w = toWorld(t.clientX, t.clientY);
      const f = (t as unknown as { force?: number }).force;
      return { x: w.x, y: w.y, p: typeof f === 'number' && f > 0 ? f : 0.5 };
    }
    const isStylus = (t: Touch) => (t as unknown as { touchType?: string }).touchType === 'stylus';
    function pressureFor(e: PointerEvent) {
      if (e.pointerType === 'pen') return e.pressure > 0 ? e.pressure : 0.5;
      return 0.5;
    }
    let lastMoveLog = 0;
    function dbg(e: PointerEvent) {
      if (!useDebug.getState().enabled) return;
      const w = Math.round(e.width || 0);
      const h = Math.round(e.height || 0);
      useDebug
        .getState()
        .push(`${e.type.replace('pointer', '')} ${e.pointerType} #${e.pointerId} p${(e.pressure || 0).toFixed(2)} ${w}x${h}`);
    }
    function setWorldTransform(c: CanvasRenderingContext2D) {
      c.setTransform(vp.scale * dpr, 0, 0, vp.scale * dpr, vp.x * dpr, vp.y * dpr);
    }

    // ---- rendering ----
    function drawGrid(c: CanvasRenderingContext2D) {
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      const step = 40;
      if (step * vp.scale < 12) return;
      const x0 = Math.floor(-vp.x / vp.scale / step) * step;
      const y0 = Math.floor(-vp.y / vp.scale / step) * step;
      const x1 = (cssW - vp.x) / vp.scale;
      const y1 = (cssH - vp.y) / vp.scale;
      c.strokeStyle = '#eef2f7';
      c.lineWidth = 1 / vp.scale;
      c.beginPath();
      for (let x = x0; x <= x1; x += step) {
        c.moveTo(x, y0);
        c.lineTo(x, y1);
      }
      for (let y = y0; y <= y1; y += step) {
        c.moveTo(x0, y);
        c.lineTo(x1, y);
      }
      c.stroke();
    }

    function renderCache() {
      cctx.setTransform(1, 0, 0, 1, 0, 0);
      cctx.clearRect(0, 0, cache.width, cache.height);
      cctx.fillStyle = '#ffffff';
      cctx.fillRect(0, 0, cache.width, cache.height);
      setWorldTransform(cctx);
      drawGrid(cctx);
      const page = useBoard.getState().getCurrentPage();
      for (const s of page.strokes) {
        if (pendingErase.has(s.id) || manipHidden.has(s.id)) continue;
        drawStroke(cctx, s);
      }
      cacheDirty = false;
    }

    function render() {
      if (cacheDirty) renderCache();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cache, 0, 0);
      if (drawing && drawing.points.length) {
        setWorldTransform(ctx);
        drawStroke(ctx, { id: 'tmp', color: drawing.color, size: drawing.size, points: drawing.points });
      }
      if (shapeDraft) {
        setWorldTransform(ctx);
        drawStroke(ctx, {
          id: 'tmp',
          color: shapeDraft.color,
          size: shapeDraft.size,
          points: buildShapePoints(shapeDraft.kind, shapeDraft.start, shapeDraft.cur),
          shape: shapeDraft.kind,
        });
      }
      if (eraserScreen) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.beginPath();
        ctx.arc(eraserScreen.x, eraserScreen.y, ERASER_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(15,23,42,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // selected strokes, transformed live during a manipulation
      if (manip && manip.type !== 'marquee') {
        const mp = manip;
        setWorldTransform(ctx);
        if (mp.type === 'vertex' && mp.livePoints && mp.shapeId) {
          const s = mp.snapshot.get(mp.shapeId);
          if (s) drawStroke(ctx, { id: 'sel', color: s.color, size: s.size, points: mp.livePoints, shape: s.shape });
        } else {
          for (const [, s] of mp.snapshot) {
            drawStroke(ctx, {
              id: 'sel',
              color: s.color,
              size: s.size,
              shape: s.shape,
              points: s.points.map((p) => transformPoint(p, mp.center, mp.live)),
            });
          }
        }
      }

      // selection overlay (box, handles, marquee) in screen space
      if (useBoard.getState().tool === 'select') {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (marquee) {
          const a = worldToScreen(Math.min(marquee.x0, marquee.x1), Math.min(marquee.y0, marquee.y1));
          const b = worldToScreen(Math.max(marquee.x0, marquee.x1), Math.max(marquee.y0, marquee.y1));
          ctx.fillStyle = 'rgba(37,99,235,0.08)';
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const g = selScreenGeom();
        if (g && selectedIds.length) {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(g.corners[0].x, g.corners[0].y);
          for (let i = 1; i < 4; i++) ctx.lineTo(g.corners[i].x, g.corners[i].y);
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
          const es = editableShape();
          if (es) {
            // round handles sit on the shape's actual corners for individual editing
            const pts =
              manip && manip.type === 'vertex' && manip.livePoints ? manip.livePoints : es.points;
            for (const p of pts) drawHandle(worldToScreen(p.x, p.y), true);
          } else {
            for (const cpt of g.corners) drawHandle(cpt, false);
          }
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(g.topMid.x, g.topMid.y);
          ctx.lineTo(g.rotate.x, g.rotate.y);
          ctx.stroke();
          drawHandle(g.rotate, true);
          drawDelete(g.del);
        }
      }
    }

    function drawHandle(c2: { x: number; y: number }, circle: boolean) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (circle) ctx.arc(c2.x, c2.y, 7, 0, Math.PI * 2);
      else ctx.rect(c2.x - 6, c2.y - 6, 12, 12);
      ctx.fill();
      ctx.stroke();
    }
    function drawDelete(c2: { x: number; y: number }) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(c2.x, c2.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c2.x - 4, c2.y - 4);
      ctx.lineTo(c2.x + 4, c2.y + 4);
      ctx.moveTo(c2.x + 4, c2.y - 4);
      ctx.lineTo(c2.x - 4, c2.y + 4);
      ctx.stroke();
    }

    // Synchronous paint — lowest latency for the active stroke (no rAF wait).
    function paintNow() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      render();
    }
    function schedule() {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          render();
        });
      }
    }
    // Paint now (low latency) AND queue one rAF frame, so a static result like a
    // single dot is actually presented on the desynchronized (low-latency) canvas.
    function commitPresent() {
      paintNow();
      schedule();
    }
    function invalidate() {
      cacheDirty = true;
      schedule();
    }
    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      cache.width = canvas.width;
      cache.height = canvas.height;
      invalidate();
    }

    // ---- strokes ----
    function doErase(wx: number, wy: number) {
      const r = ERASER_RADIUS / vp.scale;
      const page = useBoard.getState().getCurrentPage();
      let changed = false;
      for (const s of page.strokes) {
        if (!pendingErase.has(s.id) && strokeHit(s, wx, wy, r)) {
          pendingErase.add(s.id);
          changed = true;
        }
      }
      if (changed) cacheDirty = true;
    }

    function beginStroke(e: PointerEvent, kind: 'pen' | 'finger') {
      lastPenDown = performance.now(); // mark that the pointer system handled this interaction
      drawId = e.pointerId;
      drawKind = kind;
      const { tool, color, size } = useBoard.getState();
      const w = toWorld(e.clientX, e.clientY);
      if (tool === 'eraser') {
        erasing = true;
        eraserScreen = localPt(e.clientX, e.clientY);
        doErase(w.x, w.y);
      } else {
        drawing = { color, size, points: [{ x: w.x, y: w.y, p: pressureFor(e) }] };
        liveLastIdx = 0;
      }
    }

    // Draw only the newest segment(s) of the in-progress stroke directly onto the
    // canvas (no full clear/blit) — the lowest-latency path for live ink.
    function drawLiveSegments() {
      if (!drawing) return;
      const pts = drawing.points;
      if (pts.length < 2 || liveLastIdx >= pts.length - 1) {
        liveLastIdx = Math.max(liveLastIdx, pts.length - 1);
        return;
      }
      setWorldTransform(ctx);
      ctx.strokeStyle = INK_HEX[drawing.color];
      ctx.lineWidth = drawing.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[liveLastIdx].x, pts[liveLastIdx].y);
      for (let i = liveLastIdx + 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      liveLastIdx = pts.length - 1;
    }

    function endStroke() {
      if (drawing) {
        if (drawing.points.length >= 1) {
          const committed = { id: newId(), color: drawing.color, size: drawing.size, points: drawing.points };
          setWorldTransform(cctx);
          drawStroke(cctx, committed); // bake into cache (O(1), no full rebuild)
          skipInvalidate = true;
          useBoard.getState().addStroke(committed);
          skipInvalidate = false;
        }
        drawing = null;
        drawId = null;
        drawKind = null;
        activeStylusTouchId = null; // SAFEGUARD: clean up ghost touches
        commitPresent();
        return;
      }
      if (erasing) {
        erasing = false;
        eraserScreen = null;
        if (pendingErase.size) {
          useBoard.getState().eraseStrokes([...pendingErase]);
          pendingErase.clear();
        }
        invalidate();
      }
      drawId = null;
      drawKind = null;
      activeStylusTouchId = null; // SAFEGUARD: clean up ghost touches
    }

    function abortStroke() {
      drawing = null;
      erasing = false;
      eraserScreen = null;
      pendingErase.clear();
      drawId = null;
      drawKind = null;
      activeStylusTouchId = null;
      invalidate();
    }

    // ---- shapes tool ----
    // Build the corner/outline points for a shape from the drag bounding box.
    // Triangle/square are their literal corners; a circle is sampled as a polygon.
    function buildShapePoints(kind: ShapeKind, a: { x: number; y: number }, b: { x: number; y: number }): Pt[] {
      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      const minY = Math.min(a.y, b.y);
      const maxY = Math.max(a.y, b.y);
      const P = (x: number, y: number): Pt => ({ x, y, p: 0.5 });
      if (kind === 'square') {
        return [P(minX, minY), P(maxX, minY), P(maxX, maxY), P(minX, maxY)];
      }
      if (kind === 'triangle') {
        return [P((minX + maxX) / 2, minY), P(maxX, maxY), P(minX, maxY)];
      }
      // circle: ellipse inscribed in the drag box, sampled as a smooth polygon
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = (maxX - minX) / 2;
      const ry = (maxY - minY) / 2;
      const N = 48;
      const out: Pt[] = [];
      for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        out.push(P(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry));
      }
      return out;
    }

    function startShape(e: PointerEvent) {
      shapePointer = e.pointerId;
      const { color, size, shape } = useBoard.getState();
      const w = toWorld(e.clientX, e.clientY);
      shapeDraft = { kind: shape, color, size, start: { x: w.x, y: w.y }, cur: { x: w.x, y: w.y } };
    }

    function endShape() {
      const d = shapeDraft;
      shapeDraft = null;
      shapePointer = null;
      if (d) {
        // ignore accidental taps that didn't actually drag out a shape
        const drag = Math.hypot(d.cur.x - d.start.x, d.cur.y - d.start.y) * vp.scale;
        if (drag >= 4) {
          const committed = {
            id: newId(),
            color: d.color,
            size: d.size,
            points: buildShapePoints(d.kind, d.start, d.cur),
            shape: d.kind,
          };
          setWorldTransform(cctx);
          drawStroke(cctx, committed); // bake into cache (no full rebuild)
          skipInvalidate = true;
          useBoard.getState().addStroke(committed);
          skipInvalidate = false;
        }
      }
      commitPresent();
    }

    function abortShape() {
      shapeDraft = null;
      shapePointer = null;
      invalidate();
    }

    // ---- gestures (touch navigation: 1 finger pan, 2 fingers pinch-scale) ----
    function readGesture() {
      const r = rect();
      const locals = [...touches.values()].map((p) => ({ x: p.x - r.left, y: p.y - r.top }));
      const n = locals.length;
      const cx = locals.reduce((a, b) => a + b.x, 0) / n;
      const cy = locals.reduce((a, b) => a + b.y, 0) / n;
      const dist = n >= 2 ? Math.hypot(locals[0].x - locals[1].x, locals[0].y - locals[1].y) : 0;
      return { cx, cy, dist, n };
    }
    function startGesture() {
      if (touches.size === 0) return;
      const g = readGesture();
      gesture = { cx: g.cx, cy: g.cy, dist: g.dist, vx: vp.x, vy: vp.y, scale: vp.scale };
    }
    function updateGesture() {
      if (!gesture) {
        startGesture();
        return;
      }
      const g = readGesture();
      const anchorX = (gesture.cx - gesture.vx) / gesture.scale;
      const anchorY = (gesture.cy - gesture.vy) / gesture.scale;
      let scale = gesture.scale;
      if (g.n >= 2 && gesture.dist > 0) scale = clamp(gesture.scale * (g.dist / gesture.dist), MIN_SCALE, MAX_SCALE);
      vp.scale = scale;
      vp.x = g.cx - anchorX * scale;
      vp.y = g.cy - anchorY * scale;
      invalidate();
    }
    function commitViewport() {
      useBoard.getState().setViewport({ scale: vp.scale, x: vp.x, y: vp.y });
    }
    function cancelGesture() {
      gestureActive = false;
      gesture = null;
    }

    // ---- selection helpers ----
    function worldToScreen(wx: number, wy: number) {
      return { x: wx * vp.scale + vp.x, y: wy * vp.scale + vp.y };
    }
    function transformPoint(p: Pt, c: { x: number; y: number }, live: Live): Pt {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const cos = Math.cos(live.rot);
      const sin = Math.sin(live.rot);
      return {
        x: c.x + (dx * cos - dy * sin) * live.scale + live.tx,
        y: c.y + (dx * sin + dy * cos) * live.scale + live.ty,
        p: p.p,
      };
    }
    function computeSelBox(ids: string[]) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      const idset = new Set(ids);
      for (const s of useBoard.getState().getCurrentPage().strokes) {
        if (!idset.has(s.id)) continue;
        for (const p of s.points) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
      }
      return minX === Infinity ? null : { minX, minY, maxX, maxY };
    }
    function selScreenGeom() {
      if (!selBox) return null;
      const c =
        manip && manip.type !== 'marquee'
          ? manip.center
          : { x: (selBox.minX + selBox.maxX) / 2, y: (selBox.minY + selBox.maxY) / 2 };
      const live = manip && manip.type !== 'marquee' ? manip.live : IDENT;
      const cw = [
        { x: selBox.minX, y: selBox.minY },
        { x: selBox.maxX, y: selBox.minY },
        { x: selBox.maxX, y: selBox.maxY },
        { x: selBox.minX, y: selBox.maxY },
      ];
      const corners = cw.map((p) => {
        const tp = transformPoint({ x: p.x, y: p.y, p: 0 }, c, live);
        return worldToScreen(tp.x, tp.y);
      });
      const topMid = { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 };
      const cs = worldToScreen(c.x + live.tx, c.y + live.ty);
      let dx = topMid.x - cs.x;
      let dy = topMid.y - cs.y;
      const L = Math.hypot(dx, dy) || 1;
      dx /= L;
      dy /= L;
      const rotate = { x: topMid.x + dx * 34, y: topMid.y + dy * 34 };
      const del = { x: corners[1].x + 16, y: corners[1].y - 16 };
      return { corners, topMid, rotate, del };
    }
    // The single selected shape whose corners can be edited individually.
    // Circles are sampled polygons (too many points to edit by hand), so they
    // fall back to the regular scale/rotate handles.
    function editableShape() {
      if (selectedIds.length !== 1) return null;
      const s = useBoard.getState().getCurrentPage().strokes.find((x) => x.id === selectedIds[0]);
      if (!s || !s.shape || s.shape === 'circle') return null;
      return s;
    }
    function resetSelection() {
      selectedIds = [];
      selBox = null;
      marquee = null;
      manip = null;
      manipHidden.clear();
      useSelection.getState().set([]); // tell the coach there's no active selection
    }
    function clearSelection() {
      resetSelection();
      invalidate();
    }
    function cancelManip() {
      manip = null;
      marquee = null;
      manipHidden.clear();
    }
    function beginManip(type: 'move' | 'scale' | 'rotate', pointerId: number, world: { x: number; y: number }) {
      if (!selBox) return;
      const center = { x: (selBox.minX + selBox.maxX) / 2, y: (selBox.minY + selBox.maxY) / 2 };
      const snapshot = new Map<string, SnapVal>();
      const idset = new Set(selectedIds);
      for (const s of useBoard.getState().getCurrentPage().strokes) {
        if (idset.has(s.id)) snapshot.set(s.id, { color: s.color, size: s.size, points: s.points, shape: s.shape });
      }
      manipHidden.clear();
      for (const id of selectedIds) manipHidden.add(id);
      manip = {
        type,
        pointerId,
        startWorld: world,
        center,
        startDist: Math.hypot(world.x - center.x, world.y - center.y) || 1,
        startAngle: Math.atan2(world.y - center.y, world.x - center.x),
        snapshot,
        live: { ...IDENT },
      };
      invalidate();
    }
    function beginVertex(pointerId: number, world: { x: number; y: number }, shapeId: string, index: number) {
      const s = useBoard.getState().getCurrentPage().strokes.find((x) => x.id === shapeId);
      if (!s) return;
      const snapshot = new Map<string, SnapVal>();
      snapshot.set(s.id, { color: s.color, size: s.size, points: s.points, shape: s.shape });
      manipHidden.clear();
      manipHidden.add(s.id);
      manip = {
        type: 'vertex',
        pointerId,
        startWorld: world,
        center: { x: 0, y: 0 },
        startDist: 0,
        startAngle: 0,
        snapshot,
        live: { ...IDENT },
        shapeId: s.id,
        vertexIndex: index,
        livePoints: s.points.slice(),
      };
      invalidate();
    }
    function startSelect(e: PointerEvent) {
      const local = localPt(e.clientX, e.clientY);
      const world = toWorld(e.clientX, e.clientY);
      if (selBox && selectedIds.length) {
        const g = selScreenGeom();
        if (g) {
          const near = (h: { x: number; y: number }) => Math.hypot(local.x - h.x, local.y - h.y) <= HANDLE_HIT;
          if (near(g.del)) {
            useBoard.getState().eraseStrokes(selectedIds);
            clearSelection();
            return;
          }
          if (near(g.rotate)) return beginManip('rotate', e.pointerId, world);
          // Editable shape: drag a corner to reshape it; otherwise corners scale.
          const es = editableShape();
          if (es) {
            for (let i = 0; i < es.points.length; i++) {
              const sp = worldToScreen(es.points[i].x, es.points[i].y);
              if (near(sp)) return beginVertex(e.pointerId, world, es.id, i);
            }
          } else if (g.corners.some(near)) {
            return beginManip('scale', e.pointerId, world);
          }
          if (world.x >= selBox.minX && world.x <= selBox.maxX && world.y >= selBox.minY && world.y <= selBox.maxY) {
            return beginManip('move', e.pointerId, world);
          }
        }
      }
      // start a fresh marquee
      resetSelection();
      marquee = { x0: world.x, y0: world.y, x1: world.x, y1: world.y };
      manip = {
        type: 'marquee',
        pointerId: e.pointerId,
        startWorld: world,
        center: { x: 0, y: 0 },
        startDist: 0,
        startAngle: 0,
        snapshot: new Map(),
        live: { ...IDENT },
      };
      invalidate();
    }
    function updateSelect(e: PointerEvent) {
      if (!manip) return;
      const world = toWorld(e.clientX, e.clientY);
      if (manip.type === 'marquee') {
        if (marquee) {
          marquee.x1 = world.x;
          marquee.y1 = world.y;
        }
        invalidate();
        return;
      }
      if (manip.type === 'vertex') {
        const snap = manip.snapshot.get(manip.shapeId!);
        if (snap && manip.vertexIndex != null) {
          const pts = snap.points.map((p) => ({ ...p }));
          pts[manip.vertexIndex] = { x: world.x, y: world.y, p: pts[manip.vertexIndex].p };
          manip.livePoints = pts;
        }
        paintNow();
        return;
      }
      const c = manip.center;
      if (manip.type === 'move') {
        manip.live = { tx: world.x - manip.startWorld.x, ty: world.y - manip.startWorld.y, scale: 1, rot: 0 };
      } else if (manip.type === 'scale') {
        manip.live = { tx: 0, ty: 0, scale: clamp(Math.hypot(world.x - c.x, world.y - c.y) / manip.startDist, 0.1, 20), rot: 0 };
      } else {
        manip.live = { tx: 0, ty: 0, scale: 1, rot: Math.atan2(world.y - c.y, world.x - c.x) - manip.startAngle };
      }
      paintNow();
    }
    function endSelect() {
      if (!manip) return;
      if (manip.type === 'marquee') {
        const m = marquee;
        marquee = null;
        manip = null;
        if (m) {
          const minX = Math.min(m.x0, m.x1);
          const maxX = Math.max(m.x0, m.x1);
          const minY = Math.min(m.y0, m.y1);
          const maxY = Math.max(m.y0, m.y1);
          const ids = useBoard
            .getState()
            .getCurrentPage()
            .strokes.filter((s) => s.points.some((p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY))
            .map((s) => s.id);
          selectedIds = ids;
          selBox = ids.length ? computeSelBox(ids) : null;
          useSelection.getState().set(ids.slice()); // expose the selection to the coach
        }
        invalidate();
        return;
      }
      if (manip.type === 'vertex') {
        const sid = manip.shapeId!;
        const pts = manip.livePoints!;
        manipHidden.clear();
        manip = null;
        useBoard.getState().updateStrokes([{ id: sid, points: pts }]);
        selBox = computeSelBox(selectedIds);
        invalidate();
        return;
      }
      const live = manip.live;
      const c = manip.center;
      const updates: { id: string; points: Pt[] }[] = [];
      for (const [id, s] of manip.snapshot) updates.push({ id, points: s.points.map((p) => transformPoint(p, c, live)) });
      manipHidden.clear();
      manip = null;
      if (updates.length) useBoard.getState().updateStrokes(updates);
      selBox = computeSelBox(selectedIds);
      invalidate();
    }

    // ---- pointer events ----
    function onPointerDown(e: PointerEvent) {
      dbg(e);
      if (e.pointerType === 'pen') {
        penSeen = true;
        e.preventDefault();
      }

      // SELECT tool: pen/mouse/single-touch manipulate the selection; two fingers pan/zoom.
      if (useBoard.getState().tool === 'select') {
        if (e.pointerType === 'touch') {
          touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (touches.size >= 2) {
            cancelManip();
            gestureActive = true;
            startGesture();
            invalidate();
            return;
          }
        } else {
          lastPenDown = performance.now();
        }
        startSelect(e);
        return;
      }

      // SHAPES tool: pen/mouse/single-touch rubber-band a shape; two fingers pan/zoom.
      if (useBoard.getState().tool === 'shapes') {
        if (e.pointerType === 'pen' || e.pointerType === 'mouse') {
          lastPenDown = performance.now();
          cancelGesture();
          if (shapeDraft) abortShape();
          startShape(e);
          commitPresent();
          return;
        }
        // touch
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size >= 2) {
          if (shapeDraft) abortShape();
          gestureActive = true;
          startGesture();
          return;
        }
        const fingerDraw = useUI.getState().fingerDraw;
        const tinyStylus =
          !penSeen && e.width > 0 && e.width <= STYLUS_MAX && e.height > 0 && e.height <= STYLUS_MAX;
        if (fingerDraw || tinyStylus) {
          startShape(e);
          commitPresent();
        } else {
          gestureActive = true; // single-finger pan
          startGesture();
        }
        return;
      }

      // Pen / mouse always draw and take priority.
      if (e.pointerType === 'pen' || e.pointerType === 'mouse') {
        lastPenDown = performance.now();
        cancelGesture();
        
        // UPGRADE: If a raw touch event recently instantly started this stroke,
        // seamlessly transition it to the high-fidelity pointer tracker.
        // We enforce a 200ms time limit to ensure we don't accidentally merge with an old, stuck touch.
        const isRecentTouch = performance.now() - touchPenStartTime < 200;
        if (drawId !== null && drawKind === 'touch-pen' && e.pointerType === 'pen' && isRecentTouch) {
            drawId = e.pointerId;
            drawKind = 'pen';
            activeStylusTouchId = null; // CRITICAL: Detach the touch so touchend doesn't violently kill this stroke
            
            const w = toWorld(e.clientX, e.clientY);
            if (drawing) {
                drawing.points.push({ x: w.x, y: w.y, p: pressureFor(e) });
                drawLiveSegments();
            }
            return;
        }

        // Finish any previous stroke first. 
        // If an old 'touch-pen' ghost state got stuck and wasn't caught by the upgrade above, safely abort it.
        if (drawId !== null) {
          if (drawKind === 'finger' || drawKind === 'touch-pen') abortStroke();
          else endStroke();
        }
        
        beginStroke(e, 'pen');
        commitPresent();
        return;
      }

      // TOUCH ────────────────────────────────────────────────
      // While a stylus is drawing, ignore touches entirely (palm rejection).
      if (drawId !== null && drawKind === 'pen') return;

      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const fingerDraw = useUI.getState().fingerDraw;

      if (touches.size >= 2) {
        if (drawId !== null) abortStroke(); // a 1-finger draw becomes a gesture
        gestureActive = true;
        startGesture();
        return;
      }

      // exactly one touch
      const tinyStylus =
        !penSeen && e.width > 0 && e.width <= STYLUS_MAX && e.height > 0 && e.height <= STYLUS_MAX;
      if (fingerDraw) {
        beginStroke(e, 'finger');
        commitPresent();
      } else if (tinyStylus) {
        beginStroke(e, 'pen'); // a touch-reported stylus tip
        commitPresent();
      } else {
        gestureActive = true; // single-finger pan
        startGesture();
      }
    }

    function onPointerMove(e: PointerEvent) {
      const now = performance.now();
      if (now - lastMoveLog > 120) {
        lastMoveLog = now;
        dbg(e);
      }
      if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (manip && manip.pointerId === e.pointerId) {
        updateSelect(e);
        return;
      }

      if (shapeDraft && shapePointer === e.pointerId) {
        const w = toWorld(e.clientX, e.clientY);
        shapeDraft.cur = { x: w.x, y: w.y };
        paintNow();
        return;
      }

      if (drawId === e.pointerId && (drawing || erasing)) {
        if (drawing) {
          const evs =
            typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length
              ? e.getCoalescedEvents()
              : [e];
          for (const ce of evs) {
            const w = toWorld(ce.clientX, ce.clientY);
            drawing.points.push({ x: w.x, y: w.y, p: pressureFor(ce) });
          }
          drawLiveSegments(); // incremental, low-latency
        } else {
          eraserScreen = localPt(e.clientX, e.clientY);
          const w = toWorld(e.clientX, e.clientY);
          doErase(w.x, w.y);
          paintNow();
        }
        return;
      }

      if (e.pointerType === 'touch' && gestureActive && touches.has(e.pointerId)) updateGesture();
    }

    function endPointer(e: PointerEvent) {
      dbg(e);
      if (manip && manip.pointerId === e.pointerId) {
        if (e.pointerType === 'touch') touches.delete(e.pointerId);
        endSelect();
        return;
      }
      if (shapeDraft && shapePointer === e.pointerId) {
        if (e.pointerType === 'touch') touches.delete(e.pointerId);
        endShape();
        return;
      }
      const penUp = e.pointerType === 'pen' || e.pointerType === 'mouse';
      if (drawId !== null && (drawId === e.pointerId || (drawKind === 'pen' && penUp))) {
        if (e.pointerType === 'touch') touches.delete(e.pointerId);
        endStroke();
        return;
      }
      // One of our gesture fingers lifted.
      if (e.pointerType === 'touch') {
        const wasOurs = touches.delete(e.pointerId);
        if (gestureActive && wasOurs) {
          if (touches.size === 0) {
            cancelGesture();
            commitViewport();
          } else {
            startGesture(); // rebaseline remaining finger(s)
          }
        }
      }
    }

    // ---- Proactive touch handling for instant Apple Pencil response ----
    function onTouchStart(e: TouchEvent) {
      let hasStylus = false;
      for (const t of Array.from(e.changedTouches)) {
        if (isStylus(t)) hasStylus = true;
      }
      if (hasStylus && e.cancelable) e.preventDefault();

      for (const t of Array.from(e.changedTouches)) {
        if (!isStylus(t)) continue;
        
        const activeTool = useBoard.getState().tool;
        if (drawId === null && activeTool !== 'select' && activeTool !== 'shapes') {
           const w = toWorldPt(t);
           const { tool, color, size } = useBoard.getState();
           if (tool === 'eraser') {
               erasing = true;
               eraserScreen = localPt(t.clientX, t.clientY);
               doErase(w.x, w.y);
           } else {
               drawing = { color, size, points: [w] };
               liveLastIdx = 0;
           }
           drawId = t.identifier;
           drawKind = 'touch-pen';
           activeStylusTouchId = t.identifier;
           touchPenStartTime = performance.now();
           commitPresent();
        }
      }
    }

    function onTouchMove(e: TouchEvent) {
      let hasStylus = false;
      for (const t of Array.from(e.changedTouches)) {
        if (isStylus(t)) hasStylus = true;
      }
      if (hasStylus && e.cancelable) e.preventDefault();

      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === activeStylusTouchId && drawKind === 'touch-pen') {
           if (drawing) {
               drawing.points.push(toWorldPt(t));
               drawLiveSegments();
           } else if (erasing) {
               eraserScreen = localPt(t.clientX, t.clientY);
               const w = toWorldPt(t);
               doErase(w.x, w.y);
               paintNow();
           }
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === activeStylusTouchId) {
           // ONLY commit if Safari hasn't cleanly handed this off to a Pointer event yet
           if (drawKind === 'touch-pen') {
               endStroke();
           }
           activeStylusTouchId = null;
        }
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const l = localPt(e.clientX, e.clientY);
      const anchorX = (l.x - vp.x) / vp.scale;
      const anchorY = (l.y - vp.y) / vp.scale;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const scale = clamp(vp.scale * factor, MIN_SCALE, MAX_SCALE);
      vp.scale = scale;
      vp.x = l.x - anchorX * scale;
      vp.y = l.y - anchorY * scale;
      commitViewport();
      invalidate();
    }

    const stop = (e: Event) => e.preventDefault();

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('gesturestart', stop as EventListener);
    canvas.addEventListener('gesturechange', stop as EventListener);
    canvas.addEventListener('gestureend', stop as EventListener);

    // "Center" button: frame everything drawn on the current page rather than
    // jumping back to the origin. Fit the strokes' bounding box into the viewport
    // (with a small margin) and center on it — zooming out as far as needed so
    // even very large content fits. An empty page falls back to the origin view.
    const onReset = () => {
      const strokes = useBoard.getState().getCurrentPage().strokes;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const s of strokes) {
        for (const p of s.points) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
      }
      if (minX === Infinity) {
        // nothing drawn — return to the default starting view
        vp.scale = 1;
        vp.x = 0;
        vp.y = 0;
      } else {
        const W = canvas.clientWidth;
        const H = canvas.clientHeight;
        const availW = Math.max(1, W * (1 - 2 * CENTER_PAD));
        const availH = Math.max(1, H * (1 - 2 * CENTER_PAD));
        const cw = maxX - minX;
        const ch = maxY - minY;
        // Largest scale that fits both dimensions; a zero-width/height extent
        // (single point or perfectly straight line) imposes no constraint.
        const sx = cw > 0 ? availW / cw : Infinity;
        const sy = ch > 0 ? availH / ch : Infinity;
        let scale = Math.min(sx, sy);
        if (!isFinite(scale)) scale = 1; // single point: keep natural size
        scale = clamp(Math.min(scale, MAX_FIT_SCALE), MIN_SCALE, MAX_SCALE);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        vp.scale = scale;
        vp.x = W / 2 - cx * scale;
        vp.y = H / 2 - cy * scale;
      }
      commitViewport();
      invalidate();
    };
    boardEvents.addEventListener('reset', onReset);

    const unsub = useBoard.subscribe((st) => {
      if (st.currentPageId !== lastPageId) {
        lastPageId = st.currentPageId;
        const pg = st.pages.find((p) => p.id === st.currentPageId);
        if (pg) {
          vp.scale = pg.viewport.scale;
          vp.x = pg.viewport.x;
          vp.y = pg.viewport.y;
        }
        pendingErase.clear();
        drawing = null;
        shapeDraft = null;
        shapePointer = null;
        erasing = false;
        eraserScreen = null;
        drawId = null;
        drawKind = null;
        activeStylusTouchId = null;
        cancelGesture();
        touches.clear();
        resetSelection();
        invalidate();
        return;
      }
      if (st.tool !== 'select' && (selectedIds.length || marquee || manip)) {
        resetSelection();
      }
      if (st.tool !== 'shapes' && shapeDraft) {
        shapeDraft = null;
        shapePointer = null;
      }
      if (skipInvalidate) {
        schedule();
        return;
      }
      invalidate();
    });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endPointer);
      window.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('gesturestart', stop as EventListener);
      canvas.removeEventListener('gesturechange', stop as EventListener);
      canvas.removeEventListener('gestureend', stop as EventListener);
      boardEvents.removeEventListener('reset', onReset);
      unsub();
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas-surface absolute inset-0 h-full w-full touch-none" />;
}
