# CodexGUI 개발 환경 설정 가이드

이 문서는 CodexGUI 프로젝트의 개발 환경을 설정하는 방법을 설명합니다. 두 가지 접근 방식을 제공합니다:

1. Python 가상환경(venv)을 사용한 설정
2. Docker 컨테이너를 사용한 설정

## 목차

- [사전 요구사항](#사전-요구사항)
- [Python 가상환경 설정](#python-가상환경-설정)
- [Docker 환경 설정](#docker-환경-설정)
- [MCP 서버와 통합](#mcp-서버와-통합)
- [문제 해결](#문제-해결)

## 사전 요구사항

- Python 3.11 이상
- Node.js 18.0 이상
- Git
- Docker 및 Docker Compose (Docker 환경 설정 시)

## Python 가상환경 설정

### 가상환경 설정 및 의존성 설치

가상환경을 설정하기 위해 저장소 루트 디렉토리에서 다음 배치 파일을 실행합니다:

```bash
setup_venv.bat
```

이 스크립트는 다음 작업을 수행합니다:

1. `codexgui_env` 가상환경 생성
2. 가상환경 활성화
3. 백엔드 의존성 설치 (`backend/requirements.txt`)
4. 테스트 의존성 설치 (pytest, pytest-asyncio, httpx)
5. 현재 설치된 패키지의 정확한 버전을 `requirements_dev.txt`에 저장

### 가상환경 활성화

가상환경을 활성화하기 위해 다음 배치 파일을 실행합니다:

```bash
activate_venv.bat
```

이 스크립트는 새 명령 프롬프트 창을 열고 가상환경을 활성화합니다.

### 가상환경에서 테스트 실행

가상환경에서 테스트를 실행하기 위해 다음 배치 파일을 실행합니다:

```bash
run_tests_venv.bat
```

이 스크립트는 기존의 `run_tests.bat`와 동일하게 동작하지만, 가상환경 내에서 실행됩니다.

### 가상환경에서 개발 서버 실행

백엔드 서버를 실행하려면:

```bash
# 가상환경 활성화 후
cd backend
uvicorn app.main:app --reload
```

프론트엔드 개발 서버를 실행하려면:

```bash
cd frontend
npm install
npm run dev
```

## Docker 환경 설정

### Docker 개발 환경 시작

Docker 개발 환경을 시작하기 위해 다음 배치 파일을 실행합니다:

```bash
run_docker_dev.bat
```

이 스크립트는 다음 컨테이너를 실행합니다:

1. `codexgui-backend`: 백엔드 API 서버 (포트 8000)
2. `codexgui-frontend`: 프론트엔드 개발 서버 (포트 5173)
3. `mcp-server`: MCP 서버 (포트 8080)

### Docker 개발 환경 중지

Docker 개발 환경을 중지하기 위해 다음 배치 파일을 실행합니다:

```bash
stop_docker_dev.bat
```

### Docker 로그 확인

Docker 컨테이너의 로그를 확인하려면:

```bash
docker-compose -f docker-compose-dev.yml logs -f
```

특정 서비스의 로그만 확인하려면:

```bash
docker-compose -f docker-compose-dev.yml logs -f backend
docker-compose -f docker-compose-dev.yml logs -f frontend
docker-compose -f docker-compose-dev.yml logs -f mcp-server
```

## 개발 환경 분리

개발 중 다른 프로젝트와의 의존성 충돌 방지를 위해 별도의 가상환경을 사용합니다. 특히 CodexGUI와 다른 Python 프로젝트 간의 충돌을 방지합니다.

### 가상환경 설정

CodexGUI 가상환경 설정:

1. `setup_venv.bat` 실행으로 가상환경 생성 및 의존성 설치
2. `activate_venv.bat`으로 가상환경 활성화
3. 활성화된 환경에서 개발 작업 진행

## 문제 해결

### 의존성 충돌

의존성 충돌이 발생하는 경우 다음과 같이 해결할 수 있습니다:

1. 가상환경을 삭제하고 다시 생성:
   ```bash
   rmdir /s /q codexgui_env
   setup_venv.bat
   ```

2. 특정 패키지 버전 고정:
   ```bash
   pip install httpx==0.24.1 starlette==0.27.0
   ```

### Docker 관련 문제

1. Docker 데몬이 실행 중인지 확인:
   ```bash
   docker info
   ```

2. Docker 컨테이너 상태 확인:
   ```bash
   docker-compose -f docker-compose-dev.yml ps
   ```

3. Docker 컨테이너 재시작:
   ```bash
   docker-compose -f docker-compose-dev.yml restart
   ```

4. Docker 볼륨 및 이미지 정리:
   ```bash
   docker-compose -f docker-compose-dev.yml down -v
   docker system prune -a
   ```

### 포트 충돌

특정 포트가 이미 사용 중인 경우 `docker-compose-dev.yml` 파일을 수정하여 다른 포트를 사용하도록 설정할 수 있습니다:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # 로컬 포트 8001을 컨테이너 포트 8000에 매핑
```

이 경우 백엔드는 `http://localhost:8001`로 접근할 수 있습니다.
