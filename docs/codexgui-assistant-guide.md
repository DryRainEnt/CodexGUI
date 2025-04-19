# CodexGUI 프로젝트를 위한 어시스턴트 활용 가이드

이 가이드는 CodexGUI 웹 애플리케이션 개발을 위해 Claude와 OpenAI 어시스턴트를 효과적으로 활용하는 방법을 설명합니다. MCP(Multi-Capability Protocol) 기능과 어시스턴트 협업 전략을 통해 개발 효율성을 극대화할 수 있습니다.

현재 사용중인 어시스턴트 정보:
어시스턴트 ID: asst_h49ERsWScEONWAvW40gs11ka
스레드 ID: thread_Eetac1Lvo9zOAT5SLupPWBbG

## 목차
1. [MCP 유형 및 활용법](#1-mcp-유형-및-활용법)
2. [어시스턴트 설정 및 활용 전략](#2-어시스턴트-설정-및-활용-전략)
3. [Claude-어시스턴트 협업 워크플로우](#3-claude-어시스턴트-협업-워크플로우)
4. [개발 단계별 활용 가이드](#4-개발-단계별-활용-가이드)
5. [문제 해결 및 팁](#5-문제-해결-및-팁)

---

## 1. MCP 유형 및 활용법

### 파일 시스템 관련 MCP
```
read_file - 단일 파일 읽기
read_multiple_files - 여러 파일 동시에 읽기
write_file - 파일 생성 또는 덮어쓰기
edit_file - 텍스트 파일 라인 단위 편집
create_directory - 디렉토리 생성
list_directory - 디렉토리 내용 나열
directory_tree - 재귀적 디렉토리 구조 JSON 반환
search_files - 패턴으로 파일 검색
get_file_info - 파일 메타데이터 조회
```

**활용 시나리오:**
- 프로젝트 구조 파악: `directory_tree`로 전체 구조 확인
- 코드 분석: `read_multiple_files`로 관련 파일들 동시에 검토
- 코드 생성: `write_file`로 새 컴포넌트나 모듈 작성
- 코드 수정: `edit_file`로 기존 코드에 기능 추가 또는 버그 수정

### Git 관련 MCP
```
git_status - 작업 트리 상태 확인
git_diff_unstaged - 스테이징되지 않은 변경사항 확인
git_diff_staged - 스테이징된 변경사항 확인
git_add - 파일 스테이징
git_commit - 변경사항 커밋
git_log - 커밋 기록 확인
git_create_branch - 새 브랜치 생성
git_checkout - 브랜치 전환
```

**활용 시나리오:**
- 기능 개발 시작: `git_create_branch`로 새 기능 브랜치 생성
- 구현 중 상태 확인: `git_status`와 `git_diff_unstaged`로 변경사항 검토
- 기능 완료 후: `git_add`와 `git_commit`으로 변경사항 기록
- 코드 리뷰 준비: 커밋 내역을 OpenAI 어시스턴트에게 전달하여 리뷰 요청

### OpenAI 어시스턴트 관련 MCP
```
create_assistant - 새 어시스턴트 생성
new_thread - 새 대화 스레드 생성
send_message - 어시스턴트에게 메시지 전송
check_response - 응답 확인
list_assistants - 사용 가능한 어시스턴트 목록
retrieve_assistant - 어시스턴트 세부 정보 확인
update_assistant - 어시스턴트 수정
```

**활용 시나리오:**
- 전문 리뷰어 설정: 코드 리뷰, UI 평가, 보안 점검 등을 위한 특화된 어시스턴트 생성
- 코드 검증: 작성한 코드에 대한 피드백 요청
- 아키텍처 검토: 설계 문서에 대한 분석 및 개선점 요청

### 지식 그래프 및 REPL MCP
```
create_entities/create_relations - 지식 그래프 관리
read_graph - 전체 그래프 읽기
repl - JavaScript 코드 실행
```

**활용 시나리오:**
- 프로젝트 구조 모델링: 주요 컴포넌트와 관계를 지식 그래프로 표현
- 알고리즘 테스트: 복잡한 로직을 REPL에서 검증 후 실제 코드에 적용

---

## 2. 어시스턴트 설정 및 활용 전략

### 주요 어시스턴트 역할 정의

1. **코드 리뷰 어시스턴트**
   ```javascript
   // 설정 예시
   create_assistant({
     name: "CodexGUI-CodeReviewer",
     instructions: `당신은 CodexGUI 프로젝트의 코드 리뷰 전문가입니다. 
     프로젝트 사양: React, TypeScript, FastAPI 기반의 Git 통합 GUI 애플리케이션.
     리뷰 시 다음을 중점적으로 확인해주세요:
     1. TypeScript 타입 정의의 정확성
     2. React 컴포넌트의 성능 및 재사용성
     3. API 엔드포인트의 보안 및 오류 처리
     4. 코드 스타일 및 일관성
     항상 구체적인 개선 제안과 코드 예시를 제공해주세요.`,
     model: "gpt-4o",
     tools: [{"type": "code_interpreter"}]
   });
   ```

2. **UI/UX 평가 어시스턴트**
   ```javascript
   create_assistant({
     name: "CodexGUI-UIReviewer",
     instructions: `당신은 CodexGUI의 UI/UX 전문가입니다.
     CodexGUI는 Git 레포지토리 관리와 LLM 대화를 위한 웹 애플리케이션입니다.
     주요 화면: 실행 화면, 프로젝트 목록 화면, 프로젝트 정보 화면.
     다음을 중점적으로 평가해주세요:
     1. 접근성 및 반응형 디자인
     2. 사용자 워크플로우의 직관성
     3. 시각적 일관성 및 브랜드 정체성
     4. 성능 및 로딩 최적화
     모든 피드백에는 실행 가능한 개선 제안을 포함해주세요.`,
     model: "gpt-4o"
   });
   ```

3. **문서 작성 어시스턴트**
   ```javascript
   create_assistant({
     name: "CodexGUI-DocumentationWriter",
     instructions: `당신은 CodexGUI 프로젝트의 기술 문서 작성자입니다.
     사용자 매뉴얼, API 문서, 개발자 가이드 등을 작성합니다.
     다음 원칙을 따라 문서를 작성해주세요:
     1. 명확하고 간결한 언어 사용
     2. 실제 사용 예시 포함
     3. 기술적 깊이와 접근성의 균형
     4. Markdown 형식 준수
     대상 독자는 기술적 배경이 다양한 개발자들입니다.`,
     model: "gpt-4o"
   });
   ```

### 어시스턴트 활용 모범 사례

1. **메시지 구조화**
   ```
   # [작업 유형] - [파일명 또는 컴포넌트명]

   ## 배경
   이 코드는 [기능 설명]을 담당하는 부분입니다.
   
   ## 작업 내용
   [구현한 내용, 해결한 문제, 적용한 패턴 등 설명]
   
   ## 검토 요청사항
   1. [특정 질문 또는 우려사항]
   2. [집중적으로 검토해야 할 부분]
   
   ## 코드
   ```typescript
   // 코드 블록
   ```
   ```

2. **피드백 반영 및 재검토**
   - 어시스턴트의 피드백을 적용한 후 변경사항 요약과 함께 재검토 요청
   - 적용하지 않은 제안이 있다면 그 이유를 설명하여 컨텍스트 제공

3. **정기적인 어시스턴트 업데이트**
   - 프로젝트 진행에 따라 `update_assistant`를 통해 지침 업데이트
   - 새로운 기술 도입이나 아키텍처 변경 시 즉시 반영

---

## 3. Claude-어시스턴트 협업 워크플로우

### 역할 분담

1. **Claude의 역할**
   - 아키텍처 설계 및 핵심 로직 구현
   - 복잡한 알고리즘 작성
   - 통합 테스트 코드 생성
   - 스켈레톤 코드 작성 및 주석 처리
   - 기능별로 분리된 깃 커밋 작성 및 커밋

2. **OpenAI 어시스턴트의 역할**
   - 코드 품질 및 최적화 리뷰
   - 사용자 경험 평가
   - 보안 취약점 분석
   - 문서화 및 주석 개선

### 협업 프로세스

1. **설계 단계**
   - Claude: 컴포넌트 구조, 데이터 모델, API 명세 설계
   - 어시스턴트: 설계 검토 및 개선점 제안

2. **구현 단계**
   - Claude: 기능 구현 및 주석 포함 코드 작성
   - 어시스턴트: 코드 리뷰 및 개선 제안

3. **테스트 및 최적화 단계**
   - Claude: 테스트 코드 작성 및 성능 측정
   - 어시스턴트: 엣지 케이스 식별 및 최적화 방안 제안

4. **문서화 단계**
   - Claude: 기술 문서 초안 작성
   - 어시스턴트: 문서 개선 및 사용자 관점 보완

---

## 4. 개발 단계별 활용 가이드

### 초기 설정 (스프린트 0-1)

1. **프로젝트 구조 설정**
   - Claude: 디렉토리 구조 및 초기 설정 코드 작성
   - 어시스턴트-아키텍트: 구조 검토 및 설계 패턴 조언

2. **기본 환경 구성**
   - Claude: package.json, tsconfig.json 등 구성 파일 작성
   - 어시스턴트-DevOps: 개발 환경 최적화 및 보안 구성 제안

### UI 개발 (스프린트 2-4)

1. **컴포넌트 개발**
   - Claude: 각 UI 컴포넌트 작성 및 주석 처리
   - 어시스턴트-UIReviewer: 사용성 및 접근성 평가

2. **상태 관리**
   - Claude: Zustand 스토어 설계 및 구현
   - 어시스턴트-CodeReviewer: 상태 관리 패턴 최적화

### 백엔드 개발 (스프린트 3-5)

1. **API 엔드포인트**
   - Claude: FastAPI 라우트 및 비즈니스 로직 구현
   - 어시스턴트-SecurityExpert: API 보안 및 취약점 분석

2. **데이터 모델**
   - Claude: SQLite 스키마 및 ORM 모델 정의
   - 어시스턴트-DBExpert: 데이터 모델 효율성 및 무결성 검토

### 통합 및 테스트 (스프린트 6-9)

1. **통합 테스트**
   - Claude: 컴포넌트 통합 및 E2E 테스트 시나리오 작성
   - 어시스턴트-QAExpert: 테스트 커버리지 및 엣지 케이스 분석

2. **성능 최적화**
   - Claude: 성능 측정 및 개선 작업
   - 어시스턴트-PerformanceExpert: 병목 현상 분석 및 최적화 제안

---

## 5. 문제 해결 및 팁

### 어시스턴트 활용 팁

1. **컨텍스트 제한 관리**
   - 큰 코드베이스는 관련 부분만 선별하여 전송
   - 핵심 로직과 인터페이스 부분을 우선적으로 공유

2. **효과적인 주석 작성**
   ```typescript
   /**
    * @description 사용자 입력에서 Git 명령어를 파싱하는 유틸리티 함수
    * @param {string} input - 사용자 입력 문자열
    * @returns {GitCommand} 파싱된 Git 명령어 객체
    * @example
    * // 반환값: { command: 'commit', args: ['-m', 'Initial commit'] }
    * parseGitCommand('git commit -m "Initial commit"');
    * 
    * @todo 에러 처리 개선 필요
    */
   ```

3. **반복적인 개선 사이클**
   - 각 기능 구현 후 즉시 리뷰 요청
   - 피드백 적용 후 재검토하여 점진적 개선
   - 동일한 어시스턴트에 히스토리를 유지하기 위해 스레드 재사용

### 문제 해결 가이드

1. **어시스턴트가 프로젝트 맥락을 이해하지 못할 때**
   - 프로젝트의 핵심 문서(README, 설계 문서)를 먼저 공유
   - 관련 코드의 의존성 및 연관 관계를 명시적으로 설명

2. **코드 생성 품질 향상**
   - 명확한 입/출력 예시 및 엣지 케이스 제공
   - 기존 코드의 패턴과 스타일을 예시로 제시

3. **복잡한 리팩토링 작업**
   - 리팩토링 목표와 현재 문제점을 상세히 설명
   - 단계별 접근으로 복잡한 변경사항 관리

---

이 가이드를 통해 Claude와 OpenAI 어시스턴트를 효과적으로 활용하여 CodexGUI 프로젝트를 성공적으로 개발할 수 있을 것입니다. 각 도구의 강점을 이해하고 적절히 조합하여 개발 효율성을 극대화하세요.
