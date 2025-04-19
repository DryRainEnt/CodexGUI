@echo off
echo =========================================
echo CodexGUI API Key Tests (Virtual Environment)
echo =========================================
echo.

:: Check if virtual environment exists
if not exist "codexgui_env\" (
    echo Virtual environment not found. Please run setup_venv.bat first.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Activate virtual environment
echo Activating virtual environment...
call codexgui_env\Scripts\activate.bat

:: Set environment variables for testing
set PYTHONPATH=%CD%
set TEST_MODE=1

:: Run the API key tests
echo Running API key validation tests...
cd backend
python -m pytest tests/test_api_keys.py -v
set api_test_result=%errorlevel%
cd ..

if %api_test_result% neq 0 (
    echo ==========================================
    echo FAIL: API key validation tests failed
    echo ==========================================
) else (
    echo ==========================================
    echo PASS: API key validation tests succeeded
    echo ==========================================
)

echo.
echo Deactivating virtual environment...
call deactivate
echo Press any key to exit...
pause >nul