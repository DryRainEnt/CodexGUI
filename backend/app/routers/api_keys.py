from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter(
    prefix="/api",
    tags=["api_keys"],
)

class ApiKeyRequest(BaseModel):
    api_key: str

@router.post("/validate-key")
async def validate_api_key(request: ApiKeyRequest):
    """
    Validate the OpenAI API key by making a test request
    """
    headers = {
        "Authorization": f"Bearer {request.api_key}"
    }
    
    try:
        # Make a minimal request to the OpenAI API to verify the key
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.OPENAI_API_URL}/v1/models",
                headers=headers
            )
            
            if response.status_code == 200:
                return {"valid": True, "message": "API key is valid"}
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key"
                )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate API key: {str(e)}"
        )

@router.get("/token-usage")
async def get_token_usage():
    """
    Get token usage information (placeholder for now)
    """
    # In a real implementation, this would query the OpenAI API for usage
    return {
        "total_tokens_used": 0,
        "remaining_tokens": 1000000,  # Placeholder
        "quota": 1000000,  # Placeholder
    }
