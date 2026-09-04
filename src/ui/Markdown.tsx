import { Fragment, type ReactNode } from 'react';
import katex from 'katex';
import { Figure } from './diagrams';

// Minimal, safe Markdown -> React (headings, bold, inline code, lists, paragraphs)
// with LaTeX math via KaTeX. Math is delimited by $…$ / \(…\) (inline) and
// $$…$$ / \[…\] (display). No raw HTML from the model is injected — only KaTeX's
// own rendered output, which it escapes.

function renderMath(expr: string, display: boolean, key: string): ReactNode {
  try {
    const html = katex.renderToString(expr.trim(), { throwOnError: false, displayMode: display });
    return (
      <span
        key={key}
        className={display ? 'my-1 block overflow-x-auto' : ''}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <Fragment key={key}>{expr}</Fragment>;
  }
}

// Order matters: display math ($$ / \[ \]) must be tried before inline ($ / \( \)).
const TOKEN =
  /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$|\*\*[^*]+\*\*|`[^`]+`)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    const key = `${keyBase}-x${i}`;
    if (tok.startsWith('$$')) {
      nodes.push(renderMath(tok.slice(2, -2), true, key));
    } else if (tok.startsWith('\\[')) {
      nodes.push(renderMath(tok.slice(2, -2), true, key));
    } else if (tok.startsWith('\\(')) {
      nodes.push(renderMath(tok.slice(2, -2), false, key));
    } else if (tok.startsWith('$')) {
      nodes.push(renderMath(tok.slice(1, -1), false, key));
    } else if (tok.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <code key={key} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">
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

/** Inline-only rendering (bold / code / math) for short strings like choices or key points. */
export function Inline({ text }: { text: string }) {
  return <>{inline(text, 'inl')}</>;
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

  let table: string[][] | null = null;
  const flushTable = (k: string) => {
    if (table && table.length) {
      const [head, ...rows] = table;
      blocks.push(
        <div key={k} className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {head.map((c, i) => (
                  <th key={i} className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">
                    {inline(c, `${k}-h${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className={ri % 2 ? 'bg-slate-50/50' : ''}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border border-slate-200 px-2 py-1 align-top">
                      {inline(c, `${k}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    table = null;
  };
  let quote: string[] = [];
  const flushQuote = (k: string) => {
    if (quote.length) {
      blocks.push(
        <div key={k} className="my-2 rounded-xl border-l-4 border-sky-300 bg-sky-50/70 px-3 py-2 text-sm leading-relaxed">
          {inline(quote.join(' '), k)}
        </div>
      );
      quote = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const k = `bl-${idx}`;
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    const fig = /^:::fig\s+([\w-]+)\s*$/.exec(line);
    const tr = /^\|(.*)\|\s*$/.exec(line);
    const bq = /^>\s?(.*)$/.exec(line);

    if (tr) {
      flushPara(k);
      flushList(k);
      flushQuote(k);
      const cells = tr[1].split('|').map((c) => c.trim());
      if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) (table ??= []).push(cells); // skip |---| separator rows
      return;
    }
    flushTable(k);
    if (bq) {
      flushPara(k);
      flushList(k);
      quote.push(bq[1]);
      return;
    }
    flushQuote(k);

    if (fig) {
      flushPara(k);
      flushList(k);
      blocks.push(<Figure key={k} id={fig[1]} />);
    } else if (h) {
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
  flushTable('bl-end');
  flushQuote('bl-end');

  return <div className="text-[15px] text-slate-800">{blocks}</div>;
}
