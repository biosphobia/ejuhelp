import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  linkWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

interface AuthState {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Hooks run (awaited) right before sign-out — e.g. flush the board to the cloud so the
// last edits aren't lost when the account they'd be saved under goes away.
const beforeSignOutHooks: Array<() => Promise<void> | void> = [];
export function onBeforeSignOut(fn: () => Promise<void> | void) {
  beforeSignOutHooks.push(fn);
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  // When Firebase isn't configured we are immediately "ready" in anonymous mode.
  ready: !isFirebaseConfigured,
  configured: isFirebaseConfigured,
  signIn: async () => {
    if (!auth) return;
    const cur = auth.currentUser;
    if (cur?.isAnonymous) {
      // Upgrade the anonymous backup account in place: linking keeps the SAME uid, so
      // everything already saved to the cloud under it is instantly owned by the Google
      // sign-in — no copy needed. If the Google account was already used before (can't
      // link), fall back to a normal sign-in; the board reconcile then merges local work
      // into that account's cloud copy.
      try {
        await linkWithPopup(cur, googleProvider);
        set({ user: auth.currentUser });
        return;
      } catch {
        /* fall through to a regular sign-in */
      }
    }
    await signInWithPopup(auth, googleProvider);
  },
  signOut: async () => {
    if (!auth) return;
    for (const h of beforeSignOutHooks) {
      try {
        await h();
      } catch {
        /* never block sign-out on a flush error */
      }
    }
    await fbSignOut(auth);
  },
}));

if (isFirebaseConfigured && auth) {
  onAuthStateChanged(auth, (user) => {
    useAuth.setState({ user, ready: true });
    // No account at all → create an anonymous one, so the cloud backup runs from the very
    // first launch instead of only after the user signs in. (Requires the Anonymous
    // provider to be enabled in the Firebase console; if it isn't, this quietly no-ops
    // and the app keeps working local-only until a real sign-in.)
    if (!user && auth) {
      signInAnonymously(auth).catch((e) => {
        console.warn('[auth] anonymous backup sign-in unavailable', e?.code ?? e);
      });
    }
  });
}

/** Current user's Firebase ID token, or null if not signed in. */
export async function getIdToken(): Promise<string | null> {
  const u = useAuth.getState().user;
  if (!u) return null;
  try {
    return await u.getIdToken();
  } catch {
    return null;
  }
}
