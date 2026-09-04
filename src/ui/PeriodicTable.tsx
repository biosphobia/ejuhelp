import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Inline } from './Markdown';
import { CloseIcon, AskIcon, ChevronLeft } from './icons';
import { ELEMENTS, byZ, isKeyElement, type Category, type ElementData, type ElementState } from '../data/elements';
import { TRENDS, TRAPS, type Trend } from '../data/periodicTrends';
import { electronInfo } from '../lib/electrons';
import { useUI } from '../lib/ui';
import { useAsk } from '../lib/ask';
import { useT, type StringKey, type TFunc } from '../i18n';

type ColorMode = 'category' | 'en' | 'state' | 'block' | 'key';
type Tab = 'table' | 'trends';

// Light backgrounds + dark text so every cell keeps readable contrast.
const CAT_STYLE: Record<Category, { bg: string; text: string; key: StringKey }> = {
  alkali: { bg: 'bg-rose-100', text: 'text-rose-900', key: 'catAlkali' },
  alkaline: { bg: 'bg-orange-100', text: 'text-orange-900', key: 'catAlkaline' },
  transition: { bg: 'bg-amber-100', text: 'text-amber-900', key: 'catTransition' },
  post: { bg: 'bg-lime-100', text: 'text-lime-900', key: 'catPost' },
  metalloid: { bg: 'bg-teal-100', text: 'text-teal-900', key: 'catMetalloid' },
  nonmetal: { bg: 'bg-sky-100', text: 'text-sky-900', key: 'catNonmetal' },
  halogen: { bg: 'bg-indigo-100', text: 'text-indigo-900', key: 'catHalogen' },
  noble: { bg: 'bg-violet-100', text: 'text-violet-900', key: 'catNoble' },
  lanthanide: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-900', key: 'catLanthanide' },
  actinide: { bg: 'bg-pink-100', text: 'text-pink-900', key: 'catActinide' },
};
const STATE_STYLE: Record<ElementState, { bg: string; text: string; key: StringKey }> = {
  gas: { bg: 'bg-sky-100', text: 'text-sky-900', key: 'stGas' },
  liquid: { bg: 'bg-blue-200', text: 'text-blue-900', key: 'stLiquid' },
  solid: { bg: 'bg-slate-200', text: 'text-slate-900', key: 'stSolid' },
  unknown: { bg: 'bg-slate-50', text: 'text-slate-400', key: 'stUnknown' },
};
const BLOCK_STYLE: Record<'s' | 'p' | 'd' | 'f', { bg: string; text: string }> = {
  s: { bg: 'bg-rose-100', text: 'text-rose-900' },
  p: { bg: 'bg-sky-100', text: 'text-sky-900' },
  d: { bg: 'bg-amber-100', text: 'text-amber-900' },
  f: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-900' },
};

/** Electronegativity 0.7–4.0 → pale yellow → deep orange, always with dark text. */
function enStyle(v: number | undefined): CSSProperties {
  if (v == null) return { background: '#f1f5f9', color: '#94a3b8' };
  const f = Math.max(0, Math.min(1, (v - 0.7) / 3.3));
  const l = 92 - f * 40; // 92% → 52%
  return { background: `hsl(${40 - f * 25} 95% ${l}%)`, color: f > 0.55 ? '#fff' : '#3f2a00' };
}

function cellStyle(e: ElementData, mode: ColorMode): { className: string; style?: CSSProperties } {
  if (mode === 'category') {
    const s = CAT_STYLE[e.cat];
    return { className: `${s.bg} ${s.text}` };
  }
  if (mode === 'state') {
    const s = STATE_STYLE[e.state];
    return { className: `${s.bg} ${s.text}` };
  }
  if (mode === 'block') {
    const s = BLOCK_STYLE[electronInfo(e.z).block];
    return { className: `${s.bg} ${s.text}` };
  }
  if (mode === 'key') {
    return isKeyElement(e)
      ? { className: 'bg-emerald-100 text-emerald-900' }
      : { className: 'bg-slate-50 text-slate-400' };
  }
  return { className: '', style: enStyle(e.en) };
}

/** Grid placement: main body rows 2–8, f-block rows 10–11 (row 1 = group labels, row 9 = spacer). */
function gridPos(e: ElementData): { col: number; row: number } {
  if (e.cat === 'lanthanide') return { col: 4 + (e.z - 57), row: 10 };
  if (e.cat === 'actinide') return { col: 4 + (e.z - 89), row: 11 };
  return { col: e.group + 1, row: e.period + 1 };
}

const LANG_KEYS = { en: 'en', ja: 'ja', zh: 'zh', tr: 'tr' } as const;

export default function PeriodicTable({ onClose }: { onClose: () => void }) {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const openPanel = useUI((s) => s.openPanel);
  const send = useAsk((s) => s.send);
  const nameLang = LANG_KEYS[lang];
  // Study notes exist in English and Japanese; other UI languages read the English notes.
  const noteLang: 'en' | 'ja' = lang === 'ja' ? 'ja' : 'en';

  const [tab, setTab] = useState<Tab>('table');
  const [mode, setMode] = useState<ColorMode>('category');
  const [selected, setSelected] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const el = selected ? byZ(selected) : undefined;

  // Escape closes the detail first, then the whole overlay.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        if (selected) setSelected(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, onClose]);

  useEffect(() => {
    if (selected && detailRef.current) detailRef.current.scrollTop = 0;
  }, [selected]);

  // Arrow-key navigation between cells (moves within the table's real layout).
  const move = useCallback(
    (from: number, key: string) => {
      const cur = byZ(from);
      if (!cur) return;
      const { col, row } = gridPos(cur);
      let target: ElementData | undefined;
      if (key === 'ArrowRight') target = byZ(from + 1);
      else if (key === 'ArrowLeft') target = byZ(from - 1);
      else if (key === 'ArrowDown' || key === 'ArrowUp') {
        const dir = key === 'ArrowDown' ? 1 : -1;
        for (let r = row + dir; r >= 2 && r <= 11; r += dir) {
          target = ELEMENTS.find((e) => {
            const p = gridPos(e);
            return p.row === r && p.col === col;
          });
          if (target) break;
        }
      }
      if (target) {
        setSelected(target.z);
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-z="${target.z}"]`)?.focus();
      }
    },
    []
  );

  const askCoach = (e: ElementData) => {
    onClose();
    openPanel('ask');
    void send(t('ptAskPrompt', { name: e.name[nameLang], sym: e.sym }));
  };

  const showTrend = (tr: Trend) => {
    if (tr.colorMode) setMode(tr.colorMode);
    setTab('table');
  };

  const cells = useMemo(
    () =>
      ELEMENTS.map((e) => {
        const { col, row } = gridPos(e);
        const cs = cellStyle(e, mode);
        const isSel = selected === e.z;
        return (
          <button
            key={e.z}
            type="button"
            data-z={e.z}
            aria-label={`${e.name[nameLang]}, ${t('ptAtomicNumber')} ${e.z}`}
            aria-pressed={isSel}
            onClick={() => setSelected(e.z)}
            onKeyDown={(ev) => {
              if (ev.key.startsWith('Arrow')) {
                ev.preventDefault();
                move(e.z, ev.key);
              }
            }}
            style={{ gridColumn: col, gridRow: row, ...cs.style }}
            className={`relative flex min-h-[3.1rem] flex-col items-center justify-center rounded-md px-0.5 py-1 leading-none ring-1 ring-black/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${cs.className} ${
              isSel ? 'z-10 scale-110 shadow-lg ring-2 ring-slate-900' : 'hover:brightness-95'
            }`}
          >
            <span className="absolute left-1 top-0.5 text-[9px] opacity-70">{e.z}</span>
            {isKeyElement(e) ? (
              <span className="absolute right-0.5 top-0.5 text-[8px] opacity-70" aria-hidden>
                ★
              </span>
            ) : null}
            <span className="mt-1.5 text-sm font-bold sm:text-base">{e.sym}</span>
            <span className="mt-0.5 w-full truncate text-center text-[8px] opacity-80">{e.name[nameLang]}</span>
          </button>
        );
      }),
    [mode, selected, nameLang, t, move]
  );

  const legend = () => {
    if (mode === 'category')
      return (Object.keys(CAT_STYLE) as Category[]).map((c) => (
        <LegendItem key={c} className={`${CAT_STYLE[c].bg} ${CAT_STYLE[c].text}`} label={t(CAT_STYLE[c].key)} />
      ));
    if (mode === 'state')
      return (Object.keys(STATE_STYLE) as ElementState[]).map((s) => (
        <LegendItem key={s} className={`${STATE_STYLE[s].bg} ${STATE_STYLE[s].text}`} label={t(STATE_STYLE[s].key)} />
      ));
    if (mode === 'block')
      return (['s', 'p', 'd', 'f'] as const).map((b) => (
        <LegendItem key={b} className={`${BLOCK_STYLE[b].bg} ${BLOCK_STYLE[b].text}`} label={`${b} ${t('ptBlock').toLowerCase()}`} />
      ));
    if (mode === 'key')
      return (
        <>
          <LegendItem className="bg-emerald-100 text-emerald-900" label={`★ ${t('ptKeyElement')}`} />
          <LegendItem className="bg-slate-50 text-slate-500" label={t('ptRare').split('.')[0]} />
        </>
      );
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span>{t('ptLow')} 0.7</span>
        <span
          className="h-3 w-32 rounded"
          style={{ background: 'linear-gradient(90deg, hsl(40 95% 92%), hsl(15 95% 52%))' }}
          aria-hidden
        />
        <span>4.0 {t('ptHigh')}</span>
        <span className="ml-2 inline-block h-3 w-3 rounded bg-slate-100 ring-1 ring-slate-200" aria-hidden /> {t('ptNoValue')}
      </div>
    );
  };

  const MODES: { id: ColorMode; key: StringKey }[] = [
    { id: 'category', key: 'ptModeCategory' },
    { id: 'en', key: 'ptModeEn' },
    { id: 'state', key: 'ptModeState' },
    { id: 'block', key: 'ptModeBlock' },
    { id: 'key', key: 'ptModeKey' },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('periodicTable')}
      className="selectable pointer-events-auto fixed inset-0 z-50 flex flex-col bg-white safe-pad-top"
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" /> {t('ptBack')}
        </button>
        <h2 className="text-base font-semibold text-slate-900">{t('periodicTable')}</h2>
        <div className="ml-auto flex items-center gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
          {(['table', 'trends'] as Tab[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {id === 'table' ? t('ptTabTable') : t('ptTabTrends')}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={t('close')}
          title={t('close')}
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
        >
          <CloseIcon />
        </button>
      </header>

      {tab === 'table' ? (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-slate-100 px-3 py-2 sm:px-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ptColorBy')}</span>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    mode === m.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(m.key)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 sm:px-4">{legend()}</div>
            <div className="thin-scroll min-h-0 flex-1 overflow-auto px-3 pb-4 sm:px-4">
              <div
                ref={gridRef}
                className="grid min-w-[880px] gap-1"
                style={{
                  gridTemplateColumns: '1.4rem repeat(18, minmax(0, 1fr))',
                  gridTemplateRows: '1rem repeat(7, auto) 0.6rem repeat(2, auto)',
                }}
              >
                {/* Group numbers */}
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={`g${i}`}
                    style={{ gridColumn: i + 2, gridRow: 1 }}
                    className="text-center text-[10px] font-semibold text-slate-400"
                    aria-hidden
                  >
                    {i + 1}
                  </div>
                ))}
                {/* Period numbers */}
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={`p${i}`}
                    style={{ gridColumn: 1, gridRow: i + 2 }}
                    className="flex items-center justify-center text-[10px] font-semibold text-slate-400"
                    aria-hidden
                  >
                    {i + 1}
                  </div>
                ))}
                {/* f-block placeholders */}
                <div
                  style={{ gridColumn: 4, gridRow: 7 }}
                  className="flex min-h-[3.1rem] items-center justify-center rounded-md bg-fuchsia-50 text-[10px] font-semibold text-fuchsia-700 ring-1 ring-fuchsia-100"
                  aria-hidden
                >
                  57–71
                </div>
                <div
                  style={{ gridColumn: 4, gridRow: 8 }}
                  className="flex min-h-[3.1rem] items-center justify-center rounded-md bg-pink-50 text-[10px] font-semibold text-pink-700 ring-1 ring-pink-100"
                  aria-hidden
                >
                  89–103
                </div>
                <div style={{ gridColumn: '2 / 4', gridRow: 10 }} className="flex items-center justify-end pr-1 text-[10px] font-semibold text-fuchsia-700" aria-hidden>
                  {t('catLanthanide')}
                </div>
                <div style={{ gridColumn: '2 / 4', gridRow: 11 }} className="flex items-center justify-end pr-1 text-[10px] font-semibold text-pink-700" aria-hidden>
                  {t('catActinide')}
                </div>
                {cells}
              </div>
            </div>
          </div>

          {/* Detail: side panel on wide screens, bottom sheet otherwise */}
          {el ? (
            <div
              ref={detailRef}
              className="thin-scroll fixed inset-x-0 bottom-0 z-20 max-h-[62vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl lg:static lg:max-h-none lg:w-[400px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none"
            >
              <ElementDetail el={el} t={t} nameLang={nameLang} noteLang={noteLang} onClose={() => setSelected(null)} onAsk={() => askCoach(el)} />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {t('ptContentLang') ? <p className="text-xs text-slate-500">{t('ptContentLang')}</p> : null}
            {TRENDS.map((tr) => (
              <TrendCard key={tr.id} tr={tr} t={t} lang={noteLang} onShow={tr.colorMode ? () => showTrend(tr) : undefined} />
            ))}
            <h3 className="pt-2 text-base font-semibold text-slate-900">{t('ptQuickFacts')}</h3>
            {TRAPS.map((tp, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-1 font-semibold text-slate-800">{tp.title[noteLang]}</div>
                <div className="text-sm leading-relaxed text-slate-700">
                  <Inline text={tp.body[noteLang]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span className={`inline-block h-3 w-3 rounded ring-1 ring-black/5 ${className}`} aria-hidden />
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-100">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function ElementDetail({
  el,
  t,
  nameLang,
  noteLang,
  onClose,
  onAsk,
}: {
  el: ElementData;
  t: TFunc;
  nameLang: 'en' | 'ja' | 'zh' | 'tr';
  noteLang: 'en' | 'ja';
  onClose: () => void;
  onAsk: () => void;
}) {
  const info = electronInfo(el.z);
  const cat = CAT_STYLE[el.cat];
  const st = STATE_STYLE[el.state];
  const notes = el.notes;
  return (
    <div className="p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-bold ${cat.bg} ${cat.text}`}>
          {el.sym}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold leading-tight text-slate-900">{el.name[nameLang]}</div>
          {nameLang !== 'en' ? <div className="text-xs text-slate-500">{el.name.en}</div> : null}
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cat.bg} ${cat.text}`}>{t(cat.key)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.bg} ${st.text}`}>{t(st.key)}</span>
            {isKeyElement(el) ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">★ {t('ptKeyElement')}</span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Stat label={t('ptAtomicNumber')} value={String(el.z)} />
        <Stat label={t('ptAtomicMass')} value={el.mass} />
        <Stat label={t('ptPeriod')} value={String(el.period)} />
        <Stat label={t('ptGroup')} value={el.group ? String(el.group) : t(cat.key)} />
        <Stat label={t('ptBlock')} value={info.block} />
        <Stat label={t('ptEn')} value={el.en != null ? el.en.toFixed(2) : '—'} />
      </div>
      {el.group === 12 ? <p className="mt-1.5 text-[11px] text-slate-500">{t('ptTypicalNote')}</p> : null}

      <div className="mt-3 space-y-1.5 text-sm">
        <div>
          <span className="font-semibold text-slate-500">{t('ptShells')}: </span>
          <span className="font-mono text-slate-800">{info.shellText}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-500">{t('ptConfig')}: </span>
          <span className="font-mono text-slate-800">{info.short}</span>
        </div>
        {info.valence != null ? (
          <div>
            <span className="font-semibold text-slate-500">{t('ptValence')}: </span>
            <span className="text-slate-800">{info.valence}</span>
          </div>
        ) : null}
        {notes?.ions ? (
          <div>
            <span className="font-semibold text-slate-500">{t('ptIons')}: </span>
            <span className="text-slate-800">{notes.ions[noteLang]}</span>
          </div>
        ) : null}
        {notes?.flame ? (
          <div>
            <span className="font-semibold text-slate-500">{t('ptFlame')}: </span>
            <span className="text-slate-800">{notes.flame[noteLang]}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ptEjuNotes')}</div>
        {notes ? (
          <ul className="space-y-2">
            {notes[noteLang].map((line, i) => (
              <li key={i} className="flex gap-2 rounded-xl bg-amber-50/70 px-3 py-2 text-sm leading-relaxed text-slate-800 ring-1 ring-amber-100">
                <span className="mt-0.5 text-amber-500" aria-hidden>
                  •
                </span>
                <span className="min-w-0 flex-1 break-words">
                  <Inline text={line} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-100">{t('ptRare')}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onAsk}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <AskIcon className="h-4 w-4" /> {t('ptAskCoach')}
      </button>
    </div>
  );
}

/** Tiny picture of the table with arrows showing how the property changes. */
function TrendGlyph({ across, down }: { across?: 'up' | 'down'; down?: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 96 64" className="h-16 w-24 shrink-0" aria-hidden>
      <rect x="6" y="14" width="80" height="44" rx="4" className="fill-slate-100 stroke-slate-300" />
      {across ? (
        <>
          <line x1="14" y1="8" x2="78" y2="8" className="stroke-slate-700" strokeWidth="2" markerEnd="url(#arr)" />
          <text x="46" y="7" textAnchor="middle" fontSize="7" className="fill-slate-700">
            {across === 'up' ? '+' : '−'}
          </text>
        </>
      ) : null}
      {down ? (
        <>
          <line x1="92" y1="18" x2="92" y2="54" className="stroke-slate-700" strokeWidth="2" markerEnd="url(#arr)" />
          <text x="91" y="40" fontSize="7" className="fill-slate-700">
            {down === 'up' ? '+' : '−'}
          </text>
        </>
      ) : null}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" className="fill-slate-700" />
        </marker>
      </defs>
    </svg>
  );
}

function TrendCard({ tr, t, lang, onShow }: { tr: Trend; t: TFunc; lang: 'en' | 'ja'; onShow?: () => void }) {
  const dir = (d?: 'up' | 'down') => (d ? (d === 'up' ? t('ptIncreases') : t('ptDecreases')) : null);
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <TrendGlyph across={tr.across} down={tr.down} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{tr.title[lang]}</h3>
          <p className="mt-1 text-sm text-slate-800">
            <span className="font-semibold text-slate-500">{t('ptRule')}: </span>
            <Inline text={tr.rule[lang]} />
          </p>
          {tr.across || tr.down ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tr.across ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {t('ptAcross')} {dir(tr.across)}
                </span>
              ) : null}
              {tr.down ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {t('ptDown')} {dir(tr.down)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-500">{t('ptWhy')}: </span>
        <Inline text={tr.why[lang]} />
      </p>
      <div className="mt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ptExamples')}</div>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {tr.examples[lang].map((x, i) => (
            <li key={i}>
              <Inline text={x} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">⚠ {t('ptExceptions')}</div>
        <ul className="mt-1 space-y-1.5 text-sm leading-relaxed text-slate-800">
          {tr.exceptions[lang].map((x, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-500" aria-hidden>
                •
              </span>
              <span className="min-w-0 flex-1">
                <Inline text={x} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {onShow ? (
        <button
          type="button"
          onClick={onShow}
          className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {t('ptShowOnTable')} →
        </button>
      ) : null}
    </section>
  );
}
