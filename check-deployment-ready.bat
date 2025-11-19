@echo off
echo ==================================
echo 🚀 Railway Deployment Preparation
echo ==================================
echo.

:: Check if git is initialized
if not exist .git (
    echo ❌ Git not initialized. Run: git init
    exit /b 1
)

echo ✅ Git repository found

:: Check for .env files
if not exist backend\.env (
    echo ⚠️  backend\.env not found
    echo 💡 Copy: copy backend\.env.example backend\.env
) else (
    echo ✅ Backend .env exists
)

echo.
echo ==================================
echo 📋 Next Steps:
echo ==================================
echo.
echo 1. Ensure .env is configured (but NOT committed)
echo 2. Stage files: git add .
echo 3. Commit: git commit -m "Ready for Railway deployment"
echo 4. Push: git push origin main
echo 5. Go to https://railway.app and deploy!
echo.
echo ==================================
pause
