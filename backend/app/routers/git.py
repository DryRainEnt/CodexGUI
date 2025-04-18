from fastapi import APIRouter, HTTPException, Depends, Path, Query, status
from pydantic import BaseModel
from typing import List, Optional
import os
from dulwich import porcelain
from dulwich.repo import Repo
from app.routers.projects import projects_db

router = APIRouter(
    prefix="/api/git",
    tags=["git"],
)

class GitCommitRequest(BaseModel):
    message: str
    files: List[str]

class GitBranchRequest(BaseModel):
    name: str

@router.get("/{project_id}/status")
async def get_git_status(project_id: str = Path(..., title="The ID of the project")):
    """
    Get git status of a project
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Check if project path is a git repository
    if not os.path.exists(os.path.join(project.path, ".git")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not a git repository"
        )
    
    try:
        # Get git status
        repo = Repo(project.path)
        status = porcelain.status(repo)
        
        return {
            "branch": repo.head().decode('utf-8').split('/')[-1],
            "staged": [f.decode('utf-8') for f in status.staged],
            "unstaged": [f.decode('utf-8') for f in status.unstaged],
            "untracked": [f.decode('utf-8') for f in status.untracked],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get git status: {str(e)}"
        )

@router.post("/{project_id}/commit")
async def commit_changes(
    commit_request: GitCommitRequest,
    project_id: str = Path(..., title="The ID of the project")
):
    """
    Commit changes to git repository
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Check if project path is a git repository
    if not os.path.exists(os.path.join(project.path, ".git")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not a git repository"
        )
    
    try:
        # Add files to staging
        repo = Repo(project.path)
        for file_path in commit_request.files:
            full_path = os.path.join(project.path, file_path)
            if not os.path.exists(full_path):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File not found: {file_path}"
                )
            porcelain.add(repo, file_path)
        
        # Commit changes
        commit_id = porcelain.commit(repo, commit_request.message.encode('utf-8'))
        
        return {
            "commit_id": commit_id.decode('utf-8'),
            "message": commit_request.message,
            "files": commit_request.files
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to commit changes: {str(e)}"
        )

@router.post("/{project_id}/branch")
async def create_branch(
    branch_request: GitBranchRequest,
    project_id: str = Path(..., title="The ID of the project")
):
    """
    Create a new branch
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Check if project path is a git repository
    if not os.path.exists(os.path.join(project.path, ".git")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not a git repository"
        )
    
    try:
        # Create branch
        repo = Repo(project.path)
        porcelain.branch_create(repo, branch_request.name)
        
        return {
            "branch": branch_request.name
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create branch: {str(e)}"
        )

@router.get("/{project_id}/branches")
async def list_branches(project_id: str = Path(..., title="The ID of the project")):
    """
    List all branches in the repository
    """
    # Check if project exists
    if project_id not in projects_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = projects_db[project_id]
    
    # Check if project path is a git repository
    if not os.path.exists(os.path.join(project.path, ".git")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not a git repository"
        )
    
    try:
        # List branches
        repo = Repo(project.path)
        refs = repo.get_refs()
        
        branches = []
        current_branch = repo.head().decode('utf-8').split('/')[-1]
        
        for ref, _ in refs.items():
            ref_str = ref.decode('utf-8')
            if ref_str.startswith('refs/heads/'):
                branch_name = ref_str.replace('refs/heads/', '')
                branches.append({
                    "name": branch_name,
                    "current": branch_name == current_branch
                })
        
        return branches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list branches: {str(e)}"
        )
