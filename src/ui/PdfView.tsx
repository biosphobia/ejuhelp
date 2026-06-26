import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SpinnerIcon } from './icons';
import { useT } from '../i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const BASE_SCALE = 1.5; // render resolution; on-screen size is scaled by `zoom` via CSS
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Continuous, zoomable PDF viewer. Renders only the page range [startPage,endPage]
 *  (so a shared science booklet shows just one subject's section) and lazily paints
 *  pages near the viewport. Zoom via the buttons or pinch; no page browser — the
 *  student scrolls, and questions are switched from the panel's top bar. */
export default function PdfView({
  url,
  startPage = 1,
  endPage,
}: {
  url: string;
  startPage?: number;
  endPage?: number;
}) {
  const t = useT();
  const docRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rendered = useRef<Map<number, { canvas: HTMLCanvasElement; task: any }>>(new Map());
  const [numPages, setNumPages] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;

  // pinch-to-zoom state
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ startDist: number; startZoom: number; fx: number; fy: number; midX: number; midY: number } | null>(null);

  const fallbackLast = numPages || startPage;
  const first = Math.max(1, startPage);
  const last = Math.min(endPage ?? fallbackLast, fallbackLast);
  const pages: number[] = [];
  for (let p = first; p <= last; p++) pages.push(p);

  // Load the document.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setNumPages(0);
    rendered.current.clear();
    docRef.current = null;
    const task = pdfjsLib.getDocument({ url });
    task.promise
      .then((doc: any) => {
        if (cancelled) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setNumPages(doc.numPages);
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

  const sizeCanvas = (canvas: HTMLCanvasElement, z: number) => {
    const w = Number(canvas.dataset.cssw);
    const h = Number(canvas.dataset.cssh);
    if (w) canvas.style.width = `${w * z}px`;
    if (h) canvas.style.height = `${h * z}px`;
  };

  const renderPage = async (n: number) => {
    const doc = docRef.current;
    if (!doc || rendered.current.has(n)) return;
    const slot = slotRefs.current.find((s) => s && Number(s.dataset.page) === n);
    if (!slot) return;
    rendered.current.set(n, { canvas: document.createElement('canvas'), task: null }); // reserve
    try {
      const pg = await doc.getPage(n);
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const viewport = pg.getViewport({ scale: BASE_SCALE * dpr });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.dataset.cssw = String(viewport.width / dpr);
      canvas.dataset.cssh = String(viewport.height / dpr);
      canvas.className = 'mx-auto block max-w-none bg-white shadow';
      sizeCanvas(canvas, zoomRef.current);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      slot.replaceChildren(canvas);
      const task = pg.render({ canvasContext: ctx, viewport });
      rendered.current.set(n, { canvas, task });
      task.promise.catch(() => {});
    } catch {
      rendered.current.delete(n);
    }
  };

  const unrenderPage = (n: number) => {
    const r = rendered.current.get(n);
    if (!r) return;
    try {
      r.task?.cancel?.();
    } catch {
      /* ignore */
    }
    const slot = slotRefs.current.find((s) => s && Number(s.dataset.page) === n);
    if (slot) slot.replaceChildren();
    rendered.current.delete(n);
  };

  // Lazily paint pages near the viewport; free the ones that scroll far away.
  useEffect(() => {
    if (status !== 'ready' || !pages.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.page);
          if (e.isIntersecting) void renderPage(n);
          else unrenderPage(n);
        }
      },
      { root: scrollRef.current, rootMargin: '700px 0px' }
    );
    slotRefs.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, numPages, first, last]);

  // Jump to the first page of the range on open.
  useEffect(() => {
    if (status !== 'ready') return;
    const slot = slotRefs.current.find((s) => s && Number(s.dataset.page) === first);
    slot?.scrollIntoView({ block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, first]);

  // Re-apply zoom (CSS) to painted pages, keeping the pinch focal point steady.
  useEffect(() => {
    for (const [, r] of rendered.current) if (r.canvas) sizeCanvas(r.canvas, zoom);
    const p = pinch.current;
    const el = scrollRef.current;
    if (p && el) {
      el.scrollLeft = p.fx * zoom - p.midX;
      el.scrollTop = p.fy * zoom - p.midY;
    }
  }, [zoom]);

  // ── pinch-to-zoom ──
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'touch') return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 2) {
      const el = scrollRef.current;
      if (!el) return;
      const pts = [...ptrs.current.values()];
      const rect = el.getBoundingClientRect();
      const midX = (pts[0].x + pts[1].x) / 2 - rect.left;
      const midY = (pts[0].y + pts[1].y) / 2 - rect.top;
      const z = zoomRef.current;
      pinch.current = {
        startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
        startZoom: z,
        fx: (el.scrollLeft + midX) / z, // focal point in zoom-independent content coords
        fy: (el.scrollTop + midY) / z,
        midX,
        midY,
      };
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = pinch.current;
    if (!p || ptrs.current.size < 2) return;
    e.preventDefault(); // suppress native scroll while pinching
    const el = scrollRef.current;
    if (!el) return;
    const pts = [...ptrs.current.values()];
    const rect = el.getBoundingClientRect();
    p.midX = (pts[0].x + pts[1].x) / 2 - rect.left;
    p.midY = (pts[0].y + pts[1].y) / 2 - rect.top;
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    setZoom(clamp(+(p.startZoom * (dist / p.startDist)).toFixed(3), MIN_ZOOM, MAX_ZOOM));
  };
  const endPointer = (e: ReactPointerEvent) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size < 2) pinch.current = null;
  };

  const btn = 'grid h-7 w-7 place-items-center rounded-lg text-slate-200 hover:bg-white/10 disabled:opacity-30';

  if (status === 'error') {
    return <div className="grid h-full place-items-center p-4 text-center text-sm text-slate-300">{t('pdfLoadError')}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        className="thin-scroll flex-1 overflow-auto bg-slate-400 p-2"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {status === 'loading' ? (
          <div className="grid h-full place-items-center text-slate-200">
            <SpinnerIcon className="h-5 w-5" />
          </div>
        ) : (
          pages.map((n, i) => (
            <div
              key={n}
              data-page={n}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              className="mx-auto mb-2 w-full"
              style={{ minHeight: 'min(70vh, 720px)' }}
            />
          ))
        )}
      </div>
      <div className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-slate-800 px-2 py-1">
        <button type="button" className={btn} onClick={() => setZoom((z) => clamp(+(z - 0.2).toFixed(2), MIN_ZOOM, MAX_ZOOM))}>
          −
        </button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-slate-300">{Math.round(zoom * 100)}%</span>
        <button type="button" className={btn} onClick={() => setZoom((z) => clamp(+(z + 0.2).toFixed(2), MIN_ZOOM, MAX_ZOOM))}>
          +
        </button>
      </div>
    </div>
  );
}
