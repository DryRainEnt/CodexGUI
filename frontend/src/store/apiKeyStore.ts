import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      // Simple encryption for API key (not secure for production)
      partialize: (state) => ({ 
        apiKey: state.apiKey ? btoa(state.apiKey) : null,
        isValidated: state.isValidated,
        remainingTokens: state.remainingTokens 
      }),
      // Decrypt the API key when loading from storage
      onRehydrateStorage: () => (state) => {
        if (state && state.apiKey) {
          try {
            state.setApiKey(atob(state.apiKey as string));
          } catch (e) {
            state.clearApiKey();
          }
        }
      },
    }
  )
);

export default useApiKeyStore;
