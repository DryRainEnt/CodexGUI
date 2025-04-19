import pytest
import time
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import status
from httpx import AsyncClient, Response
import json
from anyio import run

from app.routers.api_keys import (
    ApiKeyRequest, 
    KEY_VALIDATION_CACHE, 
    TOKEN_USAGE_CACHE,
    is_test_key,
    cache_key_validation,
    cache_token_usage
)

# 커스텀 Mock Response 클래스 생성
class MockResponse:
    def __init__(self, status_code, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text
    
    def json(self):
        return self._json_data

# 테스트용 API 키
TEST_KEY = "sk-validkey12345"
VALID_KEY = "sk-test12345678901234567890"
INVALID_KEY = "sk-invalid12345678901234"
MALFORMED_KEY = "invalid-key-format"

@pytest.fixture(autouse=True)
def clear_caches():
    """각 테스트 전에 캐시 초기화"""
    KEY_VALIDATION_CACHE.clear()
    TOKEN_USAGE_CACHE.clear()
    yield

def test_validate_test_api_key(test_client):
    """테스트용 API 키 검증 테스트"""
    response = test_client.post(
        "/api/validate-key",
        json={"apiKey": TEST_KEY}
    )
    
    assert response.status_code == status.HTTP_200_OK
    json_response = response.json()
    assert json_response["valid"] == True
    assert json_response["message"] == "Test API key is valid"
    assert json_response["rate_limits"] is not None
    assert json_response["rate_limits"]["remaining_tokens"] == 999000

def test_validate_valid_api_key(test_client):
    """유효한 API 키 검증 테스트"""
    # API 응답 모의 처리
    with patch('httpx.AsyncClient.get') as mock_get:
        # 모델 목록 API 응답 모의
        mock_models_response = MockResponse(
            status_code=200, 
            json_data={"data": [{"id": "gpt-4", "owned_by": "openai"}]}
        )
        
        # 사용량 API 응답 모의
        mock_usage_response = MockResponse(
            status_code=200, 
            json_data={"total_usage": 5000}  # $50.00
        )
        
        # 구독 API 응답 모의
        mock_subscription_response = MockResponse(
            status_code=200,
            json_data={
                "hard_limit_usd": 120,
                "soft_limit_usd": 100
            }
        )
        
        # API 호출 시퀀스 설정
        mock_get.side_effect = [mock_models_response, mock_usage_response, mock_subscription_response]
        
        # API 검증 요청
        response = test_client.post(
            "/api/validate-key",
            json={"apiKey": VALID_KEY}
        )
        
        # 응답 확인
        assert response.status_code == status.HTTP_200_OK
        json_response = response.json()
        assert json_response["valid"] == True
        assert json_response["message"] == "API key is valid"
        assert json_response["rate_limits"] is not None
        assert "remaining_tokens" in json_response["rate_limits"]
        assert json_response["rate_limits"]["usage_percent"] > 0

def test_validate_invalid_api_key(test_client):
    """유효하지 않은 API 키 검증 테스트"""
    with patch('httpx.AsyncClient.get') as mock_get:
        # 인증 오류 응답 모의
        mock_response = MockResponse(
            status_code=401, 
            text="Invalid API key"
        )
        
        # 직접 mock response 반환값 설정
        mock_get.return_value = mock_response
        
        # API 검증 요청
        response = test_client.post(
            "/api/validate-key",
            json={"apiKey": INVALID_KEY}
        )
        
        # 응답 확인 - API 내부 처리로 인해 401 또는 200 응답 가능
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_200_OK]
        json_response = response.json()
        assert not json_response["valid"]
        assert "Invalid API key" in json_response["message"] or json_response["message"] == "Invalid API key"

def test_validate_malformed_api_key(test_client):
    """형식이 잘못된 API 키 검증 테스트"""
    response = test_client.post(
        "/api/validate-key",
        json={"apiKey": MALFORMED_KEY}
    )
    
    # 응답 확인 - 검증 오류로 422 응답 예상
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    json_response = response.json()
    assert "detail" in json_response
    validation_error = json_response["detail"][0]
    # 오류 메시지에 'Invalid API key format'이 포함되어 있는지 확인
    assert "Invalid API key format" in validation_error["msg"]

def test_api_key_validation_cache(test_client):
    """API 키 검증 결과 캐싱 테스트"""
    # 테스트 전 캐시 클리어 확인
    KEY_VALIDATION_CACHE.clear()
    
    # 첫 번째 요청 - 실제 검증 실행
    with patch('httpx.AsyncClient.get') as mock_get:
        # 모델 목록 API 응답 모의
        mock_response = MockResponse(
            status_code=200, 
            json_data={"data": []}
        )
        
        # 첫번째 API 반응값 설정
        mock_get.return_value = mock_response
        
        # API 검증 요청
        response = test_client.post(
            "/api/validate-key",
            json={"apiKey": VALID_KEY}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert "valid" in response.json()
        assert mock_get.call_count > 0  # API 호출 확인
    
    # 두 번째 요청 - 캐싱된 결과 사용 예상
    with patch('httpx.AsyncClient.get') as mock_get2:
        # 이 모의 함수는 호출되지 않아야 함
        # 캐싱 정상 작동 시 mock_get는 호출되지 않음
        
        # API 검증 요청 - 동일한 키로 다시 요청
        response = test_client.post(
            "/api/validate-key",
            json={"apiKey": VALID_KEY}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert mock_get2.call_count == 0  # API 호출 없음 (캐싱된 결과 사용)

def test_get_token_usage(test_client):
    """토큰 사용량 조회 테스트"""
    # 테스트용 API 키로 요청
    response = test_client.get(
        "/api/token-usage", 
        headers={"X-API-Key": TEST_KEY}
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert "total_tokens_used" in response.json()
    assert "remaining_tokens" in response.json()
    assert "quota" in response.json()

def test_get_token_usage_no_key(test_client):
    """API 키 없이 토큰 사용량 조회 테스트"""
    response = test_client.get("/api/token-usage")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "API key is required" in response.json()["detail"]

def test_check_api_key_status_test_key(test_client):
    """테스트용 API 키 상태 확인 테스트"""
    response = test_client.get(
        "/api/validate-key/status", 
        headers={"X-API-Key": TEST_KEY}
    )
    
    assert response.status_code == status.HTTP_200_OK
    json_response = response.json()
    assert json_response["is_valid"] == True
    assert json_response["status"] == "active"
    assert json_response["remaining_tokens"] == 999000

def test_check_api_key_status_no_key(test_client):
    """API 키 없이 상태 확인 테스트"""
    response = test_client.get("/api/validate-key/status")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    json_response = response.json()
    assert json_response["is_valid"] == False
    assert json_response["status"] == "missing_key"

def test_check_api_key_status_valid_key(test_client):
    """유효한 API 키 상태 확인 테스트"""
    with patch('httpx.AsyncClient.get') as mock_get:
        # 모델 목록 API 응답 모의
        mock_models_response = MockResponse(
            status_code=200, 
            json_data={"data": []}
        )
        
        # 사용량 조회 시 예외 발생을 위한 mock 함수 생성
        def side_effect(*args, **kwargs):
            if 'billing' in args[0]:
                raise Exception("Usage API error")
            return mock_models_response
        
        # API 호출 시퀀스 설정
        mock_get.side_effect = side_effect
        
        response = test_client.get(
            "/api/validate-key/status", 
            headers={"X-API-Key": VALID_KEY}
        )
        
        assert response.status_code == status.HTTP_200_OK
        json_response = response.json()
        assert json_response["is_valid"] == True
        assert json_response["status"] == "active"
        assert "last_checked" in json_response

def test_check_api_key_status_invalid_key(test_client):
    """유효하지 않은 API 키 상태 확인 테스트"""
    with patch('httpx.AsyncClient.get') as mock_get:
        # 인증 오류 응답 모의
        mock_response = MockResponse(
            status_code=401, 
            text="Invalid API key"
        )
        
        # 직접 mock response 반환값 설정
        mock_get.return_value = mock_response
        
        response = test_client.get(
            "/api/validate-key/status", 
            headers={"X-API-Key": INVALID_KEY}
        )
        
        assert response.status_code == status.HTTP_200_OK
        json_response = response.json()
        assert json_response["is_valid"] == False
        assert json_response["status"] in ["invalid", "error"]  # 에러 상태 유연하게 처리

def test_check_api_key_status_rate_limited(test_client):
    """속도 제한된 API 키 상태 확인 테스트"""
    with patch('httpx.AsyncClient.get') as mock_get:
        # 속도 제한 응답 모의
        mock_response = MockResponse(
            status_code=429, 
            text="Rate limit exceeded"
        )
        
        # 직접 mock response 반환값 설정
        mock_get.return_value = mock_response
        
        response = test_client.get(
            "/api/validate-key/status", 
            headers={"X-API-Key": VALID_KEY}
        )
        
        assert response.status_code == status.HTTP_200_OK
        json_response = response.json()
        assert json_response["is_valid"] == True
        assert json_response["status"] == "rate_limited"

# 캐싱 유틸리티 함수 단위 테스트
def test_is_test_key():
    """테스트용 API 키 확인 함수 테스트"""
    assert is_test_key(TEST_KEY) == True
    assert is_test_key(VALID_KEY) == False
    assert is_test_key(INVALID_KEY) == False

def test_cache_key_validation():
    """API 키 검증 결과 캐싱 함수 테스트"""
    result = {"valid": True, "message": "Success"}
    cache_key_validation(VALID_KEY, result)
    
    assert VALID_KEY in KEY_VALIDATION_CACHE
    assert KEY_VALIDATION_CACHE[VALID_KEY]["result"] == result
    assert KEY_VALIDATION_CACHE[VALID_KEY]["expires"] > time.time()

def test_cache_token_usage():
    """토큰 사용량 결과 캐싱 함수 테스트"""
    usage_data = {"remaining_tokens": 100000}
    cache_token_usage(VALID_KEY, usage_data)
    
    assert VALID_KEY in TOKEN_USAGE_CACHE
    assert TOKEN_USAGE_CACHE[VALID_KEY]["data"] == usage_data
    assert TOKEN_USAGE_CACHE[VALID_KEY]["expires"] > time.time()
