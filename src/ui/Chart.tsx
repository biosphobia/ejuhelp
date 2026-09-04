// Renders the ```chart blocks the coach can emit: a small JSON spec that we draw
// natively as an SVG (no charting library, works offline, matches the notes'
// figures). Anything malformed falls back to showing the raw JSON.
import { Plot } from './diagrams';

interface LineSpec {
  type: 'line';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  series: { name?: string; points: [number, number][]; dash?: boolean }[];
  vlines?: { x: number; label?: string }[];
  hlines?: { y: number; label?: string }[];
}
interface BarSpec {
  type: 'bar';
  title?: string;
  yLabel?: string;
  categories: string[];
  values: number[];
}
type Spec = LineSpec | BarSpec;

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);

function parse(json: string): Spec | null {
  let raw: any;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;
  if (raw.type === 'bar') {
    const categories = Array.isArray(raw.categories) ? raw.categories.map(String) : [];
    const values = Array.isArray(raw.values) ? raw.values.map(num) : [];
    if (!categories.length || categories.length !== values.length || values.some((v: number | null) => v === null)) return null;
    return { type: 'bar', title: raw.title, yLabel: raw.yLabel, categories, values: values as number[] };
  }
  const seriesRaw = Array.isArray(raw.series) ? raw.series : Array.isArray(raw.points) ? [{ points: raw.points }] : [];
  const series = seriesRaw
    .map((s: any) => ({
      name: typeof s?.name === 'string' ? s.name : undefined,
      dash: Boolean(s?.dash),
      points: (Array.isArray(s?.points) ? s.points : [])
        .map((p: any) => (Array.isArray(p) ? [num(p[0]), num(p[1])] : p && typeof p === 'object' ? [num(p.x), num(p.y)] : [null, null]))
        .filter((p: (number | null)[]) => p[0] !== null && p[1] !== null) as [number, number][],
    }))
    .filter((s: { points: [number, number][] }) => s.points.length >= 2)
    .slice(0, 5);
  if (!series.length) return null;
  const lines = (arr: any, key: 'x' | 'y') =>
    Array.isArray(arr)
      ? arr
          .map((l: any) => ({ [key]: num(l?.[key]), label: typeof l?.label === 'string' ? l.label : undefined }))
          .filter((l: any) => l[key] !== null)
      : undefined;
  return {
    type: 'line',
    title: raw.title,
    xLabel: raw.xLabel,
    yLabel: raw.yLabel,
    series,
    vlines: lines(raw.vlines, 'x') as any,
    hlines: lines(raw.hlines, 'y') as any,
  };
}

function niceRange(lo: number, hi: number): [number, number] {
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  const step = Math.pow(10, Math.floor(Math.log10(span)));
  const a = Math.min(0, Math.floor(lo / step) * step);
  const b = Math.ceil(hi / step) * step;
  return [lo >= 0 ? a : Math.floor(lo / step) * step, b === lo ? b + step : b];
}

function BarChart({ spec }: { spec: BarSpec }) {
  const w = 340;
  const h = 200;
  const pad = { l: 36, r: 12, t: 14, b: 34 };
  const W = w - pad.l - pad.r;
  const H = h - pad.t - pad.b;
  const maxV = Math.max(...spec.values, 0);
  const minV = Math.min(...spec.values, 0);
  const [lo, hi] = niceRange(minV, maxV);
  const sy = (v: number) => pad.t + H - ((v - lo) / (hi - lo)) * H;
  const slot = W / spec.categories.length;
  const bw = Math.min(48, slot * 0.6);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full max-w-[420px]" role="img">
      <line x1={pad.l} y1={sy(0)} x2={pad.l + W} y2={sy(0)} stroke="#334155" strokeWidth="1.2" />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + H} stroke="#334155" strokeWidth="1.2" />
      {[lo, (lo + hi) / 2, hi].map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={sy(v)} x2={pad.l + W} y2={sy(v)} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={pad.l - 4} y={sy(v) + 3} fontSize="9" textAnchor="end" fill="#334155">
            {Number(v.toPrecision(3))}
          </text>
        </g>
      ))}
      {spec.values.map((v, i) => {
        const x = pad.l + slot * i + (slot - bw) / 2;
        const y0 = sy(0);
        const y1 = sy(v);
        return (
          <g key={i}>
            <rect x={x} y={Math.min(y0, y1)} width={bw} height={Math.abs(y0 - y1)} fill={COLORS[i % COLORS.length]} rx="3" opacity="0.9" />
            <text x={x + bw / 2} y={Math.min(y0, y1) - 3} fontSize="9" textAnchor="middle" fill="#334155">
              {Number(v.toPrecision(3))}
            </text>
            <text x={x + bw / 2} y={pad.t + H + 12} fontSize="9" textAnchor="middle" fill="#334155">
              {spec.categories[i].length > 12 ? spec.categories[i].slice(0, 11) + '…' : spec.categories[i]}
            </text>
          </g>
        );
      })}
      {spec.yLabel ? (
        <text x={pad.l + 6} y={pad.t + 4} fontSize="10" fill="#334155">
          {spec.yLabel}
        </text>
      ) : null}
    </svg>
  );
}

export default function ChartBlock({ json }: { json: string }) {
  const spec = parse(json);
  if (!spec) {
    return (
      <pre className="thin-scroll my-2 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
        {json}
      </pre>
    );
  }
  if (spec.type === 'bar') {
    return (
      <figure className="my-3">
        <BarChart spec={spec} />
        {spec.title ? <figcaption className="mt-1 text-center text-xs text-slate-500">{spec.title}</figcaption> : null}
      </figure>
    );
  }
  const xs = spec.series.flatMap((s) => s.points.map((p) => p[0])).concat((spec.vlines ?? []).map((l) => l.x));
  const ys = spec.series.flatMap((s) => s.points.map((p) => p[1])).concat((spec.hlines ?? []).map((l) => l.y));
  const xr = niceRange(Math.min(...xs), Math.max(...xs));
  const yr = niceRange(Math.min(...ys), Math.max(...ys));
  return (
    <Plot
      x={xr}
      y={yr}
      xLabel={spec.xLabel}
      yLabel={spec.yLabel}
      w={360}
      h={220}
      curves={spec.series.map((s, i) => ({
        pts: [...s.points].sort((a, b) => a[0] - b[0]),
        color: COLORS[i % COLORS.length],
        label: s.name,
        dash: s.dash,
      }))}
      vlines={spec.vlines}
      hlines={spec.hlines}
      caption={spec.title}
    />
  );
}
