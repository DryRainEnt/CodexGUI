# CodexGUI 의존성 관리 가이드

이 문서는 CodexGUI 프로젝트의 의존성 관리 전략을 설명하며, 개발 중 발생할 수 있는 버전 충돌 문제를 예방하는 방법을 제시합니다.

## 현재 발견된 호환성 문제

Sprint 0 완료 후 백엔드 테스트 실행 시 다음과 같은 오류가 발생했습니다:

```
TypeError: Client.__init__() got an unexpected keyword argument 'app'
```

이 문제는 FastAPI의 TestClient와 관련 패키지(httpx, starlette 등)의 버전 호환성 문제로 인해 발생했습니다. 최신 버전에서 TestClient의 초기화 방식이 변경되었기 때문입니다.

## 해결책

### 1. 임시 해결책 (즉시 적용)

`conftest.py` 파일에서 TestClient 초기화 방식을 다음과 같이 변경하였습니다:

```python
@pytest.fixture
def test_client():
    """
    Create a test client for the FastAPI app
    """
    client = TestClient(app)
    try:
        yield client
    finally:
        client.close()
```

이 방식은 `with` 문을 사용하지 않고, 명시적으로 리소스를 관리하여 TestClient의 초기화 문제를 해결합니다.

### 2. 근본적인 해결책 (장기 전략)

#### 2.1 정확한 버전 고정

모든 중요 의존성의 버전을 명시적으로 고정하여 호환성 문제를 예방합니다:

```
fastapi==0.103.1
starlette==0.27.0
httpx==0.25.0
pydantic==2.0.3
```

#### 2.2 가상 환경 설정

프로젝트 개발 시 항상 독립된 가상 환경을 사용하여 시스템 전역 패키지와의 충돌을 방지합니다:

```bash
# 개발 환경 설정
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### 2.3 의존성 업데이트 절차

의존성 업데이트를 위한 안전한 절차를 정의합니다:

1. 업데이트 대상 패키지의 릴리스 노트 확인
2. 새 가상 환경에서 업데이트 테스트
3. 모든 테스트 케이스 실행 확인
4. 성공 시 requirements.txt 업데이트
5. 업데이트 내용 문서화

## 의존성 점검 자동화

프로젝트에 다음과 같은 의존성 점검 자동화를 추가합니다:

### 1. 의존성 검증 스크립트

`scripts/check_dependencies.py` 파일을 추가하여 호환성 검사를 자동화합니다.

### 2. CI/CD 파이프라인 통합

GitHub Actions 또는 기타 CI/CD 도구에서 의존성 검사를 자동으로 수행합니다:

```yaml
# .github/workflows/check-dependencies.yml
name: Check Dependencies
on: [push, pull_request]
jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Check dependencies
        run: python scripts/check_dependencies.py
```

## 의존성 문제 해결 가이드

개발자가 의존성 문제에 직면했을 때 참고할 수 있는 단계별 가이드:

1. 오류 메시지 확인 및 관련 패키지 식별
2. 패키지 버전 및 호환성 매트릭스 검토
3. 임시 해결책 적용 및 테스트
4. 문제 및 해결책 문서화
5. 장기적 해결책 구현 (필요한 경우)

## 주요 의존성 호환성 표

| 패키지      | 버전    | 호환되는 패키지                       |
|------------|---------|-------------------------------------|
| fastapi    | 0.103.1 | starlette==0.27.0, pydantic==2.0.3  |
| httpx      | 0.25.0  | starlette==0.27.0                   |
| uvicorn    | 0.24.0+ | fastapi==0.103.1                    |
| pydantic   | 2.0.3   | fastapi==0.103.1                    |
| dulwich    | 0.21.6+ | 호환성 문제 없음                      |

이 표는 프로젝트의 패키지 버전이 업데이트됨에 따라 계속 업데이트되어야 합니다.

