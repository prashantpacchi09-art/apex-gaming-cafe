@echo off
setlocal
set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"

echo ========================================================
echo Connecting Apex Gaming Cafe Customer App to Mobile Device
echo ========================================================

if not exist %ADB% (
    echo [ERROR] ADB not found at %ADB%.
    pause
    exit /b 1
)

echo Checking for connected phone...
%ADB% devices

echo.
echo Setting up USB reverse port forwarding...
%ADB% reverse tcp:5173 tcp:5173
%ADB% reverse tcp:8000 tcp:8000
%ADB% reverse tcp:5174 tcp:5174

echo.
echo [SUCCESS] USB reverse tunnel established!
echo Opening Customer App on your phone browser...
%ADB% shell am start -a android.intent.action.VIEW -d "http://localhost:5173"

echo.
echo ========================================================
echo The Customer App is now running on your phone!
echo URL: http://localhost:5173
echo.
echo Tip: In your phone's browser, tap 'Add to Home Screen'
echo or 'Install app' to install it as a standalone app!
echo ========================================================
pause

