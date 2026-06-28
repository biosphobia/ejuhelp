import { useMemo } from 'react';
import { useT } from '../i18n';

// UTF-8-safe base64 (the SVG can contain Japanese labels, which btoa() alone can't
// handle). Produces a data URI that renders reliably in an <img> across browsers —
// unlike the non-standard "image/svg+xml;utf8," form, which some browsers blank out.
function svgToDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:image/svg+xml;base64,${btoa(bin)}`;
}

// Normalize the <svg> root so it renders inside an <img> data URI:
//  - xmlns is REQUIRED — an SVG loaded via <img> is a standalone document, and without
//    the namespace the browser refuses to render it (broken-image icon). Models routinely
//    omit it (it's implicit for inline SVG), which made every figure fail.
//  - a viewBox (or width+height) is needed so the <img> has an intrinsic size and doesn't
//    collapse to zero height.
function normalizeSvg(svg: string): string {
  const open = svg.match(/<svg\b[^>]*>/i);
  if (!open) return svg;
  const tag = open[0];
  let next = tag;
  if (!/\bxmlns\s*=/i.test(next)) next = next.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  if (!/\bviewBox\s*=/i.test(next) && !(/\bwidth\s*=/i.test(next) && /\bheight\s*=/i.test(next)))
    next = next.replace(/<svg\b/i, '<svg viewBox="0 0 320 200"');
  return next === tag ? svg : svg.replace(tag, next);
}

/** Renders a coach/generator-produced SVG schematic. We render it through an
 *  <img> data URI so any scripting inside the SVG can't execute, and so it scales
 *  cleanly. Meant as a rough map the student copies onto the whiteboard. */
export default function Figure({ svg }: { svg: string }) {
  const t = useT();
  const src = useMemo(() => svgToDataUri(normalizeSvg(svg)), [svg]);
  return (
    <figure className="my-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <img
        src={src}
        alt="diagram"
        className="mx-auto block h-auto max-h-72 w-full object-contain p-2"
        style={{ minHeight: 96 }}
      />
      <figcaption className="border-t border-slate-100 px-2 py-1 text-[11px] text-slate-400">
        ✏️ {t('figureHint')}
      </figcaption>
    </figure>
  );
}
