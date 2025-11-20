@echo off
echo ========================================
echo Railway Deployment Readiness Check
echo ========================================
echo.

echo Checking required files...
echo.

if exist "nixpacks.toml" (
    echo [OK] nixpacks.toml found
) else (
    echo [ERROR] nixpacks.toml not found
    exit /b 1
)

if exist "start.sh" (
    echo [OK] start.sh found
) else (
    echo [ERROR] start.sh not found
    exit /b 1
)

if exist "backend\requirements.txt" (
    echo [OK] backend\requirements.txt found
) else (
    echo [ERROR] backend\requirements.txt not found
    exit /b 1
)

if exist "frontend\package.json" (
    echo [OK] frontend\package.json found
) else (
    echo [ERROR] frontend\package.json not found
    exit /b 1
)

echo.
echo ========================================
echo Git Status
echo ========================================
git status

echo.
echo ========================================
echo Ready to Deploy!
echo ========================================
echo.
echo Next steps:
echo 1. git add .
echo 2. git commit -m "Fix: Add missing C++ libraries for Railway deployment"
echo 3. git push
echo.
echo Railway will automatically redeploy after push.
echo.

pause
