import { create } from 'zustand';
import { collection, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import { idbGet, idbSet } from './idb';
import type { Message } from './ask';
import type { Subject } from './ui';

/**
 * Saved Ask Coach conversations. The open conversation lives in the ask store
 * (and the `chat` doc); every conversation, open or not, is also kept here so the
 * student can come back to any of them later.
 *
 * Device: IndexedDB (`eju-chats`). Account: one doc per conversation at
 * users/{uid}/chats/{id}, so long conversations never share the 1 MiB doc limit.
 * Messages are only ever appended (or the oldest trimmed), so when two copies of
 * one conversation differ, the one that contains the other wins regardless of
 * clocks; two copies that each have messages the other lacks are both kept.
 */
export interface SavedChat {
  id: string;
  title: string;
  subject: Subject | '';
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  /** Deleted by the student; kept as a marker so other devices drop it too. */
  deleted?: boolean;
}

const IDB_KEY = 'eju-chats';
const TITLE_MAX = 80;

export const newChatId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function chatTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user')?.content ?? '';
  const line = first.replace(/\s+/g, ' ').trim();
  return line.length > TITLE_MAX ? line.slice(0, TITLE_MAX - 1) + '…' : line;
}

const key = (m: Message) => `${m.role}\u0000${m.content}`;

/** Every message of `a` is in `b`, except possibly a run of its oldest ones (trimmed away in `b`). */
export function covers(b: Message[], a: Message[]): boolean {
  const have = new Set(b.map(key));
  let i = 0;
  while (i < a.length && !have.has(key(a[i]))) i++;
  if (i > 0 && b.length === 0) return false;
  for (let j = i; j < a.length; j++) if (!have.has(key(a[j]))) return false;
  return true;
}

/** JSON round trip: Firestore rejects `undefined`, and stored copies must not share references. */
const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function valid(c: any): c is SavedChat {
  return c && typeof c.id === 'string' && c.id && typeof c.updatedAt === 'number' && (c.deleted === true || Array.isArray(c.messages));
}
function normalize(c: any): SavedChat {
  const messages: Message[] = Array.isArray(c.messages)
    ? c.messages.filter((m: any) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    : [];
  const out: SavedChat = {
    id: c.id,
    title: typeof c.title === 'string' ? c.title : chatTitle(messages),
    subject: typeof c.subject === 'string' ? c.subject : '',
    messages,
    createdAt: typeof c.createdAt === 'number' ? c.createdAt : c.updatedAt,
    updatedAt: c.updatedAt,
  };
  if (c.deleted === true) {
    out.deleted = true;
    out.messages = [];
  }
  return out;
}

/** Choose between two strings the same way on every device: a non-empty one, then the larger. */
const pick = (a: string, b: string) => (!a ? b : !b ? a : a > b ? a : b);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** One copy made from two: `lead` gives the messages, the rest is combined so that
 *  every device computing it gets exactly the same result (otherwise two devices
 *  could keep re-uploading their own slightly different copies forever). */
function combine(lead: SavedChat, other: SavedChat): SavedChat {
  const out: SavedChat = {
    id: lead.id,
    title: lead.deleted ? '' : pick(lead.title, other.deleted ? '' : other.title),
    subject: lead.deleted ? '' : (pick(lead.subject, other.deleted ? '' : other.subject) as Subject | ''),
    messages: lead.deleted ? [] : lead.messages,
    createdAt: Math.min(lead.createdAt, other.createdAt),
    updatedAt: Math.max(lead.updatedAt, other.updatedAt),
  };
  if (lead.deleted) out.deleted = true;
  return out;
}

/**
 * Combine our copy of a conversation with another one. Returns the copy to keep
 * and, when both have messages the other lacks, the older one as a separate
 * conversation so nothing is lost. The result does not depend on which side is
 * "ours", so all devices settle on the same copy.
 */
export function mergeChat(ours: SavedChat | undefined, theirs: SavedChat): { keep: SavedChat; fork?: SavedChat; changed: boolean } {
  if (!ours) return { keep: theirs, changed: true };
  const result = (keep: SavedChat, fork?: SavedChat) => ({ keep, fork, changed: !same(keep, ours) });
  const msgs = (c: SavedChat) => JSON.stringify(c.messages);
  if (ours.deleted || theirs.deleted) {
    // A deletion stands unless the conversation was continued after it (at the same moment, the deletion wins).
    const theirsLead = theirs.updatedAt !== ours.updatedAt ? theirs.updatedAt > ours.updatedAt : Boolean(theirs.deleted);
    return result(theirsLead ? combine(theirs, ours) : combine(ours, theirs));
  }
  const oursInTheirs = covers(theirs.messages, ours.messages);
  const theirsInOurs = covers(ours.messages, theirs.messages);
  if (oursInTheirs && theirsInOurs) {
    // Same content (one may be trimmed): the newer copy leads.
    const theirsLead = theirs.updatedAt !== ours.updatedAt ? theirs.updatedAt > ours.updatedAt : msgs(theirs) > msgs(ours);
    return result(theirsLead ? combine(theirs, ours) : combine(ours, theirs));
  }
  if (oursInTheirs) return result(combine(theirs, ours));
  if (theirsInOurs) return result(combine(ours, theirs));
  // Both continued separately: the newer one keeps the id and the other is kept as
  // its own conversation. The fork id depends only on the losing copy, so both
  // devices that resolve this conflict create the same conversation, not two.
  const theirsWins = theirs.updatedAt !== ours.updatedAt ? theirs.updatedAt > ours.updatedAt : msgs(theirs) > msgs(ours);
  const [win, lose] = theirsWins ? [theirs, ours] : [ours, theirs];
  return result(win, { ...lose, id: `${lose.id}-${lose.updatedAt.toString(36)}` });
}

interface ChatsState {
  chats: Record<string, SavedChat>;
  /** Record the current state of a conversation (never takes messages away from a fuller copy). */
  upsert: (c: { id: string; subject: Subject | ''; messages: Message[] }) => void;
  /** Keep a copy of a conversation that came from elsewhere (open chat loaded from device or account)
   *  if it is not known yet. Never changes a conversation already known here. */
  adopt: (c: { id: string; messages: Message[]; updatedAt: number }) => void;
  /** Delete a conversation (on every device). */
  remove: (id: string) => void;
}

// ─────────────────────────── local + cloud persistence ───────────────────────────
const dirty = new Set<string>(); // conversations to write to the account
let uid: string | null = null;
let merged = false; // never write to the account before its copy has been merged in
let localTimer: ReturnType<typeof setTimeout> | undefined;
let cloudTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleLocal() {
  if (localTimer) clearTimeout(localTimer);
  localTimer = setTimeout(() => void idbSet(IDB_KEY, { chats: useChats.getState().chats }), 300);
}
function scheduleCloud(ids: string[]) {
  for (const id of ids) dirty.add(id);
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(flushCloud, 500);
}
function flushCloud() {
  if (!uid || !db || !merged) return; // kept in `dirty` until the account has been merged
  const chats = useChats.getState().chats;
  for (const id of [...dirty]) {
    dirty.delete(id);
    const c = chats[id];
    if (!c) continue;
    const data: Record<string, unknown> = c.deleted
      ? { id: c.id, title: '', subject: '', messages: [], createdAt: c.createdAt, updatedAt: c.updatedAt, deleted: true }
      : plain({ id: c.id, title: c.title, subject: c.subject, messages: c.messages, createdAt: c.createdAt, updatedAt: c.updatedAt });
    setDoc(doc(db, 'users', uid, 'chats', id), data).catch((e) => console.warn('[chats] cloud save failed', id, e));
  }
}

export const useChats = create<ChatsState>((set, get) => ({
  chats: {},
  upsert: ({ id, subject, messages }) => {
    if (!id || !messages.length) return;
    const ours = get().chats[id];
    const now = Math.max(Date.now(), (ours?.updatedAt ?? 0) + 1);
    const incoming: SavedChat = {
      id,
      title: chatTitle(messages),
      subject: ours?.subject || subject,
      messages: plain(messages),
      createdAt: ours?.createdAt ?? now,
      updatedAt: now,
    };
    if (ours && !ours.deleted && JSON.stringify(ours.messages) === JSON.stringify(incoming.messages)) return;
    // A stale copy of the open conversation (e.g. from an older device) never shortens the saved one.
    const { keep, fork, changed } = ours?.deleted ? { keep: incoming, fork: undefined, changed: true } : mergeChat(ours, incoming);
    if (!changed && !fork) return;
    set((s) => ({ chats: { ...s.chats, [keep.id]: keep, ...(fork ? { [fork.id]: fork } : {}) } }));
    scheduleLocal();
    scheduleCloud(fork ? [keep.id, fork.id] : [keep.id]);
  },
  adopt: ({ id, messages, updatedAt }) => {
    if (!id || !messages.length || get().chats[id]) return;
    const at = updatedAt > 0 ? updatedAt : 1;
    const c: SavedChat = { id, title: chatTitle(messages), subject: '', messages: plain(messages), createdAt: at, updatedAt: at };
    set((s) => ({ chats: { ...s.chats, [id]: c } }));
    scheduleLocal();
    scheduleCloud([id]);
  },
  remove: (id) => {
    const ours = get().chats[id];
    const now = Math.max(Date.now(), (ours?.updatedAt ?? 0) + 1);
    const tomb: SavedChat = { id, title: '', subject: '', messages: [], createdAt: ours?.createdAt ?? now, updatedAt: now, deleted: true };
    set((s) => ({ chats: { ...s.chats, [id]: tomb } }));
    scheduleLocal();
    scheduleCloud([id]);
  },
}));

/** Merge copies from elsewhere (device storage or the account). Returns ids whose local copy should go to the account. */
function mergeIn(list: SavedChat[]): string[] {
  const chats = { ...useChats.getState().chats };
  const upload: string[] = [];
  let touched = false;
  for (const raw of list) {
    const theirs = normalize(raw);
    const { keep, fork, changed } = mergeChat(chats[theirs.id], theirs);
    if (changed) {
      chats[keep.id] = keep;
      touched = true;
    }
    if (keep !== theirs && JSON.stringify(keep) !== JSON.stringify(theirs)) upload.push(keep.id);
    if (fork) {
      chats[fork.id] = fork;
      upload.push(fork.id);
      touched = true;
    }
  }
  if (touched) {
    useChats.setState({ chats });
    scheduleLocal();
  }
  return upload;
}

/** Saved conversations, newest first (deleted ones left out). */
export const listChats = (chats: Record<string, SavedChat>) =>
  Object.values(chats)
    .filter((c) => !c.deleted && c.messages.length)
    .sort((a, b) => b.updatedAt - a.updatedAt);

let started = false;
export function initChats() {
  if (started) return;
  started = true;
  const hydrated = idbGet<{ chats?: Record<string, SavedChat> }>(IDB_KEY)
    .then((v) => {
      const list = v?.chats && typeof v.chats === 'object' ? Object.values(v.chats).filter(valid) : [];
      // Anything changed here before storage answered is newer; merging keeps the fuller copy either way.
      const upload = mergeIn(list);
      if (upload.length) scheduleCloud(upload);
    })
    .catch((e) => console.warn('[chats] local load failed', e));

  let unsub: Unsubscribe | undefined;
  useAuth.subscribe((s, prev) => {
    if (s.user === prev.user) return;
    unsub?.();
    unsub = undefined;
    merged = false;
    uid = s.user?.uid ?? null;
    if (!s.user || !db) return;
    const me = s.user.uid;
    unsub = onSnapshot(
      collection(db, 'users', me, 'chats'),
      (snap) => {
        try {
          // Until the server has answered once, a cache miss says nothing about the account.
          if (!merged && snap.metadata.fromCache) return;
          const list: SavedChat[] = [];
          snap.forEach((d) => {
            if (d.metadata.hasPendingWrites) return; // this device's own write
            const data = d.data();
            if (valid(data)) list.push(data);
          });
          const first = !merged;
          void hydrated.then(() => {
            try {
              if (uid !== me) return;
              const upload = mergeIn(list);
              if (first) {
                merged = true;
                // Everything this device has that the account lacks (or has less of) goes up now.
                const inCloud = new Set(list.map((c) => c.id));
                for (const id of Object.keys(useChats.getState().chats)) if (!inCloud.has(id)) upload.push(id);
              }
              if (upload.length || dirty.size) scheduleCloud(upload);
            } catch (e) {
              console.warn('[chats] applying account copy failed', e);
            }
          });
        } catch (e) {
          // An exception inside a Firestore listener would take the client down; never let one out.
          console.warn('[chats] cloud listener callback failed', e);
        }
      },
      (e) => console.warn('[chats] cloud listener failed', e)
    );
  });
}
