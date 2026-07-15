// Rasterize a note (plain text + $…$ LaTeX) to a self-contained SVG so it can be drawn on
// the canvas. KaTeX renders to HTML; we wrap that HTML in an <svg><foreignObject> with the
// KaTeX CSS and its fonts INLINED as base64 — a data-URL SVG rasterizes identically on every
// browser (including iOS Safari), unlike an external-font foreignObject. This module is
// lazy-loaded (see mathnote.ts) so the ~fonts only ship when a math note actually exists.
import katex from 'katex';
import katexCss from 'katex/dist/katex.min.css?inline';
import fMainR from 'katex/dist/fonts/KaTeX_Main-Regular.woff2?inline';
import fMainB from 'katex/dist/fonts/KaTeX_Main-Bold.woff2?inline';
import fMainI from 'katex/dist/fonts/KaTeX_Main-Italic.woff2?inline';
import fMainBI from 'katex/dist/fonts/KaTeX_Main-BoldItalic.woff2?inline';
import fMathI from 'katex/dist/fonts/KaTeX_Math-Italic.woff2?inline';
import fMathBI from 'katex/dist/fonts/KaTeX_Math-BoldItalic.woff2?inline';
import fAMS from 'katex/dist/fonts/KaTeX_AMS-Regular.woff2?inline';
import fSize1 from 'katex/dist/fonts/KaTeX_Size1-Regular.woff2?inline';
import fSize2 from 'katex/dist/fonts/KaTeX_Size2-Regular.woff2?inline';
import fSize3 from 'katex/dist/fonts/KaTeX_Size3-Regular.woff2?inline';
import fSize4 from 'katex/dist/fonts/KaTeX_Size4-Regular.woff2?inline';
import fSans from 'katex/dist/fonts/KaTeX_SansSerif-Regular.woff2?inline';
import fCal from 'katex/dist/fonts/KaTeX_Caligraphic-Regular.woff2?inline';

// Keep in sync with textnote.ts.
const BASE_FONT = 18;
const PAD = BASE_FONT * 0.5;
const MAX_WIDTH = 320;
const LINE_H = 1.4;
const RS = 2; // rasterize at 2× so notes stay crisp when zoomed/scaled
const FONT_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const face = (family: string, weight: string, style: string, url: string) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(${url}) format('woff2')}`;
const FONT_FACES = [
  face('KaTeX_Main', 'normal', 'normal', fMainR),
  face('KaTeX_Main', 'bold', 'normal', fMainB),
  face('KaTeX_Main', 'normal', 'italic', fMainI),
  face('KaTeX_Main', 'bold', 'italic', fMainBI),
  face('KaTeX_Math', 'normal', 'italic', fMathI),
  face('KaTeX_Math', 'bold', 'italic', fMathBI),
  face('KaTeX_AMS', 'normal', 'normal', fAMS),
  face('KaTeX_Size1', 'normal', 'normal', fSize1),
  face('KaTeX_Size2', 'normal', 'normal', fSize2),
  face('KaTeX_Size3', 'normal', 'normal', fSize3),
  face('KaTeX_Size4', 'normal', 'normal', fSize4),
  face('KaTeX_SansSerif', 'normal', 'normal', fSans),
  face('KaTeX_Caligraphic', 'normal', 'normal', fCal),
].join('');
// KaTeX's own @font-face rules point at unresolved relative URLs — drop them, keep the rest.
const KATEX_CSS = (katexCss as string).replace(/@font-face\s*\{[^}]*\}/g, '');

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function lineToHtml(line: string): string {
  if (!line) return '<br/>';
  const re = /\$([^$]+)\$/g;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    out += escapeHtml(line.slice(last, m.index));
    try {
      out += katex.renderToString(m[1].trim(), { throwOnError: false, displayMode: false });
    } catch {
      out += escapeHtml(m[0]);
    }
    last = re.lastIndex;
  }
  out += escapeHtml(line.slice(last));
  return out;
}

function noteToHtml(text: string): string {
  return text.split('\n').map((l) => `<div class="knln">${lineToHtml(l)}</div>`).join('');
}

// A hidden element (using the page's already-loaded KaTeX CSS/fonts) for accurate sizing.
let measureEl: HTMLDivElement | null = null;
const sizeCache = new Map<string, { w: number; h: number }>();

export function measureNote(text: string): { w: number; h: number } {
  const cached = sizeCache.get(text);
  if (cached) return cached;
  if (!measureEl) {
    measureEl = document.createElement('div');
    measureEl.setAttribute('aria-hidden', 'true');
    measureEl.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(measureEl);
  }
  measureEl.style.font = `${BASE_FONT}px ${FONT_STACK}`;
  measureEl.style.lineHeight = String(LINE_H);
  measureEl.style.padding = `${PAD}px`;
  measureEl.style.maxWidth = `${MAX_WIDTH + PAD * 2}px`;
  measureEl.style.width = 'max-content';
  measureEl.style.boxSizing = 'border-box';
  measureEl.style.whiteSpace = 'pre-wrap';
  measureEl.innerHTML = noteToHtml(text);
  const r = measureEl.getBoundingClientRect();
  const size = { w: Math.max(1, Math.ceil(r.width)), h: Math.max(1, Math.ceil(r.height)) };
  sizeCache.set(text, size);
  return size;
}

/** A data-URL SVG that renders the note at (w×h) world units, rasterized RS× for crispness. */
export function noteSvgDataUri(text: string, colorHex: string, w: number, h: number): string {
  const W = Math.round(w * RS);
  const H = Math.round(h * RS);
  const style =
    FONT_FACES +
    KATEX_CSS +
    `.knwrap{font-family:${FONT_STACK};font-size:${BASE_FONT * RS}px;line-height:${LINE_H};color:${colorHex};` +
    `padding:${PAD * RS}px;box-sizing:border-box;width:${W}px;white-space:pre-wrap}` +
    `.knln{min-height:1em}.katex{font-size:1em}`;
  const body = `<div xmlns="http://www.w3.org/1999/xhtml" class="knwrap">${noteToHtml(text)}</div>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<style>${style}</style><foreignObject x="0" y="0" width="${W}" height="${H}">${body}</foreignObject></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
