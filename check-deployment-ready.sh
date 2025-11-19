#!/bin/bash

echo "=================================="
echo "🚀 Railway Deployment Preparation"
echo "=================================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

echo "✅ Git repository found"

# Check if remote is set
if ! git remote -v | grep -q origin; then
    echo "⚠️  No remote 'origin' found"
    echo "💡 Add remote: git remote add origin <your-github-repo-url>"
else
    echo "✅ Remote 'origin' configured"
fi

# Check for .env files
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found"
    echo "💡 Copy: cp backend/.env.example backend/.env"
else
    echo "✅ Backend .env exists"
fi

# Check if files are staged
if git diff --staged --quiet; then
    echo "⚠️  No files staged for commit"
    echo "💡 Run: git add ."
else
    echo "✅ Files staged"
fi

echo ""
echo "=================================="
echo "📋 Next Steps:"
echo "=================================="
echo ""
echo "1. Ensure .env is configured (but NOT committed)"
echo "2. Stage files: git add ."
echo "3. Commit: git commit -m 'Ready for Railway deployment'"
echo "4. Push: git push origin main"
echo "5. Go to https://railway.app and deploy!"
echo ""
echo "=================================="
