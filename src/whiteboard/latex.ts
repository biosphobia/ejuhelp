// Render a note (plain text + $…$ LaTeX) to an SVG for the canvas — using MathJax's SVG
// output (vector <path>/<use> glyphs, fonts embedded as <defs>). Unlike a KaTeX
// <foreignObject> SVG, a pure-vector SVG rasterizes on EVERY browser including iOS Safari
// (WebKit refuses to draw foreignObject images to a canvas). Lazy-loaded via mathnote.ts,
// so MathJax only ships when a math note actually exists. Same exports as before, so the
// rest of the note pipeline is unchanged.
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

const BASE_FONT = 18; // px per em at zoom 1 (keep in sync with textnote.ts)
const RS = 2; // rasterize at 2× so it stays crisp when zoomed/scaled
const EM = 1000; // MathJax SVG viewBox units per em

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mjDoc = mathjax.document('', {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'local' }),
});

// Escape characters that are special in LaTeX text mode.
function escapeText(s: string): string {
  return s.replace(/([\\{}$%#&_^~])/g, '\\$1');
}

// Turn one note line ("plain $math$ plain") into a single TeX expression: plain runs become
// \text{…}, math runs are used as-is.
function lineToTex(line: string): string {
  let out = '';
  let last = 0;
  const re = /\$([^$]+)\$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const plain = line.slice(last, m.index);
    if (plain) out += `\\text{${escapeText(plain)}}`;
    out += ` ${m[1]} `;
    last = re.lastIndex;
  }
  const tail = line.slice(last);
  if (tail) out += `\\text{${escapeText(tail)}}`;
  return out.trim() || '\\text{ }';
}

function noteToTex(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean).map(lineToTex);
  if (lines.length <= 1) return lines[0] ?? '\\text{ }';
  // Left-aligned stack of lines.
  return `\\begin{array}{l}${lines.join(' \\\\ ')}\\end{array}`;
}

interface Rendered {
  svg: string;
  vbW: number;
  vbH: number;
}
const cache = new Map<string, Rendered>();

function render(text: string): Rendered {
  const hit = cache.get(text);
  if (hit) return hit;
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000"></svg>';
  try {
    const node = mjDoc.convert(noteToTex(text), { display: false });
    const html = adaptor.outerHTML(node); // <mjx-container>…<svg>…</svg></mjx-container>
    const match = html.match(/<svg[\s\S]*<\/svg>/);
    if (match) svg = match[0];
  } catch {
    /* keep the empty fallback */
  }
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/);
  const vbW = vb ? parseFloat(vb[3]) : 1000;
  const vbH = vb ? parseFloat(vb[4]) : 1000;
  const r = { svg, vbW: vbW || 1000, vbH: vbH || 1000 };
  cache.set(text, r);
  return r;
}

/** Natural size (world units, at the base font) of the rendered note. */
export function measureNote(text: string): { w: number; h: number } {
  const { vbW, vbH } = render(text);
  return { w: Math.max(1, (vbW / EM) * BASE_FONT), h: Math.max(1, (vbH / EM) * BASE_FONT) };
}

/** A data-URL SVG of the note at (w×h) world units, colored, rasterized RS× for crispness. */
export function noteSvgDataUri(text: string, colorHex: string, w: number, h: number): string {
  const { svg } = render(text);
  const W = Math.round(w * RS);
  const H = Math.round(h * RS);
  const out = svg
    .replace(/width="[^"]*"/, `width="${W}"`)
    .replace(/height="[^"]*"/, `height="${H}"`)
    .replace(/<svg /, `<svg fill="${colorHex}" `);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(out);
}
