/**
 * Project 타입 정의
 * 프로젝트 관련 메타데이터와 설정을 포함
 */
export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  
  // Codex 관련 설정
  codex_settings?: {
    approval_mode: 'suggest' | 'auto-edit' | 'full-auto';
    context_path?: string;
    safe_commands?: string[];
  };
}

/**
 * ProjectCreate 타입 정의
 * 새 프로젝트 생성 시 필요한 필드
 */
export interface ProjectCreate {
  name: string;
  path: string;
  description?: string;
}

/**
 * ProjectUpdate 타입 정의
 * 프로젝트 업데이트 시 사용되는 부분 필드
 */
export interface ProjectUpdate {
  name?: string;
  description?: string;
  is_favorite?: boolean;
  codex_settings?: {
    approval_mode?: 'suggest' | 'auto-edit' | 'full-auto';
    context_path?: string;
    safe_commands?: string[];
  };
}
