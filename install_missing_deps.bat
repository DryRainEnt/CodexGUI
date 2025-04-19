@echo off
echo =========================================
echo CodexGUI Missing Dependencies Installer
echo =========================================
echo.

:: Check if virtual environment exists
if not exist "codexgui_env\Scripts\activate.bat" (
    echo Virtual environment not found. Please run setup_venv.bat first.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Activate virtual environment
echo Activating virtual environment...
call codexgui_env\Scripts\activate.bat

:: Check if activation was successful
python -c "import sys; print(sys.prefix)" | findstr /C:"codexgui_env" >nul
if %errorlevel% neq 0 (
    echo Failed to activate virtual environment.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Install missing modules from requirements.txt
echo.
echo Installing dependencies from requirements.txt...
pip install -r backend\requirements.txt

:: Check for missing modules explicitly
echo.
echo Verifying critical modules...
python -c "import aiofiles, dulwich" 2>nul
if %errorlevel% neq 0 (
    echo Some modules couldn't be imported. Installing explicitly...
    pip install aiofiles dulwich
)

echo.
echo =========================================
echo Installation completed!
echo =========================================
echo.
echo Backend dependencies have been installed.
echo You can now run run_tests_venv.bat to execute the tests.
echo.
echo Press any key to exit...
pause >nul