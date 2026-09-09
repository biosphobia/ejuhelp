// Colours the EJU chemistry paper expects you to know: flame tests, ions in
// water, precipitates, complex ions, gases, indicators. Each entry carries a
// swatch colour (hex) so the table shows the colour, not just its name.
export interface ColorEntry {
  /** Formula or substance, plain Unicode (Cu²⁺, Fe(OH)₃). */
  formula: string;
  name: { en: string; ja: string };
  hex: string;
  color: { en: string; ja: string };
  note?: { en: string; ja: string };
}
export interface ColorSection {
  id: string;
  title: { en: string; ja: string };
  hint?: { en: string; ja: string };
  entries: ColorEntry[];
}

export const COLOR_SECTIONS: ColorSection[] = [
  {
    id: 'flame',
    title: { en: 'Flame tests', ja: '炎色反応' },
    hint: {
      en: 'Only these metals colour a flame. Mg, Al, Fe, Zn give nothing.',
      ja: '炎色を示すのはこれだけ。Mg・Al・Fe・Zn は示さない。',
    },
    entries: [
      { formula: 'Li', name: { en: 'Lithium', ja: 'リチウム' }, hex: '#e11d48', color: { en: 'red', ja: '赤' } },
      { formula: 'Na', name: { en: 'Sodium', ja: 'ナトリウム' }, hex: '#facc15', color: { en: 'yellow', ja: '黄' }, note: { en: 'Very strong; masks other colours.', ja: '非常に強く、他の色を隠す。' } },
      { formula: 'K', name: { en: 'Potassium', ja: 'カリウム' }, hex: '#a855f7', color: { en: 'purple (lilac)', ja: '赤紫' } },
      { formula: 'Cu', name: { en: 'Copper', ja: '銅' }, hex: '#14b8a6', color: { en: 'blue-green', ja: '青緑' } },
      { formula: 'Ca', name: { en: 'Calcium', ja: 'カルシウム' }, hex: '#f97316', color: { en: 'orange-red', ja: '橙赤' } },
      { formula: 'Sr', name: { en: 'Strontium', ja: 'ストロンチウム' }, hex: '#be123c', color: { en: 'crimson', ja: '紅（深赤）' } },
      { formula: 'Ba', name: { en: 'Barium', ja: 'バリウム' }, hex: '#a3e635', color: { en: 'yellow-green', ja: '黄緑' } },
    ],
  },
  {
    id: 'ions',
    title: { en: 'Ions in solution', ja: '水溶液中のイオンの色' },
    hint: { en: 'Transition-metal ions are coloured; typical-element ions are colourless.', ja: '遷移元素のイオンは有色、典型元素のイオンは無色。' },
    entries: [
      { formula: 'Cu²⁺', name: { en: 'Copper(II)', ja: '銅(II)イオン' }, hex: '#38bdf8', color: { en: 'blue', ja: '青' } },
      { formula: 'Fe²⁺', name: { en: 'Iron(II)', ja: '鉄(II)イオン' }, hex: '#86efac', color: { en: 'pale green', ja: '淡緑' } },
      { formula: 'Fe³⁺', name: { en: 'Iron(III)', ja: '鉄(III)イオン' }, hex: '#ca8a04', color: { en: 'yellow-brown', ja: '黄褐' } },
      { formula: 'Ni²⁺', name: { en: 'Nickel(II)', ja: 'ニッケル(II)イオン' }, hex: '#22c55e', color: { en: 'green', ja: '緑' } },
      { formula: 'Cr³⁺', name: { en: 'Chromium(III)', ja: 'クロム(III)イオン' }, hex: '#15803d', color: { en: 'green', ja: '緑' } },
      { formula: 'Mn²⁺', name: { en: 'Manganese(II)', ja: 'マンガン(II)イオン' }, hex: '#fbcfe8', color: { en: 'pale pink', ja: '淡桃' } },
      { formula: 'MnO₄⁻', name: { en: 'Permanganate', ja: '過マンガン酸イオン' }, hex: '#7e22ce', color: { en: 'purple-red', ja: '赤紫' }, note: { en: 'Turns colourless when reduced to Mn²⁺ (titration endpoint).', ja: '還元されて Mn²⁺ になると無色（滴定の終点）。' } },
      { formula: 'CrO₄²⁻', name: { en: 'Chromate', ja: 'クロム酸イオン' }, hex: '#eab308', color: { en: 'yellow', ja: '黄' }, note: { en: 'Acid turns it into orange Cr₂O₇²⁻.', ja: '酸性にすると橙の Cr₂O₇²⁻ に。' } },
      { formula: 'Cr₂O₇²⁻', name: { en: 'Dichromate', ja: '二クロム酸イオン' }, hex: '#f97316', color: { en: 'orange', ja: '橙赤' }, note: { en: 'Base turns it back into yellow CrO₄²⁻.', ja: '塩基性にすると黄の CrO₄²⁻ に戻る。' } },
      { formula: 'Zn²⁺, Al³⁺, Ag⁺, Pb²⁺, Ba²⁺, Ca²⁺', name: { en: 'Typical-element ions', ja: '典型元素のイオン' }, hex: '#f8fafc', color: { en: 'colourless', ja: '無色' } },
    ],
  },
  {
    id: 'hydroxides',
    title: { en: 'Hydroxide precipitates (add NaOH / NH₃)', ja: '水酸化物の沈殿（NaOH・NH₃ を加える）' },
    hint: {
      en: 'Amphoteric hydroxides (Al, Zn, Sn, Pb) redissolve in excess NaOH; Cu, Zn, Ag, Ni redissolve in excess NH₃ as complex ions.',
      ja: '両性水酸化物（Al・Zn・Sn・Pb）は過剰の NaOH に溶ける。Cu・Zn・Ag・Ni は過剰の NH₃ に錯イオンとして溶ける。',
    },
    entries: [
      { formula: 'Cu(OH)₂', name: { en: 'Copper(II) hydroxide', ja: '水酸化銅(II)' }, hex: '#60a5fa', color: { en: 'blue', ja: '青白' }, note: { en: 'Heating gives black CuO.', ja: '加熱で黒色の CuO。' } },
      { formula: 'Fe(OH)₂', name: { en: 'Iron(II) hydroxide', ja: '水酸化鉄(II)' }, hex: '#a7f3d0', color: { en: 'green-white', ja: '緑白' }, note: { en: 'Oxidises in air to red-brown Fe(OH)₃.', ja: '空気中で酸化され赤褐色の水酸化鉄(III)に。' } },
      { formula: 'Fe(OH)₃', name: { en: 'Iron(III) hydroxide', ja: '水酸化鉄(III)' }, hex: '#b45309', color: { en: 'red-brown', ja: '赤褐' } },
      { formula: 'Al(OH)₃', name: { en: 'Aluminium hydroxide', ja: '水酸化アルミニウム' }, hex: '#ffffff', color: { en: 'white (gel)', ja: '白（ゲル状）' }, note: { en: 'Dissolves in excess NaOH as [Al(OH)₄]⁻, not in NH₃.', ja: '過剰の NaOH に [Al(OH)₄]⁻ として溶ける。NH₃ には溶けない。' } },
      { formula: 'Zn(OH)₂', name: { en: 'Zinc hydroxide', ja: '水酸化亜鉛' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'Dissolves in excess NaOH and in excess NH₃.', ja: '過剰の NaOH にも NH₃ にも溶ける。' } },
      { formula: 'Mg(OH)₂', name: { en: 'Magnesium hydroxide', ja: '水酸化マグネシウム' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'Does not redissolve.', ja: '再溶解しない。' } },
      { formula: 'Ag₂O', name: { en: 'Silver oxide (from AgOH)', ja: '酸化銀（AgOH が分解）' }, hex: '#78350f', color: { en: 'brown', ja: '褐' }, note: { en: 'Dissolves in excess NH₃ as [Ag(NH₃)₂]⁺.', ja: '過剰の NH₃ に [Ag(NH₃)₂]⁺ として溶ける。' } },
    ],
  },
  {
    id: 'sulfides',
    title: { en: 'Sulfide precipitates (H₂S)', ja: '硫化物の沈殿（H₂S）' },
    hint: {
      en: 'Cu, Pb, Ag, Hg, Cd, Sn precipitate even in acid; Zn, Fe, Ni, Mn only in neutral or basic solution.',
      ja: 'Cu・Pb・Ag・Hg・Cd・Sn は酸性でも沈殿。Zn・Fe・Ni・Mn は中性〜塩基性でのみ沈殿。',
    },
    entries: [
      { formula: 'CuS', name: { en: 'Copper(II) sulfide', ja: '硫化銅(II)' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'PbS', name: { en: 'Lead(II) sulfide', ja: '硫化鉛(II)' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'Ag₂S', name: { en: 'Silver sulfide', ja: '硫化銀' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'FeS', name: { en: 'Iron(II) sulfide', ja: '硫化鉄(II)' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'NiS', name: { en: 'Nickel sulfide', ja: '硫化ニッケル' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'ZnS', name: { en: 'Zinc sulfide', ja: '硫化亜鉛' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'The one white sulfide to remember.', ja: '白い硫化物はこれだけ覚える。' } },
      { formula: 'CdS', name: { en: 'Cadmium sulfide', ja: '硫化カドミウム' }, hex: '#facc15', color: { en: 'yellow', ja: '黄' } },
      { formula: 'MnS', name: { en: 'Manganese(II) sulfide', ja: '硫化マンガン(II)' }, hex: '#fda4af', color: { en: 'pink (flesh)', ja: '淡桃' } },
      { formula: 'SnS', name: { en: 'Tin(II) sulfide', ja: '硫化スズ(II)' }, hex: '#78350f', color: { en: 'brown', ja: '褐' } },
    ],
  },
  {
    id: 'halides-others',
    title: { en: 'Halides, chromates, sulfates, carbonates', ja: 'ハロゲン化物・クロム酸塩・硫酸塩・炭酸塩' },
    entries: [
      { formula: 'AgCl', name: { en: 'Silver chloride', ja: '塩化銀' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'Dissolves in NH₃; darkens in light.', ja: 'NH₃ に溶ける。光で黒ずむ（感光性）。' } },
      { formula: 'AgBr', name: { en: 'Silver bromide', ja: '臭化銀' }, hex: '#fef3c7', color: { en: 'pale yellow', ja: '淡黄' } },
      { formula: 'AgI', name: { en: 'Silver iodide', ja: 'ヨウ化銀' }, hex: '#fde047', color: { en: 'yellow', ja: '黄' }, note: { en: 'Does not dissolve in NH₃.', ja: 'NH₃ に溶けない。' } },
      { formula: 'PbCl₂', name: { en: 'Lead(II) chloride', ja: '塩化鉛(II)' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'Dissolves in hot water.', ja: '熱水に溶ける。' } },
      { formula: 'PbI₂', name: { en: 'Lead(II) iodide', ja: 'ヨウ化鉛(II)' }, hex: '#fde047', color: { en: 'yellow', ja: '黄' } },
      { formula: 'Ag₂CrO₄', name: { en: 'Silver chromate', ja: 'クロム酸銀' }, hex: '#b91c1c', color: { en: 'dark red', ja: '赤褐' } },
      { formula: 'PbCrO₄', name: { en: 'Lead(II) chromate', ja: 'クロム酸鉛(II)' }, hex: '#facc15', color: { en: 'yellow', ja: '黄' } },
      { formula: 'BaCrO₄', name: { en: 'Barium chromate', ja: 'クロム酸バリウム' }, hex: '#fde047', color: { en: 'yellow', ja: '黄' } },
      { formula: 'BaSO₄, PbSO₄, CaSO₄', name: { en: 'Sulfates', ja: '硫酸塩' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'BaSO₄ is insoluble even in strong acid.', ja: 'BaSO₄ は強酸にも溶けない。' } },
      { formula: 'CaCO₃, BaCO₃', name: { en: 'Carbonates', ja: '炭酸塩' }, hex: '#ffffff', color: { en: 'white', ja: '白' }, note: { en: 'Dissolve in acid with CO₂ bubbles; limewater test.', ja: '酸に CO₂ を出して溶ける。石灰水の白濁。' } },
    ],
  },
  {
    id: 'complex',
    title: { en: 'Complex ions', ja: '錯イオン' },
    entries: [
      { formula: '[Cu(NH₃)₄]²⁺', name: { en: 'Tetraamminecopper(II)', ja: 'テトラアンミン銅(II)イオン' }, hex: '#1d4ed8', color: { en: 'deep blue', ja: '深青' } },
      { formula: '[Ag(NH₃)₂]⁺', name: { en: 'Diamminesilver(I)', ja: 'ジアンミン銀(I)イオン' }, hex: '#f8fafc', color: { en: 'colourless', ja: '無色' } },
      { formula: '[Zn(NH₃)₄]²⁺', name: { en: 'Tetraamminezinc(II)', ja: 'テトラアンミン亜鉛(II)イオン' }, hex: '#f8fafc', color: { en: 'colourless', ja: '無色' } },
      { formula: '[Al(OH)₄]⁻', name: { en: 'Tetrahydroxidoaluminate', ja: 'テトラヒドロキシドアルミン酸イオン' }, hex: '#f8fafc', color: { en: 'colourless', ja: '無色' } },
      { formula: '[Fe(CN)₆]⁴⁻', name: { en: 'Hexacyanidoferrate(II)', ja: 'ヘキサシアニド鉄(II)酸イオン' }, hex: '#fef9c3', color: { en: 'pale yellow', ja: '淡黄' }, note: { en: 'With Fe³⁺ gives deep-blue precipitate (Prussian blue).', ja: 'Fe³⁺ と濃青色沈殿（紺青）。' } },
      { formula: '[Fe(CN)₆]³⁻', name: { en: 'Hexacyanidoferrate(III)', ja: 'ヘキサシアニド鉄(III)酸イオン' }, hex: '#eab308', color: { en: 'yellow', ja: '黄' }, note: { en: 'With Fe²⁺ gives deep-blue precipitate (Turnbull\'s blue).', ja: 'Fe²⁺ と濃青色沈殿（ターンブル青）。' } },
      { formula: 'Fe³⁺ + SCN⁻', name: { en: 'Thiocyanate test', ja: 'チオシアン酸カリウム' }, hex: '#991b1b', color: { en: 'blood red', ja: '血赤' }, note: { en: 'Detects Fe³⁺ only.', ja: 'Fe³⁺ の検出。Fe²⁺ は反応しない。' } },
    ],
  },
  {
    id: 'gases',
    title: { en: 'Gases and other substances', ja: '気体・その他の物質' },
    entries: [
      { formula: 'Cl₂', name: { en: 'Chlorine', ja: '塩素' }, hex: '#bef264', color: { en: 'yellow-green', ja: '黄緑' } },
      { formula: 'Br₂', name: { en: 'Bromine', ja: '臭素' }, hex: '#9a3412', color: { en: 'red-brown liquid', ja: '赤褐色の液体' } },
      { formula: 'I₂', name: { en: 'Iodine', ja: 'ヨウ素' }, hex: '#4c1d95', color: { en: 'purple-black solid, violet vapour', ja: '黒紫の固体、紫の蒸気' }, note: { en: 'Blue-purple with starch.', ja: 'デンプンと青紫（ヨウ素デンプン反応）。' } },
      { formula: 'NO₂', name: { en: 'Nitrogen dioxide', ja: '二酸化窒素' }, hex: '#b45309', color: { en: 'red-brown', ja: '赤褐' }, note: { en: 'NO itself is colourless and turns brown in air.', ja: 'NO は無色で、空気中で赤褐色に変わる。' } },
      { formula: 'O₃', name: { en: 'Ozone', ja: 'オゾン' }, hex: '#93c5fd', color: { en: 'pale blue', ja: '淡青' } },
      { formula: 'CuO', name: { en: 'Copper(II) oxide', ja: '酸化銅(II)' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'Cu₂O', name: { en: 'Copper(I) oxide', ja: '酸化銅(I)' }, hex: '#dc2626', color: { en: 'red', ja: '赤' }, note: { en: 'Fehling test for aldehydes.', ja: 'フェーリング液の還元（アルデヒドの検出）。' } },
      { formula: 'CuSO₄·5H₂O', name: { en: 'Copper sulfate pentahydrate', ja: '硫酸銅(II)五水和物' }, hex: '#2563eb', color: { en: 'blue crystals; white when anhydrous', ja: '青色結晶。無水物は白' }, note: { en: 'White CuSO₄ turning blue = water test.', ja: '白い無水物が青くなる → 水の検出。' } },
      { formula: 'Fe₂O₃', name: { en: 'Iron(III) oxide', ja: '酸化鉄(III)' }, hex: '#b91c1c', color: { en: 'red-brown (rust)', ja: '赤褐（さび）' } },
      { formula: 'Fe₃O₄', name: { en: 'Triiron tetroxide', ja: '四酸化三鉄' }, hex: '#0f172a', color: { en: 'black', ja: '黒' } },
      { formula: 'S', name: { en: 'Sulfur', ja: '硫黄' }, hex: '#fde047', color: { en: 'yellow', ja: '黄' } },
      { formula: 'P₄ (white)', name: { en: 'White phosphorus', ja: '黄リン' }, hex: '#fef3c7', color: { en: 'pale yellow, waxy', ja: '淡黄' } },
    ],
  },
  {
    id: 'indicators',
    title: { en: 'Indicators', ja: '指示薬' },
    hint: { en: 'Acid colour → base colour, with the change range.', ja: '酸性側の色 → 塩基性側の色（変色域）。' },
    entries: [
      { formula: 'Litmus', name: { en: 'Litmus', ja: 'リトマス' }, hex: '#ef4444', color: { en: 'red (acid) → blue (base)', ja: '赤（酸性）→ 青（塩基性）' } },
      { formula: 'Methyl orange', name: { en: 'Methyl orange', ja: 'メチルオレンジ' }, hex: '#f97316', color: { en: 'red → yellow, pH 3.1–4.4', ja: '赤 → 黄、pH 3.1〜4.4' }, note: { en: 'For strong acid + weak base titrations.', ja: '強酸＋弱塩基の滴定に。' } },
      { formula: 'BTB', name: { en: 'Bromothymol blue', ja: 'ブロモチモールブルー' }, hex: '#22c55e', color: { en: 'yellow → green → blue, pH 6.0–7.6', ja: '黄 → 緑 → 青、pH 6.0〜7.6' } },
      { formula: 'Phenolphthalein', name: { en: 'Phenolphthalein', ja: 'フェノールフタレイン' }, hex: '#ec4899', color: { en: 'colourless → red-pink, pH 8.3–10.0', ja: '無色 → 赤、pH 8.3〜10.0' }, note: { en: 'For weak acid + strong base titrations.', ja: '弱酸＋強塩基の滴定に。' } },
    ],
  },
];
