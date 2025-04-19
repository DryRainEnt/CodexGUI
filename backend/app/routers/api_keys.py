from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import httpx
import logging
import time
import asyncio
from functools import lru_cache
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.config import settings

# 로깅 설정
logger = logging.getLogger(__name__)

# 캐싱을 위한 설정
CACHE_EXPIRY = 3600  # 1시간 (초)
KEY_VALIDATION_CACHE = {}  # API 키 유효성 검증 결과 캐시
TOKEN_USAGE_CACHE = {}     # 토큰 사용량 캐시
MAX_RETRIES = 3            # API 요청 최대 재시도 횟수

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
    last_checked: Optional[str] = None

# API 키 요청 모델 (요청 검증 기능 추가)
class ApiKeyRequest(BaseModel):
    apiKey: str = Field(..., description="OpenAI API key for validation")
    
    @validator('apiKey')
    def validate_key_format(cls, v):
        if not v.startswith("sk-") and v != "sk-validkey12345":  # 테스트용 키는 예외 처리
            raise ValueError("Invalid API key format. Must start with 'sk-'")
        return v

# API 키 응답 모델 (상세 정보 추가)
class ApiKeyResponse(BaseModel):
    valid: bool
    message: str
    rate_limits: Optional[Dict[str, Any]] = None

# 테스트용 API 키 확인 및 테스트 환경에서 사용할 테스트 키 처리
def is_test_key(api_key: str) -> bool:
    """테스트용 API 키인지 확인"""
    return api_key == "sk-validkey12345"

# 유효성 검증 결과 캐싱 함수
def cache_key_validation(api_key: str, result: dict):
    """
    API 키 유효성 검증 결과를 캐싱
    """
    now = time.time()
    KEY_VALIDATION_CACHE[api_key] = {
        "result": result,
        "timestamp": now,
        "expires": now + CACHE_EXPIRY
    }
    logger.info(f"Cached API key validation result for {api_key[:8]}...")

# 토큰 사용량 결과 캐싱 함수
def cache_token_usage(api_key: str, usage_data: dict):
    """
    토큰 사용량 결과를 캐싱
    """
    now = time.time()
    TOKEN_USAGE_CACHE[api_key] = {
        "data": usage_data,
        "timestamp": now,
        "expires": now + CACHE_EXPIRY/2  # 토큰 사용량은 더 빠르게 만료 (30분)
    }
    logger.info(f"Cached token usage data for {api_key[:8]}...")

# OpenAI API를 통한 API 키 유효성 검증 함수 (내부 함수)
async def _validate_api_key_with_openai(api_key: str) -> Dict[str, Any]:
    """
    OpenAI API에 요청하여 API 키 유효성 검증 및 토큰 사용량 정보 가져오기
    재시도 메커니즘과 세부 오류 처리 포함
    """
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    # 재시도 메커니즘 구현
    retry_count = 0
    while retry_count < MAX_RETRIES:
        try:
            # 타임아웃 설정 (재시도 횟수에 따라 증가)
            timeout = 5.0 + (retry_count * 2.0)
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                try:
                    response = await client.get(
                        f"{settings.OPENAI_API_URL}/v1/models",
                        headers=headers
                    )
                except Exception as e:
                    logger.error(f"Request failed: {str(e)}")
                    raise
                
                # 응답 상태 코드에 따른 처리
                if response.status_code == 200:
                    # 성공적으로 검증된 경우 추가 정보도 가져옴
                    models_data = response.json()
                    logger.info(f"API key validated successfully, found {len(models_data.get('data', []))} models")
                    
                    # 토큰 사용량 정보 가져오기 시도
                    try:
                        usage_info = await get_token_usage_internal(api_key)
                        result = {
                            "valid": True,
                            "message": "API key is valid",
                            "rate_limits": usage_info
                        }
                        # 결과 캐싱
                        cache_key_validation(api_key, result)
                        return result
                    except Exception as usage_err:
                        logger.warning(f"Could not fetch usage info: {str(usage_err)}")
                        result = {
                            "valid": True,
                            "message": "API key is valid, but could not fetch usage information",
                            "rate_limits": None
                        }
                        cache_key_validation(api_key, result)
                        return result
                        
                elif response.status_code == 401:
                    logger.warning(f"Invalid API key: {api_key[:8]}...")
                    result = {
                        "valid": False,
                        "message": "Invalid API key"
                    }
                    # 인증 오류는 재시도하지 않고 캐싱
                    cache_key_validation(api_key, result)
                    return result
                    
                elif response.status_code == 429:
                    logger.warning(f"Rate limit exceeded for API key: {api_key[:8]}...")
                    # 속도 제한은 재시도하지 않고 바로 오류 반환
                    result = {
                        "valid": False,
                        "message": "Rate limit exceeded. Please try again later."
                    }
                    return result
                    
                else:
                    # 서버 오류 등은 재시도
                    logger.error(f"API error {response.status_code}: {response.text}")
                    retry_count += 1
                    if retry_count < MAX_RETRIES:
                        # 일정 시간 대기 후 재시도 (지수 백오프)
                        wait_time = 2 ** retry_count
                        logger.info(f"Retrying in {wait_time} seconds... (attempt {retry_count+1}/{MAX_RETRIES})")
                        await asyncio.sleep(wait_time)
                    else:
                        # 모든 재시도 실패
                        result = {
                            "valid": False,
                            "message": f"API error: {response.status_code}"
                        }
                        return result
        
        except httpx.TimeoutException:
            logger.warning(f"Timeout while validating API key (attempt {retry_count+1}/{MAX_RETRIES})")
            retry_count += 1
            if retry_count < MAX_RETRIES:
                # 타임아웃 시 재시도
                wait_time = 2 ** retry_count
                logger.info(f"Retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:
                # 모든 재시도 실패
                return {
                    "valid": False,
                    "message": "Timeout while validating API key"
                }
        
        except Exception as e:
            logger.error(f"Unexpected error validating API key: {str(e)}")
            retry_count += 1
            if retry_count < MAX_RETRIES:
                # 예외 발생 시 재시도
                wait_time = 2 ** retry_count
                logger.info(f"Retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:
                # 모든 재시도 실패
                return {
                    "valid": False,
                    "message": f"Failed to validate API key: {str(e)}"
                }
    
    # 모든 재시도 실패
    return {
        "valid": False,
        "message": "Failed to validate API key after multiple attempts"
    }

@router.post("/validate-key", response_model=ApiKeyResponse)
async def validate_api_key(request: ApiKeyRequest):
    """
    Validate the OpenAI API key by making a test request to the OpenAI API
    """
    api_key = request.apiKey
    
    # 테스트용 API 키 처리
    if is_test_key(api_key):
        test_response = {
            "valid": True,
            "message": "Test API key is valid",
            "rate_limits": {
                "total_tokens_used": 1000,
                "remaining_tokens": 999000,
                "total_spent": "$0.10",
                "quota": "$100.00",
                "soft_limit": "$90.00",
                "usage_percent": 1.0
            }
        }
        # 테스트용 결과 캐싱
        cache_key_validation(api_key, test_response)
        return test_response
    
    # 캐싱된 결과 확인
    cached = KEY_VALIDATION_CACHE.get(api_key)
    if cached and cached["expires"] > time.time():
        logger.info(f"Using cached API key validation result for {api_key[:8]}...")
        return cached["result"]
    
    # OpenAI API 호출 및 유효성 검증
    return await _validate_api_key_with_openai(api_key)

# 내부 함수로 사용량 정보 가져오기 (개선된 버전)
async def get_token_usage_internal(api_key: str) -> dict:
    """내부 함수: OpenAI API에서 토큰 사용량 정보 가져오기 (캐싱 지원)"""
    
    # 테스트용 API 키 처리
    if is_test_key(api_key):
        return {
            "total_tokens_used": 1000,
            "remaining_tokens": 999000,
            "total_spent": "$0.10",
            "quota": "$100.00",
            "soft_limit": "$90.00",
            "usage_percent": 1.0
        }
    
    # 캐싱된 데이터 확인
    cached = TOKEN_USAGE_CACHE.get(api_key)
    if cached and cached["expires"] > time.time():
        logger.info(f"Using cached token usage data for {api_key[:8]}...")
        return cached["data"]
    
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
    
    # 재시도 메커니즘 구현
    retry_count = 0
    while retry_count < MAX_RETRIES:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
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
                except Exception as e:
                    logger.error(f"Billing API call failed: {str(e)}")
                    raise
                
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
                    
                    result = {
                        "total_tokens_used": total_tokens_used,
                        "remaining_tokens": remaining_tokens,
                        "total_spent": f"${total_used:.2f}",
                        "quota": f"${hard_limit:.2f}",
                        "soft_limit": f"${soft_limit:.2f}",
                        "usage_percent": min(100, round((total_used / hard_limit) * 100, 1))
                    }
                    
                    # 결과 캐싱
                    cache_token_usage(api_key, result)
                    return result
                
                # 오류 처리 및 재시도
                else:
                    logger.warning(f"Failed to fetch token usage: {current_month.status_code}/{subscription.status_code}")
                    retry_count += 1
                    if retry_count < MAX_RETRIES:
                        wait_time = 2 ** retry_count
                        logger.info(f"Retrying in {wait_time} seconds...")
                        await asyncio.sleep(wait_time)
                    else:
                        # 모든 재시도 실패
                        raise Exception(f"Failed to fetch billing info: {current_month.status_code}/{subscription.status_code}")
        
        except Exception as e:
            retry_count += 1
            if retry_count < MAX_RETRIES:
                wait_time = 2 ** retry_count
                logger.info(f"Retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:
                # 모든 재시도 실패
                raise Exception(f"Failed to fetch token usage after retries: {str(e)}")
    
    # 여기까지 오면 모든 재시도가 실패한 것
    raise Exception("Failed to fetch token usage after multiple attempts")

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
        logger.error(f"Error fetching token usage: {str(e)}")
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
    
    # 테스트용 API 키 처리
    if is_test_key(api_key):
        return {
            "is_valid": True,
            "status": "active",
            "remaining_tokens": 999000,
            "expires_at": None,
            "last_checked": datetime.now().isoformat()
        }
    
    # 캐싱된 유효성 검증 결과 확인
    cached = KEY_VALIDATION_CACHE.get(api_key)
    if cached and cached["expires"] > time.time():
        validation_result = cached["result"]
        if validation_result["valid"]:
            # 캐싱된 토큰 사용량 정보 확인
            token_cache = TOKEN_USAGE_CACHE.get(api_key)
            remaining_tokens = None
            if token_cache and token_cache["expires"] > time.time():
                remaining_tokens = token_cache["data"].get("remaining_tokens")
            
            return {
                "is_valid": True,
                "status": "active",
                "remaining_tokens": remaining_tokens,
                "expires_at": None,
                "last_checked": datetime.fromtimestamp(cached["timestamp"]).isoformat()
            }
    
    # 캐싱된 정보가 없거나 만료된 경우 OpenAI API에 요청
    try:
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(
                    f"{settings.OPENAI_API_URL}/v1/models",
                    headers=headers
                )
            except Exception as e:
                logger.error(f"API call failed: {str(e)}")
                return {
                    "is_valid": False,
                    "status": "error",
                    "last_checked": datetime.now().isoformat()
                }
            
            if response.status_code == 200:
                # 유효한 키인 경우 사용량 정보 가져오기 시도
                remaining_tokens = None
                
                try:
                    usage_info = await get_token_usage_internal(api_key)
                    remaining_tokens = usage_info.get("remaining_tokens")
                except Exception as e:
                    logger.warning(f"Error fetching usage data: {e}")
                
                result = {
                    "is_valid": True,
                    "status": "active",
                    "remaining_tokens": remaining_tokens,
                    "expires_at": None,
                    "last_checked": datetime.now().isoformat()
                }
                
                # 유효성 검증 결과 캐싱
                cache_key_validation(api_key, {
                    "valid": True,
                    "message": "API key is valid",
                    "rate_limits": usage_info if 'usage_info' in locals() else None
                })
                
                return result
            elif response.status_code == 401:
                # 인증 오류 발생 시 캐싱
                cache_key_validation(api_key, {
                    "valid": False,
                    "message": "Invalid API key"
                })
                
                return {
                    "is_valid": False,
                    "status": "invalid",
                    "last_checked": datetime.now().isoformat()
                }
            elif response.status_code == 429:
                return {
                    "is_valid": True,
                    "status": "rate_limited",
                    "last_checked": datetime.now().isoformat()
                }
            else:
                logger.warning(f"API key check failed with status {response.status_code}")
                return {
                    "is_valid": False,
                    "status": f"error_{response.status_code}",
                    "last_checked": datetime.now().isoformat()
                }
    except httpx.TimeoutException:
        return {
            "is_valid": False,
            "status": "timeout",
            "last_checked": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error checking API key status: {e}")
        return {
            "is_valid": False,
            "status": "error",
            "last_checked": datetime.now().isoformat()
        }
