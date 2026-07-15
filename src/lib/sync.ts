import { create } from 'zustand';

// A tiny, UI-facing signal for whether the board is backed up to the cloud, so the student
// can actually SEE that their work is safe (or that it's local-only / failing).
export type CloudSync = 'local' | 'saving' | 'saved' | 'error';

interface SyncState {
  cloud: CloudSync;
  at: number; // last state change (ms)
  setCloud: (c: CloudSync) => void;
}

export const useSync = create<SyncState>((set) => ({
  cloud: 'local',
  at: 0,
  setCloud: (cloud) => set({ cloud, at: Date.now() }),
}));
