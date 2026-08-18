import { create } from 'zustand';
import {
  onIdTokenChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signInAnonymously,
  linkWithPopup,
  linkWithRedirect,
  GoogleAuthProvider,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

interface AuthState {
  user: User | null;
  ready: boolean;
  configured: boolean;
  /** Bumped on EVERY auth event — including linking the anonymous account to Google,
   *  which keeps the same uid/object so a plain `user` selector would never re-render.
   *  UI that displays auth state should subscribe to this too. */
  authStamp: number;
  /** Last sign-in failure (Firebase error code), shown in the UI. null = none. */
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Hooks run (awaited) right before sign-out — e.g. flush the board to the cloud so the
// last edits aren't lost when the account they'd be saved under goes away.
const beforeSignOutHooks: Array<() => Promise<void> | void> = [];
export function onBeforeSignOut(fn: () => Promise<void> | void) {
  beforeSignOutHooks.push(fn);
}

/** iOS/Android home-screen (standalone) PWA: a popup cannot hand its result back to the
 *  app, so sign-in MUST use the redirect flow there. */
const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true);

// Popup failures where retrying with the redirect flow is the right move.
const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/cancelled-popup-request',
]);

const codeOf = (e: unknown): string =>
  (e as { code?: string })?.code ?? (e as Error)?.message ?? 'sign-in-failed';

/** Credential carried by a link/sign-in failure (credential-already-in-use etc.), or
 *  null. credentialFromError itself throws on non-Firebase errors — never let that
 *  mask the original failure. */
function credentialFrom(e: unknown) {
  try {
    return GoogleAuthProvider.credentialFromError(e as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]);
  } catch {
    return null;
  }
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  // When Firebase isn't configured we are immediately "ready" in anonymous mode.
  ready: !isFirebaseConfigured,
  configured: isFirebaseConfigured,
  authStamp: 0,
  authError: null,
  signIn: async () => {
    if (!auth) return;
    set({ authError: null });
    try {
      const cur = auth.currentUser;
      if (isStandalone()) {
        // Home-screen PWA → redirect flow (the page navigates away and returns; the
        // result is completed by getRedirectResult below on the way back in).
        if (cur?.isAnonymous) await linkWithRedirect(cur, googleProvider);
        else await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (cur?.isAnonymous) {
        // Upgrade the anonymous backup account in place: linking keeps the SAME uid, so
        // everything already saved to the cloud under it is instantly owned by the
        // Google sign-in.
        try {
          await linkWithPopup(cur, googleProvider);
          set((s) => ({ user: auth!.currentUser, authStamp: s.authStamp + 1 }));
          return;
        } catch (e) {
          // The Google account ALREADY exists in this project (the normal case for a
          // returning student): linking is impossible, but the popup already returned a
          // valid Google credential — sign in with it directly. Never open a second
          // popup here: outside the original click gesture it would be blocked, which
          // is exactly how sign-in used to die silently.
          const cred = credentialFrom(e);
          if (cred) {
            await signInWithCredential(auth, cred);
            return;
          }
          throw e;
        }
      }
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const code = codeOf(e);
      if (code === 'auth/popup-closed-by-user') return; // user changed their mind — not an error
      if (POPUP_FALLBACK_CODES.has(code)) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e2) {
          set({ authError: codeOf(e2) });
          console.warn('[auth] redirect fallback failed', e2);
          return;
        }
      }
      set({ authError: code });
      console.warn('[auth] sign-in failed', e);
    }
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
  // onIdTokenChanged (not onAuthStateChanged): it ALSO fires when the anonymous account
  // is linked to Google — same uid, so onAuthStateChanged stays silent and the UI would
  // keep showing "sign in" after a successful sign-in.
  onIdTokenChanged(auth, (user) => {
    useAuth.setState((s) => ({ user, ready: true, authStamp: s.authStamp + 1 }));
    // No account → create an anonymous one so the cloud backup runs from first launch.
    // Delayed: on the return leg of a redirect sign-in the first event is null while the
    // redirect result is still being processed — signing in anonymously right then would
    // race (and could clobber) the real sign-in. (Requires the Anonymous provider to be
    // enabled in the Firebase console; if it isn't, this quietly no-ops.)
    if (!user) {
      setTimeout(() => {
        if (auth && !auth.currentUser && useAuth.getState().ready) {
          signInAnonymously(auth).catch((e) => {
            console.warn('[auth] anonymous backup sign-in unavailable', codeOf(e));
          });
        }
      }, 1500);
    }
  });

  // Redirect-flow return leg (standalone PWA, or popup-blocked fallback).
  getRedirectResult(auth).catch(async (e) => {
    // linkWithRedirect against an already-existing Google account: finish by signing
    // into that account with the credential the redirect brought back.
    const cred = credentialFrom(e);
    if (cred && auth) {
      try {
        await signInWithCredential(auth, cred);
        return;
      } catch (e2) {
        e = e2;
      }
    }
    console.warn('[auth] redirect sign-in failed', codeOf(e));
    useAuth.setState({ authError: codeOf(e) });
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
