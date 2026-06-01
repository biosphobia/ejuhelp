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
    function pressureFor(e: PointerEvent) {
      if (e.pointerType === 'pen') return e.pressure > 0 ? e.pressure : 0.5;
      return 0.5;
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
        if (pendingErase.has(s.id)) continue;
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

    // ---- pointer events ----
    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === 'pen') penSeen = true;

      // Pen / mouse always draw and take priority.
      if (e.pointerType === 'pen' || e.pointerType === 'mouse') {
        cancelGesture();
        if (drawId !== null && drawKind === 'finger') abortStroke();
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        beginStroke(e, 'pen');
        commitPresent();
        e.preventDefault();
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
      if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
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

      if (e.pointerType === 'touch' && gestureActive) updateGesture();
    }

    function endPointer(e: PointerEvent) {
      if (e.pointerType === 'touch') touches.delete(e.pointerId);
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }

      if (drawId === e.pointerId) {
        endStroke();
        return;
      }
      if (gestureActive && e.pointerType === 'touch') {
        if (touches.size === 0) {
          cancelGesture();
          commitViewport();
        } else {
          startGesture(); // rebaseline remaining finger(s)
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
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
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
        invalidate();
        return;
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
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
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
