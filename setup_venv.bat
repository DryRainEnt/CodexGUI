@echo off
echo =========================================
echo CodexGUI Virtual Environment Setup
echo =========================================
echo.

:: Check if Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.11+ and try again.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Checking Python version...
python --version
echo.

:: Create virtual environment if it doesn't exist
if not exist "codexgui_env\" (
    echo Creating virtual environment...
    python -m venv codexgui_env
    
    if %errorlevel% neq 0 (
        echo Failed to create virtual environment. Please check if venv module is available.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    
    echo Virtual environment created successfully.
) else (
    echo Virtual environment already exists.
)

:: Activate virtual environment and install requirements
echo.
echo Activating virtual environment and installing requirements...
call codexgui_env\Scripts\activate.bat

echo.
echo Installing backend requirements...
pip install -r backend\requirements.txt

echo.
echo Installing specific version dependencies to resolve conflicts...
pip install starlette==0.27.0 httpx==0.24.1 fastapi==0.103.1 pydantic==2.0.3 pytest pytest-asyncio

echo.
echo Installing test dependencies...
pip install pytest pytest-asyncio httpx

echo.
echo Creating requirements_dev.txt with exact versions...
pip freeze > requirements_dev.txt

echo.
echo =========================================
echo Virtual environment setup complete!
echo =========================================
echo.
echo To activate the virtual environment manually, run:
echo   call codexgui_env\Scripts\activate.bat
echo.
echo To deactivate, run:
echo   deactivate
echo.
echo Press any key to exit...
pause >nul
