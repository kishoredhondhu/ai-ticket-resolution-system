# 🚀 Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Git installed

---

## 📦 Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Railway deployment"

# Create GitHub repo and push
# (Follow GitHub instructions to create repo and push)
```

---

## 🚂 Step 2: Deploy to Railway

### Option A: Deploy via GitHub (Recommended)

1. **Sign up/Login to Railway**
   - Go to https://railway.app
   - Click "Login with GitHub"

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Click "Deploy Now"

3. **Configure Backend Service**
   - Railway will auto-detect your backend
   - Click on the service
   - Go to "Variables" tab
   - Add environment variables:
     ```
     AZURE_OPENAI_ENDPOINT=https://ag-new-endpoint.openai.azure.com
     AZURE_OPENAI_KEY=your-key-here
     AZURE_OPENAI_API_VERSION=2025-01-01-preview
     AZURE_OPENAI_DEPLOYMENT=gpt-4.1
     TOP_K_SIMILAR=5
     MIN_SIMILARITY=0.6
     PORT=8000
     ```

4. **Configure Frontend Service**
   - Click "New Service" → "GitHub repo"
   - Select same repo
   - Set root directory: `frontend`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - (Get backend URL from backend service settings)

5. **Generate Domain**
   - Click on backend service
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL
   - Update frontend's `VITE_API_URL` with this URL

6. **Deploy Frontend**
   - Click on frontend service
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Visit your frontend URL!

---

## 🎯 Quick Deploy (Alternative)

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up

# Add environment variables via dashboard
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend is running (check logs)
- [ ] Frontend is running (check logs)
- [ ] Environment variables are set
- [ ] Frontend can connect to backend
- [ ] Test the application

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check logs in Railway dashboard
- Verify environment variables
- Check `requirements.txt` for missing packages

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running

**Build fails:**
- Check build logs
- Verify `package.json` scripts
- Check for missing dependencies

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Your Backend URL: `https://[your-project].railway.app`
- Your Frontend URL: `https://[your-project].railway.app`

---

## 💰 Cost

- **Free Tier:** $5 credit/month (~500 hours)
- This project should stay within free tier for development/testing

---

## 📝 Environment Variables to Set in Railway

### Backend Service:
```
AZURE_OPENAI_ENDPOINT=https://ag-new-endpoint.openai.azure.com
   AZURE_OPENAI_KEY=your-azure-api-key-here
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
TOP_K_SIMILAR=5
MIN_SIMILARITY=0.6
```

### Frontend Service:
```
VITE_API_URL=https://[your-backend-url].railway.app
```

Replace `[your-backend-url]` with actual backend URL from Railway.
