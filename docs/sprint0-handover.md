CodexGUI 프로젝트 인수인계 문서

현재 사용중인 어시스턴트 정보:
어시스턴트 ID: asst_h49ERsWScEONWAvW40gs11ka
스레드 ID: thread_Eetac1Lvo9zOAT5SLupPWBbG

1. 프로젝트 개요
CodexGUI는 Git 레포지토리 분석 및 조작, LLM 대화 로그, 프로젝트 메타 관리 기능을 브라우저/PWA 형태로 제공하는 웹 애플리케이션입니다. 주요 목표는 LAIOS 서버에 쉽게 연동하고 오프라인에서도 기초 기능이 작동하도록 하는 것입니다.
2. 기술 스택

프론트엔드: TypeScript 5.x, React 18, Zustand, Radix UI, TailwindCSS, React Router, Vite
백엔드: Python, FastAPI, SQLite, Dulwich(Git 조작), JWT
배포 환경: 브라우저 기반 PWA, Docker

3. 현재 진행 상황
프로젝트는 현재 Sprint 0이 완료된 상태입니다. 주요 완료 사항은 다음과 같습니다:

기본 프로젝트 구조 설정

프론트엔드: Vite + React + TypeScript 설정
백엔드: FastAPI 기본 구조
테스트 환경: Vitest(프론트엔드), pytest(백엔드)


주요 파일/폴더 구조

/frontend: 프론트엔드 코드 (Vite, React)
/backend: 백엔드 코드 (FastAPI)
/logs: 테스트 및 실행 로그
.gitignore: Git 무시 파일 설정
run_codexgui.bat: 애플리케이션 실행 스크립트
run_tests.bat & test_runner.py: 테스트 실행 스크립트


애플리케이션 페이지

Launch: API 키 입력 및 검증 페이지
Projects: 프로젝트 목록 관리 페이지
Project: 채팅 인터페이스 및 파일 탐색 페이지


해결된 문제

테스트 설정 문제 (@testing-library/jest-dom 설정)
백엔드 의존성 충돌 문제 (pydantic 관련)
TypeScript 오류 (미사용 변수 및 import)



4. 다음 작업 항목 (Sprint 1)
다음 작업은 Sprint 1 - 실행 화면 구현입니다:

Launch 페이지 UI 완성 및 스타일링
OpenAI API 키 유효성 검증 REST API 개발
API 키 암호화 저장 구현
API 키 검증 실패 시 재입력 강제 구현

5. 알려진 이슈

백엔드 테스트 실패

pydantic과 관련 라이브러리 간의 버전 충돌 문제가 여전히 존재
주로 ModuleNotFoundError: No module named 'pydantic._internal._signature' 오류 발생


TypeScript 빌드 오류

테스트 파일의 TypeScript 오류는 테스트 실행에는 영향이 없으나 빌드 시 경고 발생
toBeInTheDocument 메서드 관련 타입 정의 문제



6. 프로젝트 설정 및 실행 방법
개발 환경 설정

프론트엔드 설정
bashcd frontend
npm install

백엔드 설정
bashcd backend
pip install -r requirements.txt


애플리케이션 실행

간편 실행 (배치 파일)

run_codexgui.bat 파일을 더블 클릭하여 실행
프론트엔드, 백엔드가 자동으로 시작되고 브라우저가 열림


수동 실행

프론트엔드: cd frontend && npm run dev
백엔드: cd backend && python -m app.main
브라우저에서 http://localhost:5173 접속



테스트 실행

간편 테스트 (배치 파일)

run_tests.bat 파일을 실행하여 대화형 테스트 메뉴 사용


수동 테스트

프론트엔드: cd frontend && npm test
백엔드: cd backend && python -m pytest



7. 중요 파일 및 구성

설정 파일

frontend/vite.config.ts: Vite 설정
frontend/tsconfig.json: TypeScript 설정
backend/app/core/config.py: 백엔드 설정


상태 관리

frontend/src/store/apiKeyStore.ts: API 키 저장 상태
frontend/src/store/themeStore.ts: 테마 관리 상태


API 통신

frontend/src/api/client.ts: API 클라이언트 설정
frontend/src/api/endpoints.ts: 엔드포인트 정의


라우터

backend/app/routers/: API 라우터 (api_keys, projects, git, filesystem, chat)



8. 배포 설정
Docker 배포를 위한 기본 설정이 완료되었습니다:

Dockerfile: 멀티스테이지 빌드 설정
docker-compose.yml: Docker Compose 설정

9. 문서 및 참고 자료

/docs/CodexGUI 개발 계획서.txt: 전체 개발 계획 문서
/docs/CodexGUI 세부 구현 마일스톤 문서.md: 마일스톤 정의
/docs/CodexGUI_Frontend_Spec.md: 프론트엔드 스펙 문서
/docs/codexgui-assistant-guide.md: 어시스턴트 활용 가이드


추가 문의사항이나 상세한 내용은 프로젝트 문서를 참조하거나 개발팀에 문의하세요.