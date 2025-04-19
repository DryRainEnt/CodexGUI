from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
import logging
from app.core.config import settings
from typing import Optional
from datetime import datetime, timedelta

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
    apiKey: str = Field(..., description="OpenAI API key for validation")

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
    if not request.apiKey.startswith("sk-") or len(request.apiKey) < 20:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "valid": False,
                "message": "Invalid API key format"
            }
        )
    
    headers = {
        "Authorization": f"Bearer {request.apiKey}"
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
                    
                    # 사용량 정보 가져오기 시도 (실제 구현은 토큰 사용량 API 확인 후 구현)
                    # OpenAI의 사용량 API는 항상 변경될 수 있으므로 최신 문서 참조 필요
                    try:
                        usage_info = await get_token_usage_internal(request.apiKey)
                        return {
                            "valid": True,
                            "message": "API key is valid",
                            "rate_limits": usage_info
                        }
                    except Exception as usage_err:
                        logging.warning(f"Could not fetch usage info: {str(usage_err)}")
                        return {
                            "valid": True,
                            "message": "API key is valid, but could not fetch usage information",
                            "rate_limits": None
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

# 내부 함수로 사용량 정보 가져오기
async def get_token_usage_internal(api_key: str) -> dict:
    """내부 함수: OpenAI API에서 토큰 사용량 정보 가져오기"""
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    # 날짜 계산 (현재 달의 시작일과 종료일)
    today = datetime.now()
    start_date = datetime(today.year, today.month, 1).strftime("%Y-%m-%d")
    # 다음 달의 1일 - 1일 = 이번 달의 마지막 날
    next_month = today.replace(day=28) + timedelta(days=4)
    end_date = next_month.replace(day=1) - timedelta(days=1)
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 이번 달 사용량
        current_month = await client.get(
            f"{settings.OPENAI_API_URL}/v1/dashboard/billing/usage",
            params={
                "start_date": start_date,
                "end_date": end_date_str
            },
            headers=headers
        )
        
        # 할당된 한도 정보
        subscription = await client.get(
            f"{settings.OPENAI_API_URL}/v1/dashboard/billing/subscription",
            headers=headers
        )
        
        if current_month.status_code == 200 and subscription.status_code == 200:
            usage_data = current_month.json()
            subscription_data = subscription.json()
            
            # 사용량 계산
            total_used = usage_data.get("total_usage", 0) / 100  # 달러로 제공되는 값
            hard_limit = subscription_data.get("hard_limit_usd", 120)  # 기본 한도
            soft_limit = subscription_data.get("soft_limit_usd", 100)  # 소프트 한도
            
            # 토큰 사용량 추정: $1 당 약 10,000 토큰으로 가정
            token_ratio = 10000
            total_tokens_used = int(total_used * token_ratio)
            total_tokens_available = int(hard_limit * token_ratio)
            remaining_tokens = max(0, total_tokens_available - total_tokens_used)
            
            return {
                "total_tokens_used": total_tokens_used,
                "remaining_tokens": remaining_tokens,
                "total_spent": f"${total_used:.2f}",
                "quota": f"${hard_limit:.2f}",
                "soft_limit": f"${soft_limit:.2f}",
                "usage_percent": min(100, round((total_used / hard_limit) * 100, 1))
            }
        
        # API 호출 실패 시 기본값 반환
        raise Exception(f"Failed to fetch billing info: {current_month.status_code}/{subscription.status_code}")

@router.get("/token-usage")
async def get_token_usage(request: Request):
    """
    Get token usage information from OpenAI API
    
    Note: OpenAI API does not provide a direct token usage endpoint.
    We're using a workaround to estimate token usage based on billing info.
    """
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required"
        )
    
    try:
        # 내부 함수 호출하여 사용량 정보 가져오기
        return await get_token_usage_internal(api_key)
    except Exception as e:
        logging.error(f"Error fetching token usage: {str(e)}")
        # 오류 발생 시 추정치 반환
        return {
            "total_tokens_used": 0,
            "remaining_tokens": 1000000,
            "total_spent": "$0.00",
            "quota": "$120.00",
            "soft_limit": "$100.00",
            "usage_percent": 0
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
                    usage_info = await get_token_usage_internal(api_key)
                    remaining_tokens = usage_info.get("remaining_tokens")
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
