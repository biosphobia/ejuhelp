// One simulated device: the app's real stores and sync code, wired to the fake
// Firebase. The test runner bundles this file once and imports it with a
// different URL query per device (?dev=A&gen=1), which gives each device its own
// module instances, storage and listeners.
import { useBoard } from '../../src/lib/board';
import { useUI } from '../../src/lib/ui';
import { useAsk } from '../../src/lib/ask';
import { useGenerated } from '../../src/lib/generated';
import { useAuth } from '../../src/lib/auth';
import { useApiStore } from '../../src/lib/apiStore';
import { useProfile } from '../../src/lib/profile';
import { initPersistence, restoreBackup, listBackups, listJournal, scanForLostPages, addPages, useSyncStatus, applyRemotePages, backupNow } from '../../src/lib/persistence';
import { initUserData, useProgress } from '../../src/lib/userdata';
import { initSync } from '../../src/lib/sync';
import { fsControl } from './fakeFirestore';
import { authControl } from './fakeAuth';

export function boot() {
  initPersistence();
  initUserData();
  initSync();
  return {
    useBoard,
    useUI,
    useAsk,
    useGenerated,
    useAuth,
    useApiStore,
    useProfile,
    useProgress,
    useSyncStatus,
    restoreBackup,
    listBackups,
    listJournal,
    scanForLostPages,
    addPages,
    backupNow,
    applyRemotePages,
    fs: fsControl,
    auth: authControl,
  };
}
export type Device = ReturnType<typeof boot>;
