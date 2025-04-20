# CodexGUI와 OpenAI Codex CLI 통합 계획서

## 1. 배경 및 목적

CodexGUI 프로젝트는 원래 OpenAI의 Codex CLI 도구에 대한 그래픽 사용자 인터페이스(GUI)를 개발하는 것이 주요 목적이었습니다. 현재까지의 개발 과정에서 이 핵심 목표가 약간 희석되어, 일반적인 개발자 도구로서의 기능에 초점이 맞춰져 있습니다. 이 계획서는 원래의 비전으로 돌아가 Codex CLI의 기능을 GUI 환경에서 원활하게 활용할 수 있도록 하는 통합 방안을 제시합니다.

## 2. OpenAI Codex CLI 개요

Codex CLI는 OpenAI가 개발한 터미널 기반 AI 코딩 에이전트로, 다음과 같은 특징을 가집니다:

- **자연어 명령어**: 영어로 된 지시사항을 코드와 파일 조작으로 변환
- **샌드박스 실행**: 네트워크 격리와 디렉토리 제한을 통한 안전한 코드 실행
- **승인 모드**: 
  - **Suggest**(기본): 모든 파일 쓰기와 명령어 실행 전 승인 필요
  - **Auto Edit**: 파일 편집은 자동 적용, 명령어 실행은 승인 필요
  - **Full Auto**: 파일 쓰기와 제한된 명령어 실행을 자동으로 수행
- **Git 통합**: Git 버전 관리 시스템과의 원활한 연동
- **멀티모달 지원**: 스크린샷이나 다이어그램 기반 기능 구현 가능

## 3. 현재 CodexGUI 프로젝트 상태

현재 CodexGUI 프로젝트는 다음과 같은 단계에 있습니다:

- **Sprint 1 완료**: API 키 검증 및 Launch 화면 구현, i18n 지원
- **Sprint 2 계획**: 프로젝트 목록 화면 및 관련 기능 구현 예정
- **아키텍처**: React (프론트엔드) + FastAPI (백엔드) 구성
- **코어 기능**: Git 저장소 분석·조작, LLM 대화 로그, 프로젝트 메타데이터 관리

## 4. 통합 전략

### 4.1 기술적 접근 방식

1. **백엔드 통합**:
   - Codex CLI를 Node.js 종속성으로 설치하고 Python 환경에서 호출
   - FastAPI 백엔드에서 CLI 명령어를 실행하는 래퍼 구현
   - 명령어 결과를 구조화된 형태로 파싱하여 프론트엔드에 전달

2. **프론트엔드 인터페이스**:
   - Codex 명령어 입력 및 결과 표시 컴포넌트
   - 승인 모드 선택 UI 및 파일 변경 / 명령어 실행 승인 인터페이스
   - 파일 변경사항 시각화 및 비교 뷰

3. **보안 모델 구현**:
   - 백엔드 샌드박스 환경 설정 및 관리
   - 사용자 권한 수준에 따른 기능 제한

### 4.2 단계별 통합 계획

#### 즉시 조치 사항
- Codex CLI 문서 상세 분석 및 API 매핑
- 백엔드 환경에서 Codex CLI 통합 테스트
- Sprint 2 계획에 Codex 통합 항목 추가

#### Sprint 2 수정 계획 (프로젝트 목록 + Codex 기초 통합)
1. **현재 계획대로 프로젝트 목록 UI 구현**
2. **Codex CLI 기본 통합**:
   - 백엔드에 Codex CLI 설치 및 실행 환경 구성
   - 간단한 Codex 명령어 실행 API 엔드포인트 구현
   - 프로젝트 선택 시 Codex 컨텍스트 설정 기능

#### Sprint 3 수정 계획 (Git/FS API + Codex 명령어 실행)
1. **현재 계획대로 Git/FS API 엔드포인트 구현**
2. **Codex 명령어 실행 UI**:
   - 프롬프트 입력 및 제출 컴포넌트
   - 응답 결과 표시 및 포맷팅
   - 승인 모드 선택 인터페이스

#### Sprint 4 수정 계획 (프로젝트 정보 화면 + Codex 파일 변경 승인)
1. **현재 계획대로 프로젝트 정보 화면 구현**
2. **Codex 파일 변경 승인 시스템**:
   - 파일 변경사항 diff 시각화
   - 변경 승인/거부 인터페이스
   - 부분 승인 기능 (변경사항 일부만 적용)

#### Sprint 5-7
- 구조 Analyzer, 페르소나 애니메이션, 국제화 기능 등 현재 계획 유지하되 Codex 통합 요소 추가

#### Sprint 8 (LAIOS Bridge + Codex 고급 기능)
- LAIOS 시스템과 Codex의 완전한 통합
- 고급 Codex 기능 (멀티모달 입력, 복잡한 작업 자동화 등) 구현

## 5. 핵심 구현 사항

### 5.1 백엔드 Codex 실행 엔진

```python
# FastAPI 백엔드 예시 코드
from fastapi import APIRouter, HTTPException, BackgroundTasks
import asyncio
import json
import os
import tempfile
import subprocess

router = APIRouter(prefix="/api/codex", tags=["codex"])

@router.post("/execute")
async def execute_codex_command(request: CodexCommandRequest):
    """Codex CLI 명령어 실행"""
    try:
        # 실행 환경 준비
        os.environ["OPENAI_API_KEY"] = request.api_key
        
        # Codex 명령어 구성
        command = [
            "npx", "@openai/codex", 
            f"--approval-mode={request.approval_mode}",
            "--quiet",
            request.prompt
        ]
        
        # 작업 디렉토리 설정하여 Codex 실행
        process = await asyncio.create_subprocess_exec(
            *command,
            cwd=request.project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=os.environ
        )
        
        # 결과 수집
        stdout, stderr = await process.communicate()
        
        # 결과 처리 및 반환
        return {
            "stdout": stdout.decode(),
            "stderr": stderr.decode(),
            "exit_code": process.returncode,
            "changes": await parse_file_changes(request.project_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Codex 실행 오류: {str(e)}")

async def parse_file_changes(project_path: str):
    """Codex가 변경한 파일 목록 파악"""
    # Git 상태 확인하여 변경된 파일 감지
    process = await asyncio.create_subprocess_exec(
        "git", "status", "--porcelain",
        cwd=project_path,
        stdout=asyncio.subprocess.PIPE
    )
    stdout, _ = await process.communicate()
    
    changes = []
    for line in stdout.decode().splitlines():
        if line.strip():
            status, filename = line[:2], line[3:]
            changes.append({"filename": filename, "status": status.strip()})
    
    return changes
```

### 5.2 프론트엔드 Codex 인터페이스

```tsx
// Codex 실행 및 결과 표시 컴포넌트
import React, { useState } from 'react';
import { useCodexStore } from '../stores/codexStore';
import { Button, TextArea, Select, Tabs } from '../components/ui';
import { DiffViewer, CommandLog } from '../components/codex';

const CodexExecutor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [approvalMode, setApprovalMode] = useState('suggest');
  const { executeCodex, result, isLoading, fileChanges, approveChanges } = useCodexStore();
  
  const handleExecute = async () => {
    if (!prompt.trim()) return;
    await executeCodex(prompt, approvalMode);
  };
  
  return (
    <div className="codex-executor">
      <div className="executor-header">
        <h2>Codex AI Assistant</h2>
        <div className="approval-mode">
          <label>Approval Mode:</label>
          <Select
            value={approvalMode}
            onChange={(val) => setApprovalMode(val)}
            options={[
              { value: 'suggest', label: 'Suggest Only' },
              { value: 'auto-edit', label: 'Auto Edit Files' },
              { value: 'full-auto', label: 'Full Auto' }
            ]}
          />
        </div>
      </div>
      
      <div className="prompt-container">
        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell Codex what to do... (e.g., 'Create a function to calculate fibonacci numbers')"
          rows={4}
        />
        <Button 
          onClick={handleExecute} 
          disabled={isLoading || !prompt.trim()}
          isLoading={isLoading}
        >
          {isLoading ? 'Running...' : 'Execute'}
        </Button>
      </div>
      
      {result && (
        <div className="result-container">
          <Tabs
            tabs={[
              {
                label: 'Output',
                content: <CommandLog output={result.stdout} error={result.stderr} />
              },
              {
                label: 'Changes',
                content: <DiffViewer changes={fileChanges} onApprove={approveChanges} />
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default CodexExecutor;
```

### 5.3 상태 관리 (Zustand)

```tsx
// Codex 상태 관리 스토어
import { create } from 'zustand';
import api from '../services/api';

interface CodexState {
  result: CodexResult | null;
  isLoading: boolean;
  fileChanges: FileChange[];
  executeCodex: (prompt: string, approvalMode: string) => Promise<void>;
  approveChanges: (changeIds: string[]) => Promise<void>;
}

export const useCodexStore = create<CodexState>((set, get) => ({
  result: null,
  isLoading: false,
  fileChanges: [],
  
  executeCodex: async (prompt, approvalMode) => {
    set({ isLoading: true });
    try {
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject) throw new Error('No project selected');
      
      const response = await api.post('/api/codex/execute', {
        prompt,
        approval_mode: approvalMode,
        project_path: currentProject.path,
        api_key: useApiKeyStore.getState().apiKey
      });
      
      set({ 
        result: response.data,
        fileChanges: response.data.changes || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Codex execution failed:', error);
      set({ isLoading: false });
    }
  },
  
  approveChanges: async (changeIds) => {
    try {
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject) throw new Error('No project selected');
      
      await api.post('/api/codex/approve-changes', {
        project_path: currentProject.path,
        change_ids: changeIds
      });
      
      // 변경 승인 후 파일 변경 목록 업데이트
      set(state => ({
        fileChanges: state.fileChanges.filter(
          change => !changeIds.includes(change.id)
        )
      }));
    } catch (error) {
      console.error('Failed to approve changes:', error);
    }
  }
}));
```

## 6. 예상 결과물

### 6.1 사용자 경험

1. **프로젝트 선택**: 사용자는 CodexGUI 내에서 작업할 프로젝트를 선택
2. **Codex 명령 입력**: 자연어로 수행할 작업 지시 (예: "Fix all lint errors" 또는 "Create a REST API for user management")
3. **승인 모드 선택**: 자동화 수준 설정 (제안만, 자동 편집, 완전 자동)
4. **실행 및 모니터링**: Codex가 작업을 수행하는 과정 확인
5. **결과 검토 및 승인**: 변경사항 확인 및 승인/거부

### 6.2 기술적 성과

1. **웹 기반 Codex**: 터미널 접근 없이 브라우저에서 Codex 기능 사용
2. **시각적 차이 비교**: 코드 변경사항을 시각적으로 확인
3. **작업 기록 저장**: Codex 명령어와 그 결과 히스토리 유지
4. **프로젝트 컨텍스트 관리**: 프로젝트별 설정 및 상태 유지

## 7. 위험 및 완화 전략

| 위험 | 완화 전략 |
|------|-----------|
| Codex CLI와의 호환성 문제 | 철저한 테스트 및 버전 관리, 필요시 특정 버전 고정 |
| 샌드박스 보안 이슈 | 운영체제별 샌드박스 메커니즘 검증 및 추가 보안 레이어 구현 |
| 성능 병목 현상 | 비동기 처리 및 작업 큐 시스템 도입 |
| 복잡한 UI/UX | 사용자 테스트 및 점진적인 기능 개선 |

## 8. 결론

OpenAI Codex CLI를 CodexGUI에 통합하는 것은 원래의 프로젝트 비전을 실현하는 데 중요한 단계입니다. 이 통합을 통해 터미널에 익숙하지 않은 개발자들도 AI 코딩 도구의 강력한 기능을 접근하기 쉬운 웹 인터페이스를 통해 활용할 수 있게 될 것입니다.

현재 진행 중인 Sprint 계획에 Codex 통합 요소를 추가함으로써, 기존의 개발 흐름을 크게 방해하지 않으면서도 점진적으로 핵심 기능을 구현할 수 있습니다. 이러한 접근 방식은 프로젝트의 위험을 최소화하면서 원래 비전에 부합하는 결과물을 만들어낼 수 있게 해줄 것입니다.
