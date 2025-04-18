# CodexGUI 세부 구현 마일스톤 문서

## 🎯 개요
이 문서는 AI를 통해 완전 자동으로 CodexGUI 프로젝트를 구현할 수 있도록, 명확하고 상세한 작업 단계를 정의한 마일스톤 문서입니다. 별도의 기술적 지식 없이 AI 모델만으로 충분히 진행 가능한 수준으로 작성되었습니다.

---

## 📌 기술 스택 요약
- **Frontend**: TypeScript, React 18, Zustand, Radix UI, TailwindCSS, React Router, Vite
- **Backend**: Python, FastAPI, SQLite, Dulwich(Git), JWT (OAuth2)
- **배포 환경**: 브라우저(PWA)

---

## 📅 마일스톤 별 구현 단계

### 🔹 Sprint 0: 프로젝트 초기 설정
- [ ] GitHub에 프로젝트 저장소 생성
- [ ] Frontend 설정: Vite + React + TypeScript 프로젝트 생성
- [ ] TailwindCSS 및 Radix UI 초기 설정 및 기본 레이아웃 적용
- [ ] Zustand 및 React Context 초기 환경 구성
- [ ] 기본 디렉토리 구조 문서화 및 커밋

### 🔹 Sprint 1: Launch 화면 구현
- [ ] Launch 페이지 UI (API 키 입력 폼 및 모달) 구현
- [ ] OpenAI API 키 유효성 검증 REST API 개발 (FastAPI)
- [ ] API 키 암호화 저장 구현
- [ ] API키 검증 실패 시 재입력 강제 구현

### 🔹 Sprint 2: 프로젝트 목록 화면 구현
- [ ] 프로젝트 목록 UI 화면 구현 (프로젝트 카드, 즐겨찾기, 삭제 슬라이드 기능)
- [ ] 아바타 페르소나 설정 UI 구현 (이미지 업로드, 이름 및 프롬프트 편집)
- [ ] API 잔여 토큰 조회 REST API 구현 및 화면 표시
- [ ] 프로젝트 추가/삭제 로직 구현 및 데이터베이스(SQLite) 연동

### 🔹 Sprint 3: Backend Git/FS API 엔드포인트 구현
- [ ] FastAPI를 통한 파일시스템 접근(read/write/list) API 구현
- [ ] Git 작업 API (commit, branch, status) 구현
- [ ] Git 접근 권한 및 보안 처리 (JWT 기반 권한 체크)

### 🔹 Sprint 4: 프로젝트 정보 화면(채팅 로그 화면) 구현
- [ ] 최근 수정 파일 썸네일 목록 표시 기능 구현
- [ ] 대화 로그 UI 구현 (하단에서 위로 무한 스크롤 로딩)
- [ ] 채팅 입력창 및 채팅 전송 기능 구현
- [ ] 모바일 레이아웃 최적화 및 드로어 메뉴 구현

### 🔹 Sprint 5: 구조 Analyzer 및 Snapshot 뷰어 개발
- [ ] Git 커밋 상태 분석하여 파일 구조 스냅샷 JSON 생성 (백엔드 Python)
- [ ] JSON diff 연산을 통한 변경 사항 시각적 표시 (프론트엔드 React)
- [ ] 변경 사항을 시각화하는 Snapshot 뷰어 컴포넌트 개발

### 🔹 Sprint 6: 페르소나 상태 애니메이션 구현
- [ ] 아바타 상태 애니메이션 (대기, 작업중, 오류, 성공 상태 등) 구현
- [ ] 페르소나 편집 및 상태 관리 기능 완성
- [ ] 성능 최적화를 위한 이미지 슬라이싱 및 sprite animation 처리

### 🔹 Sprint 7: 국제화(i18n) 구현
- [ ] i18next를 이용하여 다국어 지원 환경 설정
- [ ] 영어, 한국어 기본 JSON 언어 리소스 파일 작성
- [ ] 언어 전환 UI 및 동적 번역 처리 구현
- [ ] 중국어, 스페인어, 일본어 추가 지원

### 🔹 Sprint 8: LAIOS 시스템과 연동(Bridge α)
- [ ] LAIOS 업무 자동화 시스템과의 데이터 동기화 API 개발
- [ ] CodexGUI의 작업 로그 및 컨텍스트 정보를 LAIOS에 자동 전달
- [ ] 파일 경합 방지 및 동기화 오류 처리 기능 개발

### 🔹 Sprint 9: QA / E2E 테스트 및 성능 최적화
- [ ] Playwright 기반의 E2E 테스트 시나리오 작성 및 실행
- [ ] Lighthouse 성능 점검 (PWA 점수 ≥90 목표)
- [ ] 발견된 버그 및 성능 이슈 개선

### 🔹 Sprint 10: 최종 배포 (Beta Release)
- [ ] GitHub Pages를 통한 PWA 정적 배포 환경 구축
- [ ] Docker 이미지 생성 및 Docker Hub 배포
- [ ] npm 패키지(@codexgui/sdk) 배포
- [ ] Beta 릴리스 공개 및 초기 사용자 피드백 수집

---

## 🚩 AI를 위한 구현 주의사항

- **각 작업 단계는 독립적으로 진행할 수 있도록 구체적이고 명확하게 나누어져 있음**
- 구현 중 필요한 코드 생성 및 디버깅은 AI 모델 자체로 충분히 진행 가능
- AI 모델은 각 마일스톤의 명시된 기능 범위를 벗어나지 않도록 유의하여 작업 진행

---

## 🏅 기대 결과

- AI 모델이 본 문서를 기반으로 CodexGUI를 완전 자동으로 구현 가능
- 구현 과정에서 추가적인 기술 지식 없이 명확한 단계별 업무 처리 가능
- 완료된 CodexGUI가 LAIOS 시스템과 효율적으로 통합되어 높은 사용성을 제공

이 문서를 통해 AI가 독립적으로 CodexGUI 구현을 진행할 수 있도록 명확한 가이드라인을 제공합니다.

