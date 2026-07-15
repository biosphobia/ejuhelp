import { create } from 'zustand';

// A tiny, UI-facing signal for whether the board is backed up to the cloud, so the student
// can actually SEE that their work is safe (or that it's local-only / failing).
export type CloudSync = 'local' | 'saving' | 'saved' | 'error';

interface SyncState {
  cloud: CloudSync;
  detail?: string; // error code/message when cloud === 'error'
  at: number; // last state change (ms)
  setCloud: (c: CloudSync, detail?: string) => void;
}

export const useSync = create<SyncState>((set) => ({
  cloud: 'local',
  detail: undefined,
  at: 0,
  setCloud: (cloud, detail) => set({ cloud, detail, at: Date.now() }),
}));
