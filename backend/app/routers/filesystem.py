from fastapi import APIRouter, HTTPException, Depends, Path, Query, status
from pydantic import BaseModel
from typing import List, Optional
import os
import aiofiles
from datetime import datetime
from app.routers.projects import projects_db

router = APIRouter(
    prefix="/api/fs",
    tags=["filesystem"],
)

class FileContent(BaseModel):
    content: str

class FileWriteRequest(BaseModel):
    path: str
    content: str

@router.get("/{project_id}/list")
async def list_files(
    project_id: str = Path(..., title="The ID of the project"),
    path: str = Query(".", title="The directory path to list")
):
    """
    List files in a directory
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Construct full path
    full_path = os.path.normpath(os.path.join(project.path, path))
    
    # Check if path is within project directory (security check)
    if not full_path.startswith(os.path.normpath(project.path)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Path is outside of project directory"
        )
    
    # Check if path exists
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Path not found"
        )
    
    # Check if path is directory
    if not os.path.isdir(full_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Path is not a directory"
        )
    
    try:
        # List files
        files = []
        for item in os.listdir(full_path):
            item_path = os.path.join(full_path, item)
            item_type = 'file' if os.path.isfile(item_path) else 'directory'
            
            # Get file stats
            stats = os.stat(item_path)
            
            files.append({
                "name": item,
                "path": os.path.join(path, item).replace(os.sep, '/'),
                "type": item_type,
                "size": stats.st_size,
                "modified": datetime.fromtimestamp(stats.st_mtime).isoformat()
            })
        
        return {
            "path": path,
            "files": files
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list files: {str(e)}"
        )

@router.get("/{project_id}/read")
async def read_file(
    project_id: str = Path(..., title="The ID of the project"),
    path: str = Query(..., title="The file path to read")
):
    """
    Read file content
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Construct full path
    full_path = os.path.normpath(os.path.join(project.path, path))
    
    # Check if path is within project directory (security check)
    if not full_path.startswith(os.path.normpath(project.path)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Path is outside of project directory"
        )
    
    # Check if path exists
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check if path is file
    if not os.path.isfile(full_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Path is not a file"
        )
    
    try:
        # Read file
        async with aiofiles.open(full_path, mode='r') as file:
            content = await file.read()
            
            return {
                "path": path,
                "content": content
            }
    except UnicodeDecodeError:
        # File is binary
        return {
            "path": path,
            "content": "[Binary file]",
            "is_binary": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )

@router.post("/{project_id}/write")
async def write_file(
    file_write: FileWriteRequest,
    project_id: str = Path(..., title="The ID of the project")
):
    """
    Write content to a file
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Construct full path
    full_path = os.path.normpath(os.path.join(project.path, file_write.path))
    
    # Check if path is within project directory (security check)
    if not full_path.startswith(os.path.normpath(project.path)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Path is outside of project directory"
        )
    
    # Create parent directories if they don't exist
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    try:
        # Write file
        async with aiofiles.open(full_path, mode='w') as file:
            await file.write(file_write.content)
            
            return {
                "path": file_write.path,
                "success": True
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file: {str(e)}"
        )

@router.delete("/{project_id}/delete")
async def delete_file(
    project_id: str = Path(..., title="The ID of the project"),
    path: str = Query(..., title="The file path to delete")
):
    """
    Delete a file or directory
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Construct full path
    full_path = os.path.normpath(os.path.join(project.path, path))
    
    # Check if path is within project directory (security check)
    if not full_path.startswith(os.path.normpath(project.path)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Path is outside of project directory"
        )
    
    # Check if path exists
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Path not found"
        )
    
    try:
        # Delete file or directory
        if os.path.isfile(full_path):
            os.remove(full_path)
        else:
            os.rmdir(full_path)  # Only removes empty directories
            
        return {
            "path": path,
            "success": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete path: {str(e)}"
        )
