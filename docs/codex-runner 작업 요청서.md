# 📄 작업 요청서: CodexGUI - codex-runner.ts 생성

## 🧠 목적

CodexGUI 프로젝트의 `.codex-scenario.json` 파일을 기반으로 Codex CLI를 자동 실행하여,
사용자가 직접 명령어를 복사하지 않고도 프롬프트 기반 코드를 자동 생성할 수 있도록 합니다.

---

## ✅ 작업 대상

* 파일명: `codex-runner.ts`
* 위치: `CodexGUI/tools/`
* 실행 방식: `ts-node codex-runner.ts` 또는 `npm run codex:run`

---

## 📄 입력 파일

* `./.codex-scenario.json`: 자동 실행할 작업 단계 정의 파일
* (선택) `./codex-context.json`: 현재 프로젝트 문맥 정보

---

## ⚙️ 주요 기능 요구사항

### 1. `.codex-scenario.json` 파싱

* `steps` 배열을 순회하며 각 작업 실행
* 각 step은 다음 정보 포함:

  * `description`: 설명용 (콘솔 출력용)
  * `prompt`: Codex에 전달할 명령
  * `target`: 생성/수정할 파일 경로

### 2. Codex CLI 실행

* `codex <프롬프트> --file <target> --approve` 형식으로 실행
* Codex 실행 결과는 터미널에 출력

### 3. `codex-context.json` 반영 (선택 구현)

* `codex-context.json`이 존재하면, 프롬프트 앞에 다음 형식으로 prepend:

```text
[CONTEXT]
<codex-context 내용>

[INSTRUCTION]
<프롬프트 원문>
```

### 4. 작업 상태 출력

* 각 step 실행 전/후 다음과 같은 메시지 출력:

```
▶ Step 1: AgentConsole.tsx 생성 중...
✓ Step 1 완료.
```

### 5. 에러 핸들링

* Codex CLI 실행 실패 시 에러 메시지 출력하고 중단 또는 continue 옵션 제공
* 모든 실패는 `codex-runner-error.log`에 저장

---

## 📦 예상 산출물

* `tools/codex-runner.ts`
* 로그 파일: `codex-runner-error.log` (에러 발생 시)

---

## 🏁 실행 예시

```bash
# TypeScript CLI 실행 예시
cd CodexGUI/tools
npx ts-node codex-runner.ts
```

또는

```bash
# package.json에 스크립트 추가
"scripts": {
  "codex:run": "ts-node tools/codex-runner.ts"
}
```

---

## 📌 주의사항

* `codex` 명령은 글로벌 설치 또는 PATH에 포함되어 있어야 함
* 프롬프트는 반드시 줄바꿈 없이 Codex CLI에 전달 가능해야 함 (따옴표 인코딩 주의)
* 모든 작업 로그는 CLI에 명확하게 출력되도록 구성

---

**이 문서를 기반으로 `.codex-scenario.json` 자동 실행기인 `codex-runner.ts`를 구현해 주세요!**
