// API Configuration

export const API_CONFIG = {
  // RAG Service (Python FastAPI)
  // Use relative URL in production (served from same backend), localhost in development
  RAG_SERVICE_URL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "" : "http://localhost:8000"),

  // Legacy backend (if needed)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",

  ENDPOINTS: {
    // RAG Service Endpoints

    SUGGEST_RESOLUTION: "/api/suggest-resolution",

    RAG_HEALTH: "/health",

    RAG_STATS: "/api/stats",

    RAG_METRICS: "/api/metrics",

    RAG_RELOAD: "/api/reload-knowledge-base",

    // Legacy endpoints (if needed)

    PDF_TO_TEXT: "/openai/pdf-to-text",

    OCR_TO_TEXT: "/openai/ocr-to-text",

    GET_TICKETS: "/api/tickets",

    GET_TICKET: "/api/suggest-resolution",
  },

  TIMEOUT: 30000, // 30 seconds
};

export default API_CONFIG;
