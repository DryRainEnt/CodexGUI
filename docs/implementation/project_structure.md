# CodexGUI 프로젝트 구조 개요

이 문서는 CodexGUI 프로젝트의 코드 구조와 각 파일/폴더의 역할을 설명합니다. 개발자가 프로젝트에 빠르게 참여할 수 있도록 도움을 제공합니다.

## 1. 최상위 구조

```
/CodexGUI
├── backend/           # Python FastAPI 백엔드
├── frontend/          # React/TypeScript 프론트엔드
├── docs/              # 프로젝트 문서
├── logs/              # 애플리케이션 로그
├── run_codexgui.bat   # 애플리케이션 실행 스크립트
├── run_tests.bat      # 테스트 실행 스크립트
├── test_runner.py     # 테스트 실행 관리자
├── docker-compose.yml # Docker 배포 설정
└── Dockerfile         # Docker 이미지 빌드 설정
```

## 2. 백엔드 구조

```
/backend
├── app/               # 주 애플리케이션 코드
│   ├── core/          # 핵심 설정 및 유틸리티
│   ├── routers/       # API 엔드포인트 라우터
│   ├── models/        # 데이터 모델
│   ├── services/      # 비즈니스 로직
│   ├── db/            # 데이터베이스 연결 및 쿼리
│   └── main.py        # 애플리케이션 엔트리포인트
├── data/              # 데이터 저장소 (SQLite, 로그 등)
├── tests/             # 백엔드 테스트
└── requirements.txt   # 종속성 목록
```

### 2.1 백엔드 주요 파일

- **app/main.py**: FastAPI 애플리케이션 초기화 및 설정
- **app/core/config.py**: 환경 설정 및 변수 관리
- **app/routers/*.py**: API 엔드포인트 정의
  - api_keys.py: OpenAI API 키 검증 및 관리
  - projects.py: 프로젝트 CRUD 작업
  - git.py: Git 명령어 프록시
  - filesystem.py: 파일 시스템 작업
  - chat.py: 채팅 로그 관리

## 3. 프론트엔드 구조

```
/frontend
├── public/            # 정적 에셋
├── src/               # 소스 코드
│   ├── api/           # API 클라이언트 및 엔드포인트
│   ├── components/    # React 컴포넌트
│   ├── hooks/         # React 커스텀 훅
│   ├── pages/         # 페이지 컴포넌트
│   ├── store/         # Zustand 상태 관리
│   ├── styles/        # TailwindCSS 및 글로벌 스타일
│   ├── types/         # TypeScript 타입 정의
│   ├── utils/         # 유틸리티 함수
│   ├── App.tsx        # 애플리케이션 루트 컴포넌트
│   ├── main.tsx       # 진입점
│   └── router.tsx     # 라우팅 설정
├── tests/             # 프론트엔드 테스트
├── package.json       # 종속성 및 스크립트
└── vite.config.ts     # Vite 빌드 설정
```

### 3.1 프론트엔드 주요 파일

- **src/App.tsx**: 애플리케이션 루트 컴포넌트
- **src/router.tsx**: React Router 설정
- **src/pages/**: 주요 페이지 컴포넌트
  - Launch.tsx: API 키 입력 및 검증 화면
  - Projects.tsx: 프로젝트 목록 화면
  - Project.tsx: 프로젝트 세부 정보 및 채팅 인터페이스
- **src/store/**: Zustand 상태 관리 저장소
  - apiKeyStore.ts: API 키 상태 관리
  - themeStore.ts: UI 테마 상태 관리
  - projectStore.ts: 프로젝트 상태 관리

## 4. 데이터 흐름

1. 프론트엔드에서 사용자 액션 발생
2. Zustand 스토어가 상태 업데이트 및 API 호출 트리거
3. API 클라이언트가 백엔드 엔드포인트 호출
4. 백엔드 라우터가 요청 처리 및 서비스 로직 호출
5. 서비스 로직이 데이터베이스 또는 파일 시스템 작업 수행
6. 응답이 프론트엔드로 반환되어 화면 업데이트

## 5. 주요 기능별 관련 파일

### 5.1 API 키 관리
- 프론트엔드: src/pages/Launch.tsx, src/store/apiKeyStore.ts
- 백엔드: app/routers/api_keys.py

### 5.2 프로젝트 관리
- 프론트엔드: src/pages/Projects.tsx, src/store/projectStore.ts
- 백엔드: app/routers/projects.py, app/models/project.py

### 5.3 Git 작업
- 프론트엔드: src/pages/Project.tsx, src/components/GitControls.tsx
- 백엔드: app/routers/git.py, app/services/git_service.py

### 5.4 대화 로그
- 프론트엔드: src/pages/Project.tsx, src/components/ChatLog.tsx
- 백엔드: app/routers/chat.py, app/services/chat_service.py

## 6. 개발 워크플로우

1. 백엔드 API 개발 (FastAPI 라우터 및 서비스)
2. 프론트엔드 API 클라이언트 및 상태 관리 연결
3. UI 컴포넌트 구현 및 페이지 통합
4. 테스트 작성 및 실행 (백엔드 및 프론트엔드)
5. 문서화 및 커밋

이 문서는 프로젝트가 발전함에 따라 지속적으로 업데이트됩니다.
