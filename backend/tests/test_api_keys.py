import pytest
from unittest.mock import patch
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
        mock_response = type('Response', (), {'status_code': 200, 'json': lambda: {'data': []}})
        mock_get.return_value = mock_response
        
        response = test_client.post(
            "/api/validate-key",
            json={"api_key": mock_valid_api_key}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"valid": True, "message": "API key is valid"}

@pytest.mark.asyncio
async def test_validate_invalid_api_key(test_client):
    """
    Test validating an invalid API key
    """
    with patch('httpx.AsyncClient.get') as mock_get:
        # Mock unsuccessful API response
        mock_response = type('Response', (), {'status_code': 401})
        mock_get.return_value = mock_response
        
        response = test_client.post(
            "/api/validate-key",
            json={"api_key": "invalid-key"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid API key" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_token_usage(test_client):
    """
    Test getting token usage information
    """
    response = test_client.get("/api/token-usage")
    
    assert response.status_code == status.HTTP_200_OK
    assert "total_tokens_used" in response.json()
    assert "remaining_tokens" in response.json()
    assert "quota" in response.json()
