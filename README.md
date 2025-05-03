# CodexGUI

Codex CLI를 기반으로 한 시각적 개발 워크플로우 자동화 툴입니다.
이 프로젝트는 로컬 파일 기반으로 Codex 명령어를 구성하고,
React 기반 GUI를 통해 개발 과정을 자동화합니다.

## 🚀 빠른 시작

### 필수 조건
- Node.js 20+
- TypeScript
- Codex CLI (글로벌 설치 또는 PATH에 포함)

### 의존성 설치
```bash
npm install
```

### 사용 방법

#### 1. Codex Context 생성
프로젝트 컨텍스트를 자동으로 생성합니다:
```bash
npm run codex:context
```

#### 2. Codex 시나리오 실행
`.codex-scenario.json` 파일을 기반으로 Codex CLI를 자동 실행합니다:
```bash
npm run codex:run
```

또는 직접 실행:
```bash
ts-node tools/codex-runner.ts
```

### 파일 구조
- `.codex-scenario.json`: 자동 실행할 작업 단계 정의
- `codex-context.json`: 프로젝트 컨텍스트 정보
- `tools/codex-runner.ts`: Codex CLI 자동 실행기
- `tools/codex-context-generator.ts`: 프로젝트 컨텍스트 생성기

### 개발 환경
Docker를 사용하여 개발 환경을 실행할 수 있습니다:
```bash
docker-compose up
```
