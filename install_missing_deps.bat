@echo off
echo =========================================
echo CodexGUI Missing Dependencies Installer
echo =========================================
echo.

:: Activate virtual environment
echo Activating virtual environment...
call codexgui_env\Scripts\activate.bat

:: Install missing modules
echo.
echo Installing missing dependencies...
pip install aiofiles dulwich

echo.
echo =========================================
echo Installation completed!
echo =========================================
echo.
echo Press any key to exit...
pause >nul