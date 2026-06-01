# EJU Study

A fast study app for the **EJU** (Examination for Japanese University Admission for International Students), built for **iPad + Apple Pencil** in Safari (and desktop browsers).

The whole screen is a notebook you write on with the Pencil. A small, non‑intrusive tab on the right opens the AI features, all grounded in **a decade of real EJU past papers**:

- **Ask Claude** – ask anything about a subject; answers are tuned to the EJU syllabus and past‑paper style.
- **Practice questions** – generate fresh, EJU‑style questions by subject / topic / difficulty, with answers + worked explanations. Send one to the board to solve it.
- **Key points** – high‑yield, exam‑focused notes per topic.
- **Check my work** – Claude reads your handwritten page (vision) and checks your solution, pinpointing the first mistake and giving a hint.

Subjects: **Physics, Chemistry, Biology** (built from your past papers + official 2026 syllabi) and **Mathematics** (placeholder until math papers are added). UI toggles between **English and 日本語** at any time.

---

## How it works

```
┌────────────────────────────────────────────┐
│ Browser (iPad Safari / desktop)             │
│  • React + Vite + Tailwind PWA              │
│  • Whiteboard: <canvas> + perfect-freehand  │
│    Apple Pencil (pressure) draws,           │
│    fingers pinch-to-scale / pan             │
│  • Firebase Auth (Google) + Firestore       │  ← login + per-user note sync
└───────────────┬─────────────────────────────┘
                │  /api/*  (sends Firebase ID token)
┌───────────────▼─────────────────────────────┐
│ Node/Express backend (server/)              │
│  • Verifies the Firebase login              │
│  • Calls the Claude API with your key       │  ← key stays server-side, never in the browser
│  • Injects the EJU knowledge base as        │
│    prompt-cached context                    │
│  • Serves the built frontend in production  │
└──────────────────────────────────────────────┘
```

The EJU knowledge base (`server/data/eju/`) was distilled from the past papers in Google Drive: per‑subject topic taxonomies, question archetypes seen across years, style notes, and the verbatim official syllabi. It's sent to Claude as cached context so generated questions match the real exam.

---

## Prerequisites

- **Node 22+**
- An **Anthropic API key** – <https://console.anthropic.com/> → API Keys
- A **Firebase project** (free) for Google login + cloud note storage — optional for first run (the app falls back to on‑device storage and anonymous API access when unconfigured).

---

## Quick start (local)

```bash
npm install
cp .env.example .env        # then fill in the values (see below)
npm run dev                 # web on http://localhost:5173, API on :8787
```

Open <http://localhost:5173>. With `ALLOW_ANON=true` (the default in `.env.example`) the Claude features work immediately as long as `ANTHROPIC_API_KEY` is set — you don't need Firebase to try it.

**Use it on your iPad on the same Wi‑Fi:** run `npm run dev`, find your computer's LAN IP, and open `http://<that-ip>:5173` in Safari. (For a permanent URL, deploy — see below.)

### Minimum `.env` to try the AI features

```
ANTHROPIC_API_KEY=sk-ant-...
ALLOW_ANON=true
```

That's enough to draw, generate questions, and check your work locally. Add Firebase next for Google login + cloud sync.

---

## Firebase setup (Google login + cloud note sync)

1. Create a project at <https://console.firebase.google.com/>.
2. **Authentication → Sign‑in method → Google → Enable.** Add your dev/host domains (e.g. `localhost`, your Render URL) under **Authorized domains**.
3. **Firestore Database → Create** (production mode). Then publish the included rules in `firestore.rules` (each user can only access their own data).
4. **Project settings → General → Your apps → Web app** → copy the config into the `VITE_FIREBASE_*` vars in `.env`.
5. **Project settings → Service accounts → Generate new private key.** Either save the JSON and point `GOOGLE_APPLICATION_CREDENTIALS` at it, or paste it as a single line into `FIREBASE_SERVICE_ACCOUNT`. Then set `ALLOW_ANON=false` so the backend requires a real login.

See `.env.example` for every variable with comments.

---

## Deploy

The app is one Node service that serves both the API and the built site, so it runs anywhere that runs Node.

**Render (simplest, free tier):**

1. Push this repo to GitHub (already connected).
2. On Render: **New → Web Service**, pick the repo. `render.yaml` is included, so build/start commands are pre‑filled (`npm install && npm run build` / `npm start`).
3. Set env vars in the dashboard: `ANTHROPIC_API_KEY`, the `VITE_FIREBASE_*` values, and `FIREBASE_SERVICE_ACCOUNT` (then flip `ALLOW_ANON` to `false`).
4. Add the Render URL to Firebase **Authorized domains**.

> Note: Vite env vars (`VITE_*`) are baked in **at build time**, so set them in the deploy environment before the build runs.

Any other Node host (Railway, Fly.io, a VPS) works the same: `npm run build` then `npm start`.

---

## On the iPad

- Open the site in Safari → **Share → Add to Home Screen** for a full‑screen, app‑like experience.
- **Apple Pencil draws** (with pressure); **one finger pans, two fingers pinch‑to‑scale** (never rotates). The page is an infinite, zoomable canvas.
- Tools: pen, eraser (removes whole strokes), 4 easy‑to‑read inks (black / red / blue / green), pen sizes, undo, clear. Add/switch pages from the bottom bar; reset zoom from the same bar.
- Notes autosave on‑device immediately and sync to the cloud when you're signed in.

---

## Extending the EJU knowledge base

- `server/data/eju/manifest.json` indexes every EJU file found in Drive (year / session / subject / type), including which extracted cleanly.
- To **add Mathematics**: upload the math past papers to the EJU Drive folder, then re‑run the ingestion to fill `server/data/eju/math.json` (currently a placeholder). The app already exposes math in the UI.
- A couple of source PDFs were image‑only/redacted and couldn't be text‑extracted (flagged `extractionOk:false` in the manifest) — re‑OCR or replace those to deepen coverage.

---

## Configuration reference

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | backend | Your Claude API key (required for AI features). |
| `ANTHROPIC_MODEL` | backend | Optional model override. Default `claude-opus-4-8`. For lower cost/latency, `claude-sonnet-4-6`. |
| `ANTHROPIC_EFFORT` | backend | `low`/`medium`/`high`/`max` thinking effort. Default `medium`. |
| `ALLOW_ANON` | backend | `true` lets the API work without login (local/dev). Set `false` in production. |
| `GOOGLE_APPLICATION_CREDENTIALS` / `FIREBASE_SERVICE_ACCOUNT` | backend | Firebase Admin credentials to verify logins. |
| `VITE_FIREBASE_*` | frontend | Firebase web config (safe to ship to the browser). |
| `PORT` | backend | API port (default 8787). |

---

## Roadmap / known limitations

- **Math papers** not yet ingested (subject is stubbed and ready).
- **Japanese-language study module** is a planned later phase (sciences + math first).
- Whiteboard sync stores the notebook as one compact Firestore document; for very heavy ink, per‑page sharding is a future improvement.
- Notation renders as plain text (no LaTeX/KaTeX yet); Claude is instructed to use readable plain‑text math.
- Bundle includes the full Firebase SDK; code‑splitting is a future optimization.
