# FastAPI 비동기 테스트 모범 사례

이 문서는 CodexGUI 프로젝트에서 FastAPI와 같은 비동기 프레임워크를 테스트할 때 발생할 수 있는 문제와 그 해결 방법에 대한 모범 사례를 제공합니다. Sprint 1에서 경험한 비동기 테스트 문제를 바탕으로 작성되었습니다.

## 주요 도전 과제

FastAPI와 같은 비동기 프레임워크를 테스트할 때 다음과 같은 도전 과제가 있습니다:

1. **동기식 테스트 환경과 비동기 코드의 충돌**
2. **비동기 HTTP 클라이언트 모킹의 복잡성**
3. **코루틴 처리 및 이벤트 루프 관리**
4. **테스트 간 비동기 리소스 공유 및 격리**

## 해결 방법

### 1. 적절한 모킹 전략

#### 문제
`AsyncMock`을 사용한 비동기 함수 모킹 시 `'coroutine' object has no attribute 'get'`와 같은 오류가 발생합니다.

#### 해결책: 커스텀 MockResponse 클래스

```python
class MockResponse:
    def __init__(self, status_code, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text
    
    def json(self):
        return self._json_data
```

#### 사용 예시

```python
def test_api_endpoint(test_client):
    with patch('httpx.AsyncClient.get') as mock_get:
        # 모킹 설정
        mock_response = MockResponse(
            status_code=200,
            json_data={"data": [{"id": "item-1"}]}
        )
        mock_get.return_value = mock_response
        
        # API 호출
        response = test_client.get("/api/items")
        
        # 검증
        assert response.status_code == 200
        assert "data" in response.json()
```

### 2. 비동기 테스트 환경 구성

#### 문제
테스트가 비동기 코드를 적절히 처리하지 못하여 이벤트 루프 관련 오류나 `asyncio` 경고가 발생합니다.

#### 해결책: 명시적 pytest-asyncio 설정

**pytest.ini 구성**
```ini
[pytest]
asyncio_mode = strict
asyncio_default_fixture_loop_scope = function
```

**conftest.py에 이벤트 루프 및 비동기 클라이언트 설정**
```python
import pytest
import asyncio
from httpx import AsyncClient

@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def async_client(app):
    """Create an async client for testing asynchronous API calls."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
```

#### 비동기 테스트 작성

```python
import pytest

@pytest.mark.asyncio
async def test_async_endpoint(async_client):
    """비동기 엔드포인트 테스트"""
    response = await async_client.get("/api/async-endpoint")
    assert response.status_code == 200
```

### 3. 부분 비동기 코드 처리

#### 문제
테스트 클라이언트는 동기식이지만 일부 내부 로직이 비동기인 경우 처리가 복잡해집니다.

#### 해결책: anyio를 사용한 동기-비동기 통합

```python
from anyio import run

def test_mixed_sync_async(test_client):
    """동기 테스트 내에서 비동기 코드 실행"""
    def _run_async():
        async def _async_task():
            # 비동기 작업 수행
            return "result"
            
        return run(_async_task)
    
    result = _run_async()
    assert result == "result"
```

### 4. 비동기 Side Effect 처리

#### 문제
`AsyncMock`의 `side_effect`를 설정할 때 비동기 동작이 제대로 모의되지 않습니다.

#### 해결책: 커스텀 Side Effect 함수

```python
def test_with_side_effects(test_client):
    with patch('module.async_function') as mock_func:
        # 조건부 동작을 위한 side effect 함수
        def side_effect(*args, **kwargs):
            if 'condition' in kwargs:
                return MockResponse(200, {"result": "success"})
            else:
                # 예외를 발생시키는 경우
                raise Exception("Error condition")
                
        mock_func.side_effect = side_effect
        
        # 테스트 실행
        response = test_client.get("/api/endpoint?condition=true")
        assert response.status_code == 200
```

### 5. 테스트 격리 및 리소스 관리

#### 문제
비동기 코드는 종종 공유 리소스(캐시, 연결 풀 등)에 접근하여 테스트 간 간섭을 일으킬 수 있습니다.

#### 해결책: 명시적 초기화 및 정리

```python
import pytest

@pytest.fixture(autouse=True)
def clear_resources():
    """각 테스트 전에 공유 리소스 초기화"""
    # 테스트 전 초기화
    SHARED_CACHE.clear()
    CONNECTION_POOL.reset()
    
    # 테스트 실행
    yield
    
    # 테스트 후 정리
    SHARED_CACHE.clear()
    CONNECTION_POOL.close()
```

## 비동기 테스트 디버깅 전략

비동기 테스트에서 문제가 발생할 때 디버깅하는 방법:

### 1. 로깅 강화

```python
import logging
logging.basicConfig(level=logging.DEBUG)

async def test_function():
    logging.debug("Step 1: Before async call")
    result = await async_function()
    logging.debug(f"Step 2: After async call, result: {result}")
```

### 2. 비동기 오류 추적

코루틴 체인에서 오류를 더 명확하게 파악하기 위해 `asyncio.create_task()`의 디버그 모드 활성화:

```python
import asyncio

# 테스트 시작 시 디버그 모드 활성화
asyncio.get_event_loop().set_debug(True)
```

### 3. 이벤트 루프 상태 확인

```python
import asyncio

def check_event_loop():
    try:
        loop = asyncio.get_event_loop()
        print(f"Current event loop: {loop}")
        print(f"Loop running: {loop.is_running()}")
        print(f"Loop closed: {loop.is_closed()}")
    except RuntimeError as e:
        print(f"Event loop error: {e}")
```

## 실제 적용 사례: API 키 검증 테스트

Sprint 1에서 API 키 검증 테스트에 적용한 방법을 살펴보겠습니다.

### 문제 상황
기존 테스트 코드는 `AsyncMock`을 사용하여 HTTPX 클라이언트 응답을 모의했지만, 이로 인해 `'coroutine' object has no attribute 'get'` 오류가 발생했습니다.

### 해결 방법

1. **MockResponse 클래스 도입**:
```python
class MockResponse:
    def __init__(self, status_code, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text
    
    def json(self):
        return self._json_data
```

2. **테스트 코드 개선**:
```python
def test_validate_valid_api_key(test_client):
    """API 키 검증 테스트"""
    with patch('httpx.AsyncClient.get') as mock_get:
        # 모델 목록 API 응답 모의
        mock_models_response = MockResponse(
            status_code=200, 
            json_data={"data": [{"id": "gpt-4", "owned_by": "openai"}]}
        )
        
        # API 호출 시퀀스 설정
        mock_get.side_effect = [mock_models_response, ...]
        
        # API 검증 요청
        response = test_client.post(
            "/api/validate-key",
            json={"apiKey": VALID_KEY}
        )
        
        assert response.status_code == 200
        assert response.json()["valid"] == True
```

3. **pytest.ini 설정**:
```ini
[pytest]
asyncio_mode = strict
asyncio_default_fixture_loop_scope = function
```

## 결론

FastAPI와 같은 비동기 프레임워크를 테스트할 때는 동기식 테스트 환경과 비동기 코드 사이의 간극을 적절히 다루는 것이 중요합니다. 커스텀 `MockResponse` 클래스, 명확한 비동기 테스트 설정, 그리고 적절한 리소스 관리를 통해 안정적이고 예측 가능한 테스트를 작성할 수 있습니다.

이러한 모범 사례를 따르면 `'coroutine' object has no attribute 'get'`와 같은 일반적인 오류를 피하고, 비동기 코드에 대한 더 신뢰할 수 있는 테스트를 작성할 수 있습니다.
