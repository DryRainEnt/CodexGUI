from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
import logging
from app.core.config import settings
from typing import Optional

router = APIRouter(
    prefix="/api",
    tags=["api_keys"],
)

# API 키 상태를 위한 응답 모델
class ApiKeyStatusResponse(BaseModel):
    is_valid: bool
    status: str
    remaining_tokens: Optional[int] = None
    expires_at: Optional[str] = None

class ApiKeyRequest(BaseModel):
    api_key: str = Field(..., description="OpenAI API key for validation")

class ApiKeyResponse(BaseModel):
    valid: bool
    message: str
    rate_limits: Optional[dict] = None

@router.post("/validate-key", response_model=ApiKeyResponse)
async def validate_api_key(request: ApiKeyRequest):
    """
    Validate the OpenAI API key by making a test request to the OpenAI API
    """
    # API 키 구조 간단 검증 (기본적인 형식 검사)
    if not request.api_key.startswith("sk-") or len(request.api_key) < 20:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "valid": False,
                "message": "Invalid API key format"
            }
        )
    
    headers = {
        "Authorization": f"Bearer {request.api_key}"
    }
    
    try:
        # OpenAI API에 요청하여 키 유효성 검증
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.OPENAI_API_URL}/v1/models",
                headers=headers
            )
            
            if response.status_code == 200:
                # 성공적으로 검증된 경우 추가 정보도 가져옴
                try:
                    models_data = response.json()
                    logging.info(f"API key validated successfully, found {len(models_data.get('data', []))} models")
                    
                    # 사용량 정보 가져오기 (이 부분은 기술적으로 가능한지 확인 필요)
                    limits_response = await client.get(
                        f"{settings.OPENAI_API_URL}/v1/usage",
                        headers=headers
                    )
                    
                    rate_limits = None
                    if limits_response.status_code == 200:
                        rate_limits = limits_response.json()
                    
                    return {
                        "valid": True, 
                        "message": "API key is valid",
                        "rate_limits": rate_limits
                    }
                    
                except Exception as e:
                    logging.warning(f"Error parsing API response: {e}")
                    return {"valid": True, "message": "API key is valid"}
            else:
                # 에러 추가 정보 로깅
                error_body = response.text
                logging.warning(f"API key validation failed: {response.status_code}, {error_body}")
                
                if response.status_code == 401:
                    return JSONResponse(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        content={
                            "valid": False,
                            "message": "Invalid API key"
                        }
                    )
                elif response.status_code == 429:
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={
                            "valid": False,
                            "message": "Rate limit exceeded"
                        }
                    )
                else:
                    return JSONResponse(
                        status_code=response.status_code,
                        content={
                            "valid": False,
                            "message": f"API error: {response.status_code}"
                        }
                    )
    except httpx.TimeoutException:
        logging.error("Timeout while validating API key")
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "valid": False,
                "message": "Timeout while validating API key"
            }
        )
    except Exception as e:
        logging.error(f"Failed to validate API key: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "valid": False,
                "message": f"Failed to validate API key: {str(e)}"
            }
        )

@router.get("/token-usage")
async def get_token_usage(request: Request):
    """
    Get token usage information from OpenAI API
    """
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required"
        )
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        # OpenAI API에서 토큰 사용량 정보 가져오기
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.OPENAI_API_URL}/v1/usage",  # 실제 API 엔드포인트는 확인 필요
                headers=headers
            )
            
            if response.status_code == 200:
                usage_data = response.json()
                return {
                    "total_tokens_used": usage_data.get("total_usage", 0),
                    "remaining_tokens": usage_data.get("available_grants", 1000000),  # 진짜 엔드포인트에 맞게 수정 필요
                    "quota": usage_data.get("hard_limit_usd", 1000000),
                }
            else:
                # 에러 발생 시 기본값 반환
                logging.warning(f"Failed to fetch token usage: {response.status_code}")
                return {
                    "total_tokens_used": 0,
                    "remaining_tokens": 1000000,  # Placeholder
                    "quota": 1000000,  # Placeholder
                }
    except Exception as e:
        logging.error(f"Error fetching token usage: {str(e)}")
        # 오류 발생 시 기본값 반환
        return {
            "total_tokens_used": 0,
            "remaining_tokens": 1000000,  # Placeholder
            "quota": 1000000,  # Placeholder
        }

@router.get("/validate-key/status", response_model=ApiKeyStatusResponse)
async def check_api_key_status(request: Request):
    """
    Check the status of the API key provided in headers
    """
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "is_valid": False,
                "status": "missing_key"
            }
        )
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        # OpenAI API에 경량 요청하여 키 유효성 검증
        async with httpx.AsyncClient(timeout=5.0) as client:
            # models 엔드포인트로 간단한 유효성 검사
            response = await client.get(
                f"{settings.OPENAI_API_URL}/v1/models",
                headers=headers
            )
            
            if response.status_code == 200:
                # 유효한 키인 경우 사용량 정보 가져오기 시도
                remaining_tokens = None
                
                try:
                    usage_response = await client.get(
                        f"{settings.OPENAI_API_URL}/v1/usage",
                        headers=headers
                    )
                    
                    if usage_response.status_code == 200:
                        usage_data = usage_response.json()
                        remaining_tokens = usage_data.get("available_grants", None)
                except Exception as e:
                    logging.warning(f"Error fetching usage data: {e}")
                
                return {
                    "is_valid": True,
                    "status": "active",
                    "remaining_tokens": remaining_tokens,
                    "expires_at": None  # OpenAI API 키 만료시간은 현재 API로 제공되지 않음
                }
            elif response.status_code == 401:
                return {
                    "is_valid": False,
                    "status": "invalid"
                }
            elif response.status_code == 429:
                return {
                    "is_valid": True,
                    "status": "rate_limited"
                }
            else:
                logging.warning(f"API key check failed with status {response.status_code}")
                return {
                    "is_valid": False,
                    "status": f"error_{response.status_code}"
                }
    except httpx.TimeoutException:
        return {
            "is_valid": False,
            "status": "timeout"
        }
    except Exception as e:
        logging.error(f"Error checking API key status: {e}")
        return {
            "is_valid": False,
            "status": "error"
        }
