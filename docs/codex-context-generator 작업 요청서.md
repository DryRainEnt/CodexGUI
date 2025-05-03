# 📄 작업 요청서: CodexGUI - codex-context-generator.ts 생성

## 🧠 목적

Codex CLI를 활용한 개발 시나리오에서 Codex가 전체 프로젝트 구조를 파악하지 못해 문맥 부족 문제가 발생함. 이를 해결하기 위해 현재 프로젝트의 폴더/파일 구조와 핵심 파일의 기능 개요를 정리해주는 자동화된 스크립트를 작성한다.

이 스크립트는 매 작업 전마다 `codex-context.json` 파일을 생성하거나 갱신하며, Codex에게 줄 수 있는 문맥 정보를 보완한다.

---

## ✅ 작업 대상

* 파일명: `codex-context-generator.ts`
* 위치: `CodexGUI/tools/`
* 실행 방식: CLI 실행 (예: `ts-node codex-context-generator.ts`)

---

## 📁 처리 대상 디렉토리

* `frontend/src/`
* `backend/app/`

---

## ⚙️ 주요 기능 요구사항

### 1. 프로젝트 폴더 구조 요약

* `frontend/src`와 `backend/app` 내부의 폴더 및 파일 목록을 재귀적으로 탐색
* 각 폴더의 깊이를 고려하여 트리 구조로 출력
* `.ts`, `.tsx`, `.py` 파일만 대상

### 2. 주요 파일 기능 요약 (선택적)

* 다음과 같은 핵심 파일의 첫 10줄 내외를 분석하여 간단한 설명 추가:

  * `App.tsx`, `AgentConsole.tsx`, `main.py`
* 첫 주석이나 함수명을 바탕으로 역할을 추정하여 요약 문구 자동 생성

### 3. 결과 저장

* 생성된 정보는 `codex-context.json`에 저장
* JSON 구조 예시는 아래와 같음:

```json
{
  "description": "This file stores current project context for Codex CLI interaction.",
  "frontend": {
    "components": ["AgentConsole.tsx"],
    "entrypoint": "App.tsx"
  },
  "backend": {
    "entrypoint": "main.py"
  },
  "structure": [
    "frontend/src/",
    "├── components/",
    "│   └── AgentConsole.tsx",
    "└── App.tsx",
    "backend/app/",
    "└── main.py"
  ]
}
```

---

## ✨ 보너스 기능 (선택 구현)

* 파일별 수정 시간 포함
* 구조를 Markdown으로도 함께 저장 (예: `codex-context.md`)
* 최근 실행한 Codex CLI 기록을 `codex-history.json`에서 불러와 맥락 보완

---

## 📦 예상 산출물

* `tools/codex-context-generator.ts` (TypeScript 코드)
* `codex-context.json` (프로젝트 구조 및 요약 저장)
* (선택) `codex-context.md` (Markdown 버전 트리 요약)

---

## 📌 주의사항

* 결과 파일은 UTF-8 인코딩으로 저장
* 트리 구조 시 들여쓰기는 공백 2칸 기준
* 전체 JSON 구조는 CodexCLI나 GPT가 파싱 가능한 구조 유지

---

## 🏁 작업 완료 기준

* 명령어 한 줄(`ts-node codex-context-generator.ts`)로 전체 구조 분석 및 요약 파일 생성
* context 파일이 `.json`과 `.md` 모두 적절히 저장되었는지 확인

---

**이 문서를 그대로 실행하여 CodexGUI의 자동 문맥 수집 시스템을 구축해 주세요!**
