import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { requireAuth } from './auth';
import { topicsFor, subtopicsFor, mockExamList, mockExam, SUBJECTS, type Subject } from './eju';
import { hasApiKey, ask, generate, check, explainBoard, keypoints, extractConcepts, mindmapCoach, topicStudySheet, topicMastery, lessonPlan, noteSummary } from './claude';

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

// Proxy a (link-shared) Google Drive PDF so the browser can load it same-origin
// for pdf.js — Drive's download URL doesn't send permissive CORS headers.
app.get('/api/eju/pdf/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) return res.status(400).end();
  try {
    const r = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    if (!r.ok) return res.status(502).json({ error: 'pdf_fetch_failed', status: r.status });
    const ct = r.headers.get('content-type') ?? '';
    const buf = Buffer.from(await r.arrayBuffer());
    // Small files download directly; if Drive returned its HTML scan/login page
    // instead of a PDF, surface a clear error rather than a broken viewer.
    if (ct.includes('text/html') || buf.slice(0, 5).toString() !== '%PDF-') {
      return res.status(409).json({ error: 'pdf_not_public' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch {
    res.status(502).json({ error: 'pdf_fetch_failed' });
  }
});

// Helper to extract BYOK credentials from requests
const getAiContext = (req: Request) => {
  const model = req.body?.model || 'gemini';
  const userKey = req.headers['x-user-api-key'] as string | undefined;
  return { model, userKey };
};

// Compact, per-user learner-profile lines the client sends to tailor coaching.
const toProfile = (p: unknown): string[] | undefined =>
  Array.isArray(p) ? p.map(String).filter(Boolean).slice(0, 40) : undefined;

app.post('/api/claude/ask', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, messages, context, profile } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });

    const result = await ask({
      subject,
      lang: toLang(lang),
      messages: Array.isArray(messages) ? messages : [],
      context: typeof context === 'string' ? context : undefined,
      profile: toProfile(profile),
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
    const { subject, lang, topics, difficulty, count, focus } = req.body ?? {};
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
      topics: Array.isArray(topics) ? topics.map(String).slice(0, 40) : undefined,
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
    const { subject, lang, imageDataUrl, question, answer, solution, note, messages, profile, selection } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof imageDataUrl !== 'string') return res.status(400).json({ error: 'missing_image' });

    const result = await check({
      subject,
      lang: toLang(lang),
      imageDataUrl,
      question: typeof question === 'string' ? question : undefined,
      answer: typeof answer === 'string' ? answer : undefined,
      solution: typeof solution === 'string' ? solution : undefined,
      note: typeof note === 'string' ? note : undefined,
      messages: Array.isArray(messages) ? messages : undefined,
      profile: toProfile(profile),
      selection: selection === true,
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
    const { subject, lang, imageDataUrl, question, note, messages, profile, selection } = req.body ?? {};
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
      profile: toProfile(profile),
      selection: selection === true,
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

// Mindmap node: EJU study sheet for a topic/subtopic (general, cached on the client).
app.post('/api/claude/study-sheet', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, topicId } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof topicId !== 'string' || !topicId) return res.status(400).json({ error: 'bad_topic' });
    res.json(await topicStudySheet({ subject, lang: toLang(lang), topicId, model, userKey }));
  } catch (e) {
    handleErr(e, res);
  }
});

// Condense a coach reply into a short plain-text note for the whiteboard.
app.post('/api/claude/note-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, text } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'bad_text' });
    res.json(await noteSummary({ subject, lang: toLang(lang), text, model, userKey }));
  } catch (e) {
    handleErr(e, res);
  }
});

// Mindmap node: big-picture strength/weakness read from the student's attempts on it.
app.post('/api/claude/topic-mastery', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, topicId, history } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof topicId !== 'string' || !topicId) return res.status(400).json({ error: 'bad_topic' });
    res.json(
      await topicMastery({
        subject,
        lang: toLang(lang),
        topicId,
        history: Array.isArray(history) ? history.slice(0, 30) : [],
        model,
        userKey,
      })
    );
  } catch (e) {
    handleErr(e, res);
  }
});

// Structured, prioritized EJU lesson plan (ordered path through the topic nodes).
app.post('/api/claude/lesson-plan', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, weak } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    res.json(
      await lessonPlan({
        subject,
        lang: toLang(lang),
        weak: Array.isArray(weak) ? weak.map(String).slice(0, 10) : [],
        model,
        userKey,
      })
    );
  } catch (e) {
    handleErr(e, res);
  }
});

// Extract + categorize concepts from study material (coach answers, solved
// practice questions) for the Mindmap.
app.post('/api/claude/concepts', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, text } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });
    if (typeof text !== 'string' || !text.trim()) return res.json({ concepts: [] });

    const result = await extractConcepts({
      subject,
      lang: toLang(lang),
      text: text.slice(0, 6000),
      model,
      userKey
    });
    res.json(result);
  } catch (e) {
    handleErr(e, res);
  }
});

// Conversational coach that searches and edits the user's saved Mindmap.
app.post('/api/claude/mindmap-coach', requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, lang, messages, concepts } = req.body ?? {};
    const { model, userKey } = getAiContext(req);
    if (!isSubject(subject)) return res.status(400).json({ error: 'bad_subject' });

    const cleanConcepts = Array.isArray(concepts)
      ? concepts
          .filter((c: any) => c && typeof c.id === 'string' && typeof c.text === 'string' && c.text.trim())
          .slice(0, 250)
          .map((c: any) => ({
            id: String(c.id),
            kind: (c.kind === 'fact' ? 'fact' : 'formula') as 'formula' | 'fact',
            text: String(c.text).slice(0, 400),
            category: String(c.category ?? ''),
            starred: !!c.starred,
          }))
      : [];

    const result = await mindmapCoach({
      subject,
      lang: toLang(lang),
      messages: Array.isArray(messages) ? messages : [],
      concepts: cleanConcepts,
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
