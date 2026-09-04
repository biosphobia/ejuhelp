// Full periodic table (Z = 1–118) with EJU-focused study notes.
//
// Names are given in all four UI languages. Study notes (what the EJU actually
// asks about each element) are written in English and Japanese — the two
// languages the EJU itself is offered in — and fall back to English elsewhere.
// Formulas use Unicode sub/superscripts so they render identically in tiny
// table cells, notes, and screen readers.

export type Category =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide';

export type ElementState = 'gas' | 'liquid' | 'solid' | 'unknown';

export interface Bilingual {
  en: string;
  ja: string;
}

export interface ElementNotes {
  /** Bullet points: what to know for the EJU. */
  en: string[];
  ja: string[];
  /** Common ions / oxidation states, e.g. "Na⁺". */
  ions?: Bilingual;
  /** Flame-test colour, if the EJU asks it. */
  flame?: Bilingual;
}

export interface ElementData {
  z: number;
  sym: string;
  name: { en: string; ja: string; zh: string; tr: string };
  /** Standard atomic weight (rounded), or the mass number of the most stable isotope in brackets. */
  mass: string;
  cat: Category;
  period: number;
  /** 1–18; 0 for the f-block rows (lanthanides / actinides). */
  group: number;
  state: ElementState;
  /** Pauling electronegativity, when defined. */
  en?: number;
  notes?: ElementNotes;
}

// [z, symbol, en, ja, zh, tr, mass, category, period, group, state, electronegativity]
type Row = [number, string, string, string, string, string, string, Category, number, number, ElementState, number | null];

const ROWS: Row[] = [
  [1, 'H', 'Hydrogen', '水素', '氢', 'Hidrojen', '1.008', 'nonmetal', 1, 1, 'gas', 2.2],
  [2, 'He', 'Helium', 'ヘリウム', '氦', 'Helyum', '4.003', 'noble', 1, 18, 'gas', null],
  [3, 'Li', 'Lithium', 'リチウム', '锂', 'Lityum', '6.94', 'alkali', 2, 1, 'solid', 0.98],
  [4, 'Be', 'Beryllium', 'ベリリウム', '铍', 'Berilyum', '9.012', 'alkaline', 2, 2, 'solid', 1.57],
  [5, 'B', 'Boron', 'ホウ素', '硼', 'Bor', '10.81', 'metalloid', 2, 13, 'solid', 2.04],
  [6, 'C', 'Carbon', '炭素', '碳', 'Karbon', '12.01', 'nonmetal', 2, 14, 'solid', 2.55],
  [7, 'N', 'Nitrogen', '窒素', '氮', 'Azot', '14.01', 'nonmetal', 2, 15, 'gas', 3.04],
  [8, 'O', 'Oxygen', '酸素', '氧', 'Oksijen', '16.00', 'nonmetal', 2, 16, 'gas', 3.44],
  [9, 'F', 'Fluorine', 'フッ素', '氟', 'Flor', '19.00', 'halogen', 2, 17, 'gas', 3.98],
  [10, 'Ne', 'Neon', 'ネオン', '氖', 'Neon', '20.18', 'noble', 2, 18, 'gas', null],
  [11, 'Na', 'Sodium', 'ナトリウム', '钠', 'Sodyum', '22.99', 'alkali', 3, 1, 'solid', 0.93],
  [12, 'Mg', 'Magnesium', 'マグネシウム', '镁', 'Magnezyum', '24.31', 'alkaline', 3, 2, 'solid', 1.31],
  [13, 'Al', 'Aluminium', 'アルミニウム', '铝', 'Alüminyum', '26.98', 'post', 3, 13, 'solid', 1.61],
  [14, 'Si', 'Silicon', 'ケイ素', '硅', 'Silisyum', '28.09', 'metalloid', 3, 14, 'solid', 1.9],
  [15, 'P', 'Phosphorus', 'リン', '磷', 'Fosfor', '30.97', 'nonmetal', 3, 15, 'solid', 2.19],
  [16, 'S', 'Sulfur', '硫黄', '硫', 'Kükürt', '32.06', 'nonmetal', 3, 16, 'solid', 2.58],
  [17, 'Cl', 'Chlorine', '塩素', '氯', 'Klor', '35.45', 'halogen', 3, 17, 'gas', 3.16],
  [18, 'Ar', 'Argon', 'アルゴン', '氩', 'Argon', '39.95', 'noble', 3, 18, 'gas', null],
  [19, 'K', 'Potassium', 'カリウム', '钾', 'Potasyum', '39.10', 'alkali', 4, 1, 'solid', 0.82],
  [20, 'Ca', 'Calcium', 'カルシウム', '钙', 'Kalsiyum', '40.08', 'alkaline', 4, 2, 'solid', 1.0],
  [21, 'Sc', 'Scandium', 'スカンジウム', '钪', 'Skandiyum', '44.96', 'transition', 4, 3, 'solid', 1.36],
  [22, 'Ti', 'Titanium', 'チタン', '钛', 'Titanyum', '47.87', 'transition', 4, 4, 'solid', 1.54],
  [23, 'V', 'Vanadium', 'バナジウム', '钒', 'Vanadyum', '50.94', 'transition', 4, 5, 'solid', 1.63],
  [24, 'Cr', 'Chromium', 'クロム', '铬', 'Krom', '52.00', 'transition', 4, 6, 'solid', 1.66],
  [25, 'Mn', 'Manganese', 'マンガン', '锰', 'Mangan', '54.94', 'transition', 4, 7, 'solid', 1.55],
  [26, 'Fe', 'Iron', '鉄', '铁', 'Demir', '55.85', 'transition', 4, 8, 'solid', 1.83],
  [27, 'Co', 'Cobalt', 'コバルト', '钴', 'Kobalt', '58.93', 'transition', 4, 9, 'solid', 1.88],
  [28, 'Ni', 'Nickel', 'ニッケル', '镍', 'Nikel', '58.69', 'transition', 4, 10, 'solid', 1.91],
  [29, 'Cu', 'Copper', '銅', '铜', 'Bakır', '63.55', 'transition', 4, 11, 'solid', 1.9],
  [30, 'Zn', 'Zinc', '亜鉛', '锌', 'Çinko', '65.38', 'post', 4, 12, 'solid', 1.65],
  [31, 'Ga', 'Gallium', 'ガリウム', '镓', 'Galyum', '69.72', 'post', 4, 13, 'solid', 1.81],
  [32, 'Ge', 'Germanium', 'ゲルマニウム', '锗', 'Germanyum', '72.63', 'metalloid', 4, 14, 'solid', 2.01],
  [33, 'As', 'Arsenic', 'ヒ素', '砷', 'Arsenik', '74.92', 'metalloid', 4, 15, 'solid', 2.18],
  [34, 'Se', 'Selenium', 'セレン', '硒', 'Selenyum', '78.97', 'nonmetal', 4, 16, 'solid', 2.55],
  [35, 'Br', 'Bromine', '臭素', '溴', 'Brom', '79.90', 'halogen', 4, 17, 'liquid', 2.96],
  [36, 'Kr', 'Krypton', 'クリプトン', '氪', 'Kripton', '83.80', 'noble', 4, 18, 'gas', 3.0],
  [37, 'Rb', 'Rubidium', 'ルビジウム', '铷', 'Rubidyum', '85.47', 'alkali', 5, 1, 'solid', 0.82],
  [38, 'Sr', 'Strontium', 'ストロンチウム', '锶', 'Stronsiyum', '87.62', 'alkaline', 5, 2, 'solid', 0.95],
  [39, 'Y', 'Yttrium', 'イットリウム', '钇', 'İtriyum', '88.91', 'transition', 5, 3, 'solid', 1.22],
  [40, 'Zr', 'Zirconium', 'ジルコニウム', '锆', 'Zirkonyum', '91.22', 'transition', 5, 4, 'solid', 1.33],
  [41, 'Nb', 'Niobium', 'ニオブ', '铌', 'Niyobyum', '92.91', 'transition', 5, 5, 'solid', 1.6],
  [42, 'Mo', 'Molybdenum', 'モリブデン', '钼', 'Molibden', '95.95', 'transition', 5, 6, 'solid', 2.16],
  [43, 'Tc', 'Technetium', 'テクネチウム', '锝', 'Teknesyum', '[99]', 'transition', 5, 7, 'solid', 1.9],
  [44, 'Ru', 'Ruthenium', 'ルテニウム', '钌', 'Rutenyum', '101.1', 'transition', 5, 8, 'solid', 2.2],
  [45, 'Rh', 'Rhodium', 'ロジウム', '铑', 'Rodyum', '102.9', 'transition', 5, 9, 'solid', 2.28],
  [46, 'Pd', 'Palladium', 'パラジウム', '钯', 'Paladyum', '106.4', 'transition', 5, 10, 'solid', 2.2],
  [47, 'Ag', 'Silver', '銀', '银', 'Gümüş', '107.9', 'transition', 5, 11, 'solid', 1.93],
  [48, 'Cd', 'Cadmium', 'カドミウム', '镉', 'Kadmiyum', '112.4', 'post', 5, 12, 'solid', 1.69],
  [49, 'In', 'Indium', 'インジウム', '铟', 'İndiyum', '114.8', 'post', 5, 13, 'solid', 1.78],
  [50, 'Sn', 'Tin', 'スズ', '锡', 'Kalay', '118.7', 'post', 5, 14, 'solid', 1.96],
  [51, 'Sb', 'Antimony', 'アンチモン', '锑', 'Antimon', '121.8', 'metalloid', 5, 15, 'solid', 2.05],
  [52, 'Te', 'Tellurium', 'テルル', '碲', 'Tellür', '127.6', 'metalloid', 5, 16, 'solid', 2.1],
  [53, 'I', 'Iodine', 'ヨウ素', '碘', 'İyot', '126.9', 'halogen', 5, 17, 'solid', 2.66],
  [54, 'Xe', 'Xenon', 'キセノン', '氙', 'Ksenon', '131.3', 'noble', 5, 18, 'gas', 2.6],
  [55, 'Cs', 'Caesium', 'セシウム', '铯', 'Sezyum', '132.9', 'alkali', 6, 1, 'solid', 0.79],
  [56, 'Ba', 'Barium', 'バリウム', '钡', 'Baryum', '137.3', 'alkaline', 6, 2, 'solid', 0.89],
  [57, 'La', 'Lanthanum', 'ランタン', '镧', 'Lantan', '138.9', 'lanthanide', 6, 0, 'solid', 1.1],
  [58, 'Ce', 'Cerium', 'セリウム', '铈', 'Seryum', '140.1', 'lanthanide', 6, 0, 'solid', 1.12],
  [59, 'Pr', 'Praseodymium', 'プラセオジム', '镨', 'Praseodim', '140.9', 'lanthanide', 6, 0, 'solid', 1.13],
  [60, 'Nd', 'Neodymium', 'ネオジム', '钕', 'Neodim', '144.2', 'lanthanide', 6, 0, 'solid', 1.14],
  [61, 'Pm', 'Promethium', 'プロメチウム', '钷', 'Prometyum', '[145]', 'lanthanide', 6, 0, 'solid', 1.13],
  [62, 'Sm', 'Samarium', 'サマリウム', '钐', 'Samaryum', '150.4', 'lanthanide', 6, 0, 'solid', 1.17],
  [63, 'Eu', 'Europium', 'ユウロピウム', '铕', 'Evropiyum', '152.0', 'lanthanide', 6, 0, 'solid', 1.2],
  [64, 'Gd', 'Gadolinium', 'ガドリニウム', '钆', 'Gadolinyum', '157.3', 'lanthanide', 6, 0, 'solid', 1.2],
  [65, 'Tb', 'Terbium', 'テルビウム', '铽', 'Terbiyum', '158.9', 'lanthanide', 6, 0, 'solid', 1.1],
  [66, 'Dy', 'Dysprosium', 'ジスプロシウム', '镝', 'Disprosyum', '162.5', 'lanthanide', 6, 0, 'solid', 1.22],
  [67, 'Ho', 'Holmium', 'ホルミウム', '钬', 'Holmiyum', '164.9', 'lanthanide', 6, 0, 'solid', 1.23],
  [68, 'Er', 'Erbium', 'エルビウム', '铒', 'Erbiyum', '167.3', 'lanthanide', 6, 0, 'solid', 1.24],
  [69, 'Tm', 'Thulium', 'ツリウム', '铥', 'Tulyum', '168.9', 'lanthanide', 6, 0, 'solid', 1.25],
  [70, 'Yb', 'Ytterbium', 'イッテルビウム', '镱', 'İterbiyum', '173.0', 'lanthanide', 6, 0, 'solid', 1.1],
  [71, 'Lu', 'Lutetium', 'ルテチウム', '镥', 'Lutesyum', '175.0', 'lanthanide', 6, 0, 'solid', 1.27],
  [72, 'Hf', 'Hafnium', 'ハフニウム', '铪', 'Hafniyum', '178.5', 'transition', 6, 4, 'solid', 1.3],
  [73, 'Ta', 'Tantalum', 'タンタル', '钽', 'Tantal', '180.9', 'transition', 6, 5, 'solid', 1.5],
  [74, 'W', 'Tungsten', 'タングステン', '钨', 'Tungsten', '183.8', 'transition', 6, 6, 'solid', 2.36],
  [75, 'Re', 'Rhenium', 'レニウム', '铼', 'Renyum', '186.2', 'transition', 6, 7, 'solid', 1.9],
  [76, 'Os', 'Osmium', 'オスミウム', '锇', 'Osmiyum', '190.2', 'transition', 6, 8, 'solid', 2.2],
  [77, 'Ir', 'Iridium', 'イリジウム', '铱', 'İridyum', '192.2', 'transition', 6, 9, 'solid', 2.2],
  [78, 'Pt', 'Platinum', '白金', '铂', 'Platin', '195.1', 'transition', 6, 10, 'solid', 2.28],
  [79, 'Au', 'Gold', '金', '金', 'Altın', '197.0', 'transition', 6, 11, 'solid', 2.54],
  [80, 'Hg', 'Mercury', '水銀', '汞', 'Cıva', '200.6', 'post', 6, 12, 'liquid', 2.0],
  [81, 'Tl', 'Thallium', 'タリウム', '铊', 'Talyum', '204.4', 'post', 6, 13, 'solid', 1.62],
  [82, 'Pb', 'Lead', '鉛', '铅', 'Kurşun', '207.2', 'post', 6, 14, 'solid', 2.33],
  [83, 'Bi', 'Bismuth', 'ビスマス', '铋', 'Bizmut', '209.0', 'post', 6, 15, 'solid', 2.02],
  [84, 'Po', 'Polonium', 'ポロニウム', '钋', 'Polonyum', '[210]', 'post', 6, 16, 'solid', 2.0],
  [85, 'At', 'Astatine', 'アスタチン', '砹', 'Astatin', '[210]', 'halogen', 6, 17, 'solid', 2.2],
  [86, 'Rn', 'Radon', 'ラドン', '氡', 'Radon', '[222]', 'noble', 6, 18, 'gas', 2.2],
  [87, 'Fr', 'Francium', 'フランシウム', '钫', 'Fransiyum', '[223]', 'alkali', 7, 1, 'solid', 0.7],
  [88, 'Ra', 'Radium', 'ラジウム', '镭', 'Radyum', '[226]', 'alkaline', 7, 2, 'solid', 0.9],
  [89, 'Ac', 'Actinium', 'アクチニウム', '锕', 'Aktinyum', '[227]', 'actinide', 7, 0, 'solid', 1.1],
  [90, 'Th', 'Thorium', 'トリウム', '钍', 'Toryum', '232.0', 'actinide', 7, 0, 'solid', 1.3],
  [91, 'Pa', 'Protactinium', 'プロトアクチニウム', '镤', 'Protaktinyum', '231.0', 'actinide', 7, 0, 'solid', 1.5],
  [92, 'U', 'Uranium', 'ウラン', '铀', 'Uranyum', '238.0', 'actinide', 7, 0, 'solid', 1.38],
  [93, 'Np', 'Neptunium', 'ネプツニウム', '镎', 'Neptünyum', '[237]', 'actinide', 7, 0, 'solid', 1.36],
  [94, 'Pu', 'Plutonium', 'プルトニウム', '钚', 'Plütonyum', '[239]', 'actinide', 7, 0, 'solid', 1.28],
  [95, 'Am', 'Americium', 'アメリシウム', '镅', 'Amerikyum', '[243]', 'actinide', 7, 0, 'solid', 1.13],
  [96, 'Cm', 'Curium', 'キュリウム', '锔', 'Küriyum', '[247]', 'actinide', 7, 0, 'solid', 1.28],
  [97, 'Bk', 'Berkelium', 'バークリウム', '锫', 'Berkelyum', '[247]', 'actinide', 7, 0, 'solid', 1.3],
  [98, 'Cf', 'Californium', 'カリホルニウム', '锎', 'Kaliforniyum', '[252]', 'actinide', 7, 0, 'solid', 1.3],
  [99, 'Es', 'Einsteinium', 'アインスタイニウム', '锿', 'Aynştaynyum', '[252]', 'actinide', 7, 0, 'solid', 1.3],
  [100, 'Fm', 'Fermium', 'フェルミウム', '镄', 'Fermiyum', '[257]', 'actinide', 7, 0, 'unknown', 1.3],
  [101, 'Md', 'Mendelevium', 'メンデレビウム', '钔', 'Mendelevyum', '[258]', 'actinide', 7, 0, 'unknown', 1.3],
  [102, 'No', 'Nobelium', 'ノーベリウム', '锘', 'Nobelyum', '[259]', 'actinide', 7, 0, 'unknown', 1.3],
  [103, 'Lr', 'Lawrencium', 'ローレンシウム', '铹', 'Lavrensiyum', '[262]', 'actinide', 7, 0, 'unknown', 1.3],
  [104, 'Rf', 'Rutherfordium', 'ラザホージウム', '𬬻', 'Rutherfordyum', '[267]', 'transition', 7, 4, 'unknown', null],
  [105, 'Db', 'Dubnium', 'ドブニウム', '𬭊', 'Dubniyum', '[268]', 'transition', 7, 5, 'unknown', null],
  [106, 'Sg', 'Seaborgium', 'シーボーギウム', '𬭳', 'Seaborgiyum', '[271]', 'transition', 7, 6, 'unknown', null],
  [107, 'Bh', 'Bohrium', 'ボーリウム', '𬭛', 'Bohriyum', '[272]', 'transition', 7, 7, 'unknown', null],
  [108, 'Hs', 'Hassium', 'ハッシウム', '𬭶', 'Hassiyum', '[277]', 'transition', 7, 8, 'unknown', null],
  [109, 'Mt', 'Meitnerium', 'マイトネリウム', '鿏', 'Meitneriyum', '[276]', 'transition', 7, 9, 'unknown', null],
  [110, 'Ds', 'Darmstadtium', 'ダームスタチウム', '𫟼', 'Darmstadtiyum', '[281]', 'transition', 7, 10, 'unknown', null],
  [111, 'Rg', 'Roentgenium', 'レントゲニウム', '𬬭', 'Röntgenyum', '[280]', 'transition', 7, 11, 'unknown', null],
  [112, 'Cn', 'Copernicium', 'コペルニシウム', '鿔', 'Kopernikyum', '[285]', 'post', 7, 12, 'unknown', null],
  [113, 'Nh', 'Nihonium', 'ニホニウム', '鿭', 'Nihonyum', '[278]', 'post', 7, 13, 'unknown', null],
  [114, 'Fl', 'Flerovium', 'フレロビウム', '𫓧', 'Flerovyum', '[289]', 'post', 7, 14, 'unknown', null],
  [115, 'Mc', 'Moscovium', 'モスコビウム', '镆', 'Moskovyum', '[289]', 'post', 7, 15, 'unknown', null],
  [116, 'Lv', 'Livermorium', 'リバモリウム', '𫟷', 'Livermoryum', '[293]', 'post', 7, 16, 'unknown', null],
  [117, 'Ts', 'Tennessine', 'テネシン', '鿬', 'Tennessin', '[293]', 'halogen', 7, 17, 'unknown', null],
  [118, 'Og', 'Oganesson', 'オガネソン', '鿫', 'Oganesson', '[294]', 'noble', 7, 18, 'unknown', null],
];

// ─── EJU study notes ───
// Keyed by atomic number. Elements without an entry are marked "rare on the EJU".
const NOTES: Record<number, ElementNotes> = {
  1: {
    ions: { en: 'H⁺ (acids), H⁻ (hydrides such as NaH)', ja: 'H⁺（酸）、H⁻（NaH などの水素化物）' },
    en: [
      'Lightest element; the only one whose common isotope has **no neutron** (¹H). Isotopes ¹H, ²H (deuterium), ³H (tritium).',
      'Lab preparation: Zn + dilute H₂SO₄ (or HCl) → ZnSO₄ + H₂↑. Collected by **water displacement** (insoluble in water).',
      'Metals **above H** in the ionisation series (Zn, Fe, Mg…) release H₂ from acids; Cu, Ag, Au do not.',
      'H₂O, HF and NH₃ have unusually **high boiling points** because of hydrogen bonds — a classic trend-exception question.',
      'Made industrially for the Haber–Bosch process (N₂ + 3H₂ ⇌ 2NH₃) and used in fuel cells (H₂ + ½O₂ → H₂O).',
      'Placed in group 1 but is a **nonmetal** — it does not belong to the alkali metals.',
    ],
    ja: [
      '最も軽い元素。¹Hは**中性子を持たない**唯一の原子。同位体：¹H・²H（重水素）・³H（三重水素）。',
      '実験室では Zn + 希硫酸（または希塩酸）→ ZnSO₄ + H₂↑。水に溶けにくいので**水上置換**で捕集。',
      'イオン化傾向が**Hより大きい金属**（Zn, Fe, Mg…）は酸からH₂を発生。Cu, Ag, Au は発生しない。',
      'H₂O・HF・NH₃ は水素結合のため沸点が異常に高い。周期性の例外として頻出。',
      'ハーバー・ボッシュ法（N₂ + 3H₂ ⇌ 2NH₃）や燃料電池（H₂ + ½O₂ → H₂O）で使われる。',
      '1族に置かれるが**非金属**。アルカリ金属には含めない。',
    ],
  },
  2: {
    en: [
      'Noble gas with only **2 electrons** (K shell full). Valence-electron count is taken as **0**, like the other noble gases.',
      'Lowest boiling point of any substance (4 K). Used in balloons, airships and as a coolant — inert and non-flammable.',
      'Monatomic (He, not He₂) — noble gases exist as single atoms.',
    ],
    ja: [
      '電子は**2個**だけ（K殻が満員）。他の貴ガスと同じく価電子は**0**と数える。',
      '全物質中で最も低い沸点（4 K）。気球・冷却剤に使用。反応しにくく不燃。',
      '単原子分子（He₂ではなく He）として存在する。',
    ],
  },
  3: {
    ions: { en: 'Li⁺', ja: 'Li⁺' },
    flame: { en: 'red', ja: '赤' },
    en: [
      'Alkali metal; flame test **red**. Smallest alkali atom, so Li⁺ is small and strongly hydrated.',
      'Soft, silvery, stored in oil; reacts with water (less violently than Na or K) to give LiOH + H₂.',
      'Lithium-ion batteries (Li⁺ shuttles between electrodes). Lowest density of all metals — floats on oil.',
      'Trend: reactivity of alkali metals **increases** down the group: Li < Na < K < Rb < Cs.',
    ],
    ja: [
      'アルカリ金属。炎色反応は**赤**。最も小さいアルカリ金属原子で、Li⁺ は水和されやすい。',
      '軟らかく銀白色で石油中に保存。水と反応して LiOH + H₂（Na, K より穏やか）。',
      'リチウムイオン電池（Li⁺ が電極間を移動）。金属中で最も密度が小さい。',
      '傾向：アルカリ金属の反応性は下にいくほど**大きい**（Li < Na < K < Rb < Cs）。',
    ],
  },
  4: {
    ions: { en: 'Be²⁺', ja: 'Be²⁺' },
    en: [
      'Group 2. In older Japanese textbooks Be and Mg were **excluded** from the “alkaline-earth metals”; the current curriculum includes them — check which definition a question uses.',
      'Unlike Ca–Ba: **no flame colour**, does not react with water, hydroxide is poorly soluble, sulfate is soluble.',
      'Be(OH)₂ is amphoteric. Beryllium compounds are toxic.',
    ],
    ja: [
      '2族。旧課程では Be・Mg を**アルカリ土類金属に含めなかった**が、現行課程では含める。設問の定義に注意。',
      'Ca〜Ba と異なり**炎色反応なし**、水と反応しない、水酸化物は水に溶けにくい、硫酸塩は溶ける。',
      'Be(OH)₂ は両性。ベリリウム化合物は有毒。',
    ],
  },
  5: {
    en: [
      'Metalloid on the “staircase”. BF₃ has only **6 electrons around B** — an exception to the octet rule (electron-deficient, accepts a lone pair).',
      'Boric acid H₃BO₃ is a weak acid; borosilicate (heat-resistant) glass; boron in neutron absorbers.',
    ],
    ja: [
      '半金属（階段線上）。BF₃ は B のまわりに**電子6個**しかない＝オクテット則の例外（電子不足、非共有電子対を受け取る）。',
      'ホウ酸 H₃BO₃ は弱酸。ホウケイ酸（耐熱）ガラス、中性子吸収材。',
    ],
  },
  6: {
    ions: { en: 'oxidation states −4 … +4 (CH₄ −4, CO +2, CO₂ +4)', ja: '酸化数 −4 〜 +4（CH₄ −4、CO +2、CO₂ +4）' },
    en: [
      '**Allotropes**: diamond (covalent network, hardest, insulator), graphite (layers, soft, **conducts** via delocalised electrons), fullerene C₆₀, carbon nanotubes, graphene. Amorphous carbon: charcoal, carbon black.',
      'CO: colourless, **toxic**, a reducing agent (blast furnace: Fe₂O₃ + 3CO → 2Fe + 3CO₂). CO₂: acidic oxide, turns lime water milky (CaCO₃), dry ice **sublimes**.',
      'CO₂ is prepared from CaCO₃ + 2HCl; collected by downward delivery (heavier than air) or water displacement.',
      'Carbon-12 defines the atomic mass scale (¹²C = 12 exactly). Four valence electrons → four covalent bonds; backbone of all organic compounds.',
      'Carbonates: Na₂CO₃ (Solvay process), NaHCO₃ (decomposes on heating), CaCO₃ → CaO + CO₂ on strong heating.',
    ],
    ja: [
      '**同素体**：ダイヤモンド（共有結合の結晶、最硬、絶縁体）、黒鉛（層状、軟らかい、自由電子で**電気を通す**）、フラーレン C₆₀、カーボンナノチューブ、グラフェン。無定形炭素：木炭、カーボンブラック。',
      'CO：無色・**有毒**・還元剤（溶鉱炉：Fe₂O₃ + 3CO → 2Fe + 3CO₂）。CO₂：酸性酸化物、石灰水を白濁（CaCO₃）、ドライアイスは**昇華**。',
      'CO₂ は CaCO₃ + 2HCl で発生。空気より重いので下方置換（または水上置換）。',
      '¹²C = 12 が原子量の基準。価電子4個 → 共有結合4本。有機化合物の骨格。',
      '炭酸塩：Na₂CO₃（アンモニアソーダ法）、NaHCO₃（加熱で分解）、CaCO₃ → CaO + CO₂（強熱）。',
    ],
  },
  7: {
    ions: { en: 'oxidation states −3 (NH₃) to +5 (HNO₃); NH₄⁺, NO₃⁻', ja: '酸化数 −3（NH₃）〜 +5（HNO₃）；NH₄⁺、NO₃⁻' },
    en: [
      'N₂: 78% of air, triple bond N≡N → very **unreactive**. Isolated by fractional distillation of liquid air.',
      '**NH₃**: weak base, very soluble (fountain experiment), pungent; lab prep 2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃ + 2H₂O, dried with **soda lime (not CaCl₂, not conc. H₂SO₄)**, collected by upward delivery. White smoke with HCl (NH₄Cl).',
      'Haber–Bosch: N₂ + 3H₂ ⇌ 2NH₃ (Fe catalyst, ~400–600 °C, high pressure). Exothermic → low temperature and high pressure favour NH₃ (Le Chatelier).',
      'Oxides: **NO** colourless (Cu + dilute HNO₃), insoluble, turns brown in air; **NO₂** red-brown (Cu + conc. HNO₃), soluble; 2NO₂ ⇌ N₂O₄ (colour deepens on heating).',
      'HNO₃: Ostwald process (NH₃ → NO (Pt) → NO₂ → HNO₃). Conc. HNO₃ is a strong oxidiser but **passivates Fe, Al, Ni** (不動態). All nitrates are soluble.',
    ],
    ja: [
      'N₂：空気の78%、三重結合 N≡N で非常に**反応しにくい**。液体空気の分留で得る。',
      '**NH₃**：弱塩基、水に極めてよく溶ける（噴水実験）、刺激臭。製法 2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃ + 2H₂O、乾燥剤は**ソーダ石灰（CaCl₂・濃硫酸は不可）**、上方置換。HCl と白煙（NH₄Cl）。',
      'ハーバー・ボッシュ法：N₂ + 3H₂ ⇌ 2NH₃（Fe触媒、約400〜600 ℃、高圧）。発熱反応 → 低温・高圧が有利（ルシャトリエ）。',
      '酸化物：**NO** 無色（Cu + 希硝酸）、水に溶けにくく空気中で褐色に；**NO₂** 赤褐色（Cu + 濃硝酸）、水に溶ける；2NO₂ ⇌ N₂O₄（加熱で色が濃くなる）。',
      'HNO₃：オストワルト法（NH₃ → NO（Pt）→ NO₂ → HNO₃）。濃硝酸は強い酸化剤だが **Fe・Al・Ni は不動態**になる。硝酸塩はすべて水に溶ける。',
    ],
  },
  8: {
    ions: { en: 'O²⁻; oxidation number −2 (peroxides −1, OF₂ +2)', ja: 'O²⁻；酸化数 −2（過酸化物 −1、OF₂ +2）' },
    en: [
      'Most abundant element in the Earth’s crust; ~21% of air. **Allotropes**: O₂ and ozone **O₃** (pale blue, toxic, strong oxidiser, turns moist KI–starch paper blue-purple; formed by UV or electric discharge).',
      'Lab prep: 2H₂O₂ → 2H₂O + O₂ with **MnO₂ catalyst**, or 2KClO₃ → 2KCl + 3O₂ (MnO₂, heat). Collected by water displacement.',
      'Oxidation number is −2 in almost all compounds; exceptions: **peroxides (H₂O₂, Na₂O₂: −1)** and OF₂ (+2).',
      'Oxides: basic (Na₂O, CaO), acidic (CO₂, SO₂, P₄O₁₀), amphoteric (Al₂O₃, ZnO). Across period 3 oxides go basic → amphoteric → acidic.',
      'H₂O: bent (104.5°), hydrogen-bonded → high b.p.; ice is **less dense** than liquid water.',
    ],
    ja: [
      '地殻中で最も多い元素。空気の約21%。**同素体**：O₂ とオゾン **O₃**（淡青色、有毒、強い酸化剤、湿ったヨウ化カリウムデンプン紙を青紫色に；紫外線や放電で生成）。',
      '製法：2H₂O₂ → 2H₂O + O₂（**MnO₂ 触媒**）、または 2KClO₃ → 2KCl + 3O₂（MnO₂、加熱）。水上置換。',
      '酸化数はほとんど −2。例外：**過酸化物（H₂O₂, Na₂O₂：−1）**、OF₂（+2）。',
      '酸化物：塩基性（Na₂O, CaO）、酸性（CO₂, SO₂, P₄O₁₀）、両性（Al₂O₃, ZnO）。第3周期では 塩基性 → 両性 → 酸性 と変化。',
      'H₂O：折れ線形（104.5°）、水素結合で沸点が高い。氷は液体の水より**密度が小さい**。',
    ],
  },
  9: {
    ions: { en: 'F⁻', ja: 'F⁻' },
    en: [
      '**Most electronegative** element (4.0). F₂ is the strongest oxidising agent: it even oxidises water (2F₂ + 2H₂O → 4HF + O₂) — other halogens do not.',
      'HF is a **weak acid** (the exception among HF, HCl, HBr, HI) because of the strong H–F bond and hydrogen bonding, yet it **dissolves glass**: SiO₂ + 6HF → H₂SiF₆ + 2H₂O. Stored in polyethylene bottles.',
      'Prepared as CaF₂ + H₂SO₄ → CaSO₄ + 2HF. Fluorite CaF₂, PTFE (Teflon), toothpaste fluoride.',
      'Halogen trend: oxidising power F₂ > Cl₂ > Br₂ > I₂; colour and b.p. increase down the group (F₂ pale yellow gas … I₂ purple-black solid).',
    ],
    ja: [
      '**電気陰性度が最大**（4.0）。F₂ は最強の酸化剤で水さえ酸化する（2F₂ + 2H₂O → 4HF + O₂）。他のハロゲンはしない。',
      'HF は**弱酸**（HF・HCl・HBr・HI の中で唯一）。H–F 結合が強く水素結合するため。しかし**ガラスを溶かす**：SiO₂ + 6HF → H₂SiF₆ + 2H₂O。ポリエチレン容器に保存。',
      '製法 CaF₂ + H₂SO₄ → CaSO₄ + 2HF。ホタル石 CaF₂、テフロン、歯磨きのフッ化物。',
      'ハロゲンの傾向：酸化力 F₂ > Cl₂ > Br₂ > I₂。色は濃く、沸点は高くなる（F₂ 淡黄色の気体 … I₂ 黒紫色の固体）。',
    ],
  },
  10: {
    en: [
      'Noble gas, 8 valence electrons (taken as 0). Neon signs glow red-orange.',
      'Isoelectronic series (10 electrons): O²⁻ > F⁻ > Ne > Na⁺ > Mg²⁺ > Al³⁺ in **ionic radius** — same electrons, more protons pull harder. Classic EJU question.',
    ],
    ja: [
      '貴ガス。最外殻電子8個（価電子は0）。ネオンサインは赤橙色に光る。',
      '同じ電子配置（電子10個）のイオン半径：O²⁻ > F⁻ > Ne > Na⁺ > Mg²⁺ > Al³⁺。電子数が同じなら陽子が多いほど小さい。EJU頻出。',
    ],
  },
  11: {
    ions: { en: 'Na⁺', ja: 'Na⁺' },
    flame: { en: 'yellow', ja: '黄' },
    en: [
      'Alkali metal, flame test **yellow**. Soft (cut with a knife), stored in **kerosene**; reacts vigorously with water: 2Na + 2H₂O → 2NaOH + H₂. Made by electrolysis of molten NaCl.',
      '**NaOH**: strong base, **deliquescent**, absorbs CO₂ from air (→ Na₂CO₃). Industrial prep: electrolysis of NaCl(aq) by the **ion-exchange membrane method** (cathode H₂ + NaOH, anode Cl₂).',
      '**Solvay (ammonia-soda) process** for Na₂CO₃: NaCl + NH₃ + CO₂ + H₂O → NaHCO₃↓ + NH₄Cl; 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂. Na₂CO₃·10H₂O **effloresces**.',
      'NaHCO₃ (baking soda) decomposes on heating and reacts with acids to give CO₂. NaCl: rock salt structure, Na⁺ and Cl⁻ each surrounded by 6 ions.',
      'Almost all sodium salts are **soluble** — Na⁺ never forms a precipitate in qualitative analysis.',
    ],
    ja: [
      'アルカリ金属。炎色反応は**黄**。軟らかく（ナイフで切れる）**石油中**に保存。水と激しく反応：2Na + 2H₂O → 2NaOH + H₂。NaCl の溶融塩電解で製造。',
      '**NaOH**：強塩基、**潮解性**、空気中の CO₂ を吸収（→ Na₂CO₃）。工業的製法：NaCl水溶液の**イオン交換膜法**電解（陰極 H₂ + NaOH、陽極 Cl₂）。',
      '**アンモニアソーダ法（ソルベー法）**：NaCl + NH₃ + CO₂ + H₂O → NaHCO₃↓ + NH₄Cl、2NaHCO₃ → Na₂CO₃ + H₂O + CO₂。Na₂CO₃·10H₂O は**風解**する。',
      'NaHCO₃（重曹）は加熱で分解、酸と反応して CO₂。NaCl は岩塩型構造で Na⁺・Cl⁻ とも6配位。',
      'ナトリウム塩はほぼすべて**水に溶ける**。Na⁺ は沈殿をつくらない。',
    ],
  },
  12: {
    ions: { en: 'Mg²⁺', ja: 'Mg²⁺' },
    en: [
      'Burns with a **brilliant white light**: 2Mg + O₂ → 2MgO. Reacts with **hot water/steam** (not cold) and with dilute acids to give H₂.',
      'Like Be: **no flame colour**; Mg(OH)₂ only slightly soluble; MgSO₄ soluble. Ca, Sr, Ba behave differently — a favourite “which is the odd one out?” question.',
      'Mg²⁺ is the central ion of **chlorophyll**. Mg is a light structural metal (alloys) and reacts with CO₂ when burning (2Mg + CO₂ → 2MgO + C).',
    ],
    ja: [
      '**強い白色光**を出して燃える：2Mg + O₂ → 2MgO。**熱水**（冷水は×）や希酸と反応して H₂ を発生。',
      'Be と同様に**炎色反応なし**。Mg(OH)₂ は水に溶けにくく、MgSO₄ は溶ける。Ca・Sr・Ba とは逆。「仲間はずれ」問題の定番。',
      'Mg²⁺ は**クロロフィル**の中心イオン。軽い構造材（合金）。燃焼中は CO₂ とも反応（2Mg + CO₂ → 2MgO + C）。',
    ],
  },
  13: {
    ions: { en: 'Al³⁺, [Al(OH)₄]⁻', ja: 'Al³⁺、[Al(OH)₄]⁻' },
    en: [
      '**Amphoteric** metal: reacts with acids (2Al + 6HCl → 2AlCl₃ + 3H₂) **and** with strong bases (2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂). Al₂O₃ and Al(OH)₃ are amphoteric too. Remember the amphoteric four: **Al, Zn, Sn, Pb**.',
      'Al(OH)₃: white gelatinous precipitate with a little NaOH or NH₃; dissolves in **excess NaOH** (→ [Al(OH)₄]⁻) but **not** in excess NH₃.',
      'Forms a **passive film** in conc. HNO₃ (no reaction). Protective oxide layer in air → “alumite”. Thermite: 2Al + Fe₂O₃ → Al₂O₃ + 2Fe (very exothermic).',
      'Production: bauxite → **Bayer process** → pure Al₂O₃ → **Hall–Héroult** molten-salt electrolysis with **cryolite Na₃AlF₆** (lowers m.p.); carbon anode is consumed (CO/CO₂). Cannot be made by electrolysing an aqueous solution (H₂ forms instead). Recycling uses ~3% of that energy.',
      'Alum KAl(SO₄)₂·12H₂O (double salt, acidic solution). Duralumin (Al–Cu–Mg) alloy. Most abundant metal in the crust.',
    ],
    ja: [
      '**両性金属**：酸（2Al + 6HCl → 2AlCl₃ + 3H₂）とも強塩基（2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂）とも反応。Al₂O₃・Al(OH)₃ も両性。両性元素は **Al・Zn・Sn・Pb**（あ・あ・す・ん）。',
      'Al(OH)₃：少量の NaOH や NH₃ で白色ゲル状沈殿。**過剰の NaOH に溶ける**（→ [Al(OH)₄]⁻）が、過剰の NH₃ には**溶けない**。',
      '濃硝酸中で**不動態**（反応しない）。空気中で緻密な酸化被膜 → アルマイト。テルミット反応：2Al + Fe₂O₃ → Al₂O₃ + 2Fe（激しい発熱）。',
      '製法：ボーキサイト → **バイヤー法** → 純粋な Al₂O₃ → **氷晶石 Na₃AlF₆** を加えて**溶融塩電解**（ホール・エルー法）。炭素陽極は消耗（CO/CO₂）。水溶液の電解では H₂ が出て Al は得られない。リサイクルの電力は約3%。',
      'ミョウバン KAl(SO₄)₂·12H₂O（複塩、水溶液は酸性）。ジュラルミン（Al–Cu–Mg）。地殻中で最も多い金属元素。',
    ],
  },
  14: {
    en: [
      'Metalloid; **second most abundant** element in the crust (after O). Diamond-type covalent network crystal; a **semiconductor** (solar cells, chips).',
      '**SiO₂** (quartz, silica sand): giant covalent network, very high m.p., acidic oxide that is insoluble in water and acids **except HF**.',
      'SiO₂ + 2NaOH → Na₂SiO₃ + H₂O; boiling Na₂SiO₃ with water gives **water glass**; adding HCl gives silicic acid → dried to **silica gel** (desiccant).',
      'Si is made by reducing silica with carbon: SiO₂ + 2C → Si + 2CO. Silicones (organosilicon polymers), optical fibres, glass, ceramics.',
    ],
    ja: [
      '半金属。地殻中で O に次いで**2番目に多い**元素。ダイヤモンド型の共有結合結晶。**半導体**（太陽電池、IC）。',
      '**SiO₂**（石英・ケイ砂）：共有結合の結晶で融点が非常に高い。酸性酸化物だが水や酸に溶けない（**HF のみ**溶かす）。',
      'SiO₂ + 2NaOH → Na₂SiO₃ + H₂O。Na₂SiO₃ を水と加熱すると**水ガラス**。塩酸を加えるとケイ酸 → 乾燥して**シリカゲル**（乾燥剤）。',
      'Si はケイ砂を炭素で還元：SiO₂ + 2C → Si + 2CO。シリコーン、光ファイバー、ガラス、セラミックス。',
    ],
  },
  15: {
    ions: { en: 'PO₄³⁻; oxidation states −3 (PH₃) to +5 (H₃PO₄)', ja: 'PO₄³⁻；酸化数 −3（PH₃）〜 +5（H₃PO₄）' },
    en: [
      '**Allotropes**: white (yellow) phosphorus P₄ — waxy, **toxic**, ignites spontaneously in air so it is **stored under water**, soluble in CS₂; red phosphorus — stable, non-toxic, used in match strikers. Both burn to P₄O₁₀.',
      '**P₄O₁₀** (tetraphosphorus decaoxide): white powder, extremely hygroscopic **desiccant**; with water → **H₃PO₄** (phosphoric acid, medium-strength triprotic acid, not an oxidiser).',
      'Phosphate fertilisers (superphosphate from Ca₃(PO₄)₂ + H₂SO₄). In biology: ATP, DNA backbone, bones (calcium phosphate).',
    ],
    ja: [
      '**同素体**：黄リン P₄（ろう状、**猛毒**、空気中で自然発火するため**水中保存**、CS₂ に溶ける）、赤リン（安定、無毒、マッチの側薬）。どちらも燃えて P₄O₁₀。',
      '**十酸化四リン P₄O₁₀**：白色粉末、吸湿性が極めて強い**乾燥剤**。水と反応して **H₃PO₄**（リン酸、中程度の強さの三価の酸、酸化力なし）。',
      'リン酸肥料（過リン酸石灰：Ca₃(PO₄)₂ + H₂SO₄）。生物では ATP、DNA、骨（リン酸カルシウム）。',
    ],
  },
  16: {
    ions: { en: 'S²⁻, SO₄²⁻; oxidation states −2, 0, +4, +6', ja: 'S²⁻、SO₄²⁻；酸化数 −2、0、+4、+6' },
    en: [
      '**Allotropes**: rhombic (斜方) sulfur (stable at room temp), monoclinic (単斜) sulfur (above 96 °C), and plastic/rubbery sulfur (quench molten S). Rhombic and monoclinic are S₈ rings.',
      '**H₂S**: rotten-egg smell, toxic, weak acid, **reducing agent** (2H₂S + SO₂ → 3S + 2H₂O). Precipitates metal sulfides: **CuS, PbS, Ag₂S black; ZnS white; CdS yellow; MnS pale pink**. Cu²⁺/Pb²⁺ precipitate even in acid; Zn²⁺ only in neutral/basic solution.',
      '**SO₂**: colourless, pungent, toxic, acidic oxide, usually a **reducing agent** (bleaches flowers, decolourises KMnO₄) but acts as an oxidiser toward H₂S. Made from Cu + hot conc. H₂SO₄ or NaHSO₃ + H₂SO₄.',
      '**Contact process**: S → SO₂ → SO₃ (**V₂O₅ catalyst**) → absorbed in conc. H₂SO₄ (oleum) → diluted to H₂SO₄.',
      '**Conc. H₂SO₄**: non-volatile, hygroscopic (drying agent), **dehydrating** (sugar → carbon), **oxidising when hot** (Cu + 2H₂SO₄ → CuSO₄ + SO₂ + 2H₂O). Dilute H₂SO₄: strong diprotic acid. Always add **acid to water** when diluting. Test for SO₄²⁻: **BaSO₄** white precipitate, insoluble in acid.',
    ],
    ja: [
      '**同素体**：斜方硫黄（常温で安定）、単斜硫黄（96 ℃以上）、ゴム状硫黄（融解した硫黄を急冷）。斜方・単斜は S₈ の環状分子。',
      '**H₂S**：腐卵臭、有毒、弱酸、**還元剤**（2H₂S + SO₂ → 3S + 2H₂O）。金属硫化物の沈殿：**CuS・PbS・Ag₂S 黒、ZnS 白、CdS 黄、MnS 淡赤**。Cu²⁺・Pb²⁺ は酸性でも沈殿、Zn²⁺ は中性〜塩基性でのみ沈殿。',
      '**SO₂**：無色、刺激臭、有毒、酸性酸化物。ふつう**還元剤**（花を漂白、KMnO₄ を脱色）だが H₂S に対しては酸化剤。Cu + 熱濃硫酸、または NaHSO₃ + H₂SO₄ で発生。',
      '**接触法**：S → SO₂ → SO₃（**V₂O₅ 触媒**）→ 濃硫酸に吸収（発煙硫酸）→ 希釈して H₂SO₄。',
      '**濃硫酸**：不揮発性、吸湿性（乾燥剤）、**脱水作用**（砂糖 → 炭）、**熱すると酸化作用**（Cu + 2H₂SO₄ → CuSO₄ + SO₂ + 2H₂O）。希硫酸は強い二価の酸。希釈は**水に酸を加える**。SO₄²⁻ の検出：**BaSO₄** 白色沈殿（酸に溶けない）。',
    ],
  },
  17: {
    ions: { en: 'Cl⁻, ClO⁻; oxidation states −1 to +7', ja: 'Cl⁻、ClO⁻；酸化数 −1 〜 +7' },
    en: [
      '**Cl₂**: yellow-green, poisonous, heavier than air. Lab prep: MnO₂ + 4HCl(conc.) → MnCl₂ + Cl₂ + 2H₂O (heat); pass through **water (removes HCl) then conc. H₂SO₄ (dries)** — in that order; collect by **downward delivery**. Also from bleaching powder + HCl, or by electrolysis of NaCl(aq).',
      'Cl₂ + H₂O ⇌ HCl + **HClO** (hypochlorous acid): oxidising → **bleaching and disinfecting**. Bleaching powder CaCl(ClO)·H₂O. Oxoacid strength: HClO < HClO₂ < HClO₃ < HClO₄ (more O → stronger).',
      '**HCl**: strong acid; the gas is made from NaCl + conc. H₂SO₄ (heat) and gives **white smoke with NH₃** (NH₄Cl). Test for Cl⁻: **AgCl** white precipitate, dissolves in NH₃(aq) as [Ag(NH₃)₂]⁺, darkens in light.',
      'Reactivity: Cl₂ displaces Br⁻ and I⁻ (Cl₂ + 2KBr → 2KCl + Br₂) but not F⁻. Atomic mass 35.5 = average of ³⁵Cl : ³⁷Cl ≈ 3 : 1.',
      'Chlorine chemistry in industry: PVC, HCl, NaClO (household bleach) from Cl₂ + NaOH.',
    ],
    ja: [
      '**Cl₂**：黄緑色、有毒、空気より重い。製法 MnO₂ + 4HCl（濃）→ MnCl₂ + Cl₂ + 2H₂O（加熱）。**水（HCl を除く）→ 濃硫酸（乾燥）**の順に通し、**下方置換**で捕集。さらし粉 + HCl や NaCl 水溶液の電解でも得られる。',
      'Cl₂ + H₂O ⇌ HCl + **HClO**（次亜塩素酸）：酸化作用 → **漂白・殺菌**。さらし粉 CaCl(ClO)·H₂O。オキソ酸の強さ HClO < HClO₂ < HClO₃ < HClO₄（O が多いほど強い）。',
      '**HCl**：強酸。気体は NaCl + 濃硫酸（加熱）で発生し、**NH₃ と白煙**（NH₄Cl）。Cl⁻ の検出：**AgCl** 白色沈殿。NH₃ 水に [Ag(NH₃)₂]⁺ として溶け、光で黒くなる（感光性）。',
      '反応性：Cl₂ は Br⁻・I⁻ を追い出す（Cl₂ + 2KBr → 2KCl + Br₂）が F⁻ は追い出せない。原子量 35.5 は ³⁵Cl : ³⁷Cl ≈ 3 : 1 の平均。',
      '工業：塩化ビニル樹脂、塩酸、Cl₂ + NaOH → NaClO（家庭用漂白剤）。',
    ],
  },
  18: {
    en: [
      'Noble gas; the **third most abundant gas in air** (~0.93%, more than CO₂). Used as an inert shield in light bulbs and welding.',
      'Ar, K⁺, Ca²⁺, Cl⁻, S²⁻ are isoelectronic (18 electrons). Note the “inversion”: Ar (Z=18, 39.95) is placed **before** K (Z=19, 39.10) — the table is ordered by atomic number, not mass.',
    ],
    ja: [
      '貴ガス。空気中で**3番目に多い気体**（約0.93%、CO₂ より多い）。電球の封入ガスや溶接の保護ガス。',
      'Ar・K⁺・Ca²⁺・Cl⁻・S²⁻ は同じ電子配置（電子18個）。Ar（Z=18、39.95）は K（Z=19、39.10）より**前**に置かれる＝周期表は原子量でなく原子番号順。',
    ],
  },
  19: {
    ions: { en: 'K⁺', ja: 'K⁺' },
    flame: { en: 'purple (view through cobalt glass)', ja: '赤紫（コバルトガラス越しに見る）' },
    en: [
      'Alkali metal, flame test **purple/violet** (masked by sodium’s yellow → look through cobalt-blue glass). More reactive than Na; floats and ignites on water. Stored in kerosene.',
      '**KMnO₄**: strong oxidiser; in acid MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O (**purple → colourless**) — used as its own indicator in redox titrations. **K₂Cr₂O₇**: oxidiser, orange → green (Cr³⁺).',
      'KI: source of I⁻; KI–starch paper detects oxidisers (Cl₂, O₃). KClO₃ + MnO₂ → O₂. KNO₃ (saltpetre) in gunpowder. K is one of the three fertiliser elements (N, P, K).',
    ],
    ja: [
      'アルカリ金属。炎色反応は**赤紫**（Na の黄色に隠れるのでコバルトガラス越しに観察）。Na より反応性が高く、水に浮いて発火。石油中に保存。',
      '**KMnO₄**：強い酸化剤。酸性で MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O（**赤紫 → 無色**）。酸化還元滴定では自身が指示薬。**K₂Cr₂O₇**：酸化剤、橙赤 → 緑（Cr³⁺）。',
      'KI：I⁻ の供給源。ヨウ化カリウムデンプン紙は酸化剤（Cl₂, O₃）の検出。KClO₃ + MnO₂ → O₂。KNO₃（硝石）は火薬。K は肥料の三要素（N・P・K）の一つ。',
    ],
  },
  20: {
    ions: { en: 'Ca²⁺', ja: 'Ca²⁺' },
    flame: { en: 'orange-red', ja: '橙赤' },
    en: [
      'Alkaline-earth metal, flame test **orange-red**. Reacts with **cold water**: Ca + 2H₂O → Ca(OH)₂ + H₂.',
      '**CaO** (quicklime) + H₂O → **Ca(OH)₂** (slaked lime), strongly exothermic. Ca(OH)₂ is a strong base, slightly soluble → **lime water**: turns milky with CO₂ (CaCO₃), then **clears with excess CO₂** (Ca(HCO₃)₂ — the cause of stalactites and hard water).',
      '**CaCO₃** (limestone, marble, shells, eggshells): CaCO₃ → CaO + CO₂ on strong heating; with HCl gives CO₂. CaSO₄·2H₂O gypsum → heat → CaSO₄·½H₂O **plaster of Paris** (sets by re-hydrating).',
      '**CaCl₂**: deliquescent desiccant (but not for NH₃, which it absorbs). Bleaching powder CaCl(ClO)·H₂O. CaC₂ + 2H₂O → **C₂H₂** + Ca(OH)₂ (acetylene).',
      'Cations from Ca down give flame colours and **insoluble sulfates and carbonates** (CaSO₄ slightly, BaSO₄ very insoluble); hydroxide solubility increases Ca < Sr < Ba.',
    ],
    ja: [
      'アルカリ土類金属。炎色反応は**橙赤**。**冷水**と反応：Ca + 2H₂O → Ca(OH)₂ + H₂。',
      '**CaO**（生石灰）+ H₂O → **Ca(OH)₂**（消石灰）、激しく発熱。Ca(OH)₂ は強塩基、少し溶けて**石灰水**：CO₂ で白濁（CaCO₃）、**さらに CO₂ を通すと透明に**（Ca(HCO₃)₂、鍾乳洞・硬水の原因）。',
      '**CaCO₃**（石灰石・大理石・貝殻・卵の殻）：強熱で CaCO₃ → CaO + CO₂。塩酸で CO₂。CaSO₄·2H₂O セッコウ → 加熱 → CaSO₄·½H₂O **焼きセッコウ**（水を加えると固まる）。',
      '**CaCl₂**：潮解性の乾燥剤（NH₃ は吸収してしまうので不可）。さらし粉 CaCl(ClO)·H₂O。CaC₂ + 2H₂O → **C₂H₂** + Ca(OH)₂（アセチレン）。',
      'Ca 以下は炎色反応を示し、**硫酸塩・炭酸塩が水に溶けにくい**（CaSO₄ は少し、BaSO₄ はほぼ不溶）。水酸化物の溶解度は Ca < Sr < Ba。',
    ],
  },
  22: {
    en: [
      'Light, strong, corrosion-resistant metal (aircraft, implants). **TiO₂**: white pigment and **photocatalyst** (self-cleaning surfaces).',
    ],
    ja: ['軽くて強く、腐食しにくい金属（航空機、インプラント）。**TiO₂**：白色顔料、**光触媒**（セルフクリーニング）。'],
  },
  23: {
    en: ['**V₂O₅** is the catalyst for SO₂ → SO₃ in the **contact process** for sulfuric acid.'],
    ja: ['**V₂O₅** は硫酸の**接触法**（SO₂ → SO₃）の触媒。'],
  },
  24: {
    ions: { en: 'Cr³⁺ (green), CrO₄²⁻ (yellow), Cr₂O₇²⁻ (orange)', ja: 'Cr³⁺（緑）、CrO₄²⁻（黄）、Cr₂O₇²⁻（橙赤）' },
    en: [
      '**Cr₂O₇²⁻ (orange, acidic) ⇌ CrO₄²⁻ (yellow, basic)**: 2CrO₄²⁻ + 2H⁺ ⇌ Cr₂O₇²⁻ + H₂O. K₂Cr₂O₇ is an oxidiser in acid: Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ (green) + 7H₂O.',
      'Chromate precipitates: **PbCrO₄ yellow, BaCrO₄ yellow, Ag₂CrO₄ red-brown**. Cr(OH)₃ is amphoteric.',
      'Forms a passive oxide film → chrome plating and **stainless steel** (Fe–Cr–Ni). Electron configuration exception: [Ar]3d⁵4s¹.',
    ],
    ja: [
      '**Cr₂O₇²⁻（橙赤、酸性）⇌ CrO₄²⁻（黄、塩基性）**：2CrO₄²⁻ + 2H⁺ ⇌ Cr₂O₇²⁻ + H₂O。K₂Cr₂O₇ は酸性で酸化剤：Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺（緑）+ 7H₂O。',
      'クロム酸塩の沈殿：**PbCrO₄ 黄、BaCrO₄ 黄、Ag₂CrO₄ 赤褐**。Cr(OH)₃ は両性。',
      '不動態の被膜 → クロムめっき、**ステンレス鋼**（Fe–Cr–Ni）。電子配置の例外：[Ar]3d⁵4s¹。',
    ],
  },
  25: {
    ions: { en: 'Mn²⁺ (pale pink/colourless), MnO₄⁻ (purple), MnO₂ (+4)', ja: 'Mn²⁺（淡赤〜無色）、MnO₄⁻（赤紫）、MnO₂（+4）' },
    en: [
      '**MnO₂**: black solid, **catalyst** for H₂O₂ → O₂ and KClO₃ → O₂; **oxidiser** with conc. HCl → Cl₂; cathode material in dry cells.',
      '**KMnO₄**: strong oxidiser. Acidic: MnO₄⁻ → Mn²⁺ (purple → almost colourless, 5e⁻). Neutral/basic: MnO₄⁻ → MnO₂ (brown precipitate, 3e⁻). Used in redox titrations (no indicator needed).',
      'MnS: **pale pink** sulfide precipitate (basic solution only). Manganese in steel alloys.',
    ],
    ja: [
      '**MnO₂**：黒色固体。H₂O₂ → O₂、KClO₃ → O₂ の**触媒**。濃塩酸に対しては**酸化剤**（→ Cl₂）。乾電池の正極材料。',
      '**KMnO₄**：強い酸化剤。酸性：MnO₄⁻ → Mn²⁺（赤紫 → ほぼ無色、5e⁻）。中性〜塩基性：MnO₄⁻ → MnO₂（褐色沈殿、3e⁻）。酸化還元滴定（指示薬不要）。',
      'MnS：**淡赤色**の硫化物沈殿（塩基性でのみ）。鋼の合金元素。',
    ],
  },
  26: {
    ions: { en: 'Fe²⁺ (pale green), Fe³⁺ (yellow-brown)', ja: 'Fe²⁺（淡緑）、Fe³⁺（黄褐）' },
    en: [
      '**Blast furnace**: Fe₂O₃ + 3CO → 2Fe + 3CO₂ (coke gives CO; limestone removes SiO₂ as slag). Product is **pig iron** (~4% C, brittle) → converter (O₂ blown in) → **steel** (<2% C).',
      '**Ion tests**: Fe²⁺ + K₃[Fe(CN)₆] → **dark blue** (Turnbull’s blue); Fe³⁺ + K₄[Fe(CN)₆] → **dark blue** (Prussian blue); Fe³⁺ + KSCN → **blood-red** solution. Fe(OH)₂ green-white → oxidises in air to Fe(OH)₃ **red-brown**.',
      'Fe²⁺ is a **reducing agent** (→ Fe³⁺ with Cl₂, KMnO₄, H₂O₂); Fe³⁺ is an **oxidiser** (2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂). Oxidation states +2 and +3; Fe₃O₄ contains both.',
      'Reacts with dilute acids (H₂) and steam (Fe₃O₄ + H₂), but is **passivated** by conc. HNO₃. Rusts in moist air; protected by **zinc plating (galvanised, sacrificial)** — tin plate rusts faster once scratched.',
      'Catalyst for the **Haber–Bosch** process. Haemoglobin contains Fe²⁺. Most-produced metal.',
    ],
    ja: [
      '**溶鉱炉**：Fe₂O₃ + 3CO → 2Fe + 3CO₂（コークスから CO、石灰石が SiO₂ をスラグとして除く）。得られるのは**銑鉄**（C 約4%、もろい）→ 転炉（O₂ 吹き込み）→ **鋼**（C 2%以下）。',
      '**イオンの検出**：Fe²⁺ + K₃[Fe(CN)₆] → **濃青色**（ターンブル青）；Fe³⁺ + K₄[Fe(CN)₆] → **濃青色**（プルシアン青）；Fe³⁺ + KSCN → **血赤色**溶液。Fe(OH)₂ 緑白色 → 空気中で酸化されて Fe(OH)₃ **赤褐色**。',
      'Fe²⁺ は還元剤（Cl₂・KMnO₄・H₂O₂ で Fe³⁺ に）。Fe³⁺ は酸化剤（2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂）。酸化数 +2・+3。Fe₃O₄ は両方を含む。',
      '希酸（H₂）や高温の水蒸気（Fe₃O₄ + H₂）と反応するが、濃硝酸では**不動態**。湿った空気でさびる。**亜鉛めっき（トタン、犠牲防食）**で保護。ブリキ（Sn）は傷つくとかえって早くさびる。',
      '**ハーバー・ボッシュ法**の触媒。ヘモグロビンは Fe²⁺ を含む。生産量最大の金属。',
    ],
  },
  27: {
    ions: { en: 'Co²⁺ (pink hydrated)', ja: 'Co²⁺（水和物は桃色）' },
    en: [
      '**CoCl₂**: blue when anhydrous, **pink when hydrated** — used as a moisture indicator (cobalt chloride paper, blue silica gel).',
      'Vitamin B₁₂ contains Co. Cobalt in alloys and Li-ion battery cathodes.',
    ],
    ja: [
      '**CoCl₂**：無水物は青色、**水和すると赤（桃）色** — 塩化コバルト紙や青色シリカゲルの水分検出に使用。',
      'ビタミン B₁₂ に含まれる。合金、リチウムイオン電池の正極。',
    ],
  },
  28: {
    ions: { en: 'Ni²⁺ (green)', ja: 'Ni²⁺（緑）' },
    en: [
      '**Passivated** by conc. HNO₃ (with Fe, Al). Catalyst for **hydrogenation of oils** (unsaturated fats → hardened fat/margarine).',
      'Ni²⁺ solutions are green. Ni–Cd and Ni–MH rechargeable batteries; stainless steel; coins (cupronickel).',
    ],
    ja: [
      '濃硝酸で**不動態**（Fe・Al と同様）。**油脂の水素添加**（不飽和脂肪 → 硬化油／マーガリン）の触媒。',
      'Ni²⁺ 水溶液は緑色。ニッケル・カドミウム電池、ニッケル水素電池、ステンレス鋼、白銅貨。',
    ],
  },
  29: {
    ions: { en: 'Cu⁺ (Cu₂O red), Cu²⁺ (blue in water)', ja: 'Cu⁺（Cu₂O 赤）、Cu²⁺（水溶液は青）' },
    flame: { en: 'blue-green', ja: '青緑' },
    en: [
      'Reddish metal; **second-best conductor** after Ag. Flame test **blue-green**. Below H in the ionisation series → **no H₂ with HCl or dilute H₂SO₄**; dissolves only in oxidising acids: dilute HNO₃ → **NO**, conc. HNO₃ → **NO₂**, hot conc. H₂SO₄ → **SO₂**.',
      '**Cu²⁺ tests**: blue solution; + NaOH or a little NH₃ → **Cu(OH)₂ blue precipitate** → heated → **CuO black**; + excess NH₃ → **[Cu(NH₃)₄]²⁺ deep blue** (dissolves). + H₂S → **CuS black** even in acid. CuSO₄·5H₂O blue → anhydrous CuSO₄ **white** (test for water).',
      '**Cu₂O** red precipitate = positive **Fehling test** for aldehydes/reducing sugars. Cu(I) is +1, Cu(II) +2.',
      '**Electrolytic refining**: crude Cu anode, pure Cu cathode, CuSO₄ electrolyte; less noble metals (Zn, Fe, Ni) dissolve, nobler ones (Ag, Au) fall as **anode mud**. Cu²⁺ + 2e⁻ → Cu at the cathode (Daniell cell, electroplating).',
      'Alloys: **brass** (Cu–Zn), **bronze** (Cu–Sn), cupronickel (Cu–Ni). Green patina (verdigris) in moist air. Electron configuration exception: [Ar]3d¹⁰4s¹.',
    ],
    ja: [
      '赤色の金属。電気伝導性は Ag に次いで**2位**。炎色反応は**青緑**。イオン化傾向は H より小さい → **塩酸・希硫酸とは反応しない**。酸化力のある酸のみに溶ける：希硝酸 → **NO**、濃硝酸 → **NO₂**、熱濃硫酸 → **SO₂**。',
      '**Cu²⁺ の検出**：青色溶液。+ NaOH または少量の NH₃ → **Cu(OH)₂ 青白色沈殿** → 加熱 → **CuO 黒色**。+ 過剰の NH₃ → **[Cu(NH₃)₄]²⁺ 深青色**（溶ける）。+ H₂S → **CuS 黒色**（酸性でも沈殿）。CuSO₄·5H₂O 青 → 無水物 **白**（水の検出）。',
      '**Cu₂O** 赤色沈殿 = **フェーリング反応**陽性（アルデヒド・還元糖）。Cu(I) は +1、Cu(II) は +2。',
      '**電解精錬**：粗銅を陽極、純銅を陰極、CuSO₄ 水溶液。イオン化傾向の大きい Zn・Fe・Ni は溶け、小さい Ag・Au は**陽極泥**として沈む。陰極で Cu²⁺ + 2e⁻ → Cu（ダニエル電池、めっき）。',
      '合金：**黄銅（真鍮）** Cu–Zn、**青銅** Cu–Sn、白銅 Cu–Ni。湿った空気で緑青。電子配置の例外：[Ar]3d¹⁰4s¹。',
    ],
  },
  30: {
    ions: { en: 'Zn²⁺ (colourless), [Zn(OH)₄]²⁻, [Zn(NH₃)₄]²⁺', ja: 'Zn²⁺（無色）、[Zn(OH)₄]²⁻、[Zn(NH₃)₄]²⁺' },
    en: [
      '**Group 12 → a typical (main-group) element in the Japanese curriculum**, not a transition element (transition = groups 3–11). Zn²⁺ is **colourless** (full 3d¹⁰), unlike most transition ions.',
      '**Amphoteric**: Zn, ZnO and Zn(OH)₂ all dissolve in acids **and** strong bases: Zn + 2NaOH + 2H₂O → Na₂[Zn(OH)₄] + H₂. Zn(OH)₂ white precipitate dissolves in **excess NaOH** and in **excess NH₃** ([Zn(NH₃)₄]²⁺) — unlike Al(OH)₃, which does not dissolve in NH₃.',
      'Zn + dilute acid → **H₂** (standard lab H₂ preparation). **ZnS white** precipitate (neutral/basic only).',
      'Negative electrode of the **Daniell cell** and **dry cell**. **Galvanised iron** (トタン): Zn corrodes first and protects Fe even when scratched (Zn is above Fe in the ionisation series).',
      'Brass (Cu–Zn). ZnO white pigment and amphoteric oxide.',
    ],
    ja: [
      '**12族 → 日本の課程では典型元素**（遷移元素は3〜11族）。Zn²⁺ は 3d¹⁰ で**無色**（多くの遷移元素イオンと異なる）。',
      '**両性**：Zn・ZnO・Zn(OH)₂ はいずれも酸にも強塩基にも溶ける：Zn + 2NaOH + 2H₂O → Na₂[Zn(OH)₄] + H₂。Zn(OH)₂ 白色沈殿は**過剰の NaOH** にも**過剰の NH₃**（[Zn(NH₃)₄]²⁺）にも溶ける。Al(OH)₃ は NH₃ に溶けない点が違い。',
      'Zn + 希酸 → **H₂**（H₂ の標準的な製法）。**ZnS 白色**沈殿（中性〜塩基性のみ）。',
      '**ダニエル電池**・**乾電池**の負極。**トタン**（亜鉛めっき鋼板）：Zn が先に酸化されて Fe を守る（傷がついても有効。Zn は Fe よりイオン化傾向が大きい）。',
      '黄銅（Cu–Zn）。ZnO は白色顔料で両性酸化物。',
    ],
  },
  31: {
    en: ['Melts at ~30 °C (in your hand). **GaN** blue LED (2014 Nobel Prize, Japanese researchers); GaAs semiconductors.'],
    ja: ['融点約30 ℃（手のひらで融ける）。**GaN** 青色 LED（2014年ノーベル賞、日本人研究者）；GaAs 半導体。'],
  },
  32: {
    en: ['Metalloid semiconductor in group 14 (like Si). Predicted by Mendeleev as “eka-silicon” — proof of the periodic law.'],
    ja: ['14族の半金属半導体（Si と同様）。メンデレーエフが「エカケイ素」として予言 → 周期律の証明。'],
  },
  33: {
    en: ['Metalloid, group 15 (below P). Arsenic compounds (As₂O₃) are **poisonous**; famous in forensic chemistry.'],
    ja: ['15族（P の下）の半金属。ヒ素化合物（As₂O₃）は**猛毒**。'],
  },
  34: {
    en: ['Group 16 (below S). Photoconductive → old photocopiers and solar cells. Essential trace element.'],
    ja: ['16族（S の下）。光伝導性 → 複写機、太陽電池。必須微量元素。'],
  },
  35: {
    ions: { en: 'Br⁻', ja: 'Br⁻' },
    en: [
      '**Br₂**: red-brown, **the only liquid nonmetal** at room temperature (Hg is the only liquid metal). Heavy, volatile, toxic vapour.',
      '**Bromine water test**: C=C double bonds decolourise Br₂ (addition reaction) — the standard test for unsaturation (alkenes, oils).',
      'Halogen order: Cl₂ + 2Br⁻ → Br₂ + 2Cl⁻, and Br₂ + 2I⁻ → I₂ + 2Br⁻. **AgBr pale yellow** precipitate (photographic film, partly dissolves in NH₃). HBr is a strong acid.',
    ],
    ja: [
      '**Br₂**：赤褐色、常温で**唯一の液体の非金属**（液体の金属は Hg のみ）。重く揮発性で有毒な蒸気。',
      '**臭素水の反応**：C=C 二重結合が Br₂ を脱色（付加反応）— 不飽和結合（アルケン、油脂）の検出。',
      'ハロゲンの順序：Cl₂ + 2Br⁻ → Br₂ + 2Cl⁻、Br₂ + 2I⁻ → I₂ + 2Br⁻。**AgBr 淡黄色**沈殿（写真フィルム、NH₃ 水に少し溶ける）。HBr は強酸。',
    ],
  },
  36: {
    en: ['Noble gas; a few compounds (KrF₂) exist. Used in some lamps. Group 18 trend: b.p. rises down the group as dispersion forces grow.'],
    ja: ['貴ガス。KrF₂ など少数の化合物が存在。ランプに使用。18族の傾向：分散力が大きくなるので沸点は下にいくほど高い。'],
  },
  37: {
    ions: { en: 'Rb⁺', ja: 'Rb⁺' },
    flame: { en: 'dark red', ja: '深赤' },
    en: ['Alkali metal, flame test dark red. Very reactive (ignites in air). Atomic clocks.'],
    ja: ['アルカリ金属。炎色反応は深赤。非常に反応性が高い（空気中で発火）。原子時計。'],
  },
  38: {
    ions: { en: 'Sr²⁺', ja: 'Sr²⁺' },
    flame: { en: 'crimson red', ja: '紅（深赤）' },
    en: ['Alkaline-earth metal, flame test **crimson** → red fireworks. SrSO₄ and SrCO₃ insoluble. ⁹⁰Sr is a fission product that mimics Ca in bones.'],
    ja: ['アルカリ土類金属。炎色反応は**紅（深赤）**→ 赤い花火。SrSO₄・SrCO₃ は水に溶けにくい。⁹⁰Sr は核分裂生成物で Ca と似て骨に蓄積。'],
  },
  47: {
    ions: { en: 'Ag⁺', ja: 'Ag⁺' },
    en: [
      '**Best electrical and thermal conductor** of all metals. Below H in the ionisation series: no reaction with HCl; dissolves in HNO₃ (→ NO/NO₂) and hot conc. H₂SO₄.',
      '**Halide precipitates**: AgCl **white** (dissolves in NH₃(aq) → [Ag(NH₃)₂]⁺, and in Na₂S₂O₃), AgBr **pale yellow** (partly soluble in NH₃), AgI **yellow** (insoluble in NH₃). All are **photosensitive** (→ Ag, darken) — photographic film. AgF is soluble.',
      'Ag⁺ + OH⁻ → **Ag₂O brown** precipitate (AgOH is unstable); dissolves in excess NH₃ → [Ag(NH₃)₂]⁺ (linear complex) = **Tollens’ reagent** → **silver mirror** with aldehydes. Ag₂CrO₄ red-brown, Ag₂S black (tarnish from H₂S).',
      'Anode mud in copper refining contains Ag and Au. Silver-oxide button cells; antibacterial Ag⁺.',
    ],
    ja: [
      '金属中で**電気・熱伝導性が最大**。イオン化傾向は H より小さく塩酸とは反応しない。硝酸（→ NO/NO₂）や熱濃硫酸には溶ける。',
      '**ハロゲン化銀の沈殿**：AgCl **白**（NH₃ 水に溶けて [Ag(NH₃)₂]⁺、Na₂S₂O₃ にも溶ける）、AgBr **淡黄**（NH₃ 水に少し溶ける）、AgI **黄**（NH₃ 水に溶けない）。いずれも**感光性**（→ Ag、黒変）→ 写真フィルム。AgF は水に溶ける。',
      'Ag⁺ + OH⁻ → **Ag₂O 褐色**沈殿（AgOH は不安定）。過剰の NH₃ に溶けて [Ag(NH₃)₂]⁺（直線形錯イオン）= **アンモニア性硝酸銀（トレンス試薬）** → アルデヒドで**銀鏡反応**。Ag₂CrO₄ 赤褐、Ag₂S 黒（H₂S による黒ずみ）。',
      '銅の電解精錬の陽極泥に Ag・Au が含まれる。酸化銀電池、Ag⁺ の抗菌作用。',
    ],
  },
  48: {
    ions: { en: 'Cd²⁺', ja: 'Cd²⁺' },
    en: ['Group 12 (typical element, like Zn). **CdS yellow** sulfide precipitate. Ni–Cd batteries. Toxic — cause of *itai-itai* disease in Japan.'],
    ja: ['12族（Zn と同じく典型元素）。**CdS 黄色**の硫化物沈殿。ニッケル・カドミウム電池。有毒 — イタイイタイ病の原因。'],
  },
  50: {
    ions: { en: 'Sn²⁺ (reducing agent), Sn⁴⁺', ja: 'Sn²⁺（還元剤）、Sn⁴⁺' },
    en: [
      '**Amphoteric** (Al, Zn, Sn, Pb). Sn²⁺ is a **reducing agent** (SnCl₂ reduces Fe³⁺, Hg²⁺). Between Ni and Pb in the ionisation series (above H).',
      '**Tin plate** (ブリキ): Sn coating on Fe. Sn is *below* Fe in the ionisation series, so once scratched the **iron corrodes faster** — contrast with galvanised (Zn) iron.',
      'Alloys: bronze (Cu–Sn), solder (Sn–Pb, now Sn–Ag–Cu). Allotropes: white tin ⇌ grey tin (“tin pest” in cold).',
    ],
    ja: [
      '**両性**（Al・Zn・Sn・Pb）。Sn²⁺ は**還元剤**（SnCl₂ は Fe³⁺・Hg²⁺ を還元）。イオン化傾向は Ni と Pb の間（H より大きい）。',
      '**ブリキ**：Fe に Sn をめっき。Sn は Fe よりイオン化傾向が小さいので、傷がつくと**鉄が早く腐食**する — トタン（Zn）との対比。',
      '合金：青銅（Cu–Sn）、はんだ（Sn–Pb、現在は Sn–Ag–Cu）。同素体：白色スズ ⇌ 灰色スズ（低温で「スズペスト」）。',
    ],
  },
  53: {
    ions: { en: 'I⁻, I₃⁻', ja: 'I⁻、I₃⁻' },
    en: [
      '**I₂**: purple-black solid that **sublimes** to a violet vapour (purification by sublimation). Barely soluble in water; dissolves in KI(aq) as **I₃⁻** (brown) and in organic solvents (violet in hexane).',
      '**Iodine–starch reaction**: I₂ + starch → **blue-purple** — detects either I₂ or starch. **KI–starch paper** turns blue with oxidisers (Cl₂, O₃, H₂O₂).',
      '**Iodometric titration**: I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆, endpoint when the starch colour vanishes. Weakest halogen oxidiser; HI is the **strongest** hydrohalic acid. **AgI yellow**, insoluble in NH₃.',
      'Thyroid hormone contains iodine; iodine tincture as antiseptic.',
    ],
    ja: [
      '**I₂**：黒紫色の固体で**昇華**して紫色の蒸気（昇華で精製）。水にはほとんど溶けないが KI 水溶液に **I₃⁻**（褐色）として溶け、有機溶媒にも溶ける（ヘキサン中で紫）。',
      '**ヨウ素デンプン反応**：I₂ + デンプン → **青紫色** — I₂ とデンプンのどちらの検出にも使う。**ヨウ化カリウムデンプン紙**は酸化剤（Cl₂・O₃・H₂O₂）で青変。',
      '**ヨウ素滴定**：I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆、デンプンの色が消える点が終点。酸化力はハロゲン中最弱、HI はハロゲン化水素酸中で**最強**の酸。**AgI 黄色**、NH₃ 水に溶けない。',
      '甲状腺ホルモンに含まれる。ヨードチンキ（消毒）。',
    ],
  },
  54: {
    en: ['Noble gas that **does form compounds** (XeF₂, XeF₄, XeO₃) — “inert gas” is not strictly true. Camera flashes, ion engines, anaesthesia.'],
    ja: ['**化合物をつくる**貴ガス（XeF₂・XeF₄・XeO₃）—「不活性気体」は厳密には正しくない。フラッシュ、イオンエンジン、麻酔。'],
  },
  55: {
    ions: { en: 'Cs⁺', ja: 'Cs⁺' },
    flame: { en: 'blue', ja: '青' },
    en: ['Most reactive naturally-occurring metal; **lowest ionisation energy and electronegativity** of stable elements (alkali trends). Flame test blue. Defines the second (atomic clock). ¹³⁷Cs is a fission product.'],
    ja: ['天然に存在する金属で最も反応性が高い。安定元素中で**イオン化エネルギー・電気陰性度が最小**（アルカリ金属の傾向）。炎色反応は青。原子時計（秒の定義）。¹³⁷Cs は核分裂生成物。'],
  },
  56: {
    ions: { en: 'Ba²⁺', ja: 'Ba²⁺' },
    flame: { en: 'yellow-green', ja: '黄緑' },
    en: [
      'Alkaline-earth metal, flame test **yellow-green**. Ba(OH)₂ is a strong, fairly soluble base (baryta water also turns milky with CO₂).',
      '**BaSO₄**: white, extremely insoluble, **insoluble even in acid** → test for SO₄²⁻ and X-ray contrast meal. **BaCO₃** white but dissolves in acid (distinguishes SO₄²⁻ from CO₃²⁻). BaCrO₄ yellow.',
    ],
    ja: [
      'アルカリ土類金属。炎色反応は**黄緑**。Ba(OH)₂ は強塩基でわりと溶ける（バリタ水も CO₂ で白濁）。',
      '**BaSO₄**：白色、極めて溶けにくく**酸にも溶けない** → SO₄²⁻ の検出、X線造影剤。**BaCO₃** は白色だが酸に溶ける（SO₄²⁻ と CO₃²⁻ の区別）。BaCrO₄ 黄色。',
    ],
  },
  60: {
    en: ['**Nd–Fe–B magnets** — the strongest permanent magnets (motors, headphones). Rare-earth element (レアアース).'],
    ja: ['**ネオジム磁石**（Nd–Fe–B）— 最強の永久磁石（モーター、イヤホン）。レアアース。'],
  },
  74: {
    en: ['**Highest melting point** of all metals (3422 °C) → light-bulb filaments, cutting tools (tungsten carbide WC).'],
    ja: ['金属中で**最も融点が高い**（3422 ℃）→ 電球のフィラメント、超硬工具（WC）。'],
  },
  78: {
    en: [
      '**Noble metal**: dissolves only in **aqua regia** (conc. HNO₃ : conc. HCl = 1 : 3). Used as an **inert electrode** in electrolysis and fuel cells.',
      '**Catalyst**: Ostwald process (NH₃ → NO), catalytic converters, hydrogenation. Pt(II) complexes are square planar (cisplatin).',
    ],
    ja: [
      '**貴金属**：**王水**（濃硝酸 : 濃塩酸 = 1 : 3）にのみ溶ける。電気分解や燃料電池の**不活性電極**。',
      '**触媒**：オストワルト法（NH₃ → NO）、自動車の排ガス触媒、水素添加。Pt(II) 錯体は正方形（シスプラチン）。',
    ],
  },
  79: {
    ions: { en: 'Au³⁺ (in aqua regia)', ja: 'Au³⁺（王水中）' },
    en: [
      'Least reactive metal — **smallest ionisation tendency**; does not tarnish; dissolves only in **aqua regia**. Most malleable/ductile (gold leaf).',
      'Found native. Collected in the **anode mud** of copper refining. Gold colloid is red (Tyndall effect). Karat = purity (24 K pure).',
    ],
    ja: [
      '最も反応しにくい金属 — **イオン化傾向が最小**。変色せず、**王水**にのみ溶ける。展性・延性が最大（金箔）。',
      '単体として産出。銅の電解精錬の**陽極泥**から回収。金コロイドは赤色（チンダル現象）。カラット = 純度（24 K が純金）。',
    ],
  },
  80: {
    ions: { en: 'Hg²⁺, Hg₂²⁺', ja: 'Hg²⁺、Hg₂²⁺' },
    en: [
      '**The only metal that is liquid** at room temperature (m.p. −39 °C). Group 12 → typical element. High density; thermometers, barometers (1 atm = 760 mmHg).',
      'Between Cu and Ag in the ionisation series; dissolves in HNO₃. Forms **amalgams** with other metals (dental fillings, historic gold extraction).',
      '**Toxic**: methylmercury caused **Minamata disease** in Japan. HgS red (cinnabar, vermilion pigment); HgCl₂ poison; fluorescent lamps contain Hg vapour.',
    ],
    ja: [
      '常温で**唯一液体の金属**（融点 −39 ℃）。12族 → 典型元素。密度が大きい。温度計、気圧計（1 atm = 760 mmHg）。',
      'イオン化傾向は Cu と Ag の間。硝酸に溶ける。他の金属と**アマルガム**をつくる（歯科充填、昔の金の精錬）。',
      '**有毒**：メチル水銀が**水俣病**の原因。HgS 赤色（辰砂、朱の顔料）；HgCl₂ は猛毒；蛍光灯に水銀蒸気。',
    ],
  },
  82: {
    ions: { en: 'Pb²⁺ (colourless), [Pb(OH)₄]²⁻', ja: 'Pb²⁺（無色）、[Pb(OH)₄]²⁻' },
    en: [
      '**Amphoteric** (Al, Zn, Sn, Pb): Pb(OH)₂ dissolves in excess NaOH → [Pb(OH)₄]²⁻. Pb²⁺ is colourless.',
      '**Precipitates**: PbCl₂ white (**dissolves in hot water** — unusual!), PbSO₄ white, PbS black (even in acid), PbCrO₄ yellow, PbI₂ yellow. Pb²⁺ is in the “HCl group” of qualitative analysis.',
      'Above H in the ionisation series, but **does not dissolve in HCl or H₂SO₄** because insoluble PbCl₂ / PbSO₄ coat the surface; dissolves in HNO₃. Trend exception worth remembering.',
      '**Lead–acid battery**: Pb (−) | H₂SO₄ | PbO₂ (+); both electrodes become PbSO₄ on discharge, and the electrolyte becomes dilute (density drops). Rechargeable.',
      'Soft, dense, toxic (lead poisoning); radiation shielding; solder; formerly in petrol and paint.',
    ],
    ja: [
      '**両性**（Al・Zn・Sn・Pb）：Pb(OH)₂ は過剰の NaOH に溶けて [Pb(OH)₄]²⁻。Pb²⁺ は無色。',
      '**沈殿**：PbCl₂ 白（**熱水に溶ける** — 珍しい！）、PbSO₄ 白、PbS 黒（酸性でも沈殿）、PbCrO₄ 黄、PbI₂ 黄。系統分析では「塩酸で沈殿する族」。',
      'イオン化傾向は H より大きいが、表面に不溶性の PbCl₂・PbSO₄ ができるため**塩酸・硫酸には溶けない**。硝酸には溶ける。傾向の例外として要注意。',
      '**鉛蓄電池**：Pb（負極）| H₂SO₄ | PbO₂（正極）。放電で両極とも PbSO₄ になり、電解液は薄くなる（密度低下）。充電可能（二次電池）。',
      '軟らかく重く有毒（鉛中毒）。放射線遮蔽、はんだ。かつてガソリンや塗料に使用。',
    ],
  },
  86: {
    en: ['Radioactive noble gas from the decay of radium/uranium in rocks; accumulates in basements. Heaviest noble gas with known chemistry.'],
    ja: ['岩石中のラジウム・ウランの壊変で生じる放射性の貴ガス。地下室に蓄積。'],
  },
  88: {
    ions: { en: 'Ra²⁺', ja: 'Ra²⁺' },
    en: ['Radioactive alkaline-earth metal discovered by Marie and Pierre Curie (1898). Behaves like Ba (insoluble sulfate).'],
    ja: ['キュリー夫妻が発見（1898年）した放射性のアルカリ土類金属。Ba に似た性質（硫酸塩は不溶）。'],
  },
  92: {
    en: ['Nuclear fuel: **²³⁵U** (0.7% of natural U) undergoes fission; ²³⁸U is the common isotope. Enrichment separates them. U–Pb dating of rocks. Heaviest naturally abundant element.'],
    ja: ['核燃料：**²³⁵U**（天然の 0.7%）が核分裂。²³⁸U が主な同位体。濃縮で分離。U–Pb 年代測定。天然に多く存在する最も重い元素。'],
  },
  94: {
    en: ['Synthetic (from ²³⁸U + n in reactors). ²³⁹Pu is fissile — nuclear fuel and weapons. Highly radiotoxic.'],
    ja: ['人工元素（原子炉で ²³⁸U + n から生成）。²³⁹Pu は核分裂性 — 核燃料・核兵器。放射性毒性が高い。'],
  },
  113: {
    en: ['**Nihonium** — synthesised at **RIKEN (Japan)** by Kosuke Morita’s group (2004, named 2016): the first element discovered in Asia. Only a few atoms ever made; properties unknown.'],
    ja: ['**ニホニウム** — **理化学研究所（日本）**の森田浩介グループが合成（2004年、命名2016年）。アジアで初めて発見された元素。数原子しか作られておらず性質は不明。'],
  },
};

export const ELEMENTS: ElementData[] = ROWS.map(([z, sym, en, ja, zh, tr, mass, cat, period, group, state, eneg]) => ({
  z,
  sym,
  name: { en, ja, zh, tr },
  mass,
  cat,
  period,
  group,
  state,
  ...(eneg != null ? { en: eneg } : {}),
  ...(NOTES[z] ? { notes: NOTES[z] } : {}),
}));

export const byZ = (z: number): ElementData | undefined => ELEMENTS[z - 1];

/** Elements the EJU actually tends to ask about (have study notes). */
export const isKeyElement = (e: ElementData) => Boolean(e.notes);
