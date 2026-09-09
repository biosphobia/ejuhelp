// Compounds the EJU chemistry paper expects you to know cold: what they are,
// how they are made, what they do, and the exam trap for each.
export interface CompoundEntry {
  formula: string;
  name: { en: string; ja: string };
  /** Appearance / state at room temperature. */
  look: { en: string; ja: string };
  facts: { en: string[]; ja: string[] };
}
export interface CompoundSection {
  id: string;
  title: { en: string; ja: string };
  entries: CompoundEntry[];
}

export const COMPOUND_SECTIONS: CompoundSection[] = [
  {
    id: 'acids',
    title: { en: 'Acids', ja: '酸' },
    entries: [
      {
        formula: 'HCl',
        name: { en: 'Hydrochloric acid / hydrogen chloride', ja: '塩酸・塩化水素' },
        look: { en: 'colourless gas; fumes in moist air', ja: '無色・刺激臭の気体、湿った空気で白煙' },
        facts: {
          en: ['Strong monoprotic acid. Made in the lab from NaCl + conc. H₂SO₄ (heat).', 'HCl gas + NH₃ gas → white smoke of NH₄Cl (test for either gas).', 'Dissolves most metals except Cu, Ag, Au (no oxidising power).'],
          ja: ['強酸・1価。実験室では NaCl ＋ 濃硫酸（加熱）で発生。', 'HCl ＋ NH₃ → NH₄Cl の白煙（どちらの気体の検出にも）。', 'Cu・Ag・Au は溶かせない（酸化力がない）。'],
        },
      },
      {
        formula: 'H₂SO₄',
        name: { en: 'Sulfuric acid', ja: '硫酸' },
        look: { en: 'colourless, oily, dense liquid', ja: '無色・粘性のある重い液体' },
        facts: {
          en: ['Contact process: S → SO₂ → SO₃ (V₂O₅ catalyst) → absorbed in conc. H₂SO₄ → oleum → diluted.', 'Concentrated: dehydrating (chars sugar), hygroscopic, oxidising when hot (Cu + hot conc. → SO₂). Dilute: ordinary strong acid.', 'Dilute by adding acid to water, never water to acid. Ba²⁺ gives white BaSO₄.'],
          ja: ['接触法：S → SO₂ → SO₃（V₂O₅ 触媒）→ 濃硫酸に吸収 → 発煙硫酸 → 希釈。', '濃硫酸：脱水作用（砂糖を炭化）、吸湿性、熱すると酸化作用（Cu ＋ 熱濃硫酸 → SO₂）。希硫酸：普通の強酸。', '希釈は水に酸を加える。Ba²⁺ で白色 BaSO₄。'],
        },
      },
      {
        formula: 'HNO₃',
        name: { en: 'Nitric acid', ja: '硝酸' },
        look: { en: 'colourless liquid; yellows in light', ja: '無色の液体、光で分解し黄色に' },
        facts: {
          en: ['Ostwald process: NH₃ → NO (Pt) → NO₂ → HNO₃ (with water and air).', 'Strong oxidising acid: dissolves Cu and Ag. Conc. gives NO₂ (brown), dilute gives NO (colourless).', 'Fe, Al, Ni become passive in conc. HNO₃ (oxide layer). Store in brown bottles.'],
          ja: ['オストワルト法：NH₃ → NO（Pt 触媒）→ NO₂ → HNO₃（水と空気）。', '酸化力のある強酸：Cu・Ag を溶かす。濃硝酸 → NO₂（赤褐）、希硝酸 → NO（無色）。', 'Fe・Al・Ni は濃硝酸で不動態になる。褐色びんで保存。'],
        },
      },
      {
        formula: 'H₃PO₄',
        name: { en: 'Phosphoric acid', ja: 'リン酸' },
        look: { en: 'colourless crystals / syrupy solution', ja: '無色の結晶・粘い水溶液' },
        facts: {
          en: ['Made from P₄O₁₀ + water. Medium-strength triprotic acid (weaker than H₂SO₄, HCl).', 'P₄O₁₀ is a strong drying agent.'],
          ja: ['P₄O₁₀ ＋ 水でできる。中程度の強さの3価の酸（硫酸・塩酸より弱い）。', 'P₄O₁₀ は強力な乾燥剤。'],
        },
      },
      {
        formula: 'CH₃COOH',
        name: { en: 'Acetic acid', ja: '酢酸' },
        look: { en: 'colourless liquid, vinegar smell; freezes at 17 °C (glacial)', ja: '無色・刺激臭の液体、17 °C で凍る（氷酢酸）' },
        facts: {
          en: ['Weak acid (α small). Oxidation product of ethanol via acetaldehyde.', 'Ester with ethanol (conc. H₂SO₄): ethyl acetate, fruity smell.', 'Buffer: CH₃COOH + CH₃COONa.'],
          ja: ['弱酸（電離度小）。エタノール → アセトアルデヒド → 酢酸の酸化で生成。', 'エタノールとエステル化（濃硫酸）：酢酸エチル、果実臭。', '緩衝液：CH₃COOH ＋ CH₃COONa。'],
        },
      },
      {
        formula: 'H₂S',
        name: { en: 'Hydrogen sulfide', ja: '硫化水素' },
        look: { en: 'colourless gas, rotten-egg smell, toxic', ja: '無色・腐卵臭の有毒な気体' },
        facts: {
          en: ['Lab: FeS + dilute H₂SO₄ (or HCl). Weak diprotic acid.', 'Reducing agent: turns SO₂ solution cloudy (S), decolourises I₂ and KMnO₄.', 'Precipitates metal sulfides (CuS, PbS black; ZnS white; CdS yellow) — used to separate metal ions.'],
          ja: ['実験室：FeS ＋ 希硫酸（または塩酸）。弱酸・2価。', '還元剤：SO₂ 水溶液を白濁（S）、I₂・KMnO₄ を脱色。', '金属硫化物の沈殿（CuS・PbS 黒、ZnS 白、CdS 黄）→ 金属イオンの分離に。'],
        },
      },
    ],
  },
  {
    id: 'bases',
    title: { en: 'Bases', ja: '塩基' },
    entries: [
      {
        formula: 'NaOH',
        name: { en: 'Sodium hydroxide', ja: '水酸化ナトリウム' },
        look: { en: 'white solid, deliquescent', ja: '白色の固体、潮解性' },
        facts: {
          en: ['Made by electrolysis of NaCl solution (ion-exchange membrane method): NaOH at the cathode side, Cl₂ at the anode, H₂ at the cathode.', 'Absorbs CO₂ from air → Na₂CO₃ (why old NaOH solutions are impure).', 'Dissolves amphoteric metals and their oxides: Al, Zn, Sn, Pb.'],
          ja: ['NaCl 水溶液の電気分解（イオン交換膜法）：陰極側に NaOH、陽極に Cl₂、陰極に H₂。', '空気中の CO₂ を吸収 → Na₂CO₃（古い NaOH 水溶液が不純な理由）。', '両性金属と酸化物を溶かす：Al・Zn・Sn・Pb。'],
        },
      },
      {
        formula: 'NH₃',
        name: { en: 'Ammonia', ja: 'アンモニア' },
        look: { en: 'colourless gas, pungent, very soluble in water', ja: '無色・刺激臭、水に非常によく溶ける気体' },
        facts: {
          en: ['Haber–Bosch: N₂ + 3H₂ ⇌ 2NH₃ (Fe catalyst, high pressure). Lab: NH₄Cl + Ca(OH)₂, heat; collect by upward displacement (lighter than air).', 'Weak base. Dry with soda lime, not CaCl₂ (forms an adduct) or conc. H₂SO₄.', 'Forms complex ions: [Cu(NH₃)₄]²⁺ deep blue, [Ag(NH₃)₂]⁺, [Zn(NH₃)₄]²⁺.'],
          ja: ['ハーバー・ボッシュ法：N₂ ＋ 3H₂ ⇌ 2NH₃（Fe 触媒・高圧）。実験室：NH₄Cl ＋ Ca(OH)₂ を加熱、上方置換（空気より軽い）。', '弱塩基。乾燥はソーダ石灰。CaCl₂（付加物を作る）や濃硫酸は不可。', '錯イオン：[Cu(NH₃)₄]²⁺ 深青、[Ag(NH₃)₂]⁺、[Zn(NH₃)₄]²⁺。'],
        },
      },
      {
        formula: 'Ca(OH)₂',
        name: { en: 'Calcium hydroxide (slaked lime, limewater)', ja: '水酸化カルシウム（消石灰・石灰水）' },
        look: { en: 'white powder, slightly soluble', ja: '白色粉末、水に少し溶ける' },
        facts: {
          en: ['CaO + H₂O → Ca(OH)₂ (exothermic). Limewater + CO₂ → white CaCO₃; excess CO₂ → clear Ca(HCO₃)₂.', 'Strong base despite low solubility. Used to make bleaching powder with Cl₂.'],
          ja: ['CaO ＋ H₂O → Ca(OH)₂（発熱）。石灰水 ＋ CO₂ → 白濁（CaCO₃）、さらに CO₂ → 透明な Ca(HCO₃)₂。', '溶解度は小さいが強塩基。Cl₂ と反応してさらし粉。'],
        },
      },
    ],
  },
  {
    id: 'salts',
    title: { en: 'Salts', ja: '塩' },
    entries: [
      {
        formula: 'NaCl',
        name: { en: 'Sodium chloride', ja: '塩化ナトリウム' },
        look: { en: 'white cubic crystals', ja: '白色の立方体結晶' },
        facts: {
          en: ['Neutral salt (strong acid + strong base). Raw material for NaOH, Cl₂, Na₂CO₃, HCl.', 'Molten NaCl electrolysis → Na (cathode) + Cl₂ (anode); aqueous → H₂ + Cl₂ + NaOH.'],
          ja: ['中性の塩（強酸＋強塩基）。NaOH・Cl₂・Na₂CO₃・HCl の原料。', '溶融塩電解 → Na（陰極）＋ Cl₂（陽極）。水溶液の電解 → H₂ ＋ Cl₂ ＋ NaOH。'],
        },
      },
      {
        formula: 'Na₂CO₃',
        name: { en: 'Sodium carbonate (soda ash)', ja: '炭酸ナトリウム' },
        look: { en: 'white solid; decahydrate effloresces', ja: '白色固体。十水和物は風解する' },
        facts: {
          en: ['Solvay (ammonia-soda) process: NaCl + NH₃ + CO₂ + H₂O → NaHCO₃ (precipitates) → heat → Na₂CO₃. Overall: 2NaCl + CaCO₃ → Na₂CO₃ + CaCl₂.', 'Solution is basic (hydrolysis of CO₃²⁻). Does not decompose on heating (unlike NaHCO₃).', 'Glass and soap manufacture.'],
          ja: ['アンモニアソーダ法：NaCl ＋ NH₃ ＋ CO₂ ＋ H₂O → NaHCO₃（沈殿）→ 加熱 → Na₂CO₃。全体：2NaCl ＋ CaCO₃ → Na₂CO₃ ＋ CaCl₂。', '水溶液は塩基性（CO₃²⁻ の加水分解）。加熱しても分解しない（NaHCO₃ は分解）。', 'ガラス・セッケンの製造。'],
        },
      },
      {
        formula: 'NaHCO₃',
        name: { en: 'Sodium hydrogencarbonate (baking soda)', ja: '炭酸水素ナトリウム（重曹）' },
        look: { en: 'white powder', ja: '白色粉末' },
        facts: {
          en: ['2NaHCO₃ → Na₂CO₃ + CO₂ + H₂O on heating (baking powder, fire extinguishers).', 'Weakly basic solution; reacts with acids releasing CO₂ (antacid).'],
          ja: ['加熱で 2NaHCO₃ → Na₂CO₃ ＋ CO₂ ＋ H₂O（ベーキングパウダー・消火剤）。', '水溶液は弱塩基性。酸と反応して CO₂（胃薬）。'],
        },
      },
      {
        formula: 'CaCO₃',
        name: { en: 'Calcium carbonate (limestone, marble, chalk)', ja: '炭酸カルシウム（石灰石・大理石）' },
        look: { en: 'white solid, insoluble', ja: '白色固体、水に不溶' },
        facts: {
          en: ['CaCO₃ → CaO + CO₂ on strong heating (lime kiln). Dissolves in acid with CO₂ (lab CO₂ source: CaCO₃ + HCl).', 'Dissolves in CO₂-water as Ca(HCO₃)₂ (caves, hard water).'],
          ja: ['強熱で CaCO₃ → CaO ＋ CO₂（石灰窯）。酸に CO₂ を出して溶ける（実験室の CO₂ 発生：CaCO₃ ＋ HCl）。', 'CO₂ を含む水に Ca(HCO₃)₂ として溶ける（鍾乳洞・硬水）。'],
        },
      },
      {
        formula: 'CuSO₄·5H₂O',
        name: { en: 'Copper(II) sulfate pentahydrate', ja: '硫酸銅(II)五水和物' },
        look: { en: 'blue crystals; anhydrous is white', ja: '青色結晶。無水物は白色' },
        facts: {
          en: ['Heating removes water → white CuSO₄; adding water turns it blue again (test for water).', 'Solution is weakly acidic (Cu²⁺ hydrolysis). With NaOH → blue Cu(OH)₂; with excess NH₃ → deep-blue [Cu(NH₃)₄]²⁺.'],
          ja: ['加熱で水を失い白色 CuSO₄ に。水を加えると青に戻る（水の検出）。', '水溶液は弱酸性（Cu²⁺ の加水分解）。NaOH で青白色 Cu(OH)₂、過剰の NH₃ で深青の [Cu(NH₃)₄]²⁺。'],
        },
      },
      {
        formula: 'AgNO₃',
        name: { en: 'Silver nitrate', ja: '硝酸銀' },
        look: { en: 'colourless crystals, light-sensitive', ja: '無色の結晶、感光性' },
        facts: {
          en: ['Halide test: Cl⁻ → AgCl white, Br⁻ → AgBr pale yellow, I⁻ → AgI yellow.', 'Ammoniacal AgNO₃ (Tollens reagent) + aldehyde → silver mirror.'],
          ja: ['ハロゲン化物イオンの検出：Cl⁻ → AgCl 白、Br⁻ → AgBr 淡黄、I⁻ → AgI 黄。', 'アンモニア性硝酸銀（トレンス試薬）＋ アルデヒド → 銀鏡反応。'],
        },
      },
      {
        formula: 'KMnO₄',
        name: { en: 'Potassium permanganate', ja: '過マンガン酸カリウム' },
        look: { en: 'dark purple crystals', ja: '黒紫色の結晶' },
        facts: {
          en: ['Strong oxidiser in acid: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O (purple → colourless: self-indicating titration).', 'Acidify with H₂SO₄, never HCl (Cl⁻ would be oxidised).', 'Oxidises alkenes, alcohols, H₂O₂, Fe²⁺, oxalic acid.'],
          ja: ['酸性で強い酸化剤：MnO₄⁻ ＋ 8H⁺ ＋ 5e⁻ → Mn²⁺ ＋ 4H₂O（赤紫 → 無色：指示薬不要の滴定）。', '酸性にするのは硫酸。塩酸は不可（Cl⁻ が酸化される）。', 'アルケン・アルコール・H₂O₂・Fe²⁺・シュウ酸を酸化。'],
        },
      },
      {
        formula: 'K₂Cr₂O₇',
        name: { en: 'Potassium dichromate', ja: '二クロム酸カリウム' },
        look: { en: 'orange crystals', ja: '橙赤色の結晶' },
        facts: {
          en: ['Oxidiser in acid: Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ (orange → green).', 'Oxidises ethanol to acetaldehyde then acetic acid. In base becomes yellow CrO₄²⁻.'],
          ja: ['酸性で酸化剤：Cr₂O₇²⁻ ＋ 14H⁺ ＋ 6e⁻ → 2Cr³⁺（橙 → 緑）。', 'エタノールをアセトアルデヒド、さらに酢酸に酸化。塩基性では黄色の CrO₄²⁻。'],
        },
      },
      {
        formula: 'NaClO',
        name: { en: 'Sodium hypochlorite (bleach)', ja: '次亜塩素酸ナトリウム（漂白剤）' },
        look: { en: 'in solution, chlorine smell', ja: '水溶液、塩素臭' },
        facts: {
          en: ['Cl₂ + 2NaOH → NaCl + NaClO + H₂O. Oxidising: bleaches and disinfects.', 'Mixing with acid releases toxic Cl₂ — the "do not mix" warning.'],
          ja: ['Cl₂ ＋ 2NaOH → NaCl ＋ NaClO ＋ H₂O。酸化作用で漂白・殺菌。', '酸と混ぜると有毒な Cl₂ が発生（「混ぜるな危険」）。'],
        },
      },
    ],
  },
  {
    id: 'oxides-gases',
    title: { en: 'Oxides and gases', ja: '酸化物・気体' },
    entries: [
      {
        formula: 'CO₂',
        name: { en: 'Carbon dioxide', ja: '二酸化炭素' },
        look: { en: 'colourless, odourless gas; denser than air', ja: '無色・無臭、空気より重い気体' },
        facts: {
          en: ['Lab: CaCO₃ + HCl; collect by downward displacement or over water. Acidic oxide: turns limewater cloudy.', 'Dry ice sublimes. Weak acid in water (H₂CO₃).'],
          ja: ['実験室：CaCO₃ ＋ HCl、下方置換または水上置換。酸性酸化物：石灰水を白濁。', 'ドライアイスは昇華。水に溶けて弱酸（H₂CO₃）。'],
        },
      },
      {
        formula: 'CO',
        name: { en: 'Carbon monoxide', ja: '一酸化炭素' },
        look: { en: 'colourless, odourless, very toxic', ja: '無色・無臭・猛毒' },
        facts: {
          en: ['Lab: HCOOH + conc. H₂SO₄ (dehydration). Neutral oxide, insoluble.', 'Reducing agent: Fe₂O₃ + 3CO → 2Fe + 3CO₂ in the blast furnace. Binds haemoglobin.'],
          ja: ['実験室：ギ酸 ＋ 濃硫酸（脱水）。中性酸化物、水に不溶。', '還元剤：溶鉱炉で Fe₂O₃ ＋ 3CO → 2Fe ＋ 3CO₂。ヘモグロビンと結合。'],
        },
      },
      {
        formula: 'SO₂',
        name: { en: 'Sulfur dioxide', ja: '二酸化硫黄' },
        look: { en: 'colourless, pungent gas; denser than air', ja: '無色・刺激臭、空気より重い気体' },
        facts: {
          en: ['Lab: Cu + hot conc. H₂SO₄, or Na₂SO₃ + dilute H₂SO₄. Acidic oxide.', 'Usually a reducing agent (bleaches, decolourises KMnO₄) but oxidises H₂S: SO₂ + 2H₂S → 3S + 2H₂O.'],
          ja: ['実験室：Cu ＋ 熱濃硫酸、または Na₂SO₃ ＋ 希硫酸。酸性酸化物。', 'ふつう還元剤（漂白、KMnO₄ を脱色）だが H₂S に対しては酸化剤：SO₂ ＋ 2H₂S → 3S ＋ 2H₂O。'],
        },
      },
      {
        formula: 'NO / NO₂',
        name: { en: 'Nitrogen oxides', ja: '窒素酸化物' },
        look: { en: 'NO colourless, insoluble; NO₂ red-brown, soluble', ja: 'NO 無色・水に不溶、NO₂ 赤褐色・水に溶ける' },
        facts: {
          en: ['Cu + dilute HNO₃ → NO (collect over water); Cu + conc. HNO₃ → NO₂ (downward displacement).', '2NO + O₂ → 2NO₂ instantly in air. 3NO₂ + H₂O → 2HNO₃ + NO.'],
          ja: ['Cu ＋ 希硝酸 → NO（水上置換）、Cu ＋ 濃硝酸 → NO₂（下方置換）。', '空気中で 2NO ＋ O₂ → 2NO₂。3NO₂ ＋ H₂O → 2HNO₃ ＋ NO。'],
        },
      },
      {
        formula: 'Cl₂',
        name: { en: 'Chlorine', ja: '塩素' },
        look: { en: 'yellow-green, pungent, toxic gas', ja: '黄緑色・刺激臭の有毒な気体' },
        facts: {
          en: ['Lab: MnO₂ + conc. HCl, heat; pass through water (removes HCl) then conc. H₂SO₄ (dries); downward displacement.', 'Cl₂ + H₂O ⇌ HCl + HClO; HClO bleaches and disinfects. Displaces Br₂ and I₂ from their salts.'],
          ja: ['実験室：MnO₂ ＋ 濃塩酸を加熱。水（HCl を除く）→ 濃硫酸（乾燥）を通し、下方置換。', 'Cl₂ ＋ H₂O ⇌ HCl ＋ HClO。HClO が漂白・殺菌。Br⁻・I⁻ から Br₂・I₂ を遊離。'],
        },
      },
      {
        formula: 'H₂O₂',
        name: { en: 'Hydrogen peroxide', ja: '過酸化水素' },
        look: { en: 'colourless liquid (3% solution: oxydol)', ja: '無色の液体（3% 水溶液：オキシドール）' },
        facts: {
          en: ['Decomposes to O₂ + H₂O with MnO₂ catalyst (lab O₂ source).', 'Oxidising agent normally, reducing agent toward KMnO₄ (gives O₂).'],
          ja: ['MnO₂ 触媒で O₂ ＋ H₂O に分解（実験室の O₂ 発生）。', 'ふつう酸化剤、KMnO₄ に対しては還元剤（O₂ を発生）。'],
        },
      },
      {
        formula: 'CaO',
        name: { en: 'Calcium oxide (quicklime)', ja: '酸化カルシウム（生石灰）' },
        look: { en: 'white solid', ja: '白色固体' },
        facts: {
          en: ['From CaCO₃ by heating. Basic oxide; reacts vigorously with water (drying agent, heat packs).', 'CaO + NaOH = soda lime (dries NH₃, absorbs CO₂).'],
          ja: ['CaCO₃ の加熱で生成。塩基性酸化物。水と激しく反応（乾燥剤・発熱剤）。', 'CaO ＋ NaOH ＝ ソーダ石灰（NH₃ の乾燥、CO₂ の吸収）。'],
        },
      },
      {
        formula: 'SiO₂',
        name: { en: 'Silicon dioxide (silica, quartz)', ja: '二酸化ケイ素（石英・水晶）' },
        look: { en: 'hard colourless crystals', ja: '硬い無色の結晶' },
        facts: {
          en: ['Covalent network solid, very high m.p. Acidic oxide: dissolves only in HF and in molten NaOH (→ Na₂SiO₃, water glass).', 'Silica gel is a drying agent.'],
          ja: ['共有結合の結晶、融点が非常に高い。酸性酸化物：HF と融解 NaOH（→ Na₂SiO₃、水ガラス）にだけ溶ける。', 'シリカゲルは乾燥剤。'],
        },
      },
      {
        formula: 'Al₂O₃',
        name: { en: 'Aluminium oxide (alumina)', ja: '酸化アルミニウム（アルミナ）' },
        look: { en: 'white solid, very high m.p.', ja: '白色固体、融点が非常に高い' },
        facts: {
          en: ['Amphoteric: dissolves in HCl (Al³⁺) and in NaOH ([Al(OH)₄]⁻).', 'From bauxite; electrolysed in molten cryolite to make Al (Hall–Héroult). Ruby and sapphire are Al₂O₃.'],
          ja: ['両性酸化物：HCl（Al³⁺）にも NaOH（[Al(OH)₄]⁻）にも溶ける。', 'ボーキサイトから精製し、氷晶石に溶かして溶融塩電解で Al（ホール・エルー法）。ルビー・サファイアは Al₂O₃。'],
        },
      },
    ],
  },
  {
    id: 'organic-aliphatic',
    title: { en: 'Organic: aliphatic', ja: '有機：脂肪族' },
    entries: [
      {
        formula: 'CH₄',
        name: { en: 'Methane', ja: 'メタン' },
        look: { en: 'colourless gas, lightest hydrocarbon', ja: '無色の気体、最も軽い炭化水素' },
        facts: {
          en: ['Natural gas. Lab: CH₃COONa + NaOH, heat. Substitution with Cl₂ in light.', 'Tetrahedral, 109.5°.'],
          ja: ['天然ガスの主成分。実験室：酢酸ナトリウム ＋ NaOH を加熱。光で Cl₂ と置換反応。', '正四面体、109.5°。'],
        },
      },
      {
        formula: 'C₂H₄',
        name: { en: 'Ethylene (ethene)', ja: 'エチレン' },
        look: { en: 'colourless gas, slightly sweet', ja: '無色・わずかに甘い臭いの気体' },
        facts: {
          en: ['Lab: ethanol + conc. H₂SO₄ at 160–170 °C (dehydration). Planar, C=C.', 'Addition: Br₂ (decolourises bromine water), H₂ (Ni), H₂O (→ ethanol). Polymerises to polyethylene.'],
          ja: ['実験室：エタノール ＋ 濃硫酸、160〜170 °C（脱水）。平面形、C=C。', '付加反応：Br₂（臭素水の脱色）、H₂（Ni）、H₂O（→ エタノール）。付加重合でポリエチレン。'],
        },
      },
      {
        formula: 'C₂H₂',
        name: { en: 'Acetylene (ethyne)', ja: 'アセチレン' },
        look: { en: 'colourless gas', ja: '無色の気体' },
        facts: {
          en: ['Lab: CaC₂ + H₂O. Linear, C≡C. Burns with a sooty, very hot flame (welding).', 'Adds H₂O (HgSO₄) → acetaldehyde; HCl → vinyl chloride; trimerises to benzene (Fe catalyst).'],
          ja: ['実験室：CaC₂ ＋ H₂O。直線形、C≡C。すすの多い高温の炎（溶接）。', 'H₂O 付加（HgSO₄）→ アセトアルデヒド、HCl 付加 → 塩化ビニル、3分子重合 → ベンゼン（Fe 触媒）。'],
        },
      },
      {
        formula: 'CH₃OH',
        name: { en: 'Methanol', ja: 'メタノール' },
        look: { en: 'colourless liquid, toxic', ja: '無色の液体、有毒' },
        facts: {
          en: ['CO + 2H₂ → CH₃OH (catalyst, pressure). Oxidises to formaldehyde then formic acid.', 'Causes blindness; never confuse with ethanol.'],
          ja: ['CO ＋ 2H₂ → CH₃OH（触媒・高圧）。酸化でホルムアルデヒド、さらにギ酸。', '失明の原因。エタノールと混同しない。'],
        },
      },
      {
        formula: 'C₂H₅OH',
        name: { en: 'Ethanol', ja: 'エタノール' },
        look: { en: 'colourless liquid, miscible with water', ja: '無色の液体、水と任意に混ざる' },
        facts: {
          en: ['Fermentation of glucose (C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂) or hydration of ethylene.', 'Oxidation: K₂Cr₂O₇ / H⁺ → CH₃CHO → CH₃COOH. Dehydration: 130 °C → diethyl ether, 170 °C → ethylene.', 'Reacts with Na giving H₂ (test for –OH). Iodoform reaction positive.'],
          ja: ['グルコースのアルコール発酵（C₆H₁₂O₆ → 2C₂H₅OH ＋ 2CO₂）またはエチレンの水付加。', '酸化：K₂Cr₂O₇／H⁺ → CH₃CHO → CH₃COOH。脱水：130 °C → ジエチルエーテル、170 °C → エチレン。', 'Na と反応して H₂（–OH の検出）。ヨードホルム反応陽性。'],
        },
      },
      {
        formula: 'HCHO',
        name: { en: 'Formaldehyde', ja: 'ホルムアルデヒド' },
        look: { en: 'colourless pungent gas; 37% solution = formalin', ja: '無色・刺激臭の気体。37% 水溶液がホルマリン' },
        facts: {
          en: ['From methanol + O₂ over hot Cu. Reducing: silver mirror, Fehling positive.', 'Raw material for phenol resin and urea resin.'],
          ja: ['メタノール ＋ O₂（熱した Cu）で生成。還元性：銀鏡反応・フェーリング反応陽性。', 'フェノール樹脂・尿素樹脂の原料。'],
        },
      },
      {
        formula: 'CH₃CHO',
        name: { en: 'Acetaldehyde', ja: 'アセトアルデヒド' },
        look: { en: 'colourless liquid, pungent', ja: '無色・刺激臭の液体' },
        facts: {
          en: ['Oxidation of ethanol; industrially from ethylene (Pd catalyst). Oxidises further to acetic acid.', 'Silver mirror, Fehling, iodoform reactions all positive.'],
          ja: ['エタノールの酸化。工業的にはエチレンの酸化（Pd 触媒）。さらに酸化されて酢酸。', '銀鏡反応・フェーリング反応・ヨードホルム反応がすべて陽性。'],
        },
      },
      {
        formula: 'CH₃COCH₃',
        name: { en: 'Acetone', ja: 'アセトン' },
        look: { en: 'colourless volatile liquid, solvent', ja: '無色・揮発性の液体、溶剤' },
        facts: {
          en: ['Oxidation of 2-propanol, or dry distillation of calcium acetate. Ketone: no silver mirror.', 'Iodoform reaction positive (CH₃CO– group).'],
          ja: ['2-プロパノールの酸化、または酢酸カルシウムの乾留。ケトンなので銀鏡反応なし。', 'ヨードホルム反応陽性（CH₃CO– 基）。'],
        },
      },
      {
        formula: 'HCOOH',
        name: { en: 'Formic acid', ja: 'ギ酸' },
        look: { en: 'colourless liquid, pungent', ja: '無色・刺激臭の液体' },
        facts: {
          en: ['The only carboxylic acid with an aldehyde group: acidic AND reducing (silver mirror).', 'Conc. H₂SO₄ dehydrates it to CO.'],
          ja: ['アルデヒド基をもつ唯一のカルボン酸：酸性で、かつ還元性（銀鏡反応）。', '濃硫酸で脱水されて CO。'],
        },
      },
      {
        formula: 'CH₃COOC₂H₅',
        name: { en: 'Ethyl acetate', ja: '酢酸エチル' },
        look: { en: 'colourless liquid, fruity smell', ja: '無色・果実臭の液体' },
        facts: {
          en: ['Ester from acetic acid + ethanol (conc. H₂SO₄ catalyst, reversible).', 'Hydrolysis with NaOH (saponification) gives CH₃COONa + ethanol.'],
          ja: ['酢酸 ＋ エタノールのエステル化（濃硫酸触媒、可逆）。', 'NaOH で加水分解（けん化）→ CH₃COONa ＋ エタノール。'],
        },
      },
      {
        formula: '(COOH)₂',
        name: { en: 'Oxalic acid', ja: 'シュウ酸' },
        look: { en: 'colourless crystals (dihydrate)', ja: '無色の結晶（二水和物）' },
        facts: {
          en: ['Diprotic acid; primary standard for KMnO₄ titrations (reducing agent → CO₂).', 'Simplest dicarboxylic acid.'],
          ja: ['2価の酸。KMnO₄ 滴定の標準物質（還元剤 → CO₂）。', '最も簡単なジカルボン酸。'],
        },
      },
    ],
  },
  {
    id: 'organic-aromatic',
    title: { en: 'Organic: aromatic', ja: '有機：芳香族' },
    entries: [
      {
        formula: 'C₆H₆',
        name: { en: 'Benzene', ja: 'ベンゼン' },
        look: { en: 'colourless liquid, insoluble in water, sooty flame', ja: '無色の液体、水に不溶、すすの多い炎' },
        facts: {
          en: ['Planar hexagon, all C–C equal. Prefers substitution over addition: nitration (HNO₃/H₂SO₄), sulfonation, halogenation (Fe), alkylation.', 'Addition only under force: H₂ (Ni, heat) → cyclohexane; Cl₂ (light) → C₆H₆Cl₆.'],
          ja: ['平面正六角形、C–C はすべて等しい。付加より置換：ニトロ化（HNO₃／H₂SO₄）、スルホン化、ハロゲン化（Fe）、アルキル化。', '付加は強い条件でのみ：H₂（Ni・加熱）→ シクロヘキサン、Cl₂（光）→ C₆H₆Cl₆。'],
        },
      },
      {
        formula: 'C₆H₅OH',
        name: { en: 'Phenol', ja: 'フェノール' },
        look: { en: 'colourless crystals, characteristic smell', ja: '無色の結晶、特有のにおい' },
        facts: {
          en: ['Weak acid (weaker than carbonic acid): reacts with NaOH but not with NaHCO₃. FeCl₃ → purple colour.', 'Cumene process from benzene + propene. Bromine water → white 2,4,6-tribromophenol immediately.'],
          ja: ['弱酸（炭酸より弱い）：NaOH とは反応、NaHCO₃ とは反応しない。FeCl₃ で紫色。', 'クメン法（ベンゼン ＋ プロペン）。臭素水で白色の 2,4,6-トリブロモフェノール沈殿。'],
        },
      },
      {
        formula: 'C₆H₅NH₂',
        name: { en: 'Aniline', ja: 'アニリン' },
        look: { en: 'colourless oily liquid, browns in air', ja: '無色・油状の液体、空気中で褐色に' },
        facts: {
          en: ['Nitrobenzene + Sn/HCl → anilinium salt → NaOH → aniline. Weak base (weaker than NH₃).', 'Bleaching powder → purple; K₂Cr₂O₇ → aniline black. Diazotisation with NaNO₂/HCl at 5 °C, then coupling with phenol → orange azo dye.'],
          ja: ['ニトロベンゼン ＋ Sn／HCl → アニリン塩酸塩 → NaOH → アニリン。弱塩基（NH₃ より弱い）。', 'さらし粉で赤紫、K₂Cr₂O₇ でアニリンブラック。NaNO₂／HCl、5 °C でジアゾ化 → フェノールとカップリング → 橙赤のアゾ染料。'],
        },
      },
      {
        formula: 'C₆H₅COOH',
        name: { en: 'Benzoic acid', ja: '安息香酸' },
        look: { en: 'white needle crystals, sublimes', ja: '白色の針状結晶、昇華' },
        facts: {
          en: ['Oxidation of toluene (KMnO₄). Reacts with NaHCO₃ (CO₂) — stronger than phenol and carbonic acid.', 'Preservative.'],
          ja: ['トルエンの酸化（KMnO₄）。NaHCO₃ と反応して CO₂ → フェノールや炭酸より強い酸。', '保存料。'],
        },
      },
      {
        formula: 'C₆H₄(OH)COOH',
        name: { en: 'Salicylic acid', ja: 'サリチル酸' },
        look: { en: 'white crystals', ja: '白色の結晶' },
        facts: {
          en: ['Sodium phenoxide + CO₂ (pressure, heat) → sodium salicylate → acid. Both –OH (phenol) and –COOH.', 'With methanol → methyl salicylate (liniment); with acetic anhydride → acetylsalicylic acid (aspirin).'],
          ja: ['ナトリウムフェノキシド ＋ CO₂（加圧・加熱）→ サリチル酸ナトリウム → 酸。–OH（フェノール性）と –COOH の両方。', 'メタノールと → サリチル酸メチル（消炎剤）、無水酢酸と → アセチルサリチル酸（アスピリン）。'],
        },
      },
      {
        formula: 'C₆H₅NO₂',
        name: { en: 'Nitrobenzene', ja: 'ニトロベンゼン' },
        look: { en: 'pale yellow oily liquid, almond smell, denser than water', ja: '淡黄色・油状、アーモンド臭、水より重い' },
        facts: {
          en: ['Benzene + conc. HNO₃ + conc. H₂SO₄ at ~60 °C. Reduced to aniline.'],
          ja: ['ベンゼン ＋ 濃硝酸 ＋ 濃硫酸、約 60 °C。還元してアニリン。'],
        },
      },
    ],
  },
  {
    id: 'bio-polymers',
    title: { en: 'Biomolecules and polymers', ja: '天然物・高分子' },
    entries: [
      {
        formula: 'C₆H₁₂O₆',
        name: { en: 'Glucose', ja: 'グルコース' },
        look: { en: 'white crystals, sweet', ja: '白色の結晶、甘い' },
        facts: {
          en: ['Chain form has an aldehyde group → reducing sugar (Fehling positive). Fermentation → ethanol + CO₂.', 'Sucrose is NOT reducing until hydrolysed into glucose + fructose.'],
          ja: ['鎖状構造にアルデヒド基 → 還元糖（フェーリング反応陽性）。アルコール発酵 → エタノール ＋ CO₂。', 'スクロースは還元性なし。加水分解でグルコース ＋ フルクトースになると還元性。'],
        },
      },
      {
        formula: '(C₆H₁₀O₅)ₙ',
        name: { en: 'Starch / cellulose', ja: 'デンプン・セルロース' },
        look: { en: 'white solids', ja: '白色固体' },
        facts: {
          en: ['Starch: α-glucose polymer, iodine → blue-purple, hydrolyses to maltose then glucose. Cellulose: β-glucose polymer, no iodine colour, not digested by humans.'],
          ja: ['デンプン：α-グルコースの重合体、ヨウ素で青紫、加水分解でマルトース → グルコース。セルロース：β-グルコースの重合体、ヨウ素反応なし、ヒトは消化できない。'],
        },
      },
      {
        formula: 'H₂N–CH₂–COOH',
        name: { en: 'Glycine (simplest amino acid)', ja: 'グリシン（最も簡単なアミノ酸）' },
        look: { en: 'white crystals', ja: '白色の結晶' },
        facts: {
          en: ['Amphoteric; exists as a zwitterion. The only amino acid with no chiral carbon.', 'Peptide bond –CO–NH– links amino acids; proteins give purple with biuret test, yellow with xanthoproteic (HNO₃) test.'],
          ja: ['両性、双性イオンとして存在。不斉炭素をもたない唯一のアミノ酸。', 'ペプチド結合 –CO–NH– でつながる。タンパク質はビウレット反応で赤紫、キサントプロテイン反応（HNO₃）で黄色。'],
        },
      },
      {
        formula: '[–CH₂–CH₂–]ₙ',
        name: { en: 'Polyethylene', ja: 'ポリエチレン' },
        look: { en: 'flexible white solid', ja: '柔らかい白色固体' },
        facts: {
          en: ['Addition polymer of ethylene. Same family: PVC (vinyl chloride), polystyrene, PP.'],
          ja: ['エチレンの付加重合体。同じ仲間：ポリ塩化ビニル、ポリスチレン、ポリプロピレン。'],
        },
      },
      {
        formula: 'PET',
        name: { en: 'Polyethylene terephthalate', ja: 'ポリエチレンテレフタラート' },
        look: { en: 'clear, strong (bottles, fibres)', ja: '透明で強い（ボトル・繊維）' },
        facts: {
          en: ['Condensation polymer: terephthalic acid + ethylene glycol, water eliminated. Ester bonds (polyester).'],
          ja: ['縮合重合：テレフタル酸 ＋ エチレングリコール、水がとれる。エステル結合（ポリエステル）。'],
        },
      },
      {
        formula: 'Nylon 66',
        name: { en: 'Nylon 6,6', ja: 'ナイロン66' },
        look: { en: 'strong fibre', ja: '強い繊維' },
        facts: {
          en: ['Condensation of adipic acid + hexamethylenediamine; amide bonds like proteins (polyamide). Nylon 6 is ring-opening polymerisation of ε-caprolactam.'],
          ja: ['アジピン酸 ＋ ヘキサメチレンジアミンの縮合重合。タンパク質と同じアミド結合（ポリアミド）。ナイロン6は ε-カプロラクタムの開環重合。'],
        },
      },
    ],
  },
];
