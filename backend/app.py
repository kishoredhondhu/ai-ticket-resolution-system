"""

RAG Service - Main Application

FastAPI service for ticket resolution suggestions using Retrieval-Augmented Generation.

"""


 

from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

from fastapi.responses import FileResponse

from pydantic import BaseModel

from typing import List, Optional

import os

from dotenv import load_dotenv

import logging


 

# Load environment variables

load_dotenv()


 

# Import RAG engine and metrics

from rag_engine_tfidf import RAGEngine

from metrics import metrics_tracker


 

# Setup logging

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)


 

# Initialize FastAPI app

app = FastAPI(

    title="Ticket Resolution RAG Service",

    description="Retrieval-Augmented Generation service for IT ticket resolutions",

    version="1.0.0"

)


 

# Add CORS middleware for Java backend integration

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],  # Configure appropriately for production

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


 

# Initialize RAG engine

try:

    rag_engine = RAGEngine()

    logger.info("RAG Engine initialized successfully")

except Exception as e:

    logger.error(f"Failed to initialize RAG engine: {e}")

    rag_engine = None


 

# Request/Response Models

class TicketRequest(BaseModel):

    category: str

    priority: str

    description: str


 

class SimilarTicket(BaseModel):

    ticket_id: Optional[str] = None

    category: str

    description: str

    resolution: str

    priority: Optional[str] = None

    similarity_score: float


 

class ResolutionResponse(BaseModel):

    suggested_resolution: str

    confidence: float

    similar_tickets: List[SimilarTicket]

    method: str = "rag"

    metadata: Optional[dict] = None


 

# API Endpoints


 

@app.get("/")

async def root():

    """Root endpoint with service information."""

    return {

        "service": "Ticket Resolution RAG Service",

        "version": "1.0.0",

        "status": "running" if rag_engine and rag_engine.is_ready() else "initializing",

        "endpoints": {

            "suggest_resolution": "/api/suggest-resolution",

            "health": "/health",

            "stats": "/api/stats"

        }

    }


 

@app.get("/health")

async def health_check():

    """Health check endpoint."""

    if not rag_engine or not rag_engine.is_ready():

        raise HTTPException(status_code=503, detail="RAG engine not ready")

   

    return {

        "status": "healthy",

        "knowledge_base_size": rag_engine.get_knowledge_base_size(),

        "azure_connected": rag_engine.azure_connected() if hasattr(rag_engine, 'azure_connected') else False

    }


 

@app.post("/api/suggest-resolution", response_model=ResolutionResponse)

async def suggest_resolution(request: TicketRequest):

    """

    Suggest resolution for a ticket using RAG approach.

   

    Args:

        request: Ticket details (category, priority, description)

   

    Returns:

        ResolutionResponse with suggested resolution and similar tickets

    """

    if not rag_engine or not rag_engine.is_ready():

        raise HTTPException(

            status_code=503,

            detail="RAG engine not initialized. Please run scripts/build_knowledge_base_tfidf.py first."

        )

   

    try:

        logger.info(f"Processing resolution request for category: {request.category}")

       

        # Use RAG engine to generate resolution

        result = rag_engine.suggest_resolution(

            category=request.category,

            priority=request.priority,

            description=request.description

        )

       

        return ResolutionResponse(**result)

   

    except Exception as e:

        logger.error(f"Error suggesting resolution: {e}")

        raise HTTPException(status_code=500, detail=str(e))


 

@app.get("/api/stats")

async def get_stats():

    """Get statistics about the RAG service."""

    if not rag_engine or not rag_engine.is_ready():

        raise HTTPException(status_code=503, detail="RAG engine not ready")

   

    return {

        "total_tickets": rag_engine.get_knowledge_base_size(),

        "embedding_dimension": 1536,  # Azure text-embedding-ada-002

        "top_categories": rag_engine.get_top_categories(),

        "service_status": "operational"

    }


 

@app.post("/api/reload-knowledge-base")

async def reload_knowledge_base():

    """Reload the knowledge base (admin endpoint)."""

    try:

        rag_engine.reload_knowledge_base()

        return {

            "status": "success",

            "message": "Knowledge base reloaded successfully",

            "total_tickets": rag_engine.get_knowledge_base_size()

        }

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


 

@app.get("/api/metrics")

async def get_metrics():

    """

    Get comprehensive RAG system metrics.

   

    Returns:

        - Performance metrics (response times, percentiles)

        - Quality metrics (confidence scores)

        - Success rates

        - Category-wise statistics

    """

    try:

        return metrics_tracker.get_summary()

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


 

@app.get("/api/metrics/realtime")

async def get_realtime_metrics():

    """Get real-time metrics for the last 100 queries."""

    try:

        return metrics_tracker.get_realtime_stats()

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


# Mount static files for frontend
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        # If it's an API route, let it pass through
        if full_path.startswith("api/") or full_path in ["health", "docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve index.html for all other routes (SPA routing)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend not found")
else:
    logger.warning(f"Frontend dist directory not found at {frontend_dist}")

 

if __name__ == "__main__":

    import uvicorn

   

    # Get port from environment or use default

    port = int(os.getenv("PORT", 8000))

   

    logger.info(f"Starting RAG Service on port {port}")

    uvicorn.run(app, host="0.0.0.0", port=port)


 