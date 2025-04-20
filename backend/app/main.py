from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from app.routers import api_keys, projects, git, filesystem, chat, codex, avatar
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title="CodexGUI API",
    description="Backend API for CodexGUI Web Edition",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_keys.router)
app.include_router(projects.router)
app.include_router(git.router)
app.include_router(filesystem.router)
app.include_router(chat.router)
app.include_router(codex.router)  # Codex CLI integration
app.include_router(avatar.router)  # Avatar management

# Mount static files (frontend build) if directory exists
frontend_path = Path(settings.STATIC_FILES_DIR)
if frontend_path.exists() and frontend_path.is_dir():
    app.mount("/", StaticFiles(directory=settings.STATIC_FILES_DIR, html=True), name="static")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
