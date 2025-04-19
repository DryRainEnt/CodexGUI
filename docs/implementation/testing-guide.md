# CodexGUI 테스트 가이드

이 문서는 CodexGUI 프로젝트의 테스트 전략과 실행 방법, 그리고 테스트 작성 가이드라인을 설명합니다. 개발자와 기여자가 일관된 방식으로 테스트를 작성하고 실행할 수 있도록 가이드를 제공합니다.

## 테스트 환경 설정

### 필수 환경
- Python 3.10 이상
- Node.js 18 이상
- SQLite 3

### 가상 환경 설정
```bash
# 가상 환경 생성 및 활성화
python -m venv codexgui_env
codexgui_env\Scripts\activate  # Windows
source codexgui_env/bin/activate  # macOS/Linux

# 백엔드 의존성 설치
cd backend
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

## 테스트 실행 방법

### 자동화된 테스트 실행

프로젝트 루트 디렉토리에서 제공되는 배치 파일을 사용하면 모든 테스트를 자동으로 실행할 수 있습니다:

```bash
# 모든 테스트 실행 (프론트엔드 + 백엔드)
run_tests_venv.bat  # 가상 환경 사용

# API 키 관련 테스트만 실행
run_api_tests.bat
```

### 수동 테스트 실행

#### 백엔드 테스트
```bash
cd backend
python -m pytest       # 모든 백엔드 테스트 실행
python -m pytest -v    # 상세 출력으로 실행
python -m pytest tests/test_api_keys.py  # 특정 테스트 파일만 실행
```

#### 프론트엔드 테스트
```bash
cd frontend
npm test               # 모든 프론트엔드 테스트 실행
npm test -- --watch    # 감시 모드로 실행
npm test -- src/pages/Launch.test.tsx  # 특정 테스트 파일만 실행
```

## 테스트 작성 가이드라인

### 백엔드 테스트

#### 1. API 엔드포인트 테스트

```python
def test_endpoint_functionality(test_client):
    """엔드포인트 기능 테스트 설명"""
    # 테스트 데이터 준비
    test_data = {"key": "value"}
    
    # 요청 실행
    response = test_client.post("/api/endpoint", json=test_data)
    
    # 응답 검증
    assert response.status_code == 200
    json_response = response.json()
    assert "result" in json_response
    assert json_response["result"] == "expected_value"
```

#### 2. 비동기 API 테스트

```python
import pytest

@pytest.mark.asyncio
async def test_async_functionality(async_client):
    """비동기 기능 테스트 설명"""
    # 비동기 요청 실행
    response = await async_client.get("/api/async-endpoint")
    
    # 응답 검증
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] == True
```

#### 3. 모킹을 이용한 외부 API 테스트

```python
from unittest.mock import patch

def test_external_api_integration(test_client):
    """외부 API 통합 테스트 설명"""
    # 외부 API 호출 모킹
    with patch('httpx.AsyncClient.get') as mock_get:
        # 모의 응답 설정
        mock_response = MockResponse(
            status_code=200, 
            json_data={"data": "mocked_value"}
        )
        mock_get.return_value = mock_response
        
        # 테스트 요청 실행
        response = test_client.get("/api/integrated-endpoint")
        
        # 응답 검증
        assert response.status_code == 200
        assert response.json()["result"] == "expected_value"
```

### 프론트엔드 테스트

#### 1. 컴포넌트 렌더링 테스트

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />);
    
    // 요소 존재 확인
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
    
    // 속성 확인
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('disabled');
  });
});
```

#### 2. 사용자 상호작용 테스트

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserForm from './UserForm';

describe('UserForm', () => {
  it('submits the form with user input', async () => {
    // 목 함수 설정
    const mockSubmit = vi.fn();
    
    // 컴포넌트 렌더링
    render(<UserForm onSubmit={mockSubmit} />);
    
    // 입력 요소 찾기
    const nameInput = screen.getByLabelText('Name');
    const submitButton = screen.getByText('Submit');
    
    // 사용자 입력 시뮬레이션
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.click(submitButton);
    
    // 제출 검증
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'Test User' });
  });
});
```

#### 3. 비동기 작업 테스트

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import DataFetcher from './DataFetcher';

// 모의 서버 설정
const server = setupServer(
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.json({ result: 'mocked data' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DataFetcher', () => {
  it('loads and displays data', async () => {
    render(<DataFetcher />);
    
    // 로딩 상태 확인
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // 데이터 로딩 완료 대기
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // 데이터 표시 확인
    expect(screen.getByText('mocked data')).toBeInTheDocument();
  });
});
```

## 테스트 커버리지

테스트 커버리지를 측정하기 위해 다음 도구를 사용합니다:

- **백엔드**: `pytest-cov`
- **프론트엔드**: `vitest --coverage`

커버리지 목표:
- 코드 라인 커버리지: 80% 이상
- 기능 커버리지: 90% 이상

커버리지 보고서 생성:

```bash
# 백엔드 커버리지
cd backend
python -m pytest --cov=app

# 프론트엔드 커버리지
cd frontend
npm test -- --coverage
```

## 테스트 디버깅

### 백엔드 테스트 디버깅

```bash
# 상세 로그 출력으로 실행
python -m pytest -v tests/test_file.py

# 특정 테스트만 실행
python -m pytest tests/test_file.py::test_function_name

# 디버깅 정보 활성화
python -m pytest --log-cli-level=DEBUG
```

### 프론트엔드 테스트 디버깅

```bash
# 단일 테스트 실행
npm test -- -t "test name pattern"

# 디버깅 모드로 실행
NODE_OPTIONS=--inspect-brk npm test -- --runInBand
```

## 테스트 모범 사례

1. **테스트 격리**: 각 테스트는 독립적으로 실행될 수 있어야 하며, 다른 테스트에 의존하지 않아야 합니다.

2. **명확한 설명**: 테스트 함수 이름과 독스트링은 테스트의 목적과 예상 동작을 명확히 설명해야 합니다.

3. **테스트 준비-실행-검증 패턴**: 
   - 준비(Arrange): 테스트 데이터 및 환경 설정
   - 실행(Act): 테스트 중인 기능 호출
   - 검증(Assert): 결과 확인

4. **모킹 적절히 사용**: 외부 의존성은 적절히 모킹하여 테스트의 예측 가능성을 높입니다.

5. **비동기 테스트 주의사항**:
   - `AsyncMock` 대신 `MockResponse` 클래스 사용 권장
   - 비동기 함수 테스트 시 `async`/`await` 또는 `pytest.mark.asyncio` 사용

6. **테스트 데이터 관리**:
   - 테스트 고정 데이터(fixtures)를 활용하여 일관된 테스트 환경 구성
   - 임시 파일 및 디렉토리는 테스트 후 정리

## 문제 해결

### 일반적인 문제

1. **테스트 격리 실패**
   - 원인: 전역 상태 공유 또는 테스트 간 의존성
   - 해결: `@pytest.fixture(autouse=True)`로 각 테스트 전후 상태 초기화

2. **비동기 테스트 실패**
   - 원인: 비동기 코드의 잘못된 모킹 또는 대기 처리
   - 해결: `MockResponse` 클래스 사용 및 비동기 이벤트 루프 적절한 설정

3. **React 테스트에서 `act()` 경고**
   - 원인: 상태 업데이트가 `act()` 함수로 래핑되지 않음
   - 해결: 상태 변경 코드를 `act(() => { ... })` 내에서 실행

## 결론

효과적인 테스트는 코드의 품질과 안정성을 보장하는 핵심 요소입니다. 이 가이드라인을 따라 작성된 테스트는 CodexGUI 프로젝트의 건강한 발전을 뒷받침하고, 기여자들이 자신 있게 새로운 기능을 개발하고 기존 코드를 리팩토링할 수 있는 환경을 제공할 것입니다.
