import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True only when the web app has real Firebase config; otherwise we run anonymously. */
export const isFirebaseConfigured = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(cfg as Required<typeof cfg>);
  // Persist the login across reloads with a fallback chain: IndexedDB first, then
  // localStorage — so the session survives even if one store is unavailable/evicted.
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch {
    auth = getAuth(app); // already initialized elsewhere, or init failed → default
  }
  // Persistent local cache: setDoc calls are journaled in IndexedDB and re-sent when the
  // network returns, so a cloud save started offline (or interrupted by a reload) is NOT
  // lost — it flushes on the next launch. This is what makes "saved to the cloud in real
  // time" hold up on a train, in airplane mode, or through a flaky connection.
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    db = getFirestore(app); // already initialized, or persistence unavailable → default
  }
}

export const googleProvider = new GoogleAuthProvider();
export { app, auth, db };
