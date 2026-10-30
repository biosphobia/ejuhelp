// Minimal IndexedDB key–value store. localStorage is capped at ~5 MB on iPad and
// fails silently past that, which is no place for months of handwritten notes.
// IndexedDB has no practical limit and survives PWA restarts.
const DB = 'ejuhelp';
const STORE = 'kv';

let dbp: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('idb_blocked'));
    } catch (e) {
      reject(e);
    }
  });
  return dbp;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('[idb] get failed', key, e);
    return undefined;
  }
}

export async function idbSet(key: string, value: unknown): Promise<boolean> {
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    console.warn('[idb] set failed', key, e);
    return false;
  }
}

/** Several writes and deletes in one transaction: either all of them land or none do. */
export async function idbWrite(puts: [string, unknown][], dels: string[] = []): Promise<boolean> {
  if (!puts.length && !dels.length) return true;
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const st = tx.objectStore(STORE);
      for (const k of dels) st.delete(k);
      for (const [k, v] of puts) st.put(v, k);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    console.warn('[idb] write failed', puts.map((p) => p[0]).slice(0, 5), e);
    return false;
  }
}

/** Read several keys in one transaction (missing ones come back undefined). */
export async function idbGetMany<T>(keys: string[]): Promise<(T | undefined)[]> {
  if (!keys.length) return [];
  try {
    const db = await open();
    return await new Promise<(T | undefined)[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const st = tx.objectStore(STORE);
      const out: (T | undefined)[] = new Array(keys.length);
      let left = keys.length;
      keys.forEach((k, i) => {
        const req = st.get(k);
        req.onsuccess = () => {
          out[i] = req.result as T | undefined;
          if (--left === 0) resolve(out);
        };
        req.onerror = () => reject(req.error);
      });
    });
  } catch (e) {
    console.warn('[idb] get many failed', keys.length, e);
    return keys.map(() => undefined);
  }
}

/** Ask the browser not to evict our storage under pressure (best effort). */
export function persistStorage(): void {
  try {
    void navigator.storage?.persist?.();
  } catch {
    /* ignore */
  }
}
