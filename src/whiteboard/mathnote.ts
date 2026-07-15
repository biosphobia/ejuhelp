import { getRasterImage, requestRepaint } from './assets';
import { INK_HEX, type InkColor } from '../lib/board';

// Bridge to the lazily-loaded LaTeX renderer. The heavy KaTeX fonts live in latex.ts and
// only load the first time a math note is created or drawn.

type Latex = typeof import('./latex');
let latex: Latex | null = null;
let loading: Promise<Latex> | null = null;

export function noteHasMath(text: string): boolean {
  return /\$[^$\n]+\$/.test(text);
}

/** Load the LaTeX renderer (idempotent). Resolves once it — and its fonts — are ready. */
export function ensureMath(): Promise<Latex> {
  if (latex) return Promise.resolve(latex);
  if (!loading)
    loading = import('./latex').then((m) => {
      latex = m;
      requestRepaint(); // redraw any math notes that were showing the plain fallback
      return m;
    });
  return loading;
}

/** Natural size (world units, at the base font) of a math note, or null until latex loads. */
export function mathNoteSize(text: string): { w: number; h: number } | null {
  if (!latex) {
    void ensureMath();
    return null;
  }
  return latex.measureNote(text);
}

/** Decoded bitmap for a math note, or null while latex / the raster are still loading. */
export function mathBitmap(text: string, color: InkColor): HTMLImageElement | null {
  if (!latex) {
    void ensureMath();
    return null;
  }
  const size = latex.measureNote(text);
  const key = `math|${color}|${text}`;
  return getRasterImage(key, () => latex!.noteSvgDataUri(text, INK_HEX[color], size.w, size.h));
}
