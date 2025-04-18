import os
from pathlib import Path
# pydantic-settings 대신 기본 pydantic 사용
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# BaseSettings 대신 BaseModel 사용
class Settings(BaseModel):
    # API Settings
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    PROJECT_NAME: str = "CodexGUI"
    
    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS Settings
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
    
    # File Storage
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    LOGS_DIR: str = os.getenv("LOGS_DIR", "./data/logs")
    SNAPSHOTS_DIR: str = os.getenv("SNAPSHOTS_DIR", "./data/snapshots")
    DB_FILE: str = os.getenv("DB_FILE", "./data/codexgui.db")
    
    # Static Files (Frontend)
    STATIC_FILES_DIR: str = os.getenv("STATIC_FILES_DIR", "../frontend/dist")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # OpenAI
    OPENAI_API_URL: str = "https://api.openai.com"
    
    class Config:
        case_sensitive = True

settings = Settings()

# Create necessary directories
Path(settings.DATA_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.LOGS_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.SNAPSHOTS_DIR).mkdir(parents=True, exist_ok=True)
