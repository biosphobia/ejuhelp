import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { useUI, SUBJECTS } from '../lib/ui';
import { useMindmap, categoryKeyOf, GENERAL_KEY, type Concept, type ConceptKind } from '../lib/mindmap';
import { NOTEBOOK_COLOR } from '../lib/notebooks';
import { fetchTopics } from '../lib/api';
import { useT } from '../i18n';
import { Inline } from '../ui/Markdown';
import { MindmapIcon, AskIcon, ResetIcon, TrashIcon, StarIcon } from '../ui/icons';

const MIN = 0.25;
const MAX = 2.5;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Layout radii (world px).
const CAT_RADIUS = 270;
const CONCEPT_RADIUS = 170;

interface View {
  x: number;
  y: number;
  scale: number;
}
const DEFAULT_VIEW: View = { x: 0, y: 0, scale: 0.9 };

type GNode =
  | { type: 'hub'; id: string; x: number; y: number; label: string; color: string }
  | { type: 'category'; id: string; key: string; x: number; y: number; label: string; color: string; count: number; expanded: boolean }
  | { type: 'concept'; id: string; x: number; y: number; color: string; kind: ConceptKind; concept: Concept };
interface GEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

/** Build the per-subject node graph: subject hub → category nodes → (expanded) concept nodes. */
function buildGraph(
  concepts: Concept[],
  subjectLabel: string,
  color: string,
  expanded: Set<string>,
  labelOf: (key: string) => string
) {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  nodes.push({ type: 'hub', id: 'hub', x: 0, y: 0, label: subjectLabel, color });

  // Group by canonical category key, preserving first-seen order.
  const groups = new Map<string, Concept[]>();
  for (const c of concepts) {
    const k = categoryKeyOf(c);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(c);
  }
  const cats = [...groups.entries()];
  const n = cats.length;

  cats.forEach(([key, items], i) => {
    const theta = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, n);
    const cx = Math.cos(theta) * CAT_RADIUS;
    const cy = Math.sin(theta) * CAT_RADIUS;
    const isOpen = expanded.has(key);
    nodes.push({
      type: 'category',
      id: `cat:${key}`,
      key,
      x: cx,
      y: cy,
      label: labelOf(key),
      color,
      count: items.length,
      expanded: isOpen,
    });
    edges.push({ id: `e:cat:${key}`, x1: 0, y1: 0, x2: cx, y2: cy, color, width: 2 });

    if (!isOpen) return;
    const m = items.length;
    const spread = Math.min(Math.PI * 1.1, Math.max(0.001, (m - 1) * 0.4));
    const step = m > 1 ? spread / (m - 1) : 0;
    items.forEach((c, j) => {
      const a = theta + (j - (m - 1) / 2) * step;
      const r = CONCEPT_RADIUS + (j % 2) * 34;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      nodes.push({ type: 'concept', id: c.id, x: px, y: py, color, kind: c.kind, concept: c });
      edges.push({ id: `e:${c.id}`, x1: cx, y1: cy, x2: px, y2: py, color: '#475569', width: 1.4 });
    });
  });

  return { nodes, edges };
}

/** Fallback display label for a category id when the taxonomy hasn't loaded. */
const prettifyCategory = (id: string) =>
  id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Mindmap() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const setSubject = useUI((s) => s.setSubject);
  const toggleMindmap = useUI((s) => s.toggleMindmap);
  const openPanel = useUI((s) => s.openPanel);
  const concepts = useMindmap((s) => s.concepts);
  const removeConcept = useMindmap((s) => s.remove);
  const clearSubject = useMindmap((s) => s.clearSubject);
  const toggleStar = useMindmap((s) => s.toggleStar);

  const subjectConcepts = useMemo(() => concepts.filter((c) => c.subject === subject), [concepts, subject]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Concept | null>(null);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [starredOnly, setStarredOnly] = useState(false);
  // Canonical category id → localized label, from the subject's EJU taxonomy.
  const [catLabels, setCatLabels] = useState<Record<string, string>>({});

  const starCount = useMemo(() => subjectConcepts.filter((c) => c.starred).length, [subjectConcepts]);
  // When favourites-only is on, show just the starred nodes with every category
  // they live in pre-expanded, so they're a quick glance away.
  const visible = useMemo(
    () => (starredOnly ? subjectConcepts.filter((c) => c.starred) : subjectConcepts),
    [subjectConcepts, starredOnly]
  );
  const effExpanded = useMemo(
    () => (starredOnly ? new Set(visible.map(categoryKeyOf)) : expanded),
    [starredOnly, visible, expanded]
  );

  // Reset interaction state when switching subjects (each subject is its own map).
  useEffect(() => {
    setExpanded(new Set());
    setSelected(null);
    setView(DEFAULT_VIEW);
    setStarredOnly(false);
  }, [subject]);

  // Leave favourites-only automatically once nothing is starred.
  useEffect(() => {
    if (starredOnly && starCount === 0) setStarredOnly(false);
  }, [starredOnly, starCount]);

  // Load localized category names for the active subject.
  useEffect(() => {
    let alive = true;
    fetchTopics({ subject, lang })
      .then((r) => {
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const t of r.topics) map[t.id] = t.name;
        setCatLabels(map);
      })
      .catch(() => alive && setCatLabels({}));
    return () => {
      alive = false;
    };
  }, [subject, lang]);

  // Drop a selected concept that no longer exists (e.g. removed).
  useEffect(() => {
    if (selected && !subjectConcepts.some((c) => c.id === selected.id)) setSelected(null);
  }, [subjectConcepts, selected]);

  // Live view of the selected concept (so its star state in the card stays current).
  const selectedLive = selected ? subjectConcepts.find((c) => c.id === selected.id) ?? null : null;

  const labelOf = (key: string) =>
    key === GENERAL_KEY ? t('categoryGeneral') : catLabels[key] ?? prettifyCategory(key);

  const color = NOTEBOOK_COLOR[subject];
  const { nodes, edges } = useMemo(
    () => buildGraph(visible, t(subject), color, effExpanded, labelOf),
    [visible, subject, color, effExpanded, catLabels, lang, t]
  );

  // ---- pan / zoom / pinch ----
  const vpRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const base = useRef<{ cx: number; cy: number; dist: number; view: View } | null>(null);

  const rel = (clientX: number, clientY: number) => {
    const r = vpRef.current!.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  };
  const rebase = () => {
    const pts = [...ptrs.current.values()];
    if (!pts.length) {
      base.current = null;
      return;
    }
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const dist = pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    base.current = { cx, cy, dist, view: viewRef.current };
  };
  const onBgPointerDown = (e: ReactPointerEvent) => {
    ptrs.current.set(e.pointerId, rel(e.clientX, e.clientY));
    rebase();
    setSelected(null); // tapping empty space dismisses the detail card
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!ptrs.current.has(e.pointerId)) return;
      ptrs.current.set(e.pointerId, rel(e.clientX, e.clientY));
      const b = base.current;
      if (!b) return;
      const pts = [...ptrs.current.values()];
      const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
      const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      const dist = pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
      let scale = b.view.scale;
      if (pts.length >= 2 && b.dist > 0) scale = clamp(b.view.scale * (dist / b.dist), MIN, MAX);
      const wx = (b.cx - b.view.x) / b.view.scale;
      const wy = (b.cy - b.view.y) / b.view.scale;
      setView({ scale, x: cx - wx * scale, y: cy - wy * scale });
    };
    const up = (e: PointerEvent) => {
      if (!ptrs.current.delete(e.pointerId)) return;
      rebase(); // rebaseline any remaining fingers so a lift doesn't jump the view
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const onWheel = (e: ReactWheelEvent) => {
    const r = rel(e.clientX, e.clientY);
    const v = viewRef.current;
    const factor = Math.exp(-e.deltaY * 0.0015);
    const scale = clamp(v.scale * factor, MIN, MAX);
    const wx = (r.x - v.x) / v.scale;
    const wy = (r.y - v.y) / v.scale;
    setView({ scale, x: r.x - wx * scale, y: r.y - wy * scale });
  };

  const toggleCat = (label: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 select-none overflow-hidden bg-slate-950 text-slate-100">
      {/* faint dotted backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* pan/zoom surface */}
      <div ref={vpRef} onWheel={onWheel} className="absolute inset-0 touch-none">
        {/* background catch layer for panning from empty space */}
        <div onPointerDown={onBgPointerDown} className="absolute inset-0" />

        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}
        >
          <svg className="absolute left-0 top-0 overflow-visible" width="1" height="1">
            {edges.map((ed) => (
              <line
                key={ed.id}
                x1={ed.x1}
                y1={ed.y1}
                x2={ed.x2}
                y2={ed.y2}
                stroke={ed.color}
                strokeWidth={ed.width}
                strokeOpacity={0.55}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {nodes.map((node) => {
            const common = 'absolute -translate-x-1/2 -translate-y-1/2';
            const posStyle = { left: node.x, top: node.y } as const;
            if (node.type === 'hub') {
              return (
                <div key={node.id} className={`${common} grid place-items-center`} style={posStyle}>
                  <div
                    className="grid h-24 w-24 place-items-center rounded-full text-center text-sm font-bold text-white shadow-lg"
                    style={{ backgroundColor: node.color, boxShadow: `0 0 36px ${node.color}66` }}
                  >
                    {node.label}
                  </div>
                </div>
              );
            }
            if (node.type === 'category') {
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => toggleCat(node.key)}
                  className={`${common} flex max-w-[180px] items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold shadow-lg ring-1 transition ${
                    node.expanded
                      ? 'bg-slate-700 text-white ring-white/20'
                      : 'bg-slate-800 text-slate-200 ring-white/10 hover:bg-slate-700'
                  }`}
                  style={posStyle}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: node.color }} />
                  <span className="truncate">{node.label}</span>
                  <span className="shrink-0 rounded-full bg-black/30 px-1.5 text-xs font-bold text-slate-300">
                    {node.count}
                  </span>
                </button>
              );
            }
            // concept
            const accent = node.kind === 'formula' ? 'text-indigo-300' : 'text-amber-300';
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelected(node.concept)}
                className={`${common} flex max-w-[190px] items-start gap-1.5 rounded-xl border bg-slate-900/90 px-2.5 py-1.5 text-left text-xs shadow-md backdrop-blur transition hover:border-white/30 ${
                  selected?.id === node.concept.id ? 'ring-2 ring-white/40' : ''
                } ${node.concept.starred ? 'border-amber-400/60' : 'border-white/10'}`}
                style={posStyle}
              >
                {node.concept.starred ? (
                  <StarIcon fill="currentColor" className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 text-amber-400" />
                ) : null}
                <span className={`mt-0.5 shrink-0 text-[10px] font-bold ${accent}`}>
                  {node.kind === 'formula' ? '∑' : '✦'}
                </span>
                <span className="line-clamp-2 text-slate-100">
                  <Inline text={node.concept.text} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* favourites filter */}
      {starCount > 0 ? (
        <button
          type="button"
          title={t('starredOnly')}
          aria-label={t('starredOnly')}
          onClick={() => setStarredOnly((v) => !v)}
          className={`absolute left-3 top-3 flex h-10 items-center gap-1.5 rounded-xl px-2.5 shadow-lg ring-1 transition ${
            starredOnly
              ? 'bg-amber-400 text-slate-900 ring-amber-300'
              : 'bg-slate-800/90 text-slate-300 ring-white/10 hover:bg-slate-700'
          }`}
        >
          <StarIcon fill={starredOnly ? 'currentColor' : 'none'} className="h-5 w-5" />
          <span className="text-sm font-semibold">{starCount}</span>
        </button>
      ) : null}

      {/* recenter */}
      <button
        type="button"
        title={t('recenter')}
        aria-label={t('recenter')}
        onClick={() => setView(DEFAULT_VIEW)}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-slate-800/90 text-slate-300 shadow-lg ring-1 ring-white/10 hover:bg-slate-700"
      >
        <ResetIcon />
      </button>

      {/* clear this subject's map */}
      {subjectConcepts.length > 0 ? (
        <button
          type="button"
          title={t('clearSubjectMap')}
          aria-label={t('clearSubjectMap')}
          onClick={() => {
            if (window.confirm(t('clearSubjectConfirm', { subject: t(subject) }))) {
              clearSubject(subject);
              setSelected(null);
              setExpanded(new Set());
            }
          }}
          className="absolute right-3 top-16 grid h-10 w-10 place-items-center rounded-xl bg-slate-800/90 text-slate-300 shadow-lg ring-1 ring-white/10 transition hover:bg-red-500/80 hover:text-white"
        >
          <TrashIcon />
        </button>
      ) : null}

      {/* selected-concept detail card */}
      {selectedLive ? (
        <div className="absolute bottom-24 left-1/2 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-slate-900/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                selectedLive.kind === 'formula' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {selectedLive.kind === 'formula' ? t('kindFormula') : t('kindFact')}
            </span>
            <span className="truncate text-xs text-slate-400">{labelOf(categoryKeyOf(selectedLive))}</span>
          </div>
          <div className="thin-scroll max-h-40 overflow-y-auto text-sm text-slate-100">
            <Inline text={selectedLive.text} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleStar(selectedLive.id)}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                selectedLive.starred ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <StarIcon fill={selectedLive.starred ? 'currentColor' : 'none'} className="h-3.5 w-3.5" />
              {selectedLive.starred ? t('starred') : t('star')}
            </button>
            <button
              type="button"
              onClick={() => removeConcept(selectedLive.id)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:text-red-400"
            >
              <TrashIcon className="h-3.5 w-3.5" /> {t('removeConcept')}
            </button>
          </div>
        </div>
      ) : null}

      {/* dark bottom bar: back-to-board · subjects · coach */}
      <div className="bottom-bar-safe absolute left-1/2 flex max-w-[96vw] -translate-x-1/2 items-center gap-1 rounded-2xl bg-slate-800/90 p-1.5 shadow-xl ring-1 ring-white/10 backdrop-blur">
        <button
          type="button"
          title={t('backToBoard')}
          aria-label={t('backToBoard')}
          onClick={toggleMindmap}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
        >
          <MindmapIcon />
        </button>

        <span className="mx-1 h-7 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          {SUBJECTS.map((s) => {
            const active = s === subject;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold transition ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={active ? { backgroundColor: NOTEBOOK_COLOR[s] } : undefined}
              >
                {t(s)}
              </button>
            );
          })}
        </div>

        <span className="mx-1 h-7 w-px bg-white/10" />

        <button
          type="button"
          title={t('askCoach')}
          aria-label={t('askCoach')}
          onClick={() => openPanel('ask')}
          className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <AskIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{t('askCoach')}</span>
        </button>
      </div>
    </div>
  );
}
