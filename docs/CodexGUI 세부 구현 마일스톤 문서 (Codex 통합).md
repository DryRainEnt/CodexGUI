# CodexGUI 세부 구현 마일스톤 문서 (Codex 통합)

## 🎯 개요
이 문서는 AI를 통해 완전 자동으로 CodexGUI 프로젝트를 구현할 수 있도록, 명확하고 상세한 작업 단계를 정의한 마일스톤 문서입니다. 특히, 원래 의도했던 OpenAI Codex CLI와의 통합을 강화하여 프로젝트의 핵심 가치를 회복하는 작업 계획을 포함합니다.

---

## 📌 기술 스택 요약
- **Frontend**: TypeScript, React 18, Zustand, Radix UI, TailwindCSS, React Router, Vite
- **Backend**: Python, FastAPI, SQLite, Dulwich(Git), JWT (OAuth2)
- **Codex 통합**: Node.js, OpenAI Codex CLI (@openai/codex)
- **배포 환경**: 브라우저(PWA)

---

## 📅 마일스톤 별 구현 단계

### 🔹 Sprint 0: 프로젝트 초기 설정 ✅
- [x] GitHub에 프로젝트 저장소 생성
- [x] Frontend 설정: Vite + React + TypeScript 프로젝트 생성
- [x] TailwindCSS 및 Radix UI 초기 설정 및 기본 레이아웃 적용
- [x] Zustand 및 React Context 초기 환경 구성
- [x] 기본 디렉토리 구조 문서화 및 커밋

### 🔹 Sprint 1: Launch 화면 구현 ✅
- [x] Launch 페이지 UI (API 키 입력 폼 및 모달) 구현
- [x] OpenAI API 키 유효성 검증 REST API 개발 (FastAPI)
- [x] API 키 암호화 저장 구현
- [x] API키 검증 실패 시 재입력 강제 구현
- [x] 국제화(i18n) 조기 구현 및 다중 언어 지원 추가

### 🔹 Sprint 2: 프로젝트 목록 화면 및 Codex 기초 통합 구현
- [ ] 프로젝트 목록 UI 화면 구현 (프로젝트 카드, 즐겨찾기, 삭제 슬라이드 기능)
- [ ] 아바타 페르소나 설정 UI 구현 (이미지 업로드, 이름 및 프롬프트 편집)
- [ ] API 잔여 토큰 조회 REST API 구현 및 화면 표시
- [ ] 프로젝트 추가/삭제 로직 구현 및 데이터베이스(SQLite) 연동
- [ ] **Codex CLI 설치 및 기본 실행 환경 구성**
- [ ] **프로젝트 메타데이터에 Codex 설정 필드 추가**

### 🔹 Sprint 3: Backend Git/FS API 및 Codex 명령 실행 구현
- [ ] FastAPI를 통한 파일시스템 접근(read/write/list) API 구현
- [ ] Git 작업 API (commit, branch, status) 구현
- [ ] Git 접근 권한 및 보안 처리 (JWT 기반 권한 체크)
- [ ] **Codex 명령어 실행 API 엔드포인트 구현**
- [ ] **Codex 샌드박스 환경 설정 및 보안 모델 구현**
- [ ] **Node.js-Python 통합 모듈 개발**

### 🔹 Sprint 4: 프로젝트 정보 화면 및 Codex 변경 승인 UI 구현
- [ ] 최근 수정 파일 썸네일 목록 표시 기능 구현
- [ ] 대화 로그 UI 구현 (하단에서 위로 무한 스크롤 로딩)
- [ ] 채팅 입력창 및 채팅 전송 기능 구현
- [ ] 모바일 레이아웃 최적화 및 드로어 메뉴 구현
- [ ] **Codex 명령 실행 결과 표시 UI 개발**
- [ ] **Codex 파일 변경사항 승인/거부 UI 개발**
- [ ] **Codex 승인 모드 선택 인터페이스 구현**

### 🔹 Sprint 5: 구조 Analyzer, Snapshot 뷰어 및 Codex 통합 강화
- [ ] Git 커밋 상태 분석하여 파일 구조 스냅샷 JSON 생성 (백엔드 Python)
- [ ] JSON diff 연산을 통한 변경 사항 시각적 표시 (프론트엔드 React)
- [ ] 변경 사항을 시각화하는 Snapshot 뷰어 컴포넌트 개발
- [ ] **Codex 변경사항과 Git 스냅샷 통합 시각화**
- [ ] **Codex 실행 로그와 프로젝트 스냅샷 연결**

### 🔹 Sprint 6: 페르소나 상태 애니메이션 및 Codex 상태 시각화
- [ ] 아바타 상태 애니메이션 (대기, 작업중, 오류, 성공 상태 등) 구현
- [ ] 페르소나 편집 및 상태 관리 기능 완성
- [ ] 성능 최적화를 위한 이미지 슬라이싱 및 sprite animation 처리
- [ ] **Codex 실행 상태에 따른 아바타 상태 연동**
- [ ] **Codex 작업 진행 시각화 컴포넌트 개발**

### 🔹 Sprint 7: Codex 고급 기능 통합
- [ ] **Codex 명령어 히스토리 관리 및 재실행 기능**
- [ ] **Codex 멀티모달 입력 지원 (스크린샷, 다이어그램 등)**
- [ ] **Codex 프로젝트 컨텍스트 자동 분석 및 제안 기능**
- [ ] **Codex 예제 및 템플릿 라이브러리 구현**
- [ ] **사용자 정의 Codex 명령어 단축키 설정 기능**

### 🔹 Sprint 8: LAIOS 시스템과 Codex CLI 연동
- [ ] LAIOS 업무 자동화 시스템과의 데이터 동기화 API 개발
- [ ] CodexGUI의 작업 로그 및 컨텍스트 정보를 LAIOS에 자동 전달
- [ ] 파일 경합 방지 및 동기화 오류 처리 기능 개발
- [ ] **LAIOS 시스템에서 Codex 명령어 활용 통합**
- [ ] **Codex 결과를 LAIOS 작업 흐름에 반영하는 메커니즘 개발**

### 🔹 Sprint 9: QA / E2E 테스트 및 성능 최적화
- [ ] Playwright 기반의 E2E 테스트 시나리오 작성 및 실행
- [ ] Lighthouse 성능 점검 (PWA 점수 ≥90 목표)
- [ ] 발견된 버그 및 성능 이슈 개선
- [ ] **Codex 통합 관련 보안 테스트 및 성능 최적화**
- [ ] **대규모 코드베이스에서의 Codex 성능 테스트**

### 🔹 Sprint 10: 최종 배포 (Beta Release)
- [ ] GitHub Pages를 통한 PWA 정적 배포 환경 구축
- [ ] Docker 이미지 생성 및 Docker Hub 배포
- [ ] npm 패키지(@codexgui/sdk) 배포
- [ ] Beta 릴리스 공개 및 초기 사용자 피드백 수집
- [ ] **Codex 통합 특화 기능 마케팅 자료 작성**
- [ ] **Codex 활용 예제 및 사용자 가이드 작성**

---

## 🚩 Codex CLI 통합 설계 원칙

1. **사용자 경험 중심**: 터미널에 익숙하지 않은 개발자도 쉽게 AI 코딩 기능을 활용할 수 있도록 설계
2. **시각적 투명성**: Codex가 수행하는 모든 작업을 시각적으로 명확하게 표현
3. **안전한 샌드박싱**: 모든 Codex 명령은 격리된 환경에서 실행되어 보안 위험 최소화
4. **점진적 자율성**: 사용자가 원하는 만큼의 자동화 수준을 선택할 수 있도록 다양한 승인 모드 제공
5. **버전 관리 통합**: Git 기반 워크플로우와 원활하게 통합되어 모든 Codex 변경사항을 추적 가능하게 함

---

## 🏅 기대 결과

- AI 모델이 본 문서를 기반으로 CodexGUI를 완전 자동으로 구현 가능
- 구현 과정에서 추가적인 기술 지식 없이 명확한 단계별 업무 처리 가능
- OpenAI Codex CLI의 강력한 기능을 직관적인 GUI 환경에서 활용 가능
- 완료된 CodexGUI가 LAIOS 시스템과 효율적으로 통합되어 높은 사용성을 제공

이 문서를 통해 AI가 독립적으로 CodexGUI 구현을 진행할 수 있도록 명확한 가이드라인을 제공하며, 특히 원래 의도했던 Codex CLI 통합을 강화하여 프로젝트의 가치를 높이는 방향으로 개발이 진행될 것입니다.
