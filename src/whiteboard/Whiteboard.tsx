import { useEffect, useRef } from 'react';
import {
  MAX_SCALE,
  MIN_SCALE,
  newId,
  useBoard,
  type InkColor,
  type Pt,
} from '../lib/board';
import { useUI } from '../lib/ui';
import { drawStroke, strokeHit } from './render';
import { boardEvents } from './view';

const ERASER_RADIUS = 14; // screen px

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const cache = document.createElement('canvas');
    const cctx = cache.getContext('2d')!;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    const vp = { ...useBoard.getState().getCurrentPage().viewport };
    let lastPageId = useBoard.getState().currentPageId;
    let cacheDirty = true;
    let rafId = 0;

    // ---- interaction state ----
    let drawing: { color: InkColor; size: number; points: Pt[] } | null = null;
    let erasing = false;
    const pendingErase = new Set<string>();
    let eraserScreen: { x: number; y: number } | null = null;
    // which pointer currently owns the stroke (and whether it's a real stylus)
    let drawId: number | null = null;
    let drawType: string | null = null;

    const touches = new Map<number, { x: number; y: number }>();
    let gestureActive = false;
    let gesture: { cx: number; cy: number; dist: number; vx: number; vy: number; scale: number } | null =
      null;

    // ---- geometry helpers ----
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

    function paint() {
      rafId = 0;
      if (cacheDirty) renderCache();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cache, 0, 0);

      if (drawing && drawing.points.length) {
        setWorldTransform(ctx);
        drawStroke(ctx, {
          id: 'tmp',
          color: drawing.color,
          size: drawing.size,
          points: drawing.points,
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
    }

    function schedule() {
      if (!rafId) rafId = requestAnimationFrame(paint);
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

    // ---- stroke lifecycle ----
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
      if (changed) invalidate();
    }

    function beginStroke(e: PointerEvent) {
      drawId = e.pointerId;
      drawType = e.pointerType;
      const { tool, color, size } = useBoard.getState();
      const w = toWorld(e.clientX, e.clientY);
      if (tool === 'eraser') {
        erasing = true;
        eraserScreen = localPt(e.clientX, e.clientY);
        doErase(w.x, w.y);
      } else {
        drawing = { color, size, points: [{ x: w.x, y: w.y, p: pressureFor(e) }] };
      }
      schedule();
    }
    function endStroke() {
      if (drawing) {
        if (drawing.points.length >= 1) {
          useBoard.getState().addStroke({
            id: newId(),
            color: drawing.color,
            size: drawing.size,
            points: drawing.points,
          });
        }
        drawing = null;
      }
      if (erasing) {
        erasing = false;
        eraserScreen = null;
        if (pendingErase.size) {
          useBoard.getState().eraseStrokes([...pendingErase]);
          pendingErase.clear();
        }
      }
      drawId = null;
      drawType = null;
      invalidate();
    }
    function abortStroke() {
      // discard an in-progress stroke (e.g. a palm/finger stroke superseded by a gesture or pen)
      drawing = null;
      erasing = false;
      eraserScreen = null;
      pendingErase.clear();
      drawId = null;
      drawType = null;
      invalidate();
    }

    // ---- two-finger pan + pinch-to-scale (never rotate) ----
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
      if (g.n >= 2 && gesture.dist > 0) {
        scale = clamp(gesture.scale * (g.dist / gesture.dist), MIN_SCALE, MAX_SCALE);
      }
      vp.scale = scale;
      vp.x = g.cx - anchorX * scale;
      vp.y = g.cy - anchorY * scale;
      invalidate();
    }
    function commitViewport() {
      useBoard.getState().setViewport({ scale: vp.scale, x: vp.x, y: vp.y });
    }

    // ---- pointer events ----
    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === 'touch') touches.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // A real stylus / mouse always draws and takes priority over finger interaction.
      if (e.pointerType === 'pen' || e.pointerType === 'mouse') {
        if (gestureActive) {
          gestureActive = false;
          gesture = null;
        }
        if (drawId !== null && drawType === 'touch') abortStroke(); // palm started; pen takes over
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        beginStroke(e);
        e.preventDefault();
        return;
      }

      // touch
      // If a real stylus is mid-stroke, ignore touches entirely (palm rejection).
      if (drawId !== null && drawType !== 'touch') return;

      const fingerDraw = useUI.getState().fingerDraw;
      if (touches.size >= 2) {
        // second finger down -> this is a navigation gesture, not drawing
        if (drawId !== null && drawType === 'touch') abortStroke();
        gestureActive = true;
        startGesture();
        return;
      }
      // exactly one touch
      if (fingerDraw) {
        beginStroke(e);
      } else {
        gestureActive = true;
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
        } else {
          eraserScreen = localPt(e.clientX, e.clientY);
          const w = toWorld(e.clientX, e.clientY);
          doErase(w.x, w.y);
        }
        schedule();
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
          gestureActive = false;
          gesture = null;
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

    // Block Safari's non-standard pinch-zoom of the page.
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

    // Keep the canvas in sync with store changes (page switch, undo, cloud load).
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
        drawType = null;
        gestureActive = false;
        gesture = null;
        touches.clear();
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

  return (
    <canvas
      ref={canvasRef}
      className="canvas-surface absolute inset-0 h-full w-full touch-none"
    />
  );
}
