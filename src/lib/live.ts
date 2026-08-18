// Live device mirroring: when the same account has the app open on several devices
// (iPad + PC), everything that happens on the whiteboard — committed strokes, ink AS IT
// IS BEING DRAWN, erases, moves, images, page and notebook switches, viewport pans and
// zooms, and the pinned/active question card — is streamed over a WebSocket relay
// (server/live.ts) and applied on the other devices in real time.
//
// Design:
// - The relay is dumb: it fans messages out to the account's other sockets. All state
//   logic lives here.
// - Committed board mutations arrive via the liveBus op stream (published by the board
//   store) and are applied remotely through the same store actions, wrapped in
//   applyingRemote() so they don't echo back.
// - In-progress ink is lossy and ephemeral: the drawing device streams point batches
//   (~25/s); receivers render them as a "ghost" stroke until the committed stroke-add
//   lands, so the viewer sees writing appear live, not in bursts.
// - On connect (and reconnect) devices exchange full active-notebook snapshots and adopt
//   whichever is fresher — healing anything missed while a device slept. Durability is
//   NOT this layer's job: local + cloud persistence handle that independently.

import { useBoard, type Stroke, type Pt, type Viewport } from './board';
import { onOp, applyingRemote, isRemoteApply, type BoardOp } from './liveBus';
import { useNotebook, type NotebookId } from './notebooks';
import { liveSnapshot, adoptLiveBook, applyRemoteNotebook, type StoredBook } from './persistence';
import { usePractice, type ActiveItem } from './practice';
import { usePinned, type PinnedQuestion } from './pinned';
import { useAuth, getIdToken } from './auth';
import { useSync } from './sync';
import { boardEvents } from '../whiteboard/view';

const sessionId = Math.random().toString(36).slice(2, 10); // this tab's identity

type PinnedWire = {
  items: PinnedQuestion[];
  index: number;
  collapsed: boolean;
  pos: { x: number; y: number } | null;
};

type WireMsg =
  | { k: 'peers'; n: number }
  | { k: 'op'; from: string; nb: NotebookId; op: BoardOp }
  | { k: 'ink'; from: string; nb: NotebookId; pageId: string; sid: string; color: Stroke['color']; size: number; pts: [number, number, number][]; done?: boolean }
  | { k: 'vp'; from: string; nb: NotebookId; pageId: string; v: Viewport }
  | { k: 'practice'; from: string; q: string | null; item: ActiveItem | null }
  | { k: 'pinned'; from: string; st: PinnedWire }
  | { k: 'sync-req'; from: string }
  | { k: 'sync-res'; from: string; nb: NotebookId; book: StoredBook | null; stamp: number; practice: { q: string | null; item: ActiveItem | null }; pinned: PinnedWire };

let ws: WebSocket | null = null;
let wsUid: string | null = null;
let backoff = 1000;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let closedByUs = false;
let wantPeerState = false; // just (re)connected → adopt the first peer snapshot fully

const peersNow = () => useSync.getState().peers;

function send(msg: Omit<WireMsg, 'from'> & { k: string }) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify({ ...msg, from: sessionId }));
  } catch {
    /* a dropped live packet is fine — persistence owns durability */
  }
}

// ── Remote ghost ink (strokes being drawn RIGHT NOW on another device) ────────────────
interface Ghost {
  nb: NotebookId;
  pageId: string;
  color: Stroke['color'];
  size: number;
  pts: Pt[];
  last: number;
}
const ghosts = new Map<string, Ghost>();
let repaint: (() => void) | null = null;

/** The whiteboard registers its repaint hook so ghost updates show immediately. */
export function setLiveRepaint(fn: () => void) {
  repaint = fn;
}

/** Ghost strokes to render on the given page (active notebook only). */
export function remoteGhosts(pageId: string): Stroke[] {
  if (!ghosts.size) return [];
  const nb = useNotebook.getState().active;
  const out: Stroke[] = [];
  for (const [key, g] of ghosts) {
    if (g.nb === nb && g.pageId === pageId && g.pts.length) {
      out.push({ id: `ghost:${key}`, color: g.color, size: g.size, points: g.pts });
    }
  }
  return out;
}

setInterval(() => {
  // GC ghosts that stopped updating (e.g. the sender disconnected mid-stroke)
  const cut = Date.now() - 10_000;
  let dropped = false;
  for (const [k, g] of ghosts) {
    if (g.last < cut) {
      ghosts.delete(k);
      dropped = true;
    }
  }
  if (dropped) repaint?.();
}, 5000);

// ── Outgoing ink stream (called by the Whiteboard's pointer handlers) ─────────────────
/** True when streaming ink is worth the work (a peer is actually watching). */
export const liveActive = () => peersNow() > 0 && !!ws && ws.readyState === WebSocket.OPEN;

export function inkProgress(sid: string, pageId: string, color: Stroke['color'], size: number, newPts: Pt[]) {
  if (!liveActive() || newPts.length === 0) return;
  send({
    k: 'ink',
    nb: useNotebook.getState().active,
    pageId,
    sid,
    color,
    size,
    pts: newPts.map((p) => [Math.round(p.x * 100) / 100, Math.round(p.y * 100) / 100, Math.round(p.p * 100) / 100]),
  } as Omit<WireMsg, 'from'>);
}

export function inkEnd(sid: string, pageId: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  send({ k: 'ink', nb: useNotebook.getState().active, pageId, sid, color: 'black', size: 0, pts: [], done: true } as Omit<WireMsg, 'from'>);
}

/** Live viewport during a pan/pinch gesture (lossy, ~30/s), so the peer's view glides
 *  with the gesture instead of jumping at the end. */
export function viewportProgress(pageId: string, v: Viewport) {
  if (!liveActive()) return;
  send({ k: 'vp', nb: useNotebook.getState().active, pageId, v } as Omit<WireMsg, 'from'>);
}

// ── Applying remote messages ──────────────────────────────────────────────────────────
function ensurePage(pageId: string): boolean {
  const st = useBoard.getState();
  if (st.currentPageId === pageId) return true;
  if (st.pages.some((p) => p.id === pageId)) {
    applyingRemote(() => st.goToPage(pageId));
    return true;
  }
  // We don't have that page — a gap (missed ops). Ask peers for a full snapshot.
  send({ k: 'sync-req' } as Omit<WireMsg, 'from'>);
  return false;
}

function applyOp(nb: NotebookId, op: BoardOp) {
  if (op.t === 'notebook') {
    applyingRemote(() => applyRemoteNotebook(op.id as NotebookId));
    return;
  }
  // Ops for a notebook we're not on: follow the writer (their notebook op may have been
  // missed while offline).
  if (nb !== useNotebook.getState().active) {
    applyingRemote(() => applyRemoteNotebook(nb));
    if (nb !== useNotebook.getState().active) return; // couldn't switch — drop
  }
  const b = useBoard.getState();
  applyingRemote(() => {
    switch (op.t) {
      case 'stroke-add': {
        if (!ensurePage(op.pageId)) return;
        const have = new Set(useBoard.getState().getCurrentPage().strokes.map((s) => s.id));
        const fresh = op.strokes.filter((s) => !have.has(s.id));
        if (fresh.length) b.addStrokes(fresh);
        for (const s of op.strokes) ghosts.delete(ghostKeyFor(s.id)); // committed → drop any ghost
        break;
      }
      case 'stroke-erase':
        if (!ensurePage(op.pageId)) return;
        b.eraseStrokes(op.ids);
        break;
      case 'stroke-update':
        if (!ensurePage(op.pageId)) return;
        b.updateStrokes(op.updates);
        break;
      case 'page-set': {
        // Direct state surgery: replace one page's strokes (undo / clear on the peer).
        useBoard.setState((st) => ({
          pages: st.pages.map((pg) => (pg.id === op.pageId ? { ...pg, strokes: op.strokes } : pg)),
          rev: st.rev + 1,
        }));
        break;
      }
      case 'page-add':
        b.addPage(op.pageId, op.afterId);
        break;
      case 'page-del':
        b.deletePage(op.pageId);
        break;
      case 'page-go':
        if (useBoard.getState().pages.some((p) => p.id === op.pageId)) b.goToPage(op.pageId);
        break;
      case 'viewport':
        if (useBoard.getState().currentPageId === op.pageId) {
          b.setViewport(op.v);
          boardEvents.dispatchEvent(new CustomEvent('remote-viewport', { detail: op.v }));
        }
        break;
    }
  });
  repaint?.();
}

// stroke-add clears the matching ghost: ghost keys are `${from}:${sid}` but the committed
// stroke id differs — so we ALSO clear by "sender finished" (done flag). This helper only
// drops exact-id ghosts (defensive; the done flag is the primary cleanup).
const ghostKeyFor = (strokeId: string) => strokeId;

function applyInk(m: Extract<WireMsg, { k: 'ink' }>) {
  const key = `${m.from}:${m.sid}`;
  if (m.done) {
    ghosts.delete(key);
    repaint?.();
    return;
  }
  let g = ghosts.get(key);
  if (!g || g.pageId !== m.pageId || g.nb !== m.nb) {
    g = { nb: m.nb, pageId: m.pageId, color: m.color, size: m.size, pts: [], last: 0 };
    ghosts.set(key, g);
  }
  for (const [x, y, p] of m.pts) g.pts.push({ x, y, p });
  g.last = Date.now();
  repaint?.();
}

let lastVpApply = 0;
function applyVp(m: Extract<WireMsg, { k: 'vp' }>) {
  if (m.nb !== useNotebook.getState().active) return;
  if (useBoard.getState().currentPageId !== m.pageId) return;
  const now = performance.now();
  if (now - lastVpApply < 16) return; // cap to ~60fps application
  lastVpApply = now;
  applyingRemote(() => useBoard.getState().setViewport(m.v));
  boardEvents.dispatchEvent(new CustomEvent('remote-viewport', { detail: m.v }));
}

function currentPinned(): PinnedWire {
  const p = usePinned.getState();
  return { items: p.items, index: p.index, collapsed: p.collapsed, pos: p.pos };
}

function applyPinned(st: PinnedWire) {
  if (!st || !Array.isArray(st.items)) return;
  applyingRemote(() => {
    usePinned.setState({
      items: st.items,
      index: Math.max(0, Math.min(st.index ?? 0, Math.max(0, st.items.length - 1))),
      collapsed: !!st.collapsed,
      pos: st.pos ?? null,
    });
  });
}

function applyPractice(q: string | null, item: ActiveItem | null) {
  applyingRemote(() => usePractice.getState().setActiveQuestion(q ?? null, item ?? null));
}

function sendSyncRes() {
  const snap = liveSnapshot();
  let book = snap.book;
  if (book) {
    // WS frames have a size ceiling; a photo-heavy notebook can exceed it. Strip image
    // data in that case — layout/ink still sync, and images stay covered by local/cloud.
    try {
      if (JSON.stringify(book).length > 7_500_000) {
        book = { ...book, pages: book.pages.map((pg) => ({ ...pg, st: pg.st.map((s) => (s.im ? { ...s, im: '' } : s)) })) };
      }
    } catch {
      book = null;
    }
  }
  const pr = usePractice.getState();
  send({
    k: 'sync-res',
    nb: snap.active,
    book,
    stamp: snap.stamp,
    practice: { q: pr.activeQuestion, item: pr.activeItem },
    pinned: currentPinned(),
  } as Omit<WireMsg, 'from'>);
}

function onMessage(raw: string) {
  let m: WireMsg;
  try {
    m = JSON.parse(raw) as WireMsg;
  } catch {
    return;
  }
  if (m.k === 'peers') {
    useSync.getState().setPeers(Math.max(0, m.n));
    return;
  }
  if ('from' in m && m.from === sessionId) return; // our own echo (server shouldn't, but be safe)
  switch (m.k) {
    case 'op':
      applyOp(m.nb, m.op);
      break;
    case 'ink':
      applyInk(m);
      break;
    case 'vp':
      applyVp(m);
      break;
    case 'practice':
      applyPractice(m.q, m.item);
      break;
    case 'pinned':
      applyPinned(m.st);
      break;
    case 'sync-req':
      sendSyncRes();
      break;
    case 'sync-res': {
      if (m.book) adoptLiveBook(m.nb, m.book);
      if (wantPeerState) {
        // We just joined: also take the peer's session state (active notebook, question).
        wantPeerState = false;
        if (m.nb !== useNotebook.getState().active) applyingRemote(() => applyRemoteNotebook(m.nb));
        if (m.practice) applyPractice(m.practice.q, m.practice.item);
        if (m.pinned) applyPinned(m.pinned);
      }
      repaint?.();
      break;
    }
  }
}

// ── Connection lifecycle ──────────────────────────────────────────────────────────────
async function connect(uid: string) {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  const token = (await getIdToken()) ?? '';
  if (useAuth.getState().user?.uid !== uid) return; // user changed while fetching the token
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${proto}://${location.host}/ws/live?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`;
  closedByUs = false;
  let sock: WebSocket;
  try {
    sock = new WebSocket(url);
  } catch {
    scheduleReconnect(uid);
    return;
  }
  ws = sock;
  let hb: ReturnType<typeof setInterval> | undefined;
  sock.onopen = () => {
    backoff = 1000;
    wantPeerState = true;
    // Keepalive: Render's proxy closes idle sockets; a tiny heartbeat (absorbed by the
    // server, never relayed) keeps the tunnel open while the user just reads.
    hb = setInterval(() => {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send('{"k":"hb"}');
        } catch {
          /* ignore */
        }
      }
    }, 25_000);
    // Ask peers for their state and offer ours — both directions adopt-if-newer, so the
    // devices converge no matter which one was ahead.
    send({ k: 'sync-req' } as Omit<WireMsg, 'from'>);
    sendSyncRes();
  };
  sock.onmessage = (ev) => {
    if (typeof ev.data === 'string') onMessage(ev.data);
  };
  sock.onclose = () => {
    if (hb) clearInterval(hb);
    if (ws === sock) ws = null;
    useSync.getState().setPeers(0);
    if (!closedByUs && useAuth.getState().user?.uid === uid) scheduleReconnect(uid);
  };
  sock.onerror = () => {
    try {
      sock.close();
    } catch {
      /* ignore */
    }
  };
}

function scheduleReconnect(uid: string) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    if (useAuth.getState().user?.uid === uid) void connect(uid);
  }, backoff);
  backoff = Math.min(backoff * 2, 15_000);
}

function disconnect() {
  closedByUs = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
  try {
    ws?.close();
  } catch {
    /* ignore */
  }
  ws = null;
  useSync.getState().setPeers(0);
}

let inited = false;

/** Wire the live layer up. Call once at startup (after persistence init). */
export function initLive() {
  if (inited) return;
  inited = true;

  // Forward locally-originated board ops (viewport spam coalesced to ~30/s).
  let vpTimer: ReturnType<typeof setTimeout> | undefined;
  let vpPending: Extract<BoardOp, { t: 'viewport' }> | null = null;
  onOp((op) => {
    if (!liveActive()) return;
    const nb = useNotebook.getState().active;
    if (op.t === 'viewport') {
      vpPending = op;
      if (!vpTimer) {
        vpTimer = setTimeout(() => {
          vpTimer = undefined;
          if (vpPending) send({ k: 'op', nb, op: vpPending } as Omit<WireMsg, 'from'>);
          vpPending = null;
        }, 33);
      }
      return;
    }
    try {
      const wire = { k: 'op', nb, op } as Omit<WireMsg, 'from'>;
      if (op.t === 'stroke-add' && JSON.stringify(op).length > 7_500_000) return; // huge image — let sync heal it
      send(wire);
    } catch {
      /* ignore */
    }
  });

  // Mirror the pinned/active-question card.
  usePractice.subscribe((s, prev) => {
    if (isRemoteApply()) return;
    if (s.activeQuestion === prev.activeQuestion && s.activeItem === prev.activeItem) return;
    if (!liveActive()) return;
    send({ k: 'practice', q: s.activeQuestion, item: s.activeItem } as Omit<WireMsg, 'from'>);
  });
  let pinnedTimer: ReturnType<typeof setTimeout> | undefined;
  usePinned.subscribe((s, prev) => {
    if (isRemoteApply()) return;
    if (s.items === prev.items && s.index === prev.index && s.collapsed === prev.collapsed && s.pos === prev.pos) return;
    if (!liveActive()) return;
    if (pinnedTimer) clearTimeout(pinnedTimer);
    pinnedTimer = setTimeout(() => {
      pinnedTimer = undefined;
      if (liveActive()) send({ k: 'pinned', st: currentPinned() } as Omit<WireMsg, 'from'>);
    }, 150);
  });

  // Connect whenever a signed-in user is present; reconnect on account change.
  const sync = () => {
    const uid = useAuth.getState().user?.uid ?? null;
    if (uid && uid !== wsUid) {
      wsUid = uid;
      disconnect();
      void connect(uid);
    } else if (!uid && wsUid) {
      wsUid = null;
      disconnect();
    } else if (uid && !ws && !reconnectTimer) {
      void connect(uid);
    }
  };
  sync();
  useAuth.subscribe(sync);

  // Coming back to the foreground: reconnect immediately instead of waiting for backoff.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && wsUid && (!ws || ws.readyState === WebSocket.CLOSED)) {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = undefined;
        }
        backoff = 1000;
        void connect(wsUid);
      }
    });
  }
}
