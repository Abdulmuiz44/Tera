@echo off
REM Setup script for SerpScrap integration on Windows
REM This script installs Python dependencies required for web search functionality

setlocal enabledelayedexpansion

echo.
echo Searching for SerpScrap for web search...
echo.

REM Check if Python 3 is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.4 or higher from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo OK: Python %PYTHON_VERSION% found
echo.

REM Install Python dependencies
echo Installing Python dependencies from requirements.txt...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo OK: SerpScrap setup complete!
echo.
echo Next steps:
echo 1. Make sure NEXT_PUBLIC_APP_URL is set in .env.local
echo 2. Ensure Python is accessible from your application environment
echo 3. Run 'npm run dev' or 'npm start' to begin using web search
echo.
echo Web search is now available using SerpScrap (free, self-hosted)
echo.
pause
