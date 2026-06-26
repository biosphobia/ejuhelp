import { useT } from '../i18n';

/** Renders a coach/generator-produced SVG schematic. We render it through an
 *  <img> data URI so any scripting inside the SVG can't execute, and so it scales
 *  cleanly. Meant as a rough map the student copies onto the whiteboard. */
export default function Figure({ svg }: { svg: string }) {
  const t = useT();
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return (
    <figure className="my-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <img src={src} alt="diagram" className="mx-auto block max-h-72 w-full object-contain p-2" />
      <figcaption className="border-t border-slate-100 px-2 py-1 text-[11px] text-slate-400">
        ✏️ {t('figureHint')}
      </figcaption>
    </figure>
  );
}
