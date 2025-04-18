@echo off
echo =========================================
echo CodexGUI Test Runner
echo =========================================
echo.

:: Check for Python and Node.js
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.11+ and try again.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js 18+ and try again.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Checking Python version...
python --version
echo.

echo Checking Node.js version...
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
echo 6. Exit
echo.

set /p option="Enter option (1-6): "
echo.

if "%option%"=="1" goto run_all
if "%option%"=="2" goto run_frontend
if "%option%"=="3" goto run_backend
if "%option%"=="4" goto run_sprint0
if "%option%"=="5" goto run_sprint1
if "%option%"=="6" goto end

echo Invalid option. Please try again.
echo.
goto menu

:run_all
echo Running all tests...
set test_failed=0

call :run_frontend
if %errorlevel% neq 0 set test_failed=1

echo.
echo =========================================
echo.
echo Continue with backend tests? (Y/N)
set /p continue_choice="Choice: "
if /i "%continue_choice%"=="N" goto test_summary

call :run_backend
if %errorlevel% neq 0 set test_failed=1

goto test_summary

:run_frontend
echo =========================================
echo Running Frontend Tests
echo =========================================
cd frontend
echo Installing dependencies...
call npm install

echo.
echo Running Vitest...
call npm test
set frontend_result=%errorlevel%
cd ..

if %frontend_result% neq 0 (
    echo.
    echo Frontend tests FAILED!
    exit /b 1
) else (
    echo.
    echo Frontend tests PASSED!
    exit /b 0
)

:run_backend
echo =========================================
echo Running Backend Tests
echo =========================================
cd backend
echo Installing dependencies...
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx

echo.
echo Running pytest...
python -m pytest -v
set backend_result=%errorlevel%
cd ..

if %backend_result% neq 0 (
    echo.
    echo Backend tests FAILED!
    exit /b 1
) else (
    echo.
    echo Backend tests PASSED!
    exit /b 0
)

:run_sprint0
echo =========================================
echo Running Sprint 0 Tests
echo =========================================
echo Checking project structure...
set sprint0_failed=0

:: Check for essential directories and files
if not exist "frontend\" (
    echo FAIL: frontend directory not found
    set sprint0_failed=1
)

if not exist "backend\" (
    echo FAIL: backend directory not found
    set sprint0_failed=1
)

if not exist "frontend\package.json" (
    echo FAIL: frontend/package.json not found
    set sprint0_failed=1
)

if not exist "frontend\tsconfig.json" (
    echo FAIL: frontend/tsconfig.json not found
    set sprint0_failed=1
)

if not exist "frontend\vite.config.ts" (
    echo FAIL: frontend/vite.config.ts not found
    set sprint0_failed=1
)

if not exist "backend\requirements.txt" (
    echo FAIL: backend/requirements.txt not found
    set sprint0_failed=1
)

if not exist "backend\app\main.py" (
    echo FAIL: backend/app/main.py not found
    set sprint0_failed=1
)

if %sprint0_failed%==1 (
    echo.
    echo Some essential files are missing. Continue anyway? (Y/N)
    set /p continue_sprint0="Choice: "
    if /i "%continue_sprint0%"=="N" goto test_summary
)

echo PASS: All essential files exist or continuing anyway

echo.
echo Checking if frontend builds successfully...
echo Continue with frontend build test? (Y/N)
set /p continue_build="Choice: "
if /i "%continue_build%"=="N" goto skip_build

cd frontend
echo Installing dependencies...
call npm install

echo Building frontend...
call npm run build
set build_result=%errorlevel%
cd ..

if %build_result% neq 0 (
    echo FAIL: Frontend build failed
    echo.
    echo Frontend build failed. Continue anyway? (Y/N)
    set /p continue_after_build="Choice: "
    if /i "%continue_after_build%"=="N" goto test_summary
) else (
    echo PASS: Frontend builds successfully
)

:skip_build
echo.
echo Sprint 0 tests completed!
echo.
echo Return to main menu? (Y/N)
set /p return_to_menu="Choice: "
if /i "%return_to_menu%"=="Y" goto menu
goto test_summary

:run_sprint1
echo =========================================
echo Running Sprint 1 Tests
echo =========================================
echo Checking Sprint 1 implementation...

echo Run Sprint 0 checks first? (Y/N)
set /p run_sprint0_first="Choice: "
if /i "%run_sprint0_first%"=="Y" (
    call :run_sprint0
    echo.
    echo Continue with Sprint 1 specific tests? (Y/N)
    set /p continue_sprint1="Choice: "
    if /i "%continue_sprint1%"=="N" goto test_summary
)

:: Check Sprint 1 specific features
set sprint1_failed=0

if not exist "frontend\src\pages\Launch.tsx" (
    echo FAIL: Launch page not implemented
    set sprint1_failed=1
)

if not exist "backend\app\routers\api_keys.py" (
    echo FAIL: API keys router not implemented
    set sprint1_failed=1
)

if %sprint1_failed%==1 (
    echo Some essential Sprint 1 files are missing. Continue anyway? (Y/N)
    set /p continue_sprint1_checks="Choice: "
    if /i "%continue_sprint1_checks%"=="N" goto test_summary
) else (
    echo PASS: Essential Sprint 1 files exist
)

echo.
echo Run Launch page frontend tests? (Y/N)
set /p run_launch_tests="Choice: "
if /i "%run_launch_tests%"=="Y" (
    echo Running Launch page tests...
    cd frontend
    call npm test "Launch"
    set launch_test_result=%errorlevel%
    cd ..
    
    if %launch_test_result% neq 0 (
        echo FAIL: Launch page tests failed
        echo Continue anyway? (Y/N)
        set /p continue_after_launch="Choice: "
        if /i "%continue_after_launch%"=="N" goto test_summary
    ) else (
        echo PASS: Launch page tests succeeded
    )
)

echo.
echo Run API key backend tests? (Y/N)
set /p run_api_tests="Choice: "
if /i "%run_api_tests%"=="Y" (
    echo Running API key validation tests...
    cd backend
    python -m pytest tests/test_api_keys.py -v
    set api_test_result=%errorlevel%
    cd ..
    
    if %api_test_result% neq 0 (
        echo FAIL: API key validation tests failed
    ) else (
        echo PASS: API key validation tests succeeded
    )
)

echo.
echo Sprint 1 tests completed!
echo.
echo Return to main menu? (Y/N)
set /p return_to_menu="Choice: "
if /i "%return_to_menu%"=="Y" goto menu
goto test_summary

:test_summary
echo.
echo =========================================
echo          Test Execution Summary
echo =========================================
echo.
if "%option%"=="1" (
    if %test_failed%==1 (
        echo Some tests FAILED!
    ) else (
        echo All tests PASSED!
    )
)

echo.
echo Return to main menu? (Y/N)
set /p return_choice="Choice: "
if /i "%return_choice%"=="Y" (
    cls
    goto menu
)

:end
echo.
echo Thank you for using CodexGUI Test Runner.
echo Press any key to exit...
pause >nul
