import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { requireAuth } from './auth';
import { topicsFor, subtopicsFor, SUBJECTS, type Subject } from './eju';
import { hasApiKey, ask, generate, check, keypoints } from './claude';

const here = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '16mb' })); // whiteboard PNGs can be a few MB

const isSubject = (s: unknown): s is Subject =>
  typeof s === 'string' && (SUBJECTS as string[]).includes(s);
const toLang = (l: unknown): 'en' | 'ja' => (l === 'ja' ? 'ja' : 'en');

function handleErr(e: any, res: Response) {
  const status = Number.isInteger(e?.status) && e.status >= 400 && e.status < 600 ? e.status : 500;
  console.error('[api] error', status, e?.message ?? e);
  res.status(status).json({ error: e?.error?.type ?? e?.message ?? 'server_error' });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, apiKey: hasApiKey() });
});

// Topic + subtopic list for a subject (no API key needed).
app.post('/api/eju/topics', (req: Request, res: Response) => {
  const { subject, lang } = req.body ?? {};
  if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
  const l = toLang(lang);
  res.json({ topics: topicsFor(subject, l), subtopics: subtopicsFor(subject, l) });
});

// All Claude routes require a logged-in user (or anon in dev) AND a configured API key.
const guardKey = (_req: Request, res: Response, next: NextFunction) =>
  hasApiKey() ? next() : res.status(503).json({ error: 'no_api_key' });

app.post('/api/claude/ask', requireAuth, guardKey, async (req: Request, res: Response) => {
  try {
    const { subject, lang, messages } = req.body ?? {};
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    const result = await ask({
      subject,
      lang: toLang(lang),
      messages: Array.isArray(messages) ? messages : [],
    });
    res.json(result); // { text, keyPoints }
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/generate', requireAuth, guardKey, async (req: Request, res: Response) => {
  try {
    const { subject, lang, topic, difficulty, count, focus } = req.body ?? {};
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    const cleanFocus =
      focus && typeof focus === 'object'
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
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/check', requireAuth, guardKey, async (req: Request, res: Response) => {
  try {
    const { subject, lang, imageDataUrl, question } = req.body ?? {};
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof imageDataUrl !== 'string') return res.status(400).json({ error: 'missing_image' });
    const result = await check({
      subject,
      lang: toLang(lang),
      imageDataUrl,
      question: typeof question === 'string' ? question : undefined,
    });
    res.json(result); // { feedback, correct, topic, errorTags }
  } catch (e) {
    handleErr(e, res);
  }
});

app.post('/api/claude/keypoints', requireAuth, guardKey, async (req: Request, res: Response) => {
  try {
    const { subject, lang, topic } = req.body ?? {};
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    const result = await keypoints({
      subject,
      lang: toLang(lang),
      topic: typeof topic === 'string' && topic ? topic : undefined,
    });
    res.json(result); // { keyPoints }
  } catch (e) {
    handleErr(e, res);
  }
});

// In production, serve the built frontend from dist/.
const distDir = join(here, '..', 'dist');
const servingDist = existsSync(join(distDir, 'index.html'));
if (servingDist) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(distDir, 'index.html')));
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[eju] API listening on :${port}${servingDist ? ' (also serving dist/)' : ''}`);
  if (!hasApiKey()) console.warn('[eju] ANTHROPIC_API_KEY is not set — Claude features will return 503.');
});
