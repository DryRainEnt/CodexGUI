from fastapi import APIRouter, HTTPException, Depends, status, Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
from datetime import datetime

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"],
)

# Project models
class ProjectCreate(BaseModel):
    name: str
    path: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_favorite: Optional[bool] = None

class Project(BaseModel):
    id: str
    name: str
    path: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_favorite: bool = False

# Temporary in-memory storage (would be replaced with database)
projects_db = {}

@router.get("", response_model=List[Project])
async def get_projects():
    """
    Get list of all projects
    """
    return list(projects_db.values())

@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate):
    """
    Create a new project
    """
    # Check if path exists
    if not os.path.exists(project.path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project path does not exist"
        )
    
    # Generate project ID
    project_id = str(uuid.uuid4())
    
    # Create project
    now = datetime.now()
    new_project = Project(
        id=project_id,
        name=project.name,
        path=project.path,
        description=project.description,
        created_at=now,
        updated_at=now,
        is_favorite=False
    )
    
    # Save to database
    projects_db[project_id] = new_project
    
    return new_project

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str = Path(..., title="The ID of the project to get")):
    """
    Get a specific project by ID
    """
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return projects_db[project_id]

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_update: ProjectUpdate,
    project_id: str = Path(..., title="The ID of the project to update")
):
    """
    Update a project
    """
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Update fields
    if project_update.name is not None:
        project.name = project_update.name
    if project_update.description is not None:
        project.description = project_update.description
    if project_update.is_favorite is not None:
        project.is_favorite = project_update.is_favorite
    
    # Update timestamp
    project.updated_at = datetime.now()
    
    # Save back to database
    projects_db[project_id] = project
    
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str = Path(..., title="The ID of the project to delete")):
    """
    Delete a project
    """
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Delete from database
    del projects_db[project_id]
