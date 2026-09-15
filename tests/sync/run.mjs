// Sync safety tests. Run with: npm run test:sync
//
// Simulates several devices signed into one account, each running the app's
// real sync code (persistence.ts, userdata.ts, sync.ts, live.ts) against a fake
// Firestore that mimics pending writes, latency, offline and cache misses.
// Every scenario ends with the same invariant: no stroke that was drawn and not
// erased by the user may be missing from every place it could live (a device,
// the account, a snapshot, the journal). The build refuses to ship if any
// scenario fails.
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import './env.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const out = path.join(root, 'node_modules/.cache/ejuhelp-synctest/device.mjs');
mkdirSync(path.dirname(out), { recursive: true });
await build({
  entryPoints: [path.join(root, 'tests/sync/device.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: out,
  logLevel: 'error',
  define: {
    'import.meta.env': JSON.stringify({ VITE_FIREBASE_API_KEY: 'x', VITE_FIREBASE_PROJECT_ID: 'x', VITE_FIREBASE_APP_ID: 'x' }),
    localStorage: '__LS',
    'window.localStorage': '__LS',
    indexedDB: '__IDB',
    __APP_VERSION__: '"test"',
    __BUILD_ID__: '"test"',
  },
  alias: {
    'firebase/firestore': path.join(root, 'tests/sync/fakeFirestore.ts'),
    'firebase/auth': path.join(root, 'tests/sync/fakeAuth.ts'),
    'firebase/app': path.join(root, 'tests/sync/fakeAuth.ts'),
  },
  banner: { js: 'const __LS = globalThis.__lsFor(import.meta.url); const __IDB = globalThis.__idbFor(import.meta.url);' },
});

// SYNC_DEBUG=1 shows the app's console.warn output; SYNC_ONLY=<text> runs matching scenarios only.
const origWarn = console.warn;
if (!process.env.SYNC_DEBUG) console.warn = () => {};
const tick = (ms) => new Promise((r) => setTimeout(r, ms));
const SETTLE = 1500; // debounce (500 ms) + latency + the other device's own debounced save

let gen = 0;
const devices = new Map();
async function device(name, { fresh = true } = {}) {
  if (fresh) globalThis.__resetDevice(name);
  const old = devices.get(name);
  if (old) {
    // a reload: the previous page is gone — nothing of it may keep running
    old.auth.signOut();
    old.fs.detach();
  }
  const mod = await import(pathToFileURL(out).href + `?dev=${name}&gen=${++gen}`);
  const d = mod.boot();
  d.name = name;
  devices.set(name, d);
  await tick(50);
  return d;
}
globalThis.__fsServer ??= { docs: new Map(), devices: new Set(), writes: 0, writeLog: [] };
const server = () => globalThis.__fsServer;
function resetServer() {
  // devices from the previous scenario must not keep reacting to this one
  for (const d of devices.values()) {
    d.auth.signOut();
    d.fs.detach();
  }
  devices.clear();
  server().docs.clear();
  server().writes = 0;
  server().writeLog.length = 0;
}
const strokesDrawn = new Map(); // stroke id -> true (not erased by the user)
let n = 0;
function draw(d, pageId) {
  const id = `${d.name}${++n}`;
  if (pageId && d.useBoard.getState().currentPageId !== pageId) d.useBoard.getState().goToPage(pageId);
  d.useBoard.getState().addStroke({ id, color: 'black', size: 4, points: [{ x: n, y: n, p: 0.5 }, { x: n + 5, y: n + 5, p: 0.5 }] });
  strokesDrawn.set(id, true);
  return id;
}
function erase(d, ids) {
  d.useBoard.getState().eraseStrokes(ids);
  for (const id of ids) strokesDrawn.delete(id);
}
const pageInk = (d, pageId) => (d.useBoard.getState().pages.find((p) => p.id === pageId)?.strokes ?? []).map((s) => s.id).sort().join();
const cloudPages = () => [...server().docs].filter(([k]) => /^users\/[^/]+\/board\/main\/pages\//.test(k)).map(([, v]) => v);

/** Every stroke drawn (and not erased) must still exist somewhere it can be recovered from. */
function whereIsStroke(id) {
  const places = [];
  for (const d of devices.values()) {
    if (d.useBoard.getState().pages.some((p) => p.strokes.some((s) => s.id === id))) places.push(`device ${d.name}`);
    if (d.listJournal().some((e) => e.page.st.some((s) => s.i === id))) places.push(`journal ${d.name}`);
  }
  for (const [k, v] of server().docs) if (v?.st?.some?.((s) => s.i === id)) places.push(`cloud ${k}`);
  return places;
}
function assertNothingLost() {
  const lost = [...strokesDrawn.keys()].filter((id) => whereIsStroke(id).length === 0);
  if (lost.length) throw new Error(`strokes lost everywhere: ${lost.join(', ')}`);
}
async function assertQuiet(label) {
  await tick(SETTLE);
  const before = server().writes;
  await tick(2500);
  if (server().writes !== before) throw new Error(`${label}: cloud kept being written while idle (${server().writes - before} writes)`);
}
const eq = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
};
const ok = (c, msg) => {
  if (!c) throw new Error(msg);
};

const scenarios = [];
const scenario = (name, fn) => scenarios.push({ name, fn });

scenario('a fresh device adds no blank pages to the account', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  draw(A, A.useBoard.getState().currentPageId);
  A.useBoard.getState().addPage();
  draw(A);
  await tick(SETTLE);
  eq(A.useBoard.getState().pages.length, 2, 'two pages on A');
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(B.useBoard.getState().pages.length, 2, "B has exactly A's two pages");
  eq(A.useBoard.getState().pages.length, 2, 'A still has two pages');
  eq(cloudPages().length, 2, 'account has two pages');
});

scenario('second device receives everything on sign-in, then live', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  A.useUI.getState().openPanel('ask');
  A.useApiStore.getState().setKeys('sk-A', '', '');
  A.useAsk.setState((s) => ({ messages: [{ role: 'user', content: 'hello' }], rev: s.rev + 1 }));
  await tick(SETTLE);
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(pageInk(B, p1), pageInk(A, p1), "B has A's page");
  eq(B.useUI.getState().panel, 'ask', 'B mirrors the open panel');
  eq(B.useBoard.getState().currentPageId, p1, "B is on A's page");
  eq(B.useApiStore.getState().claudeKey, 'sk-A', 'API key followed the account');
  eq(B.useAsk.getState().messages[0]?.content, 'hello', 'chat followed the account');
  draw(A, p1);
  await tick(SETTLE);
  eq(pageInk(B, p1), pageInk(A, p1), 'live stroke reached B');
  B.useBoard.getState().addPage();
  const p2 = B.useBoard.getState().currentPageId;
  draw(B, p2);
  await tick(SETTLE);
  eq(pageInk(A, p2), pageInk(B, p2), "B's new page and stroke reached A");
  eq(A.useBoard.getState().currentPageId, p2, 'A followed B to the new page');
  B.useUI.getState().closePanel();
  await tick(SETTLE);
  A.useUI.getState().setSubject('chemistry');
  B.useUI.getState().setLang('ja');
  await tick(SETTLE);
  eq(A.useUI.getState().panel, null, 'panel close mirrored');
  eq(B.useUI.getState().subject, 'chemistry', 'subject mirrored');
  eq(A.useUI.getState().lang, 'ja', 'language synced');
  await assertQuiet('after live edits');
});

scenario('same page edited on two devices at once: both edits survive, erase holds', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  const a = draw(A, p1);
  await tick(20);
  const b = draw(B, p1);
  await tick(SETTLE * 2);
  if (process.env.SYNC_DEBUG) console.log('DBG concurrent', JSON.stringify({ A: pageInk(A, p1), B: pageInk(B, p1), cloud: cloudPages().map((p) => p.st.map((x) => x.i)), jA: A.listJournal().length, jB: B.listJournal().length }));
  eq(pageInk(A, p1), pageInk(B, p1), 'both devices agree');
  ok(pageInk(A, p1).includes(a) && pageInk(A, p1).includes(b), 'both strokes kept');
  erase(A, [a]);
  await tick(20);
  const c = draw(B, p1);
  await tick(SETTLE * 2);
  eq(pageInk(A, p1), pageInk(B, p1), 'agree after erase + add');
  ok(!pageInk(A, p1).includes(a) && pageInk(A, p1).includes(c), 'erase travelled, new stroke kept');
  await assertQuiet('after conflict');
});

scenario('a stale device copy (blank pages, old build, no timestamps) can never blank the notes', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  draw(A, p1);
  A.useBoard.getState().addPage();
  const p2 = A.useBoard.getState().currentPageId;
  draw(A, p2);
  await tick(SETTLE);
  // the account copy was written by an older build: no change times on pages
  for (const [k, v] of server().docs) if (k.includes('/pages/')) delete v.m;
  // the PC holds an old device copy with the same page ids but no ink
  globalThis.__resetDevice('B');
  const ls = globalThis.__lsFor('?dev=B');
  ls.setItem('eju-board-v1', JSON.stringify({ pages: [p1, p2].map((id) => ({ id, v: [1, 0, 0], st: [], nb: 'physics' })), currentPageId: p1, updatedAt: Date.now() - 86_400_000 }));
  const B = await device('B', { fresh: false });
  B.useBoard.getState().setTool('pen'); // the app was used a little before sign-in
  await tick(SETTLE);
  B.auth.signIn('u1');
  await tick(SETTLE * 3);
  eq(pageInk(A, p1).split(',').length, 2, 'tablet page 1 intact');
  eq(pageInk(A, p2).split(',').length, 1, 'tablet page 2 intact');
  eq(pageInk(B, p1), pageInk(A, p1), 'PC received page 1');
  eq(pageInk(B, p2), pageInk(A, p2), 'PC received page 2');
  if (process.env.SYNC_DEBUG) console.log('DBG stale', JSON.stringify({ A: [pageInk(A, p1), pageInk(A, p2)], B: [pageInk(B, p1), pageInk(B, p2)], cloud: cloudPages().map((p) => [p.id, p.st.map((x) => x.i), p.m]), sB: B.useSyncStatus.getState() }));
  ok(cloudPages().every((p) => p.st.length > 0), 'cloud pages all keep their ink');
  await assertQuiet('after stale merge');
});

scenario('an older account copy without timestamps never replaces newer local ink', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  await tick(SETTLE);
  A.auth.signOut();
  await tick(200);
  draw(A, p1); // written while signed out
  await tick(SETTLE);
  for (const [k, v] of server().docs) if (k.includes('/pages/')) delete v.m;
  A.auth.signIn('u1');
  await tick(SETTLE * 2);
  if (process.env.SYNC_DEBUG) console.log('DBG', JSON.stringify({ device: pageInk(A, p1), cloud: cloudPages().map((p) => [p.id, p.st.map((x) => x.i), p.m]), status: A.useSyncStatus.getState(), writes: server().writes, pending: A.fs.pendingCount() }));
  eq(pageInk(A, p1).split(',').length, 2, 'both strokes still on the device');
  eq(cloudPages().find((p) => p.id === p1)?.st.length, 2, 'both strokes in the account');
});

scenario('offline drawing syncs later and merges with edits made meanwhile', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  A.fs.goOffline();
  const a = draw(A, p1);
  const b = draw(B, p1);
  await tick(SETTLE * 2);
  ok(!pageInk(A, p1).includes(b), "A is offline, has not seen B's stroke yet");
  A.fs.goOnline();
  await tick(SETTLE * 3);
  eq(pageInk(A, p1), pageInk(B, p1), 'devices agree after reconnect');
  ok(pageInk(A, p1).includes(a) && pageInk(A, p1).includes(b), 'both strokes kept');
  await assertQuiet('after reconnect');
});

scenario('signing in while offline (cache miss) never wipes the account copy', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  A.useAsk.setState((s) => ({ messages: [{ role: 'user', content: 'keep me' }], rev: s.rev + 1 }));
  A.useApiStore.getState().setKeys('sk-keep', '', '');
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  await tick(SETTLE);
  const B = await device('B');
  B.fs.goOffline();
  B.auth.signIn('u1');
  await tick(SETTLE);
  B.useUI.getState().setLang('tr'); // uses the app offline
  await tick(SETTLE);
  eq(server().docs.get('users/u1/data/chat')?.messages?.[0]?.content, 'keep me', 'chat untouched while B is offline');
  B.fs.goOnline();
  await tick(SETTLE * 3);
  eq(B.useAsk.getState().messages[0]?.content, 'keep me', 'B received the chat');
  eq(B.useApiStore.getState().claudeKey, 'sk-keep', 'B received the key');
  eq(A.useUI.getState().lang, 'tr', "B's language change reached A");
  eq(pageInk(B, p1), pageInk(A, p1), 'B received the page');
  eq(server().docs.get('users/u1/data/chat')?.messages?.[0]?.content, 'keep me', 'account chat still there');
});

scenario('a device never writes to the account before it has merged with it', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  draw(A, p1);
  await tick(SETTLE);
  const B = await device('B');
  B.fs.slowReads = 1500; // the account takes a while to load on B
  B.auth.signIn('u1');
  B.useBoard.getState().addPage();
  draw(B); // draws right away, before the merge could finish
  await tick(SETTLE);
  eq(cloudPages().find((p) => p.id === p1)?.st.length, 2, 'account page intact while B is still merging');
  ok(!B.useSyncStatus.getState().merged, 'B has not merged yet');
  for (let i = 0; i < 40 && !B.useSyncStatus.getState().merged; i++) await tick(200);
  ok(B.useSyncStatus.getState().merged, 'B merged');
  await tick(SETTLE);
  eq(pageInk(B, p1), pageInk(A, p1), "B got A's page");
  if (process.env.SYNC_DEBUG) console.log('DBG gate', JSON.stringify({ B: B.useBoard.getState().pages.map((p) => [p.id, p.notebook, p.strokes.length]), A: A.useBoard.getState().pages.map((p) => [p.id, p.strokes.length]), cloud: cloudPages().map((p) => [p.id, p.st.length]) }));
  ok(cloudPages().length === 2 && cloudPages().every((p) => p.st.length > 0), "B's page and A's page both in the account");
});

scenario('reload keeps everything and causes no spurious cloud writes', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  A.useBoard.getState().addPage();
  draw(A);
  await tick(SETTLE);
  const before = server().writeLog.length;
  const A2 = await device('A', { fresh: false });
  A2.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(A2.useBoard.getState().pages.filter((p) => p.strokes.length).length, 2, 'both inked pages back after reload');
  await assertQuiet('after reload');
  // the reload may refresh the main doc once, but must not rewrite any page
  const pageWrites = server().writeLog.slice(before).filter((k) => k.includes('/board/main/pages/'));
  ok(pageWrites.length === 0, `reload rewrote notebook pages: ${pageWrites.join(', ')}`);
});

scenario('deleting a page journals it on both devices and in the account; restore brings it back', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  const s1 = draw(A, p1);
  A.useBoard.getState().addPage();
  const p2 = A.useBoard.getState().currentPageId;
  draw(A, p2);
  await tick(SETTLE);
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  B.useBoard.getState().goToPage(p1);
  B.useBoard.getState().deletePage(p1);
  await tick(SETTLE * 2);
  ok(!A.useBoard.getState().pages.some((p) => p.id === p1), 'delete reached A');
  ok(B.listJournal().some((e) => e.pageId === p1), 'B journaled the page it deleted');
  ok(A.listJournal().some((e) => e.pageId === p1), 'A journaled the page removed by B');
  ok([...server().docs.keys()].some((k) => k.startsWith('users/u1/history/') && k.includes(p1)), 'account journal has the page');
  const scan = await A.scanForLostPages();
  ok(scan.missing.some((f) => f.id === p1), 'Find lost pages finds it');
  A.addPages(scan.missing.filter((f) => f.id === p1).map((f) => f.page));
  await tick(SETTLE * 2);
  ok(pageInk(A, p1).includes(s1), 'restored on A');
  eq(pageInk(B, p1), pageInk(A, p1), 'restored page reached B');
});

scenario('restore from a backup keeps the fuller copy of every page', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  const s1 = draw(A, p1);
  const s2 = draw(A, p1);
  await tick(SETTLE);
  await A.backupNow();
  await tick(SETTLE);
  A.useBoard.getState().clearCurrentPage();
  await tick(SETTLE);
  eq(pageInk(A, p1), '', 'page cleared');
  ok(A.listJournal().some((e) => e.pageId === p1 && e.page.st.length === 2), 'cleared page journaled');
  const backups = A.listBackups();
  ok(backups.length > 0, 'a backup exists');
  await A.restoreBackup(backups.find((b) => b.reason === 'manual').id, 'merge');
  await tick(SETTLE);
  ok(pageInk(A, p1).includes(s1) && pageInk(A, p1).includes(s2), 'merge restore brought the ink back');
  A.useBoard.getState().clearCurrentPage();
  await tick(SETTLE);
  await A.restoreBackup(backups.find((b) => b.reason === 'manual').id, 'replace');
  await tick(SETTLE);
  ok(pageInk(A, p1).includes(s1) && pageInk(A, p1).includes(s2), 'replace restore brought the ink back');
});

scenario('a coach answer in flight is applied once, even when both devices poll it', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  // A finished an answer: messages + pending cleared, in one save
  A.useAsk.setState((s) => ({ messages: [{ role: 'user', content: 'q' }, { role: 'assistant', content: 'a' }], pending: null, rev: s.rev + 1 }));
  await tick(SETTLE);
  eq(B.useAsk.getState().messages.length, 2, 'B received the conversation');
  eq(B.useAsk.getState().pending, null, "B's pending cleared by the account copy");
});

let failed = 0;
for (const sc of scenarios) {
  if (process.env.SYNC_ONLY && !sc.name.includes(process.env.SYNC_ONLY)) continue;
  resetServer();
  strokesDrawn.clear();
  const t0 = Date.now();
  try {
    await sc.fn();
    assertNothingLost();
    console.log(`PASS ${sc.name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${sc.name}\n     ${e instanceof Error ? e.message : e}`);
  }
}
console.warn = origWarn;
console.log(failed ? `\n${failed} scenario(s) FAILED — do not ship.` : `\nAll ${scenarios.length} sync scenarios passed; nothing drawn was ever lost.`);
process.exit(failed ? 1 : 0);
