import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SpinnerIcon } from './icons';
import { useT } from '../i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const BASE_SCALE = 1.5; // render resolution; on-screen size is scaled by `zoom` via CSS

/** Continuous, zoomable PDF viewer. Renders only the page range [startPage,endPage]
 *  (so a shared science booklet shows just one subject's section) and lazily paints
 *  pages near the viewport. No page browser — the student scrolls; questions are
 *  switched from the panel's top bar. */
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
      const cssW = viewport.width / dpr;
      canvas.dataset.cssw = String(cssW);
      canvas.style.width = `${cssW * zoomRef.current}px`;
      canvas.className = 'mx-auto block max-w-none bg-white shadow';
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

  // Re-apply zoom (CSS) to already-painted pages.
  useEffect(() => {
    for (const [, r] of rendered.current) {
      const cssW = Number(r.canvas?.dataset.cssw);
      if (r.canvas && cssW) r.canvas.style.width = `${cssW * zoom}px`;
    }
  }, [zoom]);

  const btn = 'grid h-7 w-7 place-items-center rounded-lg text-slate-200 hover:bg-white/10 disabled:opacity-30';

  if (status === 'error') {
    return <div className="grid h-full place-items-center p-4 text-center text-sm text-slate-300">{t('pdfLoadError')}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="thin-scroll flex-1 overflow-auto bg-slate-400 p-2">
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
        <button type="button" className={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)))}>
          −
        </button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-slate-300">{Math.round(zoom * 100)}%</span>
        <button type="button" className={btn} onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}>
          +
        </button>
      </div>
    </div>
  );
}
