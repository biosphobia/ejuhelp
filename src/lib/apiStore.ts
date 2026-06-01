import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiState {
  activeModel: 'gemini' | 'claude' | 'gpt';
  claudeKey: string;
  gptKey: string;
  geminiKey: string;
  setModel: (model: 'gemini' | 'claude' | 'gpt') => void;
  setKeys: (claude: string, gpt: string, gemini: string) => void;
}

export const useApiStore = create<ApiState>()(
  persist(
    (set) => ({
      activeModel: 'gemini', // Default to your Gemini API
      claudeKey: '',
      gptKey: '',
      geminiKey: '',
      setModel: (activeModel) => set({ activeModel }),
      setKeys: (claudeKey, gptKey, geminiKey) => set({ claudeKey, gptKey, geminiKey }),
    }),
    {
      name: 'eju-api-keys', // Automatically saves to the browser's localStorage
    }
  )
);
