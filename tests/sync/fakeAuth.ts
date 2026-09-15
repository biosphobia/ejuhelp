// Stand-in for firebase/auth and firebase/app in the sync tests.
type Cb = (user: any) => void;
const cbs: Cb[] = [];
let current: any = null;

export const initializeApp = () => ({});
export const getAuth = () => ({});
export class GoogleAuthProvider {}
export function onAuthStateChanged(_auth: any, cb: Cb) {
  cbs.push(cb);
  setTimeout(() => cb(current), 0);
  return () => {
    const i = cbs.indexOf(cb);
    if (i >= 0) cbs.splice(i, 1);
  };
}
export const signInWithPopup = async () => authControl.signIn('u1');
export const signOut = async () => authControl.signOut();

export const authControl = {
  signIn(uid: string) {
    current = { uid, displayName: 'Test', email: `${uid}@example.com`, getIdToken: async () => 'token' };
    for (const cb of cbs) cb(current);
  },
  signOut() {
    current = null;
    for (const cb of cbs) cb(null);
  },
};
