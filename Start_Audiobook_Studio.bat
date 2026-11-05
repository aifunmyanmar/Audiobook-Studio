@echo off
title Audiobook Studio Pro (Port: 1104)
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================================
echo    Audiobook Studio Pro (Port: 1104) - Auto Launcher
echo ==========================================================
echo.

if not exist "bin\" mkdir bin

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [CHECK 1/4] Node.js is missing. Installing Node.js LTS...
    where winget >nul 2>nul
    if !errorlevel! equ 0 (
        echo [INFO] Installing Node.js LTS via winget...
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    ) else (
        echo [INFO] Downloading and silently installing Node.js LTS installer...
        powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node_setup.msi'; Start-Process msiexec.exe -ArgumentList '/i', '%TEMP%\node_setup.msi', '/quiet', '/norestart' -Wait; Remove-Item '%TEMP%\node_setup.msi' -Force"
    )
    set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
    where node >nul 2>nul
    if !errorlevel! neq 0 (
        echo.
        echo [NOTE] Node.js was installed! Please close this window and double-click Start_Audiobook_Studio.bat again.
        pause
        exit /b 0
    )
)
echo [CHECK 1/4] Node.js is ready:
node -v

:: 2. Check & Install NPM Dependencies (Remotion, React, Vite)
if not exist "node_modules\" (
    echo.
    echo [CHECK 2/4] First-time setup: Installing Remotion and dependencies (npm install)...
    call npm install
) else (
    echo [CHECK 2/4] Remotion and Node packages are ready.
)

:: 3. Check FFmpeg / FFprobe
where ffmpeg >nul 2>nul
if %errorlevel% equ 0 (
    echo [CHECK 3/4] FFmpeg is ready (System PATH).
) else if exist "bin\ffmpeg.exe" (
    echo [CHECK 3/4] FFmpeg is ready (bin\ffmpeg.exe).
) else (
    echo [CHECK 3/4] FFmpeg missing. Auto-downloading portable FFmpeg into bin\ ...
    powershell -Command "$ProgressPreference = 'SilentlyContinue'; Write-Host '[INFO] Downloading portable FFmpeg...'; Invoke-WebRequest -Uri 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip' -OutFile '%TEMP%\ffmpeg.zip'; Expand-Archive '%TEMP%\ffmpeg.zip' -DestinationPath '%TEMP%\ffmpeg_unzipped' -Force; Copy-Item '%TEMP%\ffmpeg_unzipped\*\bin\ffmpeg.exe' 'bin\ffmpeg.exe' -Force; Copy-Item '%TEMP%\ffmpeg_unzipped\*\bin\ffprobe.exe' 'bin\ffprobe.exe' -Force; Remove-Item '%TEMP%\ffmpeg.zip' -Force; Remove-Item '%TEMP%\ffmpeg_unzipped' -Recurse -Force"
    if exist "bin\ffmpeg.exe" (
        echo [CHECK 3/4] FFmpeg auto-installed successfully into bin\
    ) else (
        echo [CHECK 3/4] Direct download failed. Trying winget install Gyan.FFmpeg...
        winget install Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements >nul 2>nul
    )
)

:: 4. Check yt-dlp
where yt-dlp >nul 2>nul
if %errorlevel% equ 0 (
    echo [CHECK 4/4] yt-dlp is ready (System PATH).
) else if exist "bin\yt-dlp.exe" (
    echo [CHECK 4/4] yt-dlp is ready (bin\yt-dlp.exe).
) else (
    echo [CHECK 4/4] yt-dlp missing. Auto-downloading standalone yt-dlp.exe into bin\ ...
    powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -OutFile 'bin\yt-dlp.exe'"
    if exist "bin\yt-dlp.exe" (
        echo [CHECK 4/4] yt-dlp auto-installed successfully into bin\yt-dlp.exe
    )
)

:: 5. Launch Remotion & Vite Host Server
set NODE_OPTIONS=--max-old-space-size=8192
echo.
echo ==========================================================
echo   Audiobook Studio Pro is starting on http://localhost:1104
echo ==========================================================
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:1104"
call npm run dev
pause
