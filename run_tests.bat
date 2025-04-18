@echo off
echo =========================================
echo CodexGUI Test Runner
echo =========================================
echo.

:: Check for Python and Node.js
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.11+ and try again.
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js 18+ and try again.
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

echo Invalid option. Exiting.
goto end

:run_all
echo Running all tests...
call :run_frontend
call :run_backend
goto end

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
cd ..
goto :eof

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
cd ..
goto :eof

:run_sprint0
echo =========================================
echo Running Sprint 0 Tests
echo =========================================
echo Checking project structure...

:: Check for essential directories and files
if not exist "frontend\" (
    echo FAIL: frontend directory not found
    exit /b 1
)

if not exist "backend\" (
    echo FAIL: backend directory not found
    exit /b 1
)

if not exist "frontend\package.json" (
    echo FAIL: frontend/package.json not found
    exit /b 1
)

if not exist "frontend\tsconfig.json" (
    echo FAIL: frontend/tsconfig.json not found
    exit /b 1
)

if not exist "frontend\vite.config.ts" (
    echo FAIL: frontend/vite.config.ts not found
    exit /b 1
)

if not exist "backend\requirements.txt" (
    echo FAIL: backend/requirements.txt not found
    exit /b 1
)

if not exist "backend\app\main.py" (
    echo FAIL: backend/app/main.py not found
    exit /b 1
)

echo PASS: All essential files exist

echo.
echo Checking if frontend builds successfully...
cd frontend
call npm install
call npm run build

if not exist "dist\" (
    echo FAIL: Frontend build failed
    cd ..
    exit /b 1
)

echo PASS: Frontend builds successfully
cd ..

echo.
echo Sprint 0 tests completed successfully!
goto end

:run_sprint1
echo =========================================
echo Running Sprint 1 Tests
echo =========================================
echo Checking Sprint 1 implementation...

:: First run Sprint 0 checks
call :run_sprint0

:: Then check Sprint 1 specific features
if not exist "frontend\src\pages\Launch.tsx" (
    echo FAIL: Launch page not implemented
    exit /b 1
)

if not exist "backend\app\routers\api_keys.py" (
    echo FAIL: API keys router not implemented
    exit /b 1
)

echo PASS: Essential Sprint 1 files exist

echo.
echo Running Sprint 1 specific tests...
cd frontend
call npm test "Launch"
cd ..

cd backend
python -m pytest tests/test_api_keys.py -v
cd ..

echo.
echo Sprint 1 tests completed!
goto end

:end
echo.
echo Test execution completed.
