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
  fingerDraw: { en: 'Finger / Pencil draws', ja: '指・ペンシルで描く' },
  pencilOnly: { en: 'Stylus only (palm rejection)', ja: 'スタイラスのみ（手のひら無視）' },
  inputHint: {
    en: 'On: one finger or any Pencil draws, two fingers pan/zoom — best if your Apple Pencil isn’t detected. Off: only a pressure stylus draws and touches navigate, so you can rest your palm.',
    ja: 'オン：指やペンシルで描き、2本指で移動・拡大。Apple Pencilが認識されない場合に最適。オフ：筆圧スタイラスのみ描画、タッチは移動操作になり手のひらを置けます。',
  },

  // Errors / misc
  needKey: {
    en: 'The Claude backend is not configured (missing API key).',
    ja: 'Claudeバックエンドが未設定です（APIキーがありません）。',
  },
  emptyBoard: {
    en: 'Your page looks empty — write your solution first.',
    ja: 'ページが空のようです。まず答案を書いてください。',
  },
} as const;

export type StringKey = keyof typeof strings;
