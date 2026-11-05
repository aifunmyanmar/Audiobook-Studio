@echo off
title Stop Audiobook Studio Pro
cd /d "%~dp0"

echo ==========================================================
echo     Stopping Audiobook Studio Pro on Port 1104
echo ==========================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":1104" ^| findstr "LISTENING"') do (
    echo Terminating PID: %%a ...
    taskkill /F /PID %%a >nul 2>nul
)

echo [INFO] Audiobook Studio stopped successfully.
timeout /t 2 >nul
