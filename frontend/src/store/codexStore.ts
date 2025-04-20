import { create } from 'zustand';
import { executeCodex, approveCodexChanges, getSafeCommands, updateSafeCommands, CodexResult, CodexFileChange } from '../api/endpoints';
import useProjectStore from './projectStore';
import useApiKeyStore from './apiKeyStore';

interface CodexState {
  isLoading: boolean;
  result: CodexResult | null;
  fileChanges: CodexFileChange[];
  history: { prompt: string; timestamp: string }[];
  approvalMode: 'suggest' | 'auto-edit' | 'full-auto';
  safeCommands: string[];
  error: string | null;
  
  // Actions
  executeCodex: (prompt: string, approvalMode?: 'suggest' | 'auto-edit' | 'full-auto') => Promise<void>;
  approveChanges: (changeIds: string[]) => Promise<void>;
  fetchSafeCommands: (projectId: string) => Promise<void>;
  addSafeCommand: (command: string) => Promise<void>;
  removeSafeCommand: (command: string) => Promise<void>;
  clearResult: () => void;
  setApprovalMode: (mode: 'suggest' | 'auto-edit' | 'full-auto') => void;
  clearError: () => void;
}

const useCodexStore = create<CodexState>((set, get) => ({
  isLoading: false,
  result: null,
  fileChanges: [],
  history: [],
  approvalMode: 'suggest',
  safeCommands: [],
  error: null,
  
  executeCodex: async (prompt, approvalMode) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject) {
        throw new Error('No project selected');
      }
      
      const mode = approvalMode || get().approvalMode;
      
      const result = await executeCodex(currentProject.id, {
        prompt,
        approval_mode: mode,
        project_path: currentProject.path
      });
      
      // Add to history
      const historyEntry = {
        prompt,
        timestamp: new Date().toISOString()
      };
      
      set({ 
        result,
        fileChanges: result.changes || [],
        history: [historyEntry, ...get().history.slice(0, 99)], // Keep last 100 entries
        isLoading: false
      });
    } catch (error: any) {
      console.error('Codex execution failed:', error);
      set({ 
        error: error.message || 'Codex execution failed',
        isLoading: false
      });
    }
  },
  
  approveChanges: async (changeIds) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject) {
        throw new Error('No project selected');
      }
      
      await approveCodexChanges(currentProject.id, changeIds);
      
      // Update fileChanges list by removing approved changes
      set(state => ({
        fileChanges: state.fileChanges.filter(
          change => !changeIds.includes(change.id)
        ),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to approve changes:', error);
      set({ 
        error: error.message || 'Failed to approve changes',
        isLoading: false
      });
    }
  },
  
  fetchSafeCommands: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      
      const commands = await getSafeCommands(projectId);
      
      set({ 
        safeCommands: commands,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch safe commands:', error);
      set({ 
        error: error.message || 'Failed to fetch safe commands',
        isLoading: false
      });
    }
  },
  
  addSafeCommand: async (command) => {
    try {
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject) {
        throw new Error('No project selected');
      }
      
      const updatedCommands = [...get().safeCommands, command];
      
      await updateSafeCommands(currentProject.id, updatedCommands);
      
      set({ safeCommands: updatedCommands });
    } catch (error: any) {
      console.error('Failed to add safe command:', error);
      set({ error: error.message || 'Failed to add safe command' });
    }
  },
  
  removeSafeCommand: async (command) => {
    try {
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject) {
        throw new Error('No project selected');
      }
      
      const updatedCommands = get().safeCommands.filter(cmd => cmd !== command);
      
      await updateSafeCommands(currentProject.id, updatedCommands);
      
      set({ safeCommands: updatedCommands });
    } catch (error: any) {
      console.error('Failed to remove safe command:', error);
      set({ error: error.message || 'Failed to remove safe command' });
    }
  },
  
  clearResult: () => {
    set({ result: null, fileChanges: [] });
  },
  
  setApprovalMode: (mode) => {
    set({ approvalMode: mode });
    
    // 현재 프로젝트가 있으면 프로젝트의 Codex 설정도 업데이트
    const currentProject = useProjectStore.getState().currentProject;
    if (currentProject) {
      useProjectStore.getState().updateProject(currentProject.id, {
        codex_settings: {
          ...currentProject.codex_settings,
          approval_mode: mode
        }
      }).catch(err => {
        console.error('Failed to update project Codex settings:', err);
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));

export default useCodexStore;
