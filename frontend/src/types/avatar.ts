/**
 * Avatar 타입 정의
 * 비서 아바타 페르소나 관련 정보
 */
export interface Avatar {
  id: string;
  name: string;
  persona: string;
  image: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * AvatarCreate 타입 정의
 * 새 아바타 생성 시 필요한 필드
 */
export interface AvatarCreate {
  name: string;
  persona: string;
  image?: string | null;
  is_enabled?: boolean;
}

/**
 * AvatarUpdate 타입 정의
 * 아바타 업데이트 시 사용되는 부분 필드
 */
export interface AvatarUpdate {
  name?: string;
  persona?: string;
  image?: string | null;
  is_enabled?: boolean;
}

/**
 * AvatarStatus 타입 정의
 * 아바타의 현재 상태 타입
 */
export type AvatarStatus = 'idle' | 'answering' | 'working' | 'error' | 'happy';
