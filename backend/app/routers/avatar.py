import os
import base64
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(
    prefix="/api/avatar",
    tags=["avatar"],
    responses={404: {"description": "Not found"}},
)

# Data models
class AvatarBase(BaseModel):
    name: str
    persona: str
    is_enabled: bool = True

class AvatarCreate(AvatarBase):
    image: Optional[str] = None

class AvatarUpdate(BaseModel):
    name: Optional[str] = None
    persona: Optional[str] = None
    image: Optional[str] = None
    is_enabled: Optional[bool] = None

class Avatar(AvatarBase):
    id: str
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# In-memory storage for demo purposes
# In production, this would be stored in a database
AVATARS = {}

# Default robot avatar in base64 (svg of a robot)
DEFAULT_AVATAR = """
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><path d="M12 4v4h4"/><path d="M9.7 13 h4.6"/><path d="M8 2h2a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V4a2 2 0 0 1 2-2h2"/><path d="M8 2h2a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V4a2 2 0 0 1 2-2h2"/><path d="M3 7a3 3 0 0 0-3 3v2l4 4h14.5a4.5 4.5 0 01-4.5 4.5H15l3.5 3.5"/><path d="M13 22H7v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h0M8 18h.01M16 18h.01"/></svg>
"""

def get_default_avatar(user_id: str) -> Avatar:
    """Create a default avatar for new users"""
    now = datetime.now()
    return Avatar(
        id=f"avatar_{user_id}",
        name="Codex Assistant",
        persona="I am a helpful AI coding assistant that can help you with your development tasks.",
        image=f"data:image/svg+xml;base64,{base64.b64encode(DEFAULT_AVATAR.strip().encode()).decode()}",
        created_at=now,
        updated_at=now
    )

@router.get("", response_model=Avatar)
async def get_avatar(current_user: User = Depends(get_current_user)):
    """Get the current user's avatar"""
    user_id = current_user.id
    
    # Check if user has an avatar, if not create default
    if user_id not in AVATARS:
        AVATARS[user_id] = get_default_avatar(user_id)
    
    return AVATARS[user_id]

@router.post("", response_model=Avatar)
async def create_avatar(avatar: AvatarCreate, current_user: User = Depends(get_current_user)):
    """Create a new avatar"""
    user_id = current_user.id
    
    # Create new avatar with the provided data
    now = datetime.now()
    new_avatar = Avatar(
        id=f"avatar_{user_id}",
        name=avatar.name,
        persona=avatar.persona,
        image=avatar.image,
        is_enabled=avatar.is_enabled,
        created_at=now,
        updated_at=now
    )
    
    AVATARS[user_id] = new_avatar
    return new_avatar

@router.put("/{avatar_id}", response_model=Avatar)
async def update_avatar(
    avatar_id: str, 
    avatar_update: AvatarUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an existing avatar"""
    user_id = current_user.id
    
    # Check if avatar exists
    if user_id not in AVATARS or AVATARS[user_id].id != avatar_id:
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    # Get existing avatar
    existing_avatar = AVATARS[user_id]
    
    # Update fields
    update_data = avatar_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(existing_avatar, key, value)
    
    # Update the timestamp
    existing_avatar.updated_at = datetime.now()
    
    return existing_avatar

@router.post("/upload", response_model=Avatar)
async def upload_avatar_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an avatar image"""
    user_id = current_user.id
    
    # Check if avatar exists, if not create default
    if user_id not in AVATARS:
        AVATARS[user_id] = get_default_avatar(user_id)
    
    # Read the file
    contents = await file.read()
    
    # Determine file type and encode as base64
    file_type = file.content_type
    if not file_type:
        # Try to guess from filename
        if file.filename.lower().endswith(".png"):
            file_type = "image/png"
        elif file.filename.lower().endswith((".jpg", ".jpeg")):
            file_type = "image/jpeg"
        elif file.filename.lower().endswith(".svg"):
            file_type = "image/svg+xml"
        else:
            file_type = "application/octet-stream"
    
    # Encode as base64
    image_b64 = base64.b64encode(contents).decode()
    image_data_uri = f"data:{file_type};base64,{image_b64}"
    
    # Update avatar image
    AVATARS[user_id].image = image_data_uri
    AVATARS[user_id].updated_at = datetime.now()
    
    return AVATARS[user_id]
