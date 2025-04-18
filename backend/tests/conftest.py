import os
import pytest
import tempfile
import shutil
import time
import stat
import platform
from starlette.testclient import TestClient
from pathlib import Path

from app.main import app
from app.core.config import settings

def safe_rmtree(path):
    """
    Windows에서 권한 문제로 인한 삭제 오류를 처리하는 안전한 rmtree 함수
    """
    def on_rm_error(func, path, exc_info):
        # 파일 삭제 권한 문제 발생 시 접근 권한 변경 시도
        try:
            # 파일을 읽기/쓰기 가능하게 권한 변경
            os.chmod(path, stat.S_IWRITE)
            # 다시 삭제 시도
            os.unlink(path)
        except:
            # 여전히 실패하면 오류 로깅만 하고 진행
            print(f"Could not delete {path}, skipping...")
    
    # Windows에서는 가끔 파일이 여전히 사용 중이기 때문에 지연 후 시도
    if platform.system() == 'Windows':
        # Git 프로세스가 완전히 종료되도록 잠시 대기
        time.sleep(1)
    
    # on_error 함수를 사용하여 삭제 시도
    shutil.rmtree(path, onerror=on_rm_error)

@pytest.fixture
def test_client():
    """
    Create a test client for the FastAPI app
    """
    client = TestClient(app)
    try:
        yield client
    finally:
        client.close()

@pytest.fixture
def temp_project_dir():
    """
    Create a temporary directory for project tests
    """
    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()
    
    # Initialize git repo in the directory
    os.system(f"git -C {temp_dir} init")
    
    # Create a test file
    test_file = os.path.join(temp_dir, "test.txt")
    with open(test_file, "w") as f:
        f.write("Test content")
    
    # Add and commit the file
    os.system(f"git -C {temp_dir} add .")
    os.system(f'git -C {temp_dir} config user.email "test@example.com"')
    os.system(f'git -C {temp_dir} config user.name "Test User"')
    os.system(f'git -C {temp_dir} commit -m "Initial commit"')
    
    yield temp_dir
    
    # Cleanup - 안전한 삭제 함수 사용
    safe_rmtree(temp_dir)

@pytest.fixture
def temp_data_dir():
    """
    Create a temporary data directory for test database and logs
    """
    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()
    
    # Create subdirectories
    Path(os.path.join(temp_dir, "logs")).mkdir(parents=True, exist_ok=True)
    Path(os.path.join(temp_dir, "snapshots")).mkdir(parents=True, exist_ok=True)
    
    # Store original settings
    original_data_dir = settings.DATA_DIR
    original_logs_dir = settings.LOGS_DIR
    original_snapshots_dir = settings.SNAPSHOTS_DIR
    original_db_file = settings.DB_FILE
    
    # Override settings for tests
    settings.DATA_DIR = temp_dir
    settings.LOGS_DIR = os.path.join(temp_dir, "logs")
    settings.SNAPSHOTS_DIR = os.path.join(temp_dir, "snapshots")
    settings.DB_FILE = os.path.join(temp_dir, "test.db")
    
    yield temp_dir
    
    # Reset settings
    settings.DATA_DIR = original_data_dir
    settings.LOGS_DIR = original_logs_dir
    settings.SNAPSHOTS_DIR = original_snapshots_dir
    settings.DB_FILE = original_db_file
    
    # Cleanup - 안전한 삭제 함수 사용
    safe_rmtree(temp_dir)

@pytest.fixture
def mock_valid_api_key():
    """
    Return a mock valid API key for tests
    """
    return "sk-test12345678901234567890"
