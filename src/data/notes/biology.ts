import type { SubjectNotes, Note } from './types';
import { TREES } from './index';

// Bodies use String.raw so LaTeX backslashes survive. Never put ` or ${ inside.
const r = String.raw;

const N: Note[] = [
  // ───────────────────────────── CELLS ─────────────────────────────
  {
    id: 'cell-structure',
    core: {
      en: 'All life is made of cells. Prokaryotes (bacteria) are small bags with DNA loose inside and no compartments; eukaryotes (animals, plants, fungi) pack DNA in a nucleus and divide jobs among organelles. Plant cells add a cell wall, chloroplasts and a big vacuole. Match each organelle to one job and you can answer any "which cell has what" table.',
      ja: '生物はすべて細胞からできている。原核生物（細菌）は DNA がむき出しで仕切りのない小さな袋。真核生物（動物・植物・菌類）は DNA を核に収め、仕事を細胞小器官で分担する。植物細胞はさらに細胞壁・葉緑体・大きな液胞をもつ。各小器官を1つの仕事と対応させれば「どの細胞に何があるか」の表はすべて答えられる。',
    },
    body: {
      en: r`## Prokaryote vs eukaryote
| | prokaryote (bacteria, cyanobacteria) | eukaryote (animal, plant, fungus, protist) |
|---|---|---|
| nucleus | none — DNA circular, in the cytoplasm | yes, with nuclear envelope |
| membrane organelles | none | mitochondria, chloroplasts, ER, Golgi… |
| ribosomes | yes (smaller) | yes |
| cell wall | yes (peptidoglycan) | plants (cellulose), fungi (chitin); animals none |
| size | ~1 μm | 10–100 μm |
| examples | E. coli, cyanobacteria (photosynthetic, no chloroplast) | everything else |

## The presence/absence table (memorise)
| structure | animal | plant | bacterium |
|---|---|---|---|
| cell membrane | ✓ | ✓ | ✓ |
| DNA | ✓ | ✓ | ✓ |
| ribosome | ✓ | ✓ | ✓ |
| nucleus | ✓ | ✓ | ✗ |
| mitochondria | ✓ | ✓ | ✗ |
| **chloroplast** | ✗ | ✓ | ✗ |
| **cell wall** | ✗ | ✓ (cellulose) | ✓ |
| large central vacuole | ✗ | ✓ | ✗ |
| centrioles | ✓ | ✗ (most) | ✗ |

## Organelles and their one job
- **Nucleus**: holds DNA (chromatin); nucleolus makes ribosomes; nuclear pores.
- **Mitochondrion**: aerobic respiration → ATP; double membrane, inner folds (cristae), own DNA.
- **Chloroplast**: photosynthesis; thylakoids (stacked in grana) + stroma; own DNA. Mitochondria and chloroplasts came from engulfed bacteria (**endosymbiosis**).
- **Ribosome**: protein synthesis (translation); free or on rough ER.
- **Endoplasmic reticulum**: rough (with ribosomes) makes and transports proteins; smooth makes lipids.
- **Golgi body**: modifies, packages and secretes proteins (vesicles).
- **Lysosome**: digestive enzymes (animal).
- **Vacuole**: stores water, ions, pigments (anthocyanin); turgor in plants.
- **Cytoskeleton**: microtubules, actin filaments — shape, movement, cell division; centrioles organise the spindle.
- **Cell wall**: cellulose, rigid support; **cell membrane**: phospholipid bilayer with proteins, selectively permeable.

## The cell membrane and transport
Phospholipid bilayer (hydrophilic heads out, hydrophobic tails in) with embedded proteins (fluid mosaic).
| transport | energy? | direction | example |
|---|---|---|---|
| diffusion | no | down the gradient | O₂, CO₂ |
| facilitated diffusion (channel/carrier) | no | down | glucose, ions via channels |
| **osmosis** | no | water toward higher solute concentration | red cells burst in pure water; plant cells plasmolyse in salt |
| **active transport** | ATP | against the gradient | Na⁺/K⁺ pump (3 Na⁺ out, 2 K⁺ in) |
| endocytosis / exocytosis | ATP | bulk | phagocytosis; secretion |

## Cell cycle and mitosis (brief)
Interphase (G₁ → S: DNA replication → G₂) then M phase: prophase (chromosomes condense), metaphase (line up at the equator), anaphase (sister chromatids separate), telophase, cytokinesis. Result: two identical diploid cells. Chromosome number stays constant (2n → 2n).`,
      ja: r`## 原核細胞と真核細胞
| | 原核細胞（細菌、シアノバクテリア） | 真核細胞（動物・植物・菌類・原生生物） |
|---|---|---|
| 核 | なし — 環状 DNA が細胞質中に | あり、核膜に包まれる |
| 膜でできた細胞小器官 | なし | ミトコンドリア、葉緑体、小胞体、ゴルジ体… |
| リボソーム | あり（小さい） | あり |
| 細胞壁 | あり（ペプチドグリカン） | 植物（セルロース）、菌類（キチン）。動物はなし |
| 大きさ | 約 1 μm | 10〜100 μm |
| 例 | 大腸菌、シアノバクテリア（光合成するが葉緑体なし） | その他すべて |

## 有無の表（暗記）
| 構造 | 動物 | 植物 | 細菌 |
|---|---|---|---|
| 細胞膜 | ✓ | ✓ | ✓ |
| DNA | ✓ | ✓ | ✓ |
| リボソーム | ✓ | ✓ | ✓ |
| 核 | ✓ | ✓ | ✗ |
| ミトコンドリア | ✓ | ✓ | ✗ |
| **葉緑体** | ✗ | ✓ | ✗ |
| **細胞壁** | ✗ | ✓（セルロース） | ✓ |
| 発達した液胞 | ✗ | ✓ | ✗ |
| 中心体 | ✓ | ✗（多くの植物） | ✗ |

## 細胞小器官と1つの仕事
- **核**：DNA（クロマチン）を保持。核小体はリボソームをつくる。核膜孔。
- **ミトコンドリア**：好気呼吸 → ATP。二重膜、内膜のひだ（クリステ）、独自の DNA。
- **葉緑体**：光合成。チラコイド（積み重なってグラナ）＋ ストロマ。独自の DNA。ミトコンドリアと葉緑体は取り込まれた細菌に由来（**細胞内共生説**）。
- **リボソーム**：タンパク質合成（翻訳）。遊離型または粗面小胞体上。
- **小胞体**：粗面（リボソームつき）はタンパク質をつくり運ぶ。滑面は脂質をつくる。
- **ゴルジ体**：タンパク質を修飾・包装・分泌（小胞）。
- **リソソーム**：消化酵素（動物）。
- **液胞**：水、イオン、色素（アントシアン）を貯蔵。植物の膨圧。
- **細胞骨格**：微小管、アクチンフィラメント — 形、運動、細胞分裂。中心体は紡錘体を形成。
- **細胞壁**：セルロース、かたい支持。**細胞膜**：リン脂質二重層にタンパク質、選択的透過性。

## 細胞膜と物質輸送
リン脂質二重層（親水性の頭が外、疎水性の尾が内）にタンパク質が埋まる（流動モザイクモデル）。
| 輸送 | エネルギー | 向き | 例 |
|---|---|---|---|
| 拡散 | 不要 | 濃度勾配に従う | O₂、CO₂ |
| 促進拡散（チャネル・担体） | 不要 | 勾配に従う | グルコース、チャネルを通るイオン |
| **浸透** | 不要 | 水が溶質濃度の高い側へ | 赤血球は純水で破裂。植物細胞は食塩水で原形質分離 |
| **能動輸送** | ATP | 勾配に逆らう | ナトリウムポンプ（Na⁺ 3個を外へ、K⁺ 2個を内へ） |
| エンドサイトーシス／エキソサイトーシス | ATP | まとめて | 食作用。分泌 |

## 細胞周期と体細胞分裂（簡潔に）
間期（G₁ → S：DNA 複製 → G₂）、次に M 期：前期（染色体が凝縮）、中期（赤道面に並ぶ）、後期（姉妹染色分体が分かれる）、終期、細胞質分裂。結果：同一の二倍体細胞2個。染色体数は変わらない（2n → 2n）。`,
    },
    exam: {
      en: ['Table marking +/− for structures across prokaryote / animal / plant cells: assign A, B, C to chloroplast, cell wall, mitochondria (most years).', 'Choose the correct/incorrect statement about an organelle (ribosome makes proteins; chloroplast has its own DNA; cyanobacteria photosynthesise without chloroplasts).', 'Osmosis: what happens to a red blood cell or plant cell in pure water / concentrated salt.'],
      ja: ['原核・動物・植物細胞の構造の有無の表：A、B、C を葉緑体・細胞壁・ミトコンドリアに対応させる（ほぼ毎年）。', '細胞小器官についての正誤（リボソームはタンパク質をつくる。葉緑体は独自の DNA をもつ。シアノバクテリアは葉緑体なしで光合成）。', '浸透：純水や濃い食塩水に入れた赤血球・植物細胞はどうなるか。'],
    },
    traps: {
      en: ['Bacteria have a cell wall and ribosomes but **no** nucleus or mitochondria; plant cells have **both** mitochondria and chloroplasts.', 'Cyanobacteria are prokaryotes that photosynthesise — with thylakoid membranes, not chloroplasts.', 'Plant cells in pure water do not burst (cell wall); animal cells do.'],
      ja: ['細菌には細胞壁とリボソームはあるが核とミトコンドリアは**ない**。植物細胞にはミトコンドリアと葉緑体の**両方**がある。', 'シアノバクテリアは光合成する原核生物 — 葉緑体ではなくチラコイド膜をもつ。', '純水中の植物細胞は破裂しない（細胞壁）。動物細胞は破裂する。'],
    },
    followups: {
      en: ['Explain endosymbiosis and the evidence for it.', 'Why do plant cells not burst in pure water?', 'Quiz me with a presence/absence table.', 'What is the difference between diffusion, facilitated diffusion and active transport?'],
      ja: ['細胞内共生説とその証拠を説明して。', '植物細胞が純水で破裂しないのはなぜ？', '有無の表でクイズを出して。', '拡散・促進拡散・能動輸送の違いは？'],
    },
  },
  {
    id: 'biomolecules-proteins',
    core: {
      en: 'Proteins are chains of 20 kinds of amino acids; the sequence (primary structure) folds into helices and sheets, then a 3-D shape whose surface does the job — as an enzyme, a carrier, a channel, an antibody. Heat or acid unfolds the shape (denaturation) and the job stops. ATP is the cell\'s energy coin: breaking its last phosphate bond releases energy for everything.',
      ja: 'タンパク質は 20 種のアミノ酸の鎖。配列（一次構造）がらせんやシートに折れ、さらに立体的な形になり、その表面が仕事をする — 酵素、運搬体、チャネル、抗体として。熱や酸で形がほどける（変性）と仕事が止まる。ATP は細胞のエネルギーの通貨：末端のリン酸結合を切ると、あらゆる活動のエネルギーが出る。',
    },
    body: {
      en: r`## Amino acids and peptide bonds
20 kinds, all R–CH(NH₂)–COOH; they differ only in R. Joined by **peptide bonds** (–CO–NH–) with loss of water. Order of amino acids = **primary structure**, encoded by DNA.

## Structure levels
| level | description | held by |
|---|---|---|
| primary | amino-acid sequence | peptide bonds |
| secondary | **α-helix**, **β-sheet** — local folding | hydrogen bonds (C=O···H–N) |
| tertiary | full 3-D shape of one chain | S–S bonds (cysteine), ionic, hydrogen, hydrophobic interactions |
| quaternary | several chains (haemoglobin = 4) | same weak interactions |

**Denaturation**: heat, strong acid/base, alcohol, heavy metals break the weak bonds → shape lost, function lost (boiled egg); primary structure intact.

## Enzymes
Protein catalysts. The **active site** fits only its substrate (lock-and-key / induced fit → **specificity**). They lower activation energy, are not used up, and work best at an **optimum temperature (~37 °C for humans) and pH** (pepsin 2, trypsin 8, amylase 7). Above the optimum temperature the rate collapses (denaturation) — the graph is asymmetric. Rate vs substrate concentration rises then saturates (all active sites busy). Many need **coenzymes** (NAD⁺, FAD, vitamins) — small, non-protein, heat-stable. **Competitive inhibitors** resemble the substrate and block the site; **allosteric** effectors bind elsewhere (feedback inhibition by the pathway's end product).

## ATP
:::fig atp

Adenosine triphosphate = adenine + ribose (= adenosine) + three phosphates. The two bonds between phosphates are **high-energy phosphate bonds**; ATP → ADP + Pi releases ~30 kJ/mol used for muscle contraction, active transport, synthesis, light. ATP is remade by respiration and photosynthesis. All organisms use ATP — a sign of common ancestry.

## Other biomolecules (quick)
- Carbohydrates: glucose (energy), starch/glycogen (storage), cellulose (plant wall).
- Lipids: fats (energy store, 2× carbohydrate per gram), phospholipids (membranes), steroids.
- Nucleic acids: DNA (information), RNA (messenger, ribosome, transfer).
- Water: ~70% of a cell; hydrogen bonds give high specific heat and solvent power.`,
      ja: r`## アミノ酸とペプチド結合
20 種、すべて R–CH(NH₂)–COOH で R だけが違う。水がとれて**ペプチド結合**（–CO–NH–）でつながる。アミノ酸の並び = **一次構造**、DNA に記録されている。

## 構造の階層
| 階層 | 内容 | 保つもの |
|---|---|---|
| 一次構造 | アミノ酸配列 | ペプチド結合 |
| 二次構造 | **α ヘリックス**、**β シート** — 部分的な折りたたみ | 水素結合（C=O···H–N） |
| 三次構造 | 1本の鎖全体の立体構造 | S–S 結合（システイン）、イオン結合、水素結合、疎水性相互作用 |
| 四次構造 | 複数の鎖（ヘモグロビンは4本） | 同じ弱い相互作用 |

**変性**：熱、強い酸・塩基、アルコール、重金属が弱い結合を壊す → 形が失われ機能も失われる（ゆで卵）。一次構造は無事。

## 酵素
タンパク質の触媒。**活性部位**は特定の基質だけに合う（鍵と鍵穴／誘導適合 → **基質特異性**）。活性化エネルギーを下げ、消費されず、**最適温度（ヒトは約 37 ℃）と最適 pH**（ペプシン 2、トリプシン 8、アミラーゼ 7）で最もよくはたらく。最適温度を超えると速度は急落（変性）— グラフは左右非対称。基質濃度に対する速度は上がってから頭打ち（活性部位が全部ふさがる）。多くは**補酵素**（NAD⁺、FAD、ビタミン）を必要とする — 小さく、タンパク質でなく、熱に強い。**競争的阻害剤**は基質に似ていて活性部位をふさぐ。**アロステリック**効果物質は別の場所に結合（経路の最終産物によるフィードバック阻害）。

## ATP
:::fig atp

アデノシン三リン酸 = アデニン ＋ リボース（= アデノシン）＋ リン酸3個。リン酸どうしの2つの結合は**高エネルギーリン酸結合**。ATP → ADP ＋ Pi で約 30 kJ/mol が放出され、筋収縮、能動輸送、合成、発光に使われる。ATP は呼吸と光合成で再生される。すべての生物が ATP を使う — 共通の祖先の証拠。

## その他の生体物質（簡単に）
- 炭水化物：グルコース（エネルギー）、デンプン／グリコーゲン（貯蔵）、セルロース（植物の細胞壁）。
- 脂質：脂肪（エネルギー貯蔵、1 g あたり炭水化物の2倍）、リン脂質（膜）、ステロイド。
- 核酸：DNA（情報）、RNA（伝令、リボソーム、運搬）。
- 水：細胞の約 70%。水素結合により比熱が大きく溶媒として優れる。`,
    },
    exam: {
      en: ['Label the parts of ATP (adenine / ribose / phosphates; which part is adenosine) (frequent).', 'True/false on protein structure: α-helix is secondary, denaturation keeps the primary structure, there are 20 amino acids, peptide bonds link them.', 'Enzyme graphs: rate vs temperature (sharp fall above optimum), rate vs pH, rate vs substrate concentration (saturation); effect of a competitive inhibitor.'],
      ja: ['ATP の各部分（アデニン／リボース／リン酸。アデノシンはどこまでか）（頻出）。', 'タンパク質の構造の正誤：α ヘリックスは二次構造、変性しても一次構造は残る、アミノ酸は 20 種、ペプチド結合でつながる。', '酵素のグラフ：温度と速度（最適温度を超えると急落）、pH と速度、基質濃度と速度（頭打ち）。競争的阻害剤の効果。'],
    },
    traps: {
      en: ['Adenosine = adenine + ribose (no phosphate); AMP/ADP/ATP add 1/2/3 phosphates.', 'Enzymes are not consumed and do not change the equilibrium; they change the **rate**.', 'Coenzymes are not proteins — they survive boiling; the enzyme protein does not.'],
      ja: ['アデノシン = アデニン ＋ リボース（リン酸なし）。AMP/ADP/ATP はリン酸 1/2/3 個。', '酵素は消費されず平衡も変えない。変えるのは**速度**。', '補酵素はタンパク質ではない — 煮沸しても壊れない。酵素タンパク質は壊れる。'],
    },
    followups: {
      en: ['Why does enzyme activity drop sharply above the optimum temperature but slowly below it?', 'Explain the ATP–ADP cycle with an everyday analogy.', 'What is the difference between denaturation and hydrolysis of a protein?', 'How does a competitive inhibitor change the rate-vs-substrate graph?'],
      ja: ['酵素の活性が最適温度より上では急に、下ではゆっくり落ちるのはなぜ？', 'ATP–ADP のサイクルを身近なたとえで説明して。', 'タンパク質の変性と加水分解の違いは？', '競争的阻害剤は基質濃度と速度のグラフをどう変える？'],
    },
  },
  // ───────────────────────────── METABOLISM ─────────────────────────────
  {
    id: 'respiration',
    core: {
      en: 'Respiration takes glucose apart in three stages — glycolysis in the cytoplasm, the citric acid cycle in the mitochondrial matrix, the electron transport chain on the inner membrane — handing electrons to NADH/FADH₂ and finally to oxygen, and using the energy to make about 38 ATP. Without oxygen, cells fall back on fermentation and get only the 2 ATP of glycolysis.',
      ja: '呼吸はグルコースを3段階で分解する — 細胞質基質での解糖系、ミトコンドリアのマトリックスでのクエン酸回路、内膜での電子伝達系。電子を NADH/FADH₂ に渡し、最後に酸素に渡して、そのエネルギーで約 38 ATP をつくる。酸素がないと細胞は発酵に頼り、解糖系の 2 ATP しか得られない。',
    },
    body: {
      en: r`## Overall
$$\mathrm{C_6H_{12}O_6 + 6O_2 + 6H_2O \to 6CO_2 + 12H_2O}\quad(+\ \text{about 38 ATP})$$
The energy is not released in one burst; it is captured stepwise as electrons pass from glucose to NAD⁺/FAD and then to O₂.

## The three stages
:::fig mitochondrion

| stage | where | input → output | ATP | NADH / FADH₂ |
|---|---|---|---|---|
| **glycolysis** | cytoplasm (cytosol) | glucose (C6) → 2 pyruvate (C3) | 2 (net) | 2 NADH |
| **citric acid cycle** (Krebs) | mitochondrial **matrix** | pyruvate → acetyl-CoA → CO₂ (all 6 C leave as CO₂ here and in the link step) | 2 | 8 NADH + 2 FADH₂ |
| **electron transport chain** | **inner membrane** (cristae) | NADH/FADH₂ electrons → O₂ → H₂O; H⁺ pumped out, flows back through **ATP synthase** | ~34 | — |

Total ≈ 38 ATP per glucose (oxygen is consumed only in the last stage; CO₂ is made only in the second).

## Why oxygen matters
O₂ is the **final electron acceptor**. Without it the chain stops, NADH cannot be recycled to NAD⁺, and glycolysis would stall — so cells regenerate NAD⁺ by **fermentation**:
| fermentation | organism | pyruvate → | ATP per glucose |
|---|---|---|---|
| alcoholic | yeast | ethanol + CO₂ | 2 |
| lactic acid | muscle (oxygen debt), lactic bacteria (yoghurt) | lactate | 2 |
Fermentation reuses glycolysis and adds nothing to ATP yield; it only keeps glycolysis running.

## Respiratory quotient (RQ)
$RQ = \dfrac{\text{CO}_2\ \text{released}}{\text{O}_2\ \text{consumed}}$: carbohydrate 1.0, protein 0.8, fat 0.7 (fats are hydrogen-rich, need more O₂). Measured with a respirometer: KOH absorbs CO₂ → volume change = O₂ used; without KOH → change = O₂ − CO₂.

## Other fuels
Fats → glycerol + fatty acids → acetyl-CoA (β-oxidation); proteins → amino acids → deaminated (NH₃ → urea in the liver) → cycle intermediates.`,
      ja: r`## 全体
$$\mathrm{C_6H_{12}O_6 + 6O_2 + 6H_2O \to 6CO_2 + 12H_2O}\quad(+\ \text{約 38 ATP})$$
エネルギーは一度に出るのではなく、グルコースから NAD⁺/FAD へ、そして O₂ へ電子が渡るたびに少しずつ取り出される。

## 3つの段階
:::fig mitochondrion

| 段階 | 場所 | 入る → 出る | ATP | NADH / FADH₂ |
|---|---|---|---|---|
| **解糖系** | 細胞質基質 | グルコース（C6）→ ピルビン酸（C3）2個 | 2（正味） | 2 NADH |
| **クエン酸回路** | ミトコンドリアの**マトリックス** | ピルビン酸 → アセチル CoA → CO₂（6個の C はここと前段階ですべて CO₂ として出る） | 2 | 8 NADH ＋ 2 FADH₂ |
| **電子伝達系** | **内膜**（クリステ） | NADH/FADH₂ の電子 → O₂ → H₂O。H⁺ が外へくみ出され、**ATP 合成酵素**を通って戻る | 約 34 | — |

合計 ≈ グルコース1分子あたり 38 ATP（酸素を消費するのは最後の段階だけ、CO₂ ができるのは2番目だけ）。

## 酸素が必要な理由
O₂ は**最終的な電子受容体**。なければ電子伝達系が止まり、NADH が NAD⁺ に戻らず、解糖系も止まってしまう — そこで細胞は**発酵**で NAD⁺ を再生する：
| 発酵 | 生物 | ピルビン酸 → | グルコースあたり ATP |
|---|---|---|---|
| アルコール発酵 | 酵母 | エタノール ＋ CO₂ | 2 |
| 乳酸発酵（解糖） | 筋肉（酸素負債）、乳酸菌（ヨーグルト） | 乳酸 | 2 |
発酵は解糖系を再利用するだけで ATP は増えない。解糖系を回し続けるためのもの。

## 呼吸商（RQ）
$RQ = \dfrac{\text{放出した CO}_2}{\text{消費した O}_2}$：炭水化物 1.0、タンパク質 0.8、脂肪 0.7（脂肪は水素が多く O₂ を多く必要とする）。呼吸計で測る：KOH が CO₂ を吸収 → 体積変化 = 消費した O₂。KOH なし → 変化 = O₂ − CO₂。

## 他の燃料
脂肪 → グリセリン ＋ 脂肪酸 → アセチル CoA（β 酸化）。タンパク質 → アミノ酸 → 脱アミノ（NH₃ → 肝臓で尿素）→ 回路の中間体。`,
    },
    exam: {
      en: ['Mitochondrion diagram: identify the matrix, inner membrane, ATP synthase, where NADH is produced/used (most years).', 'Order or assign the stages glycolysis / citric acid cycle / electron transport with their inputs and outputs (O₂, CO₂, pyruvate, ATP counts).', 'RQ from gas volumes; which fermentation produces CO₂ (alcoholic, not lactic).'],
      ja: ['ミトコンドリアの図：マトリックス、内膜、ATP 合成酵素、NADH がつくられる・使われる場所（ほぼ毎年）。', '解糖系／クエン酸回路／電子伝達系の順序や対応、それぞれの入出力（O₂、CO₂、ピルビン酸、ATP の数）。', '気体の体積から RQ。CO₂ を出す発酵はどれか（アルコール発酵。乳酸発酵は出さない）。'],
    },
    traps: {
      en: ['Glycolysis is in the **cytoplasm**, not the mitochondrion, and needs no oxygen.', 'CO₂ is released in the citric acid cycle (and pyruvate → acetyl-CoA), **not** in the electron transport chain; O₂ is used **only** in the chain.', 'Lactic fermentation produces no CO₂; alcoholic fermentation does.'],
      ja: ['解糖系は**細胞質基質**で起こり、ミトコンドリアではなく、酸素も不要。', 'CO₂ が出るのはクエン酸回路（とピルビン酸 → アセチル CoA）であって電子伝達系では**ない**。O₂ を使うのは電子伝達系**だけ**。', '乳酸発酵は CO₂ を出さない。アルコール発酵は出す。'],
    },
    followups: {
      en: ['Explain in simple words how the H⁺ gradient makes ATP (chemiosmosis).', 'Why does fermentation only give 2 ATP?', 'Where exactly do the 6 CO₂ come from?', 'Walk me through an RQ calculation with a respirometer.'],
      ja: ['H⁺ の濃度勾配で ATP ができるしくみ（化学浸透）をやさしく説明して。', '発酵では ATP が 2 個しかできないのはなぜ？', '6 個の CO₂ は正確にはどこから出る？', '呼吸計を使った RQ の計算を順に見せて。'],
    },
  },
  {
    id: 'photosynthesis',
    core: {
      en: 'Photosynthesis is respiration run backwards, in two linked halves: the light reactions on the thylakoid membranes split water (releasing O₂) and charge up ATP and NADPH; the Calvin–Benson cycle in the stroma spends that ATP and NADPH to fix CO₂ into sugar. Oxygen comes from water, not from CO₂.',
      ja: '光合成は呼吸の逆向きで、つながった2つの半分からなる：チラコイド膜の光化学反応（明反応）で水を分解し（O₂ を放出）、ATP と NADPH を充電する。ストロマのカルビン・ベンソン回路がその ATP と NADPH を使って CO₂ を糖に固定する。酸素は水から出るのであって CO₂ からではない。',
    },
    body: {
      en: r`## Overall
$$\mathrm{6CO_2 + 12H_2O \xrightarrow{light} C_6H_{12}O_6 + 6O_2 + 6H_2O}$$
The O₂ comes from H₂O (shown by ¹⁸O tracing). Chlorophyll a/b absorb red and blue light, reflect green (absorption spectrum matches the action spectrum).

## Where things happen
:::fig chloroplast

| part | reactions |
|---|---|
| **thylakoid membrane** (grana) | light reactions: photosystem II, photosystem I, electron transport, ATP synthase |
| **stroma** | Calvin–Benson cycle (CO₂ fixation) |

## Light reactions (thylakoid)
1. **Photosystem II** absorbs light, its excited electrons leave; water is split to replace them: $\mathrm{2H_2O \to O_2 + 4H^+ + 4e^-}$ (**O₂ released here**).
2. Electrons pass along the chain; H⁺ is pumped into the thylakoid space → **ATP** via ATP synthase (photophosphorylation).
3. **Photosystem I** re-excites the electrons and passes them to NADP⁺ → **NADPH**.
Order along the chain: PS II → PS I (named by discovery, not order).

## Calvin–Benson cycle (stroma)
CO₂ + RuBP (C5) → 2 × 3-PGA (C3) [enzyme **rubisco**] → reduced with ATP + NADPH → GAP (triose) → some leaves as sugar, most regenerates RuBP (uses ATP). Per CO₂: 3 ATP + 2 NADPH. Runs in the dark **as long as ATP/NADPH are supplied** ("dark reactions" is a misleading name).

## Limiting factors
Rate vs light intensity rises then plateaus (CO₂ or temperature limiting); rate vs CO₂ likewise; temperature has an optimum (enzymes). **Compensation point**: light intensity where photosynthesis = respiration (net CO₂ exchange zero). **Light-saturation point**: where more light no longer helps. Sun plants: high saturation and compensation points; shade plants: low.
Apparent (measured) photosynthesis = true photosynthesis − respiration.

## Other carbon-fixers
- **C₄ plants** (maize, sugar cane): first fix CO₂ into a C4 acid in mesophyll cells, release it to the Calvin cycle in bundle-sheath cells → efficient at high light/temperature. **CAM plants** (cactus): fix CO₂ at night, use it by day.
- **Photosynthetic bacteria**: green/purple sulfur bacteria use **bacteriochlorophyll** and H₂S instead of water → produce **S**, not O₂. **Cyanobacteria** use water and release O₂ like plants (no chloroplasts; thylakoids in the cell).
- **Chemosynthesis**: nitrifying bacteria, sulfur bacteria oxidise inorganic substances (NH₃ → NO₂⁻ → NO₃⁻; H₂S) for energy instead of light, then fix CO₂.`,
      ja: r`## 全体
$$\mathrm{6CO_2 + 12H_2O \xrightarrow{光} C_6H_{12}O_6 + 6O_2 + 6H_2O}$$
O₂ は H₂O に由来（¹⁸O の追跡実験）。クロロフィル a/b は赤と青の光を吸収し緑を反射（吸収スペクトルと作用スペクトルが一致）。

## 場所
:::fig chloroplast

| 部分 | 反応 |
|---|---|
| **チラコイド膜**（グラナ） | 光化学反応：光化学系 II、光化学系 I、電子伝達、ATP 合成酵素 |
| **ストロマ** | カルビン・ベンソン回路（CO₂ の固定） |

## 光化学反応（チラコイド）
1. **光化学系 II** が光を吸収し、励起された電子が出ていく。その穴を埋めるために水が分解される：$\mathrm{2H_2O \to O_2 + 4H^+ + 4e^-}$（**O₂ はここで発生**）。
2. 電子が伝達系を通り、H⁺ がチラコイド内腔へくみ込まれる → ATP 合成酵素で **ATP**（光リン酸化）。
3. **光化学系 I** が電子を再び励起し NADP⁺ へ → **NADPH**。
伝達系での順序：PS II → PS I（番号は発見順で、反応の順ではない）。

## カルビン・ベンソン回路（ストロマ）
CO₂ ＋ RuBP（C5）→ 3-PGA（C3）2個［酵素 **ルビスコ**］→ ATP ＋ NADPH で還元 → GAP（トリオース）→ 一部は糖として出て、大部分は RuBP を再生（ATP を使う）。CO₂ 1個あたり ATP 3 ＋ NADPH 2。**ATP/NADPH が供給されるかぎり**暗所でも進む（「暗反応」は誤解を招く名前）。

## 限定要因
光の強さと速度：上昇後に頭打ち（CO₂ か温度が限定要因）。CO₂ 濃度も同様。温度には最適値（酵素）。**光補償点**：光合成 = 呼吸となる光の強さ（見かけの CO₂ 出入りが0）。**光飽和点**：それ以上光を強くしても増えない点。陽生植物：飽和点・補償点が高い。陰生植物：低い。
見かけの光合成速度 = 真の光合成速度 − 呼吸速度。

## その他の炭酸固定
- **C₄ 植物**（トウモロコシ、サトウキビ）：葉肉細胞でまず CO₂ を C4 の酸に固定し、維管束鞘細胞でカルビン回路に渡す → 強光・高温で効率的。**CAM 植物**（サボテン）：夜に CO₂ を固定し昼に使う。
- **光合成細菌**：緑色硫黄細菌・紅色硫黄細菌は**バクテリオクロロフィル**を使い、水の代わりに H₂S を使う → O₂ でなく **S** を生じる。**シアノバクテリア**は植物と同じく水を使い O₂ を出す（葉緑体はなく細胞内にチラコイド）。
- **化学合成**：硝化菌や硫黄細菌は光の代わりに無機物の酸化（NH₃ → NO₂⁻ → NO₃⁻。H₂S）でエネルギーを得て CO₂ を固定。'`,
    },
    exam: {
      en: ['Assign reactions (water splitting/O₂ release, light absorption, NADPH formation, CO₂ reduction) to photosystem II / photosystem I / Calvin–Benson cycle (most years).', 'True/false: green sulfur bacteria produce S not O₂; cyanobacteria release O₂ without chloroplasts; O₂ comes from water.', 'Photosynthesis-rate graph: compensation and saturation points for sun vs shade plants; true vs apparent photosynthesis.'],
      ja: ['反応（水の分解・O₂ 発生、光の吸収、NADPH の生成、CO₂ の還元）を光化学系 II／光化学系 I／カルビン・ベンソン回路に対応させる（ほぼ毎年）。', '正誤：緑色硫黄細菌は O₂ でなく S を出す。シアノバクテリアは葉緑体なしで O₂ を出す。O₂ は水に由来。', '光合成速度のグラフ：陽生・陰生植物の光補償点と光飽和点。真の光合成と見かけの光合成。'],
    },
    traps: {
      en: ['O₂ is released at **photosystem II** (water splitting), not at photosystem I and not from CO₂.', 'The Calvin cycle does not need darkness; it needs ATP and NADPH from the light reactions.', 'At the compensation point the plant is **not** growing — net gain is zero.'],
      ja: ['O₂ が出るのは**光化学系 II**（水の分解）であって光化学系 I ではなく、CO₂ 由来でもない。', 'カルビン回路に暗さは不要。必要なのは光化学反応からの ATP と NADPH。', '光補償点では植物は成長して**いない** — 正味の増加が0。'],
    },
    followups: {
      en: ['Why do plants look green?', 'Explain how ¹⁸O experiments proved O₂ comes from water.', 'Compare respiration and photosynthesis side by side.', 'What limits photosynthesis at high light intensity?'],
      ja: ['植物が緑に見えるのはなぜ？', '¹⁸O の実験で O₂ が水由来と証明された方法を説明して。', '呼吸と光合成を並べて比較して。', '強い光のもとで光合成を制限するものは？'],
    },
  },
  {
    id: 'nitrogen-metabolism',
    core: {
      en: 'Plants cannot use N₂ gas. They take up nitrate or ammonium from soil and build amino acids from it (nitrogen assimilation). Only a few bacteria — root-nodule Rhizobium, Azotobacter, Clostridium, the cyanobacterium Nostoc — can break N₂ itself (nitrogen fixation). Nitrifying bacteria turn ammonium into nitrate, and denitrifiers send N₂ back to the air.',
      ja: '植物は N₂ ガスを使えない。土から硝酸イオンやアンモニウムイオンを吸収し、それからアミノ酸をつくる（窒素同化）。N₂ そのものを取り込めるのは少数の細菌だけ — 根粒菌、アゾトバクター、クロストリジウム、シアノバクテリアのネンジュモ（窒素固定）。硝化菌はアンモニウムを硝酸に変え、脱窒菌は N₂ を空気に戻す。',
    },
    body: {
      en: r`## Two words that get confused
| | nitrogen **fixation** | nitrogen **assimilation** |
|---|---|---|
| what | N₂ (air) → NH₄⁺ | NO₃⁻ / NH₄⁺ → amino acids, proteins, nucleic acids, chlorophyll |
| who | only certain **prokaryotes** | all plants (and microbes); animals assimilate from food proteins |
| enzyme | nitrogenase (needs lots of ATP, damaged by O₂) | reductases, transaminases |

## Nitrogen fixers (memorise the list)
- **Root-nodule bacteria** (*Rhizobium*): symbiosis with **legumes** (clover, soybean, peas) — bacteria get sugars, plant gets nitrogen; nodules on roots.
- **Azotobacter** (aerobic, free-living in soil), **Clostridium** (anaerobic, free-living).
- **Cyanobacteria** such as *Nostoc* and *Anabaena* (in heterocysts).
Not fixers: nitrifying bacteria, denitrifying bacteria, ordinary plants, fungi.

## Assimilation in plants
Roots absorb NO₃⁻ → reduced to NO₂⁻ → NH₄⁺ (in leaves/roots, needs reducing power) → combined with a keto acid (glutamic acid → glutamine) → **transamination** spreads the amino group to make the other amino acids → proteins, nucleotides (DNA/RNA), chlorophyll, ATP. Animals cannot make several amino acids (essential amino acids) and get nitrogen from food.

## The nitrogen cycle
:::fig nitrogen-cycle

1. Fixation (bacteria, lightning, Haber process) N₂ → NH₄⁺.
2. **Nitrification** (chemosynthetic bacteria in soil): NH₄⁺ → NO₂⁻ (*Nitrosomonas*) → NO₃⁻ (*Nitrobacter*), gaining energy from the oxidation.
3. Assimilation by plants → food chains.
4. Decomposition (ammonification): dead matter, urea → NH₄⁺ by decomposers.
5. **Denitrification**: NO₃⁻ → N₂ by denitrifying bacteria (anaerobic soils) — returns nitrogen to the air.

## Why it matters on the exam
Questions give a scheme with blanks (nitrogen fixation / assimilation / nitrification / denitrification) and ask which organisms belong where, or list organisms and ask which set fixes nitrogen.`,
      ja: r`## 混同しやすい2つの言葉
| | 窒素**固定** | 窒素**同化** |
|---|---|---|
| 内容 | N₂（空気）→ NH₄⁺ | NO₃⁻／NH₄⁺ → アミノ酸、タンパク質、核酸、クロロフィル |
| 誰が | 特定の**原核生物**だけ | すべての植物（と微生物）。動物は食物のタンパク質から同化 |
| 酵素 | ニトロゲナーゼ（多量の ATP が必要、O₂ で壊れる） | 還元酵素、アミノ基転移酵素 |

## 窒素固定生物（リストを暗記）
- **根粒菌**（リゾビウム）：**マメ科植物**（クローバー、ダイズ、エンドウ）と共生 — 細菌は糖をもらい、植物は窒素をもらう。根に根粒。
- **アゾトバクター**（好気性、土壌に単独生活）、**クロストリジウム**（嫌気性、単独生活）。
- **シアノバクテリア**の**ネンジュモ**、アナベナ（異質細胞で固定）。
固定しないもの：硝化菌、脱窒菌、ふつうの植物、菌類。

## 植物の窒素同化
根が NO₃⁻ を吸収 → NO₂⁻ に還元 → NH₄⁺（葉や根で、還元力が必要）→ ケト酸と結合（グルタミン酸 → グルタミン）→ **アミノ基転移**でアミノ基を分配し他のアミノ酸をつくる → タンパク質、ヌクレオチド（DNA/RNA）、クロロフィル、ATP。動物はいくつかのアミノ酸をつくれず（必須アミノ酸）、窒素は食物から得る。

## 窒素循環
:::fig nitrogen-cycle

1. 固定（細菌、雷、ハーバー法）N₂ → NH₄⁺。
2. **硝化**（土壌の化学合成細菌）：NH₄⁺ → NO₂⁻（亜硝酸菌）→ NO₃⁻（硝酸菌）。酸化でエネルギーを得る。
3. 植物の同化 → 食物連鎖。
4. 分解（アンモニア化）：死骸や尿素 → 分解者が NH₄⁺ に。
5. **脱窒**：脱窒菌が NO₃⁻ → N₂（嫌気的な土壌）— 窒素を空気に戻す。

## 出題のされ方
窒素固定／窒素同化／硝化／脱窒の空欄のある図を与えて、どの生物がどこに入るかを問う。または生物を列挙して窒素固定するものの組を選ばせる。`,
    },
    exam: {
      en: ['Which set of organisms performs nitrogen fixation (Rhizobium, Azotobacter, Clostridium, Nostoc) (most years).', 'Fill blanks: nitrogen assimilation vs fixation, role of root-nodule bacteria, products (protein, nucleic acid).', 'Nitrification steps and which bacteria do them; what denitrification does.'],
      ja: ['窒素固定を行う生物の組はどれか（根粒菌、アゾトバクター、クロストリジウム、ネンジュモ）（ほぼ毎年）。', '空欄：窒素同化と窒素固定、根粒菌の役割、生成物（タンパク質、核酸）。', '硝化の段階とそれを行う細菌。脱窒は何をするか。'],
    },
    traps: {
      en: ['Legumes themselves do **not** fix nitrogen; the bacteria in their nodules do.', 'Nitrifying bacteria **oxidise** ammonium (they are chemosynthetic) — they do not fix N₂.', 'Assimilation makes organic nitrogen; fixation only makes ammonium.'],
      ja: ['マメ科植物自身は窒素固定**しない**。根粒の中の細菌がする。', '硝化菌はアンモニウムを**酸化**する（化学合成細菌）— N₂ を固定するのではない。', '同化は有機窒素をつくる。固定はアンモニウムをつくるだけ。'],
    },
    followups: {
      en: ['Why can only some bacteria fix nitrogen?', 'Explain the symbiosis between legumes and Rhizobium.', 'Walk through the nitrogen cycle step by step with the organisms.', 'How do nitrifying bacteria get energy without light?'],
      ja: ['一部の細菌しか窒素固定できないのはなぜ？', 'マメ科植物と根粒菌の共生を説明して。', '窒素循環を生物の名前つきで順に説明して。', '硝化菌は光なしでどうやってエネルギーを得る？'],
    },
  },
  // ───────────────────────────── GENETICS ─────────────────────────────
  {
    id: 'dna-replication',
    core: {
      en: 'DNA is two antiparallel strands held by base pairs (A–T, G–C), so each strand is a template for the other. Replication opens the helix (helicase), and DNA polymerase copies each strand only in the 5′→3′ direction — continuously on one strand, in short pieces on the other. Every new DNA is half old, half new (semiconservative).',
      ja: 'DNA は逆平行の2本の鎖が塩基対（A–T、G–C）で結ばれたもので、各鎖がもう一方の鋳型になる。複製ではらせんが開かれ（ヘリカーゼ）、DNA ポリメラーゼが各鎖を 5′→3′ 方向にだけ写す — 一方は連続的に、もう一方は短い断片で。新しい DNA はどれも半分が古く半分が新しい（半保存的複製）。',
    },
    body: {
      en: r`## Structure
- Nucleotide = phosphate + **deoxyribose** + base (A, T, G, C). Chain: sugar–phosphate backbone, bases inside.
- **Double helix** (Watson & Crick, 1953): two strands, **antiparallel** (one 5′→3′, the other 3′→5′), held by hydrogen bonds: **A=T (2 bonds), G≡C (3 bonds)**.
- Chargaff: A = T, G = C, so A + G = T + C. If A is 30%, T is 30%, G and C are 20% each. Base **sequence** carries information; gene = a stretch coding for one protein.
- RNA: **ribose**, **U instead of T**, single strand; mRNA, tRNA, rRNA.
- In eukaryotes DNA wraps around histones → chromatin → chromosomes at division. Human: 46 chromosomes (23 pairs), ~3 × 10⁹ base pairs.

## Replication (S phase)
:::fig replication-fork

1. **Helicase** unwinds the helix and breaks the hydrogen bonds → replication fork.
2. **Primer** (short RNA) laid down by primase.
3. **DNA polymerase** adds nucleotides complementary to the template, always to the **3′ end** of the growing strand, so synthesis runs **5′→3′**.
4. Because the strands are antiparallel: the **leading strand** is made continuously toward the fork; the **lagging strand** is made away from the fork in short **Okazaki fragments**, later joined by **DNA ligase**.
5. Result: two identical molecules, each with one old and one new strand = **semiconservative** (Meselson–Stahl: ¹⁵N/¹⁴N density experiment — after one generation all hybrid, after two 1:1 hybrid:light).

## Evidence DNA is the genetic material
- Griffith → Avery: transformation of pneumococcus by DNA.
- Hershey–Chase: phage DNA (³²P) enters the bacterium, protein (³⁵S) does not.

## Quick calculations
- Fragment of $N$ base pairs → $N/10$ turns (10 bp per turn, 3.4 nm).
- Number of hydrogen bonds = 2(A) + 3(G).
- One gene of 300 bp codes for ≤ 100 amino acids (3 bases per codon).`,
      ja: r`## 構造
- ヌクレオチド = リン酸 ＋ **デオキシリボース** ＋ 塩基（A、T、G、C）。鎖：糖–リン酸の骨格、塩基は内側。
- **二重らせん**（ワトソン・クリック、1953）：2本の鎖が**逆平行**（片方 5′→3′、他方 3′→5′）で水素結合でつながる：**A=T（2本）、G≡C（3本）**。
- シャルガフ：A = T、G = C なので A ＋ G = T ＋ C。A が 30% なら T も 30%、G と C は各 20%。塩基の**配列**が情報。遺伝子 = 1つのタンパク質を指定する領域。
- RNA：**リボース**、**T の代わりに U**、1本鎖。mRNA、tRNA、rRNA。
- 真核生物では DNA がヒストンに巻きつき → クロマチン → 分裂時に染色体。ヒト：46 本（23 対）、約 3 × 10⁹ 塩基対。

## 複製（S 期）
:::fig replication-fork

1. **DNA ヘリカーゼ**がらせんをほどき水素結合を切る → 複製フォーク。
2. **プライマー**（短い RNA）がプライマーゼによって置かれる。
3. **DNA ポリメラーゼ**が鋳型と相補的なヌクレオチドを、伸びる鎖の**3′ 末端**に必ずつなぐので、合成は **5′→3′** 方向。
4. 鎖が逆平行なので：**リーディング鎖**はフォークに向かって連続的に、**ラギング鎖**はフォークから離れる向きに短い**岡崎フラグメント**として合成され、後で **DNA リガーゼ**がつなぐ。
5. 結果：同一の2分子。それぞれ古い鎖1本と新しい鎖1本 = **半保存的複製**（メセルソン・スタール：¹⁵N/¹⁴N の密度実験 — 1世代後はすべて中間、2世代後は中間：軽い = 1:1）。

## DNA が遺伝物質である証拠
- グリフィス → エイブリー：肺炎双球菌の DNA による形質転換。
- ハーシー・チェイス：ファージの DNA（³²P）は細菌に入り、タンパク質（³⁵S）は入らない。

## 簡単な計算
- $N$ 塩基対の断片 → $N/10$ 回転（1回転 10 塩基対、3.4 nm）。
- 水素結合の数 = 2(A) ＋ 3(G)。
- 300 塩基対の遺伝子は最大 100 個のアミノ酸を指定（コドンは 3 塩基）。`,
    },
    exam: {
      en: ['Choose the diagram showing correct replication direction (5′→3′ on both strands, Okazaki fragments on the lagging strand) (most years).', 'Fill blanks naming helicase, DNA polymerase, 5′→3′, semiconservative.', 'Base percentages from Chargaff\'s rules; Meselson–Stahl density bands after n generations.'],
      ja: ['正しい複製の向きを示す図を選ぶ（両鎖とも 5′→3′、ラギング鎖に岡崎フラグメント）（ほぼ毎年）。', '空欄：ヘリカーゼ、DNA ポリメラーゼ、5′→3′、半保存的複製。', 'シャルガフの法則から塩基の割合。メセルソン・スタールの n 世代後のバンド。'],
    },
    traps: {
      en: ['DNA polymerase can only add to the 3′ end — that single fact explains Okazaki fragments.', 'A pairs with T in DNA but with **U** in RNA.', 'A = T applies to double-stranded DNA, not to a single strand or to mRNA.'],
      ja: ['DNA ポリメラーゼは 3′ 末端にしかつなげない — この1つの事実が岡崎フラグメントを説明する。', 'A は DNA では T と、RNA では **U** と対になる。', 'A = T が成り立つのは二本鎖 DNA であって、1本鎖や mRNA ではない。'],
    },
    followups: {
      en: ['Why must one strand be made in Okazaki fragments?', 'Explain the Meselson–Stahl experiment and predict the bands after 3 generations.', 'What is the difference between DNA and RNA in three points?', 'If a DNA sample is 22% G, what are the other percentages?'],
      ja: ['片方の鎖が岡崎フラグメントとして合成される理由は？', 'メセルソン・スタールの実験を説明して、3世代後のバンドを予想して。', 'DNA と RNA の違いを3点で。', 'DNA 試料の G が 22% のとき他の塩基の割合は？'],
    },
  },
  {
    id: 'transcription-translation',
    core: {
      en: 'A gene is read in two steps: transcription copies it into mRNA (RNA polymerase, starting at a promoter), and translation reads the mRNA three bases at a time (codons) on a ribosome, with tRNA bringing the amino acid that matches each codon. In eukaryotes the first RNA copy contains introns that are cut out (splicing) before it leaves the nucleus.',
      ja: '遺伝子は2段階で読まれる：転写で mRNA に写し（RNA ポリメラーゼ、プロモーターから開始）、翻訳でリボソーム上で mRNA を3塩基ずつ（コドン）読み、tRNA が各コドンに合うアミノ酸を運ぶ。真核生物では最初の RNA にイントロンが含まれ、核を出る前に切り取られる（スプライシング）。',
    },
    body: {
      en: r`## Central dogma
DNA → (transcription) → mRNA → (translation) → protein. Information flows one way (reverse transcription in retroviruses is the exception).

## Transcription (nucleus)
1. **RNA polymerase** binds the **promoter** (start signal on DNA).
2. It opens the DNA and uses **one strand (the template/antisense strand)** to build mRNA 5′→3′ with complementary bases — **U in place of T**. mRNA has the same sequence as the non-template (sense) strand, with U for T.
3. Eukaryotes: the primary transcript (**pre-mRNA**) contains **exons** (kept) and **introns** (removed). **Splicing** cuts out introns and joins exons; a cap and poly-A tail are added; the mature mRNA leaves through nuclear pores. **Alternative splicing** lets one gene give several proteins.
Prokaryotes: no introns, no nucleus — translation starts while transcription is still running.

## Translation (ribosome, cytoplasm / rough ER)
- mRNA is read in **codons** (3 bases). 4³ = 64 codons: 61 code for amino acids (20 kinds → the code is **degenerate**), **AUG** = start (methionine), **UAA, UAG, UGA** = stop.
- **tRNA**: clover-leaf, carries a specific amino acid at one end and an **anticodon** complementary to the codon at the other.
- Ribosome (rRNA + protein, from the nucleolus) moves along mRNA 5′→3′; amino acids are joined by peptide bonds; polypeptide grows from the N-terminus.
- The genetic code is (almost) **universal** — the same in bacteria and humans — which is why human genes work in *E. coli*.

## Reading a codon table
Given mRNA 5′-AUG GCU UAA-3′ → Met-Ala-stop. From the DNA template strand, first write the complementary mRNA (A↔U, T↔A, G↔C), then translate. Deleting or inserting one base shifts the frame (frameshift); substituting one may change one amino acid or nothing (degeneracy).

:::fig central-dogma

## Gene expression control (brief)
Not all genes are on in every cell: transcription factors bind near the promoter; lactose operon in *E. coli* (repressor removed by lactose); in eukaryotes, chromatin packing and hormones (steroids enter the nucleus) regulate expression. Puffs in giant chromosomes show active transcription.`,
      ja: r`## セントラルドグマ
DNA →（転写）→ mRNA →（翻訳）→ タンパク質。情報は一方向に流れる（レトロウイルスの逆転写が例外）。

## 転写（核内）
1. **RNA ポリメラーゼ**が**プロモーター**（DNA 上の開始の目印）に結合。
2. DNA を開き、**片方の鎖（鋳型鎖／アンチセンス鎖）**を使って相補的な塩基で mRNA を 5′→3′ に合成 — **T の代わりに U**。mRNA の配列は鋳型でない鎖（センス鎖）と同じで、T が U になったもの。
3. 真核生物：最初の転写産物（**mRNA 前駆体**）は**エキソン**（残る）と**イントロン**（除かれる）を含む。**スプライシング**でイントロンを切り出しエキソンをつなぐ。キャップとポリ A 尾部がつき、成熟 mRNA が核膜孔から出る。**選択的スプライシング**で1つの遺伝子から複数のタンパク質ができる。
原核生物：イントロンも核もない — 転写の途中で翻訳が始まる。

## 翻訳（リボソーム、細胞質／粗面小胞体）
- mRNA は**コドン**（3塩基）単位で読まれる。4³ = 64 コドン：61 がアミノ酸を指定（20 種 → コードは**縮重**している）、**AUG** = 開始（メチオニン）、**UAA、UAG、UGA** = 終止。
- **tRNA**：クローバー葉型、一端に特定のアミノ酸、他端にコドンと相補的な**アンチコドン**。
- リボソーム（rRNA ＋ タンパク質、核小体でつくられる）が mRNA 上を 5′→3′ に移動。アミノ酸はペプチド結合でつながり、ポリペプチドは N 末端から伸びる。
- 遺伝暗号は（ほぼ）**共通** — 細菌でもヒトでも同じ — だからヒトの遺伝子が大腸菌ではたらく。

## コドン表の読み方
mRNA 5′-AUG GCU UAA-3′ → Met-Ala-終止。DNA の鋳型鎖からは、まず相補的な mRNA を書き（A↔U、T↔A、G↔C）、それから翻訳。1塩基の欠失・挿入は読み枠をずらす（フレームシフト）。1塩基の置換はアミノ酸1個が変わるか何も変わらない（縮重）。

:::fig central-dogma

## 遺伝子発現の調節（簡単に）
すべての遺伝子がすべての細胞ではたらくわけではない：転写調節因子がプロモーター付近に結合。大腸菌のラクトースオペロン（ラクトースがリプレッサーを外す）。真核生物ではクロマチンの凝縮やホルモン（ステロイドは核に入る）が発現を調節。だ腺染色体のパフは転写が活発な場所。`,
    },
    exam: {
      en: ['Deduce a codon from synthetic-mRNA repeat experiments (poly-U → Phe; UCUCUC… → Ser-Leu) or from a codon table for a point-mutation case (most years).', 'Fill blanks on transcription/splicing: RNA polymerase, promoter, pre-mRNA, introns removed, exons joined.', 'Given a DNA template, write the mRNA and the amino-acid sequence; count amino acids up to the stop codon.'],
      ja: ['人工 mRNA の繰り返し実験（ポリ U → Phe。UCUCUC… → Ser-Leu）や点突然変異の例のコドン表からコドンを推定（ほぼ毎年）。', '転写・スプライシングの空欄：RNA ポリメラーゼ、プロモーター、mRNA 前駆体、イントロン除去、エキソン結合。', 'DNA 鋳型鎖から mRNA とアミノ酸配列を書く。終止コドンまでのアミノ酸数。'],
    },
    traps: {
      en: ['mRNA is complementary to the **template** strand and identical (with U) to the other strand — check which strand the question gives.', 'Stop codons code for **no** amino acid; AUG codes for Met **and** starts translation.', 'Introns are removed from the **RNA**, not from the DNA.'],
      ja: ['mRNA は**鋳型**鎖と相補的で、もう一方の鎖と（U を除いて）同じ — 問題がどちらの鎖を示しているか確認。', '終止コドンはアミノ酸を指定**しない**。AUG は Met を指定し**かつ**翻訳を開始する。', 'イントロンは **RNA** から除かれる。DNA からではない。'],
    },
    followups: {
      en: ['Walk me through translating 3′-TACGGACCTATT-5′ (template strand).', 'Why is the genetic code called degenerate, and why does that protect against mutations?', 'What is alternative splicing and why does it matter?', 'How did the poly-U experiment decode the first codon?'],
      ja: ['鋳型鎖 3′-TACGGACCTATT-5′ の翻訳を順にやって。', '遺伝暗号が「縮重」と呼ばれるのはなぜで、それがなぜ突然変異への保険になる？', '選択的スプライシングとは何で、なぜ重要？', 'ポリ U の実験で最初のコドンがどう解読された？'],
    },
  },
  {
    id: 'genetic-engineering',
    core: {
      en: 'Because the genetic code is universal, a human gene pasted into a bacterial plasmid is expressed by the bacterium. The toolkit is small: restriction enzymes cut DNA at specific sequences, DNA ligase pastes, plasmids/viruses carry (vectors), PCR copies a chosen stretch millions of times using primers, heat and a heat-stable DNA polymerase, and electrophoresis sorts fragments by size.',
      ja: '遺伝暗号が共通なので、細菌のプラスミドに貼り込んだヒトの遺伝子は細菌で発現する。道具は少ない：制限酵素は特定の配列で DNA を切り、DNA リガーゼが貼り、プラスミドやウイルスが運び（ベクター）、PCR はプライマー・熱・耐熱性 DNA ポリメラーゼで目的の領域を何百万倍にも複製し、電気泳動が断片を大きさで分ける。',
    },
    body: {
      en: r`## Making recombinant DNA (e.g. human insulin in *E. coli*)
:::fig recombinant

1. Cut the human insulin gene and a bacterial **plasmid** (small circular DNA) with the **same restriction enzyme** → matching sticky ends.
2. Join with **DNA ligase** → recombinant plasmid.
3. Put it into *E. coli* (transformation); the bacterium **expresses** the gene (transcription + translation) and makes human insulin. Select transformed cells with an antibiotic-resistance marker on the plasmid.
Vectors: plasmids (bacteria), *Agrobacterium* Ti plasmid (plants — gene transfer into plant cells → transgenic crops), viruses (animal cells).

## PCR (polymerase chain reaction)
Copies a target DNA region exponentially. Per cycle:
1. **~95 °C**: heat separates the strands (breaks the **hydrogen bonds**).
2. **~55–60 °C**: two **primers** (short single-stranded DNA) anneal to the ends of the target on each strand.
3. **~72 °C**: heat-stable **DNA polymerase** (Taq, from a hot-spring bacterium) extends the primers 5′→3′.
$n$ cycles → $2^n$ copies (30 cycles ≈ 10⁹). Needs: template, primers, nucleotides, polymerase; no helicase (heat does that job).

## Electrophoresis
DNA is negatively charged (phosphates) → moves toward the **+ electrode** through a gel; **shorter fragments move farther**. Used for DNA fingerprinting, checking PCR products, sequencing.

## Other techniques
- **DNA sequencing** (Sanger; now next-generation) reads base order. Human Genome Project.
- **Gene knockout / genome editing** (CRISPR-Cas9): cut a chosen site to disable or replace a gene.
- **GFP** (green fluorescent protein): reporter to see where a gene is expressed.
- Cloning (nuclear transfer, Dolly), iPS cells (Yamanaka: reprogrammed adult cells, Japanese Nobel 2012), ES cells.
- Transgenic organisms: Bt cotton, golden rice, insulin, growth hormone, vaccines.

## Why it works
The genetic code and the transcription/translation machinery are shared by all life, so DNA from one species is read correctly by another. (Eukaryotic genes with introns are inserted as **cDNA** made from mRNA, since bacteria cannot splice.)`,
      ja: r`## 組換え DNA をつくる（例：大腸菌でヒトインスリン）
:::fig recombinant

1. ヒトのインスリン遺伝子と細菌の**プラスミド**（小さな環状 DNA）を**同じ制限酵素**で切る → 対応する付着末端。
2. **DNA リガーゼ**でつなぐ → 組換えプラスミド。
3. 大腸菌に導入（形質転換）。細菌がその遺伝子を**発現**し（転写＋翻訳）ヒトインスリンをつくる。プラスミド上の抗生物質耐性遺伝子で形質転換した細胞を選抜。
ベクター：プラスミド（細菌）、アグロバクテリウムの Ti プラスミド（植物 — 植物細胞への遺伝子導入 → 遺伝子組換え作物）、ウイルス（動物細胞）。

## PCR（ポリメラーゼ連鎖反応）
目的の DNA 領域を指数的に増やす。1サイクル：
1. **約 95 ℃**：熱で鎖を分ける（**水素結合**を切る）。
2. **約 55〜60 ℃**：2種の**プライマー**（短い1本鎖 DNA）が各鎖の目的領域の端に結合。
3. **約 72 ℃**：耐熱性 **DNA ポリメラーゼ**（Taq、温泉の細菌由来）がプライマーを 5′→3′ に伸長。
$n$ サイクル → $2^n$ 倍（30 サイクル ≈ 10⁹）。必要なもの：鋳型、プライマー、ヌクレオチド、ポリメラーゼ。ヘリカーゼは不要（熱がその役割）。

## 電気泳動
DNA は負に帯電（リン酸）→ ゲル中を **＋ 極**へ移動。**短い断片ほど遠くへ**進む。DNA 鑑定、PCR 産物の確認、塩基配列決定に使う。

## その他の技術
- **塩基配列決定**（サンガー法。現在は次世代シーケンサー）。ヒトゲノム計画。
- **遺伝子ノックアウト／ゲノム編集**（CRISPR-Cas9）：目的の部位を切って遺伝子を壊す・置きかえる。
- **GFP**（緑色蛍光タンパク質）：遺伝子がどこで発現するかを見るレポーター。
- クローン（核移植、ドリー）、iPS 細胞（山中：成体細胞の初期化、2012年ノーベル賞）、ES 細胞。
- 遺伝子組換え生物：Bt 綿、ゴールデンライス、インスリン、成長ホルモン、ワクチン。

## なぜうまくいくか
遺伝暗号と転写・翻訳のしくみは全生物で共通なので、ある種の DNA を別の種が正しく読める。（イントロンをもつ真核生物の遺伝子は、細菌がスプライシングできないので mRNA からつくった **cDNA** として導入する。）`,
    },
    exam: {
      en: ['Insulin-production scheme: label A (human insulin gene), B (plasmid), C (*E. coli*); which enzymes cut and join (most years).', 'Fill PCR blanks: hydrogen bonds broken by heat, primers, heat-stable DNA polymerase; copies after n cycles.', 'Electrophoresis: which band is the shortest fragment; direction of migration.'],
      ja: ['インスリン生産の図：A（ヒトインスリン遺伝子）、B（プラスミド）、C（大腸菌）。切る酵素とつなぐ酵素（ほぼ毎年）。', 'PCR の空欄：熱で水素結合を切る、プライマー、耐熱性 DNA ポリメラーゼ。n サイクル後のコピー数。', '電気泳動：最も短い断片のバンドはどれか。移動の向き。'],
    },
    traps: {
      en: ['PCR uses **heat**, not helicase, to separate strands; that is why the polymerase must be heat-stable.', 'Restriction enzymes cut; ligase joins — not the other way round.', 'In electrophoresis DNA moves toward **+**, and small pieces travel **farther**.'],
      ja: ['PCR は鎖を分けるのにヘリカーゼでなく**熱**を使う。だからポリメラーゼは耐熱性でなければならない。', '制限酵素は切る。リガーゼはつなぐ — 逆ではない。', '電気泳動で DNA は **＋** 極へ動き、小さい断片ほど**遠く**へ行く。'],
    },
    followups: {
      en: ['Why do we need the same restriction enzyme for the gene and the plasmid?', 'Explain each temperature step of PCR and why Taq polymerase is used.', 'Why can bacteria express human genes?', 'How many DNA copies after 20 PCR cycles?'],
      ja: ['遺伝子とプラスミドに同じ制限酵素を使うのはなぜ？', 'PCR の各温度の段階と Taq ポリメラーゼを使う理由を説明して。', '細菌がヒトの遺伝子を発現できるのはなぜ？', 'PCR 20 サイクル後の DNA のコピー数は？'],
    },
  },
  {
    id: 'mendelian-linkage',
    core: {
      en: 'Each trait comes from a pair of alleles, one from each parent; gametes carry one of the pair (segregation), and different genes are shuffled independently unless they sit on the same chromosome (linkage). Linked genes stay together except when crossing over swaps them, and the fraction of recombinant offspring measures how far apart they are on the chromosome.',
      ja: '形質は両親から1つずつ受け取った対立遺伝子の対で決まる。配偶子は対のうち1つを運び（分離）、異なる遺伝子は独立に組み合わさる — 同じ染色体にある場合（連鎖）を除いて。連鎖した遺伝子は乗換えで入れかわる場合を除いて一緒に伝わり、組換えを起こした子の割合が染色体上の距離を表す。',
    },
    body: {
      en: r`## Words
Gene (a unit on a chromosome), **allele** (a version, A or a), **genotype** (AA, Aa, aa), **phenotype** (what you see), homozygous/heterozygous, **dominant** (shows in Aa), recessive. Diploid body cells carry two alleles; gametes (haploid) carry one.

## Mendel's laws
1. **Segregation**: Aa → gametes A : a = 1 : 1. Aa × Aa → AA : Aa : aa = 1 : 2 : 1, phenotypes 3 : 1.
2. **Independent assortment** (genes on different chromosomes): AaBb → gametes AB : Ab : aB : ab = 1 : 1 : 1 : 1; AaBb × AaBb → 9 : 3 : 3 : 1.
3. **Test cross** (× aabb) reveals the gamete ratio of the unknown parent directly: offspring ratio = gamete ratio.

Extensions: **incomplete dominance** (red × white → pink, 1 : 2 : 1), **codominance** (ABO blood: Iᴬ, Iᴮ codominant, i recessive → AB has both; A parent can be IᴬIᴬ or Iᴬi), **multiple alleles**, **lethal alleles** (yellow mice 2 : 1), **complementary genes** (9 : 7), **sex-linked** genes on X (colour blindness: carrier mother → half of sons affected).

## Linkage and crossing over
:::fig linkage

Genes on the **same chromosome** are **linked** and tend to travel together: AaBb with A–B on one chromosome and a–b on the other (coupling) gives mostly AB and ab gametes. During meiosis I, **crossing over** between homologous chromatids can swap segments → **recombinant** gametes Ab and aB.
$$\text{recombination frequency} = \frac{\text{recombinant offspring}}{\text{total offspring}} \times 100\%$$ (from a test cross). It is < 50% for linked genes; the farther apart, the more often crossing over happens between them → **gene mapping** (1% = 1 map unit; distances add along a chromosome: if A–B = 3, B–C = 5, A–C = 8 or 2).

Example: test cross of AaBb gives AB : Ab : aB : ab = 8 : 1 : 1 : 8 → recombinants 2/18 = 11%. If the parent were in **repulsion** (Ab / aB), the majority classes would be Ab and aB instead. Complete linkage: only two classes (1 : 1).

## Chromosome theory
Genes are on chromosomes (Morgan, fruit fly); homologous chromosomes pair and separate in meiosis, which is the physical basis of segregation; independent assortment = random orientation of chromosome pairs at metaphase I.`,
      ja: r`## 用語
遺伝子（染色体上の単位）、**対立遺伝子**（型、A や a）、**遺伝子型**（AA、Aa、aa）、**表現型**（見た目）、ホモ接合／ヘテロ接合、**顕性（優性）**（Aa で現れる）、潜性（劣性）。二倍体の体細胞は対立遺伝子を2つ、配偶子（単相）は1つもつ。

## メンデルの法則
1. **分離の法則**：Aa → 配偶子 A : a = 1 : 1。Aa × Aa → AA : Aa : aa = 1 : 2 : 1、表現型 3 : 1。
2. **独立の法則**（異なる染色体上の遺伝子）：AaBb → 配偶子 AB : Ab : aB : ab = 1 : 1 : 1 : 1。AaBb × AaBb → 9 : 3 : 3 : 1。
3. **検定交雑**（× aabb）は未知の親の配偶子の比をそのまま示す：子の比 = 配偶子の比。

拡張：**不完全顕性**（赤 × 白 → 桃、1 : 2 : 1）、**共顕性**（ABO 血液型：Iᴬ と Iᴮ が共顕性、i が潜性 → AB 型は両方をもつ。A 型の親は IᴬIᴬ か Iᴬi）、**複対立遺伝子**、**致死遺伝子**（黄色マウス 2 : 1）、**補足遺伝子**（9 : 7）、X 染色体上の**伴性遺伝**（色覚異常：保因者の母 → 息子の半数が発症）。

## 連鎖と乗換え
:::fig linkage

**同じ染色体**上の遺伝子は**連鎖**していて一緒に伝わりやすい：A–B が一方の染色体に、a–b が他方にある AaBb（相引）は主に AB と ab の配偶子をつくる。減数第一分裂で相同染色体の染色分体間に**乗換え**が起こると断片が入れかわる → **組換え**配偶子 Ab と aB。
$$\text{組換え価} = \frac{\text{組換えを起こした子}}{\text{全体の子}} \times 100\%$$（検定交雑から）。連鎖した遺伝子では 50% 未満。遠いほど間で乗換えが起こりやすい → **染色体地図**（1% = 1 単位。距離は染色体上で足せる：A–B = 3、B–C = 5 なら A–C = 8 か 2）。

例：AaBb の検定交雑で AB : Ab : aB : ab = 8 : 1 : 1 : 8 → 組換え 2/18 = 11%。親が**相反**（Ab / aB）なら多数派は Ab と aB になる。完全連鎖：2種類だけ（1 : 1）。

## 染色体説
遺伝子は染色体上にある（モーガン、ショウジョウバエ）。相同染色体が減数分裂で対合し分離することが分離の法則の物理的な根拠。独立の法則 = 第一分裂中期での染色体対のランダムな向き。`,
    },
    exam: {
      en: ['From a test-cross ratio (e.g. 8 : 1 : 1 : 8) compute the recombination frequency; determine which gametes are recombinant and when crossing over happened (meiosis I) (most years).', 'Gene map order/distances from three recombination frequencies.', 'Blood-type or sex-linked inheritance: possible genotypes of parents and children.'],
      ja: ['検定交雑の比（例 8 : 1 : 1 : 8）から組換え価。組換え配偶子はどれで、乗換えはいつ起こったか（減数第一分裂）（ほぼ毎年）。', '3つの組換え価から遺伝子の並び順と距離。', '血液型や伴性遺伝：親と子の可能な遺伝子型。'],
    },
    traps: {
      en: ['Recombinant classes are the **minority** in a test cross; identify them before computing the frequency.', 'A 1 : 1 : 1 : 1 test-cross ratio means the genes are on different chromosomes (or so far apart they look unlinked).', 'Recombination frequency never exceeds 50%.'],
      ja: ['検定交雑で組換え型は**少数派**。組換え価を計算する前にどれが組換え型か見極める。', '検定交雑の比が 1 : 1 : 1 : 1 なら遺伝子は別の染色体上（または連鎖していないように見えるほど遠い）。', '組換え価は 50% を超えない。'],
    },
    followups: {
      en: ['Why is the recombination frequency at most 50%?', 'Show me how to build a gene map from A–B 12%, B–C 5%, A–C 7%.', 'Explain coupling vs repulsion with a test cross example.', 'Why do only sons usually show X-linked recessive traits?'],
      ja: ['組換え価が最大 50% なのはなぜ？', 'A–B 12%、B–C 5%、A–C 7% から染色体地図をつくる方法を見せて。', '検定交雑の例で相引と相反を説明して。', 'X 連鎖の潜性形質がふつう息子にだけ現れるのはなぜ？'],
    },
  },
  {
    id: 'mutation',
    core: {
      en: 'A mutation is a change in the DNA sequence. Swapping one base may change one amino acid (sickle-cell anaemia: GAG→GTG, Glu→Val) or nothing (silent); inserting or deleting a base shifts the reading frame and wrecks everything after it. Mutations in body cells affect only that individual; mutations in gametes are inherited and are the raw material of evolution.',
      ja: '突然変異は DNA 配列の変化。1塩基の置換はアミノ酸1個を変える（鎌状赤血球貧血：GAG→GTG、Glu→Val）か、何も変えない（同義置換）。1塩基の挿入や欠失は読み枠をずらし、それ以降を壊す。体細胞の突然変異はその個体だけに影響し、配偶子の突然変異は遺伝して進化の材料になる。',
    },
    body: {
      en: r`## Types of gene mutation
| type | DNA change | effect on protein |
|---|---|---|
| **substitution** (point mutation) | one base swapped | **missense** (one amino acid changes), **nonsense** (creates a stop codon → truncated protein), or **silent** (same amino acid, thanks to degeneracy) |
| **insertion / deletion** | one or more bases added/removed | **frameshift** if not a multiple of 3 — every codon downstream changes, usually a stop appears early |
| (in-frame indel) | 3 bases | one amino acid added/removed |

## Sickle-cell anaemia — the standard example
β-globin gene: **GAG → GTG** (DNA) ⇒ mRNA GAG → GUG ⇒ **glutamic acid → valine** at position 6. Haemoglobin S sticks together at low O₂ → sickle-shaped red cells → anaemia, blocked capillaries. Heterozygotes (HbA/HbS) are mostly healthy and **resistant to malaria** — a classic case of natural selection keeping a harmful allele common (heterozygote advantage).
Other examples: phenylketonuria, albinism (enzyme missing), cystic fibrosis, Huntington's (dominant).

## Chromosome mutations
Change in structure (deletion, duplication, inversion, translocation) or number: **aneuploidy** (Down syndrome = trisomy 21, from nondisjunction in meiosis), **polyploidy** (3n, 4n — common in plants: seedless watermelon 3n, wheat 6n).

## Causes and repair
Spontaneous replication errors (~1 in 10⁹ after proofreading), **mutagens**: UV (thymine dimers), X-rays/γ-rays, chemicals (nitrous acid, benzopyrene). Cells repair most damage; failures accumulate → cancer (mutations in oncogenes / tumour suppressors such as p53).

## Somatic vs germline
Somatic (body cell) mutation: not inherited, may cause cancer. Germline (gamete) mutation: passed to offspring → source of new alleles → **genetic variation** on which selection acts.

## Reading a mutation question
Given a codon table and a normal vs mutant sequence: (1) align, (2) find the changed base, (3) translate both, (4) classify (missense / nonsense / silent / frameshift).`,
      ja: r`## 遺伝子突然変異の種類
| 種類 | DNA の変化 | タンパク質への影響 |
|---|---|---|
| **置換**（点突然変異） | 1塩基が入れかわる | **ミスセンス**（アミノ酸1個が変わる）、**ナンセンス**（終止コドンができる → 短いタンパク質）、**同義（サイレント）**（縮重のためアミノ酸は同じ） |
| **挿入／欠失** | 1個以上の塩基が入る／抜ける | 3の倍数でなければ**フレームシフト** — 下流のコドンがすべて変わり、ふつう早く終止が現れる |
| （枠内の挿入欠失） | 3塩基 | アミノ酸1個の追加／欠失 |

## 鎌状赤血球貧血 — 標準的な例
β グロビン遺伝子：**GAG → GTG**（DNA）⇒ mRNA GAG → GUG ⇒ 6番目の**グルタミン酸 → バリン**。ヘモグロビン S は低酸素で凝集 → 鎌状の赤血球 → 貧血、毛細血管の閉塞。ヘテロ接合（HbA/HbS）はほぼ健康で**マラリアに抵抗性** — 有害な対立遺伝子が自然選択で保たれる古典的な例（ヘテロ接合の有利）。
他の例：フェニルケトン尿症、アルビノ（酵素の欠損）、嚢胞性線維症、ハンチントン病（顕性）。

## 染色体突然変異
構造の変化（欠失、重複、逆位、転座）や数の変化：**異数性**（ダウン症 = 21 トリソミー、減数分裂の不分離から）、**倍数性**（3n、4n — 植物に多い：種なしスイカ 3n、コムギ 6n）。

## 原因と修復
自然な複製エラー（校正後で約 10⁹ に1つ）、**変異原**：紫外線（チミン二量体）、X線／γ線、化学物質（亜硝酸、ベンゾピレン）。細胞は大部分を修復。失敗が蓄積 → がん（がん遺伝子／がん抑制遺伝子 p53 などの変異）。

## 体細胞と生殖細胞
体細胞の突然変異：遺伝せず、がんの原因になりうる。生殖細胞（配偶子）の突然変異：子に伝わる → 新しい対立遺伝子の源 → 選択がはたらく**遺伝的変異**。

## 突然変異の問題の読み方
コドン表と正常・変異配列が与えられたら：(1) 並べる、(2) 変わった塩基を探す、(3) 両方を翻訳、(4) 分類（ミスセンス／ナンセンス／同義／フレームシフト）。`,
    },
    exam: {
      en: ['Point-mutation case: choose the original codon from the codon table given the mutant amino acid (most years).', 'Sickle-cell: which base change, which amino-acid change, why the allele persists (malaria).', 'Classify a mutation as substitution vs frameshift from the sequences; effect of a deletion of 1 vs 3 bases.'],
      ja: ['点突然変異の例：変異後のアミノ酸からコドン表で元のコドンを選ぶ（ほぼ毎年）。', '鎌状赤血球：どの塩基が、どのアミノ酸が変わったか。対立遺伝子が残る理由（マラリア）。', '配列から置換かフレームシフトかを分類。1塩基と3塩基の欠失の効果。'],
    },
    traps: {
      en: ['A substitution changes **at most one** amino acid; an indel usually changes many.', 'Silent mutations exist because several codons code for the same amino acid.', 'Only germline mutations are inherited; a mutation in your skin cell never reaches your children.'],
      ja: ['置換で変わるアミノ酸は**最大1個**。挿入・欠失はふつう多数を変える。', '同義置換が存在するのは複数のコドンが同じアミノ酸を指定するから。', '遺伝するのは生殖細胞の突然変異だけ。皮膚の細胞の突然変異は子に伝わらない。'],
    },
    followups: {
      en: ['Show the sickle-cell mutation from DNA to protein step by step.', 'Why is a frameshift worse than a substitution?', 'How can a harmful allele stay common in a population?', 'Give me a codon-table mutation problem.'],
      ja: ['鎌状赤血球の突然変異を DNA からタンパク質まで順に見せて。', 'フレームシフトが置換より深刻なのはなぜ？', '有害な対立遺伝子が集団に多く残ることがあるのはなぜ？', 'コドン表を使った突然変異の問題を出して。'],
    },
  },
  // ───────────────────────────── REPRODUCTION & DEVELOPMENT ─────────────────────────────
  {
    id: 'meiosis-gametogenesis',
    core: {
      en: 'Meiosis makes gametes with half the chromosomes: one DNA replication followed by two divisions. Division I separates homologous pairs (this halves the number and is where crossing over shuffles alleles); division II separates sister chromatids like mitosis. Fertilisation restores the diploid number, so chromosome counts stay constant across generations.',
      ja: '減数分裂は染色体数を半分にした配偶子をつくる：DNA 複製1回に分裂2回。第一分裂で相同染色体の対が分かれ（ここで数が半減し、乗換えで対立遺伝子が混ざる）、第二分裂で体細胞分裂と同じく姉妹染色分体が分かれる。受精で二倍体に戻るので、染色体数は世代を通じて一定。',
    },
    body: {
      en: r`## Mitosis vs meiosis
| | mitosis | meiosis |
|---|---|---|
| divisions | 1 | 2 |
| DNA replication | once before | once before (interphase) — **not** between I and II |
| daughter cells | 2, identical, **2n** | 4, different, **n** |
| where | body cells (growth, repair) | germ cells (gametes / spores) |
| pairing of homologues | no | yes (division I) |
| crossing over | no | yes (prophase I) |

## Meiosis step by step
:::fig meiosis

**Meiosis I** (reductional): prophase I — homologous chromosomes pair (bivalent, 4 chromatids) and **cross over** at chiasmata; metaphase I — pairs line up at the equator with random orientation (**independent assortment**); anaphase I — **homologous chromosomes separate** (sister chromatids stay together); telophase I → 2 cells, each **n** (but each chromosome still has 2 chromatids).
**Meiosis II** (equational, like mitosis): sister chromatids separate → 4 haploid cells.

DNA amount per cell: 2C → 4C (after S) → 2C (after I) → C (after II). Chromosome number: 2n → n after **division I**. Human: 46 → 23.

## Gametogenesis
| | animal male | animal female | plant |
|---|---|---|---|
| start | spermatogonium (2n) | oogonium (2n) | pollen mother cell / embryo-sac mother cell (2n) |
| meiosis | 1 primary spermatocyte → 4 **sperm** (all functional) | 1 primary oocyte → 1 **egg** + 3 polar bodies (unequal division) | 1 mother cell → 4 microspores → pollen; 1 mother cell → 4 megaspores, **3 degenerate**, 1 → embryo sac (8 nuclei) |
| product | n | n | n (then mitosis inside pollen/embryo sac) |

So $N$ eggs need $N$ oocytes, but $N$ sperm need only $N/4$ spermatocytes. One embryo-sac mother cell → one embryo sac → one seed.

## Variation from meiosis
- Independent assortment: $2^n$ combinations (human $2^{23} \approx 8\times10^6$).
- Crossing over: new allele combinations on one chromosome.
- Random fertilisation multiplies the combinations.
Nondisjunction (a pair fails to separate) → gametes with n±1 → trisomy (Down syndrome, 21).

## Life cycles (nuclear phase)
Animals: diploid body, haploid only gametes. Ferns/mosses: alternation of generations — moss body is **haploid** (gametophyte), sporophyte 2n depends on it; fern plant is 2n (sporophyte), prothallus n.`,
      ja: r`## 体細胞分裂と減数分裂
| | 体細胞分裂 | 減数分裂 |
|---|---|---|
| 分裂の回数 | 1 | 2 |
| DNA 複製 | 前に1回 | 前に1回（間期）— I と II の間には**ない** |
| 娘細胞 | 2個、同一、**2n** | 4個、異なる、**n** |
| 場所 | 体細胞（成長、修復） | 生殖細胞（配偶子／胞子） |
| 相同染色体の対合 | なし | あり（第一分裂） |
| 乗換え | なし | あり（第一分裂前期） |

## 減数分裂の流れ
:::fig meiosis

**第一分裂**（数が減る）：前期 I — 相同染色体が対合し（二価染色体、染色分体4本）キアズマで**乗換え**。中期 I — 対が赤道面に並び向きはランダム（**独立**）。後期 I — **相同染色体が分かれる**（姉妹染色分体は一緒のまま）。終期 I → 細胞2個、それぞれ **n**（ただし各染色体は染色分体2本のまま）。
**第二分裂**（体細胞分裂と同様）：姉妹染色分体が分かれる → 単相の細胞4個。

細胞あたりの DNA 量：2C → 4C（S 期後）→ 2C（I の後）→ C（II の後）。染色体数：**第一分裂**の後に 2n → n。ヒト：46 → 23。

## 配偶子形成
| | 動物・雄 | 動物・雌 | 植物 |
|---|---|---|---|
| 出発 | 精原細胞（2n） | 卵原細胞（2n） | 花粉母細胞／胚のう母細胞（2n） |
| 減数分裂 | 一次精母細胞1個 → **精子** 4個（すべて機能） | 一次卵母細胞1個 → **卵** 1個 ＋ 極体3個（不等分裂） | 母細胞1個 → 花粉四分子4個 → 花粉。母細胞1個 → 4個のうち **3個は退化**、1個 → 胚のう（核8個） |
| 産物 | n | n | n（その後花粉・胚のう内で体細胞分裂） |

だから卵 $N$ 個には卵母細胞 $N$ 個が必要だが、精子 $N$ 個には精母細胞 $N/4$ 個でよい。胚のう母細胞1個 → 胚のう1個 → 種子1個。

## 減数分裂による多様性
- 独立：$2^n$ 通りの組み合わせ（ヒト $2^{23} \approx 8\times10^6$）。
- 乗換え：1本の染色体上の新しい対立遺伝子の組み合わせ。
- ランダムな受精で組み合わせがさらに増える。
不分離（対が分かれない）→ n±1 の配偶子 → トリソミー（ダウン症、21番）。

## 生活環（核相）
動物：体は二倍体、単相は配偶子だけ。シダ・コケ：世代交代 — コケの本体は**単相**（配偶体）で、2n の胞子体はそれに依存。シダの本体は 2n（胞子体）、前葉体は n。`,
    },
    exam: {
      en: ['Order meiosis-stage figures and give chromosome/DNA amounts at each; which figures show haploid cells (most years).', 'How many sperm / eggs / embryo sacs from N mother cells; where meiosis occurs in a flower (anther, ovule).', 'When crossing over happens (prophase I) and which gametes are recombinant.'],
      ja: ['減数分裂の各期の図を並べ、各段階の染色体数・DNA 量を答える。単相の細胞はどの図か（ほぼ毎年）。', '母細胞 N 個からできる精子・卵・胚のうの数。花のどこで減数分裂が起こるか（やく、胚珠）。', '乗換えはいつ起こるか（第一分裂前期）、組換え配偶子はどれか。'],
    },
    traps: {
      en: ['The chromosome number halves at **anaphase I**, not II; after meiosis I the cells are already n.', 'DNA is replicated **once** — there is no S phase between the two divisions.', 'One oocyte gives **one** egg (plus polar bodies); one spermatocyte gives four sperm.'],
      ja: ['染色体数が半減するのは**後期 I** で、II ではない。第一分裂後の細胞はすでに n。', 'DNA の複製は**1回** — 2つの分裂の間に S 期はない。', '卵母細胞1個から卵は**1個**（＋極体）。精母細胞1個から精子は4個。'],
    },
    followups: {
      en: ['Why does the chromosome number halve in division I and not II?', 'Track the DNA amount per cell through meiosis with numbers.', 'Why are polar bodies formed?', 'Compare a moss and a fern life cycle: which body is haploid?'],
      ja: ['染色体数が第一分裂で半減し第二分裂では減らないのはなぜ？', '減数分裂を通じた細胞あたりの DNA 量を数値で追って。', '極体はなぜできる？', 'コケとシダの生活環を比較して：どちらの本体が単相？'],
    },
  },
  {
    id: 'fertilization-plants',
    core: {
      en: 'A flowering plant\'s egg sits inside an embryo sac of 8 nuclei; a pollen tube delivers two sperm cells, and both are used: one fertilises the egg (→ embryo, 2n), the other fuses with the two polar nuclei of the central cell (→ endosperm, 3n). This double fertilisation is unique to angiosperms, and every number in the exam questions follows from the 8-nucleus layout.',
      ja: '被子植物の卵細胞は核8個の胚のうの中にある。花粉管が精細胞2個を届け、両方が使われる：1個は卵細胞と受精（→ 胚、2n）、もう1個は中央細胞の極核2個と融合（→ 胚乳、3n）。この重複受精は被子植物だけのもので、試験の数値問題はすべて核8個の配置から導ける。',
    },
    body: {
      en: r`## Making the gametophytes
- **Anther**: pollen mother cell (2n) → meiosis → 4 microspores (n) → each becomes a **pollen grain** with a tube cell nucleus and a generative cell (→ 2 sperm cells by mitosis).
- **Ovule**: embryo-sac mother cell (2n) → meiosis → 4 megaspores, 3 degenerate → 1 megaspore (n) → 3 mitoses → **embryo sac with 8 nuclei**: 1 egg cell + 2 synergids (near the micropyle), 2 polar nuclei in the central cell, 3 antipodal cells (far end).

:::fig embryo-sac

## Double fertilisation
1. Pollen lands on the stigma, grows a **pollen tube** down the style (guided by the synergids) into the ovule through the micropyle.
2. **Sperm 1 + egg cell → zygote (2n) → embryo.**
3. **Sperm 2 + 2 polar nuclei → endosperm nucleus (3n) → endosperm** (food store).
Ovule → seed; integuments → seed coat (2n, maternal tissue); ovary → fruit.

| structure | ploidy | becomes |
|---|---|---|
| egg + sperm | 2n | embryo (radicle, plumule, cotyledons) |
| polar nuclei + sperm | **3n** | endosperm |
| integument | 2n (mother) | seed coat |
| ovary wall | 2n (mother) | fruit |

Dicots like beans move the endosperm into the cotyledons (endosperm absent at maturity); monocots like rice keep the endosperm (the part we eat).

## Counting questions
- $N$ seeds need $N$ embryo sacs = $N$ embryo-sac mother cells, and $N$ pollen grains (each gives one tube with 2 sperm) = $N/4$ pollen mother cells.
- Meiosis happens in the **anther and ovule**; mitosis makes the sperm (in pollen) and the embryo-sac nuclei.
- Which cells fuse to make the embryo? Egg + one sperm. The endosperm? Central cell (2 polar nuclei) + the other sperm.

## Gymnosperms and others
Pines: no double fertilisation, endosperm is haploid (female gametophyte), seeds naked (no ovary/fruit). Ferns/mosses: swimming sperm need water; no seeds.

## Animals for comparison
Fertilisation restores 2n; in sea urchins the sperm's acrosome reaction, then a fertilisation membrane blocks other sperm. Frogs: external fertilisation; mammals: internal.`,
      ja: r`## 配偶体の形成
- **やく**：花粉母細胞（2n）→ 減数分裂 → 花粉四分子（n）4個 → それぞれ花粉管核と雄原細胞（→ 体細胞分裂で精細胞2個）をもつ**花粉**に。
- **胚珠**：胚のう母細胞（2n）→ 減数分裂 → 4個、うち3個は退化 → 胚のう細胞（n）1個 → 体細胞分裂3回 → **核8個の胚のう**：卵細胞1 ＋ 助細胞2（珠孔側）、中央細胞の極核2、反足細胞3（反対側）。

:::fig embryo-sac

## 重複受精
1. 花粉が柱頭につき、**花粉管**が花柱を通って（助細胞に誘導され）珠孔から胚珠へ。
2. **精細胞1 ＋ 卵細胞 → 受精卵（2n）→ 胚。**
3. **精細胞2 ＋ 極核2 → 胚乳核（3n）→ 胚乳**（養分の貯蔵）。
胚珠 → 種子。珠皮 → 種皮（2n、母体の組織）。子房 → 果実。

| 構造 | 核相 | なるもの |
|---|---|---|
| 卵細胞 ＋ 精細胞 | 2n | 胚（幼根、幼芽、子葉） |
| 極核 ＋ 精細胞 | **3n** | 胚乳 |
| 珠皮 | 2n（母体） | 種皮 |
| 子房壁 | 2n（母体） | 果実 |

マメなどの無胚乳種子は胚乳の養分を子葉に移す（成熟時に胚乳なし）。イネなどの有胚乳種子は胚乳を残す（食べる部分）。

## 数え方の問題
- 種子 $N$ 個には胚のう $N$ 個 = 胚のう母細胞 $N$ 個、花粉 $N$ 個（各1本の花粉管に精細胞2個）= 花粉母細胞 $N/4$ 個。
- 減数分裂は**やくと胚珠**で起こる。精細胞（花粉内）と胚のうの核は体細胞分裂でできる。
- 胚をつくる融合は？ 卵細胞 ＋ 精細胞1個。胚乳は？ 中央細胞（極核2個）＋ もう1個の精細胞。

## 裸子植物など
マツ：重複受精なし、胚乳は単相（雌性配偶体）、種子はむき出し（子房・果実なし）。シダ・コケ：泳ぐ精子に水が必要。種子なし。

## 動物との比較
受精で 2n に戻る。ウニでは精子の先体反応、その後受精膜が他の精子を防ぐ。カエル：体外受精。哺乳類：体内受精。`,
    },
    exam: {
      en: ['Which cells fuse to form the embryo / the endosperm; ploidy of endosperm (3n) (most years).', 'Number of embryo-sac mother cells (or pollen mother cells) for N seeds; where meiosis occurs.', 'Label the embryo sac (egg, synergids, polar nuclei, antipodals) and the parts of a seed.'],
      ja: ['胚・胚乳をつくる融合はどの細胞か。胚乳の核相（3n）（ほぼ毎年）。', '種子 N 個に必要な胚のう母細胞（または花粉母細胞）の数。減数分裂の場所。', '胚のう（卵細胞、助細胞、極核、反足細胞）と種子の各部の名称。'],
    },
    traps: {
      en: ['Endosperm is **3n**; the embryo is 2n; the seed coat is maternal 2n.', 'The embryo sac is made by **mitosis** from one megaspore; meiosis happened one step earlier.', 'Only **one** of the four megaspores survives; all four microspores become pollen.'],
      ja: ['胚乳は **3n**、胚は 2n、種皮は母体の 2n。', '胚のうは1個の胚のう細胞から**体細胞分裂**でできる。減数分裂はその1つ前。', '4個の胚のう細胞（大胞子）のうち生き残るのは**1個**。花粉四分子は4個すべて花粉になる。'],
    },
    followups: {
      en: ['Walk through the 8 nuclei of the embryo sac and what each does.', 'Why is the endosperm triploid?', 'How many pollen mother cells for 100 seeds, and why?', 'Compare seed formation in pines and flowering plants.'],
      ja: ['胚のうの8個の核とそれぞれの役割を順に説明して。', '胚乳が三倍体なのはなぜ？', '種子 100 個に必要な花粉母細胞の数とその理由は？', 'マツと被子植物の種子形成を比較して。'],
    },
  },
  {
    id: 'animal-development',
    core: {
      en: 'A fertilised egg divides without growing (cleavage) into a hollow ball (blastula), then part of the wall folds inward (gastrulation) to make three layers: ectoderm outside, endoderm inside lining the new gut, mesoderm between. Each layer builds a fixed set of organs, and signals between neighbouring cells (induction) decide what each region becomes.',
      ja: '受精卵は大きくならずに分裂し（卵割）、中空の球（胞胚）になり、壁の一部が内側へ折れ込んで（原腸形成）3つの層をつくる：外側の外胚葉、新しい腸を裏打ちする内側の内胚葉、間の中胚葉。各層は決まった器官をつくり、隣り合う細胞間の信号（誘導）が各領域の運命を決める。',
    },
    body: {
      en: r`## Stages (frog / sea urchin)
:::fig gastrula

1. **Fertilisation** → zygote.
2. **Cleavage**: rapid mitoses with no growth → cells get smaller (blastomeres); yolk slows cleavage (frog: unequal, smaller cells at the animal pole).
3. **Morula** → **blastula**: hollow ball with a cavity, the **blastocoel**.
4. **Gastrulation**: cells move inward at the blastopore (frog: dorsal lip) → **gastrula** with a new cavity, the **archenteron** (primitive gut, opens at the blastopore), and three germ layers.
5. **Neurula** (vertebrates): ectoderm above the notochord folds into the **neural tube** (brain, spinal cord).
6. Organogenesis → tadpole.

## Germ layers → organs (memorise)
| layer | forms |
|---|---|
| **ectoderm** | epidermis (skin surface, hair, nails), **nervous system** (brain, spinal cord, nerves), eye lens and retina, sense organs |
| **mesoderm** | **notochord**, muscle, bone, cartilage, dermis, blood and heart, kidney, gonads, connective tissue |
| **endoderm** | lining of the digestive tract, **lungs**, liver, pancreas, thyroid, bladder lining |

Rule of thumb: outside and nerves = ectoderm; tubes you swallow into or breathe into = endoderm; everything structural in between = mesoderm.

## Induction and organisers
- **Spemann's organiser**: the dorsal lip of the blastopore transplanted to another embryo induces a second body axis (secondary embryo) — it instructs neighbouring cells (**induction**).
- Chain of inductions in the eye: optic vesicle (brain) → induces **lens** from ectoderm → lens induces cornea.
- Cell fate is decided progressively: early blastomeres are totipotent (sea urchin 2-cell separation → 2 larvae; frog animal/vegetal halves differ because of yolk and cytoplasmic factors).
- Mosaic vs regulative eggs; **cytoplasmic determinants** (bicoid in *Drosophila* sets the head end); **homeotic (Hox) genes** decide segment identity — a mutation puts legs where antennae should be.

## Animal vs vegetal pole
Animal pole: little yolk, small cells, becomes ectoderm; vegetal pole: yolk-rich, large cells, endoderm. Grey crescent (frog) opposite the sperm entry marks the future dorsal side (where the blastopore forms).

## Stem cells (brief)
ES cells (from the inner cell mass of a mammalian blastocyst) and iPS cells (reprogrammed adult cells) can form any tissue; adult stem cells are limited.`,
      ja: r`## 発生の段階（カエル／ウニ）
:::fig gastrula

1. **受精** → 受精卵。
2. **卵割**：成長を伴わない速い体細胞分裂 → 細胞（割球）が小さくなる。卵黄は卵割を遅らせる（カエル：不等割、動物極側の細胞が小さい）。
3. **桑実胚** → **胞胚**：内部に**胞胚腔**をもつ中空の球。
4. **原腸形成**：原口（カエルでは背唇部）から細胞が内側へ移動 → 新しい腔である**原腸**（原始的な消化管、原口で開く）と3つの胚葉をもつ**原腸胚**。
5. **神経胚**（脊椎動物）：脊索の上の外胚葉が折れて**神経管**（脳、脊髄）に。
6. 器官形成 → オタマジャクシ。

## 胚葉 → 器官（暗記）
| 胚葉 | つくるもの |
|---|---|
| **外胚葉** | 表皮（皮膚の表面、毛、爪）、**神経系**（脳、脊髄、神経）、眼の水晶体と網膜、感覚器 |
| **中胚葉** | **脊索**、筋肉、骨、軟骨、真皮、血液と心臓、腎臓、生殖腺、結合組織 |
| **内胚葉** | 消化管の内面、**肺**、肝臓、すい臓、甲状腺、ぼうこうの内面 |

目安：外側と神経 = 外胚葉。飲み込む管・吸い込む管の内面 = 内胚葉。その間の構造的なもの = 中胚葉。

## 誘導と形成体
- **シュペーマンの形成体**：原口背唇部を別の胚に移植すると第二の体軸（二次胚）ができる — 隣の細胞に指示を出す（**誘導**）。
- 眼の誘導の連鎖：眼胞（脳）→ 外胚葉から**水晶体**を誘導 → 水晶体が角膜を誘導。
- 細胞の運命は段階的に決まる：初期の割球は全能性（ウニの2細胞を分けると幼生2匹。カエルの動物極側と植物極側は卵黄と細胞質因子のため異なる）。
- モザイク卵と調節卵。**細胞質決定因子**（ショウジョウバエのビコイドが頭の側を決める）。**ホメオティック（Hox）遺伝子**が体節の性質を決める — 変異で触角の場所に脚が生える。

## 動物極と植物極
動物極：卵黄が少なく細胞が小さく外胚葉に。植物極：卵黄が多く細胞が大きく内胚葉に。灰色三日月環（カエル）は精子の進入点の反対側にでき、将来の背側（原口ができる側）を示す。

## 幹細胞（簡単に）
ES 細胞（哺乳類の胚盤胞の内部細胞塊から）と iPS 細胞（初期化した成体細胞）はあらゆる組織になれる。成体幹細胞は限られる。`,
    },
    exam: {
      en: ['Label a gastrula: blastocoel, archenteron, blastopore, ectoderm/mesoderm/endoderm (most years).', 'Which organ comes from which germ layer (nervous system ← ectoderm; notochord, muscle ← mesoderm; lung, liver ← endoderm).', 'Spemann organiser / lens induction experiments: what is induced by what.'],
      ja: ['原腸胚の名称：胞胚腔、原腸、原口、外胚葉／中胚葉／内胚葉（ほぼ毎年）。', 'どの器官がどの胚葉から（神経系 ← 外胚葉。脊索、筋肉 ← 中胚葉。肺、肝臓 ← 内胚葉）。', 'シュペーマンの形成体や水晶体の誘導実験：何が何を誘導するか。'],
    },
    traps: {
      en: ['The **lung lining** is endoderm (it buds from the gut), though it seems "inside the body" like mesoderm organs.', 'The archenteron is the **new** cavity of the gastrula; the blastocoel shrinks as it forms.', 'Cleavage makes more cells but the embryo does not get bigger.'],
      ja: ['**肺の内面**は内胚葉（消化管から出芽する）。中胚葉の器官のように「体の内側」に見えるが違う。', '原腸は原腸胚の**新しい**腔。胞胚腔は原腸ができるにつれ縮む。', '卵割で細胞は増えるが胚は大きくならない。'],
    },
    followups: {
      en: ['Give me a quick way to remember which organs come from which layer.', 'Explain the Spemann organiser experiment and why it was important.', 'Why does the frog egg cleave unequally?', 'What is the difference between the blastocoel and the archenteron?'],
      ja: ['どの器官がどの胚葉からできるかの覚え方を教えて。', 'シュペーマンの形成体の実験とその重要性を説明して。', 'カエルの卵が不等割するのはなぜ？', '胞胚腔と原腸の違いは？'],
    },
  },
  // ───────────────────────────── HOMEOSTASIS ─────────────────────────────
  {
    id: 'circulation-blood',
    core: {
      en: 'Blood is pumped through two loops — heart → lungs → heart (pulmonary) and heart → body → heart (systemic). Oxygen rides on haemoglobin, which loads fully in the lungs and unloads where O₂ is low and CO₂ is high (the S-shaped dissociation curve shifts right). Reading which vessel carries what — most O₂, most urea, most glucose after a meal — is just following the loop.',
      ja: '血液は2つの回路を回る — 心臓 → 肺 → 心臓（肺循環）と心臓 → 全身 → 心臓（体循環）。酸素はヘモグロビンに乗り、肺で満載され、O₂ が少なく CO₂ が多い場所で降ろされる（S 字形の解離曲線が右へずれる）。どの血管に何が多いか — 最も O₂ が多い、尿素が多い、食後にグルコースが多い — は回路をたどるだけ。',
    },
    body: {
      en: r`## Heart and circuits
:::fig circulation

Four chambers: right atrium → right ventricle → **pulmonary artery** (carries **venous** blood!) → lungs → **pulmonary vein** (arterial blood) → left atrium → left ventricle → aorta → body → vena cava → right atrium. The left ventricle wall is thickest (pumps to the whole body). Valves stop backflow. The **sinoatrial node** (pacemaker, right atrium wall) sets the rhythm automatically; the autonomic nerves only speed it up (sympathetic) or slow it (parasympathetic).

| vessel | blood | notes |
|---|---|---|
| **pulmonary artery** | venous (low O₂) | only artery with venous blood |
| **pulmonary vein** | arterial (high O₂) | highest O₂ of all vessels |
| hepatic portal vein | from intestine to liver | **most glucose (and amino acids) after a meal** |
| hepatic vein | leaves the liver | **most urea** (made in the liver) |
| renal vein | leaves the kidney | **least urea** |
| aorta | arterial | highest pressure |

Arteries: thick, elastic, high pressure. Veins: thin, valves, low pressure. Capillaries: one cell thick, exchange. Fish: single circuit; amphibians: 2 atria 1 ventricle (mixing); birds/mammals: complete double circulation.

## Blood
Plasma (water, proteins: albumin, globulins/antibodies, fibrinogen; glucose, salts) + cells: **red cells** (no nucleus in mammals, haemoglobin, made in bone marrow, ~120 days, broken down in the liver/spleen → bilirubin), **white cells** (immunity: neutrophils, macrophages, lymphocytes), **platelets** (clotting: platelets + Ca²⁺ + thrombin → fibrinogen → **fibrin** net traps cells → clot). Serum = plasma minus fibrinogen. Tissue fluid → lymph → lymph vessels → veins.

## Oxygen dissociation curve
:::fig oxygen-dissociation

% of haemoglobin carrying O₂ vs O₂ partial pressure: **S-shaped**. In the lungs (high pO₂, low pCO₂) ~95% saturated; in tissues (low pO₂, high pCO₂) much less → the **difference** is delivered. **Higher CO₂ (or lower pH, higher temperature) shifts the curve right** (Bohr effect) → more O₂ released exactly where it is needed. Fetal haemoglobin's curve is to the **left** (higher affinity) so it takes O₂ from the mother's blood; myoglobin further left still.
Reading: at pO₂ = 100 saturation 95%, at pO₂ = 30 (tissue, high CO₂) 30% → 65% of the O₂ is unloaded.

## CO₂ transport
Mostly as HCO₃⁻ in plasma (carbonic anhydrase in red cells), some bound to haemoglobin, a little dissolved.`,
      ja: r`## 心臓と回路
:::fig circulation

4つの部屋：右心房 → 右心室 → **肺動脈**（**静脈血**を運ぶ！）→ 肺 → **肺静脈**（動脈血）→ 左心房 → 左心室 → 大動脈 → 全身 → 大静脈 → 右心房。左心室の壁が最も厚い（全身へ送る）。弁が逆流を防ぐ。**洞房結節**（ペースメーカー、右心房の壁）が自動的にリズムを決める。自律神経は速める（交感神経）か遅くする（副交感神経）だけ。

| 血管 | 血液 | 備考 |
|---|---|---|
| **肺動脈** | 静脈血（O₂ 少） | 静脈血を運ぶ唯一の動脈 |
| **肺静脈** | 動脈血（O₂ 多） | 全血管中で O₂ が最も多い |
| 肝門脈 | 腸から肝臓へ | **食後にグルコース（とアミノ酸）が最も多い** |
| 肝静脈 | 肝臓から出る | **尿素が最も多い**（肝臓でつくられる） |
| 腎静脈 | 腎臓から出る | **尿素が最も少ない** |
| 大動脈 | 動脈血 | 血圧が最も高い |

動脈：厚く弾力があり高圧。静脈：薄く弁があり低圧。毛細血管：細胞1層、物質交換。魚類：1回路。両生類：心房2心室1（混合）。鳥類・哺乳類：完全な二重循環。

## 血液
血しょう（水、タンパク質：アルブミン、グロブリン／抗体、フィブリノーゲン。グルコース、塩類）＋ 細胞：**赤血球**（哺乳類では無核、ヘモグロビン、骨髄でつくられ約 120 日、肝臓・ひ臓で分解 → ビリルビン）、**白血球**（免疫：好中球、マクロファージ、リンパ球）、**血小板**（凝固：血小板 ＋ Ca²⁺ ＋ トロンビン → フィブリノーゲン → **フィブリン**の網が細胞を絡める → 血ぺい）。血清 = 血しょう − フィブリノーゲン。組織液 → リンパ → リンパ管 → 静脈。

## 酸素解離曲線
:::fig oxygen-dissociation

O₂ を結合したヘモグロビンの割合と O₂ 分圧：**S 字形**。肺（pO₂ 高、pCO₂ 低）で約 95% 飽和。組織（pO₂ 低、pCO₂ 高）ではずっと少ない → その**差**が供給される。**CO₂ が多い（pH が低い、温度が高い）と曲線は右へ**（ボーア効果）→ 必要な場所でより多く O₂ が放される。胎児ヘモグロビンの曲線は**左**（親和性が高い）で母体の血液から O₂ を受け取る。ミオグロビンはさらに左。
読み方：pO₂ = 100 で飽和度 95%、pO₂ = 30（組織、高 CO₂）で 30% → O₂ の 65% が放出される。

## CO₂ の運搬
主に血しょう中の HCO₃⁻ として（赤血球の炭酸脱水酵素）、一部はヘモグロビンに結合、少量は溶解。`,
    },
    exam: {
      en: ['Circulatory diagram: pick the vessel with the least urea / most glucose after a meal / most O₂; name chambers; locate the sinoatrial node (most years).', 'Oxygen dissociation curve: read saturations at lung and tissue conditions and compute the % of O₂ released; which curve is fetal.', 'Which vessels carry venous blood; order of blood flow through the heart.'],
      ja: ['循環系の図：尿素が最も少ない／食後にグルコースが最も多い／O₂ が最も多い血管を選ぶ。心臓の部屋の名称。洞房結節の位置（ほぼ毎年）。', '酸素解離曲線：肺と組織の条件での飽和度を読み、放出される O₂ の割合を計算。胎児の曲線はどれか。', '静脈血を運ぶ血管はどれか。心臓を通る血液の順序。'],
    },
    traps: {
      en: ['"Artery" means leaving the heart, not "oxygen-rich": the pulmonary artery carries venous blood.', 'The hepatic **portal** vein has the most glucose after a meal; the hepatic vein has the most urea.', 'The curve **shifts right** with more CO₂ — that means **less** saturation at a given pO₂, i.e. more O₂ released.'],
      ja: ['「動脈」は心臓から出る血管という意味で「酸素が多い」ではない：肺動脈は静脈血。', '食後にグルコースが最も多いのは肝**門脈**。尿素が最も多いのは肝静脈。', 'CO₂ が多いと曲線は**右へ** — 同じ pO₂ での飽和度が**下がる**、つまり O₂ がより多く放出される。'],
    },
    followups: {
      en: ['Why is the dissociation curve S-shaped?', 'Do a worked example: saturation 96% in lungs, 34% in tissue — what fraction of O₂ is delivered?', 'Trace a glucose molecule from the intestine to a muscle cell.', 'Why does the heart beat without nerves?'],
      ja: ['解離曲線が S 字形なのはなぜ？', '例題：肺で飽和度 96%、組織で 34% — 供給される O₂ の割合は？', '腸から筋細胞までグルコース分子をたどって。', '神経がなくても心臓が拍動するのはなぜ？'],
    },
  },
  {
    id: 'excretion-liver',
    core: {
      en: 'The kidney cleans blood in two steps: the glomerulus filters everything small (water, glucose, salts, urea — not proteins or cells) into the nephron, then the tubule takes back what the body wants (all glucose, most water and salt) and leaves the waste. Whatever is filtered but not reabsorbed gets concentrated in urine, so its concentration rises; the liver, meanwhile, makes the urea, stores glycogen and detoxifies.',
      ja: '腎臓は血液を2段階できれいにする：糸球体が小さいものをすべて（水、グルコース、塩類、尿素 — タンパク質や細胞は除く）ネフロンへろ過し、次に細尿管が体に必要なもの（グルコース全部、水と塩の大部分）を再吸収して老廃物を残す。ろ過されたのに再吸収されないものは尿で濃縮され濃度が上がる。一方、肝臓は尿素をつくり、グリコーゲンを蓄え、解毒する。',
    },
    body: {
      en: r`## Nephron (about 1 million per kidney)
:::fig nephron

1. **Filtration** at the glomerulus (a ball of capillaries inside Bowman's capsule): blood pressure pushes plasma minus proteins into the capsule = **primitive urine** (~170 L/day). Blood cells and proteins are too big.
2. **Reabsorption** along the tubule (proximal, loop of Henle, distal) and collecting duct: **glucose 100%**, amino acids 100%, water ~99%, Na⁺ most (active transport, ATP) → back into the surrounding capillaries.
3. Some secretion of extra waste into the tubule.
4. **Urine** (~1.5 L/day) → renal pelvis → ureter → bladder → urethra.

## Reading the concentration table (the EJU classic)
| substance | plasma | primitive urine | urine | reason |
|---|---|---|---|---|
| protein | 7% | 0 | 0 | not filtered |
| glucose | 0.1% | 0.1% | **0** | filtered, fully reabsorbed |
| Na⁺ | 0.3% | 0.3% | 0.35% | mostly reabsorbed, slightly concentrated |
| urea | 0.03% | 0.03% | 2% | filtered, little reabsorbed → **concentrated ~70×** |
| inulin/creatinine | — | filtered | ~120× | not reabsorbed at all |

**Concentration ratio** = urine ÷ primitive urine tells how much water was removed: inulin ×120 means 120 L filtered per 1 L urine. Reabsorbed amount of urea = filtered − excreted. Glucose appears in urine only when blood glucose exceeds the reabsorption limit (diabetes).

## Water balance
**Vasopressin (ADH)** from the posterior pituitary (made in the hypothalamus) increases water reabsorption in the collecting duct → concentrated urine when dehydrated (high blood osmotic pressure); alcohol suppresses it. **Aldosterone** (adrenal cortex) increases Na⁺ reabsorption. Mineralocorticoids and ADH keep osmotic pressure constant.

## The liver (the chemical factory)
- **Urea synthesis**: ammonia from amino-acid breakdown (toxic) → urea (ornithine cycle) → kidney. Fish excrete ammonia, birds uric acid (saves water), mammals urea.
- **Blood glucose**: stores glucose as **glycogen** and releases it (insulin/glucagon/adrenaline act here).
- Makes plasma proteins (albumin, fibrinogen), **bile** (emulsifies fats; bilirubin from old red cells; stored in gallbladder), cholesterol.
- **Detoxification** (alcohol, drugs), heat production, stores vitamins and iron, breaks down old red cells.
- Receives blood from the **hepatic portal vein** (nutrient-rich) and the hepatic artery.

## Nitrogenous waste comparison
| animal | waste | why |
|---|---|---|
| aquatic (fish) | ammonia | toxic but water dilutes it |
| mammals, amphibians | urea | less toxic, needs some water |
| birds, reptiles, insects | uric acid | insoluble, saves water (eggs, flight) |`,
      ja: r`## ネフロン（腎単位。片腎に約 100 万個）
:::fig nephron

1. 糸球体（ボーマンのうの中の毛細血管の塊）での**ろ過**：血圧で血しょうからタンパク質を除いたものがボーマンのうへ = **原尿**（約 170 L/日）。血球とタンパク質は大きすぎて通らない。
2. 細尿管（近位、ヘンレのループ、遠位）と集合管での**再吸収**：**グルコース 100%**、アミノ酸 100%、水 約 99%、Na⁺ の大部分（能動輸送、ATP）→ 周囲の毛細血管へ戻る。
3. 一部の老廃物は細尿管へ分泌される。
4. **尿**（約 1.5 L/日）→ 腎う → 輸尿管 → ぼうこう → 尿道。

## 濃度の表の読み方（EJUの定番）
| 物質 | 血しょう | 原尿 | 尿 | 理由 |
|---|---|---|---|---|
| タンパク質 | 7% | 0 | 0 | ろ過されない |
| グルコース | 0.1% | 0.1% | **0** | ろ過され全部再吸収 |
| Na⁺ | 0.3% | 0.3% | 0.35% | 大部分再吸収、少し濃縮 |
| 尿素 | 0.03% | 0.03% | 2% | ろ過され再吸収は少ない → **約 70 倍に濃縮** |
| イヌリン／クレアチニン | — | ろ過 | 約 120 倍 | まったく再吸収されない |

**濃縮率** = 尿 ÷ 原尿 でどれだけ水が除かれたかがわかる：イヌリン 120 倍なら尿 1 L あたり 120 L ろ過された。尿素の再吸収量 = ろ過量 − 排出量。グルコースが尿に出るのは血糖値が再吸収の限界を超えたとき（糖尿病）。

## 水分の調節
**バソプレシン（ADH）**（視床下部でつくられ脳下垂体後葉から分泌）が集合管での水の再吸収を増やす → 脱水時（血液の浸透圧が高い）は濃い尿。アルコールは分泌を抑える。**鉱質コルチコイド（アルドステロン）**（副腎皮質）は Na⁺ の再吸収を増やす。これらで浸透圧が一定に保たれる。

## 肝臓（化学工場）
- **尿素の合成**：アミノ酸の分解で生じる有毒なアンモニア → 尿素（オルニチン回路）→ 腎臓へ。魚類はアンモニア、鳥類は尿酸（水を節約）、哺乳類は尿素を排出。
- **血糖**：グルコースを**グリコーゲン**として蓄え、放出する（インスリン／グルカゴン／アドレナリンがここではたらく）。
- 血しょうタンパク質（アルブミン、フィブリノーゲン）、**胆汁**（脂肪を乳化。古い赤血球由来のビリルビン。胆のうに貯蔵）、コレステロールをつくる。
- **解毒**（アルコール、薬）、発熱、ビタミンと鉄の貯蔵、古い赤血球の分解。
- **肝門脈**（栄養に富む）と肝動脈から血液を受ける。

## 窒素老廃物の比較
| 動物 | 老廃物 | 理由 |
|---|---|---|
| 水生（魚類） | アンモニア | 有毒だが水で薄まる |
| 哺乳類、両生類 | 尿素 | 毒性が低く、少し水が必要 |
| 鳥類、は虫類、昆虫 | 尿酸 | 不溶で水を節約（卵、飛行） |`,
    },
    exam: {
      en: ['Table of concentrations in plasma / primitive urine / urine with substances hidden as A, B, C: identify glucose, Na⁺, protein, urea from filtration/reabsorption behaviour (most years).', 'Compute the concentration ratio, the volume filtered, or the amount of urea reabsorbed.', 'Which hormone raises water reabsorption (vasopressin); liver functions true/false; nitrogenous waste by animal group.'],
      ja: ['血しょう／原尿／尿の濃度の表（物質は A、B、C）：ろ過・再吸収の挙動からグルコース、Na⁺、タンパク質、尿素を特定（ほぼ毎年）。', '濃縮率、ろ過量、尿素の再吸収量の計算。', '水の再吸収を増やすホルモン（バソプレシン）。肝臓のはたらきの正誤。動物群ごとの窒素老廃物。'],
    },
    traps: {
      en: ['Glucose is **in** primitive urine (it is small) but **not** in final urine (fully reabsorbed) — "0 in primitive urine" means protein.', 'A substance that is concentrated the most is reabsorbed the **least** (inulin > urea > Na⁺).', 'Urea is made in the **liver**, only removed by the kidney.'],
      ja: ['グルコースは原尿には**ある**（小さい）が尿には**ない**（全部再吸収）—「原尿で 0」ならタンパク質。', '最も濃縮される物質は最も再吸収され**ない**（イヌリン > 尿素 > Na⁺）。', '尿素をつくるのは**肝臓**。腎臓は除くだけ。'],
    },
    followups: {
      en: ['Walk me through identifying A, B, C in a kidney concentration table.', 'Why is inulin used to measure filtration?', 'How much water is reabsorbed if 180 L is filtered and 1.5 L of urine is made?', 'Why do birds excrete uric acid instead of urea?'],
      ja: ['腎臓の濃度の表で A、B、C を特定する手順を見せて。', 'ろ過量の測定にイヌリンを使うのはなぜ？', '180 L ろ過されて尿が 1.5 L なら再吸収された水は？', '鳥類が尿素でなく尿酸を排出するのはなぜ？'],
    },
  },
  {
    id: 'endocrine-bloodsugar',
    core: {
      en: 'Hormones are chemical messengers released into the blood that act only on cells with the matching receptor. Blood sugar is the model system: after a meal insulin (pancreatic β cells) pushes glucose into cells and liver glycogen; when sugar falls, glucagon and adrenaline (plus glucocorticoids) release it again. The hypothalamus and pituitary sit on top, and negative feedback keeps every hormone level from overshooting.',
      ja: 'ホルモンは血液中に放出される化学的な伝令で、対応する受容体をもつ細胞にだけ作用する。血糖調節が模範例：食後はインスリン（すい臓の β 細胞）がグルコースを細胞や肝臓のグリコーゲンに取り込ませ、血糖が下がるとグルカゴンとアドレナリン（と糖質コルチコイド）が再び放出する。視床下部と脳下垂体が上位にあり、負のフィードバックがすべてのホルモン量の行き過ぎを防ぐ。',
    },
    body: {
      en: r`## Hormones vs nerves
| | hormones (endocrine) | nerves |
|---|---|---|
| carried by | blood | axons |
| speed | slow (seconds–hours) | fast (ms) |
| duration | long | short |
| target | any cell with the receptor | specific connection |
Endocrine glands have no duct (exocrine glands like sweat/salivary have ducts). Water-soluble hormones (peptides, adrenaline) bind surface receptors; steroids (cortisol, sex hormones) enter the cell and act on genes.

## The control tower
**Hypothalamus** (neurosecretory cells) → releasing hormones → **anterior pituitary** → TSH, ACTH, growth hormone, FSH/LH, prolactin. The hypothalamus also makes **vasopressin** and oxytocin, stored/released by the **posterior pituitary**.
**Negative feedback**: thyroxine high → hypothalamus and pituitary reduce TRH/TSH → thyroxine falls. This keeps levels steady. (Iodine deficiency → low thyroxine → TSH stays high → goitre.)

## Blood-sugar regulation (~0.1% = 100 mg/100 mL)
:::fig blood-sugar

| condition | detected by | hormone | from | effect |
|---|---|---|---|---|
| **high** (after meal) | hypothalamus, pancreas | **insulin** | pancreatic islets **β cells** (parasympathetic nerve stimulates) | cells take up glucose; liver/muscle make **glycogen** → blood sugar **falls** (the **only** lowering hormone) |
| **low** (fasting, exercise) | hypothalamus, pancreas | **glucagon** | islets **α cells** | liver breaks glycogen → glucose |
| low / stress | hypothalamus → sympathetic nerve | **adrenaline** | adrenal **medulla** | glycogen → glucose; heart rate up |
| low / stress | hypothalamus → pituitary ACTH | **glucocorticoids** (cortisol) | adrenal **cortex** | protein → glucose |
| — | pituitary | growth hormone | anterior pituitary | raises blood sugar too |

Several hormones raise blood sugar, only insulin lowers it → **diabetes** when insulin is missing (type 1) or cells ignore it (type 2): glucose spills into urine, osmotic water loss.

## Other hormones to know
| hormone | gland | job |
|---|---|---|
| thyroxine | thyroid | raises metabolism; frog metamorphosis; contains iodine |
| parathyroid hormone / calcitonin | parathyroid / thyroid | raise / lower blood Ca²⁺ |
| vasopressin (ADH) | posterior pituitary | water reabsorption in kidney |
| mineralocorticoid (aldosterone) | adrenal cortex | Na⁺ reabsorption |
| adrenaline | adrenal medulla | fight-or-flight |
| oestrogen / progesterone, testosterone | ovary / testis | sex characteristics, cycle |
| growth hormone | anterior pituitary | growth (gigantism/dwarfism) |

## Reading the regulation diagram
The EJU shows the hypothalamus with arrows to the pancreas and adrenal gland and asks you to label: sympathetic nerve → adrenal medulla → adrenaline; parasympathetic nerve → β cells → insulin; sympathetic → α cells → glucagon; and which of A/B lowers glucose.`,
      ja: r`## ホルモンと神経
| | ホルモン（内分泌） | 神経 |
|---|---|---|
| 運ぶもの | 血液 | 軸索 |
| 速さ | 遅い（秒〜時間） | 速い（ミリ秒） |
| 持続 | 長い | 短い |
| 標的 | 受容体をもつ任意の細胞 | 特定の接続 |
内分泌腺には導管がない（汗腺・だ腺などの外分泌腺には導管がある）。水溶性ホルモン（ペプチド、アドレナリン）は細胞表面の受容体に結合。ステロイド（コルチゾール、性ホルモン）は細胞内に入り遺伝子にはたらく。

## 司令塔
**視床下部**（神経分泌細胞）→ 放出ホルモン → **脳下垂体前葉** → TSH、ACTH、成長ホルモン、FSH/LH、プロラクチン。視床下部は**バソプレシン**とオキシトシンもつくり、**脳下垂体後葉**から放出される。
**負のフィードバック**：チロキシンが多い → 視床下部と脳下垂体が TRH/TSH を減らす → チロキシンが減る。これで量が一定に保たれる。（ヨウ素不足 → チロキシン低下 → TSH が高いまま → 甲状腺腫。）

## 血糖調節（約 0.1% = 100 mg/100 mL）
:::fig blood-sugar

| 状態 | 感知 | ホルモン | 分泌元 | 効果 |
|---|---|---|---|---|
| **高い**（食後） | 視床下部、すい臓 | **インスリン** | すい臓ランゲルハンス島 **B（β）細胞**（副交感神経が刺激） | 細胞がグルコースを取り込む。肝臓・筋肉で**グリコーゲン**合成 → 血糖**低下**（下げる**唯一**のホルモン） |
| **低い**（空腹、運動） | 視床下部、すい臓 | **グルカゴン** | ランゲルハンス島 **A（α）細胞** | 肝臓でグリコーゲン分解 → グルコース |
| 低い／ストレス | 視床下部 → 交感神経 | **アドレナリン** | 副腎**髄質** | グリコーゲン → グルコース。心拍数増加 |
| 低い／ストレス | 視床下部 → 脳下垂体 ACTH | **糖質コルチコイド**（コルチゾール） | 副腎**皮質** | タンパク質 → グルコース |
| — | 脳下垂体 | 成長ホルモン | 脳下垂体前葉 | 血糖を上げる |

血糖を上げるホルモンは複数、下げるのはインスリンだけ → インスリンがない（1型）か細胞が応答しない（2型）と**糖尿病**：グルコースが尿に出て、浸透圧で水も失われる。

## 覚えるべきその他のホルモン
| ホルモン | 分泌腺 | はたらき |
|---|---|---|
| チロキシン | 甲状腺 | 代謝を高める。カエルの変態。ヨウ素を含む |
| パラトルモン／カルシトニン | 副甲状腺／甲状腺 | 血中 Ca²⁺ を上げる／下げる |
| バソプレシン（ADH） | 脳下垂体後葉 | 腎臓での水の再吸収 |
| 鉱質コルチコイド（アルドステロン） | 副腎皮質 | Na⁺ の再吸収 |
| アドレナリン | 副腎髄質 | 闘争か逃走か |
| エストロゲン／プロゲステロン、テストステロン | 卵巣／精巣 | 性の特徴、周期 |
| 成長ホルモン | 脳下垂体前葉 | 成長（巨人症／小人症） |

## 調節の図の読み方
EJUは視床下部からすい臓と副腎への矢印の図を示し、名称を問う：交感神経 → 副腎髄質 → アドレナリン。副交感神経 → B 細胞 → インスリン。交感神経 → A 細胞 → グルカゴン。A/B のどちらが血糖を下げるか。`,
    },
    exam: {
      en: ['Blood-glucose control diagram: label the autonomic nerves and hormones (insulin, glucagon, adrenaline) and their glands (most years).', 'Which hormone lowers blood sugar (only insulin); what happens in diabetes; graph of blood glucose and insulin after a meal in a healthy vs diabetic person.', 'Negative feedback with thyroxine; which gland makes which hormone (matching table).'],
      ja: ['血糖調節の図：自律神経とホルモン（インスリン、グルカゴン、アドレナリン）とその分泌腺の名称（ほぼ毎年）。', '血糖を下げるホルモン（インスリンだけ）。糖尿病で起こること。健常者と糖尿病患者の食後の血糖とインスリンのグラフ。', 'チロキシンの負のフィードバック。どの腺がどのホルモンをつくるか（対応表）。'],
    },
    traps: {
      en: ['Adrenaline comes from the adrenal **medulla** (via sympathetic nerve); glucocorticoids from the adrenal **cortex** (via ACTH).', 'Insulin is released by **parasympathetic** stimulation; glucagon and adrenaline by **sympathetic**.', 'Vasopressin is **made** in the hypothalamus and **released** from the posterior pituitary.'],
      ja: ['アドレナリンは副腎**髄質**から（交感神経経由）。糖質コルチコイドは副腎**皮質**から（ACTH 経由）。', 'インスリンは**副交感神経**の刺激で分泌。グルカゴンとアドレナリンは**交感神経**。', 'バソプレシンは視床下部で**つくられ**、脳下垂体後葉から**放出**される。'],
    },
    followups: {
      en: ['Explain negative feedback with the thyroid example step by step.', 'Why do several hormones raise blood sugar but only one lowers it?', 'Sketch in words the glucose and insulin curves after a meal for a healthy person and a type-1 diabetic.', 'Quiz me on gland → hormone → effect.'],
      ja: ['甲状腺の例で負のフィードバックを順に説明して。', '血糖を上げるホルモンは複数あるのに下げるのは1つだけなのはなぜ？', '健常者と1型糖尿病患者の食後のグルコースとインスリンの曲線を言葉で描いて。', '分泌腺 → ホルモン → 効果のクイズを出して。'],
    },
  },
  {
    id: 'autonomic-thermoregulation',
    core: {
      en: 'The autonomic nervous system runs the body without conscious control through two opposing branches: sympathetic ("fight or flight" — faster heart, wider pupils, less digestion) and parasympathetic ("rest and digest"). Body temperature is held near 37 °C by the hypothalamus: when cold it triggers shivering, vasoconstriction and heat-raising hormones; when hot, sweating and vasodilation.',
      ja: '自律神経系は意識によらず体を動かし、対立する2つの系からなる：交感神経（「闘争か逃走か」— 心拍増加、瞳孔拡大、消化抑制）と副交感神経（「休息と消化」）。体温は視床下部が約 37 ℃ に保つ：寒いとふるえ、血管収縮、熱産生を高めるホルモンを出し、暑いと発汗と血管拡張。',
    },
    body: {
      en: r`## Two branches
| target | **sympathetic** (active, stress) | **parasympathetic** (rest) |
|---|---|---|
| heart rate | ↑ | ↓ |
| pupils | dilate | constrict |
| bronchi | dilate | constrict |
| digestion (gut movement, secretion) | ↓ | ↑ |
| blood vessels of skin/gut | constrict | (mostly no fibres) |
| bladder | relax (hold) | contract (empty) |
| sweat glands, adrenal medulla, arrector pili | stimulate (sympathetic only) | — |
| neurotransmitter at target | noradrenaline | acetylcholine |
| origin | thoracic–lumbar spinal cord | brainstem (vagus nerve) and sacral cord |

Both branches are controlled by the **hypothalamus**; most organs receive both (antagonistic control), which allows fine adjustment. Sweat glands and the adrenal medulla get sympathetic fibres only.

## Heartbeat control
The sinoatrial node beats on its own; the medulla oblongata adjusts it: high CO₂ → sympathetic (noradrenaline) → faster and stronger; parasympathetic (vagus, acetylcholine) → slower. Loewi's experiment: fluid from a vagus-stimulated frog heart slowed a second heart → chemical transmission.

## Thermoregulation (homeothermic animals)
:::fig thermoregulation

Sensor: temperature receptors in skin and the **hypothalamus** itself. Setpoint ~37 °C.
| when **cold** | when **hot** |
|---|---|
| skin blood vessels **constrict** (less heat lost) | vessels **dilate** (flushed skin) |
| **shivering** (skeletal muscle heat) | **sweating** (evaporation cools) |
| arrector pili contract (goose bumps, fur stands up) | panting in dogs |
| sympathetic → **adrenaline**, TSH → **thyroxine**, ACTH → glucocorticoids: metabolism ↑ (heat production) | metabolism not raised |
| behaviour: curl up, seek warmth | behaviour: seek shade |
Heat production (liver, muscles) vs heat loss (skin, breath) are balanced. Fever: the setpoint is raised by the immune system.

## Homeostasis in general
Internal environment = blood, tissue fluid, lymph (Claude Bernard, Cannon). Regulated: temperature, osmotic pressure, blood sugar, pH (buffered by HCO₃⁻; CO₂ sensed by the medulla), O₂/CO₂. Mechanism: sensor → control centre (hypothalamus/medulla) → effector via nerves (fast) and hormones (sustained), with **negative feedback**.

## Poikilotherms
Fish, amphibians, reptiles: body temperature follows the environment; behaviour (basking) regulates it. Birds/mammals: homeotherms, high metabolic cost.`,
      ja: r`## 2つの系
| 対象 | **交感神経**（活動、ストレス） | **副交感神経**（休息） |
|---|---|---|
| 心拍数 | ↑ | ↓ |
| 瞳孔 | 拡大 | 縮小 |
| 気管支 | 拡張 | 収縮 |
| 消化（腸の運動、分泌） | ↓ | ↑ |
| 皮膚・腸の血管 | 収縮 | （ほとんど分布なし） |
| ぼうこう | 弛緩（ためる） | 収縮（排出） |
| 汗腺、副腎髄質、立毛筋 | 促進（交感神経のみ） | — |
| 末端の神経伝達物質 | ノルアドレナリン | アセチルコリン |
| 起点 | 胸髄・腰髄 | 脳幹（迷走神経）と仙髄 |

両系とも**視床下部**が支配。多くの器官は両方を受け（拮抗的支配）、細かい調節ができる。汗腺と副腎髄質は交感神経だけ。

## 心拍の調節
洞房結節は自律的に拍動し、延髄が調節する：CO₂ が多い → 交感神経（ノルアドレナリン）→ 速く強く。副交感神経（迷走神経、アセチルコリン）→ 遅く。レーウィの実験：迷走神経を刺激したカエルの心臓の液で別の心臓が遅くなった → 化学的な伝達。

## 体温調節（恒温動物）
:::fig thermoregulation

センサー：皮膚と**視床下部**自身の温度受容器。設定値 約 37 ℃。
| **寒い**とき | **暑い**とき |
|---|---|
| 皮膚の血管が**収縮**（放熱減） | 血管が**拡張**（顔が赤くなる） |
| **ふるえ**（骨格筋の発熱） | **発汗**（蒸発で冷やす） |
| 立毛筋の収縮（鳥肌、毛が立つ） | イヌはあえぎ呼吸 |
| 交感神経 → **アドレナリン**、TSH → **チロキシン**、ACTH → 糖質コルチコイド：代謝 ↑（熱産生） | 代謝は上げない |
| 行動：丸くなる、暖かい所へ | 行動：日陰へ |
熱産生（肝臓、筋肉）と放熱（皮膚、呼気）がつり合う。発熱：免疫系が設定値を上げる。

## 恒常性（ホメオスタシス）全般
体内環境 = 血液、組織液、リンパ（ベルナール、キャノン）。調節されるもの：体温、浸透圧、血糖、pH（HCO₃⁻ による緩衝。CO₂ は延髄が感知）、O₂/CO₂。しくみ：受容器 → 調節中枢（視床下部／延髄）→ 神経（速い）とホルモン（持続的）で効果器へ、**負のフィードバック**つき。

## 変温動物
魚類、両生類、は虫類：体温は環境に従う。行動（日光浴）で調節。鳥類・哺乳類：恒温、代謝のコストが大きい。`,
    },
    exam: {
      en: ['Which statement about the response to a body-temperature drop is false (e.g. "skin vessels dilate" is false) (most years).', 'Sympathetic vs parasympathetic effects on heart, pupil, digestion; which transmitter; which organs get only sympathetic fibres.', 'Label the thermoregulation scheme: hypothalamus → nerves/hormones → skin, muscle, liver.'],
      ja: ['体温低下時の反応についての誤った記述（例「皮膚の血管が拡張する」は誤り）（ほぼ毎年）。', '交感神経と副交感神経の心臓・瞳孔・消化への作用。伝達物質。交感神経だけが分布する器官。', '体温調節の図の名称：視床下部 → 神経／ホルモン → 皮膚、筋肉、肝臓。'],
    },
    traps: {
      en: ['When cold, skin vessels **constrict** and sweating **stops**; when hot they dilate. Students often invert this.', 'Sympathetic slows **digestion** but speeds the **heart** — the two go opposite ways.', 'Thyroxine and adrenaline raise heat production; they are not "cooling" hormones.'],
      ja: ['寒いときは皮膚の血管が**収縮**し発汗は**止まる**。暑いときは拡張。ここを逆にする誤りが多い。', '交感神経は**消化**を抑え**心臓**を速める — 2つは逆向き。', 'チロキシンとアドレナリンは熱産生を高める。「冷やす」ホルモンではない。'],
    },
    followups: {
      en: ['Why do we get goose bumps when cold?', 'Explain Loewi\'s experiment and what it proved.', 'List what happens in the body in the first minute after stepping into cold water.', 'How does the body sense CO₂ and adjust breathing and heart rate?'],
      ja: ['寒いと鳥肌が立つのはなぜ？', 'レーウィの実験とそれが証明したことを説明して。', '冷たい水に入った最初の1分間に体で起こることを挙げて。', '体は CO₂ をどう感知して呼吸と心拍を調節する？'],
    },
  },
  {
    id: 'immunity',
    core: {
      en: 'Defence has layers: barriers (skin, mucus), then innate responses (macrophages, neutrophils, inflammation) that treat every invader alike, then adaptive immunity that recognises the specific antigen — B cells make antibodies (humoral), killer T cells destroy infected cells (cellular), and helper T cells coordinate both. Memory cells make the second response faster and stronger, which is what vaccines exploit.',
      ja: '防御には層がある：物理的な障壁（皮膚、粘液）、次にどの侵入者にも同じように対応する自然免疫（マクロファージ、好中球、炎症）、そして特定の抗原を認識する獲得免疫 — B 細胞が抗体をつくり（体液性）、キラー T 細胞が感染細胞を破壊し（細胞性）、ヘルパー T 細胞が両方を指揮する。記憶細胞が二次応答を速く強くし、ワクチンはそれを利用する。',
    },
    body: {
      en: r`## Three lines of defence
1. **Barriers**: skin (keratin, sebum), mucous membranes, stomach acid, lysozyme in tears/saliva.
2. **Innate (non-specific) immunity**: **phagocytes** — neutrophils, macrophages, dendritic cells — engulf microbes; inflammation (redness, heat, swelling: histamine widens vessels); natural killer cells; fever. Same response to everything, no memory.
3. **Adaptive (acquired) immunity**: specific to each **antigen** (foreign molecule, usually protein/polysaccharide), with **memory**. Carried out by **lymphocytes**: **B cells** (mature in bone marrow) and **T cells** (mature in the **thymus**).

## The two adaptive arms
:::fig immune-response

| | humoral immunity | cellular immunity |
|---|---|---|
| cells | **B cells** → plasma cells | **killer (cytotoxic) T cells** |
| weapon | **antibodies** (immunoglobulins) in blood/lymph | direct killing of infected / cancer / transplanted cells |
| targets | bacteria, toxins, viruses **outside** cells | virus-infected cells, tumour cells, grafts (rejection) |
| helped by | helper T cells (cytokines) | helper T cells |

Sequence: dendritic cell/macrophage eats the pathogen and **presents the antigen** (on MHC) → **helper T cell** recognises it and releases cytokines → activates the specific B cell (→ plasma cells secreting antibodies, and memory B cells) and killer T cells (and memory T cells).
**Antibody** = Y-shaped protein; the tips bind the antigen specifically (antigen–antibody reaction) → clumps (agglutination), neutralises toxins, marks for phagocytosis. Each B cell makes one antibody; the huge variety comes from **gene rearrangement** (Tonegawa, Nobel 1987).

## Primary vs secondary response
:::fig antibody-response

First exposure: lag of several days, small antibody peak, then decline. Second exposure to the **same** antigen: memory cells respond **faster** (1–2 days) and **much stronger** (higher, longer-lasting peak). A different antigen at the same time gets only a primary response — specificity.

## Applications
- **Vaccine** (preventive): weakened/killed pathogen or its antigen → primary response + memory without disease (Jenner, smallpox). Active immunity, lasts years.
- **Serum therapy** (treatment): inject ready-made **antibodies** (antiserum from a horse etc.) → immediate but no memory (passive immunity). Snakebite, tetanus, diphtheria (Kitasato).
- Blood transfusion / transplants: rejection is cellular immunity (killer T cells against foreign MHC); immunosuppressants.

## When immunity goes wrong
- **Allergy**: over-reaction to harmless antigens (pollen, food) — IgE, histamine from mast cells; anaphylaxis is severe.
- **Autoimmune disease**: attacks self (type 1 diabetes, rheumatoid arthritis).
- **AIDS**: HIV infects and destroys **helper T cells** → both arms collapse → opportunistic infections. HIV is a retrovirus (RNA → DNA by reverse transcriptase).
- Immunodeficiency; immune tolerance (no reaction to self).`,
      ja: r`## 3段階の防御
1. **障壁**：皮膚（ケラチン、皮脂）、粘膜、胃酸、涙・だ液のリゾチーム。
2. **自然免疫（非特異的）**：**食細胞** — 好中球、マクロファージ、樹状細胞 — が微生物を取り込む。炎症（赤み、熱、腫れ：ヒスタミンが血管を広げる）。NK 細胞。発熱。何に対しても同じ反応で記憶なし。
3. **獲得免疫（適応免疫）**：各**抗原**（異物、ふつうタンパク質や多糖）に特異的で、**記憶**がある。**リンパ球**が担う：**B 細胞**（骨髄で成熟）と **T 細胞**（**胸腺**で成熟）。

## 獲得免疫の2つの腕
:::fig immune-response

| | 体液性免疫 | 細胞性免疫 |
|---|---|---|
| 細胞 | **B 細胞** → 形質細胞 | **キラー T 細胞** |
| 武器 | 血液・リンパ中の**抗体**（免疫グロブリン） | 感染細胞・がん細胞・移植細胞を直接破壊 |
| 標的 | 細胞の**外**の細菌、毒素、ウイルス | ウイルス感染細胞、腫瘍細胞、移植片（拒絶） |
| 助ける細胞 | ヘルパー T 細胞（サイトカイン） | ヘルパー T 細胞 |

順序：樹状細胞／マクロファージが病原体を食べて**抗原提示**（MHC 上）→ **ヘルパー T 細胞**が認識しサイトカインを放出 → 特定の B 細胞（→ 抗体を分泌する形質細胞と記憶 B 細胞）とキラー T 細胞（と記憶 T 細胞）を活性化。
**抗体** = Y 字形のタンパク質。先端が抗原に特異的に結合（抗原抗体反応）→ 凝集、毒素の中和、食作用の目印。1つの B 細胞は1種の抗体をつくる。膨大な多様性は**遺伝子の再編成**による（利根川、1987年ノーベル賞）。

## 一次応答と二次応答
:::fig antibody-response

初回の感染：数日の遅れ、小さな抗体のピーク、その後減少。**同じ**抗原への2回目：記憶細胞が**速く**（1〜2日）**はるかに強く**（高く長く続くピーク）応答。同時に別の抗原が入っても一次応答だけ — 特異性。

## 応用
- **ワクチン**（予防）：弱毒化・不活化した病原体やその抗原 → 発症せずに一次応答と記憶（ジェンナー、天然痘）。能動免疫、数年持続。
- **血清療法**（治療）：できあがった**抗体**（ウマなどの抗血清）を注射 → 即効だが記憶なし（受動免疫）。ヘビ毒、破傷風、ジフテリア（北里）。
- 輸血・移植：拒絶反応は細胞性免疫（外来の MHC に対するキラー T 細胞）。免疫抑制剤。

## 免疫の異常
- **アレルギー**：無害な抗原（花粉、食物）への過剰反応 — IgE、マスト細胞からのヒスタミン。アナフィラキシーは重症。
- **自己免疫疾患**：自己を攻撃（1型糖尿病、関節リウマチ）。
- **エイズ（AIDS）**：HIV が**ヘルパー T 細胞**に感染して破壊 → 両方の腕が崩れる → 日和見感染。HIV はレトロウイルス（逆転写酵素で RNA → DNA）。
- 免疫不全。免疫寛容（自己に反応しない）。`,
    },
    exam: {
      en: ['Antibody-titer graph: choose the curve for a second exposure to the same antigen (fast, high) vs a new antigen (primary) (most years).', 'True/false: vaccines give memory, serum therapy gives antibodies directly, HIV infects helper T cells, rejection is cellular immunity.', 'Which cell does what: macrophage (phagocytosis, presentation), helper T (coordination), B (antibody), killer T (kills infected cells).'],
      ja: ['抗体量のグラフ：同じ抗原の2回目（速く高い）と新しい抗原（一次応答）の曲線を選ぶ（ほぼ毎年）。', '正誤：ワクチンは記憶をつくる、血清療法は抗体を直接与える、HIV はヘルパー T 細胞に感染する、拒絶反応は細胞性免疫。', 'どの細胞が何をするか：マクロファージ（食作用、抗原提示）、ヘルパー T（指揮）、B（抗体）、キラー T（感染細胞を殺す）。'],
    },
    traps: {
      en: ['Vaccine = **active** immunity with memory (prevention); serum = **passive**, immediate, no memory (treatment).', 'Secondary response happens only for the **same** antigen; a new antigen starts from scratch.', 'Antibodies are made by B cells (plasma cells), **not** by T cells; T cells help or kill.'],
      ja: ['ワクチン = 記憶を伴う**能動**免疫（予防）。血清 = **受動**、即効、記憶なし（治療）。', '二次応答は**同じ**抗原に対してだけ。新しい抗原は一から。', '抗体をつくるのは B 細胞（形質細胞）で、T 細胞では**ない**。T 細胞は助けるか殺す。'],
    },
    followups: {
      en: ['Explain why the second response is faster and stronger.', 'What is the difference between a vaccine and serum therapy, with an example each?', 'Why does HIV cripple the whole immune system?', 'Walk through what happens from a splinter with bacteria to antibody production.'],
      ja: ['二次応答が速く強い理由を説明して。', 'ワクチンと血清療法の違いを例つきで。', 'HIV が免疫系全体を弱らせるのはなぜ？', '細菌のついたとげが刺さってから抗体ができるまでを順に説明して。'],
    },
  },
  // ───────────────────────────── NERVES, SENSES, MUSCLE ─────────────────────────────
  {
    id: 'neuron-brain',
    core: {
      en: 'A neuron signals with electricity along its axon and with chemicals across the synapse. The signal is all-or-none: once a stimulus crosses the threshold, an action potential of fixed size fires; stronger stimuli fire more often, not bigger. Reflexes take a short cut through the spinal cord, and each brain part owns a job — cerebrum thinks, cerebellum balances, medulla keeps you breathing.',
      ja: 'ニューロンは軸索では電気で、シナプスでは化学物質で信号を伝える。信号は全か無か：刺激が閾値を超えると決まった大きさの活動電位が発生し、強い刺激は大きくなるのではなく回数が増える。反射は脊髄を通る近道で、脳の各部には役割がある — 大脳は考え、小脳はバランスをとり、延髄は呼吸を保つ。',
    },
    body: {
      en: r`## Neuron
Cell body + **dendrites** (receive) + **axon** (sends), often wrapped in a **myelin sheath** (Schwann cells) with gaps (**nodes of Ranvier**) → **saltatory conduction**, much faster. Three kinds: **sensory** (receptor → CNS), **interneuron** (in the CNS), **motor** (CNS → muscle/gland).

## Resting and action potential
:::fig action-potential

- **Resting potential** ≈ −70 mV: the Na⁺/K⁺ pump keeps Na⁺ outside and K⁺ inside; K⁺ leaks out through open channels → inside negative.
- Stimulus above **threshold** → voltage-gated **Na⁺ channels** open → Na⁺ rushes in → inside becomes positive (+30 mV, **depolarisation**) → Na⁺ channels close, **K⁺ channels** open → K⁺ leaves → back to negative (**repolarisation**, brief overshoot). ~1 ms, then a **refractory period** (cannot fire again immediately → one-way travel).
- **All-or-none law**: below threshold nothing; above it the same size every time. **Stimulus strength is coded by frequency** of impulses and by how many fibres fire.

## Synapse
Impulse reaches the axon terminal → Ca²⁺ enters → vesicles release **neurotransmitter** (acetylcholine, noradrenaline, GABA) into the cleft → binds receptors on the next cell → excitatory (EPSP) or inhibitory (IPSP) potential; summation decides whether the next neuron fires. **One-way** (vesicles only on the presynaptic side), slight delay; drugs and toxins act here.

## Reflex arc
Receptor → sensory neuron → (interneuron in) **spinal cord** → motor neuron → effector. Fast and automatic because it bypasses the brain (knee jerk has no interneuron; withdrawal reflex has one). The brain learns of it afterwards. Pupil reflex centre: midbrain.

## The brain (vertebrates)
| part | job |
|---|---|
| **cerebrum** | thought, memory, voluntary movement, senses, language; cortex (grey) outside |
| **cerebellum** | **balance, coordination** of movement |
| **medulla oblongata** | breathing, heartbeat, swallowing — life support |
| midbrain | eye reflexes, posture |
| **hypothalamus** (diencephalon) | autonomic and hormone centre, temperature, hunger |
| thalamus | relay of sensory input |
Brain stem = midbrain + pons + medulla. Spinal cord: grey matter inside (cell bodies), white outside (axons) — opposite of the cerebrum. Left brain controls the right body (crossing in the medulla).

## Nervous system map
Central (brain, spinal cord) vs peripheral (cranial and spinal nerves). Peripheral = somatic (sensory + motor, voluntary) + autonomic (sympathetic, parasympathetic).`,
      ja: r`## ニューロン
細胞体 ＋ **樹状突起**（受け取る）＋ **軸索**（送る）。多くは**髄鞘**（シュワン細胞）に包まれ、切れ目（**ランビエ絞輪**）がある → **跳躍伝導**、ずっと速い。3種類：**感覚ニューロン**（受容器 → 中枢）、**介在ニューロン**（中枢内）、**運動ニューロン**（中枢 → 筋肉・腺）。

## 静止電位と活動電位
:::fig action-potential

- **静止電位** ≈ −70 mV：ナトリウムポンプが Na⁺ を外、K⁺ を内に保ち、K⁺ が開いたチャネルから漏れ出す → 内側が負。
- **閾値**を超える刺激 → 電位依存性 **Na⁺ チャネル**が開く → Na⁺ が流入 → 内側が正（+30 mV、**脱分極**）→ Na⁺ チャネルが閉じ **K⁺ チャネル**が開く → K⁺ が流出 → 負に戻る（**再分極**、少し行き過ぎ）。約 1 ms、その後**不応期**（すぐには再発火できない → 一方向に伝わる）。
- **全か無かの法則**：閾値以下では何も起こらず、超えれば毎回同じ大きさ。**刺激の強さは頻度**と発火する繊維の数で表される。

## シナプス
興奮が軸索末端に届く → Ca²⁺ が流入 → 小胞が**神経伝達物質**（アセチルコリン、ノルアドレナリン、GABA）を間隙に放出 → 次の細胞の受容体に結合 → 興奮性（EPSP）か抑制性（IPSP）の電位。加重で次のニューロンが発火するか決まる。**一方向**（小胞はシナプス前側だけ）、少し遅れる。薬物や毒はここに作用。

## 反射弓
受容器 → 感覚ニューロン →（介在ニューロンを経て）**脊髄** → 運動ニューロン → 効果器。脳を通らないので速く自動的（膝蓋腱反射には介在ニューロンがなく、屈曲反射にはある）。脳は後で知る。瞳孔反射の中枢：中脳。

## 脳（脊椎動物）
| 部位 | 役割 |
|---|---|
| **大脳** | 思考、記憶、随意運動、感覚、言語。皮質（灰白質）が外側 |
| **小脳** | **平衡、運動の協調** |
| **延髄** | 呼吸、心拍、嚥下 — 生命維持 |
| 中脳 | 眼の反射、姿勢 |
| **視床下部**（間脳） | 自律神経とホルモンの中枢、体温、空腹 |
| 視床 | 感覚入力の中継 |
脳幹 = 中脳 ＋ 橋 ＋ 延髄。脊髄：内側が灰白質（細胞体）、外側が白質（軸索）— 大脳と逆。左脳が右半身を支配（延髄で交差）。

## 神経系の地図
中枢（脳、脊髄）と末梢（脳神経、脊髄神経）。末梢 = 体性（感覚 ＋ 運動、随意）＋ 自律（交感、副交感）。`,
    },
    exam: {
      en: ['Choose the graph of action potential vs stimulus strength (all-or-none: zero below threshold, constant above; frequency rises with strength) (most years).', 'Which brain region controls balance (cerebellum), breathing (medulla), or is the reflex centre for the knee jerk (spinal cord).', 'Order of the reflex arc; why synapses transmit one way; role of myelin.'],
      ja: ['刺激の強さと活動電位のグラフを選ぶ（全か無か：閾値以下は0、以上は一定。頻度は強さで増える）（ほぼ毎年）。', '平衡（小脳）、呼吸（延髄）を支配する脳の部位、膝蓋腱反射の中枢（脊髄）。', '反射弓の順序。シナプスが一方向な理由。髄鞘の役割。'],
    },
    traps: {
      en: ['A stronger stimulus does **not** make a bigger action potential — it makes more frequent ones.', 'Depolarisation is Na⁺ **in**; repolarisation is K⁺ **out**. The pump restores the gradients afterwards.', 'Balance is the **cerebellum**, not the cerebrum; breathing is the **medulla**, not the cerebellum.'],
      ja: ['強い刺激で活動電位は大きく**ならない** — 頻度が増える。', '脱分極は Na⁺ の**流入**、再分極は K⁺ の**流出**。ポンプはその後に勾配を回復する。', '平衡は大脳でなく**小脳**。呼吸は小脳でなく**延髄**。'],
    },
    followups: {
      en: ['Explain the action potential step by step with the ion movements.', 'Why is the resting potential negative?', 'Why does myelin make conduction faster?', 'What is the difference between the knee-jerk and the withdrawal reflex?'],
      ja: ['イオンの動きを含めて活動電位を順に説明して。', '静止電位が負なのはなぜ？', '髄鞘があると伝導が速くなるのはなぜ？', '膝蓋腱反射と屈曲反射の違いは？'],
    },
  },
  {
    id: 'sensory-organs',
    core: {
      en: 'Each sense organ has receptor cells tuned to one stimulus (its adequate stimulus) that convert it into nerve impulses. In the eye, the lens focuses light onto the retina where rods (dim light, black-and-white) and cones (colour, sharp vision at the fovea) respond; in the ear, the cochlea sorts pitch by position along its length, while the semicircular canals sense rotation and the otolith organs sense tilt.',
      ja: '感覚器には1種類の刺激（適刺激）に応じる受容細胞があり、それを神経の興奮に変える。眼では水晶体が光を網膜に結び、桿体細胞（暗所、白黒）と錐体細胞（色、黄斑での鮮明な視覚）が応じる。耳ではうずまき管がその長さに沿った位置で音の高さを分け、半規管が回転、前庭が傾きを感知する。',
    },
    body: {
      en: r`## Eye
:::fig eye

Light path: cornea → aqueous humour → pupil (iris controls size) → **lens** → vitreous humour → **retina** (inverted image). The optic nerve leaves at the **blind spot** (no receptors).
| cell | where | works in | detects |
|---|---|---|---|
| **rod cells** | periphery of retina | dim light (rhodopsin, vitamin A) | brightness only, no colour |
| **cone cells** | concentrated in the **fovea (yellow spot)** | bright light | **colour** (3 types: red, green, blue) and fine detail |

Signal path in the retina: light passes through ganglion and bipolar cells **first**, hits the photoreceptors at the back, then the signal travels forward to the ganglion cells → optic nerve. (The EJU asks the direction of light vs signal.)
**Accommodation**: near object → ciliary muscle **contracts** → suspensory ligaments slacken → lens **thicker**; far → muscle relaxes → lens thinner. **Pupil**: dark → dilates (sympathetic); bright → constricts (parasympathetic). **Dark adaptation**: rods take minutes to rebuild rhodopsin; light adaptation is fast.
Myopia (long eyeball → concave lens), hyperopia (convex lens).

## Ear
Sound: pinna → ear canal → **eardrum** vibrates → **ossicles** (malleus, incus, stapes amplify) → oval window → fluid in the **cochlea** → **basilar membrane** vibrates → **hair cells** (organ of Corti) bend → auditory nerve. **Pitch by place**: high frequencies vibrate the basilar membrane near the **base** (oval-window end, narrow, stiff), low frequencies near the **apex** (tip). Loudness = amplitude → firing frequency. Eustachian tube equalises pressure.
Balance (vestibular apparatus):
| organ | senses |
|---|---|
| **semicircular canals** (3, at right angles) | **rotation** — fluid lags, bends the cupula hair cells |
| **otolith organs** (utricle, saccule) | **tilt and linear acceleration** — otoliths (CaCO₃ crystals) press on hair cells |

## Other receptors
Skin: touch, pressure, warmth, cold, pain (different receptors; density highest in fingertips). Tongue: taste buds (sweet, salty, sour, bitter, umami). Nose: olfactory cells (chemicals, adapts quickly). Muscle spindles sense stretch. Lateral line in fish, pit organs (infrared) in snakes, compound eyes in insects.

## General principles
- **Adequate stimulus**: each receptor responds best to one kind (eye to light) — pressing the eye also gives "light" because the brain reads the nerve, not the stimulus.
- Threshold, adaptation (constant stimulus → response fades: smell, touch; pain hardly adapts).
- The sensation is created in the **cerebrum**'s sensory area, not in the organ.`,
      ja: r`## 眼
:::fig eye

光の経路：角膜 → 眼房水 → 瞳孔（虹彩が大きさを調節）→ **水晶体** → ガラス体 → **網膜**（倒立像）。視神経は**盲斑**（受容細胞なし）から出る。
| 細胞 | 位置 | はたらく条件 | 感じるもの |
|---|---|---|---|
| **桿体細胞** | 網膜の周辺部 | 暗い光（ロドプシン、ビタミン A） | 明暗のみ、色なし |
| **錐体細胞** | **黄斑**に集中 | 明るい光 | **色**（赤・緑・青の3種）と細部 |

網膜内の信号の経路：光は**まず**神経節細胞と双極細胞を通り抜け、奥の視細胞に当たる。信号はそこから前へ戻って神経節細胞 → 視神経。（EJUは光と信号の向きを問う。）
**遠近調節**：近くを見る → 毛様体筋が**収縮** → チン小帯がゆるむ → 水晶体が**厚く**。遠く → 筋が弛緩 → 薄く。**瞳孔**：暗い → 拡大（交感神経）。明るい → 縮小（副交感神経）。**暗順応**：桿体細胞がロドプシンを再合成するのに数分。明順応は速い。
近視（眼球が長い → 凹レンズ）、遠視（凸レンズ）。

## 耳
音：耳介 → 外耳道 → **鼓膜**が振動 → **耳小骨**（つち・きぬた・あぶみ骨が増幅）→ 卵円窓 → **うずまき管**の液体 → **基底膜**が振動 → **聴細胞**（コルチ器）の感覚毛が曲がる → 聴神経。**場所で高さを分ける**：高い音は**基部**（卵円窓側、狭く硬い）付近、低い音は**先端**付近の基底膜を振動させる。大きさ = 振幅 → 発火頻度。耳管は圧を等しくする。
平衡（前庭器官）：
| 器官 | 感じるもの |
|---|---|
| **半規管**（3つ、直交） | **回転** — 液体が遅れてクプラの感覚毛を曲げる |
| **前庭**（卵形のう、球形のう） | **傾きと直線加速度** — 耳石（CaCO₃）が感覚毛を押す |

## その他の受容器
皮膚：触覚、圧覚、温覚、冷覚、痛覚（別々の受容器。指先で密度最大）。舌：味覚芽（甘・塩・酸・苦・うま味）。鼻：嗅細胞（化学物質、すぐ順応）。筋紡錘は伸びを感知。魚の側線、ヘビのピット器官（赤外線）、昆虫の複眼。

## 一般原則
- **適刺激**：各受容器は1種類の刺激に最もよく応じる（眼は光）— 眼を押しても「光」を感じるのは、脳が刺激でなく神経を読んでいるから。
- 閾値、順応（一定の刺激 → 反応が薄れる：におい、触覚。痛みはほとんど順応しない）。
- 感覚は感覚器でなく**大脳**の感覚野で生じる。`,
    },
    exam: {
      en: ['Retina diagram: label rods/cones/ganglion cells and the direction of light vs signal; where is the blind spot / fovea (most years).', 'Cochlea: which end receives high vs low pitch; order of structures from eardrum to nerve.', 'Which organ senses rotation (semicircular canals) vs tilt (otolith organs); accommodation for near objects.'],
      ja: ['網膜の図：桿体・錐体・神経節細胞の名称、光と信号の向き。盲斑・黄斑の位置（ほぼ毎年）。', 'うずまき管：高い音と低い音を受け取るのはどちらの端か。鼓膜から神経までの構造の順。', '回転（半規管）と傾き（前庭）を感じる器官。近くを見るときの調節。'],
    },
    traps: {
      en: ['Light enters from the ganglion-cell side and reaches the photoreceptors **last**; the signal then goes the other way.', 'High pitch is detected near the **base** (entrance) of the cochlea, not the tip.', 'For near vision the ciliary muscle **contracts** and the lens gets **thicker** — students often reverse one of these.'],
      ja: ['光は神経節細胞側から入り視細胞には**最後**に届く。信号はその逆向きに進む。', '高い音はうずまき管の**基部**（入口）付近で感知され、先端ではない。', '近くを見るときは毛様体筋が**収縮**し水晶体が**厚く**なる — どちらかを逆にする誤りが多い。'],
    },
    followups: {
      en: ['Why do we see colour poorly in dim light?', 'Explain how the cochlea tells pitch apart.', 'Walk through accommodation for near and far objects.', 'Why does pressing on your closed eye produce flashes of light?'],
      ja: ['暗いところで色がよく見えないのはなぜ？', 'うずまき管が音の高さを区別するしくみを説明して。', '近くと遠くを見るときの調節を順に説明して。', '閉じた眼を押すと光が見えるのはなぜ？'],
    },
  },
  {
    id: 'muscle-contraction',
    core: {
      en: 'A muscle shortens because thin actin filaments slide over thick myosin filaments — neither filament gets shorter. The trigger is Ca²⁺ released from the sarcoplasmic reticulum when a nerve impulse arrives; Ca²⁺ moves tropomyosin off the actin so myosin heads can grab, pull and release, powered by ATP. Remove the Ca²⁺ and the muscle relaxes.',
      ja: '筋肉が縮むのは細いアクチンフィラメントが太いミオシンフィラメントの上を滑るからで、どちらのフィラメントも短くならない。引き金は神経の興奮が届いたときに筋小胞体から放出される Ca²⁺。Ca²⁺ がトロポミオシンをアクチンからどかし、ミオシン頭部が ATP を使ってつかむ・引く・離すを繰り返す。Ca²⁺ が回収されると弛緩する。',
    },
    body: {
      en: r`## Structure (skeletal muscle)
Muscle → muscle fibres (cells, multinucleate) → **myofibrils** → repeating units called **sarcomeres** (Z line to Z line).
:::fig sarcomere

| band | contains | on contraction |
|---|---|---|
| **A band** (dark) | myosin (thick) filaments, overlapping actin | **same length** |
| **I band** (light) | actin (thin) only | shorter |
| **H zone** | myosin only (centre of A) | shorter / disappears |
| sarcomere (Z–Z) | one unit | shorter |

Three muscle types: skeletal (striated, voluntary, fast), cardiac (striated, involuntary, automatic), smooth (no striations, involuntary, slow — gut, vessels).

## Sliding filament theory
1. Motor neuron impulse → acetylcholine at the neuromuscular junction → action potential along the fibre and down the **T tubules**.
2. **Sarcoplasmic reticulum** releases **Ca²⁺**.
3. Ca²⁺ binds **troponin**, which pulls **tropomyosin** off the myosin-binding sites on actin.
4. **Myosin heads** (with ADP + Pi from ATP hydrolysis) bind actin, **swing** (power stroke) pulling actin toward the centre, release when a new ATP binds, and repeat — the cross-bridge cycle.
5. Impulses stop → Ca²⁺ is pumped back into the sarcoplasmic reticulum (ATP) → tropomyosin covers the sites → relaxation.
ATP is needed both to **detach** myosin and to pump Ca²⁺ back; without ATP the heads stay stuck (rigor mortis).

## Energy supply
ATP in muscle lasts seconds → regenerated from **creatine phosphate** (fast), then glycolysis (lactic acid, oxygen debt), then aerobic respiration (sustained). Red (slow, myoglobin-rich, endurance) vs white (fast, glycolytic) fibres.

## Responses to stimulation
- **Twitch**: one impulse → single contraction (latent period, contraction, relaxation).
- **Summation / tetanus**: impulses arrive before relaxation → fused, sustained, stronger contraction (normal movement is tetanus).
- All-or-none applies to each **fibre**; whole-muscle force is graded by recruiting more fibres and higher frequency.
- Antagonistic pairs (biceps/triceps): one contracts while the other relaxes; muscles only **pull**.

## Experiment to know
Glycerinated muscle fibre: adding ATP alone makes it contract (with Ca²⁺ present); adding ATP without Ca²⁺ (chelated) → no contraction. Shows both are required.`,
      ja: r`## 構造（骨格筋）
筋肉 → 筋繊維（細胞、多核）→ **筋原繊維** → **サルコメア**（筋節、Z 膜から Z 膜）の繰り返し。
:::fig sarcomere

| 帯 | 含むもの | 収縮時 |
|---|---|---|
| **暗帯（A 帯）** | ミオシン（太い）フィラメント、アクチンと重なる | **長さ不変** |
| **明帯（I 帯）** | アクチン（細い）のみ | 短くなる |
| **H 帯** | ミオシンのみ（A 帯の中央） | 短くなる／消える |
| サルコメア（Z–Z） | 1単位 | 短くなる |

筋肉の3種類：骨格筋（横紋、随意、速い）、心筋（横紋、不随意、自動性）、平滑筋（横紋なし、不随意、遅い — 腸、血管）。

## 滑り説
1. 運動ニューロンの興奮 → 神経筋接合部でアセチルコリン → 筋繊維に活動電位、**T 管**を伝わる。
2. **筋小胞体**が **Ca²⁺** を放出。
3. Ca²⁺ が**トロポニン**に結合し、**トロポミオシン**をアクチン上のミオシン結合部位からどかす。
4. **ミオシン頭部**（ATP 加水分解で ADP ＋ Pi をもつ）がアクチンに結合し、**首を振って**（パワーストローク）アクチンを中央へ引き、新しい ATP が結合すると離れ、繰り返す — クロスブリッジサイクル。
5. 興奮が止まる → Ca²⁺ が筋小胞体にくみ戻される（ATP）→ トロポミオシンが結合部位を覆う → 弛緩。
ATP はミオシンが**離れる**のにも Ca²⁺ をくみ戻すのにも必要。ATP がないと頭部が結合したまま（死後硬直）。

## エネルギー供給
筋肉の ATP は数秒でなくなる → **クレアチンリン酸**から再生（速い）、次に解糖（乳酸、酸素負債）、そして好気呼吸（持続）。赤筋（遅筋、ミオグロビンが多い、持久力）と白筋（速筋、解糖系）。

## 刺激への反応
- **単収縮**：1回の興奮 → 1回の収縮（潜伏期、収縮期、弛緩期）。
- **加重／強縮**：弛緩前に次の興奮 → 融合した持続的で強い収縮（ふだんの運動は強縮）。
- 全か無かは各**筋繊維**に成り立つ。筋肉全体の力は動員する繊維の数と頻度で調節。
- 拮抗筋（上腕二頭筋／三頭筋）：一方が縮むと他方がゆるむ。筋肉は**引く**ことしかできない。

## 覚えるべき実験
グリセリン筋：ATP を加えるだけで収縮（Ca²⁺ があれば）。Ca²⁺ を除いて ATP を加える → 収縮しない。両方が必要なことを示す。`,
    },
    exam: {
      en: ['Sarcomere diagram: which bands shorten and which stay the same on contraction; label actin, myosin, Z line (most years).', 'Order the events from nerve impulse to contraction (acetylcholine → Ca²⁺ release → troponin/tropomyosin → myosin binds → ATP).', 'Twitch vs tetanus graphs; glycerinated-fibre experiment: what is needed for contraction.'],
      ja: ['サルコメアの図：収縮で短くなる帯と変わらない帯。アクチン、ミオシン、Z 膜の名称（ほぼ毎年）。', '神経の興奮から収縮までの順序（アセチルコリン → Ca²⁺ 放出 → トロポニン／トロポミオシン → ミオシン結合 → ATP）。', '単収縮と強縮のグラフ。グリセリン筋の実験：収縮に必要なもの。'],
    },
    traps: {
      en: ['Filaments **slide**; they do not shorten. The A band keeps its length; the I band and H zone shrink.', 'Ca²⁺ comes from the **sarcoplasmic reticulum** inside the fibre, not from the blood.', 'ATP is needed for **relaxation** too (detaching myosin, pumping Ca²⁺) — that is why rigor mortis happens.'],
      ja: ['フィラメントは**滑る**のであって短くならない。暗帯の長さは不変、明帯と H 帯が縮む。', 'Ca²⁺ は血液からでなく筋繊維内の**筋小胞体**から。', 'ATP は**弛緩**にも必要（ミオシンを離す、Ca²⁺ をくみ戻す）— だから死後硬直が起こる。'],
    },
    followups: {
      en: ['Walk through the cross-bridge cycle step by step.', 'Why does the A band stay the same length while the sarcomere shortens?', 'Explain rigor mortis with the sliding filament model.', 'What is oxygen debt?'],
      ja: ['クロスブリッジサイクルを順に説明して。', 'サルコメアが縮むのに暗帯の長さが変わらないのはなぜ？', '滑り説で死後硬直を説明して。', '酸素負債とは？'],
    },
  },
  // ───────────────────────────── PLANTS & BEHAVIOUR ─────────────────────────────
  {
    id: 'plant-hormones',
    core: {
      en: 'Plants steer growth with a few hormones. Auxin, made at the shoot tip, moves down the shaded side and makes stem cells elongate (so shoots bend toward light) but at the same concentration inhibits roots (so roots bend down); gibberellin triggers germination and stem elongation; abscisic acid says "wait" (dormancy, closes stomata); ethylene ripens fruit. The classic coleoptile experiments simply track where auxin can and cannot go.',
      ja: '植物は少数のホルモンで成長を操る。オーキシンは茎の先端でつくられ、陰側を下り、茎の細胞を伸ばす（だから茎は光へ曲がる）が、同じ濃度で根は抑える（だから根は下へ曲がる）。ジベレリンは発芽と茎の伸長を促し、アブシシン酸は「待て」と言い（休眠、気孔を閉じる）、エチレンは果実を熟させる。幼葉鞘の古典実験は、オーキシンがどこへ行けてどこへ行けないかを追うだけ。',
    },
    body: {
      en: r`## Auxin (indoleacetic acid, IAA) and phototropism
:::fig auxin-response

Made at the **tip** of the shoot/coleoptile; transported **downward only** (polar transport) and shifted to the **shaded side** by light. Cells on the shaded side elongate more → shoot bends **toward** the light (positive phototropism).
**Concentration matters**: stems need a higher optimum than roots. The concentration that maximally stimulates the stem **inhibits** the root. In a horizontal plant auxin collects on the lower side (gravitropism): the stem's lower side grows more → bends **up**; the root's lower side is inhibited → bends **down**.

## The coleoptile experiments (read them as "can auxin get through?")
| treatment | result | conclusion |
|---|---|---|
| tip removed | no bending, no growth | tip makes the signal |
| tip covered with opaque cap | no bending | tip senses light |
| base covered | bends | sensing is at the tip |
| tip cut, put back on agar block | bends/grows | signal is a diffusible chemical |
| **mica** (impermeable) inserted on the shaded side | **no** bending | signal must pass down the shaded side |
| mica on the lit side | bends | |
| **gelatin** (permeable) inserted | bends | chemical, not electrical |
| tip on agar, agar placed off-centre on a decapitated stump (dark) | bends away from the block side | the chemical causes growth where it lands |
Bending angle ∝ auxin concentration in the block (bioassay, Went).

## Other hormones
| hormone | main effects | notes |
|---|---|---|
| **gibberellin** | stem elongation (dwarf → tall), **germination** (induces **amylase** in the aleurone layer to digest starch), seedless grapes | opposite of ABA in seeds |
| **abscisic acid (ABA)** | **dormancy** of seeds/buds, **closes stomata** in drought, inhibits growth | "stress hormone" |
| **ethylene** (gas) | **fruit ripening**, leaf fall (abscission), thickening | one ripe apple ripens the bag |
| cytokinin | cell division, delays ageing, bud growth | works with auxin in tissue culture |
| auxin | elongation, apical dominance (tip suppresses side buds), root formation on cuttings, fruit set | synthetic auxins as weedkillers |

## Germination
Needs water, oxygen, suitable temperature; some seeds need **light** (photoblastic seeds: lettuce — red light via **phytochrome**: red → germinate, far-red → cancel, the last flash wins). Sequence: water uptake → gibberellin from the embryo → aleurone makes amylase → starch → sugar → growth.

## Stomata
Open when guard cells take up K⁺ and water (light, low CO₂, blue light); close under ABA in drought. Transpiration pulls water up the xylem (cohesion–tension).

## Tropisms and nastic movements
Tropism = directional growth (photo-, gravi-, hydro-, thigmo-); nastic = non-directional (tulip opening with temperature, Mimosa folding by turgor change).`,
      ja: r`## オーキシン（インドール酢酸、IAA）と光屈性
:::fig auxin-response

茎・幼葉鞘の**先端**でつくられ、**下向きにだけ**運ばれ（極性移動）、光で**陰側**へ移る。陰側の細胞がより伸長 → 茎は光の**方へ**曲がる（正の光屈性）。
**濃度が重要**：茎の最適濃度は根より高い。茎を最も伸ばす濃度は根を**抑える**。水平にした植物ではオーキシンが下側にたまる（重力屈性）：茎は下側がよく伸びて**上**へ曲がり、根は下側が抑えられて**下**へ曲がる。

## 幼葉鞘の実験（「オーキシンは通れるか？」と読む）
| 処理 | 結果 | 結論 |
|---|---|---|
| 先端を切る | 曲がらず伸びない | 先端が信号をつくる |
| 先端に不透明なキャップ | 曲がらない | 先端が光を感じる |
| 基部を覆う | 曲がる | 感知は先端 |
| 先端を切って寒天片の上に戻す | 曲がる・伸びる | 信号は拡散する化学物質 |
| 陰側に**雲母片**（通さない）を挿す | 曲がら**ない** | 信号は陰側を下る必要がある |
| 光側に雲母片 | 曲がる | |
| **ゼラチン**（通す）を挿す | 曲がる | 化学的で電気的でない |
| 先端をのせた寒天を切り株の片側にずらして置く（暗所） | 寒天と反対側へ曲がる | 化学物質が届いた側が伸びる |
曲がる角度 ∝ 寒天中のオーキシン濃度（生物検定、ウェント）。

## その他のホルモン
| ホルモン | 主な作用 | 備考 |
|---|---|---|
| **ジベレリン** | 茎の伸長（矮性 → 高く）、**発芽**（糊粉層に**アミラーゼ**をつくらせデンプンを分解）、種なしブドウ | 種子では ABA と逆 |
| **アブシシン酸（ABA）** | 種子・芽の**休眠**、乾燥時に**気孔を閉じる**、成長抑制 | 「ストレスホルモン」 |
| **エチレン**（気体） | **果実の成熟**、落葉（離層）、肥大 | 熟したリンゴ1個で袋全体が熟す |
| サイトカイニン | 細胞分裂、老化を遅らせる、芽の成長 | 組織培養でオーキシンと協働 |
| オーキシン | 伸長、頂芽優勢（先端が側芽を抑える）、挿し木の発根、結実 | 合成オーキシンは除草剤 |

## 発芽
水、酸素、適温が必要。**光**が必要な種子もある（光発芽種子：レタス — **フィトクロム**による赤色光：赤 → 発芽、遠赤 → 取り消し、最後の光が勝つ）。順序：吸水 → 胚からジベレリン → 糊粉層がアミラーゼをつくる → デンプン → 糖 → 成長。

## 気孔
孔辺細胞が K⁺ と水を取り込むと開く（光、低 CO₂、青色光）。乾燥時は ABA で閉じる。蒸散が道管の水を引き上げる（凝集力・張力説）。

## 屈性と傾性
屈性 = 方向のある成長（光・重力・水・接触）。傾性 = 方向によらない（温度で開くチューリップ、膨圧変化で閉じるオジギソウ）。`,
    },
    exam: {
      en: ['Coleoptile experiments with mica/gelatin inserts and agar blocks: predict bending and deduce where auxin moves (most years).', 'Germination blanks: gibberellin promotes, ABA inhibits, amylase digests starch; red/far-red light in lettuce seeds.', 'Auxin concentration-response graph: at which concentration does the stem grow but the root is inhibited; explain root gravitropism.'],
      ja: ['雲母片・ゼラチン片や寒天片を使った幼葉鞘の実験：曲がるかを予想し、オーキシンの移動経路を推定（ほぼ毎年）。', '発芽の空欄：ジベレリンが促進、ABA が抑制、アミラーゼがデンプンを分解。レタス種子の赤色光・遠赤色光。', 'オーキシン濃度と成長のグラフ：茎が伸びて根が抑えられる濃度。根の重力屈性の説明。'],
    },
    traps: {
      en: ['Auxin moves **down** (tip → base) only; it cannot move up through an inserted mica sheet or across a cut without agar.', 'The **same** auxin concentration promotes stems but inhibits roots — that is the whole explanation of gravitropism.', 'ABA and gibberellin are opposites in seeds: ABA keeps them dormant, gibberellin wakes them.'],
      ja: ['オーキシンは**下向き**（先端 → 基部）にしか動かない。挿した雲母片を越えたり、寒天なしで切り口を越えたりできない。', '**同じ**オーキシン濃度が茎を促進し根を抑制する — それが重力屈性の説明のすべて。', '種子では ABA とジベレリンが逆：ABA は休眠させ、ジベレリンは目覚めさせる。'],
    },
    followups: {
      en: ['Explain the mica vs gelatin experiment and what each proves.', 'Why do roots bend down if auxin collects on the lower side?', 'What is the role of amylase in germination and which hormone triggers it?', 'Give me a coleoptile experiment to predict.'],
      ja: ['雲母片とゼラチン片の実験とそれぞれが証明することを説明して。', 'オーキシンが下側にたまるのに根が下へ曲がるのはなぜ？', '発芽でのアミラーゼの役割と、それを引き起こすホルモンは？', '幼葉鞘の実験を出して結果を予想させて。'],
    },
  },
  {
    id: 'photoperiodism',
    core: {
      en: 'Plants time flowering by measuring the length of the night, not the day. A short-day plant flowers when the dark period is longer than its critical value; a long-day plant when it is shorter. Because the leaf measures the night with phytochrome, a flash of red light in the middle of the night resets the count, and the flowering signal (florigen) travels from the leaf to the bud.',
      ja: '植物は昼の長さではなく夜の長さを測って開花の時期を決める。短日植物は暗期が限界暗期より長いと開花し、長日植物は短いと開花する。夜の長さは葉がフィトクロムで測るので、夜の途中の赤色光の短い照射でカウントがリセットされ、開花の信号（フロリゲン）は葉から芽へ運ばれる。',
    },
    body: {
      en: r`## Three types
| type | flowers when | examples |
|---|---|---|
| **short-day plants** | night **longer** than the critical dark period (autumn) | chrysanthemum, rice, morning glory, cosmos, soybean |
| **long-day plants** | night **shorter** than the critical dark period (spring/summer) | spinach, radish, wheat, clover |
| day-neutral plants | regardless of day length | tomato, cucumber, dandelion |

The names are historical: what matters is the **continuous dark period**.

## The night-length rule (the experiment that decides everything)
:::fig photoperiod

- Short-day plant, critical dark period 10 h: 16 h dark → flowers; 8 h dark → no.
- Interrupt a long night with a **brief flash of red light** → the plant counts two short nights → a short-day plant does **not** flower, a long-day plant **does**.
- Interrupt the **day** with darkness → no effect.
- The red-light effect is cancelled by a following **far-red** flash (phytochrome: Pr ⇌ Pfr; red makes Pfr, which "resets" the timer).
So: cover a chrysanthemum's leaves to make it flower early; light a field at night to delay flowering (used commercially).

## Where the signal comes from
- The **leaf** perceives day length (a plant with all leaves removed does not respond).
- The signal, **florigen** (now known to be the FT protein), travels through the phloem to the shoot apex → flower buds. Grafting a leaf-exposed short-day plant to an unexposed one makes both flower.
- Even one leaf given the right photoperiod is enough.

## Vernalisation
Some plants (winter wheat, some biennials) must experience a period of **cold** before they can flower; the cold treatment of seeds or seedlings is vernalisation. Gibberellin can sometimes substitute.

## Other photoperiodic responses
Tuber formation (potato: short days), bud dormancy in autumn, animal breeding seasons and bird migration are also set by day length (via melatonin in animals).`,
      ja: r`## 3つの型
| 型 | 開花する条件 | 例 |
|---|---|---|
| **短日植物** | 暗期が限界暗期より**長い**（秋） | キク、イネ、アサガオ、コスモス、ダイズ |
| **長日植物** | 暗期が限界暗期より**短い**（春〜夏） | ホウレンソウ、ダイコン、コムギ、クローバー |
| 中性植物 | 日長によらない | トマト、キュウリ、タンポポ |

名前は歴史的なもので、重要なのは**連続した暗期**。

## 夜の長さのルール（すべてを決める実験）
:::fig photoperiod

- 限界暗期 10 時間の短日植物：暗期 16 時間 → 開花。8 時間 → 開花しない。
- 長い夜の途中で**短い赤色光**を当てる → 植物は短い夜2回と数える → 短日植物は開花**しない**、長日植物は開花**する**（光中断）。
- **昼**の途中を暗くしても → 効果なし。
- 赤色光の効果は続けて**遠赤色光**を当てると取り消される（フィトクロム：Pr ⇌ Pfr。赤色光が Pfr をつくり、タイマーを「リセット」する）。
だから：キクの葉を覆えば早く咲かせられる。夜に畑を照らせば開花を遅らせられる（商業的に利用）。

## 信号の出どころ
- 日長を感じるのは**葉**（葉を全部取った植物は反応しない）。
- 信号**フロリゲン**（現在は FT タンパク質とわかっている）が師管を通って茎頂へ → 花芽。日長処理した短日植物を未処理の個体に接ぎ木すると両方が咲く。
- 適切な日長を与えた葉が1枚あれば十分。

## 春化
一部の植物（秋まきコムギ、一部の二年草）は開花の前に一定期間の**低温**を経験する必要がある。種子や幼植物への低温処理が春化。ジベレリンで代用できることもある。

## その他の光周性
塊茎形成（ジャガイモ：短日）、秋の芽の休眠、動物の繁殖期や鳥の渡りも日長で決まる（動物ではメラトニン経由）。`,
    },
    exam: {
      en: ['Light/dark schedules drawn as bars with a night-break flash: which schedule makes a short-day (or long-day) plant flower (most years).', 'Which part perceives day length (leaf) and what carries the signal (florigen); grafting/leaf-covering experiments.', 'Classify plants as short-day / long-day / neutral; effect of red vs far-red flashes.'],
      ja: ['明暗の棒グラフに夜の光中断を入れた図：短日（または長日）植物が開花するのはどの条件か（ほぼ毎年）。', '日長を感じる部位（葉）と信号を運ぶもの（フロリゲン）。接ぎ木や葉を覆う実験。', '植物を短日・長日・中性に分類。赤色光と遠赤色光の効果。'],
    },
    traps: {
      en: ['Plants measure the **dark** period; a night break matters, a day break does not.', 'A short-day plant with a night-break flash behaves as if the night were short → **no** flowering.', 'Day-length perception is in the **leaf**, not the flower bud or the stem tip.'],
      ja: ['植物が測るのは**暗期**。夜の中断は効くが昼の中断は効かない。', '夜に光中断を受けた短日植物は短い夜と同じ → 開花**しない**。', '日長を感じるのは花芽や茎頂でなく**葉**。'],
    },
    followups: {
      en: ['Why does a brief flash at night stop a short-day plant from flowering?', 'Explain the phytochrome Pr/Pfr switch simply.', 'Design an experiment to show that the leaf senses the photoperiod.', 'How do growers make chrysanthemums flower for a specific date?'],
      ja: ['夜の短い光で短日植物が咲かなくなるのはなぜ？', 'フィトクロムの Pr/Pfr の切りかえをやさしく説明して。', '葉が光周期を感じることを示す実験を設計して。', '生産者はどうやって決まった日にキクを咲かせる？'],
    },
  },
  {
    id: 'animal-behavior',
    core: {
      en: 'Behaviour is either built in (innate: reflexes, taxes, fixed action patterns released by simple sign stimuli) or changed by experience (learned: habituation, conditioning, imprinting, insight). Innate behaviour is reliable from birth but rigid; learning adapts to the individual\'s world. Many exam questions are just "which category is this example?".',
      ja: '行動は生まれつき備わっているもの（生得的行動：反射、走性、単純な信号刺激で解発される固定的動作パターン）か、経験で変わるもの（学習：慣れ、条件づけ、刷込み、洞察）のどちらか。生得的行動は生まれたときから確実だが柔軟性がなく、学習は個体の環境に適応する。試験の多くは「この例はどの分類か」を問う。',
    },
    body: {
      en: r`## Innate (inborn) behaviour
Present without learning, same in all members of the species, triggered by a specific stimulus.
| kind | description | example |
|---|---|---|
| reflex | fixed fast response via a reflex arc | knee jerk, pupil |
| **taxis** (走性) | movement **toward (+) or away (−)** from a stimulus | moths to light (+ phototaxis), planaria away from light, fish facing a current (rheotaxis), earthworm − phototaxis, + chemotaxis |
| kinesis | change of speed/turning with no direction | woodlice move faster in dry air |
| **fixed action pattern** | stereotyped sequence **released** by a **sign stimulus** (key stimulus), runs to completion | stickleback male attacks anything with a **red belly**; greylag goose rolls an egg back; herring-gull chick pecks the red spot |
| **pheromones** | chemical signals between members of a species | silkmoth sex pheromone (bombykol), ant trail pheromone, alarm pheromone |
| **honeybee dance** | round dance (near), **waggle dance** (angle to the vertical = angle from the sun; speed/duration = distance) | von Frisch |

Supernormal stimulus: an exaggerated sign stimulus (a bigger, redder egg) releases a stronger response.

## Learned behaviour
| kind | description | example |
|---|---|---|
| **habituation** | response fades to a repeated harmless stimulus | sea slug (Aplysia) gill withdrawal weakens; birds ignore a scarecrow |
| sensitisation | response grows after a strong stimulus | Aplysia after a shock |
| **imprinting** | learned in a **critical period** early in life, irreversible | goslings follow the first moving object (Lorenz); salmon return to natal stream by smell |
| **classical conditioning** | neutral stimulus paired with a reflex stimulus → elicits the response | Pavlov's dog: bell → saliva |
| **operant conditioning** (trial and error) | behaviour reinforced by reward/punishment | rat presses a lever for food (Skinner) |
| insight learning | solving a new problem by understanding | chimpanzee stacks boxes for a banana |

## Neural basis (brief)
Habituation in Aplysia: fewer vesicles released at the sensory–motor synapse; sensitisation: more (via serotonin from an interneuron). Long-term memory involves new protein synthesis and synaptic growth.

## Classifying an example (the exam skill)
Ask: (1) Is it present from birth and the same in every individual? → innate. (2) Is there a direction relative to a stimulus? → taxis. (3) Is there a trigger and a stereotyped sequence? → fixed action pattern. (4) Did it change with experience? → learning; then which kind (fading = habituation; pairing = classical; reward = operant; early critical period = imprinting).`,
      ja: r`## 生得的行動
学習なしに備わり、種のすべての個体で同じで、特定の刺激で起こる。
| 種類 | 説明 | 例 |
|---|---|---|
| 反射 | 反射弓による固定された速い反応 | 膝蓋腱反射、瞳孔 |
| **走性** | 刺激に**向かう（正）か離れる（負）**移動 | ガが光へ（正の光走性）、プラナリアは光から離れる、魚は流れに向く（流れ走性）、ミミズは負の光走性・正の化学走性 |
| 無定位運動 | 方向のない速さ・向きの変化 | ワラジムシは乾いた空気で速く動く |
| **固定的動作パターン** | **信号刺激**（かぎ刺激）で**解発**され最後まで進む定型的な一連の動作 | イトヨの雄は**赤い腹**のものなら何でも攻撃、ハイイロガンは卵を転がして戻す、セグロカモメのひなは赤い斑点をつつく |
| **フェロモン** | 同種の個体間の化学信号 | カイコガの性フェロモン（ボンビコール）、アリの道しるべフェロモン、警報フェロモン |
| **ミツバチのダンス** | 円形ダンス（近い）、**8の字ダンス**（鉛直との角 = 太陽との角。速さ・時間 = 距離） | フリッシュ |

超正常刺激：誇張した信号刺激（より大きく赤い卵）はより強い反応を解発する。

## 学習による行動
| 種類 | 説明 | 例 |
|---|---|---|
| **慣れ** | 繰り返される無害な刺激への反応が薄れる | アメフラシのえら引っ込め反射が弱まる。鳥がかかしを無視 |
| 鋭敏化 | 強い刺激の後に反応が強まる | 電気ショック後のアメフラシ |
| **刷込み** | 生後早期の**臨界期**に学習、不可逆 | ガンのひなが最初に見た動くものについていく（ローレンツ）。サケはにおいで生まれた川に戻る |
| **古典的条件づけ** | 中性の刺激を反射の刺激と組み合わせる → 反応を引き起こす | パブロフのイヌ：ベル → だ液 |
| **オペラント条件づけ**（試行錯誤） | 報酬・罰で行動が強化される | ネズミがレバーを押して餌を得る（スキナー） |
| 洞察学習 | 理解によって新しい問題を解く | チンパンジーが箱を積んでバナナを取る |

## 神経の基礎（簡単に）
アメフラシの慣れ：感覚–運動シナプスで放出される小胞が減る。鋭敏化：介在ニューロンからのセロトニンで増える。長期記憶は新しいタンパク質合成とシナプスの成長を伴う。

## 例の分類（試験で必要な技能）
問う：(1) 生まれつきで全個体に同じか？ → 生得的。(2) 刺激に対する方向があるか？ → 走性。(3) 引き金と定型的な一連の動作があるか？ → 固定的動作パターン。(4) 経験で変わったか？ → 学習。それならどの種類か（薄れる = 慣れ。組み合わせ = 古典的。報酬 = オペラント。早期の臨界期 = 刷込み）。`,
    },
    exam: {
      en: ['Classify examples as innate (taxis, fixed action pattern) vs learned (habituation, imprinting, conditioning) (most years).', 'Stickleback red-belly / gull red-spot: what is the sign stimulus; supernormal stimulus.', 'Honeybee waggle dance: read direction and distance; pheromone examples.'],
      ja: ['例を生得的（走性、固定的動作パターン）と学習（慣れ、刷込み、条件づけ）に分類（ほぼ毎年）。', 'イトヨの赤い腹・カモメの赤い斑点：信号刺激は何か。超正常刺激。', 'ミツバチの8の字ダンス：方向と距離を読む。フェロモンの例。'],
    },
    traps: {
      en: ['Habituation is **learning** (it changes with experience), even though it looks like "doing less".', 'Imprinting happens only in a **critical period** and does not fade — unlike conditioning, which can be extinguished.', 'A taxis has a direction; a kinesis does not.'],
      ja: ['慣れは「反応が減る」だけに見えるが**学習**（経験で変わる）。', '刷込みは**臨界期**にだけ起こり消えない — 消去できる条件づけとは違う。', '走性には方向があり、無定位運動にはない。'],
    },
    followups: {
      en: ['Give me ten examples and let me classify them.', 'Explain the stickleback experiment and what a sign stimulus is.', 'How does the waggle dance encode direction?', 'What happens at the synapse during habituation in Aplysia?'],
      ja: ['例を10個出して分類させて。', 'イトヨの実験と信号刺激とは何かを説明して。', '8の字ダンスはどうやって方向を伝える？', 'アメフラシの慣れではシナプスで何が起こる？'],
    },
  },
  // ───────────────────────────── ECOLOGY ─────────────────────────────
  {
    id: 'populations',
    core: {
      en: 'A population grows fast when resources are plentiful and levels off at the carrying capacity as crowding raises death and lowers birth (density effect). Survivorship curves show when in life most individuals die. Two species needing the same resources cannot coexist for long (competitive exclusion) unless they divide the niche; other pairs are predator–prey, parasite–host, or mutualists.',
      ja: '個体群は資源が豊富だと速く増え、混みあうと死亡が増え出生が減って（密度効果）環境収容力で頭打ちになる。生存曲線は一生のうちいつ多く死ぬかを示す。同じ資源を必要とする2種は、ニッチを分けないかぎり長く共存できない（競争的排除）。他の組み合わせは捕食–被食、寄生–宿主、相利共生。',
    },
    body: {
      en: r`## Population growth
- No limits: exponential (J-curve). Real populations: **logistic (S-curve)** — growth slows as density rises and stops at the **carrying capacity K**.
- **Density effect**: crowding lowers birth rate, body size (locust phase change: solitary → gregarious with long wings), and raises mortality; regulates the population.
- Population density = number ÷ area; measured by quadrat sampling (plants) or **mark–recapture**: $N = \dfrac{M \times C}{R}$ ($M$ marked, $C$ caught later, $R$ recaptured marked).
- Distribution: random, uniform (territorial), clumped (social, patchy resources).

## Survivorship curves
:::fig survivorship

| type | shape (log scale) | mortality | examples |
|---|---|---|---|
| **I (late loss)** | flat then drops | most die old; **few offspring, much parental care** | humans, large mammals |
| **II (constant)** | straight diagonal | equal risk at every age | birds, small mammals, lizards |
| **III (early loss)** | drops steeply then flat | **huge early mortality**; many offspring, no care | fish, oysters, insects, plants |

Life table: number surviving at each age from 1000 born; the curve is that column plotted.

## Age structure
Pyramid (young-heavy, growing), bell (stable), urn (declining). Read from the width of the young classes.

## Interactions between species
| interaction | effect | example |
|---|---|---|
| **competition** | − / − | two Paramecium species for the same food |
| **predation** | + / − | lynx–hare cycles (prey peaks first, predator lags) |
| parasitism | + / − | tapeworm–human; parasite does not usually kill |
| **mutualism** (symbiosis) | + / + | legume–Rhizobium, clownfish–anemone, lichen (fungus + alga), mycorrhiza |
| commensalism | + / 0 | remora on shark |

## Competitive exclusion and niche (Gause)
**Paramecium aurelia** and **P. caudatum** grown together: both grow alone; together *P. aurelia* wins and *P. caudatum* dies out — **competitive exclusion** when niches overlap completely. *P. caudatum* + *P. bursaria*: coexist because *P. bursaria* uses the bottom (different niche). Species that coexist in nature show **niche partitioning** (different food size, feeding height, activity time — character displacement).
**Niche** = the role and resources a species uses (food, space, time). Fundamental vs realised niche.

## Social behaviour within a species
Territory (reduces fights, ensures resources), dominance hierarchy (pecking order), social insects (castes; altruism explained by kin selection), colonies, schools.`,
      ja: r`## 個体群の成長
- 制限なし：指数関数的（J 字）。実際の個体群：**ロジスティック（S 字）**— 密度が上がると成長が鈍り、**環境収容力 K** で止まる。
- **密度効果**：混みあうと出生率や体の大きさが下がり（バッタの相変異：孤独相 → 群生相、長い翅）、死亡率が上がり、個体群を調節する。
- 個体群密度 = 個体数 ÷ 面積。区画法（植物）や**標識再捕法**で測る：$N = \dfrac{M \times C}{R}$（$M$ 標識数、$C$ 再捕獲数、$R$ 再捕獲中の標識個体数）。
- 分布：ランダム、一様（なわばり）、集中（社会性、資源の偏り）。

## 生存曲線
:::fig survivorship

| 型 | 形（対数目盛） | 死亡 | 例 |
|---|---|---|---|
| **晩死型（I 型）** | 平らで最後に落ちる | 多くが老齢で死ぬ。**子は少なく親の保護が厚い** | ヒト、大型哺乳類 |
| **平均型（II 型）** | 直線の斜め | どの年齢でも同じ危険 | 鳥類、小型哺乳類、トカゲ |
| **早死型（III 型）** | 急に落ちて平らに | **初期の死亡が非常に多い**。子は多く保護なし | 魚類、カキ、昆虫、植物 |

生命表：1000 個体生まれたうち各年齢での生存数。曲線はその列をプロットしたもの。

## 齢構成
ピラミッド型（若い個体が多い、成長）、釣鐘型（安定）、つぼ型（減少）。若い階級の幅で読む。

## 種間の関係
| 関係 | 効果 | 例 |
|---|---|---|
| **競争** | − / − | 同じ餌をめぐるゾウリムシ2種 |
| **捕食** | + / − | オオヤマネコ–カンジキウサギの周期（被食者が先にピーク、捕食者が遅れる） |
| 寄生 | + / − | サナダムシ–ヒト。寄生者はふつう宿主を殺さない |
| **相利共生** | + / + | マメ科–根粒菌、クマノミ–イソギンチャク、地衣類（菌類 ＋ 藻類）、菌根 |
| 片利共生 | + / 0 | サメにつくコバンザメ |

## 競争的排除とニッチ（ガウゼ）
**ゾウリムシ（P. caudatum）**と**ヒメゾウリムシ（P. aurelia）**を一緒に培養：単独ではどちらも増える。一緒だとヒメゾウリムシが勝ちゾウリムシは絶滅 — ニッチが完全に重なると**競争的排除**。ゾウリムシ ＋ ミドリゾウリムシ（P. bursaria）：ミドリゾウリムシが底を使う（別のニッチ）ので共存。自然界で共存する種は**ニッチの分割**を示す（餌の大きさ、採食する高さ、活動時間 — 形質置換）。
**ニッチ（生態的地位）** = 種が使う役割と資源（餌、空間、時間）。基本ニッチと実現ニッチ。

## 種内の社会行動
なわばり（争いを減らし資源を確保）、順位制（つつきの順位）、社会性昆虫（カースト。利他行動は血縁選択で説明）、群れ。`,
    },
    exam: {
      en: ['Survivorship curves: which type/organism shows high early mortality; match curves to fish, birds, humans (most years).', 'Paramecium single vs mixed culture graphs: which pair coexists and why (niche); competitive exclusion.', 'Mark–recapture estimate; density effect on locusts; predator–prey lag.'],
      ja: ['生存曲線：初期死亡率が高いのはどの型・生物か。魚類・鳥類・ヒトと曲線の対応（ほぼ毎年）。', 'ゾウリムシの単独培養と混合培養のグラフ：共存する組はどれで、なぜか（ニッチ）。競争的排除。', '標識再捕法の推定。バッタの密度効果。捕食者–被食者の時間差。'],
    },
    traps: {
      en: ['Type III (early loss) is the one with many offspring and no care — the steep drop is at the **start**.', 'Two species coexist only if their niches **differ**; identical niches → one is excluded, not "both decline equally".', 'In predator–prey cycles the **prey** peak comes first.'],
      ja: ['早死型（III 型）が子の多い・保護のない型 — 急な落ち込みは**最初**。', '2種が共存できるのはニッチが**異なる**ときだけ。同じニッチ → 一方が排除される。「両方同じように減る」ではない。', '捕食者–被食者の周期では**被食者**のピークが先。'],
    },
    followups: {
      en: ['Why does a population follow an S-curve instead of a J-curve?', 'Explain the three Paramecium experiments and what each shows.', 'Do a mark–recapture calculation with numbers.', 'Why do humans have a type I curve and oysters type III?'],
      ja: ['個体群が J 字でなく S 字になるのはなぜ？', 'ゾウリムシの3つの実験とそれぞれが示すことを説明して。', '標識再捕法の計算を数値でやって。', 'ヒトが晩死型でカキが早死型なのはなぜ？'],
    },
  },
  {
    id: 'ecosystem-energy',
    core: {
      en: 'Energy enters an ecosystem as sunlight captured by producers and leaves as heat at every step, so it flows one way and shrinks by roughly 90% per trophic level; matter (carbon, nitrogen) cycles round and round. The bookkeeping is simple: gross production = net production + respiration, and what a level does not eat, respire or lose becomes its growth.',
      ja: 'エネルギーは生産者が捕えた太陽光として生態系に入り、各段階で熱として出ていくので、一方向に流れて栄養段階ごとに約 90% 減る。物質（炭素、窒素）は循環する。収支は単純：総生産量 = 純生産量 ＋ 呼吸量。ある段階が食べられず呼吸もせず失いもしなかった分が成長量になる。',
    },
    body: {
      en: r`## Structure of an ecosystem
Biotic: **producers** (plants, algae, cyanobacteria — photosynthesis), **consumers** (primary = herbivores, secondary = carnivores, tertiary…), **decomposers** (bacteria, fungi — return inorganic nutrients). Abiotic: light, temperature, water, soil, CO₂. Food chain → food web; **trophic level** = position in the chain.

## Energy flow (one way)
:::fig energy-flow

Sunlight → chemical energy (photosynthesis) → passed along by eating → released as **heat** by respiration at every level → leaves the ecosystem. Energy is **never recycled**. Roughly 10% passes to the next level (**energy efficiency** = energy taken in by level n+1 ÷ by level n), so chains are short (4–5 levels) and pyramids of energy are always upright.

## Production bookkeeping (the EJU table)
For producers:
$$\text{gross primary production (GPP)} = \text{net primary production (NPP)} + \text{respiration (R)}$$
$$\text{NPP} = \text{growth} + \text{eaten by consumers} + \text{dead matter (litter)}$$
For consumers:
$$\text{intake} = \text{assimilated} + \text{faeces (unassimilated)}$$
$$\text{assimilated} = \text{growth} + \text{respiration} + \text{eaten by the next level} + \text{dead}$$
Given a table with some numbers missing, fill them with these equations; growth is usually the unknown. Efficiency to the next level = (eaten by next level) ÷ (that level's assimilation or GPP).

## Ecological pyramids
Numbers, biomass, energy. Biomass pyramids can be inverted in the sea (phytoplankton reproduce fast, small standing crop); energy pyramids never are.

## Carbon cycle
CO₂ in air/water → photosynthesis → organic C → respiration of all organisms and decomposers → CO₂; combustion of fossil fuels adds CO₂ (greenhouse effect, global warming); oceans and limestone store carbon. (Nitrogen cycle: see Nitrogen metabolism.)

## Succession
Bare rock → lichens/mosses (pioneers) → grasses → shrubs → **pioneer trees** (sun plants: pine, birch) → **climax forest** (shade-tolerant: beech, oak, evergreen broadleaf in Japan). Primary (from nothing) vs secondary (after fire/abandoned field, faster — soil and seeds exist). Sun-plant seedlings cannot grow in the shade of the climax forest, shade plants can → the climax is stable. Gap dynamics.

## Biomes (Japan)
Rainfall and temperature decide vegetation: tropical rainforest → evergreen broadleaf (照葉樹林, southern Japan) → deciduous broadleaf (夏緑樹林, Tohoku) → coniferous (Hokkaido) → tundra; deserts and grasslands where rain is scarce. Vertical zonation on mountains mirrors latitude.

## Human impact
Biological concentration (DDT, mercury accumulate up the chain), eutrophication (red tides), acid rain, ozone hole, deforestation, invasive species, loss of biodiversity; conservation (Ramsar, Red List).`,
      ja: r`## 生態系の構造
生物的要因：**生産者**（植物、藻類、シアノバクテリア — 光合成）、**消費者**（一次 = 草食、二次 = 肉食、三次…）、**分解者**（細菌、菌類 — 無機物に戻す）。非生物的要因：光、温度、水、土壌、CO₂。食物連鎖 → 食物網。**栄養段階** = 連鎖の中の位置。

## エネルギーの流れ（一方向）
:::fig energy-flow

太陽光 → 化学エネルギー（光合成）→ 食べることで伝わる → 各段階で呼吸により**熱**として放出 → 生態系から出る。エネルギーは**循環しない**。次の段階に渡るのは約 10%（**エネルギー効率** = 段階 n+1 の摂取量 ÷ 段階 n の摂取量）なので連鎖は短く（4〜5段階）、エネルギーのピラミッドは必ず正立。

## 生産量の収支（EJUの表）
生産者：
$$\text{総生産量} = \text{純生産量} + \text{呼吸量}$$
$$\text{純生産量} = \text{成長量} + \text{被食量} + \text{枯死量}$$
消費者：
$$\text{摂食量} = \text{同化量} + \text{不消化排出量}$$
$$\text{同化量} = \text{成長量} + \text{呼吸量} + \text{被食量} + \text{死滅量}$$
一部の数値が欠けた表が与えられたら、これらの式で埋める。未知数はふつう成長量。次の段階への効率 = （被食量）÷（その段階の同化量または総生産量）。

## 生態ピラミッド
個体数、生物量、エネルギー。海では生物量ピラミッドが逆転することがある（植物プランクトンは速く増え現存量が小さい）。エネルギーのピラミッドは逆転しない。

## 炭素循環
大気・水中の CO₂ → 光合成 → 有機炭素 → すべての生物と分解者の呼吸 → CO₂。化石燃料の燃焼が CO₂ を加える（温室効果、地球温暖化）。海洋と石灰岩が炭素を貯蔵。（窒素循環：窒素同化・窒素固定のトピック参照。）

## 遷移
裸地 → 地衣類・コケ（先駆種）→ 草本 → 低木 → **陽樹**（アカマツ、シラカンバ）→ **極相林**（陰樹：ブナ、カシ、日本南部では照葉樹）。一次遷移（何もない所から）と二次遷移（山火事や放棄された畑の後、速い — 土壌と種子がある）。陽樹の芽生えは極相林の陰では育たず、陰樹は育つ → 極相は安定。ギャップ更新。

## バイオーム（日本）
降水量と気温が植生を決める：熱帯多雨林 → 照葉樹林（日本南部）→ 夏緑樹林（東北）→ 針葉樹林（北海道）→ ツンドラ。雨が少ないと砂漠や草原。山の垂直分布は緯度の分布と対応。

## 人間の影響
生物濃縮（DDT、水銀が連鎖の上位に蓄積）、富栄養化（赤潮）、酸性雨、オゾンホール、森林伐採、外来種、生物多様性の減少。保全（ラムサール条約、レッドリスト）。`,
    },
    exam: {
      en: ['Trophic-level energy table: compute net primary production or a missing growth value; energy efficiency between levels (most years).', 'Fill blanks: gross production, respiration, net production; light → chemical → heat in the energy-flow scheme.', 'Succession order and why the climax is stable; biological concentration.'],
      ja: ['栄養段階のエネルギーの表：純生産量や欠けている成長量を計算。段階間のエネルギー効率（ほぼ毎年）。', '空欄：総生産量、呼吸量、純生産量。エネルギーの流れの図での光 → 化学 → 熱。', '遷移の順序と極相が安定な理由。生物濃縮。'],
    },
    traps: {
      en: ['Energy is **not** recycled; only matter is. Decomposers release heat too.', 'Net production is what is **left after respiration** — do not subtract "eaten" from gross production directly.', 'Sun trees start the forest but shade trees finish it; the climax is the **shade-tolerant** forest.'],
      ja: ['エネルギーは循環**しない**。循環するのは物質だけ。分解者も熱を出す。', '純生産量は**呼吸の後に残る**量 — 総生産量から直接「被食量」を引かない。', '陽樹が森を始め陰樹が完成させる。極相は**陰樹**の森。'],
    },
    followups: {
      en: ['Walk me through filling an energy-budget table with numbers.', 'Why can biomass pyramids be inverted in the ocean but energy pyramids never are?', 'Why does succession end with shade-tolerant trees?', 'Explain biological concentration with DDT.'],
      ja: ['エネルギー収支の表を数値で埋める手順を見せて。', '海で生物量ピラミッドが逆転してもエネルギーピラミッドは逆転しないのはなぜ？', '遷移が陰樹で終わるのはなぜ？', 'DDT で生物濃縮を説明して。'],
    },
  },
  // ───────────────────────────── EVOLUTION ─────────────────────────────
  {
    id: 'evolution-mechanisms',
    core: {
      en: 'Evolution is change in allele frequencies in a population. Mutation supplies new alleles; natural selection keeps the ones that help survival and reproduction; genetic drift changes frequencies by chance, especially in small populations; isolation lets populations diverge into species. Hardy–Weinberg tells you what frequencies look like when none of this is happening.',
      ja: '進化とは集団の対立遺伝子頻度の変化。突然変異が新しい対立遺伝子を供給し、自然選択が生存と繁殖に役立つものを残し、遺伝的浮動が特に小さな集団で偶然に頻度を変え、隔離が集団を別々の種へ分岐させる。ハーディ・ワインベルグの法則は、これらが何も起きていないときの頻度の姿を教える。',
    },
    body: {
      en: r`## The four forces
| force | what it does | key point |
|---|---|---|
| **mutation** | creates new alleles | random, rare, the only source of new variation |
| **natural selection** | individuals with favourable traits leave more offspring → allele frequency shifts | acts on **phenotype**; needs variation; Darwin (with Wallace) |
| **genetic drift** | frequencies change by **chance** | strong in **small** populations; bottleneck and founder effects; can fix neutral alleles |
| **gene flow / isolation** | migration mixes populations; isolation lets them diverge | geographic isolation → reproductive isolation → new species |

Examples of selection: peppered moth (industrial melanism), antibiotic resistance, sickle-cell heterozygote advantage in malaria regions, Darwin's finches (beak size after drought). Sexual selection (peacock tail). Neutral theory (Kimura): most molecular changes are neutral and fixed by drift → molecular clock.

## Speciation
Population split (river, island) → different mutations, selection, drift → **reproductive isolation** (cannot interbreed: mating time, behaviour, hybrid sterility) → separate species. Adaptive radiation (finches, Hawaiian honeycreepers). Convergent evolution: similar shapes from different ancestors (shark/dolphin); analogous vs homologous organs (bat wing / human arm — same bones); vestigial organs.

## Hardy–Weinberg
In a large, random-mating population with no mutation, selection or migration, allele frequencies **do not change**: with $p + q = 1$,
$$p^2 + 2pq + q^2 = 1 \quad(AA : Aa : aa)$$
Use: if 16% of a population shows the recessive trait, $q^2 = 0.16$, $q = 0.4$, $p = 0.6$, carriers $2pq = 0.48$. A deviation from these ratios means one of the assumptions is broken (evolution is happening).

## Origin of life (chemical evolution, ~4 billion years ago)
Inorganic molecules (CH₄, NH₃, H₂, H₂O in Miller's experiment; or hydrothermal vents) → amino acids and nucleotides → polymers → self-replicating RNA (RNA world) → membranes → first cells (prokaryotes, anaerobic, heterotrophic) → photosynthetic cyanobacteria (**O₂ rises**, ~2.7–2.4 Gya) → aerobic respiration → **eukaryotes by endosymbiosis** (~2 Gya) → multicellular life (~1 Gya) → Cambrian explosion (540 Mya).

## Timeline to know
| event | when |
|---|---|
| Earth forms | 4.6 Gya |
| first life (prokaryotes) | ~3.8 Gya |
| cyanobacteria, O₂ | ~2.7 Gya |
| eukaryotes | ~2 Gya |
| Cambrian explosion (animals with hard parts) | 540 Mya |
| **plants and then vertebrates move onto land** | 470 / 370 Mya (Devonian) |
| reptiles, then dinosaurs and mammals appear | 300 / 230 Mya |
| **dinosaur extinction** | 66 Mya (asteroid) |
| **mammal radiation**, primates | after 66 Mya |
| humans (*Homo sapiens*) | ~300,000 years ago |`,
      ja: r`## 4つの要因
| 要因 | はたらき | ポイント |
|---|---|---|
| **突然変異** | 新しい対立遺伝子をつくる | ランダム、まれ、新しい変異の唯一の源 |
| **自然選択** | 有利な形質の個体がより多くの子を残す → 対立遺伝子頻度が変わる | **表現型**にはたらく。変異が必要。ダーウィン（とウォレス） |
| **遺伝的浮動** | 頻度が**偶然**で変わる | **小さな**集団で強い。びん首効果と創始者効果。中立な対立遺伝子を固定できる |
| **遺伝子流動／隔離** | 移住が集団を混ぜる。隔離で分岐できる | 地理的隔離 → 生殖的隔離 → 新種 |

選択の例：オオシモフリエダシャク（工業暗化）、抗生物質耐性、マラリア地域での鎌状赤血球のヘテロ接合の有利、ダーウィンフィンチ（干ばつ後のくちばしの大きさ）。性選択（クジャクの尾）。中立説（木村）：分子レベルの変化の多くは中立で浮動により固定 → 分子時計。

## 種分化
集団が分かれる（川、島）→ 異なる突然変異、選択、浮動 → **生殖的隔離**（交配できない：交配時期、行動、雑種の不妊）→ 別の種。適応放散（フィンチ、ハワイミツスイ）。収れん進化：異なる祖先から似た形（サメ／イルカ）。相似器官と相同器官（コウモリの翼／ヒトの腕 — 同じ骨）。痕跡器官。

## ハーディ・ワインベルグの法則
大きく、任意交配で、突然変異・選択・移住のない集団では対立遺伝子頻度は**変わらない**：$p + q = 1$ として
$$p^2 + 2pq + q^2 = 1 \quad(AA : Aa : aa)$$
使い方：集団の 16% が潜性形質なら $q^2 = 0.16$、$q = 0.4$、$p = 0.6$、保因者 $2pq = 0.48$。この比からのずれは仮定のどれかが破れている（進化が起きている）ことを意味する。

## 生命の起源（化学進化、約 40 億年前）
無機物（ミラーの実験の CH₄、NH₃、H₂、H₂O。または熱水噴出孔）→ アミノ酸とヌクレオチド → 高分子 → 自己複製する RNA（RNA ワールド）→ 膜 → 最初の細胞（原核生物、嫌気性、従属栄養）→ 光合成するシアノバクテリア（**O₂ が増える**、約 27〜24 億年前）→ 好気呼吸 → **細胞内共生による真核生物**（約 20 億年前）→ 多細胞生物（約 10 億年前）→ カンブリア爆発（5.4 億年前）。

## 覚える年表
| 出来事 | 時期 |
|---|---|
| 地球の誕生 | 46 億年前 |
| 最初の生命（原核生物） | 約 38 億年前 |
| シアノバクテリア、O₂ | 約 27 億年前 |
| 真核生物 | 約 20 億年前 |
| カンブリア爆発（硬い組織をもつ動物） | 5.4 億年前 |
| **植物、次いで脊椎動物の上陸** | 4.7 億／3.7 億年前（デボン紀） |
| は虫類、次いで恐竜と哺乳類の出現 | 3 億／2.3 億年前 |
| **恐竜の絶滅** | 6600 万年前（隕石） |
| **哺乳類の放散**、霊長類 | 6600 万年前以降 |
| ヒト（ホモ・サピエンス） | 約 30 万年前 |`,
    },
    exam: {
      en: ['Fill blanks distinguishing mutation, natural selection and genetic drift; which is strongest in small populations (most years).', 'Order the steps of chemical evolution, or major events in the history of life (land plants → land vertebrates → dinosaur extinction → mammal radiation).', 'Hardy–Weinberg: allele and carrier frequencies from the recessive phenotype frequency.'],
      ja: ['突然変異・自然選択・遺伝的浮動を区別する空欄。小さな集団で最も強いのはどれか（ほぼ毎年）。', '化学進化の順序、または生命史の主な出来事の順（植物の上陸 → 脊椎動物の上陸 → 恐竜の絶滅 → 哺乳類の放散）。', 'ハーディ・ワインベルグ：潜性表現型の頻度から対立遺伝子頻度と保因者の頻度。'],
    },
    traps: {
      en: ['Selection does not create variation; mutation does. Selection only changes which existing alleles spread.', 'Genetic drift is **random** — it can remove a beneficial allele in a small population.', 'Plants colonised land **before** vertebrates; dinosaurs and early mammals appeared at about the same time (Triassic).'],
      ja: ['選択は変異をつくらない。つくるのは突然変異。選択は既存の対立遺伝子のどれが広がるかを変えるだけ。', '遺伝的浮動は**ランダム** — 小さな集団では有利な対立遺伝子も失われうる。', '植物は脊椎動物より**先に**上陸。恐竜と初期の哺乳類はほぼ同時期（三畳紀）に出現。'],
    },
    followups: {
      en: ['Explain genetic drift with a small-population example.', 'Do a Hardy–Weinberg calculation from 1% affected individuals.', 'What was the Miller–Urey experiment and what did it show?', 'Why was the rise of oxygen a turning point in evolution?'],
      ja: ['小さな集団の例で遺伝的浮動を説明して。', '発症者 1% からハーディ・ワインベルグの計算をして。', 'ミラーの実験とは何で、何を示した？', '酸素の増加が進化の転換点だったのはなぜ？'],
    },
  },
  {
    id: 'phylogeny-classification',
    core: {
      en: 'Living things are grouped by shared ancestry: three domains (Bacteria, Archaea, Eukarya), and within eukaryotes protists, fungi, plants and animals. Plants show a clear ladder onto dry land — mosses (no vessels), ferns (vessels, spores), gymnosperms (seeds, naked), angiosperms (seeds in fruit, double fertilisation) — and animals split by body plan (germ layers, body cavity, protostome vs deuterostome, backbone). Phylogenetic trees are read by the most recent common ancestor.',
      ja: '生物は共通の祖先で分類する：3つのドメイン（細菌、古細菌、真核生物）、真核生物の中に原生生物・菌類・植物・動物。植物は陸への明確な段階を示す — コケ（維管束なし）、シダ（維管束、胞子）、裸子植物（種子、むき出し）、被子植物（果実に包まれた種子、重複受精）。動物は体制（胚葉、体腔、旧口と新口、脊椎）で分かれる。系統樹は最も近い共通祖先で読む。',
    },
    body: {
      en: r`## Levels and names
Domain → kingdom → phylum → class → order → family → genus → species. **Binomial nomenclature** (Linnaeus): *Homo sapiens* (genus + species, italic). Species = organisms that can interbreed and produce fertile offspring.

## Three domains (Woese, from rRNA)
| domain | cell | examples |
|---|---|---|
| Bacteria | prokaryote | E. coli, cyanobacteria, lactic bacteria |
| **Archaea** | prokaryote but closer to eukaryotes in genes | methanogens, extreme halophiles, thermophiles |
| Eukarya | nucleus | protists, fungi, plants, animals |
Five kingdoms (Whittaker): Monera, Protista, Fungi, Plantae, Animalia. Viruses are not cells (no metabolism; DNA or RNA in protein coat) and sit outside the tree.

## Plant phylogeny — the march onto land
:::fig plant-tree

| group | vascular tissue | reproduction | dominant generation | examples |
|---|---|---|---|---|
| algae (green algae are the ancestors) | no | spores/gametes in water | — | Chlamydomonas, Spirogyra, Ulva |
| **bryophytes** (mosses, liverworts) | **no** | spores; sperm swim in water | **gametophyte (n)** | moss, Marchantia |
| **pteridophytes** (ferns, horsetails) | **yes** | spores; sperm swim to egg on the prothallus | **sporophyte (2n)** | fern, horsetail |
| **gymnosperms** | yes | **seeds**, naked on cones; pollen (no water needed) | sporophyte | pine, ginkgo, cycad |
| **angiosperms** | yes | seeds inside **fruit**; flowers; **double fertilisation** | sporophyte | monocots (one cotyledon, parallel veins, scattered bundles) and dicots |

Key innovations in order: **cuticle and stomata → vascular bundles (xylem/phloem) → seeds → flowers/fruit**. Vascular bundle: xylem (dead vessels, water up), phloem (sieve tubes, sugar), cambium between them in dicots (secondary growth → annual rings).

## Animal phylogeny (body plans)
| feature | groups |
|---|---|
| no true tissues | sponges |
| radial symmetry, 2 germ layers | cnidarians (jellyfish, hydra, coral) |
| bilateral, 3 germ layers, no body cavity | flatworms (planaria) |
| **protostomes** (blastopore → mouth) | molluscs (snail, squid), annelids (earthworm), **arthropods** (insects, crabs — exoskeleton, moulting), nematodes |
| **deuterostomes** (blastopore → anus) | echinoderms (sea urchin, starfish), **chordates** (notochord; vertebrates: fish → amphibians → reptiles → birds and mammals) |

Vertebrate transition to land: lobe-finned fish → amphibians (Devonian; moist skin, aquatic larvae) → reptiles (amniotic egg, scales — fully terrestrial) → birds and mammals (endothermic). Homologous organs (forelimbs) show common descent; analogous organs (insect vs bird wing) do not.

## Reading a phylogenetic tree
Branch points = common ancestors; two taxa are closer if their shared node is more **recent**. Molecular phylogeny: count amino-acid/DNA differences (fewer = closer) and assume a roughly constant rate (molecular clock) to date splits. Cladistics uses shared derived characters.

## Human evolution (brief)
Primates → apes; hominins: *Australopithecus* (bipedal, small brain, 4 Mya) → *Homo habilis* (tools) → *Homo erectus* (fire, left Africa) → *Homo sapiens* (300 kya, Africa) and Neanderthals (extinct). Bipedalism came before the large brain.`,
      ja: r`## 階級と名前
ドメイン → 界 → 門 → 綱 → 目 → 科 → 属 → 種。**二名法**（リンネ）：*Homo sapiens*（属名 ＋ 種小名、イタリック）。種 = 交配して生殖能力のある子を残せる生物の集まり。

## 3つのドメイン（ウーズ、rRNA から）
| ドメイン | 細胞 | 例 |
|---|---|---|
| 細菌 | 原核生物 | 大腸菌、シアノバクテリア、乳酸菌 |
| **古細菌（アーキア）** | 原核生物だが遺伝子は真核生物に近い | メタン菌、高度好塩菌、好熱菌 |
| 真核生物 | 核をもつ | 原生生物、菌類、植物、動物 |
五界説（ホイッタカー）：モネラ界、原生生物界、菌界、植物界、動物界。ウイルスは細胞ではなく（代謝なし。タンパク質の殻に DNA か RNA）、系統樹の外。

## 植物の系統 — 陸への進出
:::fig plant-tree

| 群 | 維管束 | 生殖 | 主な世代 | 例 |
|---|---|---|---|---|
| 藻類（緑藻が祖先） | なし | 水中で胞子・配偶子 | — | クラミドモナス、アオミドロ、アオサ |
| **コケ植物** | **なし** | 胞子。精子は水中を泳ぐ | **配偶体（n）** | スギゴケ、ゼニゴケ |
| **シダ植物** | **あり** | 胞子。前葉体の上で精子が卵へ泳ぐ | **胞子体（2n）** | シダ、トクサ |
| **裸子植物** | あり | **種子**、球果にむき出し。花粉（水が不要） | 胞子体 | マツ、イチョウ、ソテツ |
| **被子植物** | あり | **果実**に包まれた種子。花。**重複受精** | 胞子体 | 単子葉類（子葉1枚、平行脈、散在する維管束）と双子葉類 |

順に現れた重要な新機軸：**クチクラと気孔 → 維管束（道管・師管）→ 種子 → 花・果実**。維管束：道管（死んだ細胞、水を上へ）、師管（師管細胞、糖）、双子葉類ではその間に形成層（二次成長 → 年輪）。

## 動物の系統（体制）
| 特徴 | 群 |
|---|---|
| 真の組織なし | 海綿動物 |
| 放射相称、2胚葉 | 刺胞動物（クラゲ、ヒドラ、サンゴ） |
| 左右相称、3胚葉、体腔なし | 扁形動物（プラナリア） |
| **旧口動物**（原口 → 口） | 軟体動物（カタツムリ、イカ）、環形動物（ミミズ）、**節足動物**（昆虫、カニ — 外骨格、脱皮）、線形動物 |
| **新口動物**（原口 → 肛門） | 棘皮動物（ウニ、ヒトデ）、**脊索動物**（脊索。脊椎動物：魚類 → 両生類 → は虫類 → 鳥類と哺乳類） |

脊椎動物の上陸：肉鰭類の魚 → 両生類（デボン紀。湿った皮膚、水生の幼生）→ は虫類（羊膜卵、うろこ — 完全に陸生）→ 鳥類と哺乳類（恒温）。相同器官（前肢）は共通の祖先を示す。相似器官（昆虫の翅と鳥の翼）は示さない。

## 系統樹の読み方
分岐点 = 共通祖先。2つの分類群は共有する分岐点が**新しい**ほど近縁。分子系統：アミノ酸・DNA の違いの数を数え（少ないほど近い）、速度がほぼ一定（分子時計）と仮定して分岐の時期を推定。分岐分類は共有派生形質を使う。

## 人類の進化（簡単に）
霊長類 → 類人猿。人類：アウストラロピテクス（直立二足歩行、小さな脳、400 万年前）→ ホモ・ハビリス（道具）→ ホモ・エレクトス（火、アフリカを出る）→ ホモ・サピエンス（30 万年前、アフリカ）とネアンデルタール人（絶滅）。直立二足歩行が大きな脳より先。`,
    },
    exam: {
      en: ['Plant groups: which have vascular bundles / seeds / a dominant gametophyte; order of appearance on land (most years).', 'Order of major events: land plants, land vertebrates, dinosaur extinction, mammal radiation; which came first.', 'Read a phylogenetic tree or a table of amino-acid differences: which pair is most closely related.'],
      ja: ['植物の群：維管束・種子・配偶体が主な世代なのはどれか。上陸の順（ほぼ毎年）。', '主な出来事の順：植物の上陸、脊椎動物の上陸、恐竜の絶滅、哺乳類の放散。どれが先か。', '系統樹やアミノ酸の違いの表を読む：最も近縁な組はどれか。'],
    },
    traps: {
      en: ['Mosses have **no** vascular tissue and their main body is **haploid**; ferns have vessels and a diploid main body.', 'Gymnosperms have seeds but no fruit and no double fertilisation.', 'Archaea are prokaryotes but are **closer to eukaryotes** than to bacteria.'],
      ja: ['コケには維管束が**なく**本体は**単相**。シダには維管束があり本体は複相。', '裸子植物は種子はあるが果実も重複受精もない。', '古細菌は原核生物だが細菌より**真核生物に近い**。'],
    },
    followups: {
      en: ['Why did seeds and pollen let plants conquer dry land?', 'Compare the moss and fern life cycles in a table.', 'How do I read which species are closest on a phylogenetic tree?', 'What separates protostomes from deuterostomes?'],
      ja: ['種子と花粉が植物の陸への進出を可能にしたのはなぜ？', 'コケとシダの生活環を表で比較して。', '系統樹で最も近縁な種をどう読む？', '旧口動物と新口動物の違いは？'],
    },
  },
];

const notes: SubjectNotes = {
  subject: 'biology',
  tree: TREES.biology,
  notes: Object.fromEntries(N.map((n) => [n.id, n])),
};
export default notes;
