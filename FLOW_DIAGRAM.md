# AI Fallback Feature - Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS TICKET                      │
│              (Category, Priority, Description)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAG ENGINE - TF-IDF SEARCH                    │
│  • Vectorize query using TF-IDF                                  │
│  • Calculate cosine similarity with all tickets                  │
│  • Get top K similar tickets                                     │
│  • Filter by MIN_SIMILARITY threshold (0.1)                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                   ┌────────┴────────┐
                   │  Similar Tickets │
                   │     Found?       │
                   └────┬────────┬────┘
                        │YES     │NO
              ┌─────────┘        └─────────┐
              ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   NORMAL RAG MODE        │   │  CHECK AZURE OPENAI      │
│   (with context)         │   │  CLIENT AVAILABLE?       │
│                          │   └──────┬──────────┬────────┘
│ • Use similar tickets    │          │YES       │NO
│ • Build context prompt   │   ┌──────┘          └───────┐
│ • Call Azure OpenAI      │   ▼                         ▼
│ • Generate resolution    │ ┌───────────────┐  ┌──────────────┐
│   with examples          │ │  AI FALLBACK  │  │   GENERIC    │
│                          │ │     MODE      │  │   FALLBACK   │
│ Confidence: 70-95%       │ │               │  │              │
│ Method: "rag-tfidf"      │ │ • No context  │  │ • No AI      │
│ Similar: 3-5 tickets     │ │ • General AI  │  │ • Manual msg │
└────────┬─────────────────┘ │ • Detailed    │  │ • Contact    │
         │                   │   steps       │  │   support    │
         │                   │               │  │              │
         │                   │ Confidence:   │  │ Confidence:  │
         │                   │   50%         │  │   0%         │
         │                   │ Method:       │  │ Method:      │
         │                   │ "ai-fallback" │  │ "fallback"   │
         │                   │ Similar: 0    │  │ Similar: 0   │
         │                   └───────┬───────┘  └──────┬───────┘
         │                           │                 │
         └───────────┬───────────────┴─────────────────┘
                     │
                     ▼
         ┌─────────────────────────┐
         │   RETURN RESPONSE        │
         │   TO FRONTEND            │
         │                          │
         │ • Suggested resolution   │
         │ • Confidence score       │
         │ • Similar tickets list   │
         │ • Method indicator       │
         │ • Timing metrics         │
         │ • Metadata               │
         └────────┬─────────────────┘
                  │
                  ▼
         ┌────────────────────────────┐
         │   FRONTEND DISPLAYS        │
         │                            │
         │ Normal RAG:                │
         │   ✨ AI-Generated          │
         │   85% confidence           │
         │   Shows similar tickets    │
         │                            │
         │ AI Fallback:               │
         │   🤖 AI-Powered Solution   │
         │   50% confidence           │
         │   ⚠️ Warning banner        │
         │   No similar tickets       │
         │                            │
         │ Generic Fallback:          │
         │   ℹ️ Manual resolution     │
         │   Contact support          │
         └────────────────────────────┘
```

## Detailed Flow Diagrams

### Flow 1: Normal RAG Mode (Similar Tickets Found)

```
User Query
    │
    ├─► TF-IDF Vectorization
    │
    ├─► Cosine Similarity Calculation
    │
    ├─► Top 5 tickets with similarity > 0.1
    │
    ├─► ✅ FOUND: 5 similar tickets
    │       └─► Average similarity: 0.85
    │
    ├─► Build Context Prompt
    │       ├─► System: "You are an IT support expert..."
    │       └─► User: "Based on these examples: [tickets]..."
    │
    ├─► Call Azure OpenAI (GPT-4)
    │       └─► Temperature: 0.7, Max tokens: 500
    │
    ├─► Generate Resolution
    │       └─► Using similar ticket patterns
    │
    └─► Return Response
            ├─► Method: "rag-tfidf"
            ├─► Confidence: 0.85 (85%)
            ├─► Similar tickets: 5 items
            ├─► Timing: ~500-2000ms
            └─► Metadata: {model: "gpt-4", num_similar: 5}
```

### Flow 2: AI Fallback Mode (No Similar Tickets)

```
User Query (Unusual/Unique)
    │
    ├─► TF-IDF Vectorization
    │
    ├─► Cosine Similarity Calculation
    │
    ├─► Top 5 tickets all have similarity < 0.1
    │
    ├─► ❌ NOT FOUND: 0 similar tickets
    │       └─► All scores below threshold
    │
    ├─► Check Azure OpenAI Client
    │       └─► ✅ Available
    │
    ├─► Trigger AI Fallback Mode
    │       └─► Log: "NO SIMILAR TICKETS - AI FALLBACK MODE"
    │
    ├─► Build Fallback Prompt
    │       ├─► System: "Expert IT support with broad knowledge..."
    │       └─► User: "Provide troubleshooting for [issue]..."
    │               └─► No similar ticket examples
    │
    ├─► Call Azure OpenAI (GPT-4)
    │       └─► Temperature: 0.7, Max tokens: 800 (longer!)
    │
    ├─► Generate AI Solution
    │       ├─► Initial diagnostics
    │       ├─► Common solutions
    │       ├─► Advanced troubleshooting
    │       ├─► Escalation path
    │       └─► Safety warnings
    │
    ├─► Add Disclaimer
    │       └─► "⚠️ AI-Generated Solution (No similar tickets)"
    │
    └─► Return Response
            ├─► Method: "ai-fallback"
            ├─► Confidence: 0.5 (50%)
            ├─► Similar tickets: [] (empty)
            ├─► Timing: ~1000-3000ms
            └─► Metadata: {ai_generated: true, num_similar: 0}
```

### Flow 3: Generic Fallback (Azure Unavailable)

```
User Query (Unusual/Unique)
    │
    ├─► TF-IDF Vectorization
    │
    ├─► Cosine Similarity Calculation
    │
    ├─► ❌ NOT FOUND: 0 similar tickets
    │
    ├─► Check Azure OpenAI Client
    │       └─► ❌ NOT Available (credentials missing/error)
    │
    ├─► Use Generic Fallback
    │       └─► Static message template
    │
    └─► Return Response
            ├─► Method: "fallback"
            ├─► Confidence: 0.0 (0%)
            ├─► Similar tickets: [] (empty)
            ├─► Message: "No similar tickets found..."
            │              "Configure Azure OpenAI..."
            ├─► Timing: <100ms (instant)
            └─► Metadata: {azure_unavailable: true}
```

## Decision Tree

```
                        START
                          │
                          ▼
                   [Query Received]
                          │
                          ▼
                 [Search Similar Tickets]
                          │
                ┌─────────┴─────────┐
                │                   │
          Similar Found?        Similar Found?
              YES                   NO
                │                   │
                ▼                   ▼
         [Use RAG Mode]      [Azure Available?]
                │              ┌────┴────┐
                │            YES        NO
                │             │          │
                │             ▼          ▼
                │      [AI Fallback]  [Generic]
                │             │          │
                └─────┬───────┴──────────┘
                      │
                      ▼
               [Return Response]
                      │
                      ▼
                [Display to User]
                      │
                      ▼
                     END
```

## Response Time Comparison

```
┌──────────────────┬──────────┬──────────────┬────────────┐
│      Mode        │  Search  │  Generation  │   Total    │
├──────────────────┼──────────┼──────────────┼────────────┤
│ Normal RAG       │  15-50ms │  500-2000ms  │  515-2050ms│
│ AI Fallback      │  15-50ms │ 1000-3000ms  │ 1015-3050ms│
│ Generic Fallback │  15-50ms │      0ms     │   15-50ms  │
└──────────────────┴──────────┴──────────────┴────────────┘

    Fast ←────────────────────────────────────→ Slow
    |_______________|_______________|_______________|
         Generic        Normal RAG      AI Fallback
```

## Confidence Levels

```
High Confidence (70-95%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Normal RAG Mode - Similar tickets found
│ Strong evidence from historical data
│ Context-aware AI generation
└────────────────────────────────────────────────

Moderate Confidence (40-60%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ AI Fallback Mode - No similar tickets
│ General IT knowledge application
│ Comprehensive but not specific
└────────────────────────────────────────────────

Low Confidence (0%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Generic Fallback - Azure unavailable
│ Static message only
│ Manual intervention required
└────────────────────────────────────────────────
```

## Feature Toggle Logic

```python
# Pseudocode for feature logic

if similar_tickets.exists():
    # Normal RAG mode
    method = "rag-tfidf"
    confidence = avg_similarity  # 0.7 - 0.95
    use_context = True

elif azure_client.available():
    # AI Fallback mode
    method = "ai-fallback"
    confidence = 0.5  # Fixed moderate confidence
    use_context = False
    generate_from_general_knowledge()

else:
    # Generic fallback
    method = "fallback"
    confidence = 0.0
    return_static_message()
```

## Key Metrics Tracked

```
┌─────────────────────────────────────────┐
│         Metrics Dashboard               │
├─────────────────────────────────────────┤
│                                         │
│  Total Queries: 1,000                   │
│                                         │
│  By Method:                             │
│  ├─ rag-tfidf:    850 (85%)            │
│  ├─ ai-fallback:  130 (13%)            │
│  └─ fallback:      20 (2%)             │
│                                         │
│  Avg Response Time:                     │
│  ├─ rag-tfidf:    1,250ms              │
│  ├─ ai-fallback:  2,100ms              │
│  └─ fallback:       35ms               │
│                                         │
│  Avg Confidence:                        │
│  ├─ rag-tfidf:    0.82 (82%)           │
│  ├─ ai-fallback:  0.50 (50%)           │
│  └─ fallback:     0.00 (0%)            │
│                                         │
└─────────────────────────────────────────┘
```

---

**Visual Flow Complete! 🎨**

This diagram shows how the AI fallback feature integrates seamlessly with the existing RAG system.
