# 📄 작업 요청서: CodexGUI 테스트 실행 패키지 구축

## 🧠 목적

CodexGUI 프로젝트의 자동 생성 시나리오 결과물을 실제 GUI로 확인할 수 있도록, 프론트엔드 개발환경 초기화 및 테스트 페이지를 구성하고, 전체를 한 번에 실행할 수 있는 `.cmd` / `.sh` 스크립트를 생성합니다.

이 패키지를 통해 사용자는 **한 번의 실행으로 자동 생성 + 서버 실행 + 결과 확인**까지 도달할 수 있습니다.

---

## ✅ 작업 항목

### 1. `frontend/` 초기화

* Vite + React + TypeScript로 구성
* 실행 명령:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

* 또는 수동으로 아래 파일 구조와 내용 설정:

```
frontend/
├── index.html
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx (Codex CLI로 자동 생성될 예정)
│   └── components/
│       └── AgentConsole.tsx (Codex CLI로 자동 생성될 예정)
```

### 2. 테스트 뷰 구성

* 파일명: `frontend/src/test-view.tsx`
* 역할: `AgentConsole.tsx`가 올바르게 렌더링되는지 확인하는 테스트용 화면 구성
* 기본 구조:

```tsx
import React from 'react';
import AgentConsole from './components/AgentConsole';

export default function TestView() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>CodexGUI Agent Console Test</h1>
      <AgentConsole />
    </div>
  );
}
```

* 이후 `main.tsx` 또는 `App.tsx`에서 해당 컴포넌트를 기본 출력하도록 설정

### 3. `.cmd` 및 `.sh` 자동 실행 스크립트 생성

#### ▶ `run-codexgui.cmd` (Windows)

```cmd
@echo off
cd /d %~dp0
cd frontend
call npm install
cd ..
npx ts-node tools/codex-context-generator.ts
npx ts-node tools/codex-runner.ts
cd frontend
npm run dev
```

#### ▶ `run-codexgui.sh` (macOS/Linux)

```bash
#!/bin/bash
cd "$(dirname "$0")"
cd frontend
npm install
cd ..
npx ts-node tools/codex-context-generator.ts
npx ts-node tools/codex-runner.ts
cd frontend
npm run dev
```

---

## ⚠️ 수동 구성 필요 사항 (마른비 직접 작업)

| 항목                             | 설명                            |
| ------------------------------ | ----------------------------- |
| `frontend/` 디렉토리 초기화           | Vite 템플릿으로 생성하거나 수동 구성 필요     |
| `AgentConsole.tsx` / `App.tsx` | Codex 자동 생성되므로 scenario 실행 필수 |
| `npm`, `ts-node`, `codex` CLI  | 글로벌 설치되어 있어야 함                |
| `.env` 설정 (선택)                 | OPENAI API 키 포함               |

---

## 📦 예상 산출물

* `frontend/` 전체 초기화 구조 (Vite 기반)
* `test-view.tsx` 포함된 시각적 테스트 환경
* `run-codexgui.cmd`, `run-codexgui.sh` 자동 실행 스크립트

---

**이 요청서를 기반으로 CodexGUI를 실제 GUI로 실행하고 시각적으로 검증할 수 있는 테스트 환경을 완성해 주세요!**
