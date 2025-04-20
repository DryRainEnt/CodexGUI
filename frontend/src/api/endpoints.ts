import api from './client';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project';
import { Avatar, AvatarCreate, AvatarUpdate } from '../types/avatar';

interface TokenUsage {
  total_tokens_used: number;
  remaining_tokens: number;
  total_spent: string;
  quota: string;
  soft_limit?: string;
  usage_percent: number;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  message: string;
  rate_limits?: TokenUsage | null;
  error?: any;
}

// API Key validation with retry logic and error handling
export const validateApiKey = async (apiKey: string, maxRetries = 2): Promise<ApiKeyValidationResult> => {
  let retryCount = 0;
  
  const attemptValidation = async (): Promise<ApiKeyValidationResult> => {
    try {
      const response = await api.post('/api/validate-key', { apiKey });
      return {
        valid: response.data.valid,
        message: response.data.message,
        rate_limits: response.data.rate_limits || null
      };
    } catch (error: any) {
      // 422 오류는 키 형식 문제 - 재시도하지 않음
      if (error.response && error.response.status === 422) {
        return {
          valid: false,
          message: "Invalid API key format. Must start with 'sk-'.",
          error: error
        };
      }
      
      // 네트워크 오류나 서버 오류 등은 재시도 가능
      if (retryCount < maxRetries) {
        retryCount++;
        // 지수 백오프로 재시도 (1s, 2s, 4s, ...)
        const delay = Math.pow(2, retryCount - 1) * 1000;
        console.log(`Validation attempt ${retryCount} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptValidation();
      }
      
      // 모든 재시도 실패
      console.error('API key validation failed after retries:', error);
      
      // 응답 형태에 따른 오류 메시지 처리
      if (error.response) {
        // HTTP 응답을 받았으나 오류 상태 코드인 경우
        const status = error.response.status;
        const serverMessage = error.response.data?.message || '';
        
        if (status === 401) {
          return { valid: false, message: "Invalid API key.", error };
        } else if (status === 429) {
          return { valid: false, message: "Rate limit exceeded. Please try again later.", error };
        } else {
          return { valid: false, message: `Server error (${status}): ${serverMessage}`, error };
        }
      } else if (error.request) {
        // 요청을 보냈으나 응답을 받지 못한 경우
        return { valid: false, message: "Network error. Please check your connection.", error };
      } else {
        // 요청 설정 중 오류가 발생한 경우
        return { valid: false, message: `Error: ${error.message}`, error };
      }
    }
  };
  
  return attemptValidation();
};

// Token usage information with retry logic and caching
export const getTokenUsage = async (maxRetries = 2): Promise<TokenUsage> => {
  let retryCount = 0;
  
  // 캐싱 기능 추가
  const cachedData = localStorage.getItem('token-usage-cache');
  const cachedTime = localStorage.getItem('token-usage-time');
  
  // 캐싱된 데이터가 있고 15분 이내의 결과인 경우
  if (cachedData && cachedTime) {
    const timeDiff = Date.now() - parseInt(cachedTime);
    if (timeDiff < 15 * 60 * 1000) {  // 15분 = 900,000ms
      console.log('Using cached token usage data');
      return JSON.parse(cachedData) as TokenUsage;
    }
  }
  
  const attemptFetch = async (): Promise<TokenUsage> => {
    try {
      const response = await api.get('/api/token-usage');
      const data = response.data as TokenUsage;
      
      // 결과 캐싱
      localStorage.setItem('token-usage-cache', JSON.stringify(data));
      localStorage.setItem('token-usage-time', Date.now().toString());
      
      return data;
    } catch (error: any) {
      // 네트워크 오류나 서버 오류 등은 재시도 가능
      if (retryCount < maxRetries) {
        retryCount++;
        // 지수 백오프로 재시도 (1s, 2s, 4s, ...)
        const delay = Math.pow(2, retryCount - 1) * 1000;
        console.log(`Token usage fetch attempt ${retryCount} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptFetch();
      }
      
      // 모든 재시도 실패 - 기본값 반환
      console.error('Failed to fetch token usage after retries:', error);
      
      // 기본 예상 사용량 반환
      return {
        total_tokens_used: 0,
        remaining_tokens: 1000000,
        total_spent: "$0.00",
        quota: "$120.00",
        usage_percent: 0
      };
    }
  };
  
  return attemptFetch();
};

export interface ApiKeyStatus {
  is_valid: boolean;
  status: string;
  remaining_tokens?: number;
  expires_at?: string;
  last_checked?: string;
  error?: any;
}

// API key validation status check with retry logic
export const checkApiKeyStatus = async (maxRetries = 1): Promise<ApiKeyStatus> => {
  let retryCount = 0;
  
  const attemptCheck = async (): Promise<ApiKeyStatus> => {
    try {
      const response = await api.get('/api/validate-key/status');
      return response.data;
    } catch (error: any) {
      // 네트워크 오류나 서버 오류 등은 재시도 가능
      if (retryCount < maxRetries) {
        retryCount++;
        const delay = Math.pow(2, retryCount - 1) * 1000;
        console.log(`Status check attempt ${retryCount} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptCheck();
      }
      
      // 모든 재시도 실패
      console.error('API key status check failed after retries:', error);
      
      if (error.response && error.response.status === 401) {
        return { 
          is_valid: false, 
          status: 'missing_key',
          error
        };
      }
      
      return { 
        is_valid: false, 
        status: 'error',
        last_checked: new Date().toISOString(),
        error
      };
    }
  };
  
  return attemptCheck();
};

// Projects related endpoints
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/api/projects');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProject = async (projectData: ProjectCreate): Promise<Project> => {
  try {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProject = async (projectId: string): Promise<Project> => {
  try {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (projectId: string, projectData: ProjectUpdate): Promise<Project> => {
  try {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await api.delete(`/api/projects/${projectId}`);
  } catch (error) {
    throw error;
  }
};

// Avatar related endpoints
export const getAvatar = async (): Promise<Avatar> => {
  try {
    const response = await api.get('/api/avatar');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAvatar = async (avatarData: AvatarCreate): Promise<Avatar> => {
  try {
    const response = await api.post('/api/avatar', avatarData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAvatar = async (avatarId: string, avatarData: AvatarUpdate): Promise<Avatar> => {
  try {
    const response = await api.put(`/api/avatar/${avatarId}`, avatarData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Git operations
export const getGitStatus = async (projectId: string) => {
  try {
    const response = await api.get(`/api/git/${projectId}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const gitCommit = async (projectId: string, commitData: any) => {
  try {
    const response = await api.post(`/api/git/${projectId}/commit`, commitData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// File system operations
export const getFilesList = async (projectId: string, path: string) => {
  try {
    const response = await api.get(`/api/fs/${projectId}/list`, { params: { path } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const readFile = async (projectId: string, path: string) => {
  try {
    const response = await api.get(`/api/fs/${projectId}/read`, { params: { path } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const writeFile = async (projectId: string, path: string, content: string) => {
  try {
    const response = await api.post(`/api/fs/${projectId}/write`, { path, content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Chat logs
export const getChatLogs = async (projectId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/api/chat/${projectId}/logs`, { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendChatMessage = async (projectId: string, message: string) => {
  try {
    const response = await api.post(`/api/chat/${projectId}/send`, { message });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Codex CLI integration
export interface CodexExecuteRequest {
  prompt: string;
  approval_mode: 'suggest' | 'auto-edit' | 'full-auto';
  project_path: string;
}

export interface CodexResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  changes: CodexFileChange[];
}

export interface CodexFileChange {
  id: string;
  filename: string;
  status: string;
  diff?: string;
}

export const executeCodex = async (projectId: string, request: CodexExecuteRequest): Promise<CodexResult> => {
  try {
    const response = await api.post(`/api/codex/${projectId}/execute`, request);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveCodexChanges = async (projectId: string, changeIds: string[]): Promise<void> => {
  try {
    await api.post(`/api/codex/${projectId}/approve-changes`, { change_ids: changeIds });
  } catch (error) {
    throw error;
  }
};

export const getSafeCommands = async (projectId: string): Promise<string[]> => {
  try {
    const response = await api.get(`/api/codex/${projectId}/safe-commands`);
    return response.data.commands;
  } catch (error) {
    throw error;
  }
};

export const updateSafeCommands = async (projectId: string, commands: string[]): Promise<void> => {
  try {
    await api.post(`/api/codex/${projectId}/safe-commands`, { commands });
  } catch (error) {
    throw error;
  }
};
