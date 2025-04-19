@echo off
echo =========================================
echo CodexGUI API Key Tests (Virtual Environment)
echo =========================================
echo.

:: Create logs directory if it doesn't exist
if not exist "logs\" mkdir logs

:: Generate timestamp for log file
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
set "log_file=logs\api_test_%timestamp%.log"

:: Start logging
echo CodexGUI API Key Tests - %date% %time% > "%log_file%"
echo ========================================= >> "%log_file%"
echo. >> "%log_file%"

echo Test log will be saved to: %log_file%
echo.

:: Check if virtual environment exists
if not exist "codexgui_env\" (
    echo Virtual environment not found. Please run setup_venv.bat first. >> "%log_file%"
    echo Virtual environment not found. Please run setup_venv.bat first.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Activate virtual environment
echo Activating virtual environment... >> "%log_file%"
echo Activating virtual environment...
call codexgui_env\Scripts\activate.bat

:: Check Python version
python --version >> "%log_file%" 2>&1
echo Python version: >> "%log_file%"
python --version

:: Set environment variables for testing
set PYTHONPATH=%CD%
set TEST_MODE=1

:: Run the API key tests
echo Running API key validation tests... >> "%log_file%"
echo Running API key validation tests...
cd backend
python -m pytest tests/test_api_keys.py -v >> "..\%log_file%" 2>&1
set api_test_result=%errorlevel%
cd ..

if %api_test_result% neq 0 (
    echo ========================================== >> "%log_file%"
    echo FAIL: API key validation tests failed >> "%log_file%"
    echo ========================================== >> "%log_file%"
    echo ==========================================
    echo FAIL: API key validation tests failed
    echo ==========================================
) else (
    echo ========================================== >> "%log_file%"
    echo PASS: API key validation tests succeeded >> "%log_file%"
    echo ========================================== >> "%log_file%"
    echo ==========================================
    echo PASS: API key validation tests succeeded
    echo ==========================================
)

echo. >> "%log_file%"
echo Test execution completed at %date% %time% >> "%log_file%"
echo Test log saved to: %log_file% >> "%log_file%"

echo.
echo Test log saved to: %log_file%
echo.
echo Deactivating virtual environment...
call deactivate

echo Open log file in Notepad? (Y/N)
set /p open_log="Choice: "
if /i "%open_log%"=="Y" (
    start notepad "%log_file%"
)

echo Press any key to exit...
pause >nul