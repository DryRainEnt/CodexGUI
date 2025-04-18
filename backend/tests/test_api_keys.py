import pytest
from unittest.mock import patch, MagicMock
from fastapi import status
from httpx import AsyncClient

from app.routers.api_keys import ApiKeyRequest

@pytest.mark.asyncio
async def test_validate_valid_api_key(test_client, mock_valid_api_key):
    """
    Test validating a valid API key
    """
    with patch('httpx.AsyncClient.get') as mock_get:
        # Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'data': []}
        mock_get.return_value = mock_response
        
        response = test_client.post(
            "/api/validate-key",
            json={"api_key": mock_valid_api_key}
        )
        
        assert response.status_code == status.HTTP_200_OK
        json_response = response.json()
        assert json_response["valid"] == True
        assert json_response["message"] == "API key is valid"
        # 새로운 rate_limits 필드가 응답에 포함됨을 확인
        assert "rate_limits" in json_response

@pytest.mark.asyncio
async def test_validate_invalid_api_key(test_client):
    """
    Test validating an invalid API key
    """
    with patch('httpx.AsyncClient.get') as mock_get:
        # Mock unsuccessful API response
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response
        
        response = test_client.post(
            "/api/validate-key",
            json={"api_key": "invalid-key"}
        )
        
        # 새로운 API는 형식 검증을 먼저 수행하므로 400 상태 코드 반환
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        json_response = response.json()
        assert json_response["valid"] == False

@pytest.mark.asyncio
async def test_get_token_usage(test_client, mock_valid_api_key):
    """
    Test getting token usage information
    """
    # 헤더에 API 키 추가
    response = test_client.get(
        "/api/token-usage", 
        headers={"X-API-Key": mock_valid_api_key}
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert "total_tokens_used" in response.json()
    assert "remaining_tokens" in response.json()
    assert "quota" in response.json()
