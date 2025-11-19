# 🎫 AI-Powered IT Ticket Resolution System

An intelligent ticket resolution system using RAG (Retrieval-Augmented Generation) with AI fallback capabilities.

## 🌟 Features

- ✅ **AI-Powered Resolution Suggestions** - Uses Azure OpenAI for intelligent responses
- ✅ **RAG Engine** - Retrieves similar historical tickets for context
- ✅ **Smart Fallback** - Provides helpful guidance when AI is unavailable
- ✅ **TF-IDF Similarity Search** - Fast and efficient ticket matching
- ✅ **Metrics Tracking** - Monitor system performance
- ✅ **Modern UI** - React + TypeScript + Vite frontend

---

## 🏗️ Architecture

```
frontend/          # React + TypeScript + Vite
backend/           # FastAPI + Python
  ├── app.py                      # Main API server
  ├── rag_engine_tfidf.py        # RAG engine implementation
  ├── metrics.py                  # Performance tracking
  └── data/                       # Knowledge base
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd Hackathon_Project
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env with your Azure OpenAI credentials

# Run backend
python app.py
```

Backend runs on: http://localhost:8000

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs on: http://localhost:5173

---

## 🌐 Deploy to Railway

**Full deployment guide:** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

### Quick Deploy Steps:

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add environment variables (see deployment guide)
   - Deploy!

---

## 🔧 Configuration

### Backend Environment Variables (.env)

```properties
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
TOP_K_SIMILAR=5
MIN_SIMILARITY=0.6
PORT=8000
```

### Frontend Environment Variables

```properties
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## 📊 API Endpoints

### Health Check

```
GET /health
```

### Suggest Resolution

```
POST /api/suggest-resolution
Body: {
  "ticket_id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "string"
}
```

### Get Metrics

```
GET /api/metrics
```

### Get Stats

```
GET /api/stats
```

---

## 🛡️ AI Fallback System

When Azure OpenAI is unavailable (network issues, firewall, etc.), the system automatically:

1. ✅ Searches for similar historical tickets
2. ✅ Provides generic troubleshooting steps
3. ✅ Gives category-specific guidance
4. ✅ Shows next steps for user

**No errors shown to end users!**

---

## 🐛 Troubleshooting

### Backend won't start

- Check Python version: `python --version` (need 3.11+)
- Verify .env file exists with correct values
- Check logs for errors

### Frontend can't connect to backend

- Verify backend is running on port 8000
- Check CORS settings in backend
- Update `VITE_API_URL` in frontend config

### Azure OpenAI errors (403 Forbidden)

- This is likely a firewall issue
- Connect to company VPN if available
- Contact IT to whitelist your IP
- **System works with fallback even without Azure access!**

---

## 📝 Project Structure

```
Hackathon_Project/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── rag_engine_tfidf.py   # RAG engine
│   ├── metrics.py             # Metrics tracking
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (not in git)
│   └── data/
│       └── rag_metrics.json   # Performance data
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── api/              # API clients
│   │   ├── hooks/            # Custom hooks
│   │   └── config/           # Configuration
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── .gitignore
├── README.md
└── RAILWAY_DEPLOYMENT.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Azure OpenAI for AI capabilities
- FastAPI for backend framework
- React + Vite for frontend
- Railway for easy deployment

---

## 📞 Support

For issues or questions:

- Open a GitHub issue
- Contact the development team

---

## 🎯 Roadmap

- [ ] Add user authentication
- [ ] Implement ticket history tracking
- [ ] Add more AI models support
- [ ] Enhance UI/UX
- [ ] Add real-time notifications
- [ ] Implement feedback loop for ML improvements

---

**Built with ❤️ for better IT support**
