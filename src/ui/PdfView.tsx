import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SpinnerIcon } from './icons';
import { useT } from '../i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const RES = 2; // render resolution multiplier (crisp up to ~RES× zoom)
const GAP = 10; // px gap between stacked pages (in fitted/CSS space)
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Shows the PDF page(s) tied to the current question — one for physics/chemistry,
 *  the two pages a math 大問 spans, etc. The pages are stitched into one surface that
 *  pans and pinch-zooms as a unit (touch-action:none so the browser can't steal the
 *  pinch). There's no scrolling to *other* questions' pages — the panel's top arrows
 *  switch question (and page). */
export default function PdfView({
  url,
  pages,
  rect,
}: {
  url: string;
  pages: number[];
  /** Optional [y0,y1] vertical crop (page-height fractions) for a single shared page. */
  rect?: [number, number];
}) {
  const t = useT();
  const docRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const fitRef = useRef(0.2); // minimum scale = fit-to-view
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(null);
  const pagesKey = pages.join(',');
  const rectKey = rect ? rect.join(',') : '';

  // Load the document once per URL.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    docRef.current = null;
    const task = pdfjsLib.getDocument({ url });
    task.promise
      .then((doc: any) => {
        if (cancelled) return doc.destroy();
        docRef.current = doc;
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      try {
        task.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [url]);

  // Render the requested page(s), stacked vertically, then fit to the container.
  useEffect(() => {
    if (status !== 'ready') return;
    const doc = docRef.current;
    if (!doc) return;
    let cancelled = false;
    const tasks: any[] = [];
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    (async () => {
      let maxW = 0;
      let firstH = 0;
      // Crop only applies to a single shared page (chemistry questions packed on one page).
      const crop = pages.length === 1 ? rect : undefined;
      for (let idx = 0; idx < pages.length; idx++) {
        const pageNo = clamp(pages[idx], 1, doc.numPages);
        const pg = await doc.getPage(pageNo);
        if (cancelled) return;
        const vp = pg.getViewport({ scale: RES * dpr });
        const canvas = canvasRefs.current[idx];
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) continue;
        if (crop) {
          // Render the full page offscreen, then blit just this question's vertical band
          // onto the visible canvas, so the view shows one question and pans only over it.
          const off = document.createElement('canvas');
          off.width = vp.width;
          off.height = vp.height;
          const octx = off.getContext('2d');
          if (!octx) continue;
          const rt = pg.render({ canvasContext: octx, viewport: vp });
          tasks.push(rt);
          try {
            await rt.promise;
          } catch {
            /* render cancelled */
          }
          if (cancelled) return;
          const y0 = clamp(crop[0], 0, 1);
          const y1 = clamp(crop[1], 0, 1);
          const srcY = Math.round(y0 * vp.height);
          const bandH = Math.max(1, Math.round((y1 - y0) * vp.height));
          canvas.width = vp.width;
          canvas.height = bandH;
          ctx.drawImage(off, 0, srcY, vp.width, bandH, 0, 0, vp.width, bandH);
          const cssW = vp.width / dpr;
          const cssH = bandH / dpr;
          canvas.style.width = `${cssW}px`;
          canvas.style.height = `${cssH}px`;
          maxW = Math.max(maxW, cssW);
          if (idx === 0) firstH = cssH;
        } else {
          canvas.width = vp.width;
          canvas.height = vp.height;
          const cssW = vp.width / dpr;
          const cssH = vp.height / dpr;
          canvas.style.width = `${cssW}px`;
          canvas.style.height = `${cssH}px`;
          const rt = pg.render({ canvasContext: ctx, viewport: vp });
          tasks.push(rt);
          maxW = Math.max(maxW, cssW);
          if (idx === 0) firstH = cssH;
          try {
            await rt.promise;
          } catch {
            /* render cancelled */
          }
          if (cancelled) return;
        }
      }
      // Fit so the first page is fully visible; the user pans down to later pages.
      const el = containerRef.current;
      if (!el || !maxW || !firstH) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const fit = Math.min(cw / maxW, ch / firstH) || 1;
      fitRef.current = fit * 0.6; // allow zooming out a bit past the fit
      setView({ scale: fit, x: (cw - maxW * fit) / 2, y: Math.max(0, (ch - firstH * fit) / 2) });
    })();

    return () => {
      cancelled = true;
      for (const rt of tasks) {
        try {
          rt.cancel();
        } catch {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesKey, rectKey, status]);

  // ── pan / pinch / wheel ──
  const rel = (clientX: number, clientY: number) => {
    const r = containerRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };
  const zoomAt = (factor: number, cx: number, cy: number) => {
    const v = viewRef.current;
    const scale = clamp(v.scale * factor, fitRef.current, fitRef.current * 12);
    const k = scale / v.scale;
    setView({ scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
  };
  const onPointerDown = (e: ReactPointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, rel(e.clientX, e.clientY));
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        scale: viewRef.current.scale,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return;
    const prev = ptrs.current.get(e.pointerId)!;
    const cur = rel(e.clientX, e.clientY);
    ptrs.current.set(e.pointerId, cur);
    if (ptrs.current.size >= 2 && pinch.current) {
      const [a, b] = [...ptrs.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const p = pinch.current;
      const scale = clamp((p.scale * dist) / p.dist, fitRef.current, fitRef.current * 12);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const v = viewRef.current;
      const k = scale / v.scale;
      // zoom around the (moving) pinch midpoint, and follow it for two-finger pan
      setView({ scale, x: cx - (p.cx - v.x) * k, y: cy - (p.cy - v.y) * k });
      p.cx = cx;
      p.cy = cy;
    } else {
      const v = viewRef.current;
      setView({ ...v, x: v.x + (cur.x - prev.x), y: v.y + (cur.y - prev.y) });
    }
  };
  const endPointer = (e: ReactPointerEvent) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size < 2) pinch.current = null;
  };
  const onWheel = (e: ReactWheelEvent) => {
    const { x, y } = rel(e.clientX, e.clientY);
    zoomAt(Math.exp(-e.deltaY * 0.0015), x, y);
  };

  const btn =
    'grid h-8 w-8 place-items-center rounded-lg bg-slate-800/90 text-lg text-slate-100 shadow ring-1 ring-white/10 hover:bg-slate-700';

  if (status === 'error') {
    return <div className="grid h-full place-items-center p-4 text-center text-sm text-slate-300">{t('pdfLoadError')}</div>;
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onWheel={onWheel}
      className="relative h-full w-full overflow-hidden bg-slate-400"
      style={{ touchAction: 'none' }}
    >
      {status === 'loading' ? (
        <div className="grid h-full place-items-center text-slate-200">
          <SpinnerIcon className="h-5 w-5" />
        </div>
      ) : null}
      <div
        ref={stackRef}
        className="absolute left-0 top-0 flex origin-top-left flex-col items-center"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, gap: `${GAP}px` }}
      >
        {pages.map((p, i) => (
          <canvas
            key={`${p}-${i}`}
            ref={(el) => {
              canvasRefs.current[i] = el;
            }}
            className="block bg-white shadow-lg"
          />
        ))}
      </div>
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          className={btn}
          aria-label="zoom in"
          onClick={() => zoomAt(1.25, (containerRef.current?.clientWidth ?? 0) / 2, (containerRef.current?.clientHeight ?? 0) / 2)}
        >
          +
        </button>
        <button
          type="button"
          className={btn}
          aria-label="zoom out"
          onClick={() => zoomAt(0.8, (containerRef.current?.clientWidth ?? 0) / 2, (containerRef.current?.clientHeight ?? 0) / 2)}
        >
          −
        </button>
      </div>
    </div>
  );
}
