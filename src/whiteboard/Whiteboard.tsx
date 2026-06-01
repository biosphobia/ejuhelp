import { useEffect, useRef } from 'react';
import {
  MAX_SCALE,
  MIN_SCALE,
  newId,
  useBoard,
  INK_HEX,
  type InkColor,
  type Pt,
} from '../lib/board';
import { useUI } from '../lib/ui';
import { useDebug } from '../lib/debug';
import { drawStroke, strokeHit } from './render';
import { boardEvents } from './view';

const ERASER_RADIUS = 14; // screen px
const STYLUS_MAX = 14; // px: a lone touch this tiny (and positive) is treated as a stylus tip

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
    // Apple Pencil quick taps can arrive as raw touch events ("stylus") with NO
    // pointer events. We record those here and draw them on touchend if the pointer
    // system never picked them up.
    const stylusTouches = new Map<number, { pts: Pt[]; t0: number }>();

    // interaction state
    let drawing: { color: InkColor; size: number; points: Pt[] } | null = null;
    let erasing = false;
    const pendingErase = new Set<string>();
    let eraserScreen: { x: number; y: number } | null = null;
    let drawId: number | null = null;
    let drawKind: 'pen' | 'finger' | null = null; // 'pen' = stylus/mouse (palm-rejecting)
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
    let manip:
      | {
          type: 'marquee' | 'move' | 'scale' | 'rotate';
          pointerId: number;
          startWorld: { x: number; y: number };
          center: { x: number; y: number };
          startDist: number;
          startAngle: number;
          snapshot: Map<string, { color: InkColor; size: number; points: Pt[] }>;
          live: Live;
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
        for (const [, s] of mp.snapshot) {
          drawStroke(ctx, {
            id: 'sel',
            color: s.color,
            size: s.size,
            points: s.points.map((p) => transformPoint(p, mp.center, mp.live)),
          });
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
          for (const cpt of g.corners) drawHandle(cpt, false);
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
    }
    function abortStroke() {
      drawing = null;
      erasing = false;
      eraserScreen = null;
      pendingErase.clear();
      drawId = null;
      drawKind = null;
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
    function resetSelection() {
      selectedIds = [];
      selBox = null;
      marquee = null;
      manip = null;
      manipHidden.clear();
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
      const snapshot = new Map<string, { color: InkColor; size: number; points: Pt[] }>();
      const idset = new Set(selectedIds);
      for (const s of useBoard.getState().getCurrentPage().strokes) {
        if (idset.has(s.id)) snapshot.set(s.id, { color: s.color, size: s.size, points: s.points });
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
          if (g.corners.some(near)) return beginManip('scale', e.pointerId, world);
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
        }
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
      if (e.pointerType === 'pen') penSeen = true;

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

      // Pen / mouse always draw and take priority.
      if (e.pointerType === 'pen' || e.pointerType === 'mouse') {
        lastPenDown = performance.now();
        cancelGesture();
        // Finish any previous stroke first, so a missed pointerup can't strand it:
        // commit a stuck stylus stroke; discard a stray finger/palm stroke.
        if (drawId !== null) {
          if (drawKind === 'finger') abortStroke();
          else endStroke();
        }
        // Deliberately NO e.preventDefault() and NO setPointerCapture here — both can
        // make iOS Safari drop the pointerup of a quick Pencil tap. touch-action:none
        // already blocks scrolling; window-level move/up keep strokes continuous.
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
      const penUp = e.pointerType === 'pen' || e.pointerType === 'mouse';
      // Commit the active draw. Tolerate a pointerId mismatch on pen/mouse up (iOS can
      // report a different id for up than down on a quick tap), but never let a
      // palm/finger lift end an active stylus stroke.
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

    // ---- raw touch fallback for Apple Pencil quick taps (no pointer events) ----
    function onTouchStart(e: TouchEvent) {
      for (const t of Array.from(e.changedTouches)) {
        if (!isStylus(t)) continue;
        stylusTouches.set(t.identifier, { pts: [toWorldPt(t)], t0: performance.now() });
        dbgTouch('Tdown', t);
      }
    }
    function onTouchMove(e: TouchEvent) {
      for (const t of Array.from(e.changedTouches)) {
        const ent = stylusTouches.get(t.identifier);
        if (ent) ent.pts.push(toWorldPt(t));
      }
    }
    function onTouchEnd(e: TouchEvent) {
      for (const t of Array.from(e.changedTouches)) {
        const ent = stylusTouches.get(t.identifier);
        if (!ent) continue;
        stylusTouches.delete(t.identifier);
        // If a pen pointer stroke is still open (its pointerup was dropped), commit it
        // now using the reliable touchend — catches the shortest taps/dashes.
        if ((drawing || erasing) && drawKind === 'pen') {
          dbgTouch('Tup(commit)', t, ent.pts.length);
          endStroke();
          continue;
        }
        const handledByPointer = lastPenDown >= ent.t0; // a pen pointerdown fired during this touch
        dbgTouch(handledByPointer ? 'Tup(ptr)' : 'Tup(draw)', t, ent.pts.length);
        if (handledByPointer) continue;
        // The pointer system never saw this stylus stroke — draw it ourselves.
        const { tool, color, size } = useBoard.getState();
        if (tool === 'select') continue; // don't inject strokes while selecting
        if (tool === 'eraser') {
          for (const p of ent.pts) doErase(p.x, p.y);
          if (pendingErase.size) {
            useBoard.getState().eraseStrokes([...pendingErase]);
            pendingErase.clear();
          }
          invalidate();
        } else {
          const stroke = { id: newId(), color, size, points: ent.pts };
          setWorldTransform(cctx);
          drawStroke(cctx, stroke);
          skipInvalidate = true;
          useBoard.getState().addStroke(stroke);
          skipInvalidate = false;
          commitPresent();
        }
      }
    }
    function dbgTouch(tag: string, t: Touch, n?: number) {
      if (!useDebug.getState().enabled) return;
      const f = (t as unknown as { force?: number }).force ?? 0;
      useDebug.getState().push(`${tag} #${t.identifier} f${f.toFixed(2)}${n !== undefined ? ` pts${n}` : ''}`);
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

    // pointerdown starts on the canvas; move/up listen on window so a stroke
    // continues even when the pointer crosses over the floating UI (no capture needed).
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);
    // Passive touch listeners: a fallback for Apple Pencil quick taps that emit no
    // pointer events. Passive (no preventDefault) so they don't suppress pointer events.
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('gesturestart', stop as EventListener);
    canvas.addEventListener('gesturechange', stop as EventListener);
    canvas.addEventListener('gestureend', stop as EventListener);

    const onReset = () => {
      vp.scale = 1;
      vp.x = 0;
      vp.y = 0;
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
        erasing = false;
        eraserScreen = null;
        drawId = null;
        drawKind = null;
        cancelGesture();
        touches.clear();
        resetSelection();
        invalidate();
        return;
      }
      // Leaving the select tool clears any active selection.
      if (st.tool !== 'select' && (selectedIds.length || marquee || manip)) {
        resetSelection();
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
