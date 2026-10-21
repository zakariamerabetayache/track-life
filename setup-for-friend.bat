@echo off
echo ========================================================
echo         Setting up Track Life for First Time Use
echo ========================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from: https://nodejs.org
    echo Then run this setup again.
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install

echo.
echo [2/4] Initializing Database...
call npx prisma generate

echo.
echo [3/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install

echo.
echo [4/4] Creating Desktop Shortcut...
cd /d "%~dp0"
call create-desktop-shortcut.bat

echo.
echo ========================================================
echo           Setup Complete!
echo You can now close this and double-click the 
echo "Track Life" icon on your Desktop anytime to run!
echo ========================================================
pause
