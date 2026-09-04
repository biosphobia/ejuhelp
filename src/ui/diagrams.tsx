// Small, hand-drawn SVG figures for the study notes, plus a tiny plotting
// helper for graph-type figures. Figures are referenced from note bodies as
// ":::fig <id>". Keep each one minimal: the point is to grasp the idea at a
// glance, not to be a textbook illustration.
import type { ReactNode } from 'react';
import { useUI } from '../lib/ui';

type Pt = [number, number];
interface Curve {
  pts: Pt[];
  color?: string;
  label?: string;
  dash?: boolean;
  width?: number;
  /** Index of the point to anchor the label at (default: last point). */
  labelAt?: number;
}
interface PlotProps {
  x: [number, number];
  y: [number, number];
  xLabel?: string;
  yLabel?: string;
  curves: Curve[];
  /** Vertical / horizontal guide lines at data coordinates, with optional labels. */
  vlines?: { x: number; label?: string }[];
  hlines?: { y: number; label?: string }[];
  points?: { x: number; y: number; label?: string; color?: string }[];
  w?: number;
  h?: number;
  caption?: ReactNode;
}

const C = {
  a: '#2563eb', // blue
  b: '#dc2626', // red
  c: '#16a34a', // green
  d: '#d97706', // amber
  e: '#7c3aed', // violet
  ink: '#334155',
  faint: '#cbd5e1',
};

export function Plot({ x, y, xLabel, yLabel, curves, vlines, hlines, points, w = 320, h = 200, caption }: PlotProps) {
  const pad = { l: 34, r: 12, t: 12, b: 30 };
  const W = w - pad.l - pad.r;
  const H = h - pad.t - pad.b;
  const sx = (v: number) => pad.l + ((v - x[0]) / (x[1] - x[0])) * W;
  const sy = (v: number) => pad.t + H - ((v - y[0]) / (y[1] - y[0])) * H;
  const path = (pts: Pt[]) => pts.map(([px, py], i) => `${i ? 'L' : 'M'}${sx(px).toFixed(1)},${sy(py).toFixed(1)}`).join(' ');
  const x0 = sx(Math.max(x[0], Math.min(0, x[1])));
  const y0 = sy(Math.max(y[0], Math.min(0, y[1])));
  return (
    <figure className="my-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full max-w-[380px]" role="img">
        {/* axes */}
        <line x1={pad.l} y1={y0} x2={pad.l + W + 4} y2={y0} stroke={C.ink} strokeWidth="1.2" markerEnd="url(#plot-arrow)" />
        <line x1={x0} y1={pad.t + H} x2={x0} y2={pad.t - 4} stroke={C.ink} strokeWidth="1.2" markerEnd="url(#plot-arrow)" />
        <defs>
          <marker id="plot-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill={C.ink} />
          </marker>
        </defs>
        {hlines?.map((l, i) => (
          <g key={`h${i}`}>
            <line x1={pad.l} y1={sy(l.y)} x2={pad.l + W} y2={sy(l.y)} stroke={C.faint} strokeDasharray="3 3" />
            {l.label ? (
              <text x={pad.l - 4} y={sy(l.y) + 3} fontSize="9" textAnchor="end" fill={C.ink}>
                {l.label}
              </text>
            ) : null}
          </g>
        ))}
        {vlines?.map((l, i) => (
          <g key={`v${i}`}>
            <line x1={sx(l.x)} y1={pad.t} x2={sx(l.x)} y2={pad.t + H} stroke={C.faint} strokeDasharray="3 3" />
            {l.label ? (
              <text x={sx(l.x)} y={pad.t + H + 11} fontSize="9" textAnchor="middle" fill={C.ink}>
                {l.label}
              </text>
            ) : null}
          </g>
        ))}
        {curves.map((c, i) => (
          <path
            key={i}
            d={path(c.pts)}
            fill="none"
            stroke={c.color ?? C.a}
            strokeWidth={c.width ?? 2}
            strokeDasharray={c.dash ? '5 4' : undefined}
            strokeLinejoin="round"
          />
        ))}
        {curves.map((c, i) =>
          c.label ? (
            <text
              key={`l${i}`}
              x={sx(c.pts[c.labelAt ?? c.pts.length - 1][0]) - 2}
              y={sy(c.pts[c.labelAt ?? c.pts.length - 1][1]) - 5}
              fontSize="10"
              textAnchor="end"
              fill={c.color ?? C.a}
              fontWeight="600"
            >
              {c.label}
            </text>
          ) : null
        )}
        {points?.map((p, i) => (
          <g key={`p${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r="3.5" fill={p.color ?? C.b} />
            {p.label ? (
              <text x={sx(p.x) + 6} y={sy(p.y) - 5} fontSize="10" fill={C.ink}>
                {p.label}
              </text>
            ) : null}
          </g>
        ))}
        {xLabel ? (
          <text x={pad.l + W} y={h - 4} fontSize="10" textAnchor="end" fill={C.ink}>
            {xLabel}
          </text>
        ) : null}
        {yLabel ? (
          <text x={pad.l + 6} y={pad.t + 4} fontSize="10" fill={C.ink}>
            {yLabel}
          </text>
        ) : null}
      </svg>
      {caption ? <figcaption className="mt-1 text-center text-xs text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

/** Generic wrapper for hand-drawn figures. */
function Fig({ w, h, children, caption }: { w: number; h: number; children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full max-w-[380px]" role="img" fontSize="11" fill={C.ink}>
        <defs>
          <marker id="ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="context-stroke" />
          </marker>
          <marker id="ar-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill={C.a} />
          </marker>
          <marker id="ar-b" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill={C.b} />
          </marker>
          <marker id="ar-c" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill={C.c} />
          </marker>
          <marker id="ar-d" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill={C.d} />
          </marker>
          <marker id="ar-k" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill={C.ink} />
          </marker>
        </defs>
        {children}
      </svg>
      {caption ? <figcaption className="mt-1 text-center text-xs text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

/** Arrow from (x1,y1) to (x2,y2) in a named colour with a label. */
function Arrow({ x1, y1, x2, y2, c = 'k', label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; c?: 'a' | 'b' | 'c' | 'd' | 'k'; label?: string; lx?: number; ly?: number }) {
  const col = c === 'k' ? C.ink : C[c];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2" markerEnd={`url(#ar-${c})`} />
      {label ? (
        <text x={lx ?? x2 + 4} y={ly ?? y2} fill={col} fontWeight="600">
          {label}
        </text>
      ) : null}
    </g>
  );
}

type L = 'en' | 'ja';
const useL = (): L => (useUI((s) => s.lang) === 'ja' ? 'ja' : 'en');
const bi = (l: L, en: string, ja: string) => (l === 'ja' ? ja : en);

// ─── Figure registry ───
const FIGS: Record<string, (l: L) => ReactNode> = {
  // ── Mechanics ──
  projectile: (l) => (
    <Fig w={340} h={200} caption={bi(l, 'Horizontal: constant vₓ. Vertical: free fall with g. The two never affect each other.', '水平：vₓ 一定。鉛直：g の自由落下。互いに影響しない。')}>
      <line x1="20" y1="170" x2="330" y2="170" stroke={C.ink} />
      <path d="M40,170 Q170,-130 300,170" fill="none" stroke={C.faint} strokeWidth="2" strokeDasharray="4 3" />
      {[40, 105, 170, 235, 300].map((x, i) => {
        const t = (x - 40) / 260;
        const y = 170 - 4 * 150 * t * (1 - t);
        return <circle key={i} cx={x} cy={y} r="4" fill={C.ink} />;
      })}
      <Arrow x1={105} y1={98} x2={150} y2={98} c="a" label="vₓ" />
      <Arrow x1={105} y1={98} x2={105} y2={62} c="b" label="vᵧ" lx={90} ly={60} />
      <Arrow x1={235} y1={98} x2={280} y2={98} c="a" label="vₓ" />
      <Arrow x1={235} y1={98} x2={235} y2={134} c="b" label="vᵧ" lx={240} ly={140} />
      <Arrow x1={170} y1={20} x2={215} y2={20} c="a" label="vₓ (top: vᵧ = 0)" />
      <Arrow x1={300} y1={60} x2={300} y2={100} c="d" label="g" />
    </Fig>
  ),
  'incline-fbd': (l) => (
    <Fig w={340} h={210} caption={bi(l, 'Split gravity along and across the slope. Across: N = mg cos θ. Along: mg sin θ drives, friction resists.', '重力を斜面方向と垂直方向に分解。垂直：N = mg cos θ。斜面方向：mg sin θ が動かし、摩擦が逆らう。')}>
      <polygon points="30,180 300,180 300,60" fill="#f1f5f9" stroke={C.ink} />
      <text x="70" y="176">θ</text>
      <g transform="rotate(-24 200 125)">
        <rect x="175" y="105" width="50" height="34" fill="#fde68a" stroke={C.ink} />
      </g>
      <Arrow x1={200} y1={125} x2={200} y2={195} c="k" label="mg" lx={205} ly={198} />
      <Arrow x1={200} y1={125} x2={172} y2={62} c="c" label="N" lx={160} ly={60} />
      <Arrow x1={200} y1={125} x2={140} y2={152} c="b" label="f (friction)" lx={60} ly={160} />
      <Arrow x1={200} y1={125} x2={262} y2={153} c="a" label="mg sin θ" lx={262} ly={170} />
      <Arrow x1={200} y1={125} x2={228} y2={188} c="a" label="mg cos θ" lx={232} ly={200} />
    </Fig>
  ),
  torque: (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Torque = force × perpendicular distance from the pivot. Balance: clockwise = anticlockwise.', '力のモーメント = 力 × 支点からの垂直距離。つり合い：時計回り = 反時計回り。')}>
      <rect x="30" y="70" width="280" height="8" fill="#94a3b8" />
      <polygon points="150,78 135,105 165,105" fill={C.ink} />
      <Arrow x1={60} y1={70} x2={60} y2={30} c="b" label="F₁" lx={66} ly={32} />
      <Arrow x1={280} y1={70} x2={280} y2={110} c="a" label="F₂" lx={286} ly={112} />
      <line x1="60" y1="120" x2="150" y2="120" stroke={C.ink} strokeDasharray="3 3" />
      <line x1="150" y1="120" x2="280" y2="120" stroke={C.ink} strokeDasharray="3 3" />
      <text x="95" y="135">d₁</text>
      <text x="205" y="135">d₂</text>
      <text x="120" y="22" fontWeight="600">F₁ d₁ = F₂ d₂</text>
    </Fig>
  ),
  circular: (l) => (
    <Fig w={300} h={200} caption={bi(l, 'Speed is constant but the direction changes, so there is an acceleration toward the centre: a = v²/r = rω².', '速さは一定でも向きが変わるので、中心向きの加速度 a = v²/r = rω² がある。')}>
      <circle cx="150" cy="105" r="70" fill="none" stroke={C.faint} strokeWidth="2" />
      <circle cx="150" cy="105" r="3" fill={C.ink} />
      <circle cx="220" cy="105" r="6" fill={C.d} />
      <Arrow x1={220} y1={105} x2={220} y2={45} c="a" label="v" lx={226} ly={50} />
      <Arrow x1={220} y1={105} x2={170} y2={105} c="b" label="a, F (to centre)" lx={40} ly={95} />
      <text x="180" y="125">r</text>
      <line x1="150" y1="105" x2="220" y2="105" stroke={C.ink} strokeDasharray="3 3" />
      <text x="120" y="190" fontWeight="600">F = mv²/r = mrω²</text>
    </Fig>
  ),
  'shm-energy': (l) => (
    <Plot
      x={[-1.15, 1.15]}
      y={[0, 1.2]}
      xLabel="x"
      yLabel="E"
      curves={[
        { pts: Array.from({ length: 41 }, (_, i) => [-1 + i / 20, (-1 + i / 20) ** 2] as Pt), color: C.b, label: 'U = ½kx²' },
        { pts: Array.from({ length: 41 }, (_, i) => [-1 + i / 20, 1 - (-1 + i / 20) ** 2] as Pt), color: C.a, label: 'K' },
      ]}
      hlines={[{ y: 1, label: 'E' }]}
      vlines={[{ x: -1, label: '−A' }, { x: 1, label: 'A' }, { x: 0, label: '0' }]}
      caption={bi(l, 'K + U = ½kA² everywhere. K is largest at the centre, zero at the ends; U the reverse.', 'どこでも K + U = ½kA²。K は中心で最大・端で0、U はその逆。')}
    />
  ),
  collision: (l) => (
    <Fig w={340} h={140} caption={bi(l, 'Momentum is conserved in every collision. e compares separation speed to approach speed.', '運動量はどんな衝突でも保存。e は「離れる速さ ÷ 近づく速さ」。')}>
      <text x="20" y="30" fontWeight="600">{bi(l, 'before', '衝突前')}</text>
      <circle cx="90" cy="60" r="16" fill="#bfdbfe" stroke={C.ink} />
      <text x="84" y="64">1</text>
      <Arrow x1={110} y1={60} x2={150} y2={60} c="a" label="v₁" />
      <circle cx="220" cy="60" r="16" fill="#fecaca" stroke={C.ink} />
      <text x="214" y="64">2</text>
      <Arrow x1={240} y1={60} x2={265} y2={60} c="b" label="v₂" />
      <text x="20" y="110" fontWeight="600">{bi(l, 'after', '衝突後')}</text>
      <circle cx="120" cy="125" r="16" fill="#bfdbfe" stroke={C.ink} />
      <Arrow x1={140} y1={125} x2={160} y2={125} c="a" label="v₁'" />
      <circle cx="230" cy="125" r="16" fill="#fecaca" stroke={C.ink} />
      <Arrow x1={250} y1={125} x2={300} y2={125} c="b" label="v₂'" />
      <text x="190" y="20" fontSize="10">e = (v₂' − v₁') / (v₁ − v₂)</text>
    </Fig>
  ),
  // ── Thermodynamics ──
  'pv-diagram': (l) => (
    <Plot
      x={[0, 5]}
      y={[0, 5]}
      xLabel="V"
      yLabel="p"
      curves={[
        { pts: [[1, 4], [4, 4]], color: C.b, label: bi(l, 'isobaric', '定圧') },
        { pts: [[1, 1], [1, 4]], color: C.c, label: bi(l, 'isochoric', '定積') },
        { pts: Array.from({ length: 30 }, (_, i) => [1 + (i * 3) / 29, 4 / (1 + (i * 3) / 29)] as Pt), color: C.a, label: bi(l, 'isothermal pV = const', '等温 pV = 一定') },
        { pts: Array.from({ length: 30 }, (_, i) => [1 + (i * 3) / 29, 4 / (1 + (i * 3) / 29) ** 1.67] as Pt), color: C.e, dash: true, label: bi(l, 'adiabatic (steeper)', '断熱（急）') },
      ]}
      caption={bi(l, 'Work done by the gas = area under the curve. Adiabatic is steeper than isothermal because T falls as the gas expands.', '気体がした仕事 = 曲線の下の面積。断熱線は膨張で T が下がるので等温線より急。')}
    />
  ),
  'maxwell-speeds': (l) => (
    <Plot
      x={[0, 4]}
      y={[0, 1.1]}
      xLabel="v"
      yLabel={bi(l, 'number', '分子数')}
      curves={[
        { pts: Array.from({ length: 60 }, (_, i) => { const v = (i * 4) / 59; return [v, 2.7 * v * v * Math.exp(-v * v)] as Pt; }), color: C.a, label: bi(l, 'low T', '低温'), labelAt: 13 },
        { pts: Array.from({ length: 60 }, (_, i) => { const v = (i * 4) / 59; return [v, 1.15 * v * v * Math.exp(-v * v / 2.2)] as Pt; }), color: C.b, label: bi(l, 'high T', '高温'), labelAt: 26 },
      ]}
      caption={bi(l, 'Higher T: the distribution spreads to higher speeds; ½m⟨v²⟩ = (3/2)kT.', '高温ほど分布は高速側に広がる。½m⟨v²⟩ = (3/2)kT。')}
    />
  ),
  // ── Waves ──
  'wave-snapshot': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Snapshot at one instant (y–x): read λ and A. The dashed curve is the same wave a moment later, moving right.', 'ある瞬間の波形（y–x）：λ と A を読む。点線は少し後の同じ波（右へ進む）。')}>
      <line x1="20" y1="85" x2="330" y2="85" stroke={C.ink} markerEnd="url(#ar-k)" />
      <line x1="30" y1="150" x2="30" y2="20" stroke={C.ink} markerEnd="url(#ar-k)" />
      <path d={Array.from({ length: 61 }, (_, i) => { const x = 30 + i * 5; const y = 85 - 45 * Math.sin((i * 5) / 40); return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke={C.a} strokeWidth="2.5" />
      <path d={Array.from({ length: 61 }, (_, i) => { const x = 30 + i * 5; const y = 85 - 45 * Math.sin((i * 5 - 25) / 40); return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke={C.a} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      <line x1="93" y1="30" x2="344" y2="30" stroke={C.ink} strokeDasharray="2 2" />
      <line x1="93" y1="30" x2="93" y2="40" stroke={C.ink} />
      <line x1="344" y1="30" x2="344" y2="40" stroke={C.ink} />
      <text x="205" y="26" textAnchor="middle" fontWeight="600">λ</text>
      <line x1="45" y1="85" x2="45" y2="40" stroke={C.b} strokeWidth="1.5" />
      <text x="48" y="60" fill={C.b} fontWeight="600">A</text>
      <text x="320" y="100">x</text>
      <text x="36" y="24">y</text>
      <Arrow x1={60} y1={150} x2={120} y2={150} c="c" label="v" />
      <circle cx="115" cy={85 - 45 * Math.sin(85 / 40)} r="4" fill={C.b} />
      <Arrow x1={115} y1={85 - 45 * Math.sin(85 / 40) - 6} x2={115} y2={85 - 45 * Math.sin(85 / 40) - 30} c="b" label={bi(l, 'this point moves up (the crest is coming)', 'この点は上へ（山が来る）')} lx={120} ly={85 - 45 * Math.sin(85 / 40) - 32} />
    </Fig>
  ),
  'standing-wave': (l) => (
    <Fig w={340} h={230} caption={bi(l, 'Top: string fixed at both ends (n = 1, 2, 3). Bottom: closed pipe — node at the closed end, antinode at the open end, so only odd harmonics fit.', '上：両端固定の弦（n = 1, 2, 3）。下：閉管 — 閉じた端が節、開口端が腹なので奇数倍音だけが入る。')}>
      {[0, 1, 2].map((n) => {
        const y0 = 30 + n * 42;
        const path = (sign: number) => Array.from({ length: 61 }, (_, i) => { const x = 40 + i * 3; const y = y0 - sign * 14 * Math.sin(((n + 1) * Math.PI * i) / 60); return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`; }).join(' ');
        return (
          <g key={n}>
            <line x1="40" y1={y0} x2="220" y2={y0} stroke={C.faint} />
            <path d={path(1)} fill="none" stroke={C.a} strokeWidth="2" />
            <path d={path(-1)} fill="none" stroke={C.a} strokeWidth="1" strokeDasharray="3 3" />
            <rect x="36" y={y0 - 16} width="4" height="32" fill={C.ink} />
            <rect x="220" y={y0 - 16} width="4" height="32" fill={C.ink} />
            <text x="232" y={y0 + 4} fontSize="10">n = {n + 1}: L = {n + 1}λ/2</text>
          </g>
        );
      })}
      <g transform="translate(0, 150)">
        <rect x="40" y="10" width="180" height="40" fill="#f1f5f9" stroke={C.ink} />
        <rect x="36" y="8" width="4" height="44" fill={C.ink} />
        <path d={Array.from({ length: 61 }, (_, i) => { const x = 40 + i * 3; const y = 30 - 14 * Math.sin((Math.PI * i) / 120); return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke={C.b} strokeWidth="2" />
        <path d={Array.from({ length: 61 }, (_, i) => { const x = 40 + i * 3; const y = 30 + 14 * Math.sin((Math.PI * i) / 120); return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke={C.b} strokeWidth="1" strokeDasharray="3 3" />
        <text x="232" y="26" fontSize="10">{bi(l, 'closed pipe', '閉管')}</text>
        <text x="232" y="40" fontSize="10">L = λ/4, 3λ/4, 5λ/4…</text>
        <text x="44" y="66" fontSize="10">{bi(l, 'node', '節')}</text>
        <text x="200" y="66" fontSize="10">{bi(l, 'antinode', '腹')}</text>
      </g>
    </Fig>
  ),
  doppler: (l) => (
    <Fig w={340} h={190} caption={bi(l, 'A source moving right leaves each wavefront centred where it was emitted: crests bunch up ahead (shorter λ, higher f) and spread out behind.', '右へ動く音源は、出した位置を中心に波面を残す：前方では山が詰まり（λ 短く f 高い）、後方では広がる。')}>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={125 + i * 18} cy="95" r={(5 - i) * 19} fill="none" stroke={C.a} strokeWidth="1.5" opacity={0.4 + i * 0.12} />
      ))}
      <circle cx="197" cy="95" r="5" fill={C.b} />
      <Arrow x1={204} y1={95} x2={232} y2={95} c="b" label="vₛ" />
      <text x="262" y="30" fontSize="10" fill={C.ink}>{bi(l, 'ahead:', '前方：')}</text>
      <text x="262" y="42" fontSize="10" fill={C.ink}>{bi(l, 'short λ, high f', 'λ 短い、f 高い')}</text>
      <text x="8" y="30" fontSize="10" fill={C.ink}>{bi(l, 'behind:', '後方：')}</text>
      <text x="8" y="42" fontSize="10" fill={C.ink}>{bi(l, 'long λ, low f', 'λ 長い、f 低い')}</text>
    </Fig>
  ),
  refraction: (l) => (
    <Fig w={340} h={200} caption={bi(l, 'Left: into a denser medium the ray bends toward the normal. Right: from dense to rare, beyond the critical angle it is totally reflected.', '左：密な媒質へ入ると法線側へ曲がる。右：密から疎へ、臨界角を超えると全反射。')}>
      <rect x="10" y="100" width="150" height="90" fill="#dbeafe" />
      <line x1="10" y1="100" x2="160" y2="100" stroke={C.ink} />
      <line x1="85" y1="20" x2="85" y2="190" stroke={C.ink} strokeDasharray="3 3" />
      <line x1="30" y1="30" x2="85" y2="100" stroke={C.b} strokeWidth="2" markerEnd="url(#ar-b)" />
      <line x1="85" y1="100" x2="115" y2="185" stroke={C.b} strokeWidth="2" markerEnd="url(#ar-b)" />
      <text x="62" y="70">θ₁</text>
      <text x="90" y="140">θ₂</text>
      <text x="14" y="30" fontSize="10">n₁ ({bi(l, 'air', '空気')})</text>
      <text x="14" y="182" fontSize="10">n₂ &gt; n₁</text>
      <rect x="185" y="100" width="150" height="90" fill="#dbeafe" />
      <line x1="185" y1="100" x2="335" y2="100" stroke={C.ink} />
      <line x1="260" y1="20" x2="260" y2="190" stroke={C.ink} strokeDasharray="3 3" />
      <line x1="200" y1="180" x2="260" y2="100" stroke={C.b} strokeWidth="2" markerEnd="url(#ar-b)" />
      <line x1="260" y1="100" x2="320" y2="180" stroke={C.b} strokeWidth="2" markerEnd="url(#ar-b)" />
      <line x1="260" y1="100" x2="330" y2="97" stroke={C.b} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
      <text x="228" y="150">θ &gt; θc</text>
      <text x="262" y="92" fontSize="9">{bi(l, 'refracted ray → 90° at θc', '屈折光 → θc で 90°')}</text>
      <text x="190" y="182" fontSize="10">{bi(l, 'dense', '密')}</text>
    </Fig>
  ),
  lens: (l) => (
    <Fig w={340} h={190} caption={bi(l, 'Convex lens, object outside f: the three construction rays meet at a real, inverted image. 1/a + 1/b = 1/f.', '凸レンズ、物体が f の外：3本の作図光線が実像（倒立）で交わる。1/a + 1/b = 1/f。')}>
      <line x1="10" y1="100" x2="330" y2="100" stroke={C.ink} />
      <path d="M170,30 Q182,100 170,170 Q158,100 170,30 z" fill="#dbeafe" stroke={C.a} />
      <circle cx="120" cy="100" r="3" fill={C.ink} />
      <circle cx="220" cy="100" r="3" fill={C.ink} />
      <text x="114" y="115" fontSize="10">F</text>
      <text x="214" y="115" fontSize="10">F</text>
      <line x1="60" y1="100" x2="60" y2="55" stroke={C.c} strokeWidth="3" markerEnd="url(#ar-c)" />
      <text x="40" y="50" fontSize="10" fill={C.c}>{bi(l, 'object', '物体')}</text>
      <line x1="60" y1="55" x2="170" y2="55" stroke={C.b} strokeWidth="1.5" />
      <line x1="170" y1="55" x2="290" y2="160" stroke={C.b} strokeWidth="1.5" />
      <line x1="60" y1="55" x2="290" y2="160" stroke={C.d} strokeWidth="1.5" />
      <line x1="60" y1="55" x2="170" y2="160" stroke={C.e} strokeWidth="1.5" />
      <line x1="170" y1="160" x2="290" y2="160" stroke={C.e} strokeWidth="1.5" />
      <line x1="290" y1="100" x2="290" y2="160" stroke={C.c} strokeWidth="3" markerEnd="url(#ar-c)" />
      <text x="262" y="182" fontSize="10" fill={C.c}>{bi(l, 'real image', '実像')}</text>
      <text x="80" y="95" fontSize="10">a</text>
      <text x="230" y="95" fontSize="10">b</text>
    </Fig>
  ),
  young: (l) => (
    <Fig w={340} h={180} caption={bi(l, 'Two slits d apart, screen at L. The path difference to height x is ≈ dx/L; bright where it equals mλ.', '間隔 d の2スリット、距離 L のスクリーン。高さ x への経路差は ≈ dx/L。mλ に等しいところが明線。')}>
      <rect x="60" y="20" width="6" height="140" fill={C.ink} />
      <rect x="60" y="70" width="6" height="8" fill="#fff" />
      <rect x="60" y="102" width="6" height="8" fill="#fff" />
      <text x="40" y="94" fontSize="10">d</text>
      <line x1="300" y1="20" x2="300" y2="160" stroke={C.ink} strokeWidth="3" />
      <line x1="63" y1="74" x2="300" y2="50" stroke={C.a} strokeWidth="1.5" />
      <line x1="63" y1="106" x2="300" y2="50" stroke={C.b} strokeWidth="1.5" />
      <circle cx="300" cy="50" r="4" fill={C.d} />
      <text x="306" y="54" fontSize="10">P (x)</text>
      <line x1="66" y1="165" x2="300" y2="165" stroke={C.ink} strokeDasharray="3 3" />
      <text x="178" y="176" fontSize="10">L</text>
      <text x="120" y="60" fontSize="10" fill={C.a}>S₁P</text>
      <text x="140" y="100" fontSize="10" fill={C.b}>S₂P</text>
      <text x="90" y="150" fontSize="10">|S₂P − S₁P| ≈ dx/L</text>
      {[-2, -1, 0, 1, 2].map((m) => (
        <rect key={m} x="303" y={88 + m * 22 - 3} width="8" height="6" fill={C.d} opacity={m === 0 ? 1 : 0.6} />
      ))}
      <text x="314" y="92" fontSize="9">m=0</text>
    </Fig>
  ),
  'thin-film': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Two reflected rays: from the top surface (air→film, phase flips) and from the bottom (film→air, no flip). Optical path difference 2nd, plus one flip.', '2つの反射光：上面（空気→膜、位相反転）と下面（膜→空気、反転なし）。光路差 2nd ＋ 反転1回。')}>
      <rect x="20" y="70" width="300" height="50" fill="#dbeafe" stroke={C.ink} />
      <text x="26" y="98" fontSize="10">{bi(l, 'film, index n, thickness d', '膜 屈折率 n、厚さ d')}</text>
      <text x="26" y="60" fontSize="10">{bi(l, 'air', '空気')}</text>
      <text x="26" y="140" fontSize="10">{bi(l, 'air', '空気')}</text>
      <line x1="110" y1="20" x2="160" y2="70" stroke={C.b} strokeWidth="2" />
      <line x1="160" y1="70" x2="210" y2="20" stroke={C.b} strokeWidth="2" markerEnd="url(#ar-b)" />
      <text x="212" y="26" fontSize="10" fill={C.b}>① {bi(l, 'flip', '反転')}</text>
      <line x1="160" y1="70" x2="185" y2="120" stroke={C.a} strokeWidth="2" />
      <line x1="185" y1="120" x2="210" y2="70" stroke={C.a} strokeWidth="2" />
      <line x1="210" y1="70" x2="260" y2="20" stroke={C.a} strokeWidth="2" markerEnd="url(#ar-a)" />
      <text x="262" y="26" fontSize="10" fill={C.a}>② {bi(l, 'no flip', '反転なし')}</text>
      <line x1="330" y1="70" x2="330" y2="120" stroke={C.ink} />
      <text x="333" y="98" fontSize="10">d</text>
    </Fig>
  ),
};

export function Figure({ id }: { id: string }) {
  const l = useL();
  const f = FIGS[id];
  if (!f) return <div className="my-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">[figure: {id}]</div>;
  return <>{f(l)}</>;
}

export function hasFigure(id: string) {
  return Boolean(FIGS[id]);
}
