from fastapi import APIRouter, HTTPException, Depends, Path, Query, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime, date
import aiofiles
from app.core.config import settings
from app.routers.projects import projects_db

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
)

class ChatMessage(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

# Helper function to get log file path for a project
def get_log_file_path(project_id: str, log_date: date = None):
    if log_date is None:
        log_date = date.today()
        
    log_dir = os.path.join(settings.LOGS_DIR, project_id)
    os.makedirs(log_dir, exist_ok=True)
    
    return os.path.join(log_dir, f"{log_date.strftime('%Y%m%d')}.ndjson")

@router.get("/{project_id}/logs")
async def get_chat_logs(
    project_id: str = Path(..., title="The ID of the project"),
    page: int = Query(1, ge=1, title="Page number"),
    limit: int = Query(10, ge=1, le=100, title="Items per page")
):
    """
    Get chat logs for a project
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get log file path
    log_file = get_log_file_path(project_id)
    
    if not os.path.exists(log_file):
        return {
            "total": 0,
            "page": page,
            "limit": limit,
            "logs": []
        }
    
    try:
        logs = []
        
        # Read log file
        async with aiofiles.open(log_file, mode='r') as file:
            content = await file.read()
            
            # Parse log lines
            lines = [line for line in content.split('\n') if line]
            total = len(lines)
            
            # Calculate pagination
            start = (page - 1) * limit
            end = start + limit
            
            # Get paginated logs
            for i in range(start, min(end, total)):
                try:
                    log = json.loads(lines[i])
                    logs.append(log)
                except json.JSONDecodeError:
                    continue
            
            return {
                "total": total,
                "page": page,
                "limit": limit,
                "logs": logs
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read chat logs: {str(e)}"
        )

@router.post("/{project_id}/send")
async def send_chat_message(
    chat_message: ChatMessage,
    project_id: str = Path(..., title="The ID of the project")
):
    """
    Send a chat message and get a response
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        # Generate a unique ID for the message
        message_id = f"msg_{datetime.now().strftime('%Y%m%d%H%M%S')}_{project_id}"
        timestamp = datetime.now()
        
        # Create user message log
        user_log = {
            "id": message_id,
            "role": "user",
            "content": chat_message.message,
            "timestamp": timestamp.isoformat()
        }
        
        # Log user message
        await log_chat_message(project_id, user_log)
        
        # Placeholder for AI response - in a real app, this would call an LLM
        response_content = f"This is a mock response to: {chat_message.message}"
        
        # Create assistant response log
        assistant_log = {
            "id": f"resp_{datetime.now().strftime('%Y%m%d%H%M%S')}_{project_id}",
            "role": "assistant",
            "content": response_content,
            "timestamp": datetime.now().isoformat()
        }
        
        # Log assistant message
        await log_chat_message(project_id, assistant_log)
        
        return {
            "user_message": user_log,
            "response": assistant_log
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send chat message: {str(e)}"
        )

async def log_chat_message(project_id: str, message: Dict[str, Any]):
    """
    Log a chat message to the log file
    """
    log_file = get_log_file_path(project_id)
    
    try:
        # Append message to log file
        async with aiofiles.open(log_file, mode='a') as file:
            await file.write(json.dumps(message) + '\n')
    except Exception as e:
        # Log error but don't stop execution
        print(f"Error logging chat message: {str(e)}")
