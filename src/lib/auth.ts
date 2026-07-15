import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithPopup,
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
