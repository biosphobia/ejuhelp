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

// Make sure the <svg> has a sizing hint. An <img> of an SVG with neither a viewBox nor
// width/height has no intrinsic size and collapses to zero height (so the diagram shows
// nothing). If both are missing we add a default viewBox.
function ensureSized(svg: string): string {
  const open = svg.match(/<svg\b[^>]*>/i);
  if (!open) return svg;
  const tag = open[0];
  if (/\bviewBox\s*=/i.test(tag) || (/\bwidth\s*=/i.test(tag) && /\bheight\s*=/i.test(tag))) return svg;
  return svg.replace(tag, tag.replace(/<svg\b/i, '<svg viewBox="0 0 320 200"'));
}

/** Renders a coach/generator-produced SVG schematic. We render it through an
 *  <img> data URI so any scripting inside the SVG can't execute, and so it scales
 *  cleanly. Meant as a rough map the student copies onto the whiteboard. */
export default function Figure({ svg }: { svg: string }) {
  const t = useT();
  const src = useMemo(() => svgToDataUri(ensureSized(svg)), [svg]);
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
