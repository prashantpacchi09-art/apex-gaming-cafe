@echo off
set BASE_DIR=%~dp0

REM 1. Start FastAPI backend silently on port 8000
start "ApexBackend" /min "%LocalAppData%\Programs\Python\Python312\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir "%BASE_DIR%backend"

REM 2. Start Customer Web on port 5173
start "ApexCustomerWeb" /min cmd /c "cd /d "%BASE_DIR%frontend" && npm.cmd run dev -- --host 0.0.0.0 --port 5173"

REM 3. Start Admin Portal on port 5174
start "ApexAdminPortal" /min cmd /c "cd /d "%BASE_DIR%admin-portal" && npm.cmd run dev -- --host 0.0.0.0 --port 5174"

