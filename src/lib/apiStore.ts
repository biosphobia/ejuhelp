import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModelId = 'gemini' | 'claude' | 'gpt';

export interface ApiData {
  activeModel?: ModelId;
  claudeKey?: string;
  gptKey?: string;
  geminiKey?: string;
}

interface ApiState {
  activeModel: ModelId;
  claudeKey: string;
  gptKey: string;
  geminiKey: string;
  /** Bumped on every user change so the account sync (see sync.ts) picks it up. */
  rev: number;
  setModel: (model: ModelId) => void;
  setKeys: (claude: string, gpt: string, gemini: string) => void;
  /** Apply a copy from the device/cloud sync without losing the local defaults. */
  load: (data: ApiData | null | undefined) => void;
}

const MODELS: ModelId[] = ['gemini', 'claude', 'gpt'];
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

export const useApiStore = create<ApiState>()(
  persist(
    (set) => ({
      activeModel: 'gemini', // Default to your Gemini API
      claudeKey: '',
      gptKey: '',
      geminiKey: '',
      rev: 0,
      setModel: (activeModel) => set((s) => ({ activeModel, rev: s.rev + 1 })),
      setKeys: (claudeKey, gptKey, geminiKey) => set((s) => ({ claudeKey, gptKey, geminiKey, rev: s.rev + 1 })),
      load: (data) =>
        set((s) => ({
          activeModel: MODELS.includes(data?.activeModel as ModelId) ? (data!.activeModel as ModelId) : s.activeModel,
          claudeKey: str(data?.claudeKey, s.claudeKey),
          gptKey: str(data?.gptKey, s.gptKey),
          geminiKey: str(data?.geminiKey, s.geminiKey),
          rev: s.rev + 1,
        })),
    }),
    {
      name: 'eju-api-keys', // device copy; the signed-in account copy is kept by sync.ts
      partialize: (s) => ({ activeModel: s.activeModel, claudeKey: s.claudeKey, gptKey: s.gptKey, geminiKey: s.geminiKey }),
    }
  )
);
