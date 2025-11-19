# 📋 Railway Deployment Checklist

## ✅ Pre-Deployment (Complete these first)

- [ ] **Git repository initialized**

  ```bash
  git init
  ```

- [ ] **GitHub repository created**

  - Go to https://github.com/new
  - Create new repository
  - Copy repository URL

- [ ] **Files ready for commit**

  ```bash
  git add .
  git commit -m "Initial commit - Ready for Railway"
  ```

- [ ] **Code pushed to GitHub**

  ```bash
  git remote add origin <your-github-url>
  git branch -M main
  git push -u origin main
  ```

- [ ] **Environment variables documented**
  - Azure OpenAI credentials ready
  - Know your backend URL structure

---

## 🚂 Railway Setup

- [ ] **Sign up for Railway**

  - Go to https://railway.app
  - Click "Login with GitHub"
  - Authorize Railway

- [ ] **Create new project**
  - Click "New Project"
  - Select "Deploy from GitHub repo"
  - Choose your repository
  - Click "Deploy Now"

---

## ⚙️ Backend Configuration

- [ ] **Service detected**

  - Railway should auto-detect Python backend
  - Check build logs

- [ ] **Add environment variables**

  - Click on backend service
  - Go to "Variables" tab
  - Add each variable:
    ```
    AZURE_OPENAI_ENDPOINT=https://ag-new-endpoint.openai.azure.com
    AZURE_OPENAI_KEY=your-azure-api-key-here
    AZURE_OPENAI_API_VERSION=2025-01-01-preview
    AZURE_OPENAI_DEPLOYMENT=gpt-4.1
    TOP_K_SIMILAR=5
    MIN_SIMILARITY=0.6
    ```

- [ ] **Generate domain**

  - Go to Settings → Networking
  - Click "Generate Domain"
  - Copy URL (e.g., `https://your-app.railway.app`)

- [ ] **Test backend**
  - Visit: `https://your-app.railway.app/health`
  - Should return: `{"status": "healthy"}`

---

## 🎨 Frontend Configuration

- [ ] **Add frontend service**

  - Click "New Service"
  - Select "GitHub repo"
  - Choose same repository
  - Set root directory: `frontend`

- [ ] **Add environment variables**

  - Click on frontend service
  - Go to "Variables" tab
  - Add:
    ```
    VITE_API_URL=https://your-backend.railway.app
    ```
  - Replace with actual backend URL from previous step

- [ ] **Configure build settings**

  - Build command: `npm run build`
  - Output directory: `dist`
  - (Railway should auto-detect this)

- [ ] **Generate domain**

  - Go to Settings → Networking
  - Click "Generate Domain"
  - Copy URL (e.g., `https://your-frontend.railway.app`)

- [ ] **Test frontend**
  - Visit frontend URL
  - Should see your app!

---

## 🧪 Post-Deployment Testing

- [ ] **Backend health check**

  ```
  curl https://your-backend.railway.app/health
  ```

- [ ] **Backend metrics**

  ```
  curl https://your-backend.railway.app/api/stats
  ```

- [ ] **Frontend loads**

  - Open frontend URL in browser
  - No console errors

- [ ] **Frontend connects to backend**

  - Try uploading a ticket
  - Check network tab for API calls

- [ ] **AI fallback works**
  - Upload a ticket
  - Should get response (fallback or AI)

---

## 🐛 Troubleshooting

### Backend won't start

- [ ] Check "Deployments" tab for build logs
- [ ] Verify all environment variables are set
- [ ] Check for errors in logs
- [ ] Verify `requirements.txt` is correct

### Frontend won't build

- [ ] Check build logs in deployments
- [ ] Verify `VITE_API_URL` is set correctly
- [ ] Check `package.json` scripts
- [ ] Look for TypeScript errors

### Frontend can't connect to backend

- [ ] Verify `VITE_API_URL` matches backend domain
- [ ] Check backend CORS settings
- [ ] Check browser console for errors
- [ ] Verify backend is running (check health endpoint)

### Azure OpenAI not working

- [ ] This is expected (firewall issue)
- [ ] Fallback should be working
- [ ] Check backend logs for confirmation

---

## 📊 Monitoring

- [ ] **Check Railway dashboard**

  - Monitor resource usage
  - Check logs regularly
  - Watch for errors

- [ ] **Set up custom domain (optional)**
  - Go to Settings → Networking
  - Add custom domain
  - Update DNS records

---

## 💰 Cost Management

- [ ] **Monitor usage**

  - Railway free tier: $5/month credit
  - Check usage in dashboard
  - Set up usage alerts

- [ ] **Optimize if needed**
  - Scale down if over budget
  - Use sleep mode for inactive services

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Backend health endpoint returns 200
- ✅ Frontend loads without errors
- ✅ Frontend can call backend APIs
- ✅ Ticket submission works (with fallback)
- ✅ UI is responsive and functional

---

## 🎉 You're Done!

Share your live URL:

- Frontend: `https://your-frontend.railway.app`
- Backend API: `https://your-backend.railway.app`

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check backend logs in Railway dashboard
- Review deployment guide: `RAILWAY_DEPLOYMENT.md`
