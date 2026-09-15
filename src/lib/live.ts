import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { useAuth } from './auth';
import { db } from './firebase';
import { useUI, SUBJECTS, type PanelId, type Subject } from './ui';
import { useBoard } from './board';

/**
 * Mirror what is on screen between the devices signed into one account: the open
 * panel, the subject, the notebook and the page. Each device writes its view to
 * users/{uid}/data/session and applies the other device's view when it arrives,
 * so a tablet and a PC show the same thing. Only the view is mirrored here;
 * the content itself travels through the board and account sync.
 */
interface Session {
  device: string;
  panel: PanelId;
  subject: Subject;
  notebook: string;
  pageId: string;
  updatedAt: number;
}

const PANELS: PanelId[] = ['plan', 'ask', 'generate', 'exams', 'notes', 'progress', 'timer', 'settings', 'account'];

function deviceId(): string {
  try {
    let id = localStorage.getItem('eju-device');
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      localStorage.setItem('eju-device', id);
    }
    return id;
  } catch {
    return 'd' + Math.random().toString(36).slice(2, 8);
  }
}

let started = false;

export function initLive() {
  if (started) return;
  started = true;
  const me = deviceId();
  let unsub: Unsubscribe | undefined;
  let applying = false;
  let lastApplied = 0;
  let lastSent = '';
  let lastSentAt = 0;
  // A remote view whose page has not reached this device yet (it is still on
  // its way through the board sync); applied once the page arrives.
  let waiting: Session | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const view = () => {
    const ui = useUI.getState();
    const b = useBoard.getState();
    return { panel: ui.panel, subject: ui.subject, notebook: b.notebook, pageId: b.currentPageId };
  };

  const send = () => {
    timer = undefined;
    const { user } = useAuth.getState();
    if (!user || !db || applying) return;
    const v = view();
    const key = JSON.stringify(v);
    if (key === lastSent) return;
    lastSent = key;
    const at = Math.max(Date.now(), lastApplied + 1, lastSentAt + 1);
    lastSentAt = at;
    setDoc(doc(db, 'users', user.uid, 'data', 'session'), { ...v, device: me, updatedAt: at } as Session).catch((e) =>
      console.warn('[live] session write failed', e)
    );
  };
  const schedule = () => {
    if (applying) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(send, 250);
  };

  useUI.subscribe((s, prev) => {
    if (s.panel !== prev.panel || s.subject !== prev.subject) schedule();
  });
  useBoard.subscribe((s, prev) => {
    if (waiting && s.pages !== prev.pages && s.pages.some((p) => p.id === waiting!.pageId)) {
      const w = waiting;
      waiting = null;
      try {
        apply(w);
      } catch (e) {
        console.warn('[live] applying session failed', e);
      }
      return;
    }
    if (s.notebook !== prev.notebook || s.currentPageId !== prev.currentPageId) schedule();
  });

  const apply = (r: Session) => {
    applying = true;
    try {
      const ui = useUI.getState();
      if (SUBJECTS.includes(r.subject) && r.subject !== ui.subject) ui.setSubject(r.subject);
      const b = useBoard.getState();
      if (typeof r.notebook === 'string' && r.notebook !== b.notebook && b.notebooks.some((n) => n.id === r.notebook)) b.setNotebook(r.notebook);
      if (typeof r.pageId === 'string' && r.pageId !== useBoard.getState().currentPageId) {
        if (b.pages.some((p) => p.id === r.pageId)) b.goToPage(r.pageId);
        else waiting = r;
      }
      const panel = r.panel && PANELS.includes(r.panel) ? r.panel : null;
      if (panel !== useUI.getState().panel) {
        if (panel) ui.openPanel(panel);
        else ui.closePanel();
      }
    } finally {
      applying = false;
    }
    lastSent = JSON.stringify(view());
  };

  useAuth.subscribe((s, prev) => {
    if (s.user === prev.user) return;
    unsub?.();
    unsub = undefined;
    if (!s.user || !db) return;
    lastSent = '';
    unsub = onSnapshot(
      doc(db, 'users', s.user.uid, 'data', 'session'),
      (snap) => {
        try {
          if (snap.metadata.hasPendingWrites || !snap.exists()) return;
          const r = snap.data() as Session;
          if (!r || r.device === me || typeof r.updatedAt !== 'number' || r.updatedAt <= lastApplied) return;
          // Both devices changed view at the same moment: the later one stands.
          if (r.updatedAt < lastSentAt) return;
          lastApplied = r.updatedAt;
          waiting = null;
          apply(r);
        } catch (e) {
          console.warn('[live] applying session failed', e); // never let an error escape into Firestore
        }
      },
      (e) => console.warn('[live] session listener failed', e)
    );
  });
}
