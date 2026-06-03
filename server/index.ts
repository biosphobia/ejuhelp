import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { requireAuth } from './auth';
import { topicsFor, subtopicsFor, mockExamList, mockExam, SUBJECTS, type Subject } from './eju';
import { hasApiKey, ask, generate, check, explainBoard, keypoints } from './claude';

const here = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '16mb' })); 

const isSubject = (s: unknown): s is Subject =>
  typeof s === 'string' && (SUBJECTS as string[]).includes(s);
const LANGS = ['en', 'ja', 'zh', 'tr'] as const;
type Lang = (typeof LANGS)[number];
const toLang = (l: unknown): Lang =>
  typeof l === 'string' && (LANGS as readonly string[]).includes(l) ? (l as Lang) : 'en';

function handleErr(e: any, res: Response) {
  const status = Number.isInteger(e?.status) && e.status >= 400 && e.status < 600 ? e.status : 500;
  const inner = e?.error?.error;
  const code = inner?.type ?? e?.code ?? e?.message ?? 'server_error';
  const message = inner?.message ?? e?.message ?? 'Unexpected server error';
  console.error('[api] error', status, code, '-', message);
  res.status(status).json({ error: code, message, status });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, serverClaudeKey: hasApiKey() });
});

app.post('/api/eju/topics', (req: Request, res: Response) => {
  const { subject, lang } = req.body ?? {};
  if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
  const l = toLang(lang);
  res.json({ topics: topicsFor(subject, l), subtopics: subtopicsFor(subject, l) });
});

// Mock exams (exact past-paper review) — public, no Claude call needed.
app.post('/api/eju/exams', (_req: Request, res: Response) => {
  res.json({ exams: mockExamList() });
});

app.post('/api/eju/exam', (req: Request, res: Response) => {
  const id = req.body?.id;
  const exam = typeof id === 'string' ? mockExam(id, toLang(req.body?.lang)) : null;
  if (!exam) return res.status(404).json({ error: 'not_found' });
  res.json(exam);
});

// Helper to extract BYOK credentials from requests
const getAiContext = (req: Request) => {
  const model = req.body?.model || 'gemini'; 
  const userKey = req.headers['x-user-api-key'] as string | undefined;
  return { model, userKey };
};

app.post('/api/claude/ask', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, messages, context } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });

    const result = await ask({
      subject,
      lang: toLang(lang),
      messages: Array.isArray(messages) ? messages : [],
      context: typeof context === 'string' ? context : undefined,
      model,
      userKey
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, topic, difficulty, count, focus } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    
    const cleanFocus = focus && typeof focus === 'object'
        ? {
            topics: Array.isArray(focus.topics) ? focus.topics.map(String).slice(0, 8) : [],
            tags: Array.isArray(focus.tags) ? focus.tags.map(String).slice(0, 8) : [],
          }
        : undefined;

    const result = await generate({
      subject,
      lang: toLang(lang),
      topic: typeof topic === 'string' && topic ? topic : undefined,
      difficulty: difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium',
      count: Number(count) || 3,
      focus: cleanFocus,
      model,
      userKey
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/check', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, imageDataUrl, question, note, messages } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof imageDataUrl !== 'string') return res.status(400).json({ error: 'missing_image' });

    const result = await check({
      subject,
      lang: toLang(lang),
      imageDataUrl,
      question: typeof question === 'string' ? question : undefined,
      note: typeof note === 'string' ? note : undefined,
      messages: Array.isArray(messages) ? messages : undefined,
      model,
      userKey
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/explain', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, imageDataUrl, question, note, messages } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof imageDataUrl !== 'string') return res.status(400).json({ error: 'missing_image' });

    const result = await explainBoard({
      subject,
      lang: toLang(lang),
      imageDataUrl,
      question: typeof question === 'string' ? question : undefined,
      note: typeof note === 'string' ? note : undefined,
      messages: Array.isArray(messages) ? messages : undefined,
      model,
      userKey
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/keypoints', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, topic } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    
    const result = await keypoints({
      subject,
      lang: toLang(lang),
      topic: typeof topic === 'string' && topic ? topic : undefined,
      model,
      userKey
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

const distDir = join(here, '..', 'dist');
const servingDist = existsSync(join(distDir, 'index.html'));
if (servingDist) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(distDir, 'index.html')));
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[eju] API listening on :${port}${servingDist ? ' (also serving dist/)' : ''}`);
});
