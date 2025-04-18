# CodexGUI Sprint 1 구현 계획서

## 목표
Sprint 1의 주요 목표는 **Launch 화면 구현**으로, 사용자가 애플리케이션을 처음 실행할 때 필요한 API 키 설정 및 검증을 위한 인터페이스를 제공하는 것입니다.

## 주요 작업 항목

### 1. Launch 페이지 UI 완성 및 스타일링
- **목표**: 사용자 친화적인 API 키 입력 화면 구현
- **작업 내용**:
  - UI 디자인 구현 (TailwindCSS, Radix UI 활용)
  - 입력 폼 및 검증 메시지 UI 구현
  - 로딩 및 오류 상태 인디케이터 추가
  - 다크/라이트 모드 지원

### 2. OpenAI API 키 유효성 검증 REST API 개발
- **목표**: 백엔드에서 API 키 검증 기능 구현
- **작업 내용**:
  - `/api/api-keys/validate` 엔드포인트 구현
  - OpenAI API 연결 테스트 로직 구현
  - 유효성 검증 결과 및 오류 응답 처리
  - Rate limiting 및 보안 설정

### 3. API 키 암호화 저장 구현
- **목표**: 보안을 위한 API 키 암호화 저장 메커니즘 구현
- **작업 내용**:
  - 암호화 유틸리티 함수 개발
  - 로컬 스토리지 또는 SQLite 저장 메커니즘 구현
  - 키 암호화 및 복호화 로직 구현
  - 저장된 키 관리 및 삭제 기능

### 4. API 키 검증 실패 시 재입력 강제 구현
- **목표**: 유효하지 않은 API 키 입력 시 강제 재입력 메커니즘 구현
- **작업 내용**:
  - 프론트엔드의 라우팅 보호 로직 구현
  - 키 검증 실패 시 사용자 피드백 개선
  - 저장된 키가 무효화된 경우 처리 메커니즘
  - 재시도 및 오류 복구 로직

## 기술적 구현 세부사항

### 프론트엔드 (React/TypeScript/Vite)

#### 1. Launch 페이지 (src/pages/Launch.tsx)
```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKeyStore } from '../store/apiKeyStore';
import { validateApiKey } from '../api/apiKeys';
import { Button, Input, Alert } from '../components/ui';

const Launch: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setValidApiKey } = useApiKeyStore();
  const navigate = useNavigate();

  // API 키 검증 및 저장 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const isValid = await validateApiKey(apiKey);
      if (isValid) {
        setValidApiKey(apiKey);
        navigate('/projects');
      } else {
        setError('Invalid API key. Please check and try again.');
      }
    } catch (err) {
      setError(`Error validating API key: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Welcome to CodexGUI
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              OpenAI API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              required
              className="w-full"
            />
          </div>
          
          {error && (
            <Alert variant="error" className="my-3">
              {error}
            </Alert>
          )}
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Validating...' : 'Continue'}
          </Button>
        </form>
        
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          Your API key is stored securely and only used for CodexGUI operations.
        </p>
      </div>
    </div>
  );
};

export default Launch;
```

#### 2. API 키 상태 관리 (src/store/apiKeyStore.ts)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptData, decryptData } from '../utils/encryption';

interface ApiKeyState {
  apiKey: string | null;
  isApiKeyValid: boolean;
  setValidApiKey: (key: string) => void;
  clearApiKey: () => void;
  getDecryptedApiKey: () => string | null;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      isApiKeyValid: false,
      
      setValidApiKey: (key: string) => {
        const encryptedKey = encryptData(key);
        set({ apiKey: encryptedKey, isApiKeyValid: true });
      },
      
      clearApiKey: () => {
        set({ apiKey: null, isApiKeyValid: false });
      },
      
      getDecryptedApiKey: () => {
        const { apiKey } = get();
        if (!apiKey) return null;
        return decryptData(apiKey);
      },
    }),
    {
      name: 'codexgui-api-key',
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
```

#### 3. API 클라이언트 (src/api/apiKeys.ts)
```typescript
import { apiClient } from './client';

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await apiClient.post('/api/api-keys/validate', { apiKey });
    return response.data.valid;
  } catch (error) {
    console.error('API key validation error:', error);
    throw new Error('Failed to validate API key');
  }
};

export const getTokenUsage = async (apiKey: string): Promise<{
  total_used: number;
  available: number;
}> => {
  try {
    const response = await apiClient.get('/api/api-keys/usage', {
      headers: {
        'X-API-Key': apiKey
      }
    });
    return response.data;
  } catch (error) {
    console.error('Token usage fetch error:', error);
    throw new Error('Failed to fetch token usage');
  }
};
```

#### 4. 암호화 유틸리티 (src/utils/encryption.ts)
```typescript
/**
 * 간단한 암호화 유틸리티 함수
 * 참고: 프로덕션 환경에서는 더 강력한 암호화가 필요할 수 있음
 */

// 암호화 키 (환경 변수 또는 빌드 시 주입)
const ENCRYPTION_KEY = 'codexgui-secret-key';

export const encryptData = (data: string): string => {
  // 실제 구현에서는 더 강력한 암호화 알고리즘 사용 권장
  // 아래는 기본적인 XOR + Base64 인코딩 방식
  const encrypted = Array.from(data)
    .map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    )
    .join('');
  
  return btoa(encrypted);
};

export const decryptData = (encryptedData: string): string => {
  try {
    const decoded = atob(encryptedData);
    
    return Array.from(decoded)
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('');
  } catch (e) {
    console.error('Decryption error:', e);
    return '';
  }
};
```

### 백엔드 (Python/FastAPI)

#### 1. API 키 라우터 (app/routers/api_keys.py)
```python
from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel
import httpx
from app.core.config import settings
import logging

router = APIRouter(prefix="/api/api-keys", tags=["api-keys"])

# 요청 및 응답 모델
class ApiKeyRequest(BaseModel):
    apiKey: str

class ApiKeyResponse(BaseModel):
    valid: bool

class TokenUsageResponse(BaseModel):
    total_used: float
    available: float

@router.post("/validate", response_model=ApiKeyResponse)
async def validate_api_key(request: ApiKeyRequest):
    """
    OpenAI API 키 유효성을 검증합니다.
    """
    try:
        # 실제 OpenAI API 엔드포인트로 키 유효성 검사
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {request.apiKey}"},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return ApiKeyResponse(valid=True)
            else:
                logging.warning(f"API key validation failed: {response.status_code}")
                return ApiKeyResponse(valid=False)
    except Exception as e:
        logging.error(f"API key validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating API key: {str(e)}"
        )

@router.get("/usage", response_model=TokenUsageResponse)
async def get_token_usage(request: Request):
    """
    API 키에 대한 토큰 사용량 정보를 가져옵니다.
    """
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required"
        )
    
    try:
        # 2023년 기준 OpenAI 사용량 API (더 정확한 엔드포인트가 있을 경우 업데이트 필요)
        async with httpx.AsyncClient() as client:
            # 요청 시점에서 최신 OpenAI 사용량 API 확인 필요
            # 아래는 가상의 엔드포인트이며, 실제 구현 필요
            response = await client.get(
                "https://api.openai.com/v1/dashboard/billing/usage",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                # 실제 응답 형식에 맞게 파싱 로직 구현 필요
                return TokenUsageResponse(
                    total_used=data.get("total_used", 0),
                    available=data.get("available", 0)
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch token usage"
                )
    except Exception as e:
        logging.error(f"Token usage fetch error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching token usage: {str(e)}"
        )
```

## 테스트 전략

### 프론트엔드 테스트 (Vitest)
- Launch 컴포넌트 렌더링 테스트
- API 키 유효성 검증 성공/실패 시나리오 테스트
- 암호화/복호화 유틸리티 테스트
- Zustand 스토어 상태 관리 테스트

### 백엔드 테스트 (pytest)
- API 키 유효성 검증 엔드포인트 테스트
- 토큰 사용량 조회 엔드포인트 테스트
- 오류 처리 및 예외 상황 테스트

## 작업 흐름

1. 백엔드 API 엔드포인트 구현 및 테스트
2. 프론트엔드 암호화 유틸리티 구현 및 테스트
3. 프론트엔드 상태 관리 및 API 클라이언트 구현
4. Launch 페이지 UI 구현 및 테스트
5. 통합 테스트 및 디버깅

## 완료 기준
- 사용자가 유효한 API 키를 입력하면 프로젝트 목록 화면으로 이동
- 유효하지 않은 API 키를 입력하면 오류 메시지와 함께 재시도 요청
- API 키는 안전하게 암호화되어 로컬에 저장됨
- API 키 만료 시 자동으로 재인증 요청
- 다크/라이트 모드 테마 모두에서 UI가 적절히 표시됨

## 향후 개선 사항
- 더 강력한 암호화 알고리즘 적용
- 여러 API 키 관리 기능
- 비용 제한 및 사용량 경고 기능
- SSO 또는 기타 인증 방식 통합 옵션
