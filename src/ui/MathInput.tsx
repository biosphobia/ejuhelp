import { useRef, useState } from 'react';
import katex from 'katex';
import { useUI } from '../lib/ui';
import { useBoard } from '../lib/board';
import { makeTextNote } from '../whiteboard/textnote';
import { ensureMath } from '../whiteboard/mathnote';
import { useT } from '../i18n';
import { CloseIcon } from './icons';

// Quick-insert LaTeX snippets. `$1` marks where the caret should land after insertion.
const SNIPPETS: { label: string; snip: string }[] = [
  { label: '√', snip: '\\sqrt{$1}' },
  { label: 'a/b', snip: '\\frac{$1}{}' },
  { label: 'xⁿ', snip: '^{$1}' },
  { label: 'xₙ', snip: '_{$1}' },
  { label: '∫', snip: '\\int_{$1}^{}' },
  { label: '∑', snip: '\\sum_{$1}^{}' },
  { label: 'lim', snip: '\\lim_{$1}' },
  { label: 'π', snip: '\\pi' },
  { label: 'θ', snip: '\\theta' },
  { label: 'Δ', snip: '\\Delta ' },
  { label: '×', snip: '\\times ' },
  { label: '·', snip: '\\cdot ' },
  { label: '→', snip: '\\to ' },
  { label: '±', snip: '\\pm ' },
  { label: '≈', snip: '\\approx ' },
  { label: '∞', snip: '\\infty ' },
  { label: '°', snip: '^{\\circ}' },
  { label: '⃗', snip: '\\vec{$1}' },
];

function previewHtml(src: string): { html: string; error: boolean } {
  const s = src.trim();
  if (!s) return { html: '', error: false };
  try {
    return { html: katex.renderToString(s, { throwOnError: true, displayMode: true }), error: false };
  } catch {
    // still show a best-effort render, but flag it
    try {
      return { html: katex.renderToString(s, { throwOnError: false, displayMode: true }), error: true };
    } catch {
      return { html: '', error: true };
    }
  }
}

/** Screen-center → world coords, for dropping the equation on the current view. */
function viewCenter() {
  const vp = useBoard.getState().getCurrentPage().viewport;
  return { x: (window.innerWidth / 2 - vp.x) / vp.scale, y: (window.innerHeight / 2 - vp.y) / vp.scale };
}

export default function MathInput() {
  const t = useT();
  const open = useUI((s) => s.mathOpen);
  const setOpen = useUI((s) => s.setMathOpen);
  const [src, setSrc] = useState('');
  const [busy, setBusy] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  if (!open) return null;

  const { html, error } = previewHtml(src);

  const insert = (snip: string) => {
    const ta = taRef.current;
    const caret = snip.indexOf('$1');
    const clean = snip.replace('$1', '');
    if (!ta) {
      setSrc((s) => s + clean);
      return;
    }
    const start = ta.selectionStart ?? src.length;
    const end = ta.selectionEnd ?? src.length;
    const next = src.slice(0, start) + clean + src.slice(end);
    setSrc(next);
    const pos = start + (caret >= 0 ? caret : clean.length);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const close = () => {
    setSrc('');
    setOpen(false);
  };

  const add = async () => {
    const text = src.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      // If the student didn't include $…$ themselves, treat the whole input as one equation.
      const noteText = text.includes('$') ? text : `$${text}$`;
      await ensureMath(); // so the note is sized to its rendered math
      useBoard.getState().addStroke(makeTextNote(noteText, useBoard.getState().color, viewCenter()));
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-3 pt-[12vh]" onClick={close}>
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-800">{t('addEquation')}</h2>
          <button type="button" onClick={close} aria-label={t('close')} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* live preview */}
        <div className="grid min-h-[72px] place-items-center overflow-x-auto border-b border-slate-100 bg-slate-50 px-4 py-3">
          {html ? (
            <div className={error ? 'opacity-60' : ''} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <span className="text-sm text-slate-400">{t('equationPreviewHint')}</span>
          )}
        </div>

        <div className="p-4">
          {/* quick symbols */}
          <div className="mb-2 flex flex-wrap gap-1">
            {SNIPPETS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => insert(s.snip)}
                className="min-w-[34px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            ref={taRef}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            autoFocus
            rows={2}
            placeholder={t('equationPlaceholder')}
            className="thin-scroll w-full resize-none rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-slate-400"
          />

          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={() => void add()}
              disabled={!src.trim() || busy}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {t('addToBoard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
