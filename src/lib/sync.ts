import { create } from 'zustand';

// A tiny, UI-facing signal for whether the board is backed up to the cloud, so the student
// can actually SEE that their work is safe (or that it's local-only / failing).
export type CloudSync = 'local' | 'saving' | 'saved' | 'error';

/** Health of the on-device stores (localStorage / IndexedDB). 'failing' means the LAST
 *  save attempt could not be committed to ANY durable local store — the user must be
 *  warned loudly, because from that moment new work exists only in memory. */
export type LocalHealth = 'ok' | 'failing';

interface SyncState {
  cloud: CloudSync;
  detail?: string; // error code/message when cloud === 'error'
  at: number; // last state change (ms)
  local: LocalHealth;
  localDetail?: string;
  /** ms timestamp of the last successful durable local write (0 = none yet). */
  localSavedAt: number;
  /** Other devices of the SAME account currently connected to the live-sync channel. */
  peers: number;
  setCloud: (c: CloudSync, detail?: string) => void;
  setLocal: (l: LocalHealth, detail?: string) => void;
  setPeers: (n: number) => void;
}

export const useSync = create<SyncState>((set) => ({
  cloud: 'local',
  detail: undefined,
  at: 0,
  local: 'ok',
  localDetail: undefined,
  localSavedAt: 0,
  peers: 0,
  setPeers: (peers) => set({ peers }),
  setCloud: (cloud, detail) => set({ cloud, detail, at: Date.now() }),
  setLocal: (local, detail) =>
    set((s) => ({
      local,
      localDetail: detail,
      localSavedAt: local === 'ok' ? Date.now() : s.localSavedAt,
    })),
}));
