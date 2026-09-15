// A stand-in for firebase/firestore used by the sync tests. One "server" is shared
// by every simulated device (globalThis); each device (each bundle instance) has
// its own pending-write overlay, listeners and offline switch, and behaves the
// way the real SDK does in the ways the app depends on:
//  - a write shows up on the writing device at once with hasPendingWrites=true,
//    reaches other devices after a short latency, and produces NO further event
//    on the writing device when the server confirms it (metadata-only change);
//  - while offline, writes queue, reads fail, and a new listener first delivers
//    a cache miss with fromCache=true;
//  - undefined field values are rejected, like the real SDK.
type Listener = { path: string; col: boolean; fn: (snap: any) => void; last?: Map<string, any> };
interface Server {
  docs: Map<string, any>;
  devices: Set<Device>;
  writes: number;
  writeLog: string[];
}
interface Device {
  pending: Map<string, any>; // path -> data, or null for a pending delete
  queue: string[];
  listeners: Listener[];
  offline: boolean;
  slowReads: number;
  notify: (paths: string[]) => void;
}
const g = globalThis as any;
const server: Server = (g.__fsServer ??= { docs: new Map(), devices: new Set(), writes: 0, writeLog: [] });
const LATENCY = 30;

const dev: Device = { pending: new Map(), queue: [], listeners: [], offline: false, slowReads: 0, notify: (paths) => notify(paths) };
server.devices.add(dev);

const norm = (p: string) => p.replace(/^\/+/, '');
function pathOf(args: any[]) {
  const parts = args.slice(1).flatMap((a) => (typeof a === 'string' ? a.split('/') : []));
  const base = typeof args[0] === 'object' && args[0]?.__path ? args[0].__path + '/' : '';
  return norm(base + parts.join('/'));
}
export const db = {};
export const getFirestore = () => db;
export function doc(...args: any[]) {
  return { __path: pathOf(args), __col: false };
}
export function collection(...args: any[]) {
  return { __path: pathOf(args), __col: true };
}
export type Unsubscribe = () => void;

const clone = (v: any) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
function view(path: string): any {
  if (dev.pending.has(path)) {
    const p = dev.pending.get(path);
    return p === null ? undefined : p;
  }
  return server.docs.get(path);
}
const inCol = (col: string, p: string) => p.startsWith(col + '/') && !p.slice(col.length + 1).includes('/');
function colView(col: string): Map<string, any> {
  const out = new Map<string, any>();
  for (const [p, d] of server.docs) if (inCol(col, p) && !dev.pending.has(p)) out.set(p, d);
  for (const [p, d] of dev.pending) if (inCol(col, p) && d !== null) out.set(p, d);
  return out;
}
const snapOf = (path: string, data: any, fromCache = false) => ({
  id: path.split('/').pop(),
  ref: { __path: path },
  exists: () => data !== undefined,
  data: () => clone(data),
  metadata: { hasPendingWrites: dev.pending.has(path), fromCache },
});
function querySnap(col: string, docs: Map<string, any>, changes: any[], fromCache = false) {
  const list = [...docs].map(([p, d]) => snapOf(p, d, fromCache));
  return {
    docs: list,
    forEach: (f: any) => list.forEach(f),
    docChanges: () => changes,
    metadata: { hasPendingWrites: list.some((d) => d.metadata.hasPendingWrites), fromCache },
  };
}
function diff(prev: Map<string, any>, cur: Map<string, any>) {
  const changes: any[] = [];
  for (const [p, d] of cur) {
    if (!prev.has(p)) changes.push({ type: 'added', doc: snapOf(p, d) });
    else if (JSON.stringify(prev.get(p)) !== JSON.stringify(d)) changes.push({ type: 'modified', doc: snapOf(p, d) });
  }
  for (const [p, d] of prev) if (!cur.has(p)) changes.push({ type: 'removed', doc: snapOf(p, d) });
  return changes;
}
function notify(paths: string[]) {
  for (const l of dev.listeners) {
    if (!l.col) {
      if (paths.includes(l.path)) {
        const d = view(l.path);
        setTimeout(() => l.fn(snapOf(l.path, d)), 0);
      }
      continue;
    }
    if (!paths.some((p) => inCol(l.path, p))) continue;
    const cur = colView(l.path);
    const changes = diff(l.last ?? new Map(), cur);
    l.last = cur;
    if (!changes.length) continue;
    const snap = querySnap(l.path, cur, changes);
    setTimeout(() => l.fn(snap), 0);
  }
}

function checkValue(v: any, where: string) {
  if (v === undefined) throw new Error(`Unsupported field value: undefined (found in ${where})`);
  if (Array.isArray(v)) {
    for (const x of v) {
      if (Array.isArray(x)) throw new Error(`Nested arrays are not supported (found in ${where})`);
      checkValue(x, where);
    }
  } else if (v && typeof v === 'object') for (const k of Object.keys(v)) checkValue(v[k], where + '.' + k);
}

function commit(path: string) {
  const data = dev.pending.get(path);
  dev.pending.delete(path);
  server.writes++;
  server.writeLog.push(path);
  const before = server.docs.get(path);
  if (data === null) server.docs.delete(path);
  else server.docs.set(path, data);
  const changed = JSON.stringify(before) !== JSON.stringify(data === null ? undefined : data);
  if (!changed) return;
  for (const d of server.devices) if (d !== dev) d.notify([path]);
  // The writing device already saw this value as a pending write; the confirmation
  // changes only metadata, which (like the real SDK) produces no event.
}
function scheduleCommit(path: string) {
  setTimeout(() => {
    if (dev.offline) {
      if (!dev.queue.includes(path)) dev.queue.push(path);
      return;
    }
    if (dev.pending.has(path)) commit(path);
  }, LATENCY);
}
function localWrite(path: string, data: any | null) {
  dev.pending.set(path, data);
  notify([path]);
  scheduleCommit(path);
}

export async function setDoc(ref: any, data: any, opts?: { merge?: boolean }) {
  checkValue(data, ref.__path);
  const prev = view(ref.__path);
  localWrite(ref.__path, opts?.merge ? { ...(prev ?? {}), ...clone(data) } : clone(data));
}
export async function deleteDoc(ref: any) {
  localWrite(ref.__path, null);
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function getDoc(ref: any) {
  if (dev.offline) throw new Error('unavailable: client is offline');
  await wait(dev.slowReads || LATENCY);
  return snapOf(ref.__path, view(ref.__path));
}
export async function getDocs(col: any) {
  if (dev.offline) throw new Error('unavailable: client is offline');
  await wait(dev.slowReads || LATENCY);
  return querySnap(col.__path, colView(col.__path), []);
}
export function writeBatch() {
  const ops: (() => Promise<void>)[] = [];
  return {
    set: (ref: any, data: any) => ops.push(() => setDoc(ref, data)),
    delete: (ref: any) => ops.push(() => deleteDoc(ref)),
    commit: async () => {
      for (const op of ops) await op();
    },
  };
}
export function onSnapshot(ref: any, fn: (snap: any) => void, _err?: (e: any) => void): Unsubscribe {
  const l: Listener = { path: ref.__path, col: Boolean(ref.__col), fn };
  dev.listeners.push(l);
  const deliver = () => {
    if (l.col) {
      const cur = colView(l.path);
      l.last = cur;
      l.fn(querySnap(l.path, cur, [...cur].map(([p, d]) => ({ type: 'added', doc: snapOf(p, d) }))));
    } else l.fn(snapOf(l.path, view(l.path)));
  };
  if (dev.offline) {
    // cache miss first, the real data once the connection is back
    setTimeout(() => (l.col ? l.fn(querySnap(l.path, new Map(), [], true)) : l.fn(snapOf(l.path, undefined, true))), 0);
    const check = setInterval(() => {
      if (dev.offline) return;
      clearInterval(check);
      if (dev.listeners.includes(l)) deliver();
    }, 10);
  } else setTimeout(deliver, LATENCY);
  return () => {
    dev.listeners = dev.listeners.filter((x) => x !== l);
  };
}

/** Test controls for this device. */
export const fsControl = {
  goOffline() {
    dev.offline = true;
  },
  goOnline() {
    dev.offline = false;
    const q = dev.queue.splice(0);
    for (const p of q) if (dev.pending.has(p)) commit(p);
    // whatever changed on the server meanwhile reaches the listeners now
    const paths = [...server.docs.keys()];
    notify(paths);
    (globalThis as any).__fireWindow?.('online');
  },
  set slowReads(ms: number) {
    dev.slowReads = ms;
  },
  server,
  pendingCount: () => dev.pending.size,
  /** Make this instance inert (a reload replaced it): no listeners, no writes. */
  detach() {
    dev.listeners = [];
    dev.offline = true;
    dev.queue = [];
    dev.pending.clear();
    server.devices.delete(dev);
  },
};
