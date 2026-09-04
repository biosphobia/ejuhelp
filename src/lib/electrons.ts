// Ground-state electron configurations for Z = 1–118, derived from the
// Madelung (aufbau) order with the known exceptions patched in, plus the
// shell (K L M N …) view used in the Japanese curriculum.

const ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
const CAP: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };

// Ground-state anomalies (final occupancies for the affected subshells).
const EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { '3d': 5, '4s': 1 },
  29: { '3d': 10, '4s': 1 },
  41: { '4d': 4, '5s': 1 },
  42: { '4d': 5, '5s': 1 },
  44: { '4d': 7, '5s': 1 },
  45: { '4d': 8, '5s': 1 },
  46: { '4d': 10, '5s': 0 },
  47: { '4d': 10, '5s': 1 },
  57: { '4f': 0, '5d': 1 },
  58: { '4f': 1, '5d': 1 },
  64: { '4f': 7, '5d': 1 },
  78: { '5d': 9, '6s': 1 },
  79: { '5d': 10, '6s': 1 },
  89: { '5f': 0, '6d': 1 },
  90: { '5f': 0, '6d': 2 },
  91: { '5f': 2, '6d': 1 },
  92: { '5f': 3, '6d': 1 },
  93: { '5f': 4, '6d': 1 },
  96: { '5f': 7, '6d': 1 },
  103: { '6d': 0, '7p': 1 },
};

const NOBLE: [number, string][] = [
  [2, 'He'],
  [10, 'Ne'],
  [18, 'Ar'],
  [36, 'Kr'],
  [54, 'Xe'],
  [86, 'Rn'],
];

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

export interface ElectronInfo {
  /** Occupancy per subshell, in aufbau order, e.g. [['1s',2],['2s',2],['2p',6],['3s',1]]. */
  subshells: [string, number][];
  /** Electrons per principal shell, K first, e.g. [2, 8, 1]. */
  shells: number[];
  /** "K2 L8 M1" */
  shellText: string;
  /** Full configuration string, e.g. "1s² 2s² 2p⁶ 3s¹". */
  full: string;
  /** Noble-gas shorthand, e.g. "[Ne] 3s¹". */
  short: string;
  /** Block by the subshell being filled: s, p, d or f. */
  block: 's' | 'p' | 'd' | 'f';
  /** Valence electrons for main-group elements (outer-shell electrons; 0 for noble gases); null for d/f-block. */
  valence: number | null;
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('');

function occupancy(z: number): Map<string, number> {
  const occ = new Map<string, number>();
  let left = z;
  for (const sub of ORDER) {
    if (left <= 0) break;
    const n = Math.min(CAP[sub[1]], left);
    occ.set(sub, n);
    left -= n;
  }
  const fix = EXCEPTIONS[z];
  if (fix) for (const [sub, n] of Object.entries(fix)) occ.set(sub, n);
  return occ;
}

function fmt(pairs: [string, number][]): string {
  return pairs.map(([s, n]) => `${s}${sup(n)}`).join(' ');
}

const cache = new Map<number, ElectronInfo>();

export function electronInfo(z: number): ElectronInfo {
  const hit = cache.get(z);
  if (hit) return hit;

  const occ = occupancy(z);
  // Order by principal quantum number then l for the printed form (chemists' convention).
  const L: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 };
  const subshells = [...occ.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => Number(a[0][0]) - Number(b[0][0]) || L[a[0][1]] - L[b[0][1]]) as [string, number][];

  const shells: number[] = [];
  for (const [sub, n] of subshells) {
    const i = Number(sub[0]) - 1;
    shells[i] = (shells[i] ?? 0) + n;
  }
  for (let i = 0; i < shells.length; i++) shells[i] ??= 0;

  // Noble-gas core.
  let core: [number, string] | null = null;
  for (const ng of NOBLE) if (ng[0] < z) core = ng;
  let short: string;
  if (core) {
    const coreOcc = occupancy(core[0]);
    const rest = subshells
      .map(([s, n]) => [s, n - (coreOcc.get(s) ?? 0)] as [string, number])
      .filter(([, n]) => n > 0);
    short = `[${core[1]}] ${fmt(rest)}`;
  } else short = fmt(subshells);

  // Block = last subshell in aufbau order that is (partially) occupied per the fill sequence.
  let block: ElectronInfo['block'] = 's';
  let filled = 0;
  for (const sub of ORDER) {
    const n = occ.get(sub) ?? 0;
    if (n > 0) {
      filled += n;
      block = sub[1] as ElectronInfo['block'];
      if (filled >= z) break;
    }
  }
  // Helium is s-block. The lanthanoids and actinoids (57–71, 89–103) are the
  // f-block by position even where an exception puts the last electron in d or p.
  if (z === 2) block = 's';
  if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) block = 'f';

  const outer = shells[shells.length - 1] ?? 0;
  const isNoble = NOBLE.some(([n]) => n === z) || z === 118;
  const valence = block === 's' || block === 'p' ? (isNoble ? 0 : outer) : null;

  const info: ElectronInfo = {
    subshells,
    shells,
    shellText: shells.map((n, i) => `${SHELL_NAMES[i] ?? '?'}${n}`).join(' '),
    full: fmt(subshells),
    short,
    block,
    valence,
  };
  cache.set(z, info);
  return info;
}
