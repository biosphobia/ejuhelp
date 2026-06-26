import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SpinnerIcon } from './icons';
import { useT } from '../i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/** Renders one page of a PDF (loaded from `url`) to a canvas, with page nav and
 *  zoom. `initialPage` jumps to a given page (used to map a question to its page). */
export default function PdfView({ url, initialPage = 1 }: { url: string; initialPage?: number }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // pdf.js objects are loosely typed across versions — keep them as any.
  const docRef = useRef<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [scale, setScale] = useState(1.3);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Load the document whenever the source changes.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    docRef.current = null;
    setNumPages(0);
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

  // Jump to the requested page when it (or the loaded doc) changes.
  useEffect(() => {
    const max = numPages || initialPage;
    setPage(Math.min(Math.max(1, initialPage), max));
  }, [initialPage, numPages]);

  // Render the current page at the current zoom.
  useEffect(() => {
    const doc = docRef.current;
    if (!doc || status !== 'ready') return;
    let cancelled = false;
    let renderTask: any = null;
    doc
      .getPage(Math.min(Math.max(1, page), doc.numPages))
      .then((pg: any) => {
        if (cancelled) return;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const viewport = pg.getViewport({ scale: scale * dpr });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;
        renderTask = pg.render({ canvasContext: ctx, viewport });
        renderTask.promise.catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [page, scale, status]);

  const btn = 'grid h-7 w-7 place-items-center rounded-lg text-slate-200 hover:bg-white/10 disabled:opacity-30';

  if (status === 'error') {
    return <div className="grid h-full place-items-center p-4 text-center text-sm text-slate-300">{t('pdfLoadError')}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="thin-scroll flex-1 overflow-auto bg-slate-300">
        {status === 'loading' ? (
          <div className="grid h-full place-items-center text-slate-500">
            <SpinnerIcon className="h-5 w-5" />
          </div>
        ) : (
          <canvas ref={canvasRef} className="mx-auto my-2 block rounded shadow" />
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-slate-800 px-2 py-1">
        <div className="flex items-center gap-1">
          <button type="button" className={btn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ‹
          </button>
          <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-slate-300">
            {page} / {numPages || '…'}
          </span>
          <button
            type="button"
            className={btn}
            disabled={!numPages || page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages || p, p + 1))}
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={btn} onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}>
            −
          </button>
          <span className="min-w-[3rem] text-center text-xs tabular-nums text-slate-300">{Math.round(scale * 100)}%</span>
          <button type="button" className={btn} onClick={() => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)))}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
