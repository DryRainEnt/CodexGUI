import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Avatar, AvatarCreate, AvatarUpdate, AvatarStatus } from '../types/avatar';
import { getAvatar, updateAvatar, createAvatar } from '../api/endpoints';

interface AvatarState {
  avatar: Avatar | null;
  isEnabled: boolean;
  status: AvatarStatus;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAvatar: () => Promise<void>;
  updateAvatar: (avatarData: AvatarUpdate) => Promise<void>;
  toggleEnabled: () => Promise<void>;
  setStatus: (status: AvatarStatus) => void;
  clearError: () => void;
}

// Default placeholder avatar image (robot emoji base64)
const DEFAULT_AVATAR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDQiIGhlaWdodD0iMTQ0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvdCI+PHBhdGggZD0iTTEyIDhWNEg4Ii8+PHBhdGggZD0iTTEyIDR2NGg0Ii8+PHBhdGggZD0iTTkuNyAxMyBoNC42Ii8+PHBhdGggZD0iTTggMmgyYTIgMiAwIDAgMSAyIDJ2Mi41YTIuNSAyLjUgMCAwIDAgMi41IDIuNWgxYTIuNSAyLjUgMCAwIDAgMi41LTIuNVY0YTIgMiAwIDAgMSAyLTJoMiIvPjxwYXRoIGQ9Ik04IDJoMmEyIDIgMCAwIDEgMiAydjIuNWEyLjUgMi41IDAgMCAwIDIuNSAyLjVoMWEyLjUgMi41IDAgMCAwIDIuNS0yLjVWNGEyIDIgMCAwIDEgMi0yaDIiLz48cGF0aCBkPSJNMyA3YTMgMyAwIDAgMC0zIDN2Mmw0IDRoMTQuNWE0LjUgNC41IDAgMDEtNC41IDQuNUgxNWwzLjUgMy41Ii8+PHBhdGggZD0iTTEzIDIySDd2LTRhMiAyIDAgMCAxIDItMmg2YTIgMiAwIDAgMSAyIDJ2NmEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMnYtNGEyIDIgMCAwIDEgMi0yaDBNOCAxOGguMDFNMTYgMThoLjAxIi8+PC9zdmc+';

const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      avatar: null,
      isEnabled: true,
      status: 'idle',
      loading: false,
      error: null,
      
      fetchAvatar: async () => {
        try {
          set({ loading: true, error: null });
          
          // API 구현 전 목업 데이터 사용
          if (typeof getAvatar !== 'function') {
            const defaultAvatar: Avatar = {
              id: 'default',
              name: 'Codex Assistant',
              persona: 'I am a helpful AI coding assistant that can help you with your development tasks.',
              image: DEFAULT_AVATAR_IMAGE,
              is_enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setTimeout(() => {
              set({ 
                avatar: defaultAvatar,
                isEnabled: defaultAvatar.is_enabled,
                loading: false
              });
            }, 300); // 약간의 지연 추가하여 로딩 상태 표시
            
            return;
          }
          
          const avatar = await getAvatar();
          set({ 
            avatar,
            isEnabled: avatar.is_enabled,
            loading: false
          });
        } catch (err: any) {
          console.error('Failed to fetch avatar:', err);
          
          // 오류 발생 시 기본 아바타 생성
          const defaultAvatar: Avatar = {
            id: 'default',
            name: 'Codex Assistant',
            persona: 'I am a helpful AI coding assistant that can help you with your development tasks.',
            image: DEFAULT_AVATAR_IMAGE,
            is_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set({ 
            avatar: defaultAvatar,
            isEnabled: true,
            error: err.message || 'Failed to fetch avatar',
            loading: false
          });
        }
      },
      
      updateAvatar: async (avatarData: AvatarUpdate) => {
        try {
          set({ loading: true, error: null });
          
          const currentAvatar = get().avatar;
          if (!currentAvatar) {
            throw new Error('No avatar exists to update');
          }
          
          // API 구현 전 목업 데이터 업데이트
          if (typeof updateAvatar !== 'function') {
            const updatedAvatar: Avatar = {
              ...currentAvatar,
              ...avatarData,
              updated_at: new Date().toISOString()
            };
            
            set({ 
              avatar: updatedAvatar,
              isEnabled: updatedAvatar.is_enabled ?? get().isEnabled,
              loading: false
            });
            
            return;
          }
          
          const updatedAvatar = await updateAvatar(currentAvatar.id, avatarData);
          set({ 
            avatar: updatedAvatar,
            isEnabled: updatedAvatar.is_enabled,
            loading: false
          });
        } catch (err: any) {
          console.error('Failed to update avatar:', err);
          set({ 
            error: err.message || 'Failed to update avatar',
            loading: false
          });
          throw err;
        }
      },
      
      toggleEnabled: async () => {
        try {
          const currentAvatar = get().avatar;
          const currentEnabled = get().isEnabled;
          
          // 낙관적 업데이트
          set({ isEnabled: !currentEnabled });
          
          if (currentAvatar) {
            await get().updateAvatar({ is_enabled: !currentEnabled });
          }
        } catch (err: any) {
          // 오류 발생 시 상태 롤백
          console.error('Failed to toggle avatar enabled state:', err);
          set(state => ({ 
            isEnabled: !state.isEnabled,
            error: err.message || 'Failed to update avatar'
          }));
        }
      },
      
      setStatus: (status: AvatarStatus) => {
        set({ status });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'codexgui-avatar',
      partialize: (state) => ({
        // 로컬 스토리지에 저장할 상태만 선택
        avatar: state.avatar,
        isEnabled: state.isEnabled
      })
    }
  )
);

export default useAvatarStore;
