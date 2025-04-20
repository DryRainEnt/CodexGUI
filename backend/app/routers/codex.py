import os
import asyncio
import json
import tempfile
import subprocess
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel

from app.core.config import settings
from app.core.auth import get_current_user
from app.models.user import User
from app.services.projects import get_project_by_id
from app.services.git import get_git_changes

router = APIRouter(
    prefix="/api/codex",
    tags=["codex"],
    responses={404: {"description": "Not found"}},
)

class CodexCommandRequest(BaseModel):
    prompt: str
    approval_mode: str = "suggest"  # suggest, auto-edit, full-auto
    project_path: Optional[str] = None

class CodexFileChange(BaseModel):
    id: str
    filename: str
    status: str
    diff: Optional[str] = None

class CodexExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    changes: List[CodexFileChange]

class CodexApproveChangesRequest(BaseModel):
    change_ids: List[str]

class SafeCommandsResponse(BaseModel):
    commands: List[str]

class SafeCommandsUpdateRequest(BaseModel):
    commands: List[str]

@router.post("/{project_id}/execute", response_model=CodexExecuteResponse)
async def execute_codex_command(
    project_id: str,
    request: CodexCommandRequest,
    current_user: User = Depends(get_current_user)
):
    """Execute a Codex CLI command"""
    try:
        # Get the project to validate access and get path
        project = await get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Use provided path or project path
        project_path = request.project_path or project.path
        
        # Validate path exists
        if not os.path.isdir(project_path):
            raise HTTPException(status_code=400, detail=f"Project path does not exist: {project_path}")
        
        # Get API key from user settings or environment
        api_key = current_user.settings.get("openai_api_key") or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI API key not found")
        
        # Environment variables for Codex
        env = os.environ.copy()
        env["OPENAI_API_KEY"] = api_key
        
        # Codex command construction
        command = [
            "npx", "@openai/codex", 
            f"--approval-mode={request.approval_mode}",
            "--quiet",
            request.prompt
        ]
        
        # Execute Codex command
        process = await asyncio.create_subprocess_exec(
            *command,
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env
        )
        
        # Get output
        stdout, stderr = await process.communicate()
        
        # Parse Git changes
        changes = await get_git_changes(project_path)
        file_changes = []
        
        for i, change in enumerate(changes):
            # Parse status and filename
            if " " in change:
                status, filename = change.split(" ", 1)
                
                # Get diff if status indicates a modification
                diff = None
                if status in ["M", "A", "D", "R"]:
                    try:
                        diff_process = await asyncio.create_subprocess_exec(
                            "git", "diff", "--staged", "--", filename,
                            cwd=project_path,
                            stdout=asyncio.subprocess.PIPE,
                            stderr=asyncio.subprocess.PIPE
                        )
                        diff_stdout, _ = await diff_process.communicate()
                        diff = diff_stdout.decode()
                    except Exception as e:
                        print(f"Error getting diff: {e}")
                
                file_changes.append(CodexFileChange(
                    id=f"change_{i}",
                    filename=filename,
                    status=status,
                    diff=diff
                ))
        
        return CodexExecuteResponse(
            stdout=stdout.decode(),
            stderr=stderr.decode(),
            exit_code=process.returncode,
            changes=file_changes
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Codex execution error: {str(e)}")

@router.post("/{project_id}/approve-changes")
async def approve_codex_changes(
    project_id: str,
    request: CodexApproveChangesRequest,
    current_user: User = Depends(get_current_user)
):
    """Approve Codex changes and apply them"""
    try:
        # Get the project to validate access and get path
        project = await get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # This endpoint would handle actually applying the changes
        # In a real implementation, it would:
        # 1. Apply the selected changes from the staged area
        # 2. Commit them or keep them staged based on user preference
        
        # For now, just returning success
        return {"status": "changes approved", "change_ids": request.change_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving changes: {str(e)}")

@router.get("/{project_id}/safe-commands", response_model=SafeCommandsResponse)
async def get_project_safe_commands(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get safe commands for a project"""
    try:
        # Get the project to validate access
        project = await get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get safe commands from project settings
        safe_commands = project.settings.get("codex", {}).get("safe_commands", [])
        return {"commands": safe_commands}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting safe commands: {str(e)}")

@router.post("/{project_id}/safe-commands")
async def update_project_safe_commands(
    project_id: str,
    request: SafeCommandsUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update safe commands for a project"""
    try:
        # Get the project to validate access
        project = await get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update project settings with safe commands
        # This requires updating the project model and saving to database
        # Actual implementation depends on your database model
        
        # For now, just returning success
        return {"status": "commands updated", "commands": request.commands}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating safe commands: {str(e)}")

@router.get("/{project_id}/status")
async def check_codex_installation(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check if Codex CLI is installed and working"""
    try:
        # Get the project to validate access
        project = await get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if Codex CLI is installed
        try:
            process = await asyncio.create_subprocess_exec(
                "npx", "@openai/codex", "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                version = stdout.decode().strip()
                return {
                    "installed": True,
                    "version": version,
                    "node_version": os.environ.get("NODE_VERSION", "unknown")
                }
            else:
                return {
                    "installed": False,
                    "error": stderr.decode().strip(),
                    "message": "Codex CLI not found. Please install it with 'npm install -g @openai/codex'"
                }
        except Exception as e:
            return {
                "installed": False,
                "error": str(e),
                "message": "Error checking Codex CLI installation"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking Codex installation: {str(e)}")
