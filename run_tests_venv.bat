@echo off
echo =========================================
echo CodexGUI Test Runner (Virtual Environment)
echo =========================================
echo.

:: Check if virtual environment exists
if not exist "codexgui_env\" (
    echo Virtual environment not found. Please run setup_venv.bat first.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

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
set "log_file=logs\test_run_%timestamp%.log"

:: Start logging
echo CodexGUI Test Run (Virtual Environment) - %date% %time% > "%log_file%"
echo ========================================= >> "%log_file%"
echo. >> "%log_file%"

echo Test log will be saved to: %log_file%
echo.

:: Activate virtual environment
echo Activating virtual environment...
echo Activating virtual environment... >> "%log_file%"
call codexgui_env\Scripts\activate.bat

:: Check for Python and Node.js
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.11+ and try again.
    echo Python is not installed or not in PATH. Please install Python 3.11+ and try again. >> "%log_file%"
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js 18+ and try again.
    echo Node.js is not installed or not in PATH. Please install Node.js 18+ and try again. >> "%log_file%"
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Checking Python version...
python --version >> "%log_file%" 2>&1
python --version
echo.

echo Checking Node.js version...
node --version >> "%log_file%" 2>&1
node --version
echo.

:: Set environment variables for testing
set PYTHONPATH=%CD%
set TEST_MODE=1

:menu
:: Option selection
echo Choose test suite to run:
echo.
echo 1. Run all tests
echo 2. Run frontend tests only
echo 3. Run backend tests only
echo 4. Run Sprint 0 tests only
echo 5. Run Sprint 1 tests only
echo 6. View latest log file
echo 7. Exit
echo.

set /p option="Enter option (1-7): "
echo User selected option: %option% >> "%log_file%"
echo.

if "%option%"=="1" goto run_all
if "%option%"=="2" goto run_frontend
if "%option%"=="3" goto run_backend
if "%option%"=="4" goto run_sprint0
if "%option%"=="5" goto run_sprint1
if "%option%"=="6" goto view_log
if "%option%"=="7" goto end

echo Invalid option. Please try again.
echo Invalid option selected >> "%log_file%"
echo.
goto menu

:run_all
echo Running all tests... >> "%log_file%"
echo Running all tests...
set test_failed=0

call :run_frontend
if %errorlevel% neq 0 set test_failed=1

echo. >> "%log_file%"
echo ========================================= >> "%log_file%"
echo. >> "%log_file%"
echo.
echo =========================================
echo.
echo Continue with backend tests? (Y/N)
set /p continue_choice="Choice: "
echo User prompted to continue with backend tests: %continue_choice% >> "%log_file%"
if /i "%continue_choice%"=="N" goto test_summary

call :run_backend
if %errorlevel% neq 0 set test_failed=1

goto test_summary

:run_frontend
echo ========================================= >> "%log_file%"
echo Running Frontend Tests >> "%log_file%"
echo ========================================= >> "%log_file%"
echo.
echo =========================================
echo Running Frontend Tests
echo =========================================
cd frontend
echo Installing dependencies...
echo Installing frontend dependencies... >> "..\%log_file%"
call npm install >> "..\%log_file%" 2>&1

echo. >> "..\%log_file%"
echo Running Vitest... >> "..\%log_file%"
echo.
echo Running Vitest...
call npm test >> "..\%log_file%" 2>&1
set frontend_result=%errorlevel%
cd ..

if %frontend_result% neq 0 (
    echo. >> "%log_file%"
    echo Frontend tests FAILED! >> "%log_file%"
    echo.
    echo Frontend tests FAILED!
    exit /b 1
) else (
    echo. >> "%log_file%"
    echo Frontend tests PASSED! >> "%log_file%"
    echo.
    echo Frontend tests PASSED!
    exit /b 0
)

:run_backend
echo ========================================= >> "%log_file%"
echo Running Backend Tests >> "%log_file%"
echo ========================================= >> "%log_file%"
echo.
echo =========================================
echo Running Backend Tests
echo =========================================
cd backend

echo. >> "..\%log_file%"
echo Running pytest... >> "..\%log_file%"
echo.
echo Running pytest...
python -m pytest -v >> "..\%log_file%" 2>&1
set backend_result=%errorlevel%
cd ..

if %backend_result% neq 0 (
    echo. >> "%log_file%"
    echo Backend tests FAILED! >> "%log_file%"
    echo.
    echo Backend tests FAILED!
    exit /b 1
) else (
    echo. >> "%log_file%"
    echo Backend tests PASSED! >> "%log_file%"
    echo.
    echo Backend tests PASSED!
    exit /b 0
)

:run_sprint0
echo ========================================= >> "%log_file%"
echo Running Sprint 0 Tests >> "%log_file%"
echo ========================================= >> "%log_file%"
echo.
echo =========================================
echo Running Sprint 0 Tests
echo =========================================
echo Checking project structure...
echo Checking project structure... >> "%log_file%"
set sprint0_failed=0

:: Check for essential directories and files
if not exist "frontend\" (
    echo FAIL: frontend directory not found >> "%log_file%"
    echo FAIL: frontend directory not found
    set sprint0_failed=1
)

if not exist "backend\" (
    echo FAIL: backend directory not found >> "%log_file%"
    echo FAIL: backend directory not found
    set sprint0_failed=1
)

if not exist "frontend\package.json" (
    echo FAIL: frontend/package.json not found >> "%log_file%"
    echo FAIL: frontend/package.json not found
    set sprint0_failed=1
)

if not exist "frontend\tsconfig.json" (
    echo FAIL: frontend/tsconfig.json not found >> "%log_file%"
    echo FAIL: frontend/tsconfig.json not found
    set sprint0_failed=1
)

if not exist "frontend\vite.config.ts" (
    echo FAIL: frontend/vite.config.ts not found >> "%log_file%"
    echo FAIL: frontend/vite.config.ts not found
    set sprint0_failed=1
)

if not exist "backend\requirements.txt" (
    echo FAIL: backend/requirements.txt not found >> "%log_file%"
    echo FAIL: backend/requirements.txt not found
    set sprint0_failed=1
)

if not exist "backend\app\main.py" (
    echo FAIL: backend/app/main.py not found >> "%log_file%"
    echo FAIL: backend/app/main.py not found
    set sprint0_failed=1
)

if %sprint0_failed%==1 (
    echo. >> "%log_file%"
    echo Some essential files are missing >> "%log_file%"
    echo.
    echo Some essential files are missing. Continue anyway? (Y/N)
    set /p continue_sprint0="Choice: "
    echo User prompted to continue with missing files: %continue_sprint0% >> "%log_file%"
    if /i "%continue_sprint0%"=="N" goto test_summary
)

echo PASS: All essential files exist or continuing anyway >> "%log_file%"
echo PASS: All essential files exist or continuing anyway

echo. >> "%log_file%"
echo Checking if frontend builds... >> "%log_file%"
echo.
echo Checking if frontend builds...
echo Continue with frontend build test? (Y/N)
set /p continue_build="Choice: "
echo User prompted to continue with frontend build test: %continue_build% >> "%log_file%"
if /i "%continue_build%"=="N" goto skip_build

cd frontend
echo Installing dependencies... >> "..\%log_file%"
echo Installing dependencies...
call npm install >> "..\%log_file%" 2>&1

echo Building frontend... >> "..\%log_file%"
echo Building frontend...
call npm run build >> "..\%log_file%" 2>&1
set build_result=%errorlevel%
cd ..

if %build_result% neq 0 (
    echo FAIL: Frontend build failed >> "%log_file%"
    echo FAIL: Frontend build failed
    echo.
    echo Frontend build failed. Continue anyway? (Y/N)
    set /p continue_after_build="Choice: "
    echo User prompted to continue after build failure: %continue_after_build% >> "%log_file%"
    if /i "%continue_after_build%"=="N" goto test_summary
) else (
    echo PASS: Frontend builds successfully >> "%log_file%"
    echo PASS: Frontend builds successfully
)

:skip_build
echo. >> "%log_file%"
echo Sprint 0 tests completed! >> "%log_file%"
echo.
echo Sprint 0 tests completed!
echo.
echo Return to main menu? (Y/N)
set /p return_to_menu="Choice: "
echo User prompted to return to main menu: %return_to_menu% >> "%log_file%"
if /i "%return_to_menu%"=="Y" goto menu
goto test_summary

:run_sprint1
echo ========================================= >> "%log_file%"
echo Running Sprint 1 Tests >> "%log_file%"
echo ========================================= >> "%log_file%"
echo.
echo =========================================
echo Running Sprint 1 Tests
echo =========================================
echo Checking Sprint 1 implementation...
echo Checking Sprint 1 implementation... >> "%log_file%"

echo Run Sprint 0 checks first? (Y/N)
set /p run_sprint0_first="Choice: "
echo User prompted to run Sprint 0 checks first: %run_sprint0_first% >> "%log_file%"
if /i "%run_sprint0_first%"=="Y" (
    call :run_sprint0
    echo.
    echo Continue with Sprint 1 specific tests? (Y/N)
    set /p continue_sprint1="Choice: "
    echo User prompted to continue with Sprint 1 tests: %continue_sprint1% >> "%log_file%"
    if /i "%continue_sprint1%"=="N" goto test_summary
)

:: Check Sprint 1 specific features
set sprint1_failed=0

if not exist "frontend\src\pages\Launch.tsx" (
    echo FAIL: Launch page not implemented >> "%log_file%"
    echo FAIL: Launch page not implemented
    set sprint1_failed=1
)

if not exist "backend\app\routers\api_keys.py" (
    echo FAIL: API keys router not implemented >> "%log_file%"
    echo FAIL: API keys router not implemented
    set sprint1_failed=1
)

if %sprint1_failed%==1 (
    echo Some essential Sprint 1 files are missing. Continue anyway? (Y/N) >> "%log_file%"
    echo Some essential Sprint 1 files are missing. Continue anyway? (Y/N)
    set /p continue_sprint1_checks="Choice: "
    echo User prompted to continue with missing Sprint 1 files: %continue_sprint1_checks% >> "%log_file%"
    if /i "%continue_sprint1_checks%"=="N" goto test_summary
) else (
    echo PASS: Essential Sprint 1 files exist >> "%log_file%"
    echo PASS: Essential Sprint 1 files exist
)

echo. >> "%log_file%"
echo.
echo Run Launch page frontend tests? (Y/N)
set /p run_launch_tests="Choice: "
echo User prompted to run Launch page tests: %run_launch_tests% >> "%log_file%"
if /i "%run_launch_tests%"=="Y" (
    echo Running Launch page tests... >> "%log_file%"
    echo Running Launch page tests...
    cd frontend
    call npm test "Launch" >> "..\%log_file%" 2>&1
    set launch_test_result=%errorlevel%
    cd ..
    
    if %launch_test_result% neq 0 (
        echo FAIL: Launch page tests failed >> "%log_file%"
        echo FAIL: Launch page tests failed
        echo Continue anyway? (Y/N)
        set /p continue_after_launch="Choice: "
        echo User prompted to continue after Launch test failure: %continue_after_launch% >> "%log_file%"
        if /i "%continue_after_launch%"=="N" goto test_summary
    ) else (
        echo PASS: Launch page tests succeeded >> "%log_file%"
        echo PASS: Launch page tests succeeded
    )
)

echo. >> "%log_file%"
echo.
echo Run API key backend tests? (Y/N)
set /p run_api_tests="Choice: "
echo User prompted to run API key tests: %run_api_tests% >> "%log_file%"
if /i "%run_api_tests%"=="Y" (
    echo Running API key validation tests... >> "%log_file%"
    echo Running API key validation tests...
    cd backend
    python -m pytest tests/test_api_keys.py -v >> "..\%log_file%" 2>&1
    set api_test_result=%errorlevel%
    cd ..
    
    if %api_test_result% neq 0 (
        echo FAIL: API key validation tests failed >> "%log_file%"
        echo FAIL: API key validation tests failed
    ) else (
        echo PASS: API key validation tests succeeded >> "%log_file%"
        echo PASS: API key validation tests succeeded
    )
)

echo. >> "%log_file%"
echo Sprint 1 tests completed! >> "%log_file%"
echo.
echo Sprint 1 tests completed!
echo.
echo Return to main menu? (Y/N)
set /p return_to_menu="Choice: "
echo User prompted to return to main menu: %return_to_menu% >> "%log_file%"
if /i "%return_to_menu%"=="Y" goto menu
goto test_summary

:view_log
echo.
echo Latest log file: %log_file%
echo.
echo Open log file in Notepad? (Y/N)
set /p open_log="Choice: "
if /i "%open_log%"=="Y" (
    start notepad "%log_file%"
)
echo.
goto menu

:test_summary
echo. >> "%log_file%"
echo ========================================= >> "%log_file%"
echo Test Execution Summary >> "%log_file%"
echo ========================================= >> "%log_file%"
echo.
echo =========================================
echo          Test Execution Summary
echo =========================================
echo.
if "%option%"=="1" (
    if %test_failed%==1 (
        echo Some tests FAILED! >> "%log_file%"
        echo Some tests FAILED!
    ) else (
        echo All tests PASSED! >> "%log_file%"
        echo All tests PASSED!
    )
)

echo. >> "%log_file%"
echo Test log saved to: %log_file% >> "%log_file%"
echo.
echo Test log saved to: %log_file%
echo.
echo Return to main menu? (Y/N)
set /p return_choice="Choice: "
echo User prompted to return to main menu: %return_choice% >> "%log_file%"
if /i "%return_choice%"=="Y" (
    cls
    goto menu
)

:end
echo. >> "%log_file%"
echo Test execution completed at %date% %time% >> "%log_file%"
echo.
echo Thank you for using CodexGUI Test Runner.
echo Test log saved to: %log_file%
echo.
echo Deactivating virtual environment...
call deactivate
echo Press any key to exit...
pause >nul
