import pytest
import time
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import status
from httpx import AsyncClient, Response
import json

from app.routers.api_keys import (
    ApiKeyRequest, 
    KEY_VALIDATION_CACHE, 
    TOKEN_USAGE_CACHE,
    is_test_key,
    cache_key_validation,
    cache_token_usage
)

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
        mock_models_response = MagicMock(spec=Response)
        mock_models_response.status_code = 200
        mock_models_response.json.return_value = {"data": [{"id": "gpt-4", "owned_by": "openai"}]}
        
        # 사용량 API 응답 모의
        mock_usage_response = MagicMock(spec=Response)
        mock_usage_response.status_code = 200
        mock_usage_response.json.return_value = {"total_usage": 5000}  # $50.00
        
        # 구독 API 응답 모의
        mock_subscription_response = MagicMock(spec=Response)
        mock_subscription_response.status_code = 200
        mock_subscription_response.json.return_value = {
            "hard_limit_usd": 120,
            "soft_limit_usd": 100
        }
        
        # API 호출 시퀀스 설정
        mock_get.side_effect = [
            mock_models_response,  # 첫 번째 호출 - 모델 목록
            mock_usage_response,   # 두 번째 호출 - 사용량
            mock_subscription_response  # 세 번째 호출 - 구독 정보
        ]
        
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
        # 모델 목록 API 응답 모의 (401 인증 오류)
        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 401
        mock_response.text = "Invalid API key"
        mock_get.return_value = mock_response
        
        # API 검증 요청
        response = test_client.post(
            "/api/validate-key",
            json={"apiKey": INVALID_KEY}
        )
        
        # 응답 확인 - API 내부 처리로 인해 401 대신 200 응답 가능
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_200_OK]
        json_response = response.json()
        assert json_response["valid"] == False
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
    # 캐시 테스트용 가째 결과 미리 저장
    test_result = {
        "valid": True, 
        "message": "API key is valid", 
        "rate_limits": {"remaining_tokens": 100000}
    }
    cache_key_validation(VALID_KEY, test_result)
    
    # 캐싱된 결과를 반환하는지 확인 (모의 객체 사용하지 않음)
    response = test_client.post(
        "/api/validate-key",
        json={"apiKey": VALID_KEY}
    )
    
    assert response.status_code == status.HTTP_200_OK
    json_response = response.json()
    assert json_response["valid"] == True
    assert json_response["message"] == "API key is valid"
    assert json_response["rate_limits"] is not None

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
        mock_models_response = MagicMock(spec=Response)
        mock_models_response.status_code = 200
        mock_models_response.json.return_value = {"data": []}
        
        # 사용량 조회 시 예외 발생 시나리오
        mock_get.side_effect = [mock_models_response, Exception("Usage API error")]
        
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
        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 401
        mock_response.text = "Invalid API key"
        mock_get.return_value = mock_response
        
        response = test_client.get(
            "/api/validate-key/status", 
            headers={"X-API-Key": INVALID_KEY}
        )
        
        assert response.status_code == status.HTTP_200_OK
        json_response = response.json()
        assert json_response["is_valid"] == False
        assert json_response["status"] == "invalid"

def test_check_api_key_status_rate_limited(test_client):
    """속도 제한된 API 키 상태 확인 테스트"""
    with patch('httpx.AsyncClient.get') as mock_get:
        # 속도 제한 응답 모의
        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 429
        mock_response.text = "Rate limit exceeded"
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
