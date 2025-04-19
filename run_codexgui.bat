@echo off
echo ========================================
echo       Starting CodexGUI Application
echo ========================================

:: Start backend server
start cmd /k "cd /d E:\CodexGUI\backend && python -m app.main"

:: Wait for backend to initialize
echo Starting backend server...
timeout /t 3

:: Start frontend development server
start cmd /k "cd /d E:\CodexGUI\frontend && npm run dev"

:: Wait for frontend to initialize
echo Starting frontend server...
timeout /t 5

:: Open browser
echo Opening browser...
start http://localhost:5173

echo.
echo CodexGUI started successfully!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8000
echo.
echo Close this window to exit
pause
