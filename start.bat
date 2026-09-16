@echo off
setlocal enabledelayedexpansion

:: Ensure Node.js is on PATH for Windows GUI explorer launches
set "PATH=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\node;%PATH%"

title text2handwriting.me - Text to Handwriting Studio
cd /d "%~dp0"

echo ==============================================================
echo      text2handwriting.me - Hyper-Realistic Handwriting Studio
echo ==============================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not detected on your system PATH.
    echo Looked in default paths and system PATH.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [*] First-time setup detected: Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies via npm.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies successfully installed.
    echo.
)

echo [*] Starting text2handwriting.me development server...
echo [*] Opening http://localhost:5173 in your browser...
echo.

call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server stopped unexpectedly.
    pause
)
