import type { Subject } from '../../lib/ui';
import type { SubjectNotes, TreeTopic } from './types';

// The topic tree is small and needed to draw the calendar, so it ships eagerly;
// the note bodies are large and load on demand per subject.
export const TREES: Record<Subject, TreeTopic[]> = {
  physics: [
    {
      id: 'mechanics',
      name: { en: 'Mechanics', ja: '力学' },
      subtopics: [
        { id: 'kinematics', name: { en: 'Description of motion', ja: '運動の表し方' } },
        { id: 'forces', name: { en: 'Various forces', ja: 'いろいろな力' } },
        { id: 'force-equilibrium', name: { en: 'Equilibrium of forces', ja: '力のつり合い' } },
        { id: 'rigid-body', name: { en: 'Rigid bodies and torque', ja: '剛体のつり合い・モーメント' } },
        { id: 'newtons-laws', name: { en: 'Laws of motion', ja: '運動の法則' } },
        { id: 'friction-resistance', name: { en: 'Friction and air resistance', ja: '摩擦・空気抵抗' } },
        { id: 'work-energy', name: { en: 'Work and kinetic energy', ja: '仕事と運動エネルギー' } },
        { id: 'potential-energy', name: { en: 'Potential energy and conservation', ja: '位置エネルギーと保存' } },
        { id: 'momentum-impulse', name: { en: 'Momentum, impulse, collisions', ja: '運動量・力積・衝突' } },
        { id: 'circular-motion', name: { en: 'Uniform circular motion', ja: '等速円運動' } },
        { id: 'inertial-force', name: { en: 'Inertial and centrifugal force', ja: '慣性力・遠心力' } },
        { id: 'shm', name: { en: 'Simple harmonic motion', ja: '単振動' } },
        { id: 'gravitation', name: { en: 'Universal gravitation', ja: '万有引力' } },
      ],
    },
    {
      id: 'thermodynamics',
      name: { en: 'Thermodynamics', ja: '熱力学' },
      subtopics: [
        { id: 'heat-temperature', name: { en: 'Heat and temperature', ja: '熱と温度' } },
        { id: 'states-latent-heat', name: { en: 'States of matter and latent heat', ja: '三態と潜熱' } },
        { id: 'heat-work-laws', name: { en: 'Heat, work and the laws', ja: '熱と仕事・熱力学の法則' } },
        { id: 'ideal-gas', name: { en: 'Ideal gas equation', ja: '理想気体の状態方程式' } },
        { id: 'gas-molecules', name: { en: 'Motion of gas molecules', ja: '気体分子の運動' } },
        { id: 'gas-state-change', name: { en: 'Changes of state of gases', ja: '気体の状態変化' } },
      ],
    },
    {
      id: 'waves',
      name: { en: 'Waves', ja: '波動' },
      subtopics: [
        { id: 'wave-properties', name: { en: 'Properties of waves', ja: '波の性質' } },
        { id: 'wave-superposition', name: { en: 'Superposition and standing waves', ja: '重ね合わせ・定在波' } },
        { id: 'sound', name: { en: 'Sound, strings, air columns', ja: '音波・弦・気柱' } },
        { id: 'doppler', name: { en: 'Doppler effect', ja: 'ドップラー効果' } },
        { id: 'light', name: { en: 'Light: reflection, refraction, lenses', ja: '光：反射・屈折・レンズ' } },
        { id: 'light-interference', name: { en: 'Interference of light', ja: '光の干渉' } },
      ],
    },
    {
      id: 'electromagnetism',
      name: { en: 'Electricity and magnetism', ja: '電気と磁気' },
      subtopics: [
        { id: 'electric-field', name: { en: 'Electrostatic force and field', ja: '静電気力と電場' } },
        { id: 'electric-potential', name: { en: 'Electric potential', ja: '電位' } },
        { id: 'conductors-dielectrics', name: { en: 'Matter in electric fields', ja: '電場中の物質' } },
        { id: 'capacitors', name: { en: 'Capacitors', ja: 'コンデンサー' } },
        { id: 'dc-circuits', name: { en: 'DC circuits', ja: '直流回路' } },
        { id: 'semiconductors', name: { en: 'Semiconductors', ja: '半導体' } },
        { id: 'magnetic-field', name: { en: 'Magnetic fields from currents', ja: '電流がつくる磁場' } },
        { id: 'magnetic-force', name: { en: 'Magnetic force and Lorentz force', ja: '電流が受ける力・ローレンツ力' } },
        { id: 'em-induction', name: { en: 'Electromagnetic induction', ja: '電磁誘導' } },
        { id: 'ac-circuits', name: { en: 'AC and electromagnetic waves', ja: '交流と電磁波' } },
      ],
    },
    {
      id: 'atomic-physics',
      name: { en: 'Atoms', ja: '原子' },
      subtopics: [
        { id: 'electrons-light', name: { en: 'Electrons and wave–particle duality', ja: '電子と二重性' } },
        { id: 'atoms-nuclei', name: { en: 'Atoms and nuclei', ja: '原子と原子核' } },
        { id: 'elementary-particles', name: { en: 'Elementary particles', ja: '素粒子' } },
      ],
    },
  ],
  chemistry: [
    {
      id: 'matter-structure',
      name: { en: 'Structure of matter', ja: '物質の構成' },
      subtopics: [
        { id: 'pure-mixtures', name: { en: 'Pure substances, mixtures, separation', ja: '純物質・混合物・分離' } },
        { id: 'atomic-structure', name: { en: 'Atomic structure', ja: '原子の構造' } },
        { id: 'electron-config-periodic', name: { en: 'Electron configuration and periodic law', ja: '電子配置と周期律' } },
        { id: 'chemical-bonds', name: { en: 'Chemical bonds and crystals', ja: '化学結合と結晶' } },
        { id: 'mole-formulas', name: { en: 'Amount of substance and formulas', ja: '物質量と化学式' } },
      ],
    },
    {
      id: 'states-and-change',
      name: { en: 'State and change of substances', ja: '物質の状態と変化' },
      subtopics: [
        { id: 'stoichiometry', name: { en: 'Reactions and stoichiometry', ja: '化学反応と量的関係' } },
        { id: 'acids-bases', name: { en: 'Acids and bases', ja: '酸と塩基' } },
        { id: 'redox', name: { en: 'Oxidation and reduction', ja: '酸化還元' } },
        { id: 'states-equilibria', name: { en: 'States, gases and solutions', ja: '状態・気体・溶液' } },
        { id: 'solid-structure', name: { en: 'Structure of solids', ja: '固体の構造' } },
        { id: 'thermochemistry', name: { en: 'Thermochemistry', ja: '反応と熱' } },
        { id: 'cells-electrolysis', name: { en: 'Cells and electrolysis', ja: '電池と電気分解' } },
        { id: 'rate-equilibrium', name: { en: 'Reaction rate and equilibrium', ja: '反応速度と化学平衡' } },
      ],
    },
    {
      id: 'inorganic',
      name: { en: 'Inorganic chemistry', ja: '無機化学' },
      subtopics: [
        { id: 'typical-elements', name: { en: 'Typical (main-group) elements', ja: '典型元素' } },
        { id: 'transition-elements', name: { en: 'Transition elements', ja: '遷移元素' } },
        { id: 'gas-prep-industry', name: { en: 'Gas preparation and industry', ja: '気体の製法と工業的製法' } },
        { id: 'ion-analysis', name: { en: 'Separation of metal ions', ja: '金属イオンの分離・分析' } },
      ],
    },
    {
      id: 'organic',
      name: { en: 'Organic chemistry', ja: '有機化学' },
      subtopics: [
        { id: 'aliphatic-hydrocarbons', name: { en: 'Hydrocarbons and isomers', ja: '脂肪族炭化水素と異性体' } },
        { id: 'functional-groups', name: { en: 'Functional groups', ja: '官能基化合物' } },
        { id: 'aromatic', name: { en: 'Aromatic compounds', ja: '芳香族化合物' } },
        { id: 'biomolecules', name: { en: 'Sugars, amino acids, proteins', ja: '糖・アミノ酸・タンパク質' } },
        { id: 'polymers', name: { en: 'Polymers', ja: '高分子化合物' } },
      ],
    },
  ],
  biology: [
    {
      id: 'cell-biology',
      name: { en: 'Cells and molecules of life', ja: '細胞と生命の分子' },
      subtopics: [
        { id: 'cell-structure', name: { en: 'Cell structure and organelles', ja: '細胞の構造' } },
        { id: 'biomolecules-proteins', name: { en: 'Proteins, enzymes and ATP', ja: 'タンパク質・酵素・ATP' } },
      ],
    },
    {
      id: 'metabolism',
      name: { en: 'Metabolism', ja: '代謝' },
      subtopics: [
        { id: 'respiration', name: { en: 'Respiration', ja: '呼吸' } },
        { id: 'photosynthesis', name: { en: 'Photosynthesis', ja: '光合成' } },
        { id: 'nitrogen-metabolism', name: { en: 'Nitrogen assimilation and fixation', ja: '窒素同化・窒素固定' } },
      ],
    },
    {
      id: 'genetics-molecular',
      name: { en: 'Genetics and molecular genetics', ja: '遺伝と分子遺伝学' },
      subtopics: [
        { id: 'dna-replication', name: { en: 'DNA structure and replication', ja: 'DNAの構造と複製' } },
        { id: 'transcription-translation', name: { en: 'Transcription and translation', ja: '転写・翻訳' } },
        { id: 'genetic-engineering', name: { en: 'Genetic engineering and PCR', ja: '遺伝子工学・PCR' } },
        { id: 'mendelian-linkage', name: { en: 'Inheritance, linkage, recombination', ja: '遺伝・連鎖・組換え' } },
        { id: 'mutation', name: { en: 'Gene mutation', ja: '遺伝子突然変異' } },
      ],
    },
    {
      id: 'reproduction-development',
      name: { en: 'Reproduction and development', ja: '生殖と発生' },
      subtopics: [
        { id: 'meiosis-gametogenesis', name: { en: 'Meiosis and gametes', ja: '減数分裂と配偶子形成' } },
        { id: 'fertilization-plants', name: { en: 'Plant reproduction', ja: '植物の生殖・重複受精' } },
        { id: 'animal-development', name: { en: 'Animal development', ja: '動物の発生' } },
      ],
    },
    {
      id: 'homeostasis',
      name: { en: 'Homeostasis', ja: '体内環境の維持' },
      subtopics: [
        { id: 'circulation-blood', name: { en: 'Circulation and blood', ja: '循環・血液' } },
        { id: 'excretion-liver', name: { en: 'Kidney, liver, excretion', ja: '腎臓・肝臓・排出' } },
        { id: 'endocrine-bloodsugar', name: { en: 'Hormones and blood sugar', ja: '内分泌と血糖調節' } },
        { id: 'autonomic-thermoregulation', name: { en: 'Autonomic nerves and temperature', ja: '自律神経と体温調節' } },
        { id: 'immunity', name: { en: 'Immunity', ja: '免疫' } },
      ],
    },
    {
      id: 'nervous-sensory-muscle',
      name: { en: 'Nerves, senses and muscle', ja: '神経・感覚・筋肉' },
      subtopics: [
        { id: 'neuron-brain', name: { en: 'Neurons, brain, reflexes', ja: 'ニューロン・脳・反射' } },
        { id: 'sensory-organs', name: { en: 'Eye and ear', ja: '眼・耳' } },
        { id: 'muscle-contraction', name: { en: 'Muscle contraction', ja: '筋収縮' } },
      ],
    },
    {
      id: 'plant-physiology',
      name: { en: 'Plants and animal behaviour', ja: '植物生理と動物の行動' },
      subtopics: [
        { id: 'plant-hormones', name: { en: 'Plant hormones and tropisms', ja: '植物ホルモンと屈性' } },
        { id: 'photoperiodism', name: { en: 'Photoperiodism and flowering', ja: '光周性と花芽形成' } },
        { id: 'animal-behavior', name: { en: 'Animal behaviour and learning', ja: '動物の行動と学習' } },
      ],
    },
    {
      id: 'ecology',
      name: { en: 'Ecology', ja: '生態' },
      subtopics: [
        { id: 'populations', name: { en: 'Populations and species interactions', ja: '個体群と種間関係' } },
        { id: 'ecosystem-energy', name: { en: 'Ecosystems and energy flow', ja: '生態系とエネルギーの流れ' } },
      ],
    },
    {
      id: 'evolution-phylogeny',
      name: { en: 'Evolution and phylogeny', ja: '進化と系統' },
      subtopics: [
        { id: 'evolution-mechanisms', name: { en: 'Mechanisms of evolution', ja: '進化のしくみ' } },
        { id: 'phylogeny-classification', name: { en: 'Phylogeny and classification', ja: '系統と分類' } },
      ],
    },
  ],
  math: [
    {
      id: 'numbers-expressions',
      name: { en: 'Numbers and expressions', ja: '数と式' },
      subtopics: [
        { id: 'expansion-factoring', name: { en: 'Expansion and factorisation', ja: '展開と因数分解' } },
        { id: 'real-numbers', name: { en: 'Real numbers, roots, absolute value', ja: '実数・平方根・絶対値' } },
        { id: 'equations-inequalities', name: { en: 'Equations and inequalities', ja: '方程式と不等式' } },
        { id: 'sets-logic', name: { en: 'Sets and logic', ja: '集合と命題' } },
      ],
    },
    {
      id: 'quadratic-functions',
      name: { en: 'Quadratic functions', ja: '二次関数' },
      subtopics: [
        { id: 'quadratic-graphs', name: { en: 'Graphs, vertex, maximum and minimum', ja: 'グラフ・頂点・最大最小' } },
        { id: 'quadratic-inequalities', name: { en: 'Quadratic inequalities and root positions', ja: '2次不等式・解の配置' } },
      ],
    },
    {
      id: 'geometry-trig',
      name: { en: 'Figures and measurement', ja: '図形と計量・図形の性質' },
      subtopics: [
        { id: 'trig-ratios', name: { en: 'Trigonometric ratios', ja: '三角比' } },
        { id: 'sine-cosine-rules', name: { en: 'Sine rule, cosine rule, area', ja: '正弦定理・余弦定理・面積' } },
        { id: 'plane-geometry', name: { en: 'Properties of figures', ja: '図形の性質' } },
      ],
    },
    {
      id: 'counting-probability',
      name: { en: 'Counting and probability', ja: '場合の数と確率' },
      subtopics: [
        { id: 'counting', name: { en: 'Permutations and combinations', ja: '順列・組合せ' } },
        { id: 'probability', name: { en: 'Probability', ja: '確率' } },
      ],
    },
    {
      id: 'integers',
      name: { en: 'Integers', ja: '整数の性質' },
      subtopics: [
        { id: 'divisors-gcd', name: { en: 'Divisors, multiples, Euclidean algorithm', ja: '約数・倍数・互除法' } },
        { id: 'diophantine-bases', name: { en: 'Linear Diophantine equations, number bases', ja: '不定方程式・n進法' } },
      ],
    },
    {
      id: 'expressions-proofs',
      name: { en: 'Expressions and proofs', ja: 'いろいろな式' },
      subtopics: [
        { id: 'binomial-division', name: { en: 'Binomial theorem, polynomial division', ja: '二項定理・整式の割り算' } },
        { id: 'identities-proofs', name: { en: 'Identities and proving inequalities', ja: '恒等式・不等式の証明' } },
        { id: 'complex-numbers', name: { en: 'Complex numbers, roots and coefficients', ja: '複素数・解と係数の関係' } },
        { id: 'higher-equations', name: { en: 'Remainder theorem, higher-degree equations', ja: '剰余定理・高次方程式' } },
      ],
    },
    {
      id: 'coordinate-geometry',
      name: { en: 'Figures and equations', ja: '図形と方程式' },
      subtopics: [
        { id: 'points-lines', name: { en: 'Points and lines', ja: '点と直線' } },
        { id: 'circles', name: { en: 'Circles', ja: '円の方程式' } },
        { id: 'loci-regions', name: { en: 'Loci and regions', ja: '軌跡と領域' } },
      ],
    },
    {
      id: 'trig-functions',
      name: { en: 'Trigonometric functions', ja: '三角関数' },
      subtopics: [
        { id: 'trig-general-graphs', name: { en: 'General angles, radians, graphs', ja: '一般角・弧度法・グラフ' } },
        { id: 'addition-formulas', name: { en: 'Addition formulas and applications', ja: '加法定理とその応用' } },
      ],
    },
    {
      id: 'exp-log',
      name: { en: 'Exponential and logarithmic functions', ja: '指数関数・対数関数' },
      subtopics: [
        { id: 'exponentials', name: { en: 'Exponents and exponential functions', ja: '指数と指数関数' } },
        { id: 'logarithms', name: { en: 'Logarithms', ja: '対数と対数関数' } },
      ],
    },
    {
      id: 'calculus',
      name: { en: 'Differentiation and integration', ja: '微分・積分' },
      subtopics: [
        { id: 'differentiation', name: { en: 'Differentiation', ja: '微分法' } },
        { id: 'integration', name: { en: 'Integration', ja: '積分法' } },
      ],
    },
    {
      id: 'sequences',
      name: { en: 'Sequences', ja: '数列' },
      subtopics: [
        { id: 'arithmetic-geometric', name: { en: 'Arithmetic and geometric sequences, sums', ja: '等差数列・等比数列・和' } },
        { id: 'recurrence-induction', name: { en: 'Recurrence relations and induction', ja: '漸化式・数学的帰納法' } },
      ],
    },
    {
      id: 'vectors',
      name: { en: 'Vectors', ja: 'ベクトル' },
      subtopics: [
        { id: 'vectors-plane', name: { en: 'Plane vectors', ja: '平面ベクトル' } },
        { id: 'vectors-space', name: { en: 'Space vectors', ja: '空間ベクトル' } },
      ],
    },
  ],
};

const loaders: Partial<Record<Subject, () => Promise<{ default: SubjectNotes }>>> = {
  physics: () => import('./physics'),
  chemistry: () => import('./chemistry'),
  biology: () => import('./biology'),
  math: () => import('./math'),
};

const cache = new Map<Subject, Promise<SubjectNotes | null>>();

/** Load the notes for a subject (code-split; cached). Null when the subject has no notes yet. */
export function loadNotes(subject: Subject): Promise<SubjectNotes | null> {
  if (!cache.has(subject)) {
    const l = loaders[subject];
    cache.set(subject, l ? l().then((m) => m.default) : Promise.resolve(null));
  }
  return cache.get(subject)!;
}

export function allSubtopicIds(subject: Subject): string[] {
  return TREES[subject].flatMap((t) => t.subtopics.map((s) => s.id));
}

export function findSubtopic(subject: Subject, id: string) {
  for (const t of TREES[subject]) {
    const s = t.subtopics.find((x) => x.id === id);
    if (s) return { topic: t, sub: s };
  }
  return null;
}
