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
  // ── Biology ──
  atp: (l) => (
    <Fig w={340} h={120} caption={bi(l, 'ATP = adenine + ribose (together: adenosine) + three phosphates. The two outer phosphate bonds are high-energy; ATP → ADP + Pi releases the energy cells use.', 'ATP = アデニン ＋ リボース（合わせてアデノシン）＋ リン酸3個。外側2つのリン酸結合が高エネルギー。ATP → ADP ＋ Pi で細胞が使うエネルギーが出る。')}>
      <rect x="20" y="35" width="70" height="40" rx="8" fill="#fde68a" stroke={C.ink} />
      <text x="33" y="60" fontSize="11" fontWeight="600">{bi(l, 'adenine', 'アデニン')}</text>
      <polygon points="100,75 130,75 140,50 115,32 90,50" fill="#bbf7d0" stroke={C.ink} />
      <text x="98" y="94" fontSize="10">{bi(l, 'ribose', 'リボース')}</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={175 + i * 50} cy="55" r="17" fill="#fecaca" stroke={C.b} />
          <text x={170 + i * 50} y="59" fontSize="11" fontWeight="600">P</text>
        </g>
      ))}
      <line x1="140" y1="55" x2="158" y2="55" stroke={C.ink} strokeWidth="2" />
      <text x="204" y="35" fontSize="12" fill={C.b}>~</text>
      <text x="254" y="35" fontSize="12" fill={C.b}>~</text>
      <line x1="20" y1="108" x2="140" y2="108" stroke={C.ink} />
      <text x="40" y="118" fontSize="9">{bi(l, 'adenosine', 'アデノシン')}</text>
      <text x="195" y="100" fontSize="9" fill={C.b}>{bi(l, 'high-energy bonds', '高エネルギーリン酸結合')}</text>
    </Fig>
  ),
  mitochondrion: (l) => (
    <Fig w={340} h={180} caption={bi(l, 'Glycolysis is outside, in the cytoplasm. Inside: the citric acid cycle in the matrix makes CO₂ and NADH; the electron transport chain on the folded inner membrane uses O₂ and makes most of the ATP.', '解糖系は外の細胞質基質。内部：マトリックスのクエン酸回路が CO₂ と NADH をつくり、ひだ状の内膜の電子伝達系が O₂ を使って ATP の大部分をつくる。')}>
      <ellipse cx="200" cy="95" rx="125" ry="65" fill="#fee2e2" stroke={C.ink} strokeWidth="2" />
      <path d="M100,95 C110,60 130,60 140,95 C150,130 170,130 180,95 C190,60 210,60 220,95 C230,130 250,130 260,95 C270,60 290,60 300,95" fill="none" stroke={C.b} strokeWidth="2" />
      <text x="120" y="140" fontSize="10" fontWeight="600">{bi(l, 'matrix: citric acid cycle', 'マトリックス：クエン酸回路')}</text>
      <text x="150" y="153" fontSize="9">→ CO₂, NADH, FADH₂</text>
      <text x="200" y="20" fontSize="9" fill={C.b} fontWeight="600">{bi(l, 'inner membrane (cristae):', '内膜（クリステ）：')}</text>
      <text x="200" y="32" fontSize="9" fill={C.b}>{bi(l, 'electron transport, ATP synthase', '電子伝達系、ATP 合成酵素')}</text>
      <text x="200" y="44" fontSize="9" fill={C.b}>O₂ → H₂O, ~34 ATP</text>
      <text x="8" y="20" fontSize="10" fontWeight="600">{bi(l, 'cytoplasm: glycolysis', '細胞質基質：解糖系')}</text>
      <text x="8" y="32" fontSize="9">{bi(l, 'glucose → 2 pyruvate, 2 ATP', 'グルコース → ピルビン酸 2、ATP 2')}</text>
      <Arrow x1={50} y1={40} x2={82} y2={72} c="k" />
    </Fig>
  ),
  chloroplast: (l) => (
    <Fig w={340} h={180} caption={bi(l, 'Light reactions on the thylakoid membranes (stacked into grana) split water and make ATP + NADPH; the Calvin–Benson cycle in the stroma uses them to turn CO₂ into sugar.', 'チラコイド膜（積み重なってグラナ）の光化学反応が水を分解し ATP ＋ NADPH をつくる。ストロマのカルビン・ベンソン回路がそれを使って CO₂ を糖にする。')}>
      <ellipse cx="170" cy="95" rx="140" ry="65" fill="#dcfce7" stroke={C.ink} strokeWidth="2" />
      {[0, 1, 2].map((g) => (
        <g key={g}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={70 + g * 75} y={70 + i * 10} width="40" height="6" rx="3" fill="#16a34a" />
          ))}
        </g>
      ))}
      <text x="60" y="58" fontSize="9" fill={C.c} fontWeight="600">{bi(l, 'thylakoid / grana: light reactions', 'チラコイド／グラナ：光化学反応')}</text>
      <text x="60" y="128" fontSize="9" fill={C.c}>H₂O → O₂ ; ATP, NADPH</text>
      <text x="130" y="150" fontSize="10" fontWeight="600">{bi(l, 'stroma: Calvin–Benson cycle', 'ストロマ：カルビン・ベンソン回路')}</text>
      <text x="150" y="162" fontSize="9">CO₂ → {bi(l, 'sugar', '糖')} (uses ATP, NADPH)</text>
    </Fig>
  ),
  'nitrogen-cycle': (l) => (
    <Fig w={340} h={200} caption={bi(l, 'Only a few bacteria fix N₂; plants assimilate nitrate/ammonium into protein; nitrifiers oxidise NH₄⁺ → NO₃⁻; denitrifiers return N₂ to the air.', 'N₂ を固定できるのは少数の細菌だけ。植物は硝酸・アンモニウムをタンパク質に同化。硝化菌が NH₄⁺ → NO₃⁻ に酸化。脱窒菌が N₂ を空気に戻す。')}>
      <rect x="120" y="10" width="100" height="26" rx="6" fill="#dbeafe" stroke={C.ink} />
      <text x="145" y="27" fontSize="11" fontWeight="600">N₂ ({bi(l, 'air', '空気')})</text>
      <rect x="20" y="90" width="90" height="26" rx="6" fill="#fef3c7" stroke={C.ink} />
      <text x="40" y="107" fontSize="11">NH₄⁺</text>
      <rect x="230" y="90" width="90" height="26" rx="6" fill="#fef3c7" stroke={C.ink} />
      <text x="255" y="107" fontSize="11">NO₃⁻</text>
      <rect x="110" y="160" width="120" height="26" rx="6" fill="#dcfce7" stroke={C.ink} />
      <text x="118" y="177" fontSize="10">{bi(l, 'plant/animal protein', '植物・動物のタンパク質')}</text>
      <Arrow x1={130} y1={36} x2={70} y2={88} c="a" label={bi(l, 'fixation (bacteria)', '窒素固定（細菌）')} lx={4} ly={60} />
      <Arrow x1={110} y1={103} x2={228} y2={103} c="d" label={bi(l, 'nitrification', '硝化')} lx={140} ly={96} />
      <Arrow x1={250} y1={90} x2={215} y2={38} c="e" label={bi(l, 'denitrification', '脱窒')} lx={250} ly={60} />
      <Arrow x1={260} y1={116} x2={200} y2={158} c="c" label={bi(l, 'assimilation', '同化')} lx={238} ly={145} />
      <Arrow x1={120} y1={160} x2={70} y2={118} c="k" label={bi(l, 'decomposition', '分解')} lx={28} ly={140} />
    </Fig>
  ),
  'replication-fork': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Both new strands grow 5′→3′. Toward the fork that is continuous (leading strand); away from the fork it must be made in Okazaki fragments (lagging strand), later joined by ligase.', '新しい鎖はどちらも 5′→3′ に伸びる。フォークに向かう側は連続的（リーディング鎖）。フォークから離れる側は岡崎フラグメントとして合成され（ラギング鎖）、後でリガーゼがつなぐ。')}>
      <line x1="30" y1="60" x2="150" y2="85" stroke={C.ink} strokeWidth="2.5" />
      <line x1="30" y1="110" x2="150" y2="85" stroke={C.ink} strokeWidth="2.5" />
      <line x1="150" y1="85" x2="320" y2="85" stroke={C.ink} strokeWidth="2.5" opacity="0.4" />
      <line x1="150" y1="85" x2="320" y2="85" stroke={C.ink} strokeWidth="1" strokeDasharray="4 3" />
      <text x="230" y="78" fontSize="9">{bi(l, 'parent double helix', '親の二重らせん')}</text>
      <Arrow x1={40} y1={50} x2={135} y2={70} c="a" label={bi(l, 'leading (continuous)', 'リーディング鎖（連続）')} lx={20} ly={38} />
      <Arrow x1={80} y1={122} x2={45} y2={115} c="b" />
      <Arrow x1={135} y1={135} x2={100} y2={127} c="b" />
      <text x="30" y="150" fontSize="9" fill={C.b}>{bi(l, 'lagging: Okazaki fragments, each 5′→3′', 'ラギング鎖：岡崎フラグメント、各 5′→3′')}</text>
      <circle cx="150" cy="85" r="7" fill="#fde68a" stroke={C.ink} />
      <text x="140" y="105" fontSize="9">{bi(l, 'helicase', 'ヘリカーゼ')}</text>
      <Arrow x1={165} y1={30} x2={200} y2={30} c="k" label={bi(l, 'fork moves', 'フォークの進行')} />
    </Fig>
  ),
  'central-dogma': (l) => (
    <Fig w={340} h={120} caption={bi(l, 'DNA is transcribed into mRNA in the nucleus (introns spliced out in eukaryotes), then translated on a ribosome, three bases per amino acid.', 'DNA は核内で mRNA に転写され（真核生物ではイントロンが除かれ）、リボソームで 3 塩基ごとに 1 アミノ酸として翻訳される。')}>
      <rect x="10" y="40" width="70" height="34" rx="6" fill="#dbeafe" stroke={C.ink} />
      <text x="30" y="61" fontSize="12" fontWeight="600">DNA</text>
      <rect x="135" y="40" width="70" height="34" rx="6" fill="#fef3c7" stroke={C.ink} />
      <text x="150" y="61" fontSize="12" fontWeight="600">mRNA</text>
      <rect x="260" y="40" width="72" height="34" rx="6" fill="#dcfce7" stroke={C.ink} />
      <text x="268" y="61" fontSize="11" fontWeight="600">{bi(l, 'protein', 'タンパク質')}</text>
      <Arrow x1={82} y1={57} x2={132} y2={57} c="a" />
      <text x="84" y="30" fontSize="9" fill={C.a}>{bi(l, 'transcription', '転写')}</text>
      <text x="80" y="92" fontSize="8">{bi(l, 'RNA polymerase, promoter', 'RNA ポリメラーゼ、プロモーター')}</text>
      <Arrow x1={207} y1={57} x2={257} y2={57} c="c" />
      <text x="212" y="30" fontSize="9" fill={C.c}>{bi(l, 'translation', '翻訳')}</text>
      <text x="205" y="92" fontSize="8">{bi(l, 'ribosome, tRNA, codons', 'リボソーム、tRNA、コドン')}</text>
      <text x="10" y="110" fontSize="8">{bi(l, 'nucleus', '核')} ←────────→ {bi(l, 'cytoplasm', '細胞質')}</text>
    </Fig>
  ),
  recombinant: (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Cut the gene and the plasmid with the same restriction enzyme, join with DNA ligase, put the plasmid into E. coli, which then expresses the human gene.', '遺伝子とプラスミドを同じ制限酵素で切り、DNA リガーゼでつなぎ、プラスミドを大腸菌に入れると、大腸菌がヒトの遺伝子を発現する。')}>
      <line x1="15" y1="40" x2="95" y2="40" stroke={C.b} strokeWidth="5" />
      <text x="10" y="30" fontSize="9">{bi(l, 'human gene', 'ヒトの遺伝子')}</text>
      <circle cx="55" cy="105" r="25" fill="none" stroke={C.a} strokeWidth="4" />
      <text x="24" y="143" fontSize="9">{bi(l, 'plasmid', 'プラスミド')}</text>
      <Arrow x1={100} y1={75} x2={140} y2={75} c="k" label={bi(l, 'restriction enzyme', '制限酵素')} lx={92} ly={64} />
      <circle cx="185" cy="80" r="28" fill="none" stroke={C.a} strokeWidth="4" />
      <path d="M160,70 A28,28 0 0,1 176,54" fill="none" stroke={C.b} strokeWidth="5" />
      <text x="150" y="128" fontSize="9">{bi(l, 'ligase joins', 'リガーゼで結合')}</text>
      <Arrow x1={220} y1={80} x2={255} y2={80} c="k" />
      <ellipse cx="295" cy="80" rx="38" ry="22" fill="#fef3c7" stroke={C.ink} />
      <circle cx="295" cy="80" r="9" fill="none" stroke={C.a} strokeWidth="2.5" />
      <text x="272" y="118" fontSize="9">E. coli → {bi(l, 'insulin', 'インスリン')}</text>
    </Fig>
  ),
  linkage: (l) => (
    <Fig w={340} h={160} caption={bi(l, 'Linked genes A and B sit on the same chromosome. Crossing over between them in meiosis I swaps segments, giving the two minority recombinant gametes Ab and aB.', '連鎖した遺伝子 A と B は同じ染色体上。減数第一分裂での乗換えが断片を交換し、少数派の組換え配偶子 Ab と aB ができる。')}>
      <line x1="40" y1="40" x2="40" y2="120" stroke={C.a} strokeWidth="6" />
      <line x1="60" y1="40" x2="60" y2="120" stroke={C.b} strokeWidth="6" />
      <text x="25" y="35" fontSize="10">A</text>
      <text x="25" y="130" fontSize="10">B</text>
      <text x="66" y="35" fontSize="10">a</text>
      <text x="66" y="130" fontSize="10">b</text>
      <path d="M40,80 L60,95" stroke={C.ink} strokeWidth="1.5" />
      <path d="M60,80 L40,95" stroke={C.ink} strokeWidth="1.5" />
      <text x="20" y="150" fontSize="9">{bi(l, 'crossing over', '乗換え')}</text>
      <Arrow x1={90} y1={80} x2={125} y2={80} c="k" />
      {[['A B', C.a, C.a, 140], ['a b', C.b, C.b, 185], ['A b', C.a, C.b, 240], ['a B', C.b, C.a, 285]].map(([lab, top, bot, x], i) => (
        <g key={i}>
          <line x1={Number(x)} y1="45" x2={Number(x)} y2="85" stroke={String(top)} strokeWidth="6" />
          <line x1={Number(x)} y1="85" x2={Number(x)} y2="120" stroke={String(bot)} strokeWidth="6" />
          <text x={Number(x) - 10} y="138" fontSize="10">{String(lab)}</text>
        </g>
      ))}
      <text x="135" y="30" fontSize="9">{bi(l, 'parental (many)', '親型（多い）')}</text>
      <text x="230" y="30" fontSize="9" fill={C.d}>{bi(l, 'recombinant (few)', '組換え型（少ない）')}</text>
    </Fig>
  ),
  meiosis: (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Meiosis I separates homologous pairs (2n → n); meiosis II separates sister chromatids. DNA is copied only once, before division I.', '第一分裂で相同染色体が分かれ（2n → n）、第二分裂で姉妹染色分体が分かれる。DNA の複製は第一分裂の前に1回だけ。')}>
      <circle cx="45" cy="75" r="30" fill="#f1f5f9" stroke={C.ink} />
      <line x1="38" y1="55" x2="38" y2="95" stroke={C.a} strokeWidth="5" />
      <line x1="46" y1="55" x2="46" y2="95" stroke={C.a} strokeWidth="5" />
      <line x1="54" y1="60" x2="54" y2="90" stroke={C.b} strokeWidth="5" />
      <line x1="62" y1="60" x2="62" y2="90" stroke={C.b} strokeWidth="5" />
      <text x="20" y="125" fontSize="9">2n, 4C</text>
      <Arrow x1={80} y1={75} x2={110} y2={75} c="k" label="I" lx={90} ly={68} />
      <circle cx="145" cy="45" r="22" fill="#f1f5f9" stroke={C.ink} />
      <line x1="140" y1="30" x2="140" y2="60" stroke={C.a} strokeWidth="5" />
      <line x1="148" y1="30" x2="148" y2="60" stroke={C.a} strokeWidth="5" />
      <circle cx="145" cy="108" r="22" fill="#f1f5f9" stroke={C.ink} />
      <line x1="140" y1="95" x2="140" y2="121" stroke={C.b} strokeWidth="5" />
      <line x1="148" y1="95" x2="148" y2="121" stroke={C.b} strokeWidth="5" />
      <text x="120" y="142" fontSize="9">n, 2C</text>
      <Arrow x1={172} y1={75} x2={202} y2={75} c="k" label="II" lx={182} ly={68} />
      {[[240, 28, C.a], [240, 72, C.a], [240, 116, C.b], [300, 72, C.b]].map(([x, y, col], i) => (
        <g key={i}>
          <circle cx={Number(x)} cy={Number(y)} r="16" fill="#f1f5f9" stroke={C.ink} />
          <line x1={Number(x)} y1={Number(y) - 10} x2={Number(x)} y2={Number(y) + 10} stroke={String(col)} strokeWidth="5" />
        </g>
      ))}
      <text x="262" y="30" fontSize="9">n, C</text>
      <text x="255" y="140" fontSize="9">{bi(l, '4 gametes', '配偶子4個')}</text>
    </Fig>
  ),
  'embryo-sac': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Embryo sac (8 nuclei): egg + 2 synergids at the micropyle end, 2 polar nuclei in the centre, 3 antipodals at the far end. Sperm 1 + egg → embryo (2n); sperm 2 + 2 polar nuclei → endosperm (3n).', '胚のう（核8個）：珠孔側に卵細胞 ＋ 助細胞2、中央に極核2、反対側に反足細胞3。精細胞1 ＋ 卵 → 胚（2n）。精細胞2 ＋ 極核2 → 胚乳（3n）。')}>
      <ellipse cx="170" cy="85" rx="70" ry="60" fill="#dcfce7" stroke={C.ink} strokeWidth="2" />
      {[[150, 130], [190, 130]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill="#fef3c7" stroke={C.ink} />
      ))}
      <circle cx="170" cy="122" r="9" fill="#fecaca" stroke={C.b} strokeWidth="2" />
      <text x="205" y="138" fontSize="9">{bi(l, 'egg + 2 synergids', '卵細胞 ＋ 助細胞2')}</text>
      <circle cx="160" cy="85" r="7" fill="#bfdbfe" stroke={C.a} />
      <circle cx="180" cy="85" r="7" fill="#bfdbfe" stroke={C.a} />
      <text x="245" y="90" fontSize="9">{bi(l, '2 polar nuclei', '極核2')}</text>
      {[[150, 40], [170, 34], [190, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill="#e2e8f0" stroke={C.ink} />
      ))}
      <text x="205" y="40" fontSize="9">{bi(l, '3 antipodal cells', '反足細胞3')}</text>
      <Arrow x1={170} y1={168} x2={170} y2={140} c="b" label={bi(l, 'pollen tube: 2 sperm', '花粉管：精細胞2')} lx={20} ly={160} />
      <text x="20" y="20" fontSize="9">{bi(l, 'micropyle end ↓', '珠孔側 ↓')}</text>
    </Fig>
  ),
  gastrula: (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Blastula: hollow ball with the blastocoel. Gastrula: cells fold in at the blastopore, making the archenteron (future gut) lined by endoderm, ectoderm outside, mesoderm between.', '胞胚：胞胚腔をもつ中空の球。原腸胚：原口から細胞が陥入し、内胚葉に裏打ちされた原腸（将来の腸）ができ、外側は外胚葉、間は中胚葉。')}>
      <circle cx="75" cy="85" r="55" fill="none" stroke={C.a} strokeWidth="8" />
      <text x="52" y="90" fontSize="9">{bi(l, 'blastocoel', '胞胚腔')}</text>
      <text x="45" y="160" fontSize="10" fontWeight="600">{bi(l, 'blastula', '胞胚')}</text>
      <circle cx="235" cy="85" r="55" fill="none" stroke={C.a} strokeWidth="8" />
      <path d="M290,85 C270,60 215,60 210,85 C215,110 270,110 290,85" fill="#fef3c7" stroke={C.d} strokeWidth="6" />
      <path d="M262,70 C250,60 225,65 222,85" fill="none" stroke={C.b} strokeWidth="4" />
      <text x="228" y="89" fontSize="8">{bi(l, 'archenteron', '原腸')}</text>
      <text x="292" y="72" fontSize="9">{bi(l, 'blastopore', '原口')}</text>
      <text x="185" y="40" fontSize="9" fill={C.a}>{bi(l, 'ectoderm', '外胚葉')}</text>
      <text x="245" y="128" fontSize="9" fill={C.d}>{bi(l, 'endoderm', '内胚葉')}</text>
      <text x="200" y="60" fontSize="9" fill={C.b}>{bi(l, 'mesoderm', '中胚葉')}</text>
      <text x="205" y="160" fontSize="10" fontWeight="600">{bi(l, 'gastrula', '原腸胚')}</text>
    </Fig>
  ),
  circulation: (l) => (
    <Fig w={340} h={190} caption={bi(l, 'Two loops. Pulmonary: right heart → lungs → left heart. Systemic: left heart → body → right heart. The pulmonary artery carries venous (low-O₂) blood; the pulmonary vein carries the most oxygen-rich blood.', '2つの回路。肺循環：右心 → 肺 → 左心。体循環：左心 → 全身 → 右心。肺動脈は静脈血（低 O₂）、肺静脈は最も O₂ の多い血液を運ぶ。')}>
      <rect x="130" y="15" width="80" height="34" rx="8" fill="#dbeafe" stroke={C.ink} />
      <text x="152" y="37" fontSize="11" fontWeight="600">{bi(l, 'lungs', '肺')}</text>
      <rect x="130" y="140" width="80" height="34" rx="8" fill="#fecaca" stroke={C.ink} />
      <text x="150" y="162" fontSize="11" fontWeight="600">{bi(l, 'body', '全身')}</text>
      <rect x="120" y="72" width="48" height="46" rx="6" fill="#e2e8f0" stroke={C.ink} />
      <text x="128" y="92" fontSize="9">{bi(l, 'right', '右')}</text>
      <text x="126" y="106" fontSize="8">RA / RV</text>
      <rect x="172" y="72" width="48" height="46" rx="6" fill="#e2e8f0" stroke={C.ink} />
      <text x="184" y="92" fontSize="9">{bi(l, 'left', '左')}</text>
      <text x="178" y="106" fontSize="8">LA / LV</text>
      <path d="M144,72 C144,50 150,40 130,32" fill="none" stroke={C.a} strokeWidth="3" markerEnd="url(#ar-a)" />
      <text x="6" y="60" fontSize="9" fill={C.a}>{bi(l, 'pulmonary artery', '肺動脈')}</text>
      <text x="6" y="71" fontSize="8" fill={C.a}>{bi(l, '(venous blood)', '（静脈血）')}</text>
      <path d="M210,32 C225,40 196,50 196,72" fill="none" stroke={C.b} strokeWidth="3" markerEnd="url(#ar-b)" />
      <text x="222" y="60" fontSize="9" fill={C.b}>{bi(l, 'pulmonary vein', '肺静脈')}</text>
      <path d="M196,118 C196,135 250,120 250,157 L212,157" fill="none" stroke={C.b} strokeWidth="3" markerEnd="url(#ar-b)" />
      <text x="240" y="185" fontSize="9" fill={C.b}>{bi(l, 'aorta', '大動脈')}</text>
      <path d="M128,157 C90,157 90,120 144,118" fill="none" stroke={C.a} strokeWidth="3" markerEnd="url(#ar-a)" />
      <text x="20" y="150" fontSize="9" fill={C.a}>{bi(l, 'vena cava', '大静脈')}</text>
    </Fig>
  ),
  'oxygen-dissociation': (l) => (
    <Plot
      x={[0, 110]}
      y={[0, 100]}
      xLabel={bi(l, 'O₂ partial pressure', 'O₂ 分圧')}
      yLabel={bi(l, '% saturation', '酸素ヘモグロビン %')}
      curves={[
        { pts: Array.from({ length: 23 }, (_, i) => { const p = i * 5; return [p, (100 * p ** 2.7) / (26 ** 2.7 + p ** 2.7)] as Pt; }), color: C.a, label: bi(l, 'low CO₂ (lungs)', '低 CO₂（肺）'), labelAt: 9 },
        { pts: Array.from({ length: 23 }, (_, i) => { const p = i * 5; return [p, (100 * p ** 2.7) / (36 ** 2.7 + p ** 2.7)] as Pt; }), color: C.b, label: bi(l, 'high CO₂ (tissue)', '高 CO₂（組織）'), labelAt: 22 },
      ]}
      vlines={[{ x: 100, label: bi(l, 'lungs', '肺') }, { x: 30, label: bi(l, 'tissue', '組織') }]}
      hlines={[{ y: 96 }, { y: 35 }]}
      caption={bi(l, 'Read saturation on the lung curve at pO₂ = 100 (≈96%) and on the tissue curve at pO₂ = 30 (≈35%): the difference, ≈61% of the haemoglobin, unloads its O₂ in the tissue.', '肺の曲線で pO₂ = 100 の飽和度（≈96%）、組織の曲線で pO₂ = 30 の飽和度（≈35%）を読む：差の ≈61% のヘモグロビンが組織で O₂ を放す。')}
    />
  ),
  nephron: (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Glomerulus filters plasma minus proteins into Bowman\'s capsule (primitive urine); the tubule reabsorbs all glucose and most water and salt into the capillaries; what is left leaves as urine.', '糸球体がタンパク質を除いた血しょうをボーマンのうへろ過（原尿）。細尿管がグルコース全部と水・塩の大部分を毛細血管へ再吸収。残りが尿として出る。')}>
      <circle cx="60" cy="60" r="28" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="60" cy="60" r="16" fill="#fecaca" stroke={C.b} strokeWidth="2" />
      <text x="6" y="105" fontSize="8">{bi(l, 'glomerulus in', '糸球体')}</text>
      <text x="6" y="115" fontSize="8">{bi(l, 'Bowman\'s capsule', '（ボーマンのう内）')}</text>
      <Arrow x1={20} y1={40} x2={44} y2={52} c="b" label={bi(l, 'blood in', '血液')} lx={4} ly={30} />
      <path d="M88,60 L130,60 L130,130 L200,130 L200,60 L280,60 L280,140" fill="none" stroke={C.d} strokeWidth="6" />
      <text x="95" y="52" fontSize="9">{bi(l, 'primitive urine', '原尿')}</text>
      <text x="140" y="148" fontSize="9">{bi(l, 'tubule', '細尿管')}</text>
      <text x="285" y="150" fontSize="9">{bi(l, 'urine', '尿')}</text>
      <path d="M140,75 L140,120 L190,120 L190,75" fill="none" stroke={C.b} strokeWidth="3" strokeDasharray="4 3" />
      <text x="205" y="90" fontSize="9" fill={C.b}>{bi(l, 'capillary: reabsorbs', '毛細血管：再吸収')}</text>
      <text x="205" y="102" fontSize="9" fill={C.b}>{bi(l, 'glucose 100%, water 99%', 'グルコース 100%、水 99%')}</text>
      <Arrow x1={165} y1={125} x2={165} y2={105} c="b" />
    </Fig>
  ),
  'blood-sugar': (l) => (
    <Fig w={340} h={180} caption={bi(l, 'Only insulin lowers blood sugar; glucagon and adrenaline (and glucocorticoids) raise it. The hypothalamus reads the level and acts through autonomic nerves and the pituitary.', '血糖を下げるのはインスリンだけ。グルカゴンとアドレナリン（と糖質コルチコイド）が上げる。視床下部が血糖を感知し、自律神経と脳下垂体を通してはたらく。')}>
      <rect x="120" y="70" width="100" height="36" rx="8" fill="#fef3c7" stroke={C.ink} />
      <text x="132" y="92" fontSize="11" fontWeight="600">{bi(l, 'blood glucose', '血糖')}</text>
      <text x="20" y="30" fontSize="10" fontWeight="600" fill={C.c}>{bi(l, 'too high →', '高い →')}</text>
      <rect x="20" y="40" width="90" height="30" rx="6" fill="#dcfce7" stroke={C.c} />
      <text x="26" y="59" fontSize="9">{bi(l, 'insulin (β cells)', 'インスリン（B 細胞）')}</text>
      <Arrow x1={110} y1={55} x2={118} y2={75} c="c" />
      <text x="20" y="88" fontSize="8" fill={C.c}>{bi(l, '→ glycogen, into cells', '→ グリコーゲン、細胞へ')}</text>
      <text x="230" y="30" fontSize="10" fontWeight="600" fill={C.b}>{bi(l, '← too low', '← 低い')}</text>
      <rect x="230" y="40" width="100" height="30" rx="6" fill="#fecaca" stroke={C.b} />
      <text x="236" y="52" fontSize="8">{bi(l, 'glucagon (α cells)', 'グルカゴン（A 細胞）')}</text>
      <text x="236" y="64" fontSize="8">{bi(l, 'adrenaline (medulla)', 'アドレナリン（髄質）')}</text>
      <Arrow x1={230} y1={55} x2={222} y2={75} c="b" />
      <text x="228" y="88" fontSize="8" fill={C.b}>{bi(l, 'glycogen → glucose', 'グリコーゲン → グルコース')}</text>
      <rect x="120" y="130" width="100" height="30" rx="8" fill="#e2e8f0" stroke={C.ink} />
      <text x="128" y="149" fontSize="10">{bi(l, 'hypothalamus', '視床下部')}</text>
      <Arrow x1={170} y1={108} x2={170} y2={128} c="k" />
      <text x="30" y="150" fontSize="8">{bi(l, 'parasympathetic →', '副交感神経 →')}</text>
      <text x="228" y="150" fontSize="8">{bi(l, '← sympathetic', '← 交感神経')}</text>
    </Fig>
  ),
  thermoregulation: (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Cold: constrict skin vessels, shiver, raise metabolism (adrenaline, thyroxine). Hot: dilate vessels, sweat. The hypothalamus is the thermostat.', '寒い：皮膚の血管を収縮、ふるえ、代謝を上げる（アドレナリン、チロキシン）。暑い：血管を拡張、発汗。視床下部が体温のサーモスタット。')}>
      <rect x="120" y="55" width="100" height="34" rx="8" fill="#e2e8f0" stroke={C.ink} />
      <text x="128" y="76" fontSize="10" fontWeight="600">{bi(l, 'hypothalamus', '視床下部')}</text>
      <text x="14" y="30" fontSize="10" fontWeight="600" fill={C.a}>{bi(l, 'cold', '寒い')}</text>
      <text x="14" y="48" fontSize="8">{bi(l, 'vessels constrict', '血管収縮')}</text>
      <text x="14" y="62" fontSize="8">{bi(l, 'shivering', 'ふるえ')}</text>
      <text x="14" y="76" fontSize="8">{bi(l, 'adrenaline, thyroxine ↑', 'アドレナリン、チロキシン ↑')}</text>
      <text x="14" y="90" fontSize="8">{bi(l, 'goose bumps', '鳥肌')}</text>
      <Arrow x1={118} y1={72} x2={100} y2={72} c="a" />
      <text x="250" y="30" fontSize="10" fontWeight="600" fill={C.b}>{bi(l, 'hot', '暑い')}</text>
      <text x="250" y="48" fontSize="8">{bi(l, 'vessels dilate', '血管拡張')}</text>
      <text x="250" y="62" fontSize="8">{bi(l, 'sweating', '発汗')}</text>
      <text x="250" y="76" fontSize="8">{bi(l, 'metabolism not raised', '代謝は上げない')}</text>
      <Arrow x1={222} y1={72} x2={240} y2={72} c="b" />
      <text x="110" y="125" fontSize="9">{bi(l, 'setpoint ≈ 37 °C, negative feedback', '設定値 ≈ 37 ℃、負のフィードバック')}</text>
    </Fig>
  ),
  'immune-response': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'A macrophage/dendritic cell presents the antigen; the helper T cell activates B cells (antibodies: humoral) and killer T cells (cellular). Memory cells remain for next time.', 'マクロファージ／樹状細胞が抗原を提示。ヘルパー T 細胞が B 細胞（抗体：体液性）とキラー T 細胞（細胞性）を活性化。記憶細胞が次回のために残る。')}>
      <circle cx="50" cy="85" r="24" fill="#fef3c7" stroke={C.ink} />
      <text x="22" y="125" fontSize="9">{bi(l, 'macrophage / dendritic', 'マクロファージ／樹状細胞')}</text>
      <text x="30" y="89" fontSize="8">{bi(l, 'antigen', '抗原提示')}</text>
      <Arrow x1={76} y1={85} x2={118} y2={85} c="k" />
      <circle cx="145" cy="85" r="24" fill="#dcfce7" stroke={C.c} />
      <text x="126" y="89" fontSize="9" fontWeight="600">{bi(l, 'helper T', 'ヘルパー T')}</text>
      <Arrow x1={165} y1={70} x2={215} y2={40} c="c" />
      <Arrow x1={165} y1={100} x2={215} y2={130} c="c" />
      <circle cx="245" cy="35" r="20" fill="#dbeafe" stroke={C.a} />
      <text x="238" y="39" fontSize="9" fontWeight="600">B</text>
      <text x="270" y="30" fontSize="9">{bi(l, '→ antibodies', '→ 抗体')}</text>
      <text x="270" y="42" fontSize="8">{bi(l, '(humoral)', '（体液性）')}</text>
      <circle cx="245" cy="135" r="20" fill="#fecaca" stroke={C.b} />
      <text x="228" y="139" fontSize="8" fontWeight="600">{bi(l, 'killer T', 'キラー T')}</text>
      <text x="270" y="130" fontSize="9">{bi(l, '→ kills infected cells', '→ 感染細胞を殺す')}</text>
      <text x="270" y="142" fontSize="8">{bi(l, '(cellular)', '（細胞性）')}</text>
      <text x="200" y="88" fontSize="8" fill={C.c}>{bi(l, 'cytokines', 'サイトカイン')}</text>
    </Fig>
  ),
  'antibody-response': (l) => (
    <Plot
      x={[0, 60]}
      y={[0, 10]}
      xLabel={bi(l, 'days', '日')}
      yLabel={bi(l, 'antibody', '抗体量')}
      curves={[
        { pts: [[0, 0], [5, 0.1], [8, 0.8], [12, 1.8], [16, 1.4], [22, 0.6], [30, 0.3], [32, 0.4], [34, 3], [37, 7.5], [42, 9], [50, 7.5], [60, 5.5]], color: C.a, label: bi(l, 'antigen A', '抗原 A'), labelAt: 10 },
        { pts: [[30, 0], [35, 0.1], [38, 0.8], [42, 1.8], [46, 1.4], [52, 0.6], [60, 0.3]], color: C.b, label: bi(l, 'antigen B (first time)', '抗原 B（初回）'), labelAt: 3 },
      ]}
      vlines={[{ x: 0, label: bi(l, '1st A', 'A 1回目') }, { x: 30, label: bi(l, '2nd A + 1st B', 'A 2回目 ＋ B 初回') }]}
      caption={bi(l, 'Second exposure to A: faster and much higher (memory cells). B given at the same time only gets a slow primary response — immunity is specific.', 'A の2回目：速く、はるかに高い（記憶細胞）。同時に与えた B は遅い一次応答だけ — 免疫は特異的。')}
    />
  ),
  'action-potential': (l) => (
    <Plot
      x={[0, 5]}
      y={[-90, 50]}
      xLabel="t (ms)"
      yLabel="mV"
      curves={[
        { pts: [[0, -70], [0.8, -70], [1, -55], [1.3, 30], [1.6, 0], [1.9, -80], [2.5, -75], [3.2, -70], [5, -70]], color: C.a },
      ]}
      hlines={[{ y: -70, label: '−70' }, { y: -55, label: '−55' }, { y: 0, label: '0' }]}
      points={[{ x: 0.3, y: -55, label: bi(l, 'threshold', '閾値'), color: C.d }, { x: 1.15, y: -20, label: bi(l, 'Na⁺ in', 'Na⁺ 流入'), color: C.b }, { x: 1.75, y: -30, label: bi(l, 'K⁺ out', 'K⁺ 流出'), color: C.c }]}
      caption={bi(l, 'Above threshold, Na⁺ channels open (depolarisation to +30 mV), then K⁺ channels open (repolarisation, brief undershoot). Same size every time — all or none.', '閾値を超えると Na⁺ チャネルが開き（+30 mV まで脱分極）、次に K⁺ チャネルが開く（再分極、少し下回る）。毎回同じ大きさ — 全か無か。')}
    />
  ),
  eye: (l) => (
    <Fig w={340} h={160} caption={bi(l, 'Light is focused by the lens onto the retina. In the retina, light passes the ganglion and bipolar cells first and reaches the rods and cones at the back; the signal then travels forward to the optic nerve.', '光は水晶体で網膜に結ばれる。網膜では光がまず神経節細胞と双極細胞を通り、奥の桿体・錐体に届く。信号はその後前へ戻って視神経へ。')}>
      <ellipse cx="90" cy="80" rx="70" ry="55" fill="#f8fafc" stroke={C.ink} strokeWidth="2" />
      <ellipse cx="42" cy="80" rx="10" ry="22" fill="#dbeafe" stroke={C.a} />
      <text x="26" y="130" fontSize="9">{bi(l, 'lens', '水晶体')}</text>
      <path d="M155,40 A70,55 0 0,1 155,120" fill="none" stroke={C.b} strokeWidth="4" />
      <text x="120" y="145" fontSize="9" fill={C.b}>{bi(l, 'retina', '網膜')}</text>
      <circle cx="158" cy="80" r="4" fill={C.d} />
      <text x="140" y="70" fontSize="8">{bi(l, 'fovea', '黄斑')}</text>
      <line x1="160" y1="98" x2="200" y2="110" stroke={C.ink} strokeWidth="3" />
      <text x="140" y="135" fontSize="8">{bi(l, 'optic nerve', '視神経')}</text>
      <Arrow x1={5} y1={80} x2={30} y2={80} c="d" label="" />
      <rect x="215" y="30" width="115" height="100" rx="6" fill="#fff" stroke={C.faint} />
      <text x="220" y="45" fontSize="8" fontWeight="600">{bi(l, 'retina, zoomed', '網膜の拡大')}</text>
      <Arrow x1={225} y1={60} x2={225} y2={115} c="d" label={bi(l, 'light', '光')} lx={218} ly={126} />
      <text x="245" y="62" fontSize="8">{bi(l, 'ganglion cells', '神経節細胞')}</text>
      <text x="245" y="82" fontSize="8">{bi(l, 'bipolar cells', '双極細胞')}</text>
      <text x="245" y="102" fontSize="8">{bi(l, 'rods & cones', '桿体・錐体')}</text>
      <Arrow x1={318} y1={110} x2={318} y2={58} c="a" label="" />
      <text x="300" y="125" fontSize="7" fill={C.a}>{bi(l, 'signal', '信号')}</text>
    </Fig>
  ),
  sarcomere: (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Thin actin filaments (from the Z lines) slide over thick myosin filaments. On contraction the I band and H zone shrink; the A band (myosin length) stays the same.', '細いアクチンフィラメント（Z 膜から）が太いミオシンフィラメントの上を滑る。収縮で明帯と H 帯は縮み、暗帯（ミオシンの長さ）は変わらない。')}>
      <line x1="30" y1="30" x2="30" y2="110" stroke={C.ink} strokeWidth="3" />
      <line x1="310" y1="30" x2="310" y2="110" stroke={C.ink} strokeWidth="3" />
      <text x="20" y="125" fontSize="9">Z</text>
      <text x="304" y="125" fontSize="9">Z</text>
      {[45, 70, 95].map((y) => (
        <g key={y}>
          <line x1="30" y1={y} x2="140" y2={y} stroke={C.a} strokeWidth="3" />
          <line x1="200" y1={y} x2="310" y2={y} stroke={C.a} strokeWidth="3" />
        </g>
      ))}
      {[57, 82].map((y) => (
        <line key={y} x1="100" y1={y} x2="240" y2={y} stroke={C.b} strokeWidth="6" />
      ))}
      <line x1="100" y1="20" x2="240" y2="20" stroke={C.ink} />
      <text x="150" y="16" fontSize="9">{bi(l, 'A band (same)', '暗帯（不変）')}</text>
      <line x1="140" y1="135" x2="200" y2="135" stroke={C.ink} />
      <text x="152" y="146" fontSize="8">{bi(l, 'H zone ↓', 'H 帯 ↓')}</text>
      <line x1="30" y1="135" x2="100" y2="135" stroke={C.ink} />
      <text x="45" y="146" fontSize="8">{bi(l, 'I band ↓', '明帯 ↓')}</text>
      <text x="245" y="60" fontSize="8" fill={C.b}>{bi(l, 'myosin', 'ミオシン')}</text>
      <text x="245" y="100" fontSize="8" fill={C.a}>{bi(l, 'actin', 'アクチン')}</text>
    </Fig>
  ),
  'auxin-response': (l) => (
    <Plot
      x={[0, 6]}
      y={[-1, 1.2]}
      xLabel={bi(l, 'auxin concentration (log)', 'オーキシン濃度（対数）')}
      yLabel={bi(l, 'growth', '成長')}
      curves={[
        { pts: Array.from({ length: 40 }, (_, i) => { const x = (i * 6) / 39; return [x, 1.1 * Math.exp(-((x - 1.5) ** 2) / 0.9) - 0.15 * Math.max(0, x - 3)] as Pt; }), color: C.c, label: bi(l, 'root', '根'), labelAt: 10 },
        { pts: Array.from({ length: 40 }, (_, i) => { const x = (i * 6) / 39; return [x, 1.1 * Math.exp(-((x - 4) ** 2) / 1.2) - 0.05 * Math.max(0, x - 5.5)] as Pt; }), color: C.b, label: bi(l, 'stem', '茎'), labelAt: 26 },
      ]}
      hlines={[{ y: 0, label: '0' }]}
      vlines={[{ x: 4, label: bi(l, 'stem optimum', '茎の最適') }]}
      caption={bi(l, 'The concentration that makes the stem grow most already inhibits the root (below zero). That is why a horizontal root bends down and a horizontal stem bends up.', '茎を最もよく伸ばす濃度で根はすでに抑制される（0 以下）。だから水平にした根は下へ、茎は上へ曲がる。')}
    />
  ),
  photoperiod: (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Bars: white = light, black = dark. A short-day plant (critical dark period 10 h) flowers only when the continuous dark exceeds 10 h; a flash of light at night splits the dark period and prevents flowering.', '棒：白 = 明期、黒 = 暗期。短日植物（限界暗期 10 時間）は連続した暗期が 10 時間を超えるときだけ開花。夜の短い光は暗期を分断して開花を妨げる。')}>
      {[
        [30, 14, 10, bi(l, 'flowers ✓', '開花 ✓'), true],
        [70, 8, 16, bi(l, 'no ✗', '開花せず ✗'), false],
        [110, 14, 10, bi(l, 'no ✗ (night break)', '開花せず ✗（光中断）'), false],
      ].map(([y, dark, light, lab, ok], i) => {
        const total = 24;
        const x0 = 20;
        const w = 190;
        const dw = (Number(dark) / total) * w;
        return (
          <g key={i}>
            <rect x={x0} y={Number(y)} width={dw} height="20" fill={C.ink} />
            <rect x={x0 + dw} y={Number(y)} width={w - dw} height="20" fill="#fff" stroke={C.ink} />
            {i === 2 ? <rect x={x0 + dw / 2 - 3} y={Number(y)} width="6" height="20" fill="#fde68a" stroke={C.d} /> : null}
            <text x={x0 + 4} y={Number(y) + 14} fontSize="9" fill="#fff">{dark} h</text>
            <text x={x0 + w + 6} y={Number(y) + 14} fontSize="9" fill={ok ? C.c : C.b} fontWeight="600">{String(lab)}</text>
          </g>
        );
      })}
      <text x="20" y="160" fontSize="9">{bi(l, 'short-day plant, critical dark period 10 h', '短日植物、限界暗期 10 時間')}</text>
    </Fig>
  ),
  survivorship: (l) => (
    <Plot
      x={[0, 100]}
      y={[0, 3.1]}
      xLabel={bi(l, '% of maximum lifespan', '最大寿命に対する %')}
      yLabel={bi(l, 'survivors (log)', '生存数（対数）')}
      curves={[
        { pts: Array.from({ length: 21 }, (_, i) => { const x = i * 5; return [x, 3 - 2.9 * Math.pow(x / 100, 6)] as Pt; }), color: C.a, label: bi(l, 'I: humans', 'I 型：ヒト'), labelAt: 12 },
        { pts: [[0, 3], [100, 0.1]], color: C.c, label: bi(l, 'II: birds', 'II 型：鳥類'), labelAt: 1 },
        { pts: Array.from({ length: 21 }, (_, i) => { const x = i * 5; return [x, 0.1 + 2.9 * Math.exp(-x / 8)] as Pt; }), color: C.b, label: bi(l, 'III: fish', 'III 型：魚類'), labelAt: 4 },
      ]}
      caption={bi(l, 'Type I: most survive to old age (few offspring, much care). Type II: constant risk. Type III: most die young (many offspring, no care).', 'I 型（晩死型）：多くが老齢まで生きる（子は少なく保護が厚い）。II 型（平均型）：危険が一定。III 型（早死型）：多くが幼いうちに死ぬ（子は多く保護なし）。')}
    />
  ),
  'energy-flow': (l) => (
    <Fig w={340} h={170} caption={bi(l, 'Energy enters as light, passes up the food chain shrinking ~90% per level, and leaves as heat from every level. Matter cycles; energy does not.', 'エネルギーは光として入り、食物連鎖を上がるごとに約 90% 減り、各段階から熱として出る。物質は循環するがエネルギーは循環しない。')}>
      <text x="10" y="30" fontSize="10" fontWeight="600" fill={C.d}>☀ {bi(l, 'light', '光')}</text>
      <rect x="20" y="120" width="200" height="22" fill="#dcfce7" stroke={C.ink} />
      <text x="26" y="135" fontSize="9">{bi(l, 'producers 100%', '生産者 100%')}</text>
      <rect x="20" y="90" width="90" height="22" fill="#fef3c7" stroke={C.ink} />
      <text x="26" y="105" fontSize="9">{bi(l, 'herbivores ~10%', '一次消費者 約 10%')}</text>
      <rect x="20" y="60" width="40" height="22" fill="#fecaca" stroke={C.ink} />
      <text x="26" y="75" fontSize="8">{bi(l, '~1%', '約 1%')}</text>
      <text x="64" y="75" fontSize="8">{bi(l, 'carnivores', '二次消費者')}</text>
      {[131, 101, 71].map((y, i) => (
        <Arrow key={i} x1={230 + i * 0} y1={y} x2={290} y2={y} c="b" label={bi(l, 'heat', '熱')} lx={294} ly={y + 4} />
      ))}
      <Arrow x1={70} y1={155} x2={70} y2={145} c="d" />
      <text x="80" y="160" fontSize="9">{bi(l, 'photosynthesis', '光合成')}</text>
      <text x="230" y="40" fontSize="8" fill={C.b}>{bi(l, 'respiration at every level', '各段階の呼吸')}</text>
    </Fig>
  ),
  'plant-tree': (l) => (
    <Fig w={340} h={150} caption={bi(l, 'Each step adds a land-adaptation: vascular tissue (ferns), seeds (gymnosperms), flowers and fruit (angiosperms). Mosses have none of these and their main body is haploid.', '各段階で陸への適応が加わる：維管束（シダ）、種子（裸子植物）、花と果実（被子植物）。コケはどれももたず本体は単相。')}>
      <line x1="20" y1="120" x2="320" y2="120" stroke={C.ink} strokeWidth="2" />
      {[
        [45, bi(l, 'green algae', '緑藻'), ''],
        [108, bi(l, 'mosses', 'コケ植物'), bi(l, '+ land, cuticle', '＋ 陸上、クチクラ')],
        [171, bi(l, 'ferns', 'シダ植物'), bi(l, '+ vascular tissue', '＋ 維管束')],
        [234, bi(l, 'gymnosperms', '裸子植物'), bi(l, '+ seeds, pollen', '＋ 種子、花粉')],
        [297, bi(l, 'angiosperms', '被子植物'), bi(l, '+ flowers, fruit', '＋ 花、果実')],
      ].map(([x, name, gain], i) => (
        <g key={i}>
          <line x1={Number(x)} y1="120" x2={Number(x)} y2={60 - i * 8} stroke={C.c} strokeWidth="2" />
          <circle cx={Number(x)} cy={60 - i * 8} r="4" fill={C.c} />
          <text x={Number(x)} y={48 - i * 8} fontSize="8" fontWeight="600" textAnchor="middle">{String(name)}</text>
          <text x={Number(x)} y={140} fontSize="7" fill={C.b} textAnchor="middle">{String(gain)}</text>
        </g>
      ))}
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
