// Bilingual UI strings. Add a key here and it is instantly available via useT().
export const strings = {
  appName: { en: 'EJU Study', ja: 'EJU 学習' },

  // Launcher / features
  ask: { en: 'Ask Claude', ja: 'AIに質問' },
  generate: { en: 'Practice questions', ja: '練習問題' },
  notes: { en: 'Key points', ja: '要点ノート' },
  check: { en: 'Check my work', ja: '答案チェック' },
  settings: { en: 'Settings', ja: '設定' },
  account: { en: 'Account', ja: 'アカウント' },
  menu: { en: 'Menu', ja: 'メニュー' },

  // Subjects
  physics: { en: 'Physics', ja: '物理' },
  chemistry: { en: 'Chemistry', ja: '化学' },
  biology: { en: 'Biology', ja: '生物' },
  math: { en: 'Mathematics', ja: '数学' },
  subject: { en: 'Subject', ja: '科目' },

  // Toolbar
  pen: { en: 'Pen', ja: 'ペン' },
  eraser: { en: 'Eraser', ja: '消しゴム' },
  undo: { en: 'Undo', ja: '元に戻す' },
  clearPage: { en: 'Clear page', ja: 'ページを消去' },
  addPage: { en: 'Add page', ja: 'ページ追加' },
  deletePage: { en: 'Delete page', ja: 'ページ削除' },
  resetView: { en: 'Reset zoom', ja: 'ズーム初期化' },
  pageOf: { en: 'Page {n} / {total}', ja: 'ページ {n} / {total}' },

  // Common
  close: { en: 'Close', ja: '閉じる' },
  send: { en: 'Send', ja: '送信' },
  loading: { en: 'Thinking…', ja: '考え中…' },
  error: { en: 'Something went wrong', ja: 'エラーが発生しました' },
  retry: { en: 'Retry', ja: '再試行' },
  cancel: { en: 'Cancel', ja: 'キャンセル' },

  // Language
  language: { en: 'Language', ja: '言語' },
  english: { en: 'English', ja: 'English' },
  japanese: { en: '日本語', ja: '日本語' },

  // Auth
  signInGoogle: { en: 'Sign in with Google', ja: 'Googleでログイン' },
  signOut: { en: 'Sign out', ja: 'ログアウト' },
  signedInAs: { en: 'Signed in as', ja: 'ログイン中：' },
  notSignedIn: { en: 'Not signed in', ja: '未ログイン' },
  syncOn: { en: 'Your notes sync to the cloud.', ja: 'ノートはクラウドに同期されます。' },
  syncOff: {
    en: 'Sign in to save your notes to the cloud.',
    ja: 'ログインするとノートがクラウドに保存されます。',
  },
  authNotConfigured: {
    en: 'Google sign-in is not configured yet. Your notes are saved on this device.',
    ja: 'Googleログインは未設定です。ノートはこの端末に保存されます。',
  },

  // Ask
  askTitle: { en: 'Ask Claude', ja: 'AIに質問' },
  askPlaceholder: {
    en: 'Ask anything about this subject…',
    ja: 'この科目について何でも質問…',
  },
  askHint: {
    en: 'Answers are tuned to the EJU syllabus and past-paper style.',
    ja: 'EJUのシラバスと過去問の傾向に沿って回答します。',
  },

  // Generate
  generateTitle: { en: 'EJU-style practice', ja: 'EJU形式の練習問題' },
  topic: { en: 'Topic', ja: '分野' },
  anyTopic: { en: 'Any topic', ja: 'すべての分野' },
  difficulty: { en: 'Difficulty', ja: '難易度' },
  diffEasy: { en: 'Easy', ja: 'やさしい' },
  diffMedium: { en: 'Exam level', ja: '本番レベル' },
  diffHard: { en: 'Challenge', ja: '難しい' },
  count: { en: 'How many', ja: '問題数' },
  generateBtn: { en: 'Generate questions', ja: '問題を作成' },
  newSet: { en: 'New set', ja: '新しい問題' },
  showAnswer: { en: 'Show answer', ja: '解答を表示' },
  hideAnswer: { en: 'Hide answer', ja: '解答を隠す' },
  practiceThis: { en: 'Practice this on the board', ja: 'この問題をボードで解く' },
  activeQuestion: { en: 'Active question', ja: '取り組み中の問題' },
  pinToBoard: { en: 'Pin to board', ja: 'ボードに固定' },
  unpin: { en: 'Unpin', ja: '固定を外す' },
  pinAll: { en: 'Pin all to board', ja: 'すべてボードに固定' },
  explain: { en: 'Explain', ja: '解説' },
  question: { en: 'Question', ja: '問題' },
  clearChat: { en: 'Clear', ja: 'クリア' },
  showAnswerShort: { en: 'Answer', ja: '解答' },
  pinnedHidden: { en: 'Pinned questions hidden', ja: '固定中の問題（非表示）' },

  // Check
  checkTitle: { en: 'Check my work', ja: '答案チェック' },
  checkHint: {
    en: 'Claude reads your current page and checks your reasoning.',
    ja: '現在のページを読み取り、解答の筋道を確認します。',
  },
  captureCheck: { en: 'Read my page & check', ja: 'ページを読んで確認' },
  checking: { en: 'Reading your work…', ja: '答案を読み取り中…' },
  attachedQuestion: {
    en: 'Checking against your active question.',
    ja: '取り組み中の問題と照らし合わせます。',
  },
  noActiveQuestion: {
    en: 'No active question — Claude will just review what you wrote.',
    ja: '取り組み中の問題はありません。書いた内容をそのまま確認します。',
  },

  // Notes
  notesTitle: { en: 'Key points', ja: '要点ノート' },
  notesHint: {
    en: 'High-yield points for the EJU, by topic.',
    ja: 'EJUで頻出の要点を分野別にまとめます。',
  },
  makeNotes: { en: 'Make key-point notes', ja: '要点を作成' },

  // Settings
  settingsTitle: { en: 'Settings', ja: '設定' },
  defaultSubject: { en: 'Default subject', ja: '初期科目' },
  inputMode: { en: 'Drawing input', ja: '描画の入力' },
  fingerDraw: { en: 'Finger draws', ja: '指で描く' },
  pencilOnly: { en: 'Finger navigates', ja: '指で移動' },
  inputHint: {
    en: 'Default: the pen draws, and fingers pan / pinch-to-zoom. Turn on "Finger draws" only if you want to sketch with a fingertip — then use two fingers to navigate.',
    ja: '既定：ペンで描き、指でスクロール・ピンチ拡大。指で描きたい場合のみ「指で描く」をオンに（その場合は2本指で移動）。',
  },

  // Generate — answering + focus
  selectAnswer: { en: 'Tap your answer', ja: '解答をタップ' },
  correctMark: { en: 'Correct!', ja: '正解！' },
  incorrectMark: { en: 'Not quite', ja: '惜しい' },
  correctAnswerLabel: { en: 'Correct answer', ja: '正解' },
  focusWeak: { en: 'Focus on my weak points', ja: '弱点を重点的に' },
  focusWeakHint: {
    en: 'Targets the topics and mistake types you struggle with most.',
    ja: '苦手な分野とミスの傾向を重点的に出題します。',
  },
  noWeakDataShort: { en: 'Answer a few questions first to use this.', ja: 'まず数問解いてください。' },

  // Progress / weak points
  progress: { en: 'Weak points', ja: '弱点' },
  progressTitle: { en: 'Your weak points', ja: 'あなたの弱点' },
  progressHint: {
    en: 'Built from your quiz answers and checked solutions.',
    ja: '練習問題の解答と答案チェックから集計しています。',
  },
  noProgress: {
    en: 'No data yet. Answer practice questions or use "Check my work" to build your profile.',
    ja: 'データがありません。練習問題に答えるか「答案チェック」を使うと作成されます。',
  },
  overallAccuracy: { en: 'Overall accuracy', ja: '総合正答率' },
  byTopic: { en: 'By topic (weakest first)', ja: '分野別（苦手順）' },
  commonMistakes: { en: 'Common mistakes', ja: 'よくあるミス' },
  attemptsLabel: { en: 'attempts', ja: '回' },
  resetProgress: { en: 'Reset stats', ja: '統計をリセット' },
  practiceWeak: { en: 'Practice my weak points', ja: '弱点を練習' },

  // Key points (personal)
  keyPointsHint: {
    en: 'Formulas and facts to remember — auto-collected from your questions to Claude, plus any you generate.',
    ja: '覚えるべき公式・重要事項。AIへの質問から自動収集し、生成したものも追加できます。',
  },
  noKeyPoints: {
    en: 'No key points yet. Ask Claude a question, or add some below.',
    ja: 'まだ要点がありません。AIに質問するか、下から追加してください。',
  },
  addKeyFormulas: { en: 'Add key formulas for this subject', ja: 'この科目の重要公式を追加' },
  addForTopic: { en: 'Add for topic', ja: '分野を指定して追加' },
  clearAll: { en: 'Clear all', ja: 'すべて消去' },
  kindFormula: { en: 'Formula', ja: '公式' },
  kindFact: { en: 'Fact', ja: '重要事項' },
  savedKeyPoints: { en: 'Saved {n} key point(s)', ja: '{n}件の要点を保存しました' },
  saveKeyPoints: { en: 'Save key points', ja: '要点を保存' },

  // Error-type labels
  tagUnits: { en: 'units', ja: '単位' },
  tagSign: { en: 'sign', ja: '符号' },
  tagArithmetic: { en: 'arithmetic', ja: '計算' },
  tagAlgebra: { en: 'algebra', ja: '式変形' },
  tagConcept: { en: 'concept', ja: '概念理解' },
  tagFormula: { en: 'formula', ja: '公式' },
  tagMisread: { en: 'misread', ja: '読み違い' },
  tagIncomplete: { en: 'incomplete', ja: '未完成' },

  // Errors / misc
  needKey: {
    en: 'The Claude backend is not configured (missing API key).',
    ja: 'Claudeバックエンドが未設定です（APIキーがありません）。',
  },
  authBackendErr: {
    en: 'Backend login verification is not set up. Set ALLOW_ANON=true, or add Firebase Admin credentials.',
    ja: 'バックエンドのログイン検証が未設定です。ALLOW_ANON=true にするか、Firebase Admin の認証情報を設定してください。',
  },
  needSignIn: {
    en: 'Please sign in to use the AI features.',
    ja: 'AI機能を使うにはログインしてください。',
  },
  mixedTopics: { en: 'Mixed — all topics', ja: 'ミックス（全分野）' },
  wholeSubject: { en: 'Whole subject', ja: '科目全体' },
  emptyBoard: {
    en: 'Your page looks empty — write your solution first.',
    ja: 'ページが空のようです。まず答案を書いてください。',
  },
} as const;

export type StringKey = keyof typeof strings;
