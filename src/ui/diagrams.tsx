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
          <marker id="ar-e" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill={C.e} />
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
function Arrow({ x1, y1, x2, y2, c = 'k', label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; c?: 'a' | 'b' | 'c' | 'd' | 'e' | 'k'; label?: string; lx?: number; ly?: number }) {
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
  // ── Electromagnetism ──
  'field-lines': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Field lines leave + and enter −. Between unlike charges they run across; between like charges they push apart (E = 0 at the midpoint).', '電気力線は ＋ から出て − に入る。異符号の間では横切り、同符号の間では押し合う（中点で E = 0）。')}>
      {/* dipole */}
      <circle cx="60" cy="85" r="10" fill="#fecaca" stroke={C.b} />
      <text x="56" y="89" fill={C.b} fontWeight="700">+</text>
      <circle cx="150" cy="85" r="10" fill="#bfdbfe" stroke={C.a} />
      <text x="146" y="89" fill={C.a} fontWeight="700">−</text>
      <line x1="72" y1="85" x2="138" y2="85" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <path d="M66,76 Q105,30 144,76" fill="none" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <path d="M66,94 Q105,140 144,94" fill="none" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <path d="M62,74 Q105,-5 148,74" fill="none" stroke={C.ink} strokeWidth="1" opacity="0.5" markerEnd="url(#ar-k)" />
      <path d="M62,96 Q105,175 148,96" fill="none" stroke={C.ink} strokeWidth="1" opacity="0.5" markerEnd="url(#ar-k)" />
      {/* two positives */}
      <circle cx="215" cy="85" r="10" fill="#fecaca" stroke={C.b} />
      <text x="211" y="89" fill={C.b} fontWeight="700">+</text>
      <circle cx="305" cy="85" r="10" fill="#fecaca" stroke={C.b} />
      <text x="301" y="89" fill={C.b} fontWeight="700">+</text>
      <line x1="227" y1="85" x2="255" y2="85" stroke={C.ink} strokeWidth="1.5" />
      <line x1="293" y1="85" x2="265" y2="85" stroke={C.ink} strokeWidth="1.5" />
      <path d="M222,77 Q245,55 258,30" fill="none" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <path d="M222,93 Q245,115 258,140" fill="none" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <path d="M298,77 Q275,55 262,30" fill="none" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <path d="M298,93 Q275,115 262,140" fill="none" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <line x1="203" y1="85" x2="180" y2="85" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <line x1="317" y1="85" x2="338" y2="85" stroke={C.ink} strokeWidth="1.5" markerEnd="url(#ar-k)" />
      <text x="248" y="98" fontSize="9">E = 0</text>
    </Fig>
  ),
  capacitor: (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Parallel: same V, charges add (C = C₁ + C₂). Series: same Q on every plate, voltages add (1/C = 1/C₁ + 1/C₂).', '並列：同じ V、電荷が足される（C = C₁ + C₂）。直列：どの極板も同じ Q、電圧が足される（1/C = 1/C₁ + 1/C₂）。')}>
      <text x="20" y="20" fontWeight="600">{bi(l, 'parallel', '並列')}</text>
      <line x1="20" y1="75" x2="60" y2="75" stroke={C.ink} strokeWidth="1.5" />
      <line x1="60" y1="45" x2="60" y2="105" stroke={C.ink} strokeWidth="1.5" />
      <line x1="60" y1="45" x2="110" y2="45" stroke={C.ink} strokeWidth="1.5" />
      <line x1="60" y1="105" x2="110" y2="105" stroke={C.ink} strokeWidth="1.5" />
      <line x1="110" y1="35" x2="110" y2="55" stroke={C.a} strokeWidth="3" />
      <line x1="118" y1="35" x2="118" y2="55" stroke={C.a} strokeWidth="3" />
      <line x1="110" y1="95" x2="110" y2="115" stroke={C.a} strokeWidth="3" />
      <line x1="118" y1="95" x2="118" y2="115" stroke={C.a} strokeWidth="3" />
      <line x1="118" y1="45" x2="168" y2="45" stroke={C.ink} strokeWidth="1.5" />
      <line x1="118" y1="105" x2="168" y2="105" stroke={C.ink} strokeWidth="1.5" />
      <line x1="168" y1="45" x2="168" y2="105" stroke={C.ink} strokeWidth="1.5" />
      <text x="100" y="30" fontSize="10">C₁</text>
      <text x="100" y="130" fontSize="10">C₂</text>
      <text x="20" y="70" fontSize="10">V</text>
      <text x="200" y="20" fontWeight="600">{bi(l, 'series', '直列')}</text>
      <line x1="195" y1="75" x2="225" y2="75" stroke={C.ink} strokeWidth="1.5" />
      <line x1="225" y1="60" x2="225" y2="90" stroke={C.a} strokeWidth="3" />
      <line x1="233" y1="60" x2="233" y2="90" stroke={C.a} strokeWidth="3" />
      <line x1="233" y1="75" x2="270" y2="75" stroke={C.ink} strokeWidth="1.5" />
      <line x1="270" y1="60" x2="270" y2="90" stroke={C.a} strokeWidth="3" />
      <line x1="278" y1="60" x2="278" y2="90" stroke={C.a} strokeWidth="3" />
      <line x1="278" y1="75" x2="320" y2="75" stroke={C.ink} strokeWidth="1.5" />
      <text x="218" y="110" fontSize="10">+Q −Q</text>
      <text x="263" y="110" fontSize="10">+Q −Q</text>
      <text x="220" y="50" fontSize="10">V₁</text>
      <text x="265" y="50" fontSize="10">V₂</text>
    </Fig>
  ),
  circuit: (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Loop rule: walk around each loop, emf gained = IR dropped. Junction rule at the node: I₁ = I₂ + I₃.', '閉回路の法則：各閉回路を一周して、起電力 = IR の和。分岐点の法則：I₁ = I₂ + I₃。')}>
      <rect x="40" y="30" width="260" height="110" fill="none" stroke={C.ink} strokeWidth="1.5" />
      <line x1="170" y1="30" x2="170" y2="140" stroke={C.ink} strokeWidth="1.5" />
      {/* battery left */}
      <rect x="30" y="72" width="20" height="26" fill="#fff" />
      <line x1="34" y1="75" x2="34" y2="95" stroke={C.ink} strokeWidth="3" />
      <line x1="44" y1="80" x2="44" y2="90" stroke={C.ink} strokeWidth="1.5" />
      <text x="10" y="90" fontSize="10">E</text>
      {/* resistors */}
      <rect x="150" y="70" width="40" height="30" fill="#fff" />
      <rect x="160" y="72" width="20" height="26" fill="#fde68a" stroke={C.ink} />
      <text x="192" y="90" fontSize="10">R₂</text>
      <rect x="280" y="70" width="40" height="30" fill="#fff" />
      <rect x="290" y="72" width="20" height="26" fill="#fde68a" stroke={C.ink} />
      <text x="313" y="90" fontSize="10">R₃</text>
      <rect x="90" y="18" width="40" height="24" fill="#fff" />
      <rect x="95" y="22" width="30" height="16" fill="#fde68a" stroke={C.ink} />
      <text x="100" y="14" fontSize="10">R₁</text>
      <Arrow x1={60} y1={30} x2={85} y2={30} c="b" label="I₁" lx={62} ly={52} />
      <Arrow x1={170} y1={45} x2={170} y2={62} c="a" label="I₂" lx={175} ly={60} />
      <Arrow x1={230} y1={30} x2={260} y2={30} c="c" label="I₃" lx={232} ly={52} />
      <circle cx="170" cy="30" r="3" fill={C.ink} />
      <path d="M95,70 A25,25 0 1,1 95,110" fill="none" stroke={C.e} strokeWidth="1.2" markerEnd="url(#ar-k)" strokeDasharray="3 2" />
      <text x="72" y="130" fontSize="9" fill={C.e}>{bi(l, 'loop 1', '閉回路1')}</text>
      <path d="M225,70 A25,25 0 1,1 225,110" fill="none" stroke={C.e} strokeWidth="1.2" markerEnd="url(#ar-k)" strokeDasharray="3 2" />
      <text x="205" y="130" fontSize="9" fill={C.e}>{bi(l, 'loop 2', '閉回路2')}</text>
    </Fig>
  ),
  'wire-field': (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Left: current out of the page (⊙) makes anticlockwise circles of B. Right: a solenoid makes a uniform field inside; the right hand gives the N end.', '左：紙面手前向きの電流（⊙）は反時計回りの B。右：ソレノイドは内部に一様な磁場。右手で N 側がわかる。')}>
      <circle cx="80" cy="75" r="8" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <circle cx="80" cy="75" r="2" fill={C.ink} />
      <text x="70" y="105" fontSize="10">I (⊙)</text>
      {[22, 40, 58].map((rr, i) => (
        <g key={i}>
          <circle cx="80" cy="75" r={rr} fill="none" stroke={C.a} strokeWidth="1.5" opacity={1 - i * 0.25} />
          <path d={`M${80 + rr},75 l-4,-6 M${80 + rr},75 l5,-5`} stroke={C.a} strokeWidth="1.5" fill="none" />
        </g>
      ))}
      <text x="140" y="40" fontSize="10" fill={C.a}>B ∝ 1/r</text>
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={215 + i * 16} cy="75" rx="6" ry="22" fill="none" stroke={C.ink} strokeWidth="1.5" />
      ))}
      <Arrow x1={205} y1={75} x2={335} y2={75} c="a" label="B" lx={326} ly={68} />
      <text x="215" y="125" fontSize="10">{bi(l, 'solenoid: B = μ₀nI inside', 'ソレノイド：内部 B = μ₀nI')}</text>
      <text x="205" y="45" fontSize="10">S</text>
      <text x="318" y="45" fontSize="10">N</text>
    </Fig>
  ),
  'left-hand': (l) => (
    <Fig w={340} h={160} caption={bi(l, 'Current to the right, B into the page (×): the force on the wire is upward. Reverse I or B and the force flips; a moving + charge behaves like the current.', '右向きの電流、紙面奥向きの B（×）：導線が受ける力は上向き。I か B を逆にすると力も逆。動く＋電荷は電流と同じ。')}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          {[0, 1, 2].map((j) => (
            <text key={j} x={40 + i * 50} y={40 + j * 45} fontSize="12" fill={C.a}>×</text>
          ))}
        </g>
      ))}
      <text x="232" y="22" fontSize="10" fill={C.a}>B: × = {bi(l, 'into page', '紙面奥向き')}</text>
      <line x1="30" y1="95" x2="290" y2="95" stroke={C.d} strokeWidth="5" />
      <Arrow x1={120} y1={95} x2={190} y2={95} c="b" label="I" lx={192} ly={110} />
      <Arrow x1={160} y1={88} x2={160} y2={45} c="c" label="F = IBl" lx={166} ly={50} />
    </Fig>
  ),
  induction: (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Rod slides right at v on rails in B (into page): the loop area grows, flux increases, so the induced current makes a field out of the page (anticlockwise) and a force on the rod opposing v.', 'B（紙面奥向き）中のレール上を棒が右へ速さ v で動く：ループの面積が増え磁束が増えるので、誘導電流は紙面手前向きの磁場（反時計回り）をつくり、棒には v に逆らう力。')}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          {[0, 1].map((j) => (
            <text key={j} x={50 + i * 48} y={55 + j * 50} fontSize="12" fill={C.a}>×</text>
          ))}
        </g>
      ))}
      <line x1="30" y1="40" x2="310" y2="40" stroke={C.ink} strokeWidth="2" />
      <line x1="30" y1="120" x2="310" y2="120" stroke={C.ink} strokeWidth="2" />
      <rect x="20" y="70" width="12" height="20" fill="#fde68a" stroke={C.ink} />
      <text x="4" y="105" fontSize="10">R</text>
      <line x1="30" y1="40" x2="26" y2="70" stroke={C.ink} strokeWidth="1.5" />
      <line x1="30" y1="120" x2="26" y2="90" stroke={C.ink} strokeWidth="1.5" />
      <line x1="200" y1="32" x2="200" y2="128" stroke={C.d} strokeWidth="5" />
      <Arrow x1={210} y1={80} x2={260} y2={80} c="c" label="v" />
      <Arrow x1={190} y1={80} x2={140} y2={80} c="b" label="F" lx={126} ly={84} />
      <Arrow x1={200} y1={110} x2={200} y2={50} c="e" label="I" lx={206} ly={62} />
      <text x="60" y="150" fontSize="10">V = vBl,  I = vBl/R,  F = IBl</text>
    </Fig>
  ),
  'ac-phase': (l) => (
    <Plot
      x={[0, 6.6]}
      y={[-1.3, 1.3]}
      xLabel="t"
      curves={[
        { pts: Array.from({ length: 80 }, (_, i) => [(i * 6.6) / 79, Math.sin((i * 6.6) / 79)] as Pt), color: C.ink, label: 'V', labelAt: 9 },
        { pts: Array.from({ length: 80 }, (_, i) => [(i * 6.6) / 79, 0.8 * Math.sin((i * 6.6) / 79 - Math.PI / 2)] as Pt), color: C.b, label: bi(l, 'I (coil, lags)', 'I（コイル、遅れ）'), labelAt: 46 },
        { pts: Array.from({ length: 80 }, (_, i) => [(i * 6.6) / 79, 0.8 * Math.sin((i * 6.6) / 79 + Math.PI / 2)] as Pt), color: C.a, label: bi(l, 'I (capacitor, leads)', 'I（コンデンサー、進み）'), labelAt: 76 },
      ]}
      hlines={[{ y: 0 }]}
      caption={bi(l, 'Same voltage V = V₀ sin ωt: the coil current peaks a quarter period later, the capacitor current a quarter period earlier.', '同じ電圧 V = V₀ sin ωt：コイルの電流は 1/4 周期遅れて、コンデンサーの電流は 1/4 周期早く最大になる。')}
    />
  ),
  // ── Atoms ──
  photoelectric: (l) => (
    <Plot
      x={[0, 10]}
      y={[-3, 6]}
      xLabel="f"
      yLabel="K_max"
      curves={[
        { pts: [[0, -3], [9.5, 5.5]], color: C.a, label: bi(l, 'slope = h', '傾き = h'), labelAt: 1 },
      ]}
      hlines={[{ y: 0 }]}
      vlines={[{ x: 3.35, label: 'f₀' }]}
      points={[{ x: 0, y: -3, label: '−W', color: C.b }]}
      caption={bi(l, 'K_max = hf − W: a straight line of slope h. No emission below f₀ = W/h. Brighter light moves nothing on this graph.', 'K_max = hf − W：傾き h の直線。f₀ = W/h 以下では放出なし。明るさを変えてもこのグラフは動かない。')}
    />
  ),
  bohr: (l) => (
    <Fig w={340} h={180} caption={bi(l, 'Hydrogen levels Eₙ = −13.6/n² eV. Jumps down to n = 2 (Balmer) give visible light; to n = 1 (Lyman) ultraviolet.', '水素の準位 Eₙ = −13.6/n² eV。n = 2 への遷移（バルマー）が可視光、n = 1 へ（ライマン）が紫外線。')}>
      {[[1, 160, '−13.6'], [2, 70, '−3.4'], [3, 45, '−1.5'], [4, 34, '−0.85']].map(([n, y, e]) => (
        <g key={String(n)}>
          <line x1="60" y1={Number(y)} x2="260" y2={Number(y)} stroke={C.ink} strokeWidth="1.5" />
          <text x="30" y={Number(y) + 4} fontSize="10">n = {n}</text>
          <text x="266" y={Number(y) + 4} fontSize="10">{e} eV</text>
        </g>
      ))}
      <line x1="60" y1="20" x2="260" y2="20" stroke={C.faint} strokeDasharray="3 3" />
      <text x="266" y="24" fontSize="10">0 (ionised)</text>
      <Arrow x1={120} y1={45} x2={120} y2={72} c="b" label={bi(l, 'Balmer (visible)', 'バルマー（可視）')} lx={126} ly={62} />
      <Arrow x1={200} y1={70} x2={200} y2={158} c="e" label={bi(l, 'Lyman (UV)', 'ライマン（紫外）')} lx={206} ly={120} />
      <text x="70" y="176" fontSize="9">hf = E_high − E_low</text>
    </Fig>
  ),
  decay: (l) => (
    <Plot
      x={[0, 4.2]}
      y={[0, 1.1]}
      xLabel="t / T"
      yLabel="N / N₀"
      curves={[{ pts: Array.from({ length: 60 }, (_, i) => [(i * 4.2) / 59, Math.pow(0.5, (i * 4.2) / 59)] as Pt), color: C.a }]}
      hlines={[{ y: 0.5, label: '½' }, { y: 0.25, label: '¼' }, { y: 0.125, label: '⅛' }]}
      vlines={[{ x: 1, label: 'T' }, { x: 2, label: '2T' }, { x: 3, label: '3T' }]}
      caption={bi(l, 'Every half-life the remaining amount halves: N = N₀(½)^(t/T). Activity follows the same curve.', '半減期ごとに残量が半分：N = N₀(½)^(t/T)。放射能も同じ曲線。')}
    />
  ),
  // ── Chemistry ──
  'titration-curve': (l) => (
    <Plot
      x={[0, 40]}
      y={[0, 14]}
      xLabel={bi(l, 'NaOH added (mL)', 'NaOH 滴下量 (mL)')}
      yLabel="pH"
      curves={[
        { pts: [[0, 1], [10, 1.2], [18, 1.8], [19.5, 3], [20, 7], [20.5, 11], [22, 12.2], [30, 12.7], [40, 12.9]], color: C.a, label: bi(l, 'strong acid', '強酸'), labelAt: 2 },
        { pts: [[0, 2.9], [5, 4.2], [10, 4.8], [15, 5.3], [18, 5.9], [19.5, 7], [20, 8.7], [20.5, 11], [22, 12.2], [30, 12.7], [40, 12.9]], color: C.b, label: bi(l, 'weak acid', '弱酸'), labelAt: 4 },
      ]}
      hlines={[{ y: 7, label: '7' }, { y: 3.5, label: bi(l, 'MO', 'メチルオレンジ') }, { y: 9, label: bi(l, 'PP', 'フェノールフタレイン') }]}
      vlines={[{ x: 20, label: bi(l, 'equivalence', '中和点') }]}
      caption={bi(l, 'Same volume of NaOH neutralises both. The strong-acid jump spans both indicators; the weak-acid jump starts above 7, so only phenolphthalein works.', '中和に必要な NaOH の量は同じ。強酸の pH ジャンプは両方の指示薬を含むが、弱酸のジャンプは 7 より上から始まるのでフェノールフタレインだけが使える。')}
    />
  ),
  'vapor-pressure': (l) => (
    <Plot
      x={[0, 110]}
      y={[0, 1.4]}
      xLabel="T (°C)"
      yLabel={bi(l, 'vapour pressure (×10⁵ Pa)', '蒸気圧 (×10⁵ Pa)')}
      curves={[
        { pts: Array.from({ length: 23 }, (_, i) => { const t = i * 5; return [t, 1.013 * Math.exp(17.27 * (t / (t + 237.3) - 100 / 337.3))] as Pt; }), color: C.a, label: bi(l, 'water', '水'), labelAt: 21 },
        { pts: Array.from({ length: 17 }, (_, i) => { const t = i * 5; return [t, 1.013 * Math.exp(17.27 * (t / (t + 237.3) - 78 / 315.3))] as Pt; }), color: C.b, label: bi(l, 'ethanol', 'エタノール'), labelAt: 14 },
        { pts: Array.from({ length: 8 }, (_, i) => { const t = i * 5; return [t, 1.013 * Math.exp(17.27 * (t / (t + 237.3) - 34.6 / 271.9))] as Pt; }), color: C.c, label: bi(l, 'ether', 'エーテル'), labelAt: 6 },
      ]}
      hlines={[{ y: 1.013, label: '1 atm' }]}
      caption={bi(l, 'Each liquid boils where its curve crosses the outside pressure. Weaker intermolecular forces → higher vapour pressure → lower boiling point.', '各液体は曲線が外圧と交わる温度で沸騰する。分子間力が弱い → 蒸気圧が高い → 沸点が低い。')}
    />
  ),
  'phase-diagram': (l) => (
    <Fig w={340} h={200} caption={bi(l, 'Water: the solid–liquid line leans left, so pressure melts ice. T = triple point (all three coexist), C = critical point.', '水：固体–液体の境界線が左に傾くので、圧力で氷がとける。T = 三重点（三態が共存）、C = 臨界点。')}>
      <line x1="40" y1="170" x2="320" y2="170" stroke={C.ink} markerEnd="url(#ar-k)" />
      <line x1="40" y1="170" x2="40" y2="20" stroke={C.ink} markerEnd="url(#ar-k)" />
      <text x="300" y="185">T</text>
      <text x="20" y="30">p</text>
      <path d="M120,120 Q125,80 110,25" fill="none" stroke={C.a} strokeWidth="2" />
      <path d="M120,120 Q200,90 260,45" fill="none" stroke={C.b} strokeWidth="2" />
      <path d="M120,120 Q95,150 60,165" fill="none" stroke={C.c} strokeWidth="2" />
      <circle cx="120" cy="120" r="4" fill={C.ink} />
      <text x="126" y="132" fontSize="10">T</text>
      <circle cx="260" cy="45" r="4" fill={C.ink} />
      <text x="266" y="42" fontSize="10">C</text>
      <text x="60" y="70" fontSize="11" fontWeight="600">{bi(l, 'solid', '固体')}</text>
      <text x="165" y="60" fontSize="11" fontWeight="600">{bi(l, 'liquid', '液体')}</text>
      <text x="220" y="140" fontSize="11" fontWeight="600">{bi(l, 'gas', '気体')}</text>
      <line x1="40" y1="88" x2="200" y2="88" stroke={C.faint} strokeDasharray="3 3" />
      <text x="44" y="84" fontSize="9">1 atm</text>
      <text x="100" y="100" fontSize="9">0 °C</text>
      <text x="184" y="100" fontSize="9">100 °C</text>
    </Fig>
  ),
  'unit-cells': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Left: body-centred cubic — 8 corners × ⅛ + 1 centre = 2 atoms; atoms touch along the body diagonal (4r = √3a). Right: face-centred cubic — 8 × ⅛ + 6 faces × ½ = 4; touch along the face diagonal (4r = √2a).', '左：体心立方 — 頂点 8 × ⅛ ＋ 中心 1 = 2 個。体対角線で接する（4r = √3a）。右：面心立方 — 8 × ⅛ ＋ 面 6 × ½ = 4 個。面対角線で接する（4r = √2a）。')}>
      {[[50, 'bcc'], [200, 'fcc']].map(([ox, kind]) => {
        const x0 = Number(ox);
        const y0 = 40;
        const s = 80;
        const d = 28;
        const pts = [[x0, y0 + s], [x0 + s, y0 + s], [x0 + s, y0], [x0, y0], [x0 + d, y0 + s - d], [x0 + s + d, y0 + s - d], [x0 + s + d, y0 - d], [x0 + d, y0 - d]];
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        return (
          <g key={String(kind)}>
            {edges.map(([a, b], i) => (
              <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={C.ink} strokeWidth="1" strokeDasharray={[4, 7, 8].includes(i) ? '3 3' : undefined} />
            ))}
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="7" fill="#bfdbfe" stroke={C.a} />
            ))}
            {kind === 'bcc' ? (
              <circle cx={x0 + s / 2 + d / 2} cy={y0 + s / 2 - d / 2} r="7" fill="#fecaca" stroke={C.b} />
            ) : (
              [[x0 + s / 2, y0 + s / 2], [x0 + s / 2 + d, y0 + s / 2 - d], [x0 + s / 2 + d / 2, y0 + s - d / 2], [x0 + s / 2 + d / 2, y0 - d / 2], [x0 + d / 2, y0 + s / 2 - d / 2], [x0 + s + d / 2, y0 + s / 2 - d / 2]].map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r="7" fill="#fecaca" stroke={C.b} />
              ))
            )}
            <text x={x0 + 20} y={y0 + s + 28} fontSize="11" fontWeight="600">{kind === 'bcc' ? bi(l, 'bcc: 2 atoms', '体心立方：2 個') : bi(l, 'fcc: 4 atoms', '面心立方：4 個')}</text>
          </g>
        );
      })}
    </Fig>
  ),
  'energy-diagram': (l) => (
    <Fig w={340} h={190} caption={bi(l, 'Reactants must climb the activation-energy hill Ea. A catalyst lowers the hill (dashed) but not ΔH. Here ΔH < 0: exothermic.', '反応物は活性化エネルギー Ea の山を越える必要がある。触媒は山を下げる（点線）が ΔH は変えない。図は ΔH < 0：発熱。')}>
      <line x1="30" y1="170" x2="320" y2="170" stroke={C.ink} markerEnd="url(#ar-k)" />
      <line x1="30" y1="170" x2="30" y2="20" stroke={C.ink} markerEnd="url(#ar-k)" />
      <text x="10" y="30" fontSize="10">E</text>
      <text x="250" y="185" fontSize="10">{bi(l, 'reaction progress', '反応の進行')}</text>
      <line x1="40" y1="90" x2="110" y2="90" stroke={C.ink} strokeWidth="2" />
      <path d="M110,90 C150,90 150,35 175,35 C200,35 200,130 240,130" fill="none" stroke={C.b} strokeWidth="2" />
      <path d="M110,90 C150,90 150,65 175,65 C200,65 200,130 240,130" fill="none" stroke={C.c} strokeWidth="2" strokeDasharray="5 4" />
      <line x1="240" y1="130" x2="310" y2="130" stroke={C.ink} strokeWidth="2" />
      <text x="44" y="84" fontSize="10">{bi(l, 'reactants', '反応物')}</text>
      <text x="255" y="146" fontSize="10">{bi(l, 'products', '生成物')}</text>
      <Arrow x1={175} y1={90} x2={175} y2={40} c="b" label="Ea" lx={181} ly={50} />
      <Arrow x1={290} y1={90} x2={290} y2={126} c="d" label="ΔH" lx={296} ly={112} />
      <line x1="175" y1="90" x2="290" y2="90" stroke={C.faint} strokeDasharray="3 3" />
      <text x="128" y="60" fontSize="9" fill={C.c}>{bi(l, 'with catalyst', '触媒あり')}</text>
    </Fig>
  ),
  'equilibrium-shift': (l) => (
    <Plot
      x={[0, 10]}
      y={[0, 1.2]}
      xLabel="t"
      yLabel={bi(l, 'conc.', '濃度')}
      curves={[
        { pts: [[0, 0.4], [3, 0.4], [3, 0.9], [4, 0.75], [5, 0.68], [6, 0.65], [10, 0.65]], color: C.a, label: 'A', labelAt: 6 },
        { pts: [[0, 0.6], [3, 0.6], [4, 0.74], [5, 0.8], [6, 0.83], [10, 0.83]], color: C.b, label: 'B', labelAt: 5 },
      ]}
      vlines={[{ x: 3, label: bi(l, 'A added', 'A を追加') }]}
      caption={bi(l, 'A ⇌ B at equilibrium; more A is added at t = 3. Some of the extra A converts to B until the ratio [B]/[A] = K is restored.', 'A ⇌ B が平衡。t = 3 で A を追加。比 [B]/[A] = K に戻るまで追加分の一部が B に変わる。')}
    />
  ),
  daniell: (l) => (
    <Fig w={340} h={190} caption={bi(l, 'Zn (larger ionisation tendency) dissolves and is the − electrode; electrons flow through the wire to Cu where Cu²⁺ is reduced. Sulfate ions cross the porous wall to keep charge balance.', 'イオン化傾向の大きい Zn が溶けて負極。電子は導線を通って Cu へ行き、Cu²⁺ が還元される。硫酸イオンが素焼き板を通って電荷を保つ。')}>
      <rect x="40" y="80" width="120" height="90" fill="#e0f2fe" stroke={C.ink} />
      <rect x="160" y="80" width="120" height="90" fill="#bfdbfe" stroke={C.ink} />
      <line x1="160" y1="80" x2="160" y2="170" stroke={C.ink} strokeDasharray="3 3" strokeWidth="2" />
      <rect x="85" y="50" width="14" height="100" fill="#cbd5e1" stroke={C.ink} />
      <rect x="220" y="50" width="14" height="100" fill="#fdba74" stroke={C.ink} />
      <text x="70" y="44" fontSize="10">Zn (−)</text>
      <text x="212" y="44" fontSize="10">Cu (+)</text>
      <line x1="92" y1="50" x2="92" y2="25" stroke={C.ink} />
      <line x1="92" y1="25" x2="227" y2="25" stroke={C.ink} />
      <line x1="227" y1="25" x2="227" y2="50" stroke={C.ink} />
      <Arrow x1={130} y1={25} x2={190} y2={25} c="b" label="e⁻" lx={155} ly={18} />
      <text x="50" y="160" fontSize="9">ZnSO₄ aq</text>
      <text x="200" y="160" fontSize="9">CuSO₄ aq</text>
      <text x="60" y="110" fontSize="9">Zn → Zn²⁺ + 2e⁻</text>
      <text x="175" y="110" fontSize="9">Cu²⁺ + 2e⁻ → Cu</text>
      <Arrow x1={195} y1={135} x2={125} y2={135} c="c" label="SO₄²⁻" lx={135} ly={150} />
      <text x="140" y="184" fontSize="9">{bi(l, 'porous wall', '素焼き板')}</text>
    </Fig>
  ),
  electrolysis: (l) => (
    <Fig w={340} h={190} caption={bi(l, 'Electrolysis of CuSO₄(aq) with Pt electrodes: the + terminal makes the anode, where water is oxidised to O₂; the − terminal makes the cathode, where Cu²⁺ is reduced. Oxidation is always at the anode.', 'Pt 電極での CuSO₄ 水溶液の電気分解：電源の ＋ につながる陽極で水が酸化されて O₂、− につながる陰極で Cu²⁺ が還元される。酸化は常に陽極。')}>
      <rect x="60" y="80" width="220" height="90" fill="#bfdbfe" stroke={C.ink} />
      <rect x="105" y="50" width="12" height="100" fill="#e2e8f0" stroke={C.ink} />
      <rect x="223" y="50" width="12" height="100" fill="#e2e8f0" stroke={C.ink} />
      <line x1="111" y1="50" x2="111" y2="25" stroke={C.ink} />
      <line x1="229" y1="50" x2="229" y2="25" stroke={C.ink} />
      <line x1="111" y1="25" x2="160" y2="25" stroke={C.ink} />
      <line x1="180" y1="25" x2="229" y2="25" stroke={C.ink} />
      <line x1="162" y1="15" x2="162" y2="35" stroke={C.ink} strokeWidth="3" />
      <line x1="178" y1="19" x2="178" y2="31" stroke={C.ink} strokeWidth="1.5" />
      <text x="150" y="12" fontSize="10">+</text>
      <text x="182" y="12" fontSize="10">−</text>
      <text x="82" y="44" fontSize="10">{bi(l, 'anode (+)', '陽極 (+)')}</text>
      <text x="212" y="44" fontSize="10">{bi(l, 'cathode (−)', '陰極 (−)')}</text>
      <text x="66" y="110" fontSize="9">2H₂O → O₂ + 4H⁺ + 4e⁻</text>
      <text x="176" y="110" fontSize="9">Cu²⁺ + 2e⁻ → Cu</text>
      <text x="140" y="160" fontSize="9">CuSO₄ aq</text>
      <Arrow x1={135} y1={135} x2={200} y2={135} c="b" label=""  />
    </Fig>
  ),
  'alcohol-oxidation': (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Oxidation depends on how many carbons sit on the –OH carbon: primary goes two steps, secondary one, tertiary none.', '酸化のされ方は –OH のついた炭素に結合する炭素の数で決まる：第一級は2段階、第二級は1段階、第三級は酸化されない。')}>
      <text x="14" y="34" fontSize="11" fontWeight="600">{bi(l, 'primary', '第一級')}</text>
      <text x="80" y="34" fontSize="11">R–CH₂OH</text>
      <Arrow x1={150} y1={30} x2={185} y2={30} c="b" />
      <text x="192" y="34" fontSize="11">R–CHO</text>
      <Arrow x1={240} y1={30} x2={275} y2={30} c="b" />
      <text x="282" y="34" fontSize="11">R–COOH</text>
      <text x="14" y="80" fontSize="11" fontWeight="600">{bi(l, 'secondary', '第二級')}</text>
      <text x="80" y="80" fontSize="11">R₂CH–OH</text>
      <Arrow x1={150} y1={76} x2={185} y2={76} c="b" />
      <text x="192" y="80" fontSize="11">R₂C=O ({bi(l, 'ketone', 'ケトン')})</text>
      <text x="14" y="126" fontSize="11" fontWeight="600">{bi(l, 'tertiary', '第三級')}</text>
      <text x="80" y="126" fontSize="11">R₃C–OH</text>
      <line x1="150" y1="122" x2="185" y2="122" stroke={C.faint} strokeWidth="2" />
      <text x="192" y="126" fontSize="11" fill="#94a3b8">{bi(l, 'no oxidation', '酸化されない')}</text>
      <text x="150" y="16" fontSize="9" fill={C.b}>[O]</text>
      <text x="240" y="16" fontSize="9" fill={C.b}>[O]</text>
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
