# Quick Start Guide - AI Fallback Feature

## Prerequisites

- Python 3.8+
- Node.js 14+
- Azure OpenAI account with API access

## Installation

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Verify openai package is installed
pip install openai azure-openai

# Create .env file with Azure credentials
```

### 2. Configure Environment Variables

Create or update `backend/.env`:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_OPENAI_DEPLOYMENT=gpt-4

# RAG Configuration (optional)
TOP_K_SIMILAR=5
MIN_SIMILARITY=0.1
```

### 3. Build Knowledge Base (if not already done)

```bash
cd backend
python scripts/build_knowledge_base_tfidf.py
```

## Testing the Feature

### Option 1: Run Test Script

```bash
cd backend
python test_ai_fallback.py
```

**Expected Output:**

```
🧪 TESTING AI FALLBACK FEATURE
============================================================

Test 1: Normal query (should find similar tickets)
------------------------------------------------------------
📊 Method: rag-tfidf
📊 Confidence: 85.23%
📊 Similar tickets found: 5
💡 Resolution: [Shows resolution based on similar tickets]

Test 2: Unusual query (should trigger AI fallback)
------------------------------------------------------------
⚠️  NO SIMILAR TICKETS - AI FALLBACK MODE
📊 Method: ai-fallback
📊 Confidence: 50.00%
📊 Similar tickets found: 0
📊 AI Generated: True
💡 Resolution: [Shows AI-generated solution]
```

### Option 2: Test via API

Start the backend:

```bash
cd backend
python app.py
```

Test with curl:

```bash
# Test unusual ticket (should trigger AI fallback)
curl -X POST http://localhost:8000/api/suggest-resolution \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Hardware Request",
    "priority": "High",
    "description": "My quantum flux capacitor is experiencing temporal displacement"
  }'
```

### Option 3: Test via Frontend

1. Start backend:

```bash
cd backend
python app.py
```

2. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Open browser to `http://localhost:5173`

4. Submit a ticket with unusual description:

   - Category: Any
   - Priority: Any
   - Description: "Holographic display synchronization failure with quantum interface"

5. Observe:
   - Yellow info banner: "No similar historical tickets found..."
   - 🤖 AI-Powered Solution header
   - Comprehensive troubleshooting steps
   - 50% confidence badge

## Verification Checklist

### Backend Console Logs

When AI fallback triggers, you should see:

```
⚠️  NO SIMILAR TICKETS - AI FALLBACK MODE
============================================================
🔍 Search time: XX.XX ms
🤖 AI Generation time: XXXX.XX ms
⚡ Total time: XXXX.XX ms
============================================================
```

### Frontend UI

When AI fallback triggers, you should see:

- [ ] 🤖 icon instead of ✨
- [ ] "AI-Powered Solution" header
- [ ] Yellow info banner with message
- [ ] 50% confidence badge
- [ ] Detailed troubleshooting steps
- [ ] Disclaimer at the bottom

### API Response

AI fallback response should include:

```json
{
  "method": "ai-fallback",
  "confidence": 0.5,
  "similar_tickets": [],
  "metadata": {
    "ai_generated": true,
    "num_similar_tickets": 0
  }
}
```

## Common Issues

### Issue: "Azure OpenAI client not initialized"

**Solution:**

1. Check `.env` file exists in backend directory
2. Verify `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_KEY` are set
3. Restart the backend server

### Issue: All queries trigger AI fallback

**Solution:**

1. Check if knowledge base exists: `backend/data/knowledge_base.pkl`
2. Build knowledge base: `python scripts/build_knowledge_base_tfidf.py`
3. Check MIN_SIMILARITY threshold (should be 0.1 or lower)

### Issue: AI generation takes too long

**This is normal!**

- AI generation takes 1-3 seconds
- It's slower than RAG mode but provides value
- Consider using GPT-3.5 for faster responses (in production)

### Issue: Generic AI responses

**Solution:**

1. Provide more detailed ticket descriptions
2. Use GPT-4 instead of GPT-3.5 (better quality)
3. Enhance the system prompt in `_generate_ai_fallback_resolution()`

## Performance Expectations

| Scenario                         | Expected Time | Method      |
| -------------------------------- | ------------- | ----------- |
| Similar tickets found            | 500-2000ms    | rag-tfidf   |
| No similar tickets (AI fallback) | 1000-3000ms   | ai-fallback |
| Azure unavailable                | <100ms        | fallback    |

## Next Steps

1. ✅ Test with various ticket types
2. ✅ Monitor AI fallback usage in metrics
3. ✅ Review AI-generated solutions for quality
4. ✅ Add successful AI solutions to knowledge base
5. ✅ Adjust MIN_SIMILARITY threshold if needed

## Support

- Detailed documentation: `backend/AI_FALLBACK_FEATURE.md`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`
- Test script: `backend/test_ai_fallback.py`

---

**Quick Start Complete! 🎉**

The AI fallback feature is now ready to provide intelligent solutions even when no similar tickets exist in your knowledge base.
