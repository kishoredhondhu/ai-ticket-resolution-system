# 🚀 Quick Railway Deployment Guide

## 📦 What We've Prepared

✅ All configuration files created  
✅ Frontend configured for environment variables  
✅ Backend ready for Railway  
✅ Documentation complete  

---

## 🎯 5-Minute Deploy (Follow These Steps)

### **Step 1: Push to GitHub** (5 min)

```bash
# Navigate to project
cd C:\Hackathon_Project

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Deploy on Railway** (5 min)

1. **Go to:** https://railway.app
2. **Click:** "Login with GitHub"
3. **Click:** "New Project" → "Deploy from GitHub repo"
4. **Select:** Your repository
5. **Click:** "Deploy Now"

---

### **Step 3: Configure Backend** (3 min)

1. **Click** on the backend service (Railway auto-detects it)
2. **Go to:** "Variables" tab
3. **Add these variables:**
   ```
   AZURE_OPENAI_ENDPOINT=https://ag-new-endpoint.openai.azure.com
   AZURE_OPENAI_KEY=your-azure-api-key-here
   AZURE_OPENAI_API_VERSION=2025-01-01-preview
   AZURE_OPENAI_DEPLOYMENT=gpt-4.1
   TOP_K_SIMILAR=5
   MIN_SIMILARITY=0.6
   ```
4. **Go to:** Settings → Networking → "Generate Domain"
5. **Copy** the URL (e.g., `https://xyz.railway.app`)

---

### **Step 4: Configure Frontend** (3 min)

1. **Click:** "New Service" → "GitHub repo" → Select same repo
2. **Set root directory:** `frontend`
3. **Go to:** "Variables" tab
4. **Add variable:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (Use the URL from Step 3)
5. **Go to:** Settings → Networking → "Generate Domain"
6. **Visit** the URL to see your app! 🎉

---

## ✅ Test Your Deployment

1. **Backend Health Check:**
   - Visit: `https://your-backend.railway.app/health`
   - Should see: `{"status": "healthy"}`

2. **Frontend:**
   - Visit: `https://your-frontend.railway.app`
   - Try uploading a ticket
   - Should get AI fallback response

---

## 📁 Files Created for Deployment

| File | Purpose |
|------|---------|
| `.gitignore` | Prevents committing sensitive files |
| `backend/Procfile` | Tells Railway how to run backend |
| `backend/runtime.txt` | Specifies Python version |
| `railway.json` | Railway configuration |
| `nixpacks.toml` | Build configuration |
| `.env.example` | Template for environment variables |
| `README.md` | Project documentation |
| `RAILWAY_DEPLOYMENT.md` | Detailed deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |

---

## 🆘 Quick Troubleshooting

### Backend won't start
- Check "Deployments" tab in Railway
- View logs for errors
- Verify environment variables are set

### Frontend can't connect
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check browser console for errors

### Azure OpenAI errors (403)
- **This is expected!** (Firewall blocking)
- Your fallback system handles this
- App still works without Azure AI

---

## 💡 Important Notes

1. **Free Tier:** Railway gives $5/month credit (~500 hours)
2. **Azure OpenAI:** May not work due to firewall (this is OK!)
3. **Fallback:** Your app works even without Azure AI
4. **Domains:** Railway provides free subdomains
5. **SSL:** Automatic HTTPS on all domains

---

## 🎯 What Happens During Deploy

1. ✅ Railway reads your code
2. ✅ Installs Python dependencies (backend)
3. ✅ Installs Node dependencies (frontend)
4. ✅ Builds frontend (`npm run build`)
5. ✅ Starts backend server
6. ✅ Generates URLs for both services
7. ✅ Your app is live!

---

## 📞 Need More Help?

- **Detailed Guide:** See `RAILWAY_DEPLOYMENT.md`
- **Checklist:** See `DEPLOYMENT_CHECKLIST.md`
- **Railway Docs:** https://docs.railway.app
- **Project README:** See `README.md`

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live backend API
- ✅ Live frontend website
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Free hosting!

**Share your live URL and enjoy!** 🚀

---

## 📝 After Deployment

- Monitor usage in Railway dashboard
- Check logs for errors
- Update code: just `git push` (auto-deploys!)
- Add custom domain if desired

---

**Your project is ready! Just follow the 4 steps above.** 🎊
