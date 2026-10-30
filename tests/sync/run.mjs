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
function whereIsStroke(id, journals) {
  const places = [];
  for (const d of devices.values()) {
    if (d.useBoard.getState().pages.some((p) => p.strokes.some((s) => s.id === id))) places.push(`device ${d.name}`);
    if (journals.get(d).some((e) => e.page.st.some((s) => s.i === id))) places.push(`journal ${d.name}`);
    const idb = globalThis.__idbOf(d.name);
    for (const k of idb.keys()) if (k.startsWith('bs:') && idb.get(k)?.pages?.some((p) => p.st?.some((s) => s.i === id))) places.push(`snapshot ${d.name}`);
  }
  for (const [k, v] of server().docs) if (v?.st?.some?.((s) => s.i === id)) places.push(`cloud ${k}`);
  return places;
}
async function assertNothingLost() {
  const journals = new Map();
  for (const d of devices.values()) journals.set(d, await d.listJournal());
  const lost = [...strokesDrawn.keys()].filter((id) => whereIsStroke(id, journals).length === 0);
  if (lost.length) throw new Error(`strokes lost everywhere: ${lost.join(', ')}`);
}
async function assertQuiet(label) {
  await tick(SETTLE);
  const before = server().writes;
  const logAt = server().writeLog.length;
  await tick(2500);
  if (server().writes !== before)
    throw new Error(`${label}: cloud kept being written while idle (${server().writes - before} writes: ${server().writeLog.slice(logAt).join(', ')})`);
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
  if (process.env.SYNC_DEBUG) console.log('DBG concurrent', JSON.stringify({ A: pageInk(A, p1), B: pageInk(B, p1), cloud: cloudPages().map((p) => p.st.map((x) => x.i)), jA: (await A.listJournal()).length, jB: (await B.listJournal()).length }));
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
  ok((await B.listJournal()).some((e) => e.pageId === p1), 'B journaled the page it deleted');
  ok((await A.listJournal()).some((e) => e.pageId === p1), 'A journaled the page removed by B');
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
  ok((await A.listJournal()).some((e) => e.pageId === p1 && e.page.st.length === 2), 'cleared page journaled');
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

scenario('coach profile follows the account, survives reload, and an older copy without it never wipes it', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  A.useProfile.getState().setCoachStyle('  Explain simply, short steps.  ');
  eq(A.useProfile.getState().coachStyle, 'Explain simply, short steps.', 'saved trimmed');
  await tick(SETTLE);
  eq(server().docs.get('users/u1/data/profile')?.coachStyle, 'Explain simply, short steps.', 'account has the coach profile');
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(B.useProfile.getState().coachStyle, 'Explain simply, short steps.', 'B received the coach profile');
  // changed on B: A follows live
  B.useProfile.getState().setCoachStyle('Answer in detail with derivations.');
  await tick(SETTLE * 2);
  eq(A.useProfile.getState().coachStyle, 'Answer in detail with derivations.', 'A received the change');
  // a copy from an older build has no coachStyle field: it must not wipe ours
  A.useProfile.getState().load([], null, true, undefined);
  eq(A.useProfile.getState().coachStyle, 'Answer in detail with derivations.', 'older copy kept the coach profile');
  // reload keeps it
  const A2 = await device('A', { fresh: false });
  A2.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(A2.useProfile.getState().coachStyle, 'Answer in detail with derivations.', 'kept after reload');
  ok(A2.useBoard.getState().pages.some((p) => p.strokes.length), 'ink still there after reload');
  // clearing it is an explicit, saved change
  A2.useProfile.getState().setCoachStyle('');
  await tick(SETTLE * 2);
  eq(B.useProfile.getState().coachStyle, '', 'clearing reached B');
  await assertQuiet('after coach profile edits');
});

// Coach conversations: a fake answer stands in for the model (no network in tests).
function talk(d, text) {
  d.useAsk.setState((s) => ({ messages: [...s.messages, { role: 'user', content: text }, { role: 'assistant', content: `re: ${text}` }], rev: s.rev + 1 }));
  const s = d.useAsk.getState();
  d.useChats.getState().upsert({ id: s.chatId, subject: 'physics', messages: s.messages });
}
const saved = (d) => d.listChats(d.useChats.getState().chats);
const savedTexts = (d) => saved(d).map((c) => c.messages.map((m) => m.content).join('>')).sort();
const cloudChats = () => [...server().docs].filter(([k]) => /^users\/u1\/chats\//.test(k)).map(([, v]) => v);

scenario('coach conversations: several are saved, continued on another device, kept after reload', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  draw(A, A.useBoard.getState().currentPageId);
  talk(A, 'momentum');
  const first = A.useAsk.getState().chatId;
  A.useAsk.getState().newChat();
  ok(A.useAsk.getState().chatId !== first && A.useAsk.getState().messages.length === 0, 'new chat is empty with a new id');
  talk(A, 'moles');
  await tick(SETTLE);
  eq(saved(A).length, 2, 'A has both chats saved');
  eq(cloudChats().length, 2, 'account has both chats');
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(savedTexts(B).join('|'), savedTexts(A).join('|'), 'B has the same chats');
  // B continues the first conversation
  B.useAsk.getState().openChat(first);
  eq(B.useAsk.getState().messages.length, 2, 'B opened the first chat');
  talk(B, 'impulse');
  await tick(SETTLE * 2);
  eq(A.useChats.getState().chats[first].messages.length, 4, 'A sees the continued chat');
  eq(A.useAsk.getState().chatId, first, 'the open chat follows the account');
  // reload keeps them
  const A2 = await device('A', { fresh: false });
  A2.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(saved(A2).length, 2, 'both chats after reload');
  eq(A2.useChats.getState().chats[first].messages.length, 4, 'continued chat intact after reload');
  // deleting one removes it everywhere
  const other = saved(A2).find((c) => c.id !== first).id;
  A2.useAsk.getState().deleteChat(other);
  await tick(SETTLE * 2);
  eq(saved(B).length, 1, 'deletion reached B');
  ok(cloudChats().every((c) => c.id !== other || c.deleted === true), 'account keeps only a deletion marker');
  await assertQuiet('after chat edits');
});

scenario('coach conversations: the same chat continued on two offline devices keeps both, a stale copy never shortens one', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  talk(A, 'waves');
  const id = A.useAsk.getState().chatId;
  await tick(SETTLE);
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(B.useAsk.getState().chatId, id, 'B has the chat open');
  A.fs.goOffline();
  B.fs.goOffline();
  talk(A, 'frequency');
  await tick(50);
  talk(B, 'amplitude');
  await tick(SETTLE);
  A.fs.goOnline();
  await tick(SETTLE);
  B.fs.goOnline();
  await tick(SETTLE * 3);
  for (const d of [A, B]) {
    const all = saved(d).flatMap((c) => c.messages.map((m) => m.content));
    ok(all.includes('frequency') && all.includes('amplitude'), `${d.name} kept both continuations: ${savedTexts(d).join(' | ')}`);
  }
  eq(savedTexts(A).join('|'), savedTexts(B).join('|'), 'both devices end with the same chats');
  eq(saved(A).length, 2, 'one conflict copy, not more');
  // a stale copy of the open chat (fewer messages) never shortens the saved one
  const full = A.useChats.getState().chats[id].messages.length;
  A.useChats.getState().upsert({ id, subject: 'physics', messages: [{ role: 'user', content: 'waves' }] });
  eq(A.useChats.getState().chats[id].messages.length, full, 'stale copy ignored');
  await assertQuiet('after chat conflict');
});

scenario('coach conversations: a chat saved by an older build gets one id on every device', async () => {
  server().docs.set('users/u1/data/chat', { messages: [{ role: 'user', content: 'old q' }, { role: 'assistant', content: 'old a' }], pending: null, updatedAt: 1000 });
  const A = await device('A');
  A.auth.signIn('u1');
  const B = await device('B');
  B.auth.signIn('u1');
  await tick(SETTLE * 3);
  eq(A.useAsk.getState().chatId, B.useAsk.getState().chatId, 'same id on both devices');
  eq(saved(A).length, 1, 'A saved the old chat once');
  eq(saved(B).length, 1, 'B saved the old chat once');
  eq(cloudChats().filter((c) => !c.deleted).length, 1, 'account has it once');
  await assertQuiet('after legacy chat');
});

scenario('coach conversations: two copies that differ only in details settle on one, with no endless rewrites', async () => {
  // The same conversation, same messages and time, but one copy has no subject and
  // another creation time (it was picked up from the open chat). Each device used to
  // keep its own and re-upload it forever.
  const msgs = [{ role: 'user', content: 'lens' }, { role: 'assistant', content: 're: lens' }];
  const a = { id: 'c1', title: 'lens', subject: 'physics', messages: msgs, createdAt: 100, updatedAt: 500 };
  const b = { id: 'c1', title: 'lens', subject: '', messages: msgs, createdAt: 500, updatedAt: 500 };
  const A = await device('A');
  const B = await device('B');
  A.useChats.setState({ chats: { c1: a } });
  B.useChats.setState({ chats: { c1: b } });
  A.auth.signIn('u1');
  await tick(SETTLE);
  B.auth.signIn('u1');
  await tick(SETTLE * 2);
  eq(JSON.stringify(B.useChats.getState().chats.c1), JSON.stringify(A.useChats.getState().chats.c1), 'both devices hold the same copy');
  eq(A.useChats.getState().chats.c1.subject, 'physics', 'subject kept');
  eq(A.useChats.getState().chats.c1.createdAt, 100, 'earliest creation time kept');
  await assertQuiet('after settling the copies');

  // The merge must not depend on which device runs it, and merging again changes nothing.
  const more = [...msgs, { role: 'user', content: 'focal' }, { role: 'assistant', content: 're: focal' }];
  const other = [...msgs, { role: 'user', content: 'mirror' }, { role: 'assistant', content: 're: mirror' }];
  const pairs = [
    [a, b],
    [a, { ...b, updatedAt: 400 }],
    [a, { ...b, messages: more, updatedAt: 400 }],
    [a, { ...b, messages: other }],
    [a, { ...b, messages: [], deleted: true }],
    [{ ...a, messages: [], deleted: true, title: '', subject: '' }, { ...b, messages: [], deleted: true, title: '', subject: '', createdAt: 7 }],
  ];
  for (const [x, y] of pairs) {
    const m1 = A.mergeChat(x, y);
    const m2 = A.mergeChat(y, x);
    eq(JSON.stringify(m1.keep), JSON.stringify(m2.keep), `same result either way (${JSON.stringify(y).slice(0, 60)})`);
    eq(JSON.stringify(m1.fork ?? null), JSON.stringify(m2.fork ?? null), 'same conflict copy either way');
    ok(!A.mergeChat(m1.keep, x).changed || JSON.stringify(A.mergeChat(m1.keep, x).keep) === JSON.stringify(m1.keep), 'merging again is stable');
    eq(A.mergeChat(m1.keep, m1.keep).changed, false, 'merging a copy with itself changes nothing');
  }
});

// ─── device storage layout (one record per page / snapshot / journal entry) ───
const enc = (id, strokeIds, m = 1000) => ({ id, v: [1, 0, 0], st: strokeIds.map((i) => ({ i, c: 'black', s: 4, p: [1, 1, 0.5, 5, 5, 0.5] })), nb: 'physics', m });

scenario('device storage from an older build (one big record each) is read, moved over, and nothing in it is lost', async () => {
  // What an older build left on the device: the board, 2 snapshots and a journal entry, each as one record.
  globalThis.__resetDevice('C');
  const idb = globalThis.__idbOf('C');
  idb.set('board', { pages: [enc('c1', ['old1', 'old2']), enc('c2', ['old3'])], currentPageId: 'c1', updatedAt: 5000 });
  idb.set('board-snapshots', [
    { id: 'dold1', ts: 4000, reason: 'manual', pages: [enc('c1', ['old1', 'old2', 'snapOnly'])] },
    { id: 'dold2', ts: 3000, reason: 'before-cloud-merge', pages: [enc('c9', ['gone1'])] },
  ]);
  idb.set('board-history', [{ id: 'c8-1', pageId: 'c8', ts: 2000, reason: 'other-device', page: enc('c8', ['journalOnly']) }]);
  for (const id of ['old1', 'old2', 'old3', 'snapOnly', 'gone1', 'journalOnly']) strokesDrawn.set(id, true);
  const C = await device('C', { fresh: false });
  await tick(SETTLE * 2); // old snapshots are moved a moment after the notebook has loaded
  eq(pageInk(C, 'c1'), 'old1,old2', 'old board read');
  eq(pageInk(C, 'c2'), 'old3', 'second page read');
  const backups = C.listBackups().filter((b) => b.where === 'device').map((b) => b.id).sort().join();
  eq(backups, 'dold1,dold2', 'old snapshots listed');
  ok((await C.listJournal()).some((e) => e.page.st.some((x) => x.i === 'journalOnly')), 'old journal entry kept');
  // the first save moves the board to one record per page and retires the old record
  draw(C, 'c1');
  await tick(SETTLE);
  ok(idb.get('board2')?.order?.includes('c1'), 'board index written');
  ok(idb.get('bp:c2')?.st?.length === 1, `each page has its own record (${idb.keys().join(' ')} | ${JSON.stringify(idb.get('board2'))?.slice(0, 200)})`);
  eq(idb.get('board')?.pages?.length ?? 0, 0, 'old board record retired');
  ok(idb.keys().includes('bs:dold1') && idb.keys().includes('bs:dold2'), 'snapshots stored one per record');
  eq((idb.get('board-snapshots') ?? []).length, 0, 'old snapshot record emptied');
  // restoring an old snapshot still works and brings back what only it had
  await C.restoreBackup('dold1', 'merge');
  await C.restoreBackup('dold2', 'merge');
  ok(C.useBoard.getState().pages.some((p) => p.id === 'c9'), 'page only in an old snapshot restored');
  // a newer copy written later in the old record (an older build opened again) is still merged in
  idb.set('board', { pages: [enc('c1', ['old1', 'old2', 'fromOldBuild'], 9e12)], currentPageId: 'c1', updatedAt: 9e12 });
  strokesDrawn.set('fromOldBuild', true);
  const C2 = await device('C', { fresh: false });
  await tick(SETTLE);
  ok(pageInk(C2, 'c1').includes('fromOldBuild'), 'newer old-layout copy merged');
  ok(C2.useBoard.getState().pages.some((p) => p.id === 'c9'), 'restored page kept after reload');
});

scenario('a save writes only the page that changed; reload reads every page back', async () => {
  const A = await device('A');
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  A.useBoard.getState().addPage();
  const p2 = A.useBoard.getState().currentPageId;
  draw(A, p2);
  A.useBoard.getState().addPage();
  const p3 = A.useBoard.getState().currentPageId;
  draw(A, p3);
  await tick(SETTLE);
  const idb = globalThis.__idbOf('A');
  const before = idb.log.length;
  draw(A, p2);
  await tick(SETTLE);
  const pagesWritten = idb.log.slice(before).filter((k) => k.startsWith('bp:'));
  eq(pagesWritten.join(), `bp:${p2}`, 'only the changed page written');
  // deleting a page removes its record
  A.useBoard.getState().goToPage(p3);
  A.useBoard.getState().deletePage(p3);
  await tick(SETTLE);
  ok(!A.useBoard.getState().pages.some((p) => p.id === p3), 'page deleted');
  ok(!idb.keys().includes(`bp:${p3}`), 'deleted page record removed');
  ok((await A.listJournal()).some((e) => e.pageId === p3), 'deleted page journaled');
  const A2 = await device('A', { fresh: false });
  await tick(SETTLE);
  eq(pageInk(A2, p1), pageInk(A, p1), 'page 1 after reload');
  eq(pageInk(A2, p2), pageInk(A, p2), 'page 2 after reload');
});

scenario('erasing stroke after stroke (signed in) keeps one journal copy, not one per erase, and loses nothing', async () => {
  const A = await device('A');
  A.auth.signIn('u1');
  await tick(SETTLE);
  const p1 = A.useBoard.getState().currentPageId;
  const ids = [draw(A, p1), draw(A, p1), draw(A, p1), draw(A, p1), draw(A, p1)];
  await tick(SETTLE);
  for (const id of ids.slice(0, 4)) {
    erase(A, [id]);
    await tick(SETTLE);
  }
  const entries = (await A.listJournal()).filter((e) => e.pageId === p1);
  ok(entries.length >= 1, 'the page before erasing is journaled');
  ok(entries.length <= 1, `one journal copy, not ${entries.length}`);
  ok(ids.every((id) => entries.some((e) => e.page.st.some((x) => x.i === id))), 'every erased stroke is in that copy');
  const cloudJournal = [...server().docs.keys()].filter((k) => k.startsWith('users/u1/history/'));
  ok(cloudJournal.length <= 2, `account journal not flooded (${cloudJournal.length})`);
  await assertQuiet('after erasing');
});

scenario('automatic snapshots of an unchanged notebook are not repeated; manual backups always are', async () => {
  const A = await device('A');
  const p1 = A.useBoard.getState().currentPageId;
  draw(A, p1);
  await tick(SETTLE);
  await A.backupNow();
  await A.backupNow();
  eq(A.listBackups().filter((b) => b.where === 'device').length, 2, 'two manual backups');
  const id = A.listBackups()[0].id;
  draw(A, p1); // the notebook now differs from the backups
  await tick(SETTLE);
  await A.restoreBackup(id, 'merge'); // takes a "before-restore" snapshot; the second restore finds the same content
  await A.restoreBackup(id, 'merge');
  const auto = A.listBackups().filter((b) => b.where === 'device' && b.reason === 'before-restore');
  eq(auto.length, 1, 'identical before-restore snapshot taken once');
  const A2 = await device('A', { fresh: false });
  await tick(SETTLE);
  eq(A2.listBackups().filter((b) => b.where === 'device').length, 3, 'snapshot list survives reload');
  await A2.restoreBackup(id, 'replace');
  eq(pageInk(A2, p1).length > 0, true, 'restore after reload works');
});

let failed = 0;
for (const sc of scenarios) {
  if (process.env.SYNC_ONLY && !sc.name.includes(process.env.SYNC_ONLY)) continue;
  resetServer();
  strokesDrawn.clear();
  const t0 = Date.now();
  try {
    await sc.fn();
    await assertNothingLost();
    console.log(`PASS ${sc.name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${sc.name}\n     ${e instanceof Error ? e.message : e}`);
  }
}
console.warn = origWarn;
console.log(failed ? `\n${failed} scenario(s) FAILED — do not ship.` : `\nAll ${scenarios.length} sync scenarios passed; nothing drawn was ever lost.`);
process.exit(failed ? 1 : 0);
