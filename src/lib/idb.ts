// Self-healing IndexedDB helper.
//
// iOS Safari has a long-standing failure mode where, after the WebContent process is
// suspended and resumed (backgrounding the PWA, memory pressure, the "white flash"
// reload), the cached IDBDatabase connection silently dies: every transaction after
// that throws InvalidStateError, but `onclose` never fires. A helper that caches the
// connection forever therefore fails EVERY subsequent write for the rest of the
// session — which is exactly how hours of notes can vanish on the next reload while
// the app looks perfectly fine.
//
// This helper heals itself: any failed transaction drops the cached connection and
// retries once on a freshly-opened one. Callers get an honest boolean back so the
// save pipeline can surface persistent failures to the user instead of console.warn.

const DB_NAME = 'eju-board';
const DB_VERSION = 2; // v2 adds the 'snaps' store (rolling snapshot history)
export const KV_STORE = 'kv';
export const SNAP_STORE = 'snaps';

let conn: Promise<IDBDatabase> | null = null;

function openFresh(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no-idb'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
      if (!db.objectStoreNames.contains(SNAP_STORE)) db.createObjectStore(SNAP_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('idb-blocked'));
  });
}

function getConn(): Promise<IDBDatabase> {
  if (conn) return conn;
  conn = openFresh();
  conn
    .then((db) => {
      db.onclose = () => {
        conn = null;
      };
      db.onversionchange = () => {
        try {
          db.close();
        } catch {
          /* ignore */
        }
        conn = null;
      };
    })
    .catch(() => {
      conn = null;
    });
  return conn;
}

/** Drop the cached connection so the next call opens a fresh one. */
function invalidate() {
  conn = null;
}

type TxMode = 'readonly' | 'readwrite';

function runTx<T>(store: string, mode: TxMode, fn: (os: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return getConn().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        let tx: IDBTransaction;
        try {
          tx = db.transaction(store, mode);
        } catch (e) {
          // InvalidStateError here = the zombie-connection case. Reject so the
          // retry layer below reopens.
          return reject(e);
        }
        let result: T | undefined;
        try {
          const rq = fn(tx.objectStore(store));
          if (rq) rq.onsuccess = () => (result = rq.result);
        } catch (e) {
          return reject(e);
        }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error('idb-tx-error'));
        tx.onabort = () => reject(tx.error ?? new Error('idb-tx-abort'));
      })
  );
}

/** Run a transaction; on failure invalidate the connection and retry ONCE fresh. */
async function withRetry<T>(store: string, mode: TxMode, fn: (os: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  try {
    return await runTx(store, mode, fn);
  } catch {
    invalidate();
    return await runTx(store, mode, fn); // second failure propagates to the caller
  }
}

export async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  try {
    return (await withRetry<T>(store, 'readonly', (os) => os.get(key) as IDBRequest<T>)) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Write a value. Returns true only when the transaction actually COMMITTED. */
export async function idbSet(store: string, key: string, val: unknown): Promise<boolean> {
  try {
    await withRetry(store, 'readwrite', (os) => {
      os.put(val, key);
    });
    return true;
  } catch {
    return false;
  }
}

export async function idbDel(store: string, key: string): Promise<boolean> {
  try {
    await withRetry(store, 'readwrite', (os) => {
      os.delete(key);
    });
    return true;
  } catch {
    return false;
  }
}

export async function idbKeys(store: string): Promise<string[]> {
  try {
    const keys = await withRetry<IDBValidKey[]>(store, 'readonly', (os) => os.getAllKeys() as IDBRequest<IDBValidKey[]>);
    return (keys ?? []).map(String);
  } catch {
    return [];
  }
}
