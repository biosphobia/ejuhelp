import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiState {
  activeModel: 'gemini' | 'claude' | 'gpt';
  claudeKey: string;
  gptKey: string;
  setModel: (model: 'gemini' | 'claude' | 'gpt') => void;
  setKeys: (claude: string, gpt: string) => void;
}

export const useApiStore = create<ApiState>()(
  persist(
    (set) => ({
      activeModel: 'gemini', // Default to your Gemini API
      claudeKey: '',
      gptKey: '',
      setModel: (activeModel) => set({ activeModel }),
      setKeys: (claudeKey, gptKey) => set({ claudeKey, gptKey }),
    }),
    {
      name: 'eju-api-keys', // Automatically saves to the browser's localStorage
    }
  )
);
