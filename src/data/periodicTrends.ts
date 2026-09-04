// Periodic trends and the exceptions the EJU likes to test, in English and Japanese.
import type { Bilingual } from './elements';

export type Direction = 'up' | 'down';

export interface Trend {
  id: string;
  title: Bilingual;
  /** One-line rule. */
  rule: Bilingual;
  /** Plain-language reason. */
  why: Bilingual;
  /** How the property changes moving right across a period / down a group. */
  across?: Direction;
  down?: Direction;
  examples: { en: string[]; ja: string[] };
  exceptions: { en: string[]; ja: string[] };
  /** Table colour mode that illustrates this trend, if any. */
  colorMode?: 'en' | 'category' | 'state' | 'block';
}

export const TRENDS: Trend[] = [
  {
    id: 'radius',
    title: { en: 'Atomic radius (size of the atom)', ja: '原子半径（原子の大きさ）' },
    rule: { en: 'Gets smaller across a period → and bigger down a group ↓.', ja: '周期を右へ行くほど小さく、族を下へ行くほど大きい。' },
    why: {
      en: 'Across a period the electrons go into the same shell while the nuclear charge grows, so they are pulled in tighter. Down a group a whole new shell is added, so the atom is bigger.',
      ja: '同じ周期では電子殻は同じまま陽子が増えるので、電子が強く引き寄せられて小さくなる。族を下がると新しい電子殻が増えるので大きくなる。',
    },
    across: 'down',
    down: 'up',
    examples: {
      en: ['Period 3: Na > Mg > Al > Si > P > S > Cl.', 'Group 1: Li < Na < K < Rb < Cs.'],
      ja: ['第3周期：Na > Mg > Al > Si > P > S > Cl。', '1族：Li < Na < K < Rb < Cs。'],
    },
    exceptions: {
      en: [
        'Noble-gas radii are measured differently (van der Waals), so they look “too big” in some tables — the exam only compares them within the trend.',
        'Ions: a **cation is smaller** than its atom (lost a shell or electrons), an **anion is larger** (extra repulsion). Same-electron series shrink with more protons: O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺.',
      ],
      ja: [
        '貴ガスの半径は測り方（ファンデルワールス半径）が違うため表によって「大きく」見えることがある。試験では傾向内での比較のみ。',
        'イオン：**陽イオンは原子より小さい**（電子殻や電子を失う）、**陰イオンは原子より大きい**（反発が増える）。同じ電子配置なら陽子が多いほど小さい：O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺。',
      ],
    },
  },
  {
    id: 'ie',
    title: { en: 'Ionisation energy (energy to remove an electron)', ja: 'イオン化エネルギー（電子を取り去るのに必要なエネルギー）' },
    rule: { en: 'Increases across a period → and decreases down a group ↓. Noble gases are the peaks, alkali metals the valleys.', ja: '周期を右へ行くほど大きく、族を下へ行くほど小さい。貴ガスが山、アルカリ金属が谷。' },
    why: {
      en: 'A smaller atom holds its outer electron closer to a stronger nucleus, so it is harder to remove. A low ionisation energy means the element easily becomes a **cation** (metallic character).',
      ja: '原子が小さいほど最外殻電子が強い原子核の近くにあり、取り去りにくい。イオン化エネルギーが小さい元素ほど**陽イオンになりやすい**（陽性が強い）。',
    },
    across: 'up',
    down: 'down',
    examples: {
      en: ['He has the highest of all; Cs (Fr) the lowest.', 'Li < Be … < Ne, then a sharp drop to Na.'],
      ja: ['He が全元素中最大、Cs（Fr）が最小。', 'Li < Be … < Ne、Na で急に下がる。'],
    },
    exceptions: {
      en: [
        'Small dips inside a period: **Be > B** and **N > O** (B’s electron is in a higher-energy 2p orbital; O’s extra electron is paired and repelled). The same pattern repeats in period 3 (Mg > Al, P > S).',
        'The **second** ionisation energy of an alkali metal is huge (it would break into a full shell) — a favourite way to identify group 1 from a table of I₁, I₂, I₃.',
      ],
      ja: [
        '周期内の小さなへこみ：**Be > B**、**N > O**（B の電子はエネルギーの高い 2p 軌道、O では電子が対になって反発する）。第3周期でも同じ（Mg > Al、P > S）。',
        'アルカリ金属の**第2**イオン化エネルギーは非常に大きい（閉殻を壊すため）— I₁・I₂・I₃ の表から1族を見分ける定番問題。',
      ],
    },
  },
  {
    id: 'ea',
    title: { en: 'Electron affinity (energy released when gaining an electron)', ja: '電子親和力（電子を受け取るときに放出されるエネルギー）' },
    rule: { en: 'Largest for the halogens (group 17); tiny or negative for noble gases and group 2.', ja: 'ハロゲン（17族）で最大。貴ガスと2族ではほぼ0か負。' },
    why: {
      en: 'A halogen is one electron short of a full shell, so it gains a lot of stability by taking one. A large electron affinity means the element easily becomes an **anion**.',
      ja: 'ハロゲンは閉殻まで電子1個足りないので、受け取ると大きく安定化する。電子親和力が大きいほど**陰イオンになりやすい**。',
    },
    examples: {
      en: ['Cl > F > Br > I among the halogens.', 'Na and K have small positive values; Be, Mg, N, Ne ≈ 0 or negative.'],
      ja: ['ハロゲンでは Cl > F > Br > I。', 'Na・K は小さな正の値。Be・Mg・N・Ne はほぼ0か負。'],
    },
    exceptions: {
      en: ['**Cl > F**, not F > Cl: fluorine is so small that the incoming electron is repelled by the crowded 2p shell.', 'Do not confuse with electronegativity: F is the most electronegative, but Cl has the largest electron affinity.'],
      ja: ['**Cl > F**（F > Cl ではない）：F は小さすぎて混み合った 2p 殻が入ってくる電子を反発する。', '電気陰性度と混同しない：電気陰性度は F が最大だが、電子親和力は Cl が最大。'],
    },
  },
  {
    id: 'en',
    title: { en: 'Electronegativity (pull on shared electrons)', ja: '電気陰性度（共有電子対を引き寄せる強さ）' },
    rule: { en: 'Increases across a period → and decreases down a group ↓. F is the highest (4.0); Cs/Fr the lowest (~0.7).', ja: '周期を右へ行くほど大きく、族を下へ行くほど小さい。F が最大（4.0）、Cs・Fr が最小（約0.7）。' },
    why: {
      en: 'Same reasons as ionisation energy: small atoms with high nuclear charge grab electrons. The difference in electronegativity decides whether a bond is **ionic** (large), **polar covalent** (medium) or **nonpolar** (zero).',
      ja: 'イオン化エネルギーと同じ理由：小さくて陽子の多い原子ほど電子を引きつける。電気陰性度の差で結合が**イオン結合**（大）、**極性のある共有結合**（中）、**無極性**（0）に分かれる。',
    },
    across: 'up',
    down: 'down',
    colorMode: 'en',
    examples: {
      en: ['F 4.0 > O 3.4 > N 3.0 ≈ Cl 3.2 > C 2.6 > H 2.2.', 'Polarity: H–F > H–Cl > H–Br > H–I; C–H is almost nonpolar.'],
      ja: ['F 4.0 > O 3.4 > N 3.0 ≈ Cl 3.2 > C 2.6 > H 2.2。', '極性：H–F > H–Cl > H–Br > H–I。C–H はほぼ無極性。'],
    },
    exceptions: {
      en: ['Noble gases are usually given **no value** at high-school level (they hardly bond).', 'Hydrogen (2.2) sits between metals and nonmetals — it is not a low-electronegativity alkali metal.', 'A molecule with polar bonds can still be **nonpolar overall** if it is symmetric: CO₂, CH₄, CCl₄. H₂O and NH₃ are polar.'],
      ja: ['貴ガスは高校範囲では**値なし**（ほとんど結合しない）。', '水素（2.2）は金属と非金属の中間。電気陰性度の小さいアルカリ金属ではない。', '極性のある結合をもつ分子でも、対称なら**分子全体は無極性**：CO₂・CH₄・CCl₄。H₂O・NH₃ は極性分子。'],
    },
  },
  {
    id: 'metal',
    title: { en: 'Metallic vs nonmetallic character', ja: '金属性と非金属性' },
    rule: { en: 'Metallic character increases ← left and ↓ down; nonmetallic character increases → right and ↑ up. Metalloids sit on the staircase (B, Si, Ge, As, Sb, Te).', ja: '金属性は左・下ほど強く、非金属性は右・上ほど強い。半金属は階段線上（B・Si・Ge・As・Sb・Te）。' },
    why: {
      en: 'Metals lose electrons easily (low ionisation energy) → form cations and basic oxides. Nonmetals gain electrons → anions and acidic oxides. About 80% of elements are metals.',
      ja: '金属は電子を失いやすく（イオン化エネルギー小）→ 陽イオン・塩基性酸化物。非金属は電子を得やすい → 陰イオン・酸性酸化物。元素の約8割は金属。',
    },
    across: 'down',
    down: 'up',
    colorMode: 'category',
    examples: {
      en: ['Period 3 oxides: Na₂O, MgO (basic) → Al₂O₃ (amphoteric) → SiO₂, P₄O₁₀, SO₃, Cl₂O₇ (acidic).', 'Group 14: C (nonmetal) → Si, Ge (metalloids) → Sn, Pb (metals).'],
      ja: ['第3周期の酸化物：Na₂O・MgO（塩基性）→ Al₂O₃（両性）→ SiO₂・P₄O₁₀・SO₃・Cl₂O₇（酸性）。', '14族：C（非金属）→ Si・Ge（半金属）→ Sn・Pb（金属）。'],
    },
    exceptions: {
      en: ['**Amphoteric** elements react with both acids and strong bases: **Al, Zn, Sn, Pb** (mnemonic “ah-ah-su-n”). Their oxides and hydroxides are amphoteric too.', 'Hydrogen is a nonmetal in group 1. Graphite is a nonmetal that **conducts electricity**.', 'In the Japanese curriculum, **transition elements are groups 3–11**; group 12 (Zn, Cd, Hg) counts as typical elements.'],
      ja: ['**両性元素**は酸にも強塩基にも反応する：**Al・Zn・Sn・Pb**（あ・あ・す・ん）。酸化物・水酸化物も両性。', '水素は1族だが非金属。黒鉛は非金属なのに**電気を通す**。', '日本の課程では**遷移元素は3〜11族**。12族（Zn・Cd・Hg）は典型元素。'],
    },
  },
  {
    id: 'valence',
    title: { en: 'Valence electrons and ions', ja: '価電子とイオン' },
    rule: { en: 'Main-group elements in the same group have the same number of valence electrons → same typical ion and similar chemistry. Group 1 → +1, 2 → +2, 13 → +3, 16 → −2, 17 → −1, 18 → 0.', ja: '同じ族の典型元素は価電子の数が同じ → 同じ価数のイオン、似た性質。1族 → +1、2族 → +2、13族 → +3、16族 → −2、17族 → −1、18族 → 0。' },
    why: {
      en: 'Atoms gain or lose electrons to reach the nearest noble-gas configuration. Na⁺, Mg²⁺, Al³⁺, F⁻, O²⁻ all end up with neon’s 10 electrons.',
      ja: '原子は最も近い貴ガスの電子配置になるように電子をやりとりする。Na⁺・Mg²⁺・Al³⁺・F⁻・O²⁻ はいずれもネオンと同じ電子10個。',
    },
    examples: {
      en: ['Shell filling: K 2, L 8, M 18, N 32 (2n²) — but the outermost shell never holds more than 8 in period 4 or below (K: K2 L8 M8 N1, not M9).', 'Ar (18) has K2 L8 M8; K (19) starts the N shell.'],
      ja: ['電子殻の定員：K 2、L 8、M 18、N 32（2n²）— ただし最外殻は8個まで（K：K2 L8 M8 N1、M9 ではない）。', 'Ar（18）は K2 L8 M8。K（19）から N 殻に入る。'],
    },
    exceptions: {
      en: ['Noble gases have 8 outer electrons (He has 2) but their **valence-electron count is defined as 0**.', 'Transition elements: usually **2 valence electrons** (4s²) regardless of group, hence similar properties **across** a row and several oxidation states (Fe²⁺/Fe³⁺, Cu⁺/Cu²⁺). Their ions are often **coloured** — but Zn²⁺, Ag⁺ are colourless.', 'Electron-configuration surprises: **Cr [Ar]3d⁵4s¹, Cu [Ar]3d¹⁰4s¹** (half-full/full d is stable).'],
      ja: ['貴ガスの最外殻電子は8個（He は2個）だが**価電子は0と定義**する。', '遷移元素：族に関係なくふつう**価電子2個**（4s²）なので、**横に並んだ元素どうし**の性質が似ていて、酸化数も複数（Fe²⁺/Fe³⁺、Cu⁺/Cu²⁺）。イオンは**有色**が多いが Zn²⁺・Ag⁺ は無色。', '電子配置の例外：**Cr [Ar]3d⁵4s¹、Cu [Ar]3d¹⁰4s¹**（d 軌道の半閉殻・閉殻が安定）。'],
    },
  },
  {
    id: 'mp',
    title: { en: 'Melting / boiling points and state', ja: '融点・沸点と状態' },
    rule: { en: 'Depends on bond type, not position alone: covalent networks (C, Si) highest → metals → ionic → molecular substances lowest.', ja: '位置だけでなく結合の種類で決まる：共有結合の結晶（C・Si）が最高 → 金属 → イオン結晶 → 分子結晶が最低。' },
    why: {
      en: 'Molecular substances are held only by weak intermolecular forces, which grow with molecular mass (more electrons → stronger dispersion forces).',
      ja: '分子からなる物質は弱い分子間力だけで集まっており、その力は分子量とともに大きくなる（電子が多いほど分散力が強い）。',
    },
    colorMode: 'state',
    examples: {
      en: ['Halogens: F₂ gas, Cl₂ gas, **Br₂ liquid**, I₂ solid — b.p. rises down the group.', 'Noble gases: He < Ne < Ar < Kr < Xe in b.p.', 'Alkali metals: m.p. **falls** down the group (Li 181 °C → Cs 28 °C) because the metallic bond weakens as atoms get bigger.'],
      ja: ['ハロゲン：F₂ 気体、Cl₂ 気体、**Br₂ 液体**、I₂ 固体 — 沸点は下ほど高い。', '貴ガス：沸点は He < Ne < Ar < Kr < Xe。', 'アルカリ金属：融点は下ほど**低い**（Li 181 ℃ → Cs 28 ℃）。原子が大きくなると金属結合が弱まるため。'],
    },
    exceptions: {
      en: ['**H₂O, HF, NH₃** boil far higher than their group trend predicts — hydrogen bonds. (H₂S, HCl, PH₃ follow the normal trend.)', 'Only two elements are **liquid at 25 °C: Br₂ and Hg**. Gases: H₂, N₂, O₂, F₂, Cl₂ and the noble gases.', 'Diatomic elements: H₂, N₂, O₂, F₂, Cl₂, Br₂, I₂ — everything else is written as a single atom (Na, Fe, C, S…).'],
      ja: ['**H₂O・HF・NH₃** は族の傾向より沸点がずっと高い — 水素結合。（H₂S・HCl・PH₃ はふつうの傾向。）', '25 ℃で**液体の単体は Br₂ と Hg** の2つだけ。気体：H₂・N₂・O₂・F₂・Cl₂ と貴ガス。', '二原子分子：H₂・N₂・O₂・F₂・Cl₂・Br₂・I₂。他は原子1個の記号で表す（Na・Fe・C・S…）。'],
    },
  },
  {
    id: 'reactivity',
    title: { en: 'Reactivity of metals and halogens', ja: '金属・ハロゲンの反応性' },
    rule: { en: 'Alkali metals get **more** reactive down the group (Cs most); halogens get **less** reactive down the group (F₂ most).', ja: 'アルカリ金属は下ほど**反応性が高い**（Cs 最大）。ハロゲンは下ほど**反応性が低い**（F₂ 最大）。' },
    why: {
      en: 'Metals react by losing electrons (easier when ionisation energy is low, i.e. lower down). Halogens react by gaining electrons (easier when the atom is small, i.e. higher up).',
      ja: '金属は電子を失って反応する（イオン化エネルギーが小さい下ほど容易）。ハロゲンは電子を得て反応する（原子が小さい上ほど容易）。',
    },
    examples: {
      en: ['Ionisation tendency (metals): Li > K > Ca > Na > Mg > Al > Zn > Fe > Ni > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au.', 'Cl₂ + 2KBr → 2KCl + Br₂ (a halogen displaces any halogen **below** it).'],
      ja: ['イオン化傾向：Li > K > Ca > Na > Mg > Al > Zn > Fe > Ni > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au。', 'Cl₂ + 2KBr → 2KCl + Br₂（ハロゲンは自分より**下の**ハロゲンを追い出す）。'],
    },
    exceptions: {
      en: ['The ionisation series is **not** the periodic-table order: Li comes first (very negative electrode potential), Ca is above Na, Pb is above H.', '**Pb** is above H yet barely reacts with HCl / H₂SO₄ (insoluble coating). **Al, Fe, Ni** are passivated by conc. HNO₃. **Cu, Hg, Ag** dissolve only in oxidising acids; **Pt, Au** only in aqua regia.', 'Group 2: Be and Mg do not react with cold water; Ca, Sr, Ba do.'],
      ja: ['イオン化傾向の順は周期表の順と**同じではない**：Li が先頭（電極電位が非常に低い）、Ca は Na より上、Pb は H より上。', '**Pb** は H より上なのに塩酸・硫酸とほとんど反応しない（不溶性の被膜）。**Al・Fe・Ni** は濃硝酸で不動態。**Cu・Hg・Ag** は酸化力のある酸のみ、**Pt・Au** は王水のみに溶ける。', '2族：Be・Mg は冷水と反応しないが、Ca・Sr・Ba は反応する。'],
    },
  },
  {
    id: 'acid',
    title: { en: 'Acid–base strength across the table', ja: '周期表と酸・塩基の強さ' },
    rule: { en: 'Oxides: basic on the left, acidic on the right, amphoteric in between. Hydrides HX: acidity increases down group 17. Oxoacids: more oxygen → stronger.', ja: '酸化物：左は塩基性、右は酸性、その間は両性。ハロゲン化水素 HX：17族を下がるほど強い酸。オキソ酸：酸素が多いほど強い。' },
    why: {
      en: 'Down a group the H–X bond gets longer and weaker, so H⁺ leaves more easily. More oxygen atoms pull electron density away from the O–H bond, releasing H⁺.',
      ja: '族を下がると H–X 結合が長く弱くなり、H⁺ が外れやすい。酸素が多いほど O–H 結合の電子が引かれ、H⁺ が放出されやすい。',
    },
    examples: {
      en: ['HF ≪ HCl < HBr < HI.', 'HClO < HClO₂ < HClO₃ < HClO₄; H₂SO₃ < H₂SO₄; HNO₂ < HNO₃.', 'Strong acids to memorise: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄. Strong bases: NaOH, KOH, Ca(OH)₂, Ba(OH)₂.'],
      ja: ['HF ≪ HCl < HBr < HI。', 'HClO < HClO₂ < HClO₃ < HClO₄、H₂SO₃ < H₂SO₄、HNO₂ < HNO₃。', '覚える強酸：HCl・HBr・HI・HNO₃・H₂SO₄・HClO₄。強塩基：NaOH・KOH・Ca(OH)₂・Ba(OH)₂。'],
    },
    exceptions: {
      en: ['**HF is a weak acid** even though F is the most electronegative — the H–F bond is very strong and HF molecules hydrogen-bond.', '**H₃PO₄** is only a medium-strength acid despite having oxygen; H₂CO₃ and H₂S are weak.', '**NH₃** is a weak base; Mg(OH)₂ is a strong-but-poorly-soluble base; Al(OH)₃ and Zn(OH)₂ are amphoteric.'],
      ja: ['**HF は弱酸**（F の電気陰性度は最大なのに）— H–F 結合が非常に強く、HF 分子どうしが水素結合するため。', '**H₃PO₄** は酸素をもつが中程度の酸。H₂CO₃・H₂S は弱酸。', '**NH₃** は弱塩基。Mg(OH)₂ は強塩基だが溶けにくい。Al(OH)₃・Zn(OH)₂ は両性。'],
    },
  },
];

export interface Trap {
  title: Bilingual;
  body: Bilingual;
}

/** Quick-fire facts that are asked again and again. */
export const TRAPS: Trap[] = [
  {
    title: { en: 'Flame-test colours', ja: '炎色反応の色' },
    body: {
      en: 'Li **red**, Na **yellow**, K **purple**, Cu **blue-green**, Ca **orange-red**, Sr **crimson**, Ba **yellow-green**. Mg, Be, Al, Fe: none. Japanese mnemonic: リアカー無きK村、動力借りようとするもくれない馬力 (Li赤 Na黄 K紫 Cu緑 Ca橙 Sr紅 Ba緑).',
      ja: 'Li **赤**、Na **黄**、K **赤紫**、Cu **青緑**、Ca **橙赤**、Sr **紅**、Ba **黄緑**。Mg・Be・Al・Fe は示さない。語呂：リアカー無きK村、動力借りようとするもくれない馬力（Li赤 Na黄 K紫 Cu緑 Ca橙 Sr紅 Ba緑）。',
    },
  },
  {
    title: { en: 'Ionisation tendency', ja: 'イオン化傾向' },
    body: {
      en: 'Li K Ca Na Mg Al Zn Fe Ni Sn Pb (H) Cu Hg Ag Pt Au. Japanese mnemonic: リッチに貸そうかな、まあ当てにすんな、ひどすぎる借金. Left of H: releases H₂ from acids. K–Na: react with cold water; Mg: hot water; Al–Fe: steam only.',
      ja: 'Li K Ca Na Mg Al Zn Fe Ni Sn Pb (H) Cu Hg Ag Pt Au。語呂：リッチに貸そうかな、まあ当てにすんな、ひどすぎる借金。H より左：酸から H₂ を発生。K〜Na：冷水と反応、Mg：熱水、Al〜Fe：高温の水蒸気のみ。',
    },
  },
  {
    title: { en: 'Amphoteric elements', ja: '両性元素' },
    body: {
      en: '**Al, Zn, Sn, Pb** react with both acids and strong bases (NaOH) to give H₂; their oxides and hydroxides dissolve in both. Al(OH)₃ does **not** dissolve in excess NH₃; Zn(OH)₂ **does** ([Zn(NH₃)₄]²⁺).',
      ja: '**Al・Zn・Sn・Pb** は酸にも強塩基（NaOH）にも反応して H₂ を発生。酸化物・水酸化物もどちらにも溶ける。Al(OH)₃ は過剰の NH₃ に**溶けない**が、Zn(OH)₂ は**溶ける**（[Zn(NH₃)₄]²⁺）。',
    },
  },
  {
    title: { en: 'Passivation (不動態)', ja: '不動態' },
    body: {
      en: '**Fe, Ni, Al** (also Cr, Co) form a dense oxide film in **conc. HNO₃** and stop reacting, even though they are above H in the series. Dilute HNO₃ still dissolves them.',
      ja: '**Fe・Ni・Al**（Cr・Co も）は**濃硝酸**中で緻密な酸化被膜をつくり反応が止まる（イオン化傾向は H より大きいのに）。希硝酸には溶ける。',
    },
  },
  {
    title: { en: 'Coloured precipitates', ja: '沈殿の色' },
    body: {
      en: 'AgCl white, AgBr pale yellow, AgI yellow; BaSO₄, PbSO₄, CaCO₃, BaCO₃ white; Cu(OH)₂ blue; Fe(OH)₃ red-brown; Fe(OH)₂ green-white; Ag₂O brown; CuO, Ag₂S, CuS, PbS black; ZnS white; CdS yellow; MnS pale pink; PbCrO₄, BaCrO₄ yellow; Ag₂CrO₄ red-brown; Cu₂O red; MnO₂ brown-black.',
      ja: 'AgCl 白、AgBr 淡黄、AgI 黄；BaSO₄・PbSO₄・CaCO₃・BaCO₃ 白；Cu(OH)₂ 青白；Fe(OH)₃ 赤褐；Fe(OH)₂ 緑白；Ag₂O 褐；CuO・Ag₂S・CuS・PbS 黒；ZnS 白；CdS 黄；MnS 淡赤；PbCrO₄・BaCrO₄ 黄；Ag₂CrO₄ 赤褐；Cu₂O 赤；MnO₂ 黒褐。',
    },
  },
  {
    title: { en: 'Coloured ions in solution', ja: '水溶液中のイオンの色' },
    body: {
      en: 'Cu²⁺ blue, [Cu(NH₃)₄]²⁺ deep blue, Fe²⁺ pale green, Fe³⁺ yellow-brown, Ni²⁺ green, Cr³⁺ green, CrO₄²⁻ yellow, Cr₂O₇²⁻ orange, MnO₄⁻ purple, Mn²⁺ pale pink, Co²⁺ pink. Colourless: Zn²⁺, Ag⁺, Al³⁺, Pb²⁺, Ca²⁺, Na⁺, K⁺, Mg²⁺.',
      ja: 'Cu²⁺ 青、[Cu(NH₃)₄]²⁺ 深青、Fe²⁺ 淡緑、Fe³⁺ 黄褐、Ni²⁺ 緑、Cr³⁺ 緑、CrO₄²⁻ 黄、Cr₂O₇²⁻ 橙赤、MnO₄⁻ 赤紫、Mn²⁺ 淡赤、Co²⁺ 桃。無色：Zn²⁺・Ag⁺・Al³⁺・Pb²⁺・Ca²⁺・Na⁺・K⁺・Mg²⁺。',
    },
  },
  {
    title: { en: 'Atomic number vs atomic mass', ja: '原子番号と原子量' },
    body: {
      en: 'The table is ordered by **atomic number** (protons). Two places the mass order is “wrong”: Ar (39.95) before K (39.10), Co (58.93) before Ni (58.69), Te (127.6) before I (126.9). Atomic mass is a weighted average of isotopes (Cl 35.5), not a mass number.',
      ja: '周期表は**原子番号**（陽子数）順。原子量の順が「逆転」する所：Ar（39.95）→ K（39.10）、Co（58.93）→ Ni（58.69）、Te（127.6）→ I（126.9）。原子量は同位体の平均（Cl 35.5）であり質量数ではない。',
    },
  },
  {
    title: { en: 'Typical vs transition elements (Japanese curriculum)', ja: '典型元素と遷移元素（日本の課程）' },
    body: {
      en: 'Typical elements: groups **1, 2, 12–18** — properties change across a period, similar down a group. Transition elements: groups **3–11** — similar across a period, mostly metals, several oxidation states, coloured ions, good catalysts, and their valence electrons are usually 1–2.',
      ja: '典型元素：**1・2・12〜18族** — 周期方向に性質が変化し、族方向で似る。遷移元素：**3〜11族** — 周期方向に似た性質、すべて金属、複数の酸化数、有色イオン、触媒になりやすく、価電子はふつう1〜2個。',
    },
  },
];
