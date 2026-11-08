@echo off
echo ========================================================
echo Starting Apex Gaming Cafe - Platforms
echo ========================================================

echo Starting FastAPI Backend on port 8000...
start "Apex Backend" cmd /c "cd /d "%~dp0backend" && "%LocalAppData%\Programs\Python\Python312\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Customer Web and App on port 5173...
start "Apex Customer Web" cmd /c "cd /d "%~dp0frontend" && npm.cmd run dev"

echo Starting Admin and Staff Portal on port 5174...
start "Apex Admin Portal" cmd /c "cd /d "%~dp0admin-portal" && npm.cmd run dev"

REM Check for connected Android phone via ADB USB / OTG
set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if exist %ADB% (
    echo.
    echo Checking USB-connected mobile device...
    %ADB% reverse tcp:5173 tcp:5173 >nul 2>&1
    %ADB% reverse tcp:8000 tcp:8000 >nul 2>&1
    %ADB% reverse tcp:5174 tcp:5174 >nul 2>&1
    %ADB% shell am start -a android.intent.action.VIEW -d "http://localhost:5173" >nul 2>&1
    echo USB reverse tunnel active: Your phone can access http://localhost:5173 directly!
)

echo.
echo ========================================================
echo All services launched!
echo * Customer Web and App:    http://localhost:5173  (Mobile: http://localhost:5173 or http://192.168.29.25:5173)
echo * Admin and Staff Portal:  http://localhost:5174  (Mobile: http://localhost:5174 or http://192.168.29.25:5174)
echo * Backend API Docs:        http://127.0.0.1:8000/docs
echo ========================================================
