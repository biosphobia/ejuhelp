import type { SubjectNotes, Note } from './types';
import { TREES } from './index';

// Bodies use String.raw so LaTeX backslashes survive. Never put ` or ${ inside.
const r = String.raw;

const N: Note[] = [
  // ───────────────────────────── STRUCTURE OF MATTER ─────────────────────────────
  {
    id: 'pure-mixtures',
    core: {
      en: 'A pure substance has one fixed composition (element or compound); a mixture is two or more substances that keep their own properties, so you can pull them apart with physical methods chosen by the property that differs: boiling point, solubility, particle size, or affinity for a surface.',
      ja: '純物質は組成が1つに決まったもの（単体か化合物）。混合物は2種以上の物質がそれぞれの性質を保ったまま混ざったもの。だから「違っている性質」— 沸点、溶解度、粒子の大きさ、表面への吸着 — を使った物理的方法で分けられる。',
    },
    body: {
      en: r`## Classifying matter
| | one kind of particle? | examples |
|---|---|---|
| **element (simple substance)** | yes, one element | O₂, Fe, S₈ |
| **compound** | yes, ≥2 elements bonded | H₂O, NaCl |
| **mixture** | no | air, sea water, brass |

Pure substances have a sharp melting/boiling point; mixtures melt or boil over a range. "Element" (元素) is the *kind* of atom; "simple substance" (単体) is the *material* made of one element — a question may test the difference ("water contains the element hydrogen, not the simple substance H₂").

## Allotropes (同素体)
Same element, different structure and properties. **SCOP**: **S** (rhombic, monoclinic, plastic), **C** (diamond, graphite, fullerene, nanotube, graphene), **O** (O₂, O₃), **P** (white/yellow, red). Isotopes are a different idea (same element, different neutrons).

## Separation methods — match the property
| method | separates | property used |
|---|---|---|
| filtration | solid from liquid | particle size |
| distillation | liquid from dissolved solid, or liquids (fractional) | boiling point |
| recrystallisation | pure crystals from a solution with impurities | solubility changes with temperature |
| extraction | a solute into a solvent it prefers | solubility difference |
| chromatography | dissolved substances | speed of movement on paper/silica |
| sublimation | I₂, naphthalene, dry ice from non-subliming solids | solid → gas directly |
| decantation / separating funnel | immiscible liquids | density |

Distillation apparatus: thermometer bulb at the **side arm** (reads the vapour temperature); condenser water in at the **bottom**, out at the top; boiling chips; do not seal the receiver.

## Detecting elements
- **Flame test**: Li red, Na yellow, K purple, Ca orange-red, Sr crimson, Ba yellow-green, Cu blue-green.
- **Precipitation**: Cl⁻ → AgCl white with AgNO₃; SO₄²⁻ → BaSO₄ white; Ca²⁺/CO₂ → CaCO₃ turns lime water milky.
- Organic compounds: burn → CO₂ (lime water) and H₂O (blue CoCl₂ paper turns pink / white CuSO₄ turns blue).

## Three states
Solid (fixed shape), liquid (fixed volume), gas (neither). Names of changes: melting/freezing, vaporisation/condensation, **sublimation** (solid ⇌ gas: dry ice, iodine, naphthalene). Heating a solid: temperature rises, stays flat at the melting point, rises again.`,
      ja: r`## 物質の分類
| | 粒子は1種類？ | 例 |
|---|---|---|
| **単体** | はい、1種の元素 | O₂、Fe、S₈ |
| **化合物** | はい、2種以上の元素が結合 | H₂O、NaCl |
| **混合物** | いいえ | 空気、海水、黄銅 |

純物質は融点・沸点が一定。混合物はある範囲で融解・沸騰する。「元素」は原子の*種類*、「単体」は1種の元素からできた*物質* — この違いが問われる（「水は元素としての水素を含むが、単体 H₂ は含まない」）。

## 同素体
同じ元素で構造も性質も異なるもの。**SCOP**：**S**（斜方、単斜、ゴム状）、**C**（ダイヤモンド、黒鉛、フラーレン、ナノチューブ、グラフェン）、**O**（O₂、O₃）、**P**（黄リン、赤リン）。同位体は別の概念（同じ元素で中性子数が違う）。

## 分離の方法 — 性質と対応させる
| 方法 | 分けるもの | 利用する性質 |
|---|---|---|
| ろ過 | 液体中の固体 | 粒子の大きさ |
| 蒸留 | 溶けた固体と液体、液体どうし（分留） | 沸点 |
| 再結晶 | 不純物を含む溶液から純粋な結晶 | 溶解度の温度変化 |
| 抽出 | 溶質をよく溶ける溶媒へ | 溶解度の差 |
| クロマトグラフィー | 溶けた物質 | 紙・シリカ上の移動速度 |
| 昇華 | I₂、ナフタレン、ドライアイスと昇華しない固体 | 固体 → 気体 |
| 分液 | 混ざらない液体 | 密度 |

蒸留装置：温度計の球部は**枝の位置**（蒸気の温度を測る）。冷却水は**下から入れて**上から出す。沸騰石を入れる。受け器は密閉しない。

## 元素の検出
- **炎色反応**：Li 赤、Na 黄、K 赤紫、Ca 橙赤、Sr 紅、Ba 黄緑、Cu 青緑。
- **沈殿**：Cl⁻ → AgNO₃ で AgCl 白；SO₄²⁻ → BaSO₄ 白；Ca²⁺/CO₂ → CaCO₃ で石灰水が白濁。
- 有機化合物：燃やす → CO₂（石灰水）と H₂O（青い塩化コバルト紙が赤に／白い CuSO₄ が青に）。

## 三態
固体（形が一定）、液体（体積が一定）、気体（どちらも不定）。変化の名前：融解／凝固、蒸発／凝縮、**昇華**（固体 ⇌ 気体：ドライアイス、ヨウ素、ナフタレン）。固体を加熱：温度上昇、融点で一定、再び上昇。`,
    },
    exam: {
      en: ['Which pair is a set of allotropes / which is a mixture / which is a compound (choose from a list).', 'Match each separation (filtration, distillation, recrystallisation, extraction, chromatography, sublimation) to the mixture it suits.', 'Distillation apparatus: which labelled part is wrong (thermometer position, water flow).'],
      ja: ['同素体の組・混合物・化合物はどれか（選択肢から）。', '各分離法（ろ過・蒸留・再結晶・抽出・クロマトグラフィー・昇華）と適した混合物の対応。', '蒸留装置の図：誤っている部分（温度計の位置、冷却水の向き）。'],
    },
    traps: {
      en: ['Ozone and oxygen are allotropes; ¹²C and ¹⁴C are **isotopes** — not allotropes.', 'Air is a mixture even though it looks uniform; brass and stainless steel are mixtures (alloys).', 'Recrystallisation works because the **impurity stays dissolved** in the small amount of cooled solvent.'],
      ja: ['オゾンと酸素は同素体。¹²C と ¹⁴C は**同位体** — 同素体ではない。', '空気は均一に見えても混合物。黄銅やステンレスも混合物（合金）。', '再結晶が使えるのは、冷やした少量の溶媒に**不純物が溶けたまま残る**から。'],
    },
    followups: {
      en: ['Explain the difference between element and simple substance with examples.', 'Why does recrystallisation purify a substance?', 'How do I recognise a mixture from a heating curve?', 'Quiz me on the flame-test colours.'],
      ja: ['元素と単体の違いを例で説明して。', '再結晶で物質が純粋になるのはなぜ？', '加熱曲線から混合物をどう見分ける？', '炎色反応の色のミニテストを出して。'],
    },
  },
  {
    id: 'atomic-structure',
    core: {
      en: 'An atom is a tiny positive nucleus (protons + neutrons) surrounded by electrons. Protons define the element (atomic number Z); protons + neutrons give the mass number A; the number of electrons equals Z in a neutral atom and shifts by the ion charge. Isotopes are the same element with a different neutron count, and the atomic weight is their weighted average.',
      ja: '原子は小さな正の原子核（陽子＋中性子）と、そのまわりの電子。陽子数が元素を決め（原子番号 Z）、陽子＋中性子が質量数 A。電子数は中性原子なら Z、イオンでは電荷の分だけずれる。同位体は同じ元素で中性子数が違うもので、原子量はその存在比による平均。',
    },
    body: {
      en: r`## The particles
| particle | charge | mass (relative) | where |
|---|---|---|---|
| proton | $+1$ | 1 | nucleus |
| neutron | 0 | 1 (slightly more) | nucleus |
| electron | $-1$ | $\tfrac{1}{1840}$ | shells around the nucleus |

Atom diameter ≈ $10^{-10}$ m; nucleus ≈ $10^{-15}$ m — almost all the mass in almost none of the volume.

## Counting rules
Notation $^{A}_{Z}\mathrm{X}$, e.g. $^{35}_{17}\mathrm{Cl}$.
- protons $= Z$
- neutrons $= A - Z$
- electrons $= Z$ for a neutral atom; $Z - (\text{charge})$ for an ion: $^{35}\mathrm{Cl}^-$ has 18 electrons, $^{27}\mathrm{Al}^{3+}$ has 10.

## Isotopes
Same $Z$, different $A$ (different neutrons): $^{1}$H / $^{2}$H / $^{3}$H, $^{12}$C / $^{13}$C / $^{14}$C, $^{35}$Cl / $^{37}$Cl. Isotopes have (almost) identical **chemical** properties — same electron count — but different mass and, sometimes, radioactivity ($^{14}$C dating, $^{3}$H).

## Atomic weight (relative atomic mass)
Scale: $^{12}$C = 12 exactly. Atomic weight = weighted average of the isotopes:
$$\mathrm{Cl}: 35 \times 0.75 + 37 \times 0.25 = 35.5$$
Cu 63.5 (⁶³Cu 69%, ⁶⁵Cu 31%). Because it is an average, the atomic weight is rarely an integer — a "mass number" always is.

## Electron shells (preview)
Electrons fill shells K (2), L (8), M (18), N (32) — capacity $2n^2$ — from the inside. For the EJU the outermost-shell count is what matters (see the next topic).

## History you may be asked
Thomson (electron), Rutherford (nucleus, from α-scattering), Bohr (shells), Chadwick (neutron). Mass spectrometry measures isotope masses and abundances.`,
      ja: r`## 構成粒子
| 粒子 | 電荷 | 質量（相対） | 場所 |
|---|---|---|---|
| 陽子 | $+1$ | 1 | 原子核 |
| 中性子 | 0 | 1（わずかに大きい） | 原子核 |
| 電子 | $-1$ | $\tfrac{1}{1840}$ | 原子核のまわりの電子殻 |

原子の直径 ≈ $10^{-10}$ m、原子核 ≈ $10^{-15}$ m — 質量のほぼ全部が体積のほぼ0に集まっている。

## 数え方のルール
表記 $^{A}_{Z}\mathrm{X}$、例 $^{35}_{17}\mathrm{Cl}$。
- 陽子数 $= Z$
- 中性子数 $= A - Z$
- 電子数：中性原子なら $= Z$。イオンなら $Z - (\text{電荷})$：$^{35}\mathrm{Cl}^-$ は 18 個、$^{27}\mathrm{Al}^{3+}$ は 10 個。

## 同位体
同じ $Z$、異なる $A$（中性子数が違う）：$^{1}$H / $^{2}$H / $^{3}$H、$^{12}$C / $^{13}$C / $^{14}$C、$^{35}$Cl / $^{37}$Cl。同位体の**化学的**性質は（ほぼ）同じ — 電子数が同じ — だが質量が違い、放射性のこともある（$^{14}$C 年代測定、$^{3}$H）。

## 原子量（相対原子質量）
基準：$^{12}$C = 12。原子量 = 同位体の存在比による平均：
$$\mathrm{Cl}: 35 \times 0.75 + 37 \times 0.25 = 35.5$$
Cu 63.5（⁶³Cu 69%、⁶⁵Cu 31%）。平均なので原子量はふつう整数にならない — 「質量数」は必ず整数。

## 電子殻（予告）
電子は内側から K（2）、L（8）、M（18）、N（32）— 定員 $2n^2$ — に入る。EJUで大事なのは最外殻の電子数（次のトピック）。

## 問われうる歴史
トムソン（電子）、ラザフォード（原子核、α線散乱）、ボーア（電子殻）、チャドウィック（中性子）。質量分析計で同位体の質量と存在比を測る。`,
    },
    exam: {
      en: ['Table of protons/neutrons/electrons for several atoms or ions: pick the wrong row (block on structure, most years).', 'Atomic weight from isotope abundances, or the abundance from the atomic weight.', 'Which pair are isotopes / which species are isoelectronic (same electron count).'],
      ja: ['いくつかの原子・イオンの陽子・中性子・電子の表：誤っている行を選ぶ（物質の構成、ほぼ毎年）。', '同位体の存在比から原子量、または原子量から存在比。', '同位体の組はどれか、電子数が同じ（等電子）の粒子はどれか。'],
    },
    traps: {
      en: ['Ions change the **electron** count, never the proton or neutron count.', 'Mass number is per isotope and is an integer; atomic weight is per element and is an average.', 'The nucleus does not change in chemical reactions — only electrons move.'],
      ja: ['イオンになって変わるのは**電子**の数だけ。陽子や中性子の数は変わらない。', '質量数は同位体ごとの整数。原子量は元素ごとの平均。', '化学反応で原子核は変わらない — 動くのは電子だけ。'],
    },
    followups: {
      en: ['Work out protons, neutrons and electrons for ⁵⁶Fe³⁺ and ³²S²⁻.', 'Why are isotopes chemically identical?', 'Show the atomic-weight calculation for copper.', 'Why is the mass of an atom almost entirely in the nucleus?'],
      ja: ['⁵⁶Fe³⁺ と ³²S²⁻ の陽子・中性子・電子の数を求めて。', '同位体の化学的性質が同じなのはなぜ？', '銅の原子量の計算を見せて。', '原子の質量がほぼ全部原子核にあるのはなぜ？'],
    },
  },
  {
    id: 'electron-config-periodic',
    core: {
      en: 'Chemistry is decided by the outermost electrons. Atoms in the same column have the same number of them, so they behave alike; going across a row adds protons and pulls the electrons in tighter. Every periodic trend — size, ionisation energy, electronegativity, metal/nonmetal — follows from those two facts.',
      ja: '化学的性質は最外殻電子で決まる。同じ縦の列の原子は最外殻電子の数が同じなので似た性質を示す。横に進むと陽子が増えて電子が強く引きつけられる。周期表の傾向 — 大きさ、イオン化エネルギー、電気陰性度、金属・非金属 — はすべてこの2つの事実から出てくる。',
    },
    body: {
      en: r`## Shell filling
Capacity $2n^2$: K 2, L 8, M 18, N 32. Fill from the inside — but the outermost shell never holds more than 8 in the elements you will meet:
| element | configuration | valence electrons |
|---|---|---|
| Na (11) | K2 L8 M1 | 1 |
| Cl (17) | K2 L8 M7 | 7 |
| Ar (18) | K2 L8 M8 | 0 (noble gas) |
| K (19) | K2 L8 M8 N1 | 1 (starts the N shell, M not yet full) |
| Ca (20) | K2 L8 M8 N2 | 2 |

**Valence electrons** = outermost electrons for groups 1, 2, 13–17; defined as **0** for noble gases (their shells are "closed"). Atoms react so as to reach the nearest noble-gas configuration.

## Reading the periodic table
- **Period** = number of shells in use. **Group** = for main-group elements, the valence-electron count (group 1 → 1, group 2 → 2, group 13 → 3 … group 17 → 7).
- **Typical (main-group) elements**: groups 1, 2, 12–18 — properties change across a period. **Transition elements**: groups 3–11 — all metals, similar across a period, valence electrons usually 1–2, coloured ions, many oxidation states.
- Metals left/bottom; nonmetals right/top; metalloids (B, Si, Ge, As, Sb, Te) along the staircase.

## Ions
Group 1 → $+1$, group 2 → $+2$, Al → $+3$, group 16 → $-2$, group 17 → $-1$. Na⁺, Mg²⁺, Al³⁺, F⁻, O²⁻, N³⁻ all have neon's 10 electrons (isoelectronic). Cation smaller than its atom; anion larger. Same electron count → more protons → smaller: O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺.

## Trends (memorise direction and the reason)
| property | across → | down ↓ | why |
|---|---|---|---|
| atomic radius | decreases | increases | more nuclear charge pulls in / new shell |
| **ionisation energy** (energy to remove one e⁻) | increases | decreases | smaller atom holds e⁻ tighter; **max at noble gases, min at alkali metals** |
| **electron affinity** (energy released on gaining e⁻) | largest for halogens | — | one electron short of a full shell; Cl > F |
| electronegativity | increases | decreases | F = 4.0 highest; noble gases not defined |
| metallic character | decreases | increases | low IE → gives up electrons easily |

Low ionisation energy = wants to be a **cation** (metal). High electron affinity = wants to be an **anion**.

## Exceptions the EJU likes
Small dips in ionisation energy: Be > B, N > O (and Mg > Al, P > S). Electron affinity Cl > F. Hydrogen is in group 1 but is a nonmetal. Second ionisation energy of an alkali metal is huge (it would break a closed shell).`,
      ja: r`## 電子殻への入り方
定員 $2n^2$：K 2、L 8、M 18、N 32。内側から入るが、高校で出る元素では最外殻は8個を超えない：
| 元素 | 電子配置 | 価電子 |
|---|---|---|
| Na (11) | K2 L8 M1 | 1 |
| Cl (17) | K2 L8 M7 | 7 |
| Ar (18) | K2 L8 M8 | 0（貴ガス） |
| K (19) | K2 L8 M8 N1 | 1（M が満員でないのに N に入る） |
| Ca (20) | K2 L8 M8 N2 | 2 |

**価電子** = 1・2・13〜17族では最外殻電子。貴ガスは**0**と定義（殻が「閉じている」）。原子は最も近い貴ガスの電子配置になるように反応する。

## 周期表の読み方
- **周期** = 使っている電子殻の数。**族** = 典型元素では価電子数（1族 → 1、2族 → 2、13族 → 3 … 17族 → 7）。
- **典型元素**：1・2・12〜18族 — 周期方向に性質が変わる。**遷移元素**：3〜11族 — すべて金属、周期方向に似た性質、価電子はふつう1〜2、有色イオン、多くの酸化数。
- 金属は左・下、非金属は右・上、半金属（B, Si, Ge, As, Sb, Te）は階段線上。

## イオン
1族 → $+1$、2族 → $+2$、Al → $+3$、16族 → $-2$、17族 → $-1$。Na⁺、Mg²⁺、Al³⁺、F⁻、O²⁻、N³⁻ はすべてネオンと同じ電子10個（等電子）。陽イオンは原子より小さく、陰イオンは大きい。同じ電子数なら陽子が多いほど小さい：O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺。

## 傾向（向きと理由を覚える）
| 性質 | 右へ → | 下へ ↓ | 理由 |
|---|---|---|---|
| 原子半径 | 小さく | 大きく | 陽子が増えて引き込む／新しい殻 |
| **イオン化エネルギー**（電子1個を取る） | 大きく | 小さく | 小さい原子ほど電子を強く保持。**貴ガスで最大、アルカリ金属で最小** |
| **電子親和力**（電子を得て放出） | ハロゲンで最大 | — | 閉殻まであと1個。Cl > F |
| 電気陰性度 | 大きく | 小さく | F = 4.0 が最大。貴ガスは定義なし |
| 金属性 | 弱く | 強く | IE が小さい → 電子を手放しやすい |

イオン化エネルギーが小さい = **陽イオン**になりたい（金属）。電子親和力が大きい = **陰イオン**になりたい。

## EJUが好む例外
イオン化エネルギーの小さなへこみ：Be > B、N > O（Mg > Al、P > S も）。電子親和力は Cl > F。水素は1族だが非金属。アルカリ金属の第2イオン化エネルギーは非常に大きい（閉殻を壊すから）。`,
    },
    exam: {
      en: ['Statements about shell occupancy / valence electrons of given atoms and ions: pick the wrong one; or pick the pair in the same group from configurations like K2 L8 M2 and K2 L2.', 'Graph of first ionisation energy vs atomic number: identify the peaks (noble gases) and valleys (alkali metals); or rank ionic radii of an isoelectronic set.', 'Which element is typical vs transition; which is a metalloid.'],
      ja: ['原子・イオンの電子殻の占有数や価電子についての記述：誤りを選ぶ。K2 L8 M2 と K2 L2 のような電子配置から同族の組を選ぶ。', '第一イオン化エネルギーと原子番号のグラフ：山（貴ガス）と谷（アルカリ金属）を読む。等電子のイオン半径の順。', '典型元素と遷移元素はどれか、半金属はどれか。'],
    },
    traps: {
      en: ['Potassium has K2 L8 **M8** N1, not M9 — the M shell pauses at 8 before the N shell starts.', 'Noble gases have 8 outer electrons (He has 2) but **0 valence electrons** by definition.', 'A large electron affinity means energy is **released**; do not confuse with ionisation energy (energy absorbed).'],
      ja: ['カリウムは K2 L8 **M8** N1 で M9 ではない — M 殻は8で一旦止まり N 殻に入る。', '貴ガスの最外殻電子は8個（He は2個）だが定義上**価電子は0**。', '電子親和力が大きい = エネルギーが**放出**される。イオン化エネルギー（吸収）と混同しない。'],
    },
    followups: {
      en: ['Why does potassium start the N shell before the M shell is full?', 'Explain why ionisation energy dips at B and O.', 'Rank Na⁺, Mg²⁺, F⁻, O²⁻ by size and explain.', 'Give me a quick quiz on valence electrons and ion charges.'],
      ja: ['M 殻が満員になる前にカリウムが N 殻に入るのはなぜ？', 'イオン化エネルギーが B と O でへこむ理由を説明して。', 'Na⁺、Mg²⁺、F⁻、O²⁻ を大きさの順に並べて説明して。', '価電子とイオンの電荷のミニテストを出して。'],
    },
  },
  {
    id: 'chemical-bonds',
    core: {
      en: 'Atoms bond by moving electrons: metal + nonmetal transfer them (ionic), nonmetal + nonmetal share them (covalent), metals pool them (metallic). The bond type fixes the crystal type, and the crystal type fixes the properties — melting point, conductivity, hardness, solubility. Learn the four crystal types as a table and most bonding questions become lookups.',
      ja: '原子は電子のやりとりで結合する：金属＋非金属は電子を渡す（イオン結合）、非金属どうしは共有する（共有結合）、金属どうしは電子を出し合って共有する（金属結合）。結合の種類が結晶の種類を決め、結晶の種類が性質 — 融点、電気伝導性、硬さ、溶解性 — を決める。4種の結晶を表で覚えれば、結合の問題の大半は表引きになる。',
    },
    body: {
      en: r`## Three bonds
- **Ionic**: metal gives electrons to nonmetal → cation + anion held by electrostatic attraction (NaCl, CaO, NH₄Cl — the ammonium ion counts as the cation).
- **Covalent**: two nonmetals share electron pairs (H₂, H₂O, CO₂, SiO₂). A **coordinate (dative) bond** is a covalent bond in which one atom supplies both electrons: NH₄⁺ (N lone pair → H⁺), H₃O⁺, [Cu(NH₃)₄]²⁺ — once formed it is indistinguishable from the other bonds.
- **Metallic**: metal cations in a sea of **free electrons** → conduct electricity and heat, malleable/ductile, lustrous.

## Electron-dot (Lewis) structures
Count valence electrons, pair them to give each atom 8 (H gets 2). Shared pairs = bonds, unshared = **lone pairs**. Counting questions: H₂O has 2 shared + 2 lone pairs; NH₃ 3 + 1; CH₄ 4 + 0; CO₂ 4 shared (two double bonds) + 4 lone; N₂ 3 shared (triple) + 2 lone.

## Shapes and polarity
| molecule | shape | polar? |
|---|---|---|
| H₂O | bent (104.5°) | yes |
| NH₃ | trigonal pyramid | yes |
| CH₄ | tetrahedral | no (symmetric) |
| CO₂ | linear | no (bond dipoles cancel) |
| C₂H₄ | planar | no |
| HCl | linear | yes |

Polar bond = electronegativity difference; polar **molecule** = polar bonds that do not cancel. Symmetric molecules (CH₄, CO₂, CCl₄, C₂H₄, benzene) are nonpolar even with polar bonds.

## Intermolecular forces (between molecules)
Van der Waals (dispersion) forces — weak, grow with molecular mass (Cl₂ gas, Br₂ liquid, I₂ solid). **Hydrogen bonds** — H bonded to N, O or F attracted to a lone pair on another N/O/F: H₂O, NH₃, HF have abnormally high boiling points; ice floats.

## The four crystal types (the table to know)
| crystal | particles held by | examples | m.p. | conducts? | hardness |
|---|---|---|---|---|---|
| ionic | ionic bonds | NaCl, CaCO₃, CuSO₄ | high | **no as solid, yes molten or dissolved** | hard, brittle |
| covalent (network) | covalent bonds throughout | diamond, Si, SiO₂, SiC | very high | no (graphite yes) | very hard |
| metallic | metallic bonds | Fe, Cu, Na | varies (Hg liquid, W 3400 °C) | yes, solid and liquid | malleable |
| molecular | intermolecular forces | I₂, dry ice, sucrose, ice | low, often sublime | no | soft |

Graphite: covalent layers, one free electron per atom → conducts, soft (layers slide). Diamond: no free electrons, hardest.`,
      ja: r`## 3つの結合
- **イオン結合**：金属が非金属に電子を渡す → 陽イオンと陰イオンが静電気力で結びつく（NaCl、CaO、NH₄Cl — アンモニウムイオンは陽イオン扱い）。
- **共有結合**：非金属どうしが電子対を共有（H₂、H₂O、CO₂、SiO₂）。**配位結合**は一方の原子が電子対を両方出す共有結合：NH₄⁺（N の非共有電子対 → H⁺）、H₃O⁺、[Cu(NH₃)₄]²⁺ — できてしまえば他の結合と区別できない。
- **金属結合**：金属の陽イオンが**自由電子**の海に浸かる → 電気・熱を通し、展性・延性、金属光沢。

## 電子式（ルイス構造）
価電子を数え、各原子が8個（H は2個）になるよう対にする。共有電子対 = 結合、非共有電子対 = **孤立電子対**。数え方の問題：H₂O は共有2＋非共有2、NH₃ 3＋1、CH₄ 4＋0、CO₂ 共有4（二重結合2本）＋非共有4、N₂ 共有3（三重）＋非共有2。

## 形と極性
| 分子 | 形 | 極性？ |
|---|---|---|
| H₂O | 折れ線（104.5°） | あり |
| NH₃ | 三角錐 | あり |
| CH₄ | 正四面体 | なし（対称） |
| CO₂ | 直線 | なし（結合の極性が打ち消す） |
| C₂H₄ | 平面 | なし |
| HCl | 直線 | あり |

極性のある結合 = 電気陰性度の差。極性**分子** = 極性結合が打ち消し合わない。対称な分子（CH₄、CO₂、CCl₄、C₂H₄、ベンゼン）は極性結合があっても無極性。

## 分子間力（分子どうし）
ファンデルワールス力（分散力）— 弱く、分子量とともに大きくなる（Cl₂ 気体、Br₂ 液体、I₂ 固体）。**水素結合** — N・O・F についた H が別の N/O/F の孤立電子対に引かれる：H₂O、NH₃、HF は沸点が異常に高い。氷は浮く。

## 4種の結晶（覚える表）
| 結晶 | 粒子をつなぐもの | 例 | 融点 | 電気伝導 | 硬さ |
|---|---|---|---|---|---|
| イオン結晶 | イオン結合 | NaCl、CaCO₃、CuSO₄ | 高い | **固体は不導体、融解・溶解で導体** | 硬いがもろい |
| 共有結合の結晶 | 全体が共有結合 | ダイヤモンド、Si、SiO₂、SiC | 非常に高い | 不導体（黒鉛は導体） | 非常に硬い |
| 金属結晶 | 金属結合 | Fe、Cu、Na | さまざま（Hg は液体、W は 3400 ℃） | 固体・液体とも導体 | 展性・延性 |
| 分子結晶 | 分子間力 | I₂、ドライアイス、スクロース、氷 | 低い、昇華しやすい | 不導体 | 軟らかい |

黒鉛：共有結合の層、原子1個につき自由電子1個 → 導体、軟らかい（層が滑る）。ダイヤモンド：自由電子なし、最硬。`,
    },
    exam: {
      en: ['Among several molecules/ions, which has the most shared (or unshared) electron pairs; which is not planar; which contains a coordinate bond (block on structure, most years).', 'Classify solids from a property table (m.p., conductivity solid/molten, hardness) into ionic / covalent / metallic / molecular.', 'Which molecule is nonpolar despite polar bonds; rank boiling points (hydrogen bonding, molecular mass).'],
      ja: ['いくつかの分子・イオンのうち、共有（または非共有）電子対が最も多いもの、平面でないもの、配位結合を含むもの（物質の構成、ほぼ毎年）。', '性質の表（融点、固体・融解時の電気伝導、硬さ）から固体をイオン・共有結合・金属・分子結晶に分類。', '極性結合があるのに無極性の分子はどれか、沸点の順（水素結合、分子量）。'],
    },
    traps: {
      en: ['NH₄Cl is **ionic** (NH₄⁺ + Cl⁻) even though it contains only nonmetals; inside NH₄⁺ the bonds are covalent (one coordinate).', 'SiO₂ is a **covalent network**, not molecular — no "SiO₂ molecules" exist. CO₂ is molecular.', 'Ionic solids do not conduct until melted or dissolved; graphite conducts but diamond does not.'],
      ja: ['NH₄Cl は非金属だけからなるが**イオン結晶**（NH₄⁺ ＋ Cl⁻）。NH₄⁺ の中は共有結合（1本は配位結合）。', 'SiO₂ は**共有結合の結晶**で分子ではない — 「SiO₂ 分子」は存在しない。CO₂ は分子。', 'イオン結晶は融解・溶解しないと電気を通さない。黒鉛は通すがダイヤモンドは通さない。'],
    },
    followups: {
      en: ['Draw (in words) the electron-dot structures of NH₄⁺ and H₃O⁺ and point out the coordinate bond.', 'Why is CO₂ nonpolar but H₂O polar?', 'Why does graphite conduct electricity while diamond does not?', 'Give me a property table and let me classify the crystals.'],
      ja: ['NH₄⁺ と H₃O⁺ の電子式を言葉で描いて、配位結合を指摘して。', 'CO₂ が無極性で H₂O が極性なのはなぜ？', '黒鉛は電気を通すのにダイヤモンドは通さないのはなぜ？', '性質の表を出して、結晶の分類をさせて。'],
    },
  },
  {
    id: 'mole-formulas',
    core: {
      en: 'The mole is chemistry\'s counting unit: 6.0 × 10²³ particles, whose mass in grams equals the atomic/molecular weight and whose volume as a gas at 0 °C, 1 atm is 22.4 L. Every quantitative question is a conversion through moles: grams ↔ mol ↔ particles ↔ litres ↔ concentration.',
      ja: 'モルは化学の「数える単位」：6.0 × 10²³ 個で、そのグラム数は原子量・分子量に等しく、0 ℃・1 atm の気体なら 22.4 L。量の問題はすべてモルを経由した換算：グラム ↔ mol ↔ 個数 ↔ リットル ↔ 濃度。',
    },
    body: {
      en: r`## The mole hub
$$n\ (\mathrm{mol}) = \frac{\text{mass (g)}}{M\ (\mathrm{g/mol})} = \frac{\text{particles}}{6.0\times10^{23}} = \frac{\text{gas volume at STP (L)}}{22.4}$$
- **Molar mass** $M$ = atomic weight (Fe 56), molecular weight (H₂O 18, CO₂ 44), or formula weight (NaCl 58.5, CaCO₃ 100) in g/mol.
- Avogadro's number $N_A = 6.0\times10^{23}$ /mol.
- 22.4 L/mol applies to **any** gas at 0 °C, $1.013\times10^5$ Pa. Density of a gas at STP $= M/22.4$ g/L; a gas heavier than air has $M > 29$.
- Water: 18 g = 1 mol = 18 mL — the classic "how many molecules in a drop" question.

## Concentrations
| name | formula | note |
|---|---|---|
| mass percent | $\dfrac{\text{solute (g)}}{\text{solution (g)}}\times100$ | solution = solute + solvent |
| molar concentration (mol/L) | $\dfrac{n_{solute}}{V_{solution}\,(\mathrm{L})}$ | volume of the **solution**, not the solvent |
| molality (mol/kg) | $\dfrac{n_{solute}}{m_{solvent}\,(\mathrm{kg})}$ | used for boiling/freezing point changes |

Converting % ↔ mol/L needs the **density**: 1 L of 98% H₂SO₄ ($d = 1.84$) weighs 1840 g, contains 1803 g H₂SO₄ = 18.4 mol → 18.4 mol/L.
Dilution: $c_1V_1 = c_2V_2$ (moles of solute unchanged).

## Formulas
- **Molecular formula**: actual atoms in one molecule (C₆H₆, H₂O₂).
- **Empirical (composition) formula**: simplest ratio (CH, HO); the only kind for ionic and network solids (NaCl, SiO₂).
- **Structural formula**: shows bonds. **Ion formula**, **electron-dot** (Lewis) formula.
From mass %: divide each element's % by its atomic weight → mole ratio → simplest integers → empirical formula; multiply to match the molecular weight.

## Worked pattern
How many oxygen **atoms** in 4.4 g of CO₂? $n = 4.4/44 = 0.10$ mol CO₂ → 0.20 mol O → $1.2\times10^{23}$ atoms. Always ask: molecules or atoms? ions or formula units?`,
      ja: r`## モルを中心に
$$n\ (\mathrm{mol}) = \frac{\text{質量 (g)}}{M\ (\mathrm{g/mol})} = \frac{\text{粒子数}}{6.0\times10^{23}} = \frac{\text{標準状態の気体の体積 (L)}}{22.4}$$
- **モル質量** $M$ = 原子量（Fe 56）、分子量（H₂O 18、CO₂ 44）、式量（NaCl 58.5、CaCO₃ 100）に g/mol をつけたもの。
- アボガドロ定数 $N_A = 6.0\times10^{23}$ /mol。
- 22.4 L/mol は 0 ℃、$1.013\times10^5$ Pa で**どの気体にも**成り立つ。標準状態の気体の密度 $= M/22.4$ g/L。空気より重い気体は $M > 29$。
- 水：18 g = 1 mol = 18 mL — 「一滴の水に分子は何個」の定番。

## 濃度
| 名前 | 式 | 注意 |
|---|---|---|
| 質量パーセント濃度 | $\dfrac{\text{溶質 (g)}}{\text{溶液 (g)}}\times100$ | 溶液 = 溶質 ＋ 溶媒 |
| モル濃度（mol/L） | $\dfrac{n_{溶質}}{V_{溶液}\,(\mathrm{L})}$ | **溶液**の体積。溶媒ではない |
| 質量モル濃度（mol/kg） | $\dfrac{n_{溶質}}{m_{溶媒}\,(\mathrm{kg})}$ | 沸点上昇・凝固点降下で使う |

% ↔ mol/L の換算には**密度**が必要：98% H₂SO₄（$d = 1.84$）1 L は 1840 g、H₂SO₄ は 1803 g = 18.4 mol → 18.4 mol/L。
希釈：$c_1V_1 = c_2V_2$（溶質の物質量は不変）。

## 化学式
- **分子式**：分子1個の実際の原子数（C₆H₆、H₂O₂）。
- **組成式**：最も簡単な整数比（CH、HO）。イオン結晶や共有結合の結晶ではこれだけ（NaCl、SiO₂）。
- **構造式**：結合を示す。**イオン式**、**電子式**。
質量%から：各元素の%を原子量で割る → 物質量の比 → 最も簡単な整数比 → 組成式。分子量に合うよう整数倍して分子式。

## 定番パターン
CO₂ 4.4 g 中の酸素**原子**は何個？ $n = 4.4/44 = 0.10$ mol CO₂ → O 0.20 mol → $1.2\times10^{23}$ 個。必ず確認：分子か原子か？イオンか組成式単位か？`,
    },
    exam: {
      en: ['Number of atoms/molecules/ions in a given mass or gas volume; which sample contains the most atoms.', 'Molar concentration from mass %, density and volume; or grams needed to make a solution of given concentration.', 'Empirical and molecular formula from composition and molecular weight.'],
      ja: ['与えられた質量や気体の体積に含まれる原子・分子・イオンの数、原子数が最も多い試料はどれか。', '質量%・密度・体積からモル濃度、または指定濃度の溶液をつくるのに必要なグラム数。', '組成と分子量から組成式と分子式。'],
    },
    traps: {
      en: ['22.4 L is only at **0 °C and 1 atm**; at other conditions use $pV = nRT$.', 'Molar concentration uses the volume of the **solution**; molality uses the mass of the **solvent**.', '"1 mol of NaCl" contains 2 mol of ions; "1 mol of O₂" contains 2 mol of O atoms.'],
      ja: ['22.4 L は **0 ℃・1 atm** のときだけ。他の条件では $pV = nRT$。', 'モル濃度は**溶液**の体積、質量モル濃度は**溶媒**の質量。', '「NaCl 1 mol」にはイオンが 2 mol、「O₂ 1 mol」には O 原子が 2 mol。'],
    },
    followups: {
      en: ['Do the 98% sulfuric acid → mol/L conversion step by step.', 'How many water molecules are in one drop (0.05 mL)?', 'Find the empirical and molecular formula of a compound that is 40% C, 6.7% H, 53.3% O with M = 180.', 'Why is the volume of 1 mol of any gas the same?'],
      ja: ['98% 硫酸 → mol/L の換算を順に見せて。', '一滴（0.05 mL）の水に分子は何個？', 'C 40%、H 6.7%、O 53.3%、M = 180 の化合物の組成式と分子式を求めて。', 'どの気体でも 1 mol の体積が同じなのはなぜ？'],
    },
  },
  // ───────────────────────────── STATE AND CHANGE ─────────────────────────────
  {
    id: 'stoichiometry',
    core: {
      en: 'A balanced equation is a recipe in moles: the coefficients tell you the ratio in which substances react and form. Convert everything you are given into moles, use the ratio, convert back. When two reactants are given, the one that runs out first (limiting reactant) decides how much product forms.',
      ja: '化学反応式はモル単位のレシピ：係数が反応・生成の比を教える。与えられた量をすべてモルに直し、比を使い、元の単位に戻す。反応物が2つ与えられたら、先になくなる方（制限反応物・過不足）が生成量を決める。',
    },
    body: {
      en: r`## Balancing
Atoms are conserved, so each element count matches on both sides. Method: balance the most complex molecule first, put H and O last, use fractions then double if needed. Ionic equations also conserve **charge**.
Examples: $\mathrm{2H_2 + O_2 \to 2H_2O}$; $\mathrm{C_3H_8 + 5O_2 \to 3CO_2 + 4H_2O}$; $\mathrm{2Al + 6HCl \to 2AlCl_3 + 3H_2}$.

## The mole ratio method
1. Write the balanced equation.
2. Convert the given quantity to moles (g ÷ $M$, L ÷ 22.4, mol/L × L).
3. Multiply by the coefficient ratio (wanted / given).
4. Convert to the asked unit.

Example: mass of CO₂ from 10 g of CaCO₃ with excess HCl ($\mathrm{CaCO_3 + 2HCl \to CaCl_2 + H_2O + CO_2}$): $10/100 = 0.10$ mol → 0.10 mol CO₂ → 4.4 g or 2.24 L at STP.

## Limiting reactant (過不足)
When both amounts are given, compute moles of each, divide by its coefficient, and the **smaller** value is the limiting reactant. Everything is based on it; the other is left over.
Example: 0.30 mol Al + 0.60 mol HCl: Al needs 0.90 mol HCl → HCl is limiting → H₂ $= 0.60 \times \tfrac{3}{6} = 0.30$ mol; Al left $= 0.30 - 0.20 = 0.10$ mol.

## Reading a data table (the EJU archetype)
The exam gives "mass of metal added" vs "gas volume produced": the volume rises linearly, then **flattens** when the acid is used up. The bend gives (a) the mass of metal that exactly reacts, and (b) from the plateau volume, the moles of acid → its concentration. Before the bend the metal is limiting; after it the acid is.

## Gas volumes
For gases at the same $T$ and $p$, volume ratio = mole ratio (Avogadro). "10 L of C₃H₈ burns completely in how much O₂?" → 50 L, producing 30 L of CO₂. Use $pV = nRT$ if conditions are not standard.

## Yield and purity
Actual / theoretical × 100 = yield %. Impure samples: only the pure part reacts — a common twist ("limestone containing 80% CaCO₃").`,
      ja: r`## 係数の合わせ方
原子は保存されるので両辺で各元素の数が一致。方法：いちばん複雑な分子から合わせ、H と O は最後、分数を使ってから必要なら全体を2倍。イオン反応式では**電荷**も保存。
例：$\mathrm{2H_2 + O_2 \to 2H_2O}$、$\mathrm{C_3H_8 + 5O_2 \to 3CO_2 + 4H_2O}$、$\mathrm{2Al + 6HCl \to 2AlCl_3 + 3H_2}$。

## モル比の方法
1. 反応式を書いて係数を合わせる。
2. 与えられた量をモルに（g ÷ $M$、L ÷ 22.4、mol/L × L）。
3. 係数の比（求めるもの／与えられたもの）をかける。
4. 求める単位に直す。

例：CaCO₃ 10 g と過剰の HCl から出る CO₂ の質量（$\mathrm{CaCO_3 + 2HCl \to CaCl_2 + H_2O + CO_2}$）：$10/100 = 0.10$ mol → CO₂ 0.10 mol → 4.4 g、標準状態で 2.24 L。

## 過不足（制限反応物）
両方の量が与えられたら、それぞれモルを求めて係数で割り、**小さい**方が制限反応物。すべてそれを基準に計算し、もう一方は残る。
例：Al 0.30 mol ＋ HCl 0.60 mol：Al には HCl 0.90 mol 必要 → HCl が不足 → H₂ $= 0.60 \times \tfrac{3}{6} = 0.30$ mol、残る Al $= 0.30 - 0.20 = 0.10$ mol。

## データ表の読み方（EJUの定番）
「加えた金属の質量」と「発生した気体の体積」の表：体積は直線的に増え、酸がなくなると**一定**になる。折れ点から (a) ちょうど反応する金属の質量、(b) 一定になった体積から酸のモル → 濃度。折れ点の前は金属が不足、後は酸が不足。

## 気体の体積
同じ $T$、$p$ の気体なら体積比 = モル比（アボガドロ）。「C₃H₈ 10 L の完全燃焼に必要な O₂ は？」→ 50 L、CO₂ 30 L 発生。標準状態でなければ $pV = nRT$。

## 収率と純度
実際の量／理論量 × 100 = 収率%。不純物を含む試料：純粋な部分だけが反応 — よくあるひねり（「CaCO₃ を 80% 含む石灰石」）。`,
    },
    exam: {
      en: ['Data table of metal mass vs gas volume: the mass that exactly reacts and the concentration of the acid (frequent).', 'Limiting reactant: mass of product, leftover reactant, or the number of atoms in the product.', 'Volume of O₂ for complete combustion / volume of CO₂ produced from a hydrocarbon.'],
      ja: ['金属の質量と気体の体積の表：ちょうど反応する質量と酸の濃度（頻出）。', '過不足：生成物の質量、残る反応物、生成物中の原子数。', '炭化水素の完全燃焼に必要な O₂ の体積、生じる CO₂ の体積。'],
    },
    traps: {
      en: ['Ratios are in **moles**, never in grams — 2 g of H₂ does not react with 1 g of O₂.', 'Decide the limiting reactant by (moles ÷ coefficient), not by the raw mole numbers.', 'In the data-table pattern, the plateau volume is set by the **acid**, not by the last mass of metal listed.'],
      ja: ['比は**モル**であってグラムではない — H₂ 2 g は O₂ 1 g とは反応しない。', '制限反応物は（モル ÷ 係数）で判定。モル数そのままでは判定できない。', 'データ表のパターンで一定になった体積を決めるのは**酸**であって、表の最後の金属の質量ではない。'],
    },
    followups: {
      en: ['Walk through a metal-vs-gas-volume table problem with numbers.', 'Show me a limiting-reactant problem and how to find the leftover.', 'How do I balance a redox equation quickly?', 'Why does volume ratio equal mole ratio for gases?'],
      ja: ['金属と気体の体積の表の問題を数値で解いて。', '過不足の問題と残る量の求め方を見せて。', '酸化還元反応の係数を素早く合わせるには？', '気体では体積比がモル比に等しいのはなぜ？'],
    },
  },
  {
    id: 'acids-bases',
    core: {
      en: 'An acid gives H⁺, a base accepts it (or gives OH⁻). "Strong" means completely ionised, not concentrated. pH counts hydrogen ions on a log scale: each step is ×10. Neutralisation is a mole match, H⁺ = OH⁻, which is why titration works — and the salt left behind can itself be acidic or basic depending on which parent was weak.',
      ja: '酸は H⁺ を出し、塩基はそれを受け取る（または OH⁻ を出す）。「強い」とは完全に電離しているという意味で、濃いという意味ではない。pH は水素イオンの数を対数で数え、1段階で10倍。中和は H⁺ = OH⁻ のモルの一致で、だから滴定ができる — 残った塩は、どちらの親が弱いかで酸性にも塩基性にもなる。',
    },
    body: {
      en: r`## Definitions
- Arrhenius: acid → H⁺ in water; base → OH⁻.
- **Brønsted–Lowry**: acid = proton donor, base = proton acceptor. So NH₃ is a base (NH₃ + H₂O → NH₄⁺ + OH⁻) and water is **amphoteric** (donor in that reaction, acceptor with HCl).
- Valency (価数) = number of H⁺ (or OH⁻) one formula can give: HCl 1, H₂SO₄ 2, H₃PO₄ 3; NaOH 1, Ca(OH)₂ 2.

## Strong and weak
| strong acids | strong bases | weak acids | weak bases |
|---|---|---|---|
| HCl, HNO₃, H₂SO₄, HBr, HI, HClO₄ | NaOH, KOH, Ca(OH)₂, Ba(OH)₂ | CH₃COOH, H₂CO₃, H₂S, H₃PO₄, HF, H₂SO₃, (COOH)₂ | NH₃, Cu(OH)₂, Mg(OH)₂ (poorly soluble) |

Strong = degree of ionisation $\alpha \approx 1$. Weak acid: $[\mathrm{H^+}] = c\alpha = \sqrt{cK_a}$ (for small $\alpha$); diluting a weak acid **increases** $\alpha$.
"Strong" and "concentrated" are independent: 0.001 mol/L HCl is strong but dilute.

## pH
$$\mathrm{pH} = -\log_{10}[\mathrm{H^+}], \qquad [\mathrm{H^+}][\mathrm{OH^-}] = 10^{-14}\ (25\,^\circ\mathrm{C})$$
0.01 mol/L HCl → pH 2. 0.01 mol/L NaOH → $[\mathrm{H^+}] = 10^{-12}$ → pH 12. 0.05 mol/L H₂SO₄ → $[\mathrm{H^+}] = 0.1$ → pH 1. Diluting 0.1 mol/L HCl ×10 raises pH by 1; diluting endlessly approaches 7, never passes it. Ten-fold change in $[\mathrm{H^+}]$ = 1 pH unit; a 100× change = 2.

## Neutralisation and titration
$$(\text{acid valency})\times c_a V_a = (\text{base valency})\times c_b V_b$$
Independent of strength — a weak acid needs just as much NaOH as a strong one of the same concentration.
:::fig titration-curve

| titration | equivalence pH | indicator |
|---|---|---|
| strong acid + strong base | 7 | either (methyl orange 3.1–4.4 red→yellow, or phenolphthalein 8.0–9.8 colourless→red) |
| weak acid + strong base | > 7 | **phenolphthalein** |
| strong acid + weak base | < 7 | **methyl orange** |

Apparatus: burette (rinse with the solution it will hold), pipette (rinse likewise), conical flask (rinse with water only — extra water does not change the moles).

## Salts and their solutions
Salt of strong acid + strong base (NaCl, KNO₃): neutral. Weak acid + strong base (CH₃COONa, Na₂CO₃, NaHCO₃): **basic** (hydrolysis of the anion). Strong acid + weak base (NH₄Cl, CuSO₄): **acidic**.
"Acid salt" NaHSO₄ (has H) is acidic; NaHCO₃ is an acid salt too but its solution is weakly **basic** — the name says nothing about pH.

## Buffers (advanced)
Weak acid + its salt (CH₃COOH / CH₃COONa) resists pH change: added H⁺ is absorbed by CH₃COO⁻, added OH⁻ by CH₃COOH.`,
      ja: r`## 定義
- アレニウス：酸 → 水中で H⁺、塩基 → OH⁻。
- **ブレンステッド・ローリー**：酸 = H⁺ を与える、塩基 = H⁺ を受け取る。だから NH₃ は塩基（NH₃ + H₂O → NH₄⁺ + OH⁻）で、水は**両性**（この反応では与え、HCl に対しては受け取る）。
- 価数 = 化学式1つが出せる H⁺（または OH⁻）の数：HCl 1、H₂SO₄ 2、H₃PO₄ 3；NaOH 1、Ca(OH)₂ 2。

## 強弱
| 強酸 | 強塩基 | 弱酸 | 弱塩基 |
|---|---|---|---|
| HCl、HNO₃、H₂SO₄、HBr、HI、HClO₄ | NaOH、KOH、Ca(OH)₂、Ba(OH)₂ | CH₃COOH、H₂CO₃、H₂S、H₃PO₄、HF、H₂SO₃、(COOH)₂ | NH₃、Cu(OH)₂、Mg(OH)₂（溶けにくい） |

強い = 電離度 $\alpha \approx 1$。弱酸：$[\mathrm{H^+}] = c\alpha = \sqrt{cK_a}$（$\alpha$ が小さいとき）。弱酸を薄めると $\alpha$ は**大きくなる**。
「強い」と「濃い」は別：0.001 mol/L の HCl は強酸だが薄い。

## pH
$$\mathrm{pH} = -\log_{10}[\mathrm{H^+}], \qquad [\mathrm{H^+}][\mathrm{OH^-}] = 10^{-14}\ (25\,^\circ\mathrm{C})$$
0.01 mol/L HCl → pH 2。0.01 mol/L NaOH → $[\mathrm{H^+}] = 10^{-12}$ → pH 12。0.05 mol/L H₂SO₄ → $[\mathrm{H^+}] = 0.1$ → pH 1。0.1 mol/L HCl を10倍に薄めると pH は1上がる。いくら薄めても 7 に近づくだけで超えない。$[\mathrm{H^+}]$ が10倍 = pH 1、100倍 = pH 2。

## 中和と滴定
$$(\text{酸の価数})\times c_a V_a = (\text{塩基の価数})\times c_b V_b$$
強弱によらない — 同じ濃度なら弱酸も強酸と同じ量の NaOH が必要。
:::fig titration-curve

| 滴定 | 中和点の pH | 指示薬 |
|---|---|---|
| 強酸＋強塩基 | 7 | どちらでも（メチルオレンジ 3.1〜4.4 赤→黄、フェノールフタレイン 8.0〜9.8 無色→赤） |
| 弱酸＋強塩基 | > 7 | **フェノールフタレイン** |
| 強酸＋弱塩基 | < 7 | **メチルオレンジ** |

器具：ビュレット（入れる溶液で共洗い）、ホールピペット（同様に共洗い）、コニカルビーカー（水で洗うだけ — 水が加わってもモルは変わらない）。

## 塩とその水溶液
強酸＋強塩基の塩（NaCl、KNO₃）：中性。弱酸＋強塩基（CH₃COONa、Na₂CO₃、NaHCO₃）：**塩基性**（陰イオンの加水分解）。強酸＋弱塩基（NH₄Cl、CuSO₄）：**酸性**。
「酸性塩」NaHSO₄（H をもつ）は酸性。NaHCO₃ も酸性塩だが水溶液は弱い**塩基性** — 名前は pH とは無関係。

## 緩衝液（発展）
弱酸＋その塩（CH₃COOH / CH₃COONa）は pH 変化に抵抗：加えた H⁺ は CH₃COO⁻ が、OH⁻ は CH₃COOH が吸収する。`,
    },
    exam: {
      en: ['Strong vs weak acid at the same pH or same concentration: which has more H⁺, which needs more NaOH to neutralise (same conc. → same; same pH → weak needs more).', 'Identify a salt from properties ("from a divalent acid and a monovalent base, solution pH > 7" → Na₂CO₃).', 'pH after mixing acid and base volumes; choice of indicator for a titration curve.'],
      ja: ['同じ pH または同じ濃度の強酸と弱酸：H⁺ が多いのは、中和に多く NaOH が要るのは（同濃度 → 同じ、同 pH → 弱酸が多い）。', '性質から塩を特定（「2価の酸と1価の塩基から、水溶液は pH > 7」→ Na₂CO₃）。', '酸と塩基を混ぜた後の pH、滴定曲線に合う指示薬。'],
    },
    traps: {
      en: ['Same pH, different strength: the **weak** acid has far more total acid (mostly un-ionised) and needs **more** base.', 'Neutralisation moles use the **valency**: 1 mol H₂SO₄ neutralises 2 mol NaOH.', 'A neutral salt solution needs strong + strong; NH₄Cl is acidic, CH₃COONa is basic.'],
      ja: ['同じ pH で強さが違う：**弱酸**の方が全体の酸の量がはるかに多く（ほとんど電離していない）、**多く**の塩基が必要。', '中和の物質量には**価数**を使う：H₂SO₄ 1 mol は NaOH 2 mol を中和。', '中性の塩の水溶液は強＋強のときだけ。NH₄Cl は酸性、CH₃COONa は塩基性。'],
    },
    followups: {
      en: ['Why does a weak acid at the same pH need more NaOH than a strong acid?', 'Show the pH calculation for mixing 10 mL of 0.1 mol/L HCl with 10 mL of 0.05 mol/L NaOH.', 'Why is CH₃COONa solution basic? Write the hydrolysis.', 'Why is phenolphthalein chosen for weak acid–strong base titrations?'],
      ja: ['同じ pH なのに弱酸の方が強酸より多く NaOH が必要なのはなぜ？', '0.1 mol/L HCl 10 mL と 0.05 mol/L NaOH 10 mL を混ぜたときの pH の計算を見せて。', 'CH₃COONa 水溶液が塩基性なのはなぜ？加水分解の式を書いて。', '弱酸–強塩基の滴定でフェノールフタレインを選ぶ理由は？'],
    },
  },
  {
    id: 'redox',
    core: {
      en: 'Oxidation is losing electrons, reduction is gaining them — they always happen together. Track them with oxidation numbers: whatever goes up was oxidised (it is the reducing agent), whatever goes down was reduced (it is the oxidising agent). Metals differ in how readily they give up electrons; that ordering (ionisation tendency) predicts every displacement and acid reaction.',
      ja: '酸化は電子を失うこと、還元は電子を得ること — 必ず同時に起こる。酸化数で追う：上がったものが酸化された（それが還元剤）、下がったものが還元された（それが酸化剤）。金属ごとに電子の手放しやすさが違い、その順序（イオン化傾向）で置換反応も酸との反応も予測できる。',
    },
    body: {
      en: r`## Three ways to say the same thing
| | oxidation | reduction |
|---|---|---|
| oxygen | gains O | loses O |
| hydrogen | loses H | gains H |
| **electrons** | **loses e⁻** | **gains e⁻** |
| oxidation number | increases | decreases |

The electron definition covers everything (Cl₂ + 2KI → 2KCl + I₂ has no oxygen). The **oxidising agent** is reduced; the **reducing agent** is oxidised.

## Oxidation numbers — rules
1. Element (simple substance): 0. 2. Monatomic ion: its charge. 3. H: +1 (−1 in metal hydrides NaH). 4. O: −2 (−1 in peroxides H₂O₂; +2 in OF₂). 5. Group 1: +1, group 2: +2. 6. Sum = 0 for a compound, = charge for an ion.
Examples: S in H₂SO₄ +6, in SO₂ +4, in H₂S −2; Mn in KMnO₄ +7; Cr in K₂Cr₂O₇ +6; N in HNO₃ +5, NH₃ −3; Fe in Fe₃O₄ +8/3 (average).

## Common agents (and what they become)
| oxidising agents | → | reducing agents | → |
|---|---|---|---|
| KMnO₄ (acid) purple | Mn²⁺ colourless | H₂S | S |
| K₂Cr₂O₇ orange | Cr³⁺ green | SO₂ | SO₄²⁻ |
| Cl₂, Br₂ | Cl⁻, Br⁻ | Fe²⁺ | Fe³⁺ |
| conc. HNO₃ / dilute HNO₃ | NO₂ / NO | Na, Zn (metals) | Na⁺, Zn²⁺ |
| hot conc. H₂SO₄ | SO₂ | (COOH)₂ (oxalic acid) | CO₂ |
| **H₂O₂** | H₂O (as oxidiser) | **H₂O₂** | O₂ (as reducer) |
| O₃ | O₂ | I⁻, KI | I₂ |

H₂O₂ and SO₂ act both ways: SO₂ is a reducer with KMnO₄ but an **oxidiser** with H₂S.

## Half-reactions and titration
Write each half-reaction with e⁻, balance O with H₂O and H with H⁺, then combine so electrons cancel. KMnO₄ vs H₂O₂ in acid: $\mathrm{2MnO_4^- + 5H_2O_2 + 6H^+ \to 2Mn^{2+} + 5O_2 + 8H_2O}$ → mole ratio 2 : 5. Endpoint: the first permanent pale purple (KMnO₄ is its own indicator). Iodometry uses starch (blue disappears).

## Ionisation tendency of metals
**Li K Ca Na Mg Al Zn Fe Ni Sn Pb (H) Cu Hg Ag Pt Au** — the larger, the more easily oxidised.
- Above H: dissolve in dilute acids giving H₂ (Pb barely, due to insoluble PbCl₂/PbSO₄).
- Li–Na: react with cold water; Mg: hot water; Al–Fe: steam only; below: no reaction.
- Cu, Hg, Ag: only oxidising acids (HNO₃, hot conc. H₂SO₄). Pt, Au: only aqua regia.
- Al, Fe, Ni: **passivated** by conc. HNO₃.
- **Displacement**: a metal displaces any ion of a metal below it (Zn + Cu²⁺ → Zn²⁺ + Cu, the Daniell reaction).`,
      ja: r`## 同じことの3つの言い方
| | 酸化 | 還元 |
|---|---|---|
| 酸素 | O を得る | O を失う |
| 水素 | H を失う | H を得る |
| **電子** | **e⁻ を失う** | **e⁻ を得る** |
| 酸化数 | 増える | 減る |

電子の定義がすべてをカバーする（Cl₂ + 2KI → 2KCl + I₂ には酸素がない）。**酸化剤**は還元され、**還元剤**は酸化される。

## 酸化数 — ルール
1. 単体：0。2. 単原子イオン：その電荷。3. H：+1（金属水素化物 NaH では −1）。4. O：−2（過酸化物 H₂O₂ では −1、OF₂ では +2）。5. 1族：+1、2族：+2。6. 化合物では和が0、イオンでは電荷。
例：S は H₂SO₄ で +6、SO₂ で +4、H₂S で −2。Mn は KMnO₄ で +7。Cr は K₂Cr₂O₇ で +6。N は HNO₃ で +5、NH₃ で −3。Fe₃O₄ の Fe は +8/3（平均）。

## 主な酸化剤・還元剤（と変化後）
| 酸化剤 | → | 還元剤 | → |
|---|---|---|---|
| KMnO₄（酸性）赤紫 | Mn²⁺ 無色 | H₂S | S |
| K₂Cr₂O₇ 橙赤 | Cr³⁺ 緑 | SO₂ | SO₄²⁻ |
| Cl₂、Br₂ | Cl⁻、Br⁻ | Fe²⁺ | Fe³⁺ |
| 濃硝酸／希硝酸 | NO₂／NO | Na、Zn（金属） | Na⁺、Zn²⁺ |
| 熱濃硫酸 | SO₂ | (COOH)₂（シュウ酸） | CO₂ |
| **H₂O₂** | H₂O（酸化剤として） | **H₂O₂** | O₂（還元剤として） |
| O₃ | O₂ | I⁻、KI | I₂ |

H₂O₂ と SO₂ は両方の役をする：SO₂ は KMnO₄ に対して還元剤だが、H₂S に対しては**酸化剤**。

## 半反応式と滴定
各半反応式を e⁻ を含めて書き、O は H₂O、H は H⁺ で合わせ、電子が消えるように組み合わせる。酸性での KMnO₄ と H₂O₂：$\mathrm{2MnO_4^- + 5H_2O_2 + 6H^+ \to 2Mn^{2+} + 5O_2 + 8H_2O}$ → モル比 2 : 5。終点：初めて消えなくなる薄い赤紫（KMnO₄ 自身が指示薬）。ヨウ素滴定はデンプン（青が消える）。

## 金属のイオン化傾向
**Li K Ca Na Mg Al Zn Fe Ni Sn Pb (H) Cu Hg Ag Pt Au** — 大きいほど酸化されやすい。
- H より上：希酸に溶けて H₂（Pb は不溶性の PbCl₂・PbSO₄ のためほとんど溶けない）。
- Li〜Na：冷水と反応。Mg：熱水。Al〜Fe：高温の水蒸気のみ。それ以下：反応しない。
- Cu、Hg、Ag：酸化力のある酸（HNO₃、熱濃硫酸）のみ。Pt、Au：王水のみ。
- Al、Fe、Ni：濃硝酸で**不動態**。
- **置換**：金属は自分より下の金属のイオンを追い出す（Zn + Cu²⁺ → Zn²⁺ + Cu、ダニエル電池の反応）。`,
    },
    exam: {
      en: ['Which underlined species is the oxidising/reducing agent in given equations; which gas shows reducing action (SO₂, H₂S) (most years).', 'Redox titration: volume of KMnO₄ to oxidise a given H₂O₂ or Fe²⁺ solution (use electron balance or the 2:5 / 1:5 ratio).', 'Which metal fits clues like "dissolves in dilute HCl, passivated by conc. HNO₃, displaces Cu" (→ Fe); or which displacement reaction occurs.'],
      ja: ['与えられた反応式で下線の物質は酸化剤か還元剤か、還元作用を示す気体はどれか（SO₂、H₂S）（ほぼ毎年）。', '酸化還元滴定：H₂O₂ や Fe²⁺ を酸化するのに必要な KMnO₄ の体積（電子の収支、2:5 や 1:5 の比）。', '「希塩酸に溶け、濃硝酸で不動態、Cu を置換する」金属はどれか（→ Fe）、起こる置換反応はどれか。'],
    },
    traps: {
      en: ['The oxidising agent is the one that is **reduced** — students reverse this constantly.', 'H₂O₂ is usually an oxidiser, but against KMnO₄ it is the **reducer** (O: −1 → 0).', 'Neutralisation is **not** redox (no oxidation numbers change); Zn + HCl **is** redox.'],
      ja: ['酸化剤は**還元される**もの — ここを逆にする誤りが非常に多い。', 'H₂O₂ はふつう酸化剤だが、KMnO₄ に対しては**還元剤**（O：−1 → 0）。', '中和は酸化還元では**ない**（酸化数が変わらない）。Zn + HCl は酸化還元で**ある**。'],
    },
    followups: {
      en: ['Assign oxidation numbers in K₂Cr₂O₇, H₂O₂, Fe₃O₄ and NH₄⁺.', 'Derive the KMnO₄ + H₂O₂ equation from half-reactions.', 'Why can SO₂ be both an oxidiser and a reducer?', 'Explain why Pb does not dissolve in HCl although it is above H.'],
      ja: ['K₂Cr₂O₇、H₂O₂、Fe₃O₄、NH₄⁺ の酸化数を決めて。', '半反応式から KMnO₄ + H₂O₂ の反応式を導いて。', 'SO₂ が酸化剤にも還元剤にもなるのはなぜ？', 'Pb は H より上なのに HCl に溶けないのはなぜ？'],
    },
  },
  {
    id: 'states-equilibria',
    core: {
      en: 'Molecules are always moving; a liquid\'s fastest molecules escape as vapour until the vapour pressure is reached, and boiling happens when that pressure equals the outside pressure. Gases obey pV = nRT and each gas in a mixture contributes its own partial pressure. Dissolving particles in a solvent lowers its vapour pressure, so the boiling point rises and the freezing point falls in proportion to the number of particles — not their kind.',
      ja: '分子は常に動いている。液体の速い分子が蒸気として飛び出し、飽和蒸気圧に達するまで続く。その圧力が外圧と等しくなると沸騰する。気体は pV = nRT に従い、混合気体では各気体が自分の分圧をもつ。溶媒に粒子を溶かすと蒸気圧が下がるので、沸点は上がり凝固点は下がる。その大きさは粒子の「種類」でなく「数」に比例する。',
    },
    body: {
      en: r`## Vapour pressure and boiling
:::fig vapor-pressure

Saturated vapour pressure depends only on **temperature** (not on the container volume or on other gases present). A liquid boils when its vapour pressure = external pressure: water boils below 100 °C on a mountain, above it in a pressure cooker. Stronger intermolecular forces → lower vapour pressure → higher boiling point (H₂O > ethanol > diethyl ether).

**Closed container with water** (the EJU archetype): assume all water is vapour and compute its pressure with $pV = nRT$. If that exceeds the vapour pressure at that $T$, some water is liquid and the water vapour pressure **equals** the saturated value; the rest condenses. The volume at which "all just vaporises" satisfies $p_{sat}V = nRT$.

## Gases
$$pV = nRT, \qquad R = 8.31\times10^3\ \mathrm{Pa\cdot L/(mol\cdot K)} = 8.31\ \mathrm{J/(mol\cdot K)}$$
Molar mass from a gas: $M = \dfrac{mRT}{pV} = \dfrac{\rho RT}{p}$.
**Dalton's law**: $p_{total} = p_A + p_B$; each partial pressure $p_A = x_A\,p_{total}$ ($x$ = mole fraction). Gas collected over water: $p_{gas} = p_{atm} - p_{H_2O}$.
Real gases deviate at high $p$ / low $T$ (molecular volume and attractions); $pV/nRT$ dips below 1 then rises above 1.

## Phase diagram of water
:::fig phase-diagram

Solid–liquid line slopes **left** for water (ice melts under pressure — skating); triple point 0.01 °C, 611 Pa; critical point 374 °C, 22 MPa — above it liquid and gas are indistinguishable (supercritical CO₂ for extraction). CO₂'s triple point is above 1 atm, so dry ice sublimes.

## Solubility
- Solids: solubility (g per 100 g water) usually rises with $T$ (KNO₃ steeply, NaCl barely). **Recrystallisation**: dissolve at high $T$, cool, the excess crystallises: mass precipitated $= $ (saturation at $T_1$) − (saturation at $T_2$) scaled to the water present. Hydrated salts (CuSO₄·5H₂O) need the water of crystallisation counted as water.
- Gases: solubility falls with $T$ and rises with pressure. **Henry's law**: mass (or moles) of dissolved gas ∝ partial pressure; the **volume** dissolved, measured at that pressure, is constant.

## Colligative properties (depend on particle number only)
Vapour-pressure lowering → **boiling-point elevation** $\Delta T_b = K_b\,m$ and **freezing-point depression** $\Delta T_f = K_f\,m$, with $m$ the molality of **particles**: NaCl gives 2× its molality, CaCl₂ 3×, glucose 1×. Ranking freezing points: the solution with the most particles per kg freezes lowest.
**Osmotic pressure**: $\Pi V = nRT$ (van 't Hoff) — same form as the gas law, again with total particle moles. Used to find molar masses of polymers.
Supercooling: a liquid may cool below its freezing point before crystallising; the temperature then jumps back up to the freezing point.

## Colloids
Particles 10⁻⁹–10⁻⁷ m: show the **Tyndall effect** (scatter light), **Brownian motion**, are separated from true solutions by **dialysis** (through a semipermeable membrane), and move in an electric field (**electrophoresis**). Hydrophobic colloids (Fe(OH)₃, clay) coagulate with a little electrolyte (**coagulation**, 凝析); hydrophilic colloids (starch, protein, soap) need a lot (**salting out**, 塩析). A protective colloid (gelatin) stabilises a hydrophobic one.`,
      ja: r`## 蒸気圧と沸騰
:::fig vapor-pressure

飽和蒸気圧は**温度**だけで決まる（容器の体積や他の気体には無関係）。液体は 蒸気圧 = 外圧 で沸騰：山の上では水は 100 ℃ 以下で、圧力鍋では 100 ℃ 以上で沸騰。分子間力が強い → 蒸気圧が低い → 沸点が高い（H₂O > エタノール > ジエチルエーテル）。

**水を入れた密閉容器**（EJUの定番）：まず水がすべて気体と仮定して $pV = nRT$ で圧力を計算。それがその温度の飽和蒸気圧を超えていれば一部は液体で、水蒸気の圧力は飽和蒸気圧に**等しい**。残りは凝縮。「ちょうど全部蒸発する」体積は $p_{飽和}V = nRT$ を満たす。

## 気体
$$pV = nRT, \qquad R = 8.31\times10^3\ \mathrm{Pa\cdot L/(mol\cdot K)} = 8.31\ \mathrm{J/(mol\cdot K)}$$
気体からモル質量：$M = \dfrac{mRT}{pV} = \dfrac{\rho RT}{p}$。
**ドルトンの分圧の法則**：$p_{全} = p_A + p_B$、各分圧 $p_A = x_A\,p_{全}$（$x$ = モル分率）。水上置換で集めた気体：$p_{気体} = p_{大気} - p_{H_2O}$。
実在気体は高圧・低温でずれる（分子の体積と引力）。$pV/nRT$ は1より下がってから上がる。

## 水の状態図
:::fig phase-diagram

水の固体–液体の境界線は**左に**傾く（圧力をかけると氷がとける — スケート）。三重点 0.01 ℃、611 Pa。臨界点 374 ℃、22 MPa — それ以上では液体と気体の区別がない（超臨界 CO₂ による抽出）。CO₂ の三重点は 1 atm より上なのでドライアイスは昇華する。

## 溶解度
- 固体：溶解度（水 100 g あたりの g）はふつう $T$ とともに上がる（KNO₃ は急、NaCl はほとんど変わらない）。**再結晶**：高温で溶かして冷やすと、余分が析出：析出量 $= $（$T_1$ での飽和量）−（$T_2$ での飽和量）を水の量に合わせる。水和物（CuSO₄·5H₂O）は結晶水を水として数える。
- 気体：溶解度は $T$ で下がり、圧力で上がる。**ヘンリーの法則**：溶ける気体の質量（物質量）∝ 分圧。その圧力で測った**体積**は一定。

## 束一的性質（粒子数だけで決まる）
蒸気圧降下 → **沸点上昇** $\Delta T_b = K_b\,m$、**凝固点降下** $\Delta T_f = K_f\,m$。$m$ は**粒子**の質量モル濃度：NaCl はモル濃度の2倍、CaCl₂ は3倍、グルコースは1倍。凝固点の順：1 kg あたりの粒子が最も多い溶液が最も低い。
**浸透圧**：$\Pi V = nRT$（ファントホッフ）— 気体の法則と同じ形、やはり粒子の総モル。高分子のモル質量測定に使う。
過冷却：液体は凝固点以下まで結晶化せずに冷えることがあり、その後温度は凝固点まで跳ね上がる。

## コロイド
粒子 10⁻⁹〜10⁻⁷ m：**チンダル現象**（光を散乱）、**ブラウン運動**、**透析**（半透膜）で真の溶液と分離、電場中で移動（**電気泳動**）。疎水コロイド（Fe(OH)₃、粘土）は少量の電解質で沈殿（**凝析**）、親水コロイド（デンプン、タンパク質、セッケン）は多量が必要（**塩析**）。保護コロイド（ゼラチン）は疎水コロイドを安定化。`,
    },
    exam: {
      en: ['Closed variable-volume container with water: the volume at which all water is vapour, or the partial pressure of water / total pressure (frequent).', 'Recrystallisation: mass of crystals on cooling a saturated solution, including hydrated salts.', 'Rank freezing points or osmotic pressures of solutions (NaCl, CaCl₂, glucose, urea) by particle concentration.'],
      ja: ['水を入れた体積可変の密閉容器：水がすべて気体になる体積、水蒸気の分圧・全圧（頻出）。', '再結晶：飽和溶液を冷やしたときの析出量（水和物を含む）。', '溶液（NaCl、CaCl₂、グルコース、尿素）の凝固点や浸透圧の順を粒子濃度で。'],
    },
    traps: {
      en: ['Saturated vapour pressure does **not** change with volume — compress the vapour and more liquid condenses at the same pressure.', 'Colligative effects count **particles**: 0.1 mol/kg NaCl acts like 0.2 mol/kg.', 'For gases, solubility **decreases** on heating (warm soda goes flat) — the opposite of most solids.'],
      ja: ['飽和蒸気圧は体積を変えても**変わらない** — 蒸気を圧縮すると同じ圧力でより多く凝縮する。', '束一的性質は**粒子数**：0.1 mol/kg の NaCl は 0.2 mol/kg として効く。', '気体の溶解度は加熱で**下がる**（温かい炭酸は気が抜ける）— 多くの固体と逆。'],
    },
    followups: {
      en: ['Do the closed-container water problem with numbers.', 'Why does adding solute raise the boiling point? Explain with vapour pressure.', 'Show a recrystallisation calculation with CuSO₄·5H₂O.', 'Why does ice melt under pressure but most solids do not?'],
      ja: ['密閉容器の水の問題を数値で解いて。', '溶質を加えると沸点が上がる理由を蒸気圧で説明して。', 'CuSO₄·5H₂O の再結晶の計算を見せて。', '氷は圧力でとけるのに多くの固体はとけないのはなぜ？'],
    },
  },
  {
    id: 'solid-structure',
    core: {
      en: 'A crystal is a repeating box (unit cell). Count how many atoms belong to one box — corners count 1/8, faces 1/2, edges 1/4, interior 1 — and you can compute density, atomic radius and coordination number from the edge length alone. Body-centred cubic holds 2 atoms, face-centred cubic 4, and touching-atom geometry links the radius to the edge.',
      ja: '結晶は繰り返しの箱（単位格子）。1つの箱に属する原子数を数える — 頂点は 1/8、面は 1/2、辺は 1/4、内部は 1 — と、一辺の長さだけから密度・原子半径・配位数が計算できる。体心立方は2個、面心立方は4個。原子が接する幾何から半径と一辺が結びつく。',
    },
    body: {
      en: r`## Counting atoms in a unit cell
Corner atom: shared by 8 cells → $\tfrac18$. Face atom: shared by 2 → $\tfrac12$. Edge atom: shared by 4 → $\tfrac14$. Interior: 1.

:::fig unit-cells

| lattice | atoms per cell | coordination number | radius vs edge $a$ | packing |
|---|---|---|---|---|
| **body-centred cubic** (bcc: Na, K, Fe) | $8\times\tfrac18 + 1 = 2$ | 8 | atoms touch along the **body diagonal**: $4r = \sqrt3 a$ | 68% |
| **face-centred cubic** (fcc = cubic close-packed: Cu, Ag, Al, Au) | $8\times\tfrac18 + 6\times\tfrac12 = 4$ | 12 | touch along the **face diagonal**: $4r = \sqrt2 a$ | 74% |
| hexagonal close-packed (hcp: Mg, Zn) | 6 per hexagonal cell (2 per primitive) | 12 | — | 74% |

fcc and hcp are both close-packed (ABCABC vs ABAB stacking), same density of packing, differ only in stacking order.

## Density from the unit cell
$$\rho = \frac{(\text{atoms per cell})\times M / N_A}{a^3}$$
Watch units: $a$ in cm ($1\ \mathrm{nm} = 10^{-7}$ cm, $1\ \text{Å} = 10^{-8}$ cm) gives g/cm³. Rearranged, this measures $N_A$ or $M$ from X-ray data — a standard exam calculation.

## Ionic crystals
- **NaCl type**: each ion surrounded by 6 of the other kind (coordination 6:6); unit cell has 4 Na⁺ and 4 Cl⁻ (4 formula units). Na⁺ and Cl⁻ touch along the edge: $a = 2(r_+ + r_-)$.
- **CsCl type**: 8:8 coordination, 1 Cs⁺ + 1 Cl⁻ per cell; ions touch along the body diagonal.
- ZnS (zinc blende): 4:4.
Ionic radius ratio decides the structure (larger cation → higher coordination).

## Covalent and molecular crystals
Diamond: each C bonded to 4 in a tetrahedron; unit cell holds **8** atoms (fcc + 4 interior). Si and SiO₂ share the geometry. Molecular crystals (I₂, dry ice) pack molecules with weak forces — low m.p.

## Amorphous solids
Glass, rubber, amorphous silicon: no long-range order, no sharp melting point (soften gradually).`,
      ja: r`## 単位格子中の原子数の数え方
頂点：8つの格子で共有 → $\tfrac18$。面：2つで共有 → $\tfrac12$。辺：4つで共有 → $\tfrac14$。内部：1。

:::fig unit-cells

| 格子 | 1格子中の原子数 | 配位数 | 半径と一辺 $a$ | 充填率 |
|---|---|---|---|---|
| **体心立方**（bcc：Na、K、Fe） | $8\times\tfrac18 + 1 = 2$ | 8 | **体対角線**で接する：$4r = \sqrt3 a$ | 68% |
| **面心立方**（fcc = 立方最密：Cu、Ag、Al、Au） | $8\times\tfrac18 + 6\times\tfrac12 = 4$ | 12 | **面対角線**で接する：$4r = \sqrt2 a$ | 74% |
| 六方最密（hcp：Mg、Zn） | 六角柱に6（基本単位に2） | 12 | — | 74% |

fcc と hcp はどちらも最密構造（ABCABC と ABAB の積み方）で充填率は同じ。積み方の順序だけが違う。

## 単位格子から密度
$$\rho = \frac{(\text{1格子中の原子数})\times M / N_A}{a^3}$$
単位に注意：$a$ を cm（$1\ \mathrm{nm} = 10^{-7}$ cm、$1\ \text{Å} = 10^{-8}$ cm）にすると g/cm³。逆に X 線のデータから $N_A$ や $M$ を求めるのも定番の計算。

## イオン結晶
- **NaCl 型**：各イオンは相手のイオン6個に囲まれる（配位数 6:6）。単位格子に Na⁺ 4 個と Cl⁻ 4 個（組成式単位4）。Na⁺ と Cl⁻ は辺の上で接する：$a = 2(r_+ + r_-)$。
- **CsCl 型**：配位数 8:8、1格子に Cs⁺ 1 ＋ Cl⁻ 1。体対角線で接する。
- ZnS（閃亜鉛鉱）：4:4。
イオン半径の比で構造が決まる（陽イオンが大きいほど配位数が大きい）。

## 共有結合の結晶と分子結晶
ダイヤモンド：各 C が正四面体の4個と結合。単位格子に **8** 個（fcc ＋ 内部 4）。Si や SiO₂ も同じ幾何。分子結晶（I₂、ドライアイス）は分子が弱い力で集まる — 融点が低い。

## 非晶質（アモルファス）
ガラス、ゴム、アモルファスシリコン：長距離の規則性がなく、決まった融点がない（徐々に軟らかくなる）。`,
    },
    exam: {
      en: ['Given the lattice type (bcc/fcc/NaCl) and edge length: write the density expression or compute it with $N_A$ (most years).', 'Number of atoms/ions per unit cell; coordination number; atomic radius from $a$.', 'Which crystal type matches a description (soft, sublimes → molecular; conducts when molten → ionic).'],
      ja: ['格子の種類（bcc/fcc/NaCl 型）と一辺の長さから密度の式、または $N_A$ で数値計算（ほぼ毎年）。', '単位格子中の原子・イオン数、配位数、$a$ から原子半径。', '記述に合う結晶（軟らかく昇華 → 分子結晶、融解すると導電 → イオン結晶）。'],
    },
    traps: {
      en: ['Atoms touch along the **body** diagonal in bcc but the **face** diagonal in fcc — mixing these up gives the wrong radius.', 'The NaCl unit cell contains 4 NaCl units (4 Na⁺ + 4 Cl⁻), not 1.', 'Convert $a$ to cm **before** cubing; $(10^{-8})^3 = 10^{-24}$.'],
      ja: ['bcc は**体**対角線、fcc は**面**対角線で接する — 取り違えると半径を誤る。', 'NaCl の単位格子には NaCl 4 単位（Na⁺ 4 ＋ Cl⁻ 4）。1 ではない。', '$a$ は3乗する**前に** cm に直す。$(10^{-8})^3 = 10^{-24}$。'],
    },
    followups: {
      en: ['Derive 4r = √3 a for bcc and 4r = √2 a for fcc.', 'Compute the density of copper (fcc, a = 0.36 nm, M = 63.5).', 'Why does NaCl have 4 formula units per cell?', 'Explain why fcc and hcp have the same packing fraction.'],
      ja: ['bcc の 4r = √3 a と fcc の 4r = √2 a を導いて。', '銅の密度を計算して（fcc、a = 0.36 nm、M = 63.5）。', 'NaCl の単位格子に組成式単位が4つあるのはなぜ？', 'fcc と hcp の充填率が同じ理由を説明して。'],
    },
  },
  {
    id: 'thermochemistry',
    core: {
      en: 'Every reaction stores or releases energy in its bonds. Enthalpy change ΔH is that heat at constant pressure: negative when heat comes out (exothermic), positive when it goes in. Because enthalpy depends only on start and end states, you can add reactions like equations (Hess\'s law) — and reaction enthalpy = Σ bonds broken − Σ bonds formed, or Σ ΔH_f(products) − Σ ΔH_f(reactants).',
      ja: 'すべての反応は結合にエネルギーを蓄えたり放出したりする。エンタルピー変化 ΔH は定圧でのその熱で、熱が出れば負（発熱）、入れば正（吸熱）。エンタルピーは始状態と終状態だけで決まるので、反応式を方程式のように足し合わせられる（ヘスの法則）— 反応エンタルピー = 切れる結合の和 − できる結合の和、または Σ ΔH_f(生成物) − Σ ΔH_f(反応物)。',
    },
    body: {
      en: r`## Enthalpy notation
Current Japanese curriculum writes the equation with $\Delta H$ beside it: $\mathrm{CH_4 + 2O_2 \to CO_2 + 2H_2O(l)} \quad \Delta H = -891\ \mathrm{kJ}$.
- **Exothermic**: $\Delta H < 0$ (combustion, neutralisation, most oxidations). Products are lower in energy.
- **Endothermic**: $\Delta H > 0$ (thermal decomposition, dissolving NH₄NO₃).
Older "thermochemical equations" put the heat as $+Q$ on the right side: $Q = -\Delta H$. Be ready for both.
Always state the physical state — H₂O(l) vs H₂O(g) differ by the enthalpy of vaporisation (44 kJ/mol).

:::fig energy-diagram

## Kinds of reaction enthalpy (per mole of the named thing)
| name | defined for | example |
|---|---|---|
| combustion | 1 mol of substance burned completely | C₂H₅OH: −1368 kJ |
| **formation** | 1 mol of compound from its **elements in standard states** | H₂O(l): −286 kJ; elements themselves: 0 |
| neutralisation | 1 mol of H₂O formed from strong acid + base | −56 kJ |
| dissolution | 1 mol of solute dissolved in much water | NaOH: −45 kJ; NH₄NO₃: +26 kJ |
| fusion / vaporisation | 1 mol of phase change | H₂O: +6.0 / +44 kJ |

## Hess's law (the main tool)
The total enthalpy change is the same whatever the route. Practical forms:
$$\Delta H_{rxn} = \sum \Delta H_f(\text{products}) - \sum \Delta H_f(\text{reactants})$$
$$\Delta H_{rxn} = \sum(\text{bond energies broken}) - \sum(\text{bond energies formed})$$
Or manipulate given equations: reverse (flip the sign), multiply (scale $\Delta H$), add. Example: from combustion enthalpies of C (−394), H₂ (−286) and CH₄ (−891), the formation enthalpy of CH₄ $= -394 + 2(-286) - (-891) = -75$ kJ/mol.

## Bond energy
Energy to break 1 mol of a bond in the gas phase (H–H 436, O=O 498, O–H 463 kJ/mol). Breaking costs energy (+), forming releases (−). Strong bonds in products → exothermic.

## Calorimetry
$Q = mc\Delta T$ for the water; moles of reactant → $\Delta H$ per mole. Heat lost to the surroundings makes the measured value **smaller** in magnitude than the true one.

## Light and reactions
Photosynthesis stores light energy (endothermic); combustion of Mg and chemiluminescence release light; a reaction can be driven by light (photochemical).`,
      ja: r`## エンタルピーの書き方
現行課程は反応式の横に $\Delta H$ を書く：$\mathrm{CH_4 + 2O_2 \to CO_2 + 2H_2O(液)} \quad \Delta H = -891\ \mathrm{kJ}$。
- **発熱反応**：$\Delta H < 0$（燃焼、中和、多くの酸化）。生成物のエネルギーが低い。
- **吸熱反応**：$\Delta H > 0$（熱分解、NH₄NO₃ の溶解）。
旧課程の「熱化学方程式」は右辺に $+Q$ を書く：$Q = -\Delta H$。どちらにも対応できるように。
状態を必ず書く — H₂O(液) と H₂O(気) は蒸発エンタルピー（44 kJ/mol）だけ違う。

:::fig energy-diagram

## 反応エンタルピーの種類（着目する物質 1 mol あたり）
| 名前 | 定義 | 例 |
|---|---|---|
| 燃焼エンタルピー | 物質 1 mol の完全燃焼 | C₂H₅OH：−1368 kJ |
| **生成エンタルピー** | **標準状態の単体**から化合物 1 mol | H₂O(液)：−286 kJ。単体自身は 0 |
| 中和エンタルピー | 強酸＋強塩基で H₂O 1 mol 生成 | −56 kJ |
| 溶解エンタルピー | 溶質 1 mol を多量の水に | NaOH：−45 kJ。NH₄NO₃：+26 kJ |
| 融解／蒸発エンタルピー | 1 mol の状態変化 | H₂O：+6.0／+44 kJ |

## ヘスの法則（主な道具）
経路によらず全体のエンタルピー変化は同じ。実用形：
$$\Delta H_{反応} = \sum \Delta H_f(\text{生成物}) - \sum \Delta H_f(\text{反応物})$$
$$\Delta H_{反応} = \sum(\text{切れる結合エネルギー}) - \sum(\text{できる結合エネルギー})$$
または与えられた式を操作：逆にする（符号反転）、倍にする（$\Delta H$ も倍）、足す。例：C（−394）、H₂（−286）、CH₄（−891）の燃焼エンタルピーから CH₄ の生成エンタルピー $= -394 + 2(-286) - (-891) = -75$ kJ/mol。

## 結合エネルギー
気体で結合 1 mol を切るエネルギー（H–H 436、O=O 498、O–H 463 kJ/mol）。切るには吸収（+）、できると放出（−）。生成物の結合が強い → 発熱。

## 熱量測定
水の $Q = mc\Delta T$。反応物の物質量 → 1 mol あたりの $\Delta H$。周囲へ熱が逃げると測定値の大きさは真の値より**小さく**なる。

## 光と反応
光合成は光エネルギーを蓄える（吸熱）。Mg の燃焼や化学発光は光を放出。光で進む反応もある（光化学反応）。`,
    },
    exam: {
      en: ['Combustion heat used to warm water: from $mc\\Delta T$ and moles burned, find the enthalpy of combustion; or the reverse (most years).', 'Hess\'s law: enthalpy of formation from combustion data, or an unknown $\\Delta H$ from three given equations.', 'True/false about an exothermic equilibrium (raising $T$ shifts it back, catalyst does not change $\\Delta H$).'],
      ja: ['燃焼熱で水を温める：$mc\\Delta T$ と燃やした物質量から燃焼エンタルピー、またはその逆（ほぼ毎年）。', 'ヘスの法則：燃焼データから生成エンタルピー、与えられた3式から未知の $\\Delta H$。', '発熱平衡についての正誤（温度を上げると逆へ移動、触媒は $\\Delta H$ を変えない）。'],
    },
    traps: {
      en: ['Sign convention: exothermic is $\\Delta H < 0$ but appears as $+Q$ in old-style equations.', 'Formation enthalpy of an **element** in its standard state is zero (O₂, N₂, C(graphite) — not diamond).', 'Bond energy is for the **gas** phase; if water is formed as liquid, add the condensation enthalpy.'],
      ja: ['符号：発熱は $\\Delta H < 0$ だが旧式の熱化学方程式では $+Q$。', '標準状態の**単体**の生成エンタルピーは 0（O₂、N₂、C(黒鉛) — ダイヤモンドではない）。', '結合エネルギーは**気体**での値。水が液体で生じるなら凝縮エンタルピーを足す。'],
    },
    followups: {
      en: ['Walk through the CH₄ formation enthalpy from combustion data.', 'Why does the enthalpy change not depend on the path?', 'Compute ΔH for H₂ + Cl₂ → 2HCl from bond energies.', 'Show a calorimetry problem with heat loss to the container.'],
      ja: ['燃焼データから CH₄ の生成エンタルピーを求める手順を見せて。', 'エンタルピー変化が経路によらないのはなぜ？', '結合エネルギーから H₂ + Cl₂ → 2HCl の ΔH を計算して。', '容器への熱損失を含む熱量測定の問題を見せて。'],
    },
  },
  {
    id: 'cells-electrolysis',
    core: {
      en: 'A cell lets a spontaneous redox reaction happen with the electrons travelling through a wire: the more easily oxidised metal is the negative electrode. Electrolysis is the reverse — an external voltage forces a non-spontaneous reaction, oxidation at the anode (+), reduction at the cathode (−). Faraday\'s law counts it: 96500 C moves 1 mol of electrons, and the half-reaction says how many electrons per mole of product.',
      ja: '電池は自発的な酸化還元反応を、電子が導線を通る形で起こさせる：酸化されやすい金属が負極。電気分解はその逆 — 外部の電圧で非自発的な反応を強制し、陽極（＋）で酸化、陰極（−）で還元。ファラデーの法則で数える：96500 C で電子 1 mol が流れ、半反応式が生成物 1 mol あたりの電子数を教える。',
    },
    body: {
      en: r`## Cells (電池)
:::fig daniell

Two metals in electrolytes, joined by a wire. The metal with the **larger ionisation tendency** dissolves (oxidised) and is the **negative electrode**; electrons flow through the wire to the positive electrode where reduction occurs. Emf ≈ difference in tendency.

| cell | − electrode (oxidation) | + electrode (reduction) | notes |
|---|---|---|---|
| **Daniell** Zn \| ZnSO₄ ‖ CuSO₄ \| Cu | Zn → Zn²⁺ + 2e⁻ | Cu²⁺ + 2e⁻ → Cu | 1.1 V; porous pot lets SO₄²⁻ move; Zn plate loses mass, Cu gains |
| **dry cell** (Leclanché) | Zn | MnO₂ (C rod is just a current collector) | NH₄Cl/ZnCl₂ paste, 1.5 V |
| **lead–acid** | Pb → PbSO₄ | PbO₂ → PbSO₄ | 2 V; H₂SO₄ consumed on discharge (density falls); **rechargeable** (secondary) |
| **fuel cell** (H₂/O₂) | H₂ → 2H⁺ + 2e⁻ | O₂ + 4H⁺ + 4e⁻ → 2H₂O | product only water; Pt catalyst |
| lithium-ion | LiC₆ → Li⁺ (graphite) | LiCoO₂ | rechargeable, light |

Primary cells cannot be recharged; secondary cells (lead–acid, Ni–MH, Li-ion) can. Lead–acid discharge: $\mathrm{Pb + PbO_2 + 2H_2SO_4 \to 2PbSO_4 + 2H_2O}$ — both electrodes gain mass.

## Electrolysis (電気分解)
:::fig electrolysis

External source drives the reaction. **Anode** = connected to +, oxidation. **Cathode** = connected to −, reduction. (Opposite naming to a cell's "+ electrode", which is where reduction happens — remember: in **both** devices, oxidation happens at the anode.)

Which reaction happens? At the **cathode** the most easily reduced species: Ag⁺, Cu²⁺ before H⁺/H₂O; but Na⁺, K⁺, Al³⁺ are **never** reduced in water — H₂ forms instead ($\mathrm{2H_2O + 2e^- \to H_2 + 2OH^-}$). At the **anode**: if the electrode is Cu/Ag it dissolves (Cu → Cu²⁺); with an inert electrode (Pt, C), Cl⁻/I⁻ are oxidised to Cl₂/I₂, otherwise water gives O₂ ($\mathrm{2H_2O \to O_2 + 4H^+ + 4e^-}$); SO₄²⁻ and NO₃⁻ are not oxidised.

| electrolyte (Pt electrodes) | cathode | anode |
|---|---|---|
| NaCl(aq) | H₂ (solution becomes NaOH) | Cl₂ |
| CuSO₄(aq) | Cu | O₂ (solution becomes acidic) |
| H₂SO₄ / NaOH (aq) | H₂ | O₂ (= electrolysis of water, 2:1 by volume) |
| CuSO₄(aq), **Cu electrodes** | Cu deposits | Cu dissolves (refining) |
| molten NaCl / Al₂O₃ | Na / Al | Cl₂ / O₂ (CO₂ with carbon anodes) |

## Faraday's law
$$Q = It\ (\mathrm{C}), \qquad n_{e^-} = \frac{It}{96500}$$
Then use the half-reaction: Cu²⁺ + 2e⁻ → Cu means 1 mol Cu per 2 mol e⁻; Ag⁺ + e⁻ → Ag means 1:1; 2H₂O → O₂ needs 4 e⁻ per O₂. Example: 2.0 A for 965 s → 0.020 mol e⁻ → 0.010 mol Cu = 0.64 g, or 0.020 mol Ag = 2.16 g, or 0.005 mol O₂ = 112 mL.
Two cells in series carry the **same** charge.

## Industrial electrolysis
NaOH by the **ion-exchange membrane** method (Cl₂ at the anode, H₂ + NaOH at the cathode, membrane passes only Na⁺); Al by molten-salt electrolysis of Al₂O₃ in cryolite; Cu refining with crude-Cu anodes (Ag, Au fall as anode mud; Zn, Fe, Ni stay in solution).`,
      ja: r`## 電池
:::fig daniell

2種の金属を電解液に浸し導線でつなぐ。**イオン化傾向の大きい**金属が溶け（酸化）、**負極**になる。電子は導線を通って正極へ行き、そこで還元が起こる。起電力 ≈ 傾向の差。

| 電池 | 負極（酸化） | 正極（還元） | 備考 |
|---|---|---|---|
| **ダニエル電池** Zn \| ZnSO₄ ‖ CuSO₄ \| Cu | Zn → Zn²⁺ + 2e⁻ | Cu²⁺ + 2e⁻ → Cu | 1.1 V。素焼き板を SO₄²⁻ が移動。Zn 板は減り Cu 板は増える |
| **乾電池**（マンガン） | Zn | MnO₂（炭素棒は集電体） | NH₄Cl/ZnCl₂、1.5 V |
| **鉛蓄電池** | Pb → PbSO₄ | PbO₂ → PbSO₄ | 2 V。放電で H₂SO₄ が消費（密度低下）。**充電可能**（二次電池） |
| **燃料電池**（H₂/O₂） | H₂ → 2H⁺ + 2e⁻ | O₂ + 4H⁺ + 4e⁻ → 2H₂O | 生成物は水だけ。Pt 触媒 |
| リチウムイオン電池 | LiC₆ → Li⁺（黒鉛） | LiCoO₂ | 充電可能、軽い |

一次電池は充電できない。二次電池（鉛蓄電池、ニッケル水素、リチウムイオン）はできる。鉛蓄電池の放電：$\mathrm{Pb + PbO_2 + 2H_2SO_4 \to 2PbSO_4 + 2H_2O}$ — 両極とも質量が増える。

## 電気分解
:::fig electrolysis

外部電源で反応を進める。**陽極** = 電源の＋につながる、酸化。**陰極** = −につながる、還元。（電池の「正極」は還元が起こる極なので名前が逆に見える — **どちらの装置でも**酸化は陽極（負極）側で起こる、と覚える。）

何が反応するか？ **陰極**では最も還元されやすいもの：Ag⁺、Cu²⁺ は H⁺/H₂O より先。しかし Na⁺、K⁺、Al³⁺ は水溶液中では**決して**還元されず、代わりに H₂（$\mathrm{2H_2O + 2e^- \to H_2 + 2OH^-}$）。**陽極**：電極が Cu や Ag なら溶ける（Cu → Cu²⁺）。不活性電極（Pt、C）なら Cl⁻/I⁻ が Cl₂/I₂ に酸化され、それ以外は水から O₂（$\mathrm{2H_2O \to O_2 + 4H^+ + 4e^-}$）。SO₄²⁻ と NO₃⁻ は酸化されない。

| 電解液（Pt 電極） | 陰極 | 陽極 |
|---|---|---|
| NaCl 水溶液 | H₂（溶液は NaOH に） | Cl₂ |
| CuSO₄ 水溶液 | Cu | O₂（溶液は酸性に） |
| H₂SO₄／NaOH 水溶液 | H₂ | O₂（= 水の電気分解、体積比 2:1） |
| CuSO₄ 水溶液、**Cu 電極** | Cu が析出 | Cu が溶ける（精錬） |
| 溶融 NaCl／Al₂O₃ | Na／Al | Cl₂／O₂（炭素陽極なら CO₂） |

## ファラデーの法則
$$Q = It\ (\mathrm{C}), \qquad n_{e^-} = \frac{It}{96500}$$
あとは半反応式：Cu²⁺ + 2e⁻ → Cu は e⁻ 2 mol で Cu 1 mol、Ag⁺ + e⁻ → Ag は 1:1、2H₂O → O₂ は O₂ 1 個に e⁻ 4 個。例：2.0 A で 965 秒 → e⁻ 0.020 mol → Cu 0.010 mol = 0.64 g、Ag 0.020 mol = 2.16 g、O₂ 0.005 mol = 112 mL。
直列につないだ2つの電解槽には**同じ**電気量が流れる。

## 工業的な電気分解
NaOH は**イオン交換膜法**（陽極で Cl₂、陰極で H₂ ＋ NaOH、膜は Na⁺ だけ通す）。Al は氷晶石に溶かした Al₂O₃ の溶融塩電解。Cu は粗銅を陽極にして精錬（Ag、Au は陽極泥へ、Zn、Fe、Ni は溶液中に残る）。`,
    },
    exam: {
      en: ['Current × time → charge → mass deposited or gas volume at an electrode; or two cells in series (most years).', 'Identify the electrode reactions / products for a given electrolyte and electrode material; which electrode gains mass.', 'Fuel cell or lead–acid: which species is oxidised, what is produced, how the electrolyte changes.'],
      ja: ['電流 × 時間 → 電気量 → 電極に析出する質量や気体の体積。直列の2つの電解槽（ほぼ毎年）。', '電解液と電極材料から各極の反応・生成物、質量が増える極はどちらか。', '燃料電池や鉛蓄電池：酸化されるもの、生成物、電解液の変化。'],
    },
    traps: {
      en: ['In a cell the **negative** electrode is where oxidation happens; in electrolysis oxidation is at the **anode (+)**. Do not mix the two labels.', 'Na⁺ is never discharged from water — the cathode gives H₂ and the solution turns basic.', 'Count electrons per mole of product from the half-reaction (Cu 2, Ag 1, O₂ 4, H₂ 2, Cl₂ 2).'],
      ja: ['電池では**負極**で酸化、電気分解では**陽極（＋）**で酸化。2つの名前を混同しない。', '水溶液中で Na⁺ は決して析出しない — 陰極では H₂ が出て溶液は塩基性になる。', '生成物 1 mol あたりの電子数は半反応式で数える（Cu 2、Ag 1、O₂ 4、H₂ 2、Cl₂ 2）。'],
    },
    followups: {
      en: ['Do a Faraday calculation: 0.50 A for 32 min through CuSO₄ and AgNO₃ cells in series.', 'Why is zinc the negative electrode in the Daniell cell?', 'Why does the lead–acid battery\'s electrolyte density fall on discharge?', 'Explain the ion-exchange membrane method step by step.'],
      ja: ['ファラデーの計算：直列の CuSO₄ と AgNO₃ の電解槽に 0.50 A を 32 分。', 'ダニエル電池で亜鉛が負極になるのはなぜ？', '鉛蓄電池の放電で電解液の密度が下がるのはなぜ？', 'イオン交換膜法を順を追って説明して。'],
    },
  },
  {
    id: 'rate-equilibrium',
    core: {
      en: 'Reactions go faster when molecules collide more often and harder — more concentration, higher temperature, a catalyst lowering the activation-energy hill. A reversible reaction stops changing when forward and reverse rates match; that balance point is fixed by the equilibrium constant K (which only temperature can change). Push the system (add, compress, heat) and it shifts to undo the push: Le Chatelier.',
      ja: '分子がより頻繁に、より強くぶつかると反応は速くなる — 濃度を上げる、温度を上げる、触媒で活性化エネルギーの山を下げる。可逆反応は正反応と逆反応の速さが等しくなると見かけ上止まる。そのつり合いの位置は平衡定数 K で決まり（K を変えられるのは温度だけ）。系を押す（加える、圧縮する、加熱する）と、押しを打ち消す向きにずれる：ルシャトリエ。',
    },
    body: {
      en: r`## Reaction rate
$v = -\dfrac{\Delta[\mathrm{A}]}{\Delta t} = \dfrac{\Delta[\mathrm{P}]}{\Delta t}$ (mol/(L·s)). Rate law $v = k[\mathrm{A}]^a[\mathrm{B}]^b$ — the exponents come from **experiment**, not from the coefficients. Rate constant $k$ depends on temperature and catalyst only.

:::fig energy-diagram

| factor | effect | why |
|---|---|---|
| concentration / pressure | faster | more collisions |
| temperature | much faster (~2–3× per 10 K) | more molecules have energy ≥ $E_a$ (the tail of the distribution grows) |
| **catalyst** | faster, **unchanged** equilibrium and $\Delta H$ | provides a path with **lower activation energy** |
| surface area (solids) | faster | more contact |

Activation energy $E_a$: the hill between reactants and products. The reverse reaction's $E_a$ = forward $E_a$ − $\Delta H$ (for exothermic). A catalyst lowers both by the same amount.

## Chemical equilibrium
For $a\mathrm{A} + b\mathrm{B} \rightleftharpoons c\mathrm{C} + d\mathrm{D}$:
$$K_c = \frac{[\mathrm{C}]^c[\mathrm{D}]^d}{[\mathrm{A}]^a[\mathrm{B}]^b}, \qquad K_p = \frac{p_C^c\,p_D^d}{p_A^a\,p_B^b}$$
Solids and pure liquids (water as solvent) are left out. $K$ depends **only on temperature**. Large $K$ → products favoured. At equilibrium forward rate = reverse rate; concentrations stop changing but reactions continue (dynamic).

**Equilibrium calculation** (ICE table): initial – change – equilibrium. Example: $\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$, start 1 mol each in $V$ L, let $x$ react: $K = \dfrac{(2x)^2}{(1-x)^2}$ (volume cancels here because moles are equal on both sides).

## Le Chatelier's principle
:::fig equilibrium-shift

| disturbance | shift | note |
|---|---|---|
| add a reactant | → toward products | $K$ unchanged |
| remove a product | → | |
| **increase pressure** (compress) | toward **fewer gas moles** | no effect if equal moles ($\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$) |
| add an **inert gas at constant volume** | **no shift** | partial pressures unchanged |
| add inert gas at constant pressure | toward more gas moles | dilutes |
| **raise temperature** | toward the **endothermic** direction | **$K$ changes** |
| catalyst | none | reaches equilibrium faster |

Haber process $\mathrm{N_2 + 3H_2 \rightleftharpoons 2NH_3}$, $\Delta H < 0$: high pressure and low temperature favour NH₃, but low $T$ is slow → compromise ~500 °C, 200–1000 atm, Fe catalyst.

## Dissociation equilibria
- Weak acid: $K_a = \dfrac{[\mathrm{H^+}][\mathrm{A^-}]}{[\mathrm{HA}]} = \dfrac{c\alpha^2}{1-\alpha} \approx c\alpha^2$ → $\alpha = \sqrt{K_a/c}$, $[\mathrm{H^+}] = \sqrt{cK_a}$. Dilution raises $\alpha$ (Ostwald).
- Water: $K_w = [\mathrm{H^+}][\mathrm{OH^-}] = 10^{-14}$ (25 °C); rises with $T$ (dissociation is endothermic) — neutral water at 60 °C has pH < 7 but is still neutral.
- **Salt hydrolysis**: CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻ (basic); NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺ (acidic).
- **Buffer**: weak acid + its salt; $[\mathrm{H^+}] = K_a\dfrac{[\mathrm{HA}]}{[\mathrm{A^-}]}$ — pH barely moves on adding small amounts of acid or base. Blood (H₂CO₃/HCO₃⁻) is a buffer.
- **Solubility product**: $K_{sp} = [\mathrm{Ag^+}][\mathrm{Cl^-}]$; precipitate forms when the ion product exceeds $K_{sp}$; **common-ion effect** — adding Cl⁻ reduces AgCl solubility.`,
      ja: r`## 反応速度
$v = -\dfrac{\Delta[\mathrm{A}]}{\Delta t} = \dfrac{\Delta[\mathrm{P}]}{\Delta t}$（mol/(L·s)）。反応速度式 $v = k[\mathrm{A}]^a[\mathrm{B}]^b$ — 指数は係数ではなく**実験**で決まる。速度定数 $k$ は温度と触媒だけで変わる。

:::fig energy-diagram

| 要因 | 効果 | 理由 |
|---|---|---|
| 濃度・圧力 | 速くなる | 衝突が増える |
| 温度 | 大きく速くなる（10 K で約2〜3倍） | エネルギー ≥ $E_a$ の分子が増える（分布のすそが広がる） |
| **触媒** | 速くなる。平衡と $\Delta H$ は**変わらない** | **活性化エネルギーの低い**経路を与える |
| 表面積（固体） | 速くなる | 接触が増える |

活性化エネルギー $E_a$：反応物と生成物の間の山。逆反応の $E_a$ = 正反応の $E_a$ − $\Delta H$（発熱の場合）。触媒は両方を同じだけ下げる。

## 化学平衡
$a\mathrm{A} + b\mathrm{B} \rightleftharpoons c\mathrm{C} + d\mathrm{D}$ に対して
$$K_c = \frac{[\mathrm{C}]^c[\mathrm{D}]^d}{[\mathrm{A}]^a[\mathrm{B}]^b}, \qquad K_p = \frac{p_C^c\,p_D^d}{p_A^a\,p_B^b}$$
固体と純粋な液体（溶媒の水）は含めない。$K$ は**温度だけ**で決まる。$K$ が大きい → 生成物側に偏る。平衡では正反応の速さ = 逆反応の速さ。濃度は変わらないが反応は続いている（動的平衡）。

**平衡の計算**（初め・変化・平衡の表）：例 $\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$、$V$ L に各 1 mol、$x$ mol 反応：$K = \dfrac{(2x)^2}{(1-x)^2}$（両辺のモル数が等しいので体積が消える）。

## ルシャトリエの原理
:::fig equilibrium-shift

| 操作 | 移動 | 備考 |
|---|---|---|
| 反応物を加える | → 生成物側 | $K$ は不変 |
| 生成物を取り除く | → | |
| **圧力を上げる**（圧縮） | **気体のモル数が減る**向き | 両辺のモル数が等しければ動かない（$\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$） |
| **体積一定で不活性気体**を加える | **動かない** | 分圧が変わらない |
| 圧力一定で不活性気体を加える | 気体のモル数が増える向き | 薄まる |
| **温度を上げる** | **吸熱**の向き | **$K$ が変わる** |
| 触媒 | 動かない | 平衡に達するのが速くなる |

ハーバー・ボッシュ法 $\mathrm{N_2 + 3H_2 \rightleftharpoons 2NH_3}$、$\Delta H < 0$：高圧・低温が NH₃ に有利だが低温では遅い → 妥協して約 500 ℃、200〜1000 atm、Fe 触媒。

## 電離平衡
- 弱酸：$K_a = \dfrac{[\mathrm{H^+}][\mathrm{A^-}]}{[\mathrm{HA}]} = \dfrac{c\alpha^2}{1-\alpha} \approx c\alpha^2$ → $\alpha = \sqrt{K_a/c}$、$[\mathrm{H^+}] = \sqrt{cK_a}$。薄めると $\alpha$ は上がる（オストワルド）。
- 水：$K_w = [\mathrm{H^+}][\mathrm{OH^-}] = 10^{-14}$（25 ℃）。$T$ で上がる（電離は吸熱）— 60 ℃ の中性の水は pH < 7 だがやはり中性。
- **塩の加水分解**：CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻（塩基性）。NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺（酸性）。
- **緩衝液**：弱酸＋その塩。$[\mathrm{H^+}] = K_a\dfrac{[\mathrm{HA}]}{[\mathrm{A^-}]}$ — 少量の酸・塩基を加えても pH がほとんど動かない。血液（H₂CO₃/HCO₃⁻）は緩衝液。
- **溶解度積**：$K_{sp} = [\mathrm{Ag^+}][\mathrm{Cl^-}]$。イオン積が $K_{sp}$ を超えると沈殿。**共通イオン効果** — Cl⁻ を加えると AgCl の溶解度が下がる。`,
    },
    exam: {
      en: ['Which change increases the amount of product / the equilibrium constant / the rate (a table of T, p, catalyst, inert gas) — pick the correct combination (most years).', 'Equilibrium constant from equilibrium amounts, or the amount at equilibrium from $K$ (ICE table).', 'Weak-acid $[\\mathrm{H^+}]$ or pH from $K_a$; buffer or common-ion reasoning.'],
      ja: ['生成物の量・平衡定数・反応速度を増やす操作はどれか（T、p、触媒、不活性気体の表）— 正しい組み合わせを選ぶ（ほぼ毎年）。', '平衡時の量から平衡定数、または $K$ から平衡時の量（初め・変化・平衡の表）。', '$K_a$ から弱酸の $[\\mathrm{H^+}]$ や pH、緩衝液・共通イオン効果の考え方。'],
    },
    traps: {
      en: ['A catalyst changes the **rate** only — never $K$, never the equilibrium amounts, never $\\Delta H$.', 'Only **temperature** changes $K$; pressure and concentration shift the position but $K$ stays.', 'Inert gas at constant **volume** does nothing; at constant **pressure** it acts like a volume increase.'],
      ja: ['触媒が変えるのは**速さ**だけ — $K$ も平衡時の量も $\\Delta H$ も変えない。', '$K$ を変えるのは**温度**だけ。圧力や濃度は平衡の位置を動かすが $K$ は同じ。', '**体積一定**で不活性気体を加えても何も起こらない。**圧力一定**なら体積を増やしたのと同じ。'],
    },
    followups: {
      en: ['Why does a catalyst not change the equilibrium position?', 'Solve an H₂ + I₂ ⇌ 2HI equilibrium with K = 64.', 'Explain why adding inert gas at constant volume does not shift the equilibrium.', 'Derive [H⁺] = √(cKₐ) for a weak acid.'],
      ja: ['触媒が平衡の位置を変えないのはなぜ？', 'K = 64 の H₂ + I₂ ⇌ 2HI の平衡を解いて。', '体積一定で不活性気体を加えても平衡が動かない理由を説明して。', '弱酸の [H⁺] = √(cKₐ) を導いて。'],
    },
  },
  // ───────────────────────────── INORGANIC ─────────────────────────────
  {
    id: 'typical-elements',
    core: {
      en: 'Main-group chemistry is periodic-table logic: the group fixes the valence electrons, the valence electrons fix the ion, and the ion fixes the compounds. Learn each group by one pattern plus its exceptions — alkali metals get more reactive downward, halogens less; group 2 splits into "Be/Mg" and "Ca/Sr/Ba" behaviour; carbon, silicon, nitrogen, phosphorus, oxygen and sulfur each have a handful of signature compounds.',
      ja: '典型元素の化学は周期表の論理：族が価電子を決め、価電子がイオンを決め、イオンが化合物を決める。各族を「1つのパターン＋例外」で覚える — アルカリ金属は下ほど反応性が高く、ハロゲンは下ほど低い。2族は「Be/Mg」と「Ca/Sr/Ba」で性質が分かれる。炭素・ケイ素・窒素・リン・酸素・硫黄はそれぞれ数個の代表的な化合物をもつ。',
    },
    body: {
      en: r`> Open the periodic table (Chemistry → Key points) for element-by-element notes. This page is the **pattern** view.

## Group 1 — alkali metals (Li, Na, K)
Soft, light, silver; stored in kerosene; react with cold water → MOH + H₂ (**more violent downward**: Li < Na < K). Flame: Li red, Na yellow, K purple. Ions colourless, all salts soluble. **NaOH**: deliquescent, absorbs CO₂. **Na₂CO₃** (Solvay), **NaHCO₃** (decomposes on heating: 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂). Hydrogen sits in group 1 but is a nonmetal (H₂, from Zn + acid).

## Group 2 (Mg vs Ca, Sr, Ba)
| | Be, Mg | Ca, Sr, Ba |
|---|---|---|
| flame colour | none | Ca orange-red, Sr crimson, Ba yellow-green |
| + cold water | no (Mg: hot water) | yes → M(OH)₂ + H₂ |
| hydroxide | slightly soluble, weak base | strong base, solubility rises Ca < Ba |
| sulfate | soluble | insoluble (BaSO₄ test) |
| carbonate | insoluble | insoluble; dissolve in acid |

Ca: CaO + H₂O → Ca(OH)₂ (exothermic); lime water + CO₂ → CaCO₃ (milky) → excess → Ca(HCO₃)₂ (clear); CaCO₃ → CaO + CO₂ on heating; CaSO₄·2H₂O gypsum; CaCl₂ desiccant; CaC₂ + 2H₂O → C₂H₂.

## Group 13 — Al
Amphoteric metal (see Transition/Ion analysis); Al₂O₃ amphoteric; passivated in conc. HNO₃; thermite; Hall–Héroult; alum KAl(SO₄)₂·12H₂O.

## Group 14 — C, Si, (Sn, Pb)
- C: allotropes; CO (toxic, reducing); CO₂ (acidic oxide, dry ice sublimes, from CaCO₃ + HCl).
- Si: semiconductor; SiO₂ covalent network, dissolves only in HF and in NaOH (→ Na₂SiO₃ → water glass → silica gel).
- Sn, Pb: amphoteric metals; Sn²⁺ reducing; Pb salts mostly insoluble (PbCl₂ soluble in hot water, PbSO₄, PbS black, PbCrO₄ yellow).

## Group 15 — N, P
- N₂ inert (triple bond). **NH₃**: weak base, fountain, dried with soda lime, white smoke with HCl. NO colourless (Cu + dilute HNO₃), NO₂ brown (Cu + conc. HNO₃), 2NO₂ ⇌ N₂O₄. HNO₃ (Ostwald) oxidising; nitrates soluble.
- P: white P₄ (toxic, ignites in air, under water) vs red P (stable). P₄O₁₀ desiccant → H₃PO₄ (medium triprotic acid).

## Group 16 — O, S
- O₂ (from H₂O₂/MnO₂ or KClO₃); O₃ (oxidiser, KI–starch blue).
- S: allotropes rhombic/monoclinic/plastic. **H₂S** (rotten egg, reducer, metal sulfides). **SO₂** (reducer, bleach; oxidiser to H₂S). **H₂SO₄**: contact process; conc. = dehydrating, hygroscopic, oxidising when hot, non-volatile; dilute = strong acid. BaSO₄ test.

## Group 17 — halogens
| | F₂ | Cl₂ | Br₂ | I₂ |
|---|---|---|---|---|
| state/colour | pale yellow gas | yellow-green gas | red-brown liquid | purple-black solid (sublimes) |
| oxidising power | strongest | | | weakest |
| + H₂O | violent, gives O₂ | Cl₂ + H₂O ⇌ HCl + HClO (bleach) | slight | barely (dissolves in KI as I₃⁻) |
| HX acid | **weak** | strong | strong | strongest |
| AgX | soluble | white | pale yellow | yellow |

Displacement: Cl₂ + 2Br⁻ → Br₂ + 2Cl⁻ (upper displaces lower). Cl₂ prep: MnO₂ + conc. HCl → wash with water then conc. H₂SO₄ → downward delivery. I₂–starch blue.

## Group 18 — noble gases
Monatomic, valence 0, unreactive; He balloons, Ne signs, Ar (0.93% of air) in bulbs and welding.`,
      ja: r`> 元素ごとの詳しい内容は周期表（化学 → 要点ノート）を開く。このページは**パターン**をまとめる。

## 1族 — アルカリ金属（Li, Na, K）
軟らかく軽く銀白色。石油中に保存。冷水と反応 → MOH + H₂（**下ほど激しい**：Li < Na < K）。炎色：Li 赤、Na 黄、K 赤紫。イオンは無色、塩はすべて水に溶ける。**NaOH**：潮解性、CO₂ を吸収。**Na₂CO₃**（アンモニアソーダ法）、**NaHCO₃**（加熱で分解：2NaHCO₃ → Na₂CO₃ + H₂O + CO₂）。水素は1族だが非金属（H₂ は Zn ＋ 酸から）。

## 2族（Mg と Ca・Sr・Ba）
| | Be, Mg | Ca, Sr, Ba |
|---|---|---|
| 炎色反応 | なし | Ca 橙赤、Sr 紅、Ba 黄緑 |
| ＋冷水 | 反応しない（Mg は熱水） | 反応 → M(OH)₂ + H₂ |
| 水酸化物 | 溶けにくい、弱塩基 | 強塩基、溶解度は Ca < Ba |
| 硫酸塩 | 溶ける | 溶けない（BaSO₄ の検出） |
| 炭酸塩 | 溶けない | 溶けない。酸には溶ける |

Ca：CaO + H₂O → Ca(OH)₂（発熱）。石灰水 ＋ CO₂ → CaCO₃（白濁）→ 過剰 → Ca(HCO₃)₂（透明）。CaCO₃ → CaO + CO₂（加熱）。CaSO₄·2H₂O セッコウ。CaCl₂ 乾燥剤。CaC₂ + 2H₂O → C₂H₂。

## 13族 — Al
両性金属（遷移元素・イオン分析参照）。Al₂O₃ は両性。濃硝酸で不動態。テルミット。ホール・エルー法。ミョウバン KAl(SO₄)₂·12H₂O。

## 14族 — C、Si（Sn、Pb）
- C：同素体。CO（有毒、還元剤）。CO₂（酸性酸化物、ドライアイスは昇華、CaCO₃ ＋ HCl から）。
- Si：半導体。SiO₂ は共有結合の結晶で HF と NaOH にだけ溶ける（→ Na₂SiO₃ → 水ガラス → シリカゲル）。
- Sn、Pb：両性金属。Sn²⁺ は還元剤。Pb の塩はほとんど不溶（PbCl₂ は熱水に溶ける、PbSO₄、PbS 黒、PbCrO₄ 黄）。

## 15族 — N、P
- N₂ は不活性（三重結合）。**NH₃**：弱塩基、噴水、ソーダ石灰で乾燥、HCl と白煙。NO 無色（Cu ＋ 希硝酸）、NO₂ 褐色（Cu ＋ 濃硝酸）、2NO₂ ⇌ N₂O₄。HNO₃（オストワルト法）は酸化剤。硝酸塩は溶ける。
- P：黄リン P₄（有毒、空気中で発火、水中保存）と赤リン（安定）。P₄O₁₀ は乾燥剤 → H₃PO₄（中程度の三価の酸）。

## 16族 — O、S
- O₂（H₂O₂/MnO₂ または KClO₃ から）。O₃（酸化剤、ヨウ化カリウムデンプン紙を青に）。
- S：同素体 斜方・単斜・ゴム状。**H₂S**（腐卵臭、還元剤、金属硫化物）。**SO₂**（還元剤、漂白。H₂S に対しては酸化剤）。**H₂SO₄**：接触法。濃硫酸 = 脱水・吸湿・熱すると酸化作用・不揮発性。希硫酸 = 強酸。BaSO₄ の検出。

## 17族 — ハロゲン
| | F₂ | Cl₂ | Br₂ | I₂ |
|---|---|---|---|---|
| 状態・色 | 淡黄色の気体 | 黄緑色の気体 | 赤褐色の液体 | 黒紫色の固体（昇華） |
| 酸化力 | 最強 | | | 最弱 |
| ＋H₂O | 激しく反応し O₂ | Cl₂ + H₂O ⇌ HCl + HClO（漂白） | わずか | ほとんど溶けない（KI に I₃⁻ として溶ける） |
| HX の酸性 | **弱酸** | 強酸 | 強酸 | 最強 |
| AgX | 溶ける | 白 | 淡黄 | 黄 |

置換：Cl₂ + 2Br⁻ → Br₂ + 2Cl⁻（上が下を追い出す）。Cl₂ の製法：MnO₂ ＋ 濃塩酸 → 水、次に濃硫酸を通す → 下方置換。I₂ とデンプンで青紫。

## 18族 — 貴ガス
単原子分子、価電子0、反応しない。He 気球、Ne サイン、Ar（空気の 0.93%）は電球・溶接。`,
    },
    exam: {
      en: ['True/false statements about a group: group 2 flame colours and solubilities; halogen acidity and reactivity; properties of P allotropes or SO₂ (most years).', 'Which compound fits a description (deliquescent, sublimes, turns lime water milky, bleaches).', 'Order of reactivity / oxidising power within a group.'],
      ja: ['族についての正誤：2族の炎色と溶解性、ハロゲンの酸性と反応性、リンの同素体や SO₂ の性質（ほぼ毎年）。', '記述に合う化合物（潮解性、昇華、石灰水を白濁、漂白）。', '族内での反応性・酸化力の順。'],
    },
    traps: {
      en: ['Mg has **no** flame colour and its sulfate is **soluble**; Ba is the reverse.', 'HF is the **weakest** hydrohalic acid though F₂ is the strongest oxidiser.', 'NaHCO₃ solution is weakly basic; NaHSO₄ solution is acidic — "acid salt" is a naming term.'],
      ja: ['Mg は炎色反応**なし**で硫酸塩は**溶ける**。Ba は逆。', 'F₂ は最強の酸化剤だが HF はハロゲン化水素酸の中で**最も弱い**。', 'NaHCO₃ 水溶液は弱塩基性、NaHSO₄ 水溶液は酸性 —「酸性塩」は命名上の用語。'],
    },
    followups: {
      en: ['Why do alkali metals get more reactive down the group while halogens get less?', 'Why does Mg behave differently from Ca in water and flame tests?', 'Give me a true/false quiz on group 2 and group 17.', 'Explain the lime-water reaction and why it clears with excess CO₂.'],
      ja: ['アルカリ金属は下ほど反応性が高く、ハロゲンは低いのはなぜ？', 'Mg が水や炎色反応で Ca と違うふるまいをするのはなぜ？', '2族と17族の正誤クイズを出して。', '石灰水の反応と、過剰の CO₂ で透明になる理由を説明して。'],
    },
  },
  {
    id: 'transition-elements',
    core: {
      en: 'Transition metals (groups 3–11) share traits: hard, dense, high-melting, several oxidation states, coloured ions, catalysts, complex-ion formers. The EJU tests seven — Cr, Mn, Fe, Cu, Zn, Ag, Hg — mostly through colours, precipitates, what dissolves in which acid, and the complex ions that form with excess NH₃ or NaOH.',
      ja: '遷移元素（3〜11族）の共通点：硬く、密度が大きく、融点が高く、複数の酸化数、有色イオン、触媒、錯イオンをつくる。EJUが問うのは7つ — Cr、Mn、Fe、Cu、Zn、Ag、Hg — 主に色、沈殿、どの酸に溶けるか、過剰の NH₃ や NaOH でできる錯イオン。',
    },
    body: {
      en: r`## General properties
Valence electrons usually 1–2 (so neighbours across a row are alike); metallic; many oxidation states (Fe²⁺/Fe³⁺, Cu⁺/Cu²⁺, Mn +2/+4/+7, Cr +3/+6); ions and compounds often coloured; good catalysts (Fe, V₂O₅, Pt, Ni, MnO₂). Group 12 (Zn, Cd, Hg) is **typical** in the Japanese curriculum: Zn²⁺ is colourless, one oxidation state.

## The seven metals at a glance
| metal | key ions & colours | signature reactions |
|---|---|---|
| **Cr** | Cr³⁺ green; CrO₄²⁻ yellow ⇌ Cr₂O₇²⁻ orange (acid) | K₂Cr₂O₇ oxidiser → Cr³⁺; PbCrO₄, BaCrO₄ yellow, Ag₂CrO₄ red-brown; Cr(OH)₃ amphoteric; stainless steel |
| **Mn** | Mn²⁺ pale pink; MnO₄⁻ purple | KMnO₄ oxidiser (acid → Mn²⁺; neutral → MnO₂ brown); MnO₂ catalyst for O₂, oxidiser for Cl₂ |
| **Fe** | Fe²⁺ pale green; Fe³⁺ yellow-brown | Fe²⁺ + K₃[Fe(CN)₆] / Fe³⁺ + K₄[Fe(CN)₆] → dark blue; Fe³⁺ + SCN⁻ blood-red; Fe(OH)₂ green-white → Fe(OH)₃ red-brown; passivated by conc. HNO₃; blast furnace |
| **Cu** | Cu²⁺ blue; [Cu(NH₃)₄]²⁺ deep blue; Cu₂O red; CuO black | no H₂ with HCl; dissolves in HNO₃ (NO/NO₂), hot conc. H₂SO₄ (SO₂); Cu(OH)₂ blue → CuO on heating; CuS black; CuSO₄·5H₂O blue ⇌ anhydrous white; electrolytic refining |
| **Zn** | Zn²⁺ colourless; [Zn(OH)₄]²⁻; [Zn(NH₃)₄]²⁺ | amphoteric (acid and NaOH → H₂); ZnS white; galvanising; Daniell/dry cell anode |
| **Ag** | Ag⁺ colourless; [Ag(NH₃)₂]⁺ | AgCl white (dissolves in NH₃), AgBr pale yellow, AgI yellow; Ag₂O brown; photosensitive; silver mirror; best conductor; dissolves in HNO₃ only |
| **Hg** | Hg²⁺, Hg₂²⁺ | only liquid metal; amalgams; HgS red; toxic; between Cu and Ag in the series |

## Complex ions (錯イオン)
A central metal ion + ligands (molecules/ions with lone pairs: NH₃, H₂O, OH⁻, CN⁻, Cl⁻) bonded by **coordinate bonds**. Coordination number and shape:
| complex | number | shape | colour |
|---|---|---|---|
| [Ag(NH₃)₂]⁺ | 2 | linear | colourless |
| [Cu(NH₃)₄]²⁺ | 4 | square planar | deep blue |
| [Zn(NH₃)₄]²⁺, [Zn(OH)₄]²⁻ | 4 | tetrahedral | colourless |
| [Fe(CN)₆]⁴⁻, [Fe(CN)₆]³⁻ | 6 | octahedral | yellow / red-yellow |
| [Al(OH)₄]⁻ | 4 | tetrahedral | colourless |

Rule of thumb: **excess NH₃ dissolves** the hydroxides of Cu, Zn, Ag (and Ni, Co); **excess NaOH dissolves** the hydroxides of the amphoteric metals Al, Zn, Sn, Pb (and Cr). Fe(OH)₃ dissolves in neither.

## Dissolution clues (the "which metal?" question)
- Dissolves in dilute HCl with H₂: above H (Zn, Fe, Al, Mg…).
- Does not, but dissolves in HNO₃: Cu, Ag, Hg.
- Passivated by conc. HNO₃: Al, Fe, Ni.
- Only aqua regia: Pt, Au.
- Reacts with NaOH as well: Al, Zn, Sn, Pb.

## Alloys and materials
Stainless steel (Fe–Cr–Ni), brass (Cu–Zn), bronze (Cu–Sn), duralumin (Al–Cu–Mg), nichrome (Ni–Cr, heaters), solder (Sn–Pb). Ti (light, strong, TiO₂ photocatalyst), W (highest m.p., filaments), Pt (catalyst, electrodes).`,
      ja: r`## 一般的な性質
価電子はふつう1〜2個（だから横に並んだ元素が似る）。すべて金属。複数の酸化数（Fe²⁺/Fe³⁺、Cu⁺/Cu²⁺、Mn +2/+4/+7、Cr +3/+6）。イオンや化合物は有色が多い。触媒になりやすい（Fe、V₂O₅、Pt、Ni、MnO₂）。12族（Zn、Cd、Hg）は日本の課程では**典型元素**：Zn²⁺ は無色で酸化数は1つ。

## 7つの金属をひと目で
| 金属 | 主なイオンと色 | 代表的な反応 |
|---|---|---|
| **Cr** | Cr³⁺ 緑。CrO₄²⁻ 黄 ⇌ Cr₂O₇²⁻ 橙赤（酸性） | K₂Cr₂O₇ 酸化剤 → Cr³⁺。PbCrO₄・BaCrO₄ 黄、Ag₂CrO₄ 赤褐。Cr(OH)₃ 両性。ステンレス |
| **Mn** | Mn²⁺ 淡赤。MnO₄⁻ 赤紫 | KMnO₄ 酸化剤（酸性 → Mn²⁺、中性 → MnO₂ 褐色）。MnO₂ は O₂ の触媒、Cl₂ の酸化剤 |
| **Fe** | Fe²⁺ 淡緑。Fe³⁺ 黄褐 | Fe²⁺ + K₃[Fe(CN)₆]／Fe³⁺ + K₄[Fe(CN)₆] → 濃青。Fe³⁺ + SCN⁻ 血赤。Fe(OH)₂ 緑白 → Fe(OH)₃ 赤褐。濃硝酸で不動態。溶鉱炉 |
| **Cu** | Cu²⁺ 青。[Cu(NH₃)₄]²⁺ 深青。Cu₂O 赤。CuO 黒 | HCl とは H₂ を出さない。HNO₃（NO/NO₂）、熱濃硫酸（SO₂）に溶ける。Cu(OH)₂ 青白 → 加熱で CuO。CuS 黒。CuSO₄·5H₂O 青 ⇌ 無水物 白。電解精錬 |
| **Zn** | Zn²⁺ 無色。[Zn(OH)₄]²⁻、[Zn(NH₃)₄]²⁺ | 両性（酸にも NaOH にも → H₂）。ZnS 白。トタン。ダニエル電池・乾電池の負極 |
| **Ag** | Ag⁺ 無色。[Ag(NH₃)₂]⁺ | AgCl 白（NH₃ に溶ける）、AgBr 淡黄、AgI 黄。Ag₂O 褐。感光性。銀鏡反応。最良の導体。HNO₃ にのみ溶ける |
| **Hg** | Hg²⁺、Hg₂²⁺ | 唯一の液体金属。アマルガム。HgS 赤。有毒。イオン化傾向は Cu と Ag の間 |

## 錯イオン
中心の金属イオン ＋ 配位子（非共有電子対をもつ分子・イオン：NH₃、H₂O、OH⁻、CN⁻、Cl⁻）が**配位結合**で結びついたもの。配位数と形：
| 錯イオン | 配位数 | 形 | 色 |
|---|---|---|---|
| [Ag(NH₃)₂]⁺ | 2 | 直線 | 無色 |
| [Cu(NH₃)₄]²⁺ | 4 | 正方形 | 深青 |
| [Zn(NH₃)₄]²⁺、[Zn(OH)₄]²⁻ | 4 | 正四面体 | 無色 |
| [Fe(CN)₆]⁴⁻、[Fe(CN)₆]³⁻ | 6 | 正八面体 | 黄／赤黄 |
| [Al(OH)₄]⁻ | 4 | 正四面体 | 無色 |

目安：**過剰の NH₃ に溶ける**のは Cu、Zn、Ag（と Ni、Co）の水酸化物。**過剰の NaOH に溶ける**のは両性金属 Al、Zn、Sn、Pb（と Cr）の水酸化物。Fe(OH)₃ はどちらにも溶けない。

## 溶け方のヒント（「どの金属？」問題）
- 希塩酸に H₂ を出して溶ける：H より上（Zn、Fe、Al、Mg…）。
- 溶けないが HNO₃ に溶ける：Cu、Ag、Hg。
- 濃硝酸で不動態：Al、Fe、Ni。
- 王水のみ：Pt、Au。
- NaOH とも反応：Al、Zn、Sn、Pb。

## 合金と材料
ステンレス鋼（Fe–Cr–Ni）、黄銅（Cu–Zn）、青銅（Cu–Sn）、ジュラルミン（Al–Cu–Mg）、ニクロム（Ni–Cr、電熱線）、はんだ（Sn–Pb）。Ti（軽く強い、TiO₂ 光触媒）、W（最高融点、フィラメント）、Pt（触媒、電極）。`,
    },
    exam: {
      en: ['True/false about Cu / Fe / Ag / Zn compounds and colours; which metal matches dissolution clues (most years).', 'Which displacement reaction occurs (Zn + Cu²⁺ yes; Cu + Zn²⁺ no; Cu + 2Ag⁺ yes).', 'Which hydroxide dissolves in excess NH₃ / excess NaOH; the shape or coordination number of a complex ion.'],
      ja: ['Cu・Fe・Ag・Zn の化合物と色の正誤、溶け方のヒントに合う金属（ほぼ毎年）。', '起こる置換反応はどれか（Zn + Cu²⁺ は起こる、Cu + Zn²⁺ は起こらない、Cu + 2Ag⁺ は起こる）。', '過剰の NH₃／NaOH に溶ける水酸化物はどれか、錯イオンの形や配位数。'],
    },
    traps: {
      en: ['Al(OH)₃ dissolves in excess NaOH but **not** in excess NH₃; Cu(OH)₂ dissolves in NH₃ but **not** in NaOH; Zn(OH)₂ dissolves in **both**.', 'Fe²⁺ solutions are pale green and oxidise in air to Fe³⁺; the test reagents are the "opposite" ferricyanide/ferrocyanide.', 'Ag₂O, not AgOH, precipitates with NaOH.'],
      ja: ['Al(OH)₃ は過剰の NaOH に溶けるが NH₃ には溶け**ない**。Cu(OH)₂ は NH₃ に溶けるが NaOH には溶け**ない**。Zn(OH)₂ は**両方**に溶ける。', 'Fe²⁺ 水溶液は淡緑色で空気中で Fe³⁺ に酸化される。検出試薬は「逆の」ヘキサシアノ鉄(III)／(II)酸カリウム。', 'NaOH で沈殿するのは AgOH ではなく Ag₂O。'],
    },
    followups: {
      en: ['Why are transition-metal ions coloured but Zn²⁺ is not?', 'Make me a colour flash-quiz for Cu, Fe, Cr, Mn compounds.', 'Explain why Cu does not react with HCl but does with HNO₃.', 'Which hydroxides dissolve in excess NH₃ and why?'],
      ja: ['遷移元素のイオンは有色なのに Zn²⁺ が無色なのはなぜ？', 'Cu・Fe・Cr・Mn の化合物の色のフラッシュクイズを出して。', 'Cu が HCl とは反応せず HNO₃ とは反応する理由を説明して。', '過剰の NH₃ に溶ける水酸化物はどれで、なぜ？'],
    },
  },
  {
    id: 'gas-prep-industry',
    core: {
      en: 'Every lab gas preparation is "reagent + reagent → gas", followed by two decisions: which drying agent will not react with the gas, and which collection method matches its solubility and density. Industrial processes are the same chemistry scaled up, each with one catalyst or trick to remember.',
      ja: '気体の実験室的製法はすべて「試薬＋試薬 → 気体」のあとに2つの判断：その気体と反応しない乾燥剤はどれか、溶解性と密度に合う捕集法はどれか。工業的製法は同じ化学を大規模にしたもので、それぞれ触媒か工夫を1つ覚える。',
    },
    body: {
      en: r`## Lab preparations
| gas | reagents | notes |
|---|---|---|
| H₂ | Zn + dilute H₂SO₄ / HCl | Kipp's apparatus |
| O₂ | H₂O₂ + MnO₂ (catalyst); KClO₃ + MnO₂, heat | |
| Cl₂ | MnO₂ + conc. HCl, heat; bleaching powder + HCl | pass through **water** (removes HCl) then **conc. H₂SO₄** (dries) — that order |
| HCl | NaCl + conc. H₂SO₄, heat | white smoke with NH₃ |
| NH₃ | NH₄Cl + Ca(OH)₂, heat | dry with **soda lime**; test tube mouth tilted **down** (water forms) |
| CO₂ | CaCO₃ + dilute HCl | Kipp's; not with H₂SO₄ (insoluble CaSO₄ coats the marble) |
| SO₂ | Cu + hot conc. H₂SO₄; NaHSO₃ + H₂SO₄ | |
| H₂S | FeS + dilute H₂SO₄ / HCl | Kipp's |
| NO | Cu + dilute HNO₃ | colourless; collect over water |
| NO₂ | Cu + conc. HNO₃ | brown; downward delivery |
| N₂ | NH₄NO₂ solution, heat | |
| C₂H₂ | CaC₂ + H₂O | |
| CO | HCOOH + conc. H₂SO₄ (dehydration) | |

**Kipp's apparatus**: solid + liquid, no heating, gas on demand (H₂, CO₂, H₂S).

## Drying agents (never pair with a gas it reacts with)
| drying agent | type | cannot dry |
|---|---|---|
| conc. H₂SO₄ | acidic | NH₃ (base), H₂S (oxidised) |
| P₄O₁₀ | acidic | NH₃ |
| CaCl₂ | neutral | NH₃ (forms an adduct) |
| **soda lime** (NaOH + CaO) | basic | acidic gases: Cl₂, HCl, CO₂, SO₂, H₂S, NO₂ |

## Collection
| method | for gases that are | examples |
|---|---|---|
| **water displacement** | insoluble in water | H₂, O₂, N₂, NO, CO, CH₄, C₂H₄ |
| **upward delivery** (mouth down) | soluble and lighter than air | NH₃ (only common one) |
| **downward delivery** (mouth up) | soluble and heavier than air | Cl₂, HCl, CO₂, SO₂, H₂S, NO₂ |
Heavier than air = molar mass > 29.

## Industrial processes (one line each)
| product | process | key point |
|---|---|---|
| **NH₃** | Haber–Bosch: N₂ + 3H₂ ⇌ 2NH₃ | Fe catalyst, ~500 °C, high pressure |
| **HNO₃** | Ostwald: NH₃ → NO (Pt, 800 °C) → NO₂ → HNO₃ (+ H₂O) | overall NH₃ + 2O₂ → HNO₃ + H₂O |
| **H₂SO₄** | Contact: S → SO₂ → SO₃ (**V₂O₅**) → absorbed in conc. H₂SO₄ (oleum) → diluted | SO₃ is not added to water directly (mist) |
| **NaOH, Cl₂, H₂** | ion-exchange membrane electrolysis of NaCl(aq) | Na⁺ crosses the membrane; NaOH forms at the cathode |
| **Na₂CO₃** | Solvay (ammonia–soda): NaCl + NH₃ + CO₂ + H₂O → NaHCO₃ + NH₄Cl; heat → Na₂CO₃ | NH₃ recovered from NH₄Cl with Ca(OH)₂; net: 2NaCl + CaCO₃ → Na₂CO₃ + CaCl₂ |
| **Al** | Bayer (bauxite → Al₂O₃) then Hall–Héroult molten electrolysis with cryolite | cannot use aqueous solution |
| **Fe** | blast furnace: Fe₂O₃ + 3CO → 2Fe + 3CO₂ | coke → CO; limestone → slag; pig iron → converter → steel |
| **Cu** | roast sulfide ore → crude Cu → electrolytic refining | anode mud Ag, Au |
| **Si** | SiO₂ + 2C → Si + 2CO (electric furnace) | then purified for semiconductors |`,
      ja: r`## 実験室的製法
| 気体 | 試薬 | 備考 |
|---|---|---|
| H₂ | Zn ＋ 希硫酸／希塩酸 | キップの装置 |
| O₂ | H₂O₂ ＋ MnO₂（触媒）。KClO₃ ＋ MnO₂、加熱 | |
| Cl₂ | MnO₂ ＋ 濃塩酸、加熱。さらし粉 ＋ HCl | **水**（HCl を除く）→ **濃硫酸**（乾燥）の順に通す |
| HCl | NaCl ＋ 濃硫酸、加熱 | NH₃ と白煙 |
| NH₃ | NH₄Cl ＋ Ca(OH)₂、加熱 | **ソーダ石灰**で乾燥。試験管の口を**下げる**（水が生じる） |
| CO₂ | CaCO₃ ＋ 希塩酸 | キップの装置。H₂SO₄ は不可（不溶性の CaSO₄ が表面をおおう） |
| SO₂ | Cu ＋ 熱濃硫酸。NaHSO₃ ＋ H₂SO₄ | |
| H₂S | FeS ＋ 希硫酸／希塩酸 | キップの装置 |
| NO | Cu ＋ 希硝酸 | 無色。水上置換 |
| NO₂ | Cu ＋ 濃硝酸 | 褐色。下方置換 |
| N₂ | NH₄NO₂ 水溶液、加熱 | |
| C₂H₂ | CaC₂ ＋ H₂O | |
| CO | HCOOH ＋ 濃硫酸（脱水） | |

**キップの装置**：固体＋液体、加熱なし、必要なときに発生（H₂、CO₂、H₂S）。

## 乾燥剤（反応する気体と組み合わせない）
| 乾燥剤 | 性質 | 乾燥できない気体 |
|---|---|---|
| 濃硫酸 | 酸性 | NH₃（塩基）、H₂S（酸化される） |
| P₄O₁₀ | 酸性 | NH₃ |
| CaCl₂ | 中性 | NH₃（付加物をつくる） |
| **ソーダ石灰**（NaOH ＋ CaO） | 塩基性 | 酸性の気体：Cl₂、HCl、CO₂、SO₂、H₂S、NO₂ |

## 捕集法
| 方法 | 対象の気体 | 例 |
|---|---|---|
| **水上置換** | 水に溶けにくい | H₂、O₂、N₂、NO、CO、CH₄、C₂H₄ |
| **上方置換**（口を下） | 水に溶け、空気より軽い | NH₃（代表はこれだけ） |
| **下方置換**（口を上） | 水に溶け、空気より重い | Cl₂、HCl、CO₂、SO₂、H₂S、NO₂ |
空気より重い = モル質量 > 29。

## 工業的製法（1行ずつ）
| 製品 | 方法 | ポイント |
|---|---|---|
| **NH₃** | ハーバー・ボッシュ法：N₂ + 3H₂ ⇌ 2NH₃ | Fe 触媒、約 500 ℃、高圧 |
| **HNO₃** | オストワルト法：NH₃ → NO（Pt、800 ℃）→ NO₂ → HNO₃（＋H₂O） | 全体 NH₃ + 2O₂ → HNO₃ + H₂O |
| **H₂SO₄** | 接触法：S → SO₂ → SO₃（**V₂O₅**）→ 濃硫酸に吸収（発煙硫酸）→ 希釈 | SO₃ を直接水に入れない（霧になる） |
| **NaOH、Cl₂、H₂** | NaCl 水溶液のイオン交換膜法電解 | Na⁺ が膜を通り、陰極側で NaOH |
| **Na₂CO₃** | アンモニアソーダ法：NaCl + NH₃ + CO₂ + H₂O → NaHCO₃ + NH₄Cl。加熱 → Na₂CO₃ | NH₄Cl から Ca(OH)₂ で NH₃ を回収。全体 2NaCl + CaCO₃ → Na₂CO₃ + CaCl₂ |
| **Al** | バイヤー法（ボーキサイト → Al₂O₃）→ 氷晶石を加えて溶融塩電解（ホール・エルー法） | 水溶液は使えない |
| **Fe** | 溶鉱炉：Fe₂O₃ + 3CO → 2Fe + 3CO₂ | コークス → CO。石灰石 → スラグ。銑鉄 → 転炉 → 鋼 |
| **Cu** | 硫化鉱を焼く → 粗銅 → 電解精錬 | 陽極泥に Ag、Au |
| **Si** | SiO₂ + 2C → Si + 2CO（電気炉） | その後半導体用に精製 |`,
    },
    exam: {
      en: ['Which drying agent / collection method is wrong for a given gas (NH₃ with CaCl₂ or conc. H₂SO₄; Cl₂ by water displacement).', 'Order of the wash bottles in Cl₂ preparation; why the NH₃ test tube points down.', 'Match industrial products to processes and catalysts (Fe, Pt, V₂O₅); the net equation of the Solvay process.'],
      ja: ['ある気体に対して誤った乾燥剤・捕集法（NH₃ に CaCl₂ や濃硫酸、Cl₂ を水上置換）。', 'Cl₂ 製法の洗気びんの順、NH₃ の試験管の口を下げる理由。', '工業製品と製法・触媒（Fe、Pt、V₂O₅）の対応、アンモニアソーダ法の全体の式。'],
    },
    traps: {
      en: ['NH₃ is the only common gas collected by upward delivery and the only one dried with soda lime; **never** with CaCl₂ or acids.', 'Cl₂: water first, then conc. H₂SO₄ — reversed order re-wets the gas.', 'CaCO₃ + H₂SO₄ stops quickly (CaSO₄ coating); use HCl for CO₂.'],
      ja: ['NH₃ は上方置換で集める唯一の代表的な気体で、ソーダ石灰で乾燥する唯一のもの。CaCl₂ や酸性乾燥剤は**絶対**不可。', 'Cl₂：水 → 濃硫酸の順。逆だと気体が再び湿る。', 'CaCO₃ ＋ H₂SO₄ はすぐ止まる（CaSO₄ の被膜）。CO₂ には HCl を使う。'],
    },
    followups: {
      en: ['Why is Cl₂ passed through water before conc. H₂SO₄?', 'Walk me through the Solvay process and its net equation.', 'Make a quiz: gas → drying agent → collection method.', 'Why cannot aluminium be made by electrolysing an aqueous solution?'],
      ja: ['Cl₂ を濃硫酸の前に水に通すのはなぜ？', 'アンモニアソーダ法と全体の式を順に説明して。', '気体 → 乾燥剤 → 捕集法のクイズを出して。', 'アルミニウムを水溶液の電解でつくれないのはなぜ？'],
    },
  },
  {
    id: 'ion-analysis',
    core: {
      en: 'Metal ions are told apart by what makes them precipitate: HCl catches Ag⁺ and Pb²⁺, H₂S in acid catches Cu²⁺ (and Pb²⁺, Cd²⁺), NH₃ catches Fe³⁺ and Al³⁺ as hydroxides, H₂S in base catches Zn²⁺ (and Ni²⁺, Mn²⁺), carbonate catches Ca²⁺ and Ba²⁺, and Na⁺/K⁺ never precipitate — use the flame. The colours of the precipitates and what redissolves them (excess NH₃, excess NaOH) finish the identification.',
      ja: '金属イオンは何で沈殿するかで見分ける：HCl は Ag⁺ と Pb²⁺、酸性の H₂S は Cu²⁺（と Pb²⁺、Cd²⁺）、NH₃ は Fe³⁺ と Al³⁺ を水酸化物として、塩基性の H₂S は Zn²⁺（と Ni²⁺、Mn²⁺）、炭酸塩は Ca²⁺ と Ba²⁺。Na⁺/K⁺ は沈殿せず炎色反応で判定。沈殿の色と、何で再び溶けるか（過剰の NH₃、過剰の NaOH）で特定が完成する。',
    },
    body: {
      en: r`## The systematic separation (系統分析)
Add reagents in this order; each step removes a group as a precipitate; the filtrate goes on.

| step | reagent | precipitates (colour) | why these |
|---|---|---|---|
| 1 | dilute **HCl** | AgCl white, PbCl₂ white | insoluble chlorides (PbCl₂ dissolves in hot water; AgCl in NH₃) |
| 2 | **H₂S** in acid | CuS black, PbS black, CdS yellow, (HgS black, SnS) | sulfides so insoluble they form even at low S²⁻ |
| 3 | boil off H₂S, add HNO₃ (Fe²⁺ → Fe³⁺), then **NH₃ + NH₄Cl** | Fe(OH)₃ red-brown, Al(OH)₃ white, Cr(OH)₃ green-grey | hydroxides of +3 ions precipitate at mild pH |
| 4 | **H₂S** in base (NH₃) | ZnS white, NiS black, MnS pale pink | need high S²⁻ |
| 5 | **(NH₄)₂CO₃** | CaCO₃, BaCO₃, SrCO₃ white | carbonates of group 2 |
| 6 | filtrate | Na⁺, K⁺, Mg²⁺ | flame test (Na yellow, K purple) |

Why H₂S twice: in acid $[\mathrm{S^{2-}}]$ is tiny (H₂S ⇌ 2H⁺ + S²⁻ pushed left), so only the least soluble sulfides form; adding NH₃ raises $[\mathrm{S^{2-}}]$ and the rest follow.

## Single-reagent reactions you must know
**NaOH** (a little → precipitate; excess → ?)
| ion | little NaOH | excess NaOH |
|---|---|---|
| Al³⁺ | Al(OH)₃ white | dissolves → [Al(OH)₄]⁻ |
| Zn²⁺ | Zn(OH)₂ white | dissolves → [Zn(OH)₄]²⁻ |
| Pb²⁺, Sn²⁺ | white | dissolves (amphoteric) |
| Cu²⁺ | Cu(OH)₂ blue | stays |
| Fe³⁺ | Fe(OH)₃ red-brown | stays |
| Fe²⁺ | Fe(OH)₂ green-white | stays |
| Ag⁺ | Ag₂O brown | stays |
| Mg²⁺ | Mg(OH)₂ white | stays |

**NH₃ water** (a little → same hydroxides; excess → ?)
| ion | excess NH₃ |
|---|---|
| Cu²⁺ | dissolves → [Cu(NH₃)₄]²⁺ deep blue |
| Zn²⁺ | dissolves → [Zn(NH₃)₄]²⁺ colourless |
| Ag⁺ | dissolves → [Ag(NH₃)₂]⁺ |
| Al³⁺, Fe³⁺, Pb²⁺, Mg²⁺ | precipitate **stays** |

So: **Al vs Zn** — both dissolve in NaOH, only Zn in NH₃. **Cu vs Fe³⁺** — Cu dissolves in NH₃, Fe never dissolves.

## Other spot tests
- Cl⁻: AgCl white (soluble in NH₃). Br⁻: AgBr pale yellow. I⁻: AgI yellow (insoluble in NH₃).
- SO₄²⁻: BaSO₄ white, insoluble in acid. CO₃²⁻: BaCO₃ white but dissolves in acid with CO₂ fizzing.
- CrO₄²⁻: BaCrO₄, PbCrO₄ yellow; Ag₂CrO₄ red-brown.
- Fe²⁺ / Fe³⁺: hexacyanoferrate dark blue; Fe³⁺ + SCN⁻ blood-red.
- Na⁺, K⁺, Ca²⁺, Sr²⁺, Ba²⁺, Cu²⁺: flame colours.

## Solution colours (clues before any reagent)
Cu²⁺ blue, Fe²⁺ pale green, Fe³⁺ yellow-brown, Ni²⁺ green, Cr³⁺ green, MnO₄⁻ purple, Cr₂O₇²⁻ orange; Zn²⁺, Al³⁺, Ag⁺, Pb²⁺, Ca²⁺, Ba²⁺, Na⁺, K⁺ colourless.`,
      ja: r`## 系統分析
この順に試薬を加える。各段階で1つの群が沈殿し、ろ液を次へ回す。

| 段階 | 試薬 | 沈殿（色） | 理由 |
|---|---|---|---|
| 1 | 希**塩酸** | AgCl 白、PbCl₂ 白 | 不溶性の塩化物（PbCl₂ は熱水に、AgCl は NH₃ に溶ける） |
| 2 | 酸性で **H₂S** | CuS 黒、PbS 黒、CdS 黄（HgS 黒、SnS） | 極めて溶けにくく S²⁻ が少なくても沈殿 |
| 3 | H₂S を煮沸で除き、HNO₃（Fe²⁺ → Fe³⁺）、**NH₃ ＋ NH₄Cl** | Fe(OH)₃ 赤褐、Al(OH)₃ 白、Cr(OH)₃ 灰緑 | +3 のイオンの水酸化物は弱塩基性で沈殿 |
| 4 | 塩基性（NH₃）で **H₂S** | ZnS 白、NiS 黒、MnS 淡赤 | S²⁻ が多く必要 |
| 5 | **(NH₄)₂CO₃** | CaCO₃、BaCO₃、SrCO₃ 白 | 2族の炭酸塩 |
| 6 | ろ液 | Na⁺、K⁺、Mg²⁺ | 炎色反応（Na 黄、K 赤紫） |

H₂S を2回使う理由：酸性では $[\mathrm{S^{2-}}]$ が極めて小さく（H₂S ⇌ 2H⁺ + S²⁻ が左に偏る）、最も溶けにくい硫化物だけが沈殿。NH₃ で $[\mathrm{S^{2-}}]$ を増やすと残りが沈殿。

## 覚えるべき単一試薬の反応
**NaOH**（少量 → 沈殿。過剰 → ？）
| イオン | 少量の NaOH | 過剰の NaOH |
|---|---|---|
| Al³⁺ | Al(OH)₃ 白 | 溶ける → [Al(OH)₄]⁻ |
| Zn²⁺ | Zn(OH)₂ 白 | 溶ける → [Zn(OH)₄]²⁻ |
| Pb²⁺、Sn²⁺ | 白 | 溶ける（両性） |
| Cu²⁺ | Cu(OH)₂ 青白 | 残る |
| Fe³⁺ | Fe(OH)₃ 赤褐 | 残る |
| Fe²⁺ | Fe(OH)₂ 緑白 | 残る |
| Ag⁺ | Ag₂O 褐 | 残る |
| Mg²⁺ | Mg(OH)₂ 白 | 残る |

**アンモニア水**（少量 → 同じ水酸化物。過剰 → ？）
| イオン | 過剰の NH₃ |
|---|---|
| Cu²⁺ | 溶ける → [Cu(NH₃)₄]²⁺ 深青 |
| Zn²⁺ | 溶ける → [Zn(NH₃)₄]²⁺ 無色 |
| Ag⁺ | 溶ける → [Ag(NH₃)₂]⁺ |
| Al³⁺、Fe³⁺、Pb²⁺、Mg²⁺ | 沈殿は**残る** |

つまり **Al と Zn** — 両方 NaOH に溶けるが NH₃ に溶けるのは Zn だけ。**Cu と Fe³⁺** — Cu は NH₃ に溶け、Fe はどちらにも溶けない。

## その他の検出
- Cl⁻：AgCl 白（NH₃ に溶ける）。Br⁻：AgBr 淡黄。I⁻：AgI 黄（NH₃ に溶けない）。
- SO₄²⁻：BaSO₄ 白、酸に溶けない。CO₃²⁻：BaCO₃ 白だが酸に CO₂ を出して溶ける。
- CrO₄²⁻：BaCrO₄、PbCrO₄ 黄。Ag₂CrO₄ 赤褐。
- Fe²⁺／Fe³⁺：ヘキサシアノ鉄酸カリウムで濃青。Fe³⁺ ＋ SCN⁻ 血赤。
- Na⁺、K⁺、Ca²⁺、Sr²⁺、Ba²⁺、Cu²⁺：炎色反応。

## 水溶液の色（試薬を加える前のヒント）
Cu²⁺ 青、Fe²⁺ 淡緑、Fe³⁺ 黄褐、Ni²⁺ 緑、Cr³⁺ 緑、MnO₄⁻ 赤紫、Cr₂O₇²⁻ 橙赤。Zn²⁺、Al³⁺、Ag⁺、Pb²⁺、Ca²⁺、Ba²⁺、Na⁺、K⁺ は無色。`,
    },
    exam: {
      en: ['A solution shows given behaviour with HCl / NaOH / NH₃ / H₂S: identify the ion (most years).', 'After adding reagents in sequence, which ions remain in the filtrate.', 'Which solution gives a precipitate that redissolves in excess NaOH but not in excess NH₃ (→ Al³⁺ or Pb²⁺).'],
      ja: ['HCl／NaOH／NH₃／H₂S に対する挙動からイオンを特定（ほぼ毎年）。', '試薬を順に加えた後、ろ液に残るイオンはどれか。', '過剰の NaOH に溶けるが過剰の NH₃ には溶けない沈殿を生じる溶液（→ Al³⁺ や Pb²⁺）。'],
    },
    traps: {
      en: ['Zn²⁺ does **not** precipitate with H₂S in acid — only after the solution is made basic.', 'Excess NaOH dissolves Al, Zn, Pb, Sn hydroxides; excess NH₃ dissolves Cu, Zn, Ag — Zn is in both lists, Al in neither for NH₃.', 'Before the NH₃ step, Fe²⁺ must be oxidised to Fe³⁺ (Fe(OH)₂ is more soluble and would partly slip through).'],
      ja: ['Zn²⁺ は酸性の H₂S では沈殿**しない** — 塩基性にしてから。', '過剰の NaOH に溶けるのは Al、Zn、Pb、Sn の水酸化物。過剰の NH₃ に溶けるのは Cu、Zn、Ag — Zn は両方、Al は NH₃ のリストにない。', 'NH₃ の段階の前に Fe²⁺ を Fe³⁺ に酸化する（Fe(OH)₂ は溶けやすく一部が通り抜ける）。'],
    },
    followups: {
      en: ['Why does H₂S precipitate Cu²⁺ in acid but Zn²⁺ only in base?', 'Give me a mixed solution of Ag⁺, Cu²⁺, Al³⁺, Zn²⁺, Ca²⁺ and let me separate it step by step.', 'How do I tell Al³⁺ from Zn²⁺ with one reagent?', 'Why does AgCl dissolve in ammonia?'],
      ja: ['H₂S が酸性で Cu²⁺ を沈殿させ、Zn²⁺ は塩基性でしか沈殿させないのはなぜ？', 'Ag⁺、Cu²⁺、Al³⁺、Zn²⁺、Ca²⁺ の混合溶液を出して、順に分離させて。', '試薬1つで Al³⁺ と Zn²⁺ を区別するには？', 'AgCl がアンモニア水に溶けるのはなぜ？'],
    },
  },
  // ───────────────────────────── ORGANIC ─────────────────────────────
  {
    id: 'aliphatic-hydrocarbons',
    core: {
      en: 'Carbon makes four bonds, so it builds chains and rings. Count the hydrogens to see how "saturated" a molecule is: CₙH₂ₙ₊₂ is an alkane (all single bonds, reacts only by substitution), each missing H₂ means a double bond or a ring (adds Br₂ or H₂). Isomers are different arrangements of the same atoms — count them systematically by chain length, then position.',
      ja: '炭素は結合を4本つくるので鎖や環を組む。水素の数を数えれば「飽和度」がわかる：CₙH₂ₙ₊₂ はアルカン（単結合だけ、置換反応のみ）。H₂ が1組足りないごとに二重結合か環が1つ（Br₂ や H₂ が付加）。異性体は同じ原子の違う並び方 — 鎖の長さ、次に位置の順で系統的に数える。',
    },
    body: {
      en: r`## Three families
| family | formula | bond | reaction type | test |
|---|---|---|---|---|
| **alkane** | $\mathrm{C_nH_{2n+2}}$ | C–C single | **substitution** (Cl₂ + light) | does not decolourise Br₂ water |
| **alkene** | $\mathrm{C_nH_{2n}}$ | one C=C | **addition** (Br₂, H₂/Ni, H₂O/acid, HCl); polymerisation | decolourises Br₂ water and KMnO₄ |
| **alkyne** | $\mathrm{C_nH_{2n-2}}$ | one C≡C | addition twice | acetylene: CaC₂ + H₂O |
Cycloalkanes are $\mathrm{C_nH_{2n}}$ too (ring instead of double bond) but behave like alkanes.
**Degree of unsaturation**: each C=C or ring removes 2 H; each C≡C removes 4 H from the alkane count. C₄H₈ → one double bond or one ring.

## Naming and shapes
Methane (tetrahedral, 109.5°), ethane, propane, butane, pentane, hexane… Ethylene C₂H₄ is **planar**; acetylene C₂H₂ **linear**. Alkane boiling points rise with chain length; branched isomers boil lower.

## Isomers
- **Structural isomers**: different connectivity. Butane has 2 (n-, iso-); pentane 3; hexane 5. Count by drawing the longest chain, then shortening it and placing branches without duplicating.
- **Cis–trans (geometric) isomers**: C=C cannot rotate; need two different groups on **each** carbon. 2-butene has cis/trans; 1-butene and propene do not.
- **Enantiomers (optical isomers)**: a carbon with **four different groups** (asymmetric carbon) → mirror images that rotate polarised light oppositely. Lactic acid CH₃CH(OH)COOH, alanine; not glycine.

## Key reactions
- Ethylene: + Br₂ → 1,2-dibromoethane (colour vanishes); + H₂O → ethanol (catalyst); + H₂ → ethane (Ni); n CH₂=CH₂ → polyethylene.
- Acetylene: + H₂O (HgSO₄) → acetaldehyde (via vinyl alcohol); + HCl → vinyl chloride; + CH₃COOH → vinyl acetate; 3 C₂H₂ → benzene (Fe, heat). Burns with a very hot, sooty flame.
- Methane: + Cl₂ → CH₃Cl, CH₂Cl₂, CHCl₃, CCl₄ (radical substitution, light needed).

## Petroleum
Fractional distillation by boiling point: gas (C1–4) → naphtha/petrol → kerosene → light oil (diesel) → heavy oil → residue (asphalt). **Cracking** breaks long chains into short alkanes + alkenes (ethylene for plastics). Natural gas ≈ methane.

## Combustion stoichiometry
$\mathrm{C_xH_y + (x + y/4)O_2 \to xCO_2 + (y/2)H_2O}$. Elemental analysis: mass of CO₂ and H₂O absorbed (soda lime, CaCl₂) → moles of C and H → formula.`,
      ja: r`## 3つの系列
| 系列 | 一般式 | 結合 | 反応の種類 | 検出 |
|---|---|---|---|---|
| **アルカン** | $\mathrm{C_nH_{2n+2}}$ | C–C 単結合 | **置換**（Cl₂ ＋ 光） | 臭素水を脱色しない |
| **アルケン** | $\mathrm{C_nH_{2n}}$ | C=C 1つ | **付加**（Br₂、H₂/Ni、H₂O/酸、HCl）。重合 | 臭素水・KMnO₄ を脱色 |
| **アルキン** | $\mathrm{C_nH_{2n-2}}$ | C≡C 1つ | 2回付加 | アセチレン：CaC₂ ＋ H₂O |
シクロアルカンも $\mathrm{C_nH_{2n}}$（二重結合の代わりに環）だがアルカンのようにふるまう。
**不飽和度**：C=C や環1つにつきアルカンより H が2個少ない。C≡C は4個。C₄H₈ → 二重結合1つか環1つ。

## 名前と形
メタン（正四面体、109.5°）、エタン、プロパン、ブタン、ペンタン、ヘキサン…。エチレン C₂H₄ は**平面**、アセチレン C₂H₂ は**直線**。アルカンの沸点は鎖が長いほど高く、枝分かれすると低い。

## 異性体
- **構造異性体**：つながり方が違う。ブタンは2種（n-、iso-）、ペンタン3、ヘキサン5。最長の鎖を描き、短くして枝をつけ、重複を避けて数える。
- **シス–トランス（幾何）異性体**：C=C は回転できない。**両方の**炭素に異なる2つの基が必要。2-ブテンにはあり、1-ブテンやプロペンにはない。
- **鏡像（光学）異性体**：**4つの異なる基**がついた炭素（不斉炭素）→ 鏡像で、偏光を逆向きに回す。乳酸 CH₃CH(OH)COOH、アラニン。グリシンにはない。

## 主な反応
- エチレン：＋Br₂ → 1,2-ジブロモエタン（色が消える）。＋H₂O → エタノール（触媒）。＋H₂ → エタン（Ni）。n CH₂=CH₂ → ポリエチレン。
- アセチレン：＋H₂O（HgSO₄）→ アセトアルデヒド（ビニルアルコール経由）。＋HCl → 塩化ビニル。＋CH₃COOH → 酢酸ビニル。3 C₂H₂ → ベンゼン（Fe、加熱）。非常に高温ですすの多い炎。
- メタン：＋Cl₂ → CH₃Cl、CH₂Cl₂、CHCl₃、CCl₄（光が必要な置換）。

## 石油
沸点による分留：ガス（C1〜4）→ ナフサ・ガソリン → 灯油 → 軽油 → 重油 → 残油（アスファルト）。**クラッキング**で長い鎖を短いアルカン＋アルケンに（プラスチック用のエチレン）。天然ガス ≈ メタン。

## 燃焼の量的関係
$\mathrm{C_xH_y + (x + y/4)O_2 \to xCO_2 + (y/2)H_2O}$。元素分析：吸収された CO₂ と H₂O の質量（ソーダ石灰、CaCl₂）→ C と H の物質量 → 化学式。`,
    },
    exam: {
      en: ['Count isomers of C₅H₁₂ / C₄H₈ / C₅H₁₀ meeting a condition (has C=C; gives an asymmetric carbon on Br₂ addition) (most years).', 'Molecular weight of the Br₂-addition product of a cyclic unsaturated hydrocarbon; how much Br₂ reacts with $n$ mol.', 'Which molecule is planar / shows cis–trans isomerism / has an asymmetric carbon.'],
      ja: ['条件を満たす C₅H₁₂／C₄H₈／C₅H₁₀ の異性体の数（C=C をもつ、Br₂ 付加で不斉炭素ができる）（ほぼ毎年）。', '環状不飽和炭化水素の Br₂ 付加生成物の分子量、$n$ mol と反応する Br₂ の量。', '平面の分子、シス–トランス異性体をもつもの、不斉炭素をもつもの。'],
    },
    traps: {
      en: ['1-butene has **no** cis–trans isomers (one carbon carries two H); 2-butene does.', 'A ring counts as one degree of unsaturation: cyclohexane C₆H₁₂ does not decolourise bromine.', 'Alkanes react with Br₂ only under light and by **substitution** — no colour change in the dark.'],
      ja: ['1-ブテンにはシス–トランス異性体が**ない**（片方の炭素に H が2つ）。2-ブテンにはある。', '環は不飽和度1として数える：シクロヘキサン C₆H₁₂ は臭素を脱色しない。', 'アルカンは光の下で**置換**によってのみ Br₂ と反応 — 暗所では色が変わらない。'],
    },
    followups: {
      en: ['Show me a systematic way to count the isomers of C₆H₁₄.', 'Why can a C=C not rotate, and when does that give cis–trans isomers?', 'Which C₅H₁₀ alkenes give an asymmetric carbon after adding HBr?', 'Explain the acetylene → acetaldehyde reaction.'],
      ja: ['C₆H₁₄ の異性体を系統的に数える方法を見せて。', 'C=C が回転できないのはなぜで、それがいつシス–トランス異性体を生む？', 'HBr を付加すると不斉炭素ができる C₅H₁₀ のアルケンはどれ？', 'アセチレン → アセトアルデヒドの反応を説明して。'],
    },
  },
  {
    id: 'functional-groups',
    core: {
      en: 'A functional group is the reactive part of a molecule; the rest is a spectator. Alcohols oxidise stepwise (primary → aldehyde → carboxylic acid; secondary → ketone; tertiary → nothing), acids and alcohols condense into esters, and a few spot tests — silver mirror, Fehling, iodoform, NaHCO₃ fizz — let you deduce an unknown structure from clues.',
      ja: '官能基は分子の反応する部分で、残りは脇役。アルコールは段階的に酸化される（第一級 → アルデヒド → カルボン酸、第二級 → ケトン、第三級 → 酸化されない）。酸とアルコールは縮合してエステルになる。いくつかの検出反応 — 銀鏡、フェーリング、ヨードホルム、NaHCO₃ の発泡 — でヒントから未知の構造を決められる。',
    },
    body: {
      en: r`## The groups
| group | name | example | key property |
|---|---|---|---|
| –OH | alcohol | ethanol C₂H₅OH | neutral, H-bonds, + Na → H₂ |
| –O– | ether | diethyl ether | volatile, unreactive, no H-bond → low b.p. (isomer of an alcohol!) |
| –CHO | aldehyde | acetaldehyde, formaldehyde | **reducing**: silver mirror, Fehling → Cu₂O red |
| >C=O | ketone | acetone | not reducing |
| –COOH | carboxylic acid | acetic acid | weak acid, fizzes with NaHCO₃, dimerises by H-bonds |
| –COO– | ester | ethyl acetate | fruity smell, hydrolysed by acid or **saponified** by NaOH |

## Alcohols
Classified by the carbon bearing –OH: **primary** (1 C attached), **secondary** (2), **tertiary** (3).
:::fig alcohol-oxidation

- Primary → aldehyde → carboxylic acid (K₂Cr₂O₇ or KMnO₄, or Cu/heat).
- Secondary → ketone. Tertiary → not oxidised.
- Dehydration of ethanol with conc. H₂SO₄: 130–140 °C → **diethyl ether** (intermolecular), 160–170 °C → **ethylene** (intramolecular).
- Ethanol + Na → sodium ethoxide + H₂ (test for –OH). Methanol is toxic (→ formaldehyde). Ethanol from fermentation of glucose.
- Solubility in water drops as the carbon chain grows.

## Aldehydes and ketones
- **Silver mirror test** (Tollens: [Ag(NH₃)₂]⁺) and **Fehling's test** (Cu²⁺ → Cu₂O red precipitate): positive only for **aldehydes** (they are oxidised to acids). Formic acid HCOOH also gives them (it contains a –CHO).
- **Iodoform reaction** (I₂ + NaOH → yellow CHI₃ precipitate, antiseptic smell): positive for CH₃CO–R (acetaldehyde, acetone, methyl ketones) and CH₃CH(OH)–R (ethanol, 2-propanol). **Not** methanol, formaldehyde, 1-propanol.
- Formaldehyde HCHO: gas, 37% solution = formalin; acetone: solvent, from 2-propanol.

## Carboxylic acids
Weak acids ($K_a$ small) but stronger than carbonic acid: release CO₂ from NaHCO₃ (distinguishes acids from phenols). Formic acid (strongest simple one, reducing), acetic acid (vinegar, glacial below 17 °C), oxalic acid (COOH)₂ (diprotic, reducer), maleic/fumaric acids (cis/trans; only maleic forms an anhydride on heating).

## Esters
$$\mathrm{R{-}COOH + R'{-}OH \rightleftharpoons R{-}COO{-}R' + H_2O}$$ (conc. H₂SO₄ catalyst, equilibrium). The O in the ester's –O–R' comes from the **alcohol**. Reverse: acid hydrolysis, or **saponification** with NaOH → R–COONa + R'–OH (goes to completion).

## Fats and soap
Fats/oils = esters of glycerol with three fatty acids (triglycerides). More C=C → more liquid (oils); **hydrogenation** (H₂/Ni) hardens them. **Saponification** with NaOH gives glycerol + **soap** (sodium salts of fatty acids): hydrophobic tail + hydrophilic head → micelles wash grease; soap solution is weakly basic; in hard water forms scum (Ca/Mg salts). Synthetic detergents (alkylbenzene sulfonates, alkyl sulfates) are neutral and work in hard water.

## Deducing a structure (the EJU puzzle)
Clues → group: silver mirror ⇒ –CHO; iodoform ⇒ CH₃CO– or CH₃CH(OH)–; NaHCO₃ fizz ⇒ –COOH; Na → H₂ but no fizz ⇒ –OH; not oxidised ⇒ tertiary alcohol or ether; from an ester hydrolysis ⇒ acid + alcohol with matching carbon counts.`,
      ja: r`## 官能基
| 基 | 名前 | 例 | 特徴 |
|---|---|---|---|
| –OH | アルコール | エタノール C₂H₅OH | 中性、水素結合、＋Na → H₂ |
| –O– | エーテル | ジエチルエーテル | 揮発性、反応しにくい、水素結合なし → 沸点低い（アルコールの異性体！） |
| –CHO | アルデヒド | アセトアルデヒド、ホルムアルデヒド | **還元性**：銀鏡、フェーリング → Cu₂O 赤 |
| >C=O | ケトン | アセトン | 還元性なし |
| –COOH | カルボン酸 | 酢酸 | 弱酸、NaHCO₃ と発泡、水素結合で二量体 |
| –COO– | エステル | 酢酸エチル | 果実臭、酸で加水分解、NaOH で**けん化** |

## アルコール
–OH のついた炭素で分類：**第一級**（C が1つ結合）、**第二級**（2つ）、**第三級**（3つ）。
:::fig alcohol-oxidation

- 第一級 → アルデヒド → カルボン酸（K₂Cr₂O₇ か KMnO₄、または Cu／加熱）。
- 第二級 → ケトン。第三級 → 酸化されない。
- 濃硫酸によるエタノールの脱水：130〜140 ℃ → **ジエチルエーテル**（分子間）、160〜170 ℃ → **エチレン**（分子内）。
- エタノール ＋ Na → ナトリウムエトキシド ＋ H₂（–OH の検出）。メタノールは有毒（→ ホルムアルデヒド）。エタノールはグルコースの発酵から。
- 水への溶解度は炭素鎖が長いほど下がる。

## アルデヒドとケトン
- **銀鏡反応**（トレンス試薬 [Ag(NH₃)₂]⁺）と**フェーリング反応**（Cu²⁺ → Cu₂O 赤色沈殿）：**アルデヒド**のみ陽性（酸に酸化される）。ギ酸 HCOOH も陽性（–CHO を含む）。
- **ヨードホルム反応**（I₂ ＋ NaOH → 黄色の CHI₃ 沈殿、特有のにおい）：CH₃CO–R（アセトアルデヒド、アセトン、メチルケトン）と CH₃CH(OH)–R（エタノール、2-プロパノール）で陽性。メタノール、ホルムアルデヒド、1-プロパノールは**陰性**。
- ホルムアルデヒド HCHO：気体、37% 水溶液がホルマリン。アセトン：溶媒、2-プロパノールから。

## カルボン酸
弱酸（$K_a$ 小）だが炭酸より強い：NaHCO₃ から CO₂ を発生（酸とフェノールの区別）。ギ酸（単純な酸で最も強く還元性あり）、酢酸（食酢、17 ℃ 以下で氷酢酸）、シュウ酸 (COOH)₂（二価、還元剤）、マレイン酸／フマル酸（シス／トランス。加熱で酸無水物になるのはマレイン酸だけ）。

## エステル
$$\mathrm{R{-}COOH + R'{-}OH \rightleftharpoons R{-}COO{-}R' + H_2O}$$（濃硫酸触媒、平衡）。エステルの –O–R' の O は**アルコール**由来。逆：酸による加水分解、または NaOH による**けん化** → R–COONa ＋ R'–OH（完全に進む）。

## 油脂とセッケン
油脂 = グリセリンと脂肪酸3分子のエステル（トリグリセリド）。C=C が多いほど液体（油）。**水素添加**（H₂/Ni）で固まる（硬化油）。NaOH で**けん化**するとグリセリン ＋ **セッケン**（脂肪酸ナトリウム）：疎水基の尾 ＋ 親水基の頭 → ミセルで油汚れを落とす。セッケン水は弱塩基性。硬水では沈殿（Ca/Mg 塩）。合成洗剤（アルキルベンゼンスルホン酸塩、アルキル硫酸塩）は中性で硬水でも使える。

## 構造決定（EJUのパズル）
ヒント → 基：銀鏡 ⇒ –CHO。ヨードホルム ⇒ CH₃CO– か CH₃CH(OH)–。NaHCO₃ で発泡 ⇒ –COOH。Na で H₂ だが発泡なし ⇒ –OH。酸化されない ⇒ 第三級アルコールかエーテル。エステルの加水分解から ⇒ 炭素数の合う酸＋アルコール。`,
    },
    exam: {
      en: ['Deduce an alcohol/carbonyl structure from silver-mirror and iodoform clues; count C₄H₁₀O isomers that give iodoform (most years).', 'Products of named reactions: dry distillation of calcium acetate (→ acetone), CaC₂ + H₂O, oxidation of 2-propanol, dehydration of ethanol at two temperatures.', 'Which single compound among several is an ester / reduces Fehling / fizzes with NaHCO₃; soap vs detergent in hard water.'],
      ja: ['銀鏡反応とヨードホルム反応のヒントからアルコール・カルボニル化合物の構造を決める。ヨードホルム反応を示す C₄H₁₀O の異性体の数（ほぼ毎年）。', '反応の生成物：酢酸カルシウムの乾留（→ アセトン）、CaC₂ ＋ H₂O、2-プロパノールの酸化、2つの温度でのエタノールの脱水。', '複数の化合物のうちエステル・フェーリング反応陽性・NaHCO₃ で発泡するのはどれか。硬水でのセッケンと合成洗剤。'],
    },
    traps: {
      en: ['Ethanol gives a positive iodoform test; **methanol** and **1-propanol** do not.', 'Formic acid is both an acid and an aldehyde-like reducer (silver mirror positive); acetic acid is not.', 'Phenol is acidic but too weak to fizz with NaHCO₃; carboxylic acids do.'],
      ja: ['エタノールはヨードホルム反応陽性。**メタノール**と**1-プロパノール**は陰性。', 'ギ酸は酸であると同時にアルデヒドのような還元剤（銀鏡反応陽性）。酢酸は違う。', 'フェノールは酸性だが弱すぎて NaHCO₃ とは発泡しない。カルボン酸は発泡する。'],
    },
    followups: {
      en: ['List all C₄H₁₀O alcohols and say which are primary/secondary/tertiary and which give iodoform.', 'Why do aldehydes reduce Tollens reagent but ketones do not?', 'Explain saponification and how soap cleans.', 'Give me a structure-deduction puzzle with clues.'],
      ja: ['C₄H₁₀O のアルコールをすべて挙げて、第一級・第二級・第三級とヨードホルム反応の有無を示して。', 'アルデヒドはトレンス試薬を還元するのにケトンはしないのはなぜ？', 'けん化とセッケンが汚れを落とすしくみを説明して。', 'ヒントつきの構造決定パズルを出して。'],
    },
  },
  {
    id: 'aromatic',
    core: {
      en: 'Benzene is a flat ring whose six electrons are shared all round, so it prefers substitution (keeping the ring) over addition. Its derivatives are sorted by acidity — carboxylic acid > carbonic acid > phenol > water — and by basicity (aniline), which is exactly what lets you separate a mixture with dilute HCl, NaHCO₃ and NaOH.',
      ja: 'ベンゼンは平面の環で6個の電子が環全体で共有されているため、付加（環を壊す）より置換（環を保つ）を好む。誘導体は酸性の強さ — カルボン酸 > 炭酸 > フェノール > 水 — と塩基性（アニリン）で整理でき、それがそのまま希塩酸・NaHCO₃・NaOH による混合物の分離になる。',
    },
    body: {
      en: r`## Benzene
C₆H₆, planar regular hexagon, all C–C bonds equal (between single and double). Stable → **substitution** reactions; addition only under forcing conditions (H₂/Ni → cyclohexane; Cl₂ + UV → C₆H₆Cl₆). Burns with a sooty flame; insoluble in water; toxic.

| substitution | reagent | product |
|---|---|---|
| nitration | conc. HNO₃ + conc. H₂SO₄ | nitrobenzene (pale yellow oil) |
| sulfonation | conc. H₂SO₄ (fuming) | benzenesulfonic acid |
| halogenation | Cl₂ + Fe (catalyst) | chlorobenzene |
| alkylation | CH₃Cl / AlCl₃ | toluene |

Substituted benzenes: toluene, xylene (o/m/p — three isomers), styrene, naphthalene (two fused rings, sublimes).

## The four key derivatives
| compound | group | acidity/basicity | signature tests |
|---|---|---|---|
| **phenol** C₆H₅OH | –OH on ring | very weak acid (no fizz with NaHCO₃; dissolves in NaOH) | **FeCl₃ → purple**; Br₂ water → white 2,4,6-tribromophenol |
| **benzoic acid** C₆H₅COOH | –COOH | weak acid, fizzes with NaHCO₃ | from toluene by KMnO₄ oxidation |
| **aniline** C₆H₅NH₂ | –NH₂ | weak **base** (dissolves in HCl → anilinium chloride) | bleaching powder → purple; from nitrobenzene by Sn/HCl reduction; diazotisation |
| **nitrobenzene** C₆H₅NO₂ | –NO₂ | neutral | pale yellow, denser than water |

Acidity order: HCl, H₂SO₄ ≫ carboxylic acid > **carbonic acid** > phenol > water > alcohol. Consequence: NaHCO₃ neutralises benzoic acid but **not** phenol; NaOH neutralises both; CO₂ bubbled into sodium phenoxide regenerates phenol.

## Separation by extraction (the EJU table question)
Dissolve the mixture in ether; shake with aqueous reagents; the ionic salt moves to the water layer.
1. + dilute **HCl**: **aniline** → anilinium chloride (water layer). Recover with NaOH.
2. + **NaHCO₃**: **benzoic acid** → sodium benzoate (water). Recover with HCl.
3. + **NaOH**: **phenol** → sodium phenoxide (water). Recover with HCl or CO₂.
4. Ether layer: **nitrobenzene**, benzene, toluene (neutral).

## Phenol chemistry
Industrial: cumene process (benzene + propene → cumene → hydroperoxide → phenol + acetone). Phenol + NaOH → sodium phenoxide; + CO₂ under pressure → sodium salicylate → **salicylic acid** (has both –OH and –COOH).
- Salicylic acid + methanol → methyl salicylate (liniment, ester on the COOH).
- Salicylic acid + acetic anhydride → **acetylsalicylic acid** (aspirin, ester on the OH).

## Aniline and azo dyes
Aniline + NaNO₂ + HCl (0–5 °C) → benzenediazonium chloride (diazotisation; decomposes above 5 °C to phenol + N₂). + sodium phenoxide → **p-hydroxyazobenzene** (orange azo dye, coupling). Aniline + acetic anhydride → acetanilide (amide).

## Isomer counting
C₇H₈O: benzyl alcohol, anisole (methyl phenyl ether), o/m/p-cresol → 5 isomers, of which the 3 cresols (phenolic –OH) give the FeCl₃ colour. C₈H₁₀: ethylbenzene + 3 xylenes = 4.`,
      ja: r`## ベンゼン
C₆H₆、平面正六角形、C–C 結合はすべて同じ長さ（単結合と二重結合の中間）。安定 → **置換**反応。付加は強い条件でのみ（H₂/Ni → シクロヘキサン、Cl₂ ＋ 紫外線 → C₆H₆Cl₆）。すすの多い炎で燃える。水に溶けない。有毒。

| 置換 | 試薬 | 生成物 |
|---|---|---|
| ニトロ化 | 濃硝酸 ＋ 濃硫酸 | ニトロベンゼン（淡黄色の油状） |
| スルホン化 | 濃硫酸（発煙硫酸） | ベンゼンスルホン酸 |
| ハロゲン化 | Cl₂ ＋ Fe（触媒） | クロロベンゼン |
| アルキル化 | CH₃Cl／AlCl₃ | トルエン |

置換ベンゼン：トルエン、キシレン（o/m/p — 3つの異性体）、スチレン、ナフタレン（2つの縮合環、昇華）。

## 4つの重要な誘導体
| 化合物 | 基 | 酸性・塩基性 | 検出 |
|---|---|---|---|
| **フェノール** C₆H₅OH | 環に –OH | ごく弱い酸（NaHCO₃ と発泡しない。NaOH に溶ける） | **FeCl₃ → 紫**。臭素水 → 白色の 2,4,6-トリブロモフェノール |
| **安息香酸** C₆H₅COOH | –COOH | 弱酸、NaHCO₃ と発泡 | トルエンの KMnO₄ 酸化から |
| **アニリン** C₆H₅NH₂ | –NH₂ | 弱**塩基**（HCl に溶けてアニリン塩酸塩） | さらし粉 → 紫。ニトロベンゼンを Sn/HCl で還元。ジアゾ化 |
| **ニトロベンゼン** C₆H₅NO₂ | –NO₂ | 中性 | 淡黄色、水より重い |

酸性の順：HCl、H₂SO₄ ≫ カルボン酸 > **炭酸** > フェノール > 水 > アルコール。帰結：NaHCO₃ は安息香酸を中和するがフェノールは**しない**。NaOH は両方を中和。ナトリウムフェノキシドに CO₂ を通すとフェノールが遊離。

## 抽出による分離（EJUの表問題）
混合物をエーテルに溶かし、水溶液の試薬と振る。イオン性の塩が水層へ移る。
1. ＋希**塩酸**：**アニリン** → アニリン塩酸塩（水層）。NaOH で回収。
2. ＋**NaHCO₃**：**安息香酸** → 安息香酸ナトリウム（水層）。HCl で回収。
3. ＋**NaOH**：**フェノール** → ナトリウムフェノキシド（水層）。HCl か CO₂ で回収。
4. エーテル層：**ニトロベンゼン**、ベンゼン、トルエン（中性）。

## フェノールの化学
工業的：クメン法（ベンゼン ＋ プロペン → クメン → ヒドロペルオキシド → フェノール ＋ アセトン）。フェノール ＋ NaOH → ナトリウムフェノキシド。＋CO₂（加圧）→ サリチル酸ナトリウム → **サリチル酸**（–OH と –COOH の両方をもつ）。
- サリチル酸 ＋ メタノール → サリチル酸メチル（消炎剤、COOH 側のエステル）。
- サリチル酸 ＋ 無水酢酸 → **アセチルサリチル酸**（アスピリン、OH 側のエステル）。

## アニリンとアゾ染料
アニリン ＋ NaNO₂ ＋ HCl（0〜5 ℃）→ 塩化ベンゼンジアゾニウム（ジアゾ化。5 ℃ 以上ではフェノール ＋ N₂ に分解）。＋ナトリウムフェノキシド → **p-ヒドロキシアゾベンゼン**（橙色のアゾ染料、カップリング）。アニリン ＋ 無水酢酸 → アセトアニリド（アミド）。

## 異性体の数
C₇H₈O：ベンジルアルコール、アニソール（メチルフェニルエーテル）、o/m/p-クレゾール → 5種。うちクレゾール3種（フェノール性 –OH）が FeCl₃ で呈色。C₈H₁₀：エチルベンゼン ＋ キシレン3種 = 4種。`,
    },
    exam: {
      en: ['Separate nitrobenzene / benzoic acid / aniline / phenol with ether, HCl, NaHCO₃, NaOH — choose the correct table row (most years).', 'Count C₇H₈O isomers and how many give FeCl₃ coloration.', 'True/false on substituted benzenes: which is acidic/basic, products of nitration or reduction, aspirin vs methyl salicylate.'],
      ja: ['ニトロベンゼン／安息香酸／アニリン／フェノールをエーテル、HCl、NaHCO₃、NaOH で分離 — 正しい表の行を選ぶ（ほぼ毎年）。', 'C₇H₈O の異性体の数と FeCl₃ で呈色するものの数。', '置換ベンゼンの正誤：酸性・塩基性はどれか、ニトロ化や還元の生成物、アスピリンとサリチル酸メチル。'],
    },
    traps: {
      en: ['Phenol is acidic but does **not** react with NaHCO₃ (weaker than carbonic acid) — this is the whole basis of the separation.', 'Benzyl alcohol C₆H₅CH₂OH is an alcohol (no FeCl₃ colour); cresols are phenols.', 'Diazonium salts must be kept below 5 °C.'],
      ja: ['フェノールは酸性だが NaHCO₃ とは反応**しない**（炭酸より弱い）— 分離の根拠はこれ。', 'ベンジルアルコール C₆H₅CH₂OH はアルコール（FeCl₃ で呈色しない）。クレゾールはフェノール。', 'ジアゾニウム塩は 5 ℃ 以下に保つ。'],
    },
    followups: {
      en: ['Explain the acidity order carboxylic acid > carbonic acid > phenol and how it drives the separation.', 'Why does benzene prefer substitution over addition?', 'Draw (in words) the route from benzene to aspirin.', 'Give me a separation table problem to solve.'],
      ja: ['カルボン酸 > 炭酸 > フェノールの酸性の順と、それが分離を決めるしくみを説明して。', 'ベンゼンが付加より置換を好むのはなぜ？', 'ベンゼンからアスピリンまでの経路を言葉で描いて。', '分離の表の問題を出して。'],
    },
  },
  {
    id: 'biomolecules',
    core: {
      en: 'Sugars, amino acids and proteins are the same organic chemistry with the same tests: glucose is a polyalcohol-aldehyde (reducing), disaccharides are two sugars joined by a glycosidic bond that may or may not hide the reducing end, amino acids carry both –NH₂ and –COOH so they act as acids and bases (zwitterions), and proteins are amino-acid chains whose folded shape is destroyed by heat or acid.',
      ja: '糖・アミノ酸・タンパク質は同じ有機化学で同じ検出法。グルコースは多価アルコールのアルデヒド（還元性）。二糖はグリコシド結合で2つの糖がつながり、還元性の末端が残るものと隠れるものがある。アミノ酸は –NH₂ と –COOH の両方をもち酸にも塩基にもなる（双性イオン）。タンパク質はアミノ酸の鎖で、折りたたまれた形は熱や酸で壊れる。',
    },
    body: {
      en: r`## Monosaccharides (C₆H₁₂O₆)
- **Glucose**: in water an equilibrium of α-ring, open **chain (with –CHO)** and β-ring; the chain form makes it **reducing** (Fehling, silver mirror). Fermentation: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ (zymase).
- **Fructose**: ketose, yet reducing in solution (isomerises). Sweetest sugar.
- Galactose: isomer of glucose (in lactose).

## Disaccharides (C₁₂H₂₂O₁₁) — glycosidic bond, hydrolysed by acid or enzymes
| sugar | units | reducing? | enzyme |
|---|---|---|---|
| **maltose** | glucose + glucose (α-1,4) | yes | maltase |
| **sucrose** | glucose + fructose (both anomeric C used) | **no** | invertase (sucrase) → "invert sugar", which is reducing |
| lactose | galactose + glucose | yes | lactase |

## Polysaccharides (C₆H₁₀O₅)ₙ
- **Starch**: α-glucose; amylose (helix, unbranched) + amylopectin (branched). **Iodine → blue-purple**. Hydrolysis: starch → dextrin → maltose → glucose. Not reducing.
- **Cellulose**: β-glucose, straight chains, H-bonded → fibres; not digested by humans; no iodine colour. Raw material for rayon, nitrocellulose, cellulose acetate.
- Glycogen: animal starch, highly branched.

## Amino acids (about 20)
General formula R–CH(NH₂)–COOH (α-amino acids). **Glycine** (R = H, the only one without an asymmetric carbon), **alanine** (R = CH₃), others with –OH (serine), –SH (cysteine → disulfide bridges), benzene ring (phenylalanine, tyrosine), extra –COOH (glutamic acid, acidic), extra –NH₂ (lysine, basic).
- **Zwitterion** in water: ⁺H₃N–CHR–COO⁻. In acid the cation, in base the anion; the pH where net charge is zero = **isoelectric point** (electrophoresis stops). Amphoteric: react with both HCl and NaOH.
- **Ninhydrin** → purple (test for amino acids / proteins).

## Peptides and proteins
Amino acids condense (–COOH + H₂N– → –CO–NH– + H₂O, the **peptide bond**, an amide). Dipeptide, tripeptide… polypeptide → protein.
| structure level | what it is | held by |
|---|---|---|
| primary | sequence of amino acids | peptide bonds |
| secondary | α-helix, β-sheet | hydrogen bonds between C=O and N–H |
| tertiary | overall 3-D fold | disulfide bonds, ionic bonds, H-bonds, hydrophobic interactions |
| quaternary | several chains together (haemoglobin) | same weak interactions |

**Denaturation**: heat, acid/base, alcohol, heavy-metal ions destroy the secondary/tertiary structure (egg white cooks) — the primary structure survives.

## Protein tests
| test | reagent | colour | detects |
|---|---|---|---|
| **biuret** | NaOH + CuSO₄ | purple | ≥ 2 peptide bonds |
| **xanthoproteic** | conc. HNO₃, heat | yellow (orange with NH₃) | benzene rings (Tyr, Phe) |
| sulfur test | NaOH + (CH₃COO)₂Pb | black PbS | S (cysteine) |
| ninhydrin | ninhydrin, heat | purple | free –NH₂ |

Enzymes are protein catalysts with an active site: specific, work best at an optimum temperature/pH, denatured by heat.

## Nucleic acids (structure only)
DNA/RNA: chains of nucleotides = phosphate + sugar (deoxyribose/ribose) + base (A, T/U, G, C). DNA is a double helix with A–T (2 H-bonds) and G–C (3 H-bonds) pairing.`,
      ja: r`## 単糖（C₆H₁₂O₆）
- **グルコース**：水中で α型環、**鎖状（–CHO をもつ）**、β型環の平衡。鎖状構造のため**還元性**（フェーリング、銀鏡）。アルコール発酵：C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂（チマーゼ）。
- **フルクトース**：ケトースだが水溶液中で還元性を示す（異性化）。最も甘い。
- ガラクトース：グルコースの異性体（ラクトース中）。

## 二糖（C₁₂H₂₂O₁₁）— グリコシド結合、酸や酵素で加水分解
| 糖 | 構成 | 還元性 | 酵素 |
|---|---|---|---|
| **マルトース** | グルコース ＋ グルコース（α-1,4） | あり | マルターゼ |
| **スクロース** | グルコース ＋ フルクトース（両方の還元性末端が結合に使われる） | **なし** | インベルターゼ（スクラーゼ）→「転化糖」は還元性あり |
| ラクトース | ガラクトース ＋ グルコース | あり | ラクターゼ |

## 多糖（C₆H₁₀O₅）ₙ
- **デンプン**：α-グルコース。アミロース（らせん、枝なし）＋ アミロペクチン（枝あり）。**ヨウ素 → 青紫**。加水分解：デンプン → デキストリン → マルトース → グルコース。還元性なし。
- **セルロース**：β-グルコース、直鎖が水素結合 → 繊維。ヒトは消化できない。ヨウ素で呈色しない。レーヨン、ニトロセルロース、アセテートの原料。
- グリコーゲン：動物デンプン、枝分かれが多い。

## アミノ酸（約20種）
一般式 R–CH(NH₂)–COOH（α-アミノ酸）。**グリシン**（R = H、唯一不斉炭素をもたない）、**アラニン**（R = CH₃）、他に –OH（セリン）、–SH（システイン → ジスルフィド結合）、ベンゼン環（フェニルアラニン、チロシン）、余分な –COOH（グルタミン酸、酸性）、余分な –NH₂（リシン、塩基性）。
- 水中で**双性イオン**：⁺H₃N–CHR–COO⁻。酸性では陽イオン、塩基性では陰イオン。正味の電荷が0になる pH = **等電点**（電気泳動で動かない）。両性：HCl とも NaOH とも反応。
- **ニンヒドリン反応** → 紫（アミノ酸・タンパク質の検出）。

## ペプチドとタンパク質
アミノ酸が縮合（–COOH ＋ H₂N– → –CO–NH– ＋ H₂O、**ペプチド結合**、アミド）。ジペプチド、トリペプチド… ポリペプチド → タンパク質。
| 構造 | 内容 | 保つもの |
|---|---|---|
| 一次構造 | アミノ酸の配列 | ペプチド結合 |
| 二次構造 | α-ヘリックス、β-シート | C=O と N–H の間の水素結合 |
| 三次構造 | 全体の立体的な折りたたみ | ジスルフィド結合、イオン結合、水素結合、疎水性相互作用 |
| 四次構造 | 複数の鎖の集合（ヘモグロビン） | 同じ弱い相互作用 |

**変性**：熱、酸・塩基、アルコール、重金属イオンが二次・三次構造を壊す（卵白が固まる）— 一次構造は残る。

## タンパク質の検出
| 反応 | 試薬 | 色 | 検出するもの |
|---|---|---|---|
| **ビウレット反応** | NaOH ＋ CuSO₄ | 紫 | ペプチド結合2つ以上 |
| **キサントプロテイン反応** | 濃硝酸、加熱 | 黄（NH₃ で橙） | ベンゼン環（Tyr、Phe） |
| 硫黄の検出 | NaOH ＋ (CH₃COO)₂Pb | 黒 PbS | S（システイン） |
| ニンヒドリン反応 | ニンヒドリン、加熱 | 紫 | 遊離の –NH₂ |

酵素はタンパク質の触媒で活性部位をもつ：特異的、最適温度・pH があり、熱で変性する。

## 核酸（構造のみ）
DNA/RNA：ヌクレオチド = リン酸 ＋ 糖（デオキシリボース／リボース）＋ 塩基（A、T/U、G、C）の鎖。DNA は A–T（水素結合2本）、G–C（3本）で対をつくる二重らせん。`,
    },
    exam: {
      en: ['Which sugar is not reducing (sucrose); products of hydrolysing sucrose / maltose / starch; iodine–starch reaction (most years).', 'True/false about proteins: structure levels, denaturation, number of amino acids, which test detects what.', 'Amino acid charge at low/high pH; which amino acid lacks an asymmetric carbon (glycine); how many dipeptides from two different amino acids (2, or 4 counting Gly–Gly type).'],
      ja: ['還元性のない糖はどれか（スクロース）。スクロース／マルトース／デンプンの加水分解生成物。ヨウ素デンプン反応（ほぼ毎年）。', 'タンパク質の正誤：構造の階層、変性、アミノ酸の数、各検出法が調べるもの。', '低 pH／高 pH でのアミノ酸の電荷。不斉炭素をもたないアミノ酸（グリシン）。異なる2種のアミノ酸からできるジペプチドの数。'],
    },
    traps: {
      en: ['Sucrose is **not** reducing, but its hydrolysis products are.', 'Starch and cellulose are both (C₆H₁₀O₅)ₙ of glucose — the difference is α vs β linkage, which changes digestibility and the iodine test.', 'Denaturation breaks the fold, not the peptide bonds; hydrolysis (acid/enzyme) breaks peptide bonds.'],
      ja: ['スクロースは還元性が**ない**が、加水分解生成物にはある。', 'デンプンもセルロースもグルコースの (C₆H₁₀O₅)ₙ — 違いは α 結合か β 結合かで、それが消化性とヨウ素反応を変える。', '変性は折りたたみを壊すのであってペプチド結合は壊さない。加水分解（酸・酵素）がペプチド結合を切る。'],
    },
    followups: {
      en: ['Why is sucrose non-reducing while maltose is reducing?', 'Explain the zwitterion and isoelectric point with alanine.', 'What breaks in denaturation and what survives?', 'Quiz me on the protein colour tests.'],
      ja: ['スクロースは還元性がなくマルトースにはあるのはなぜ？', 'アラニンで双性イオンと等電点を説明して。', '変性で壊れるものと残るものは？', 'タンパク質の呈色反応のクイズを出して。'],
    },
  },
  {
    id: 'polymers',
    core: {
      en: 'A polymer is a long chain of repeating units. There are only two ways to build one: addition (monomers with C=C simply open up and link, no by-product) and condensation (two groups join and lose a small molecule like H₂O). Knowing the monomer tells you the type, the elements present, and often the use.',
      ja: '高分子は繰り返し単位の長い鎖。作り方は2つだけ：付加重合（C=C をもつ単量体が開いてつながる。副生成物なし）と縮合重合（2つの基が結合して H₂O などの小さな分子がとれる）。単量体がわかれば、種類、含まれる元素、多くの場合は用途もわかる。',
    },
    body: {
      en: r`## Two polymerisation types
- **Addition** polymerisation: monomer has C=C; chain grows by opening the double bond. Polymer formula = n × monomer. No by-product.
- **Condensation** polymerisation: two functional groups per monomer (–COOH/–OH, –COOH/–NH₂); each link releases H₂O (or HCl). Polymer mass < sum of monomers.
- Degree of polymerisation $n$ = polymer molar mass ÷ repeat-unit mass.

## Addition polymers (vinyl compounds CH₂=CHX)
| polymer | monomer | use |
|---|---|---|
| polyethylene (PE) | CH₂=CH₂ | bags, bottles |
| polypropylene (PP) | CH₂=CH–CH₃ | containers, fibres |
| poly(vinyl chloride) (PVC) | CH₂=CHCl | pipes; contains Cl |
| polystyrene (PS) | CH₂=CH–C₆H₅ | foam, cases |
| poly(vinyl acetate) | CH₂=CH–OCOCH₃ | glue; → PVA → **vinylon** (with HCHO, first Japanese synthetic fibre) |
| PTFE (Teflon) | CF₂=CF₂ | non-stick |
| polyacrylonitrile | CH₂=CH–CN | acrylic fibre; contains N |
| poly(methyl methacrylate) | CH₂=C(CH₃)COOCH₃ | acrylic glass |
| **synthetic rubbers** | butadiene CH₂=CH–CH=CH₂, chloroprene, isoprene | 1,4-addition leaves one C=C per unit; **vulcanisation** with S cross-links |

Natural rubber = poly-cis-isoprene (latex); gutta-percha is the trans form.

## Condensation polymers
| polymer | monomers | link | elements |
|---|---|---|---|
| **nylon 6,6** | adipic acid + hexamethylenediamine | amide –CO–NH– | C, H, O, **N** |
| nylon 6 | ε-caprolactam (ring-opening) | amide | C, H, O, N |
| **PET** (polyester) | terephthalic acid + ethylene glycol | ester –COO– | C, H, O |
| **phenol resin** (Bakelite) | phenol + **formaldehyde** | methylene bridges, 3-D network | thermosetting |
| **urea resin** | urea + **formaldehyde** | | thermosetting; contains N |
| melamine resin | melamine + formaldehyde | | thermosetting |
| silicone | dichlorodimethylsilane (hydrolysis) | Si–O–Si | heat-resistant |

Nylon was designed to imitate **silk** (protein, amide links); PET imitates cotton uses; PET bottles are recycled into fibres.

## Thermoplastic vs thermosetting
- **Thermoplastic** (linear chains): soften on heating, re-mouldable — PE, PP, PVC, PS, nylon, PET.
- **Thermosetting** (3-D network, made with formaldehyde): harden permanently — phenol, urea, melamine resins.

## Functional polymers
- **Ion-exchange resins**: polystyrene cross-linked with divinylbenzene, with –SO₃H (cation exchange: Na⁺ → H⁺) or –N⁺R₃OH⁻ (anion exchange) → deionised water.
- **Water-absorbent polymer**: cross-linked sodium polyacrylate; –COO⁻Na⁺ groups pull in water by osmosis (diapers).
- **Conductive polymer**: polyacetylene doped with I₂ (Shirakawa, Nobel 2000).
- Biodegradable: polylactic acid.

## Natural polymers (recap)
Starch/cellulose (glucose), proteins (amino acids, amide links), natural rubber (isoprene), nucleic acids (nucleotides). Semi-synthetic: rayon (regenerated cellulose), cellulose acetate.

## Recycling
Material recycling (re-melt thermoplastics), chemical recycling (depolymerise PET back to monomers), thermal recycling (burn for energy).`,
      ja: r`## 2つの重合の型
- **付加重合**：単量体が C=C をもち、二重結合が開いて鎖が伸びる。高分子の式 = n × 単量体。副生成物なし。
- **縮合重合**：単量体1個に官能基2つ（–COOH/–OH、–COOH/–NH₂）。結合ごとに H₂O（や HCl）がとれる。高分子の質量 < 単量体の合計。
- 重合度 $n$ = 高分子のモル質量 ÷ 繰り返し単位の質量。

## 付加重合体（ビニル化合物 CH₂=CHX）
| 高分子 | 単量体 | 用途 |
|---|---|---|
| ポリエチレン（PE） | CH₂=CH₂ | 袋、ボトル |
| ポリプロピレン（PP） | CH₂=CH–CH₃ | 容器、繊維 |
| ポリ塩化ビニル（PVC） | CH₂=CHCl | 配管。Cl を含む |
| ポリスチレン（PS） | CH₂=CH–C₆H₅ | 発泡スチロール、ケース |
| ポリ酢酸ビニル | CH₂=CH–OCOCH₃ | 接着剤 → PVA → **ビニロン**（HCHO で処理。日本初の合成繊維） |
| PTFE（テフロン） | CF₂=CF₂ | フッ素樹脂加工 |
| ポリアクリロニトリル | CH₂=CH–CN | アクリル繊維。N を含む |
| ポリメタクリル酸メチル | CH₂=C(CH₃)COOCH₃ | アクリル樹脂 |
| **合成ゴム** | ブタジエン CH₂=CH–CH=CH₂、クロロプレン、イソプレン | 1,4-付加で単位ごとに C=C が1つ残る。S による**加硫**で架橋 |

天然ゴム = ポリ-cis-イソプレン（ラテックス）。グッタペルカは trans 型。

## 縮合重合体
| 高分子 | 単量体 | 結合 | 元素 |
|---|---|---|---|
| **ナイロン 6,6** | アジピン酸 ＋ ヘキサメチレンジアミン | アミド –CO–NH– | C、H、O、**N** |
| ナイロン 6 | ε-カプロラクタム（開環重合） | アミド | C、H、O、N |
| **PET**（ポリエステル） | テレフタル酸 ＋ エチレングリコール | エステル –COO– | C、H、O |
| **フェノール樹脂**（ベークライト） | フェノール ＋ **ホルムアルデヒド** | メチレン架橋、三次元網目 | 熱硬化性 |
| **尿素樹脂** | 尿素 ＋ **ホルムアルデヒド** | | 熱硬化性。N を含む |
| メラミン樹脂 | メラミン ＋ ホルムアルデヒド | | 熱硬化性 |
| シリコーン | ジクロロジメチルシラン（加水分解） | Si–O–Si | 耐熱 |

ナイロンは**絹**（タンパク質、アミド結合）をまねて作られた。PET は綿の用途。PET ボトルは繊維にリサイクル。

## 熱可塑性と熱硬化性
- **熱可塑性**（鎖状）：加熱で軟らかくなり成形し直せる — PE、PP、PVC、PS、ナイロン、PET。
- **熱硬化性**（三次元網目、ホルムアルデヒドで作る）：一度固まると戻らない — フェノール樹脂、尿素樹脂、メラミン樹脂。

## 機能性高分子
- **イオン交換樹脂**：ジビニルベンゼンで架橋したポリスチレンに –SO₃H（陽イオン交換：Na⁺ → H⁺）や –N⁺R₃OH⁻（陰イオン交換）→ 脱イオン水。
- **高吸水性高分子**：架橋したポリアクリル酸ナトリウム。–COO⁻Na⁺ が浸透で水を引き込む（おむつ）。
- **導電性高分子**：I₂ をドープしたポリアセチレン（白川、2000年ノーベル賞）。
- 生分解性：ポリ乳酸。

## 天然高分子（復習）
デンプン・セルロース（グルコース）、タンパク質（アミノ酸、アミド結合）、天然ゴム（イソプレン）、核酸（ヌクレオチド）。半合成：レーヨン（再生セルロース）、アセテート。

## リサイクル
マテリアルリサイクル（熱可塑性樹脂を再溶融）、ケミカルリサイクル（PET を単量体に戻す）、サーマルリサイクル（燃やしてエネルギー）。`,
    },
    exam: {
      en: ['Which polymers are made with formaldehyde (phenol, urea, melamine resins; vinylon treatment); which contain nitrogen (nylon, urea resin, polyacrylonitrile) (most years).', 'Match polymer → monomer → polymerisation type; mass of monomer needed / degree of polymerisation from molar mass.', 'Thermoplastic vs thermosetting; function of ion-exchange or water-absorbent polymers.'],
      ja: ['ホルムアルデヒドを使う高分子（フェノール樹脂、尿素樹脂、メラミン樹脂。ビニロンの処理）、窒素を含むもの（ナイロン、尿素樹脂、ポリアクリロニトリル）（ほぼ毎年）。', '高分子 → 単量体 → 重合の型の対応。必要な単量体の質量、モル質量からの重合度。', '熱可塑性と熱硬化性。イオン交換樹脂や高吸水性高分子のはたらき。'],
    },
    traps: {
      en: ['Nylon 6,6 is a **condensation** polymer (amide links, releases water); polyacrylonitrile contains N but is an **addition** polymer.', 'PET is a polyester (no N); nylon is a polyamide (has N).', 'Thermosetting resins cannot be re-melted — they decompose.'],
      ja: ['ナイロン 6,6 は**縮合**重合体（アミド結合、水がとれる）。ポリアクリロニトリルは N を含むが**付加**重合体。', 'PET はポリエステル（N なし）。ナイロンはポリアミド（N あり）。', '熱硬化性樹脂は再溶融できない — 分解する。'],
    },
    followups: {
      en: ['Why does condensation polymerisation lose mass while addition does not?', 'Give me a polymer → monomer matching quiz.', 'How is vinylon made from poly(vinyl acetate)?', 'Explain how an ion-exchange resin makes pure water.'],
      ja: ['縮合重合では質量が減るのに付加重合では減らないのはなぜ？', '高分子 → 単量体の対応クイズを出して。', 'ポリ酢酸ビニルからビニロンはどう作る？', 'イオン交換樹脂で純水ができるしくみを説明して。'],
    },
  },
];

const notes: SubjectNotes = {
  subject: 'chemistry',
  tree: TREES.chemistry,
  notes: Object.fromEntries(N.map((n) => [n.id, n])),
};
export default notes;
