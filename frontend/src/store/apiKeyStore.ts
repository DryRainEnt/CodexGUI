import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptData, decryptData } from '../utils/encryption';

interface ApiKeyState {
  apiKey: string | null;
  isValidated: boolean;
  remainingTokens: number | null;
  setApiKey: (apiKey: string) => void;
  setValidated: (isValidated: boolean) => void;
  setRemainingTokens: (tokens: number | null) => void;
  clearApiKey: () => void;
}

const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      apiKey: null,
      isValidated: false,
      remainingTokens: null,
      setApiKey: (apiKey) => set({ apiKey }),
      setValidated: (isValidated) => set({ isValidated }),
      setRemainingTokens: (remainingTokens) => set({ remainingTokens }),
      clearApiKey: () => set({ apiKey: null, isValidated: false, remainingTokens: null }),
    }),
    {
      name: 'codexgui-api-key',
      // 암호화된 상태만 유지하도록 partialize
      partialize: (state) => ({ 
        apiKey: state.apiKey ? encryptData(state.apiKey) : null,
        isValidated: state.isValidated,
        remainingTokens: state.remainingTokens 
      }),
      // 복호화하여 API 키 복원
      onRehydrateStorage: () => (state) => {
        if (state && state.apiKey) {
          try {
            state.setApiKey(decryptData(state.apiKey as string));
          } catch (e) {
            console.error('Failed to decrypt API key:', e);
            state.clearApiKey();
          }
        }
      },
    }
  )
);

export default useApiKeyStore;
