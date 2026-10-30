// Browser-ish globals for running the app's sync code under Node. Each simulated
// device gets its own localStorage and IndexedDB, keyed by the device name in the
// module URL (device.mjs?dev=A&gen=1), so a "reload" (new gen, same dev) keeps
// the device's storage while every module-level singleton starts fresh.
const stores = new Map();
const idbs = new Map();

function devName(url) {
  const m = /[?&]dev=([^&]+)/.exec(url);
  return m ? m[1] : 'default';
}

class MemoryStorage {
  constructor() {
    this.m = new Map();
  }
  getItem(k) {
    return this.m.has(k) ? this.m.get(k) : null;
  }
  setItem(k, v) {
    this.m.set(k, String(v));
  }
  removeItem(k) {
    this.m.delete(k);
  }
  get length() {
    return this.m.size;
  }
  key(i) {
    return [...this.m.keys()][i] ?? null;
  }
}

// The smallest IndexedDB that idb.ts needs: open → objectStore get/put/delete, transaction events.
class FakeIDB {
  constructor() {
    this.stores = new Map();
    this.log = []; // keys written, in order (tests check that a save writes only what changed)
  }
  open(name) {
    const req = {};
    setTimeout(() => {
      const db = {
        createObjectStore: (s) => this.stores.set(s, this.stores.get(s) ?? new Map()),
        transaction: (s, _mode) => {
          const tx = {};
          const store = this.stores.get(s) ?? new Map();
          this.stores.set(s, store);
          let done = false;
          const complete = () => {
            if (done) return;
            done = true;
            setTimeout(() => tx.oncomplete?.(), 0);
          };
          tx.objectStore = () => ({
            get: (key) => {
              const r = {};
              setTimeout(() => {
                r.result = store.has(key) ? JSON.parse(store.get(key)) : undefined;
                r.onsuccess?.();
              }, 0);
              return r;
            },
            put: (value, key) => {
              this.log.push(key);
              store.set(key, JSON.stringify(value));
              complete();
            },
            delete: (key) => {
              store.delete(key);
              complete();
            },
          });
          return tx;
        },
      };
      if (!this.stores.size) {
        req.result = db;
        req.onupgradeneeded?.();
      }
      req.result = db;
      req.onsuccess?.();
    }, 0);
    return req;
  }
}

globalThis.__lsFor = (url) => {
  const n = devName(url);
  if (!stores.has(n)) stores.set(n, new MemoryStorage());
  return stores.get(n);
};
globalThis.__idbFor = (url) => {
  const n = devName(url);
  if (!idbs.has(n)) idbs.set(n, new FakeIDB());
  return idbs.get(n);
};
/** A device's IndexedDB contents and write log, for tests that seed or inspect it. */
globalThis.__idbOf = (name) => {
  if (!idbs.has(name)) idbs.set(name, new FakeIDB());
  const f = idbs.get(name);
  if (!f.stores.has('kv')) f.stores.set('kv', new Map());
  const kv = f.stores.get('kv');
  return {
    get: (k) => (kv.has(k) ? JSON.parse(kv.get(k)) : undefined),
    set: (k, v) => kv.set(k, JSON.stringify(v)),
    keys: () => [...kv.keys()],
    log: f.log,
  };
};
globalThis.__resetDevice = (name) => {
  stores.delete(name);
  idbs.delete(name);
};

const noop = () => {};
globalThis.document = { addEventListener: noop, removeEventListener: noop, visibilityState: 'visible', createElement: () => ({ getContext: () => null }) };
const winListeners = new Map();
globalThis.window = {
  addEventListener: (type, fn) => winListeners.set(type, [...(winListeners.get(type) ?? []), fn]),
  removeEventListener: noop,
  get localStorage() {
    return globalThis.__lsFor('?dev=default');
  },
};
globalThis.__fireWindow = (type) => {
  for (const fn of winListeners.get(type) ?? []) fn({ type });
};
Object.defineProperty(globalThis, 'navigator', { value: { storage: { persist: async () => true } }, configurable: true });
