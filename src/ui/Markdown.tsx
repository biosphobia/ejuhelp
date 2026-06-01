import { Fragment, type ReactNode } from 'react';

// Minimal, safe Markdown -> React (headings, bold, inline code, lists, paragraphs).
// No raw HTML injection. Good enough for tutoring answers; LaTeX is shown as-is.

function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** and `code`
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <code key={`${keyBase}-c${i}`} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">
          {tok.slice(1, -1)}
        </code>
      );
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyBase}-tend`}>{text.slice(last)}</Fragment>);
  return nodes;
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = (k: string) => {
    if (para.length) {
      blocks.push(
        <p key={k} className="my-2 leading-relaxed">
          {inline(para.join(' '), k)}
        </p>
      );
      para = [];
    }
  };
  const flushList = (k: string) => {
    if (list) {
      const L = list;
      const Tag = L.ordered ? 'ol' : 'ul';
      blocks.push(
        <Tag key={k} className={`my-2 ml-5 space-y-1 ${L.ordered ? 'list-decimal' : 'list-disc'}`}>
          {L.items.map((it, idx) => (
            <li key={idx} className="leading-relaxed">
              {inline(it, `${k}-${idx}`)}
            </li>
          ))}
        </Tag>
      );
      list = null;
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const k = `bl-${idx}`;
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);

    if (h) {
      flushPara(k);
      flushList(k);
      const level = h[1].length;
      const cls = level === 1 ? 'text-lg font-bold mt-3' : level === 2 ? 'text-base font-bold mt-3' : 'text-sm font-semibold mt-2';
      blocks.push(
        <p key={k} className={cls}>
          {inline(h[2], k)}
        </p>
      );
    } else if (ul || ol) {
      flushPara(k);
      const ordered = Boolean(ol);
      if (!list || list.ordered !== ordered) {
        flushList(k);
        list = { ordered, items: [] };
      }
      list.items.push((ul ?? ol)![1]);
    } else if (line === '') {
      flushPara(k);
      flushList(k);
    } else {
      flushList(k);
      para.push(line);
    }
  });
  flushPara('bl-end');
  flushList('bl-end');

  return <div className="text-[15px] text-slate-800">{blocks}</div>;
}
