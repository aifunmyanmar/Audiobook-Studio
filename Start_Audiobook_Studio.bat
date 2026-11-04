@echo off
title Audiobook Studio Pro (Port: 1104)
cd /d "%~dp0"

echo ==========================================================
echo     Audiobook Studio Pro (Port: 1104) - Windows Launcher
echo ==========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing required dependencies...
    call npm install
)

set NODE_OPTIONS=--max-old-space-size=8192

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:1104"

echo [INFO] Starting dev server on http://localhost:1104 ...
call npm run dev

pause
