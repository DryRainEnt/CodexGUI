@echo off
echo =========================================
echo CodexGUI Virtual Environment Activation
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

:: Set environment variables
set PYTHONPATH=%CD%
set TEST_MODE=0

echo.
echo Virtual environment activated!
echo.
echo Python path: %PYTHONPATH%
echo Test mode: %TEST_MODE%
echo.
echo Type 'deactivate' to exit the virtual environment.
echo.
echo Starting a new command prompt with the activated environment...
cmd /k
