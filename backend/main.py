import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database engine and models to initialize tables
from database import engine, Base
import models  # Imports models/__init__.py to ensure models are registered
from routers.papers import router as papers_router
from routers.graph import router as graph_router
from routers.mentor import router as mentor_router
from routers.saved import router as saved_router
from services import faiss_service

# Auto-create tables in PostgreSQL (Alembic-ready setup)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully or verified.")
except Exception as e:
    print(f"Error initializing database tables: {e}")

# Initialize FAISS index
try:
    faiss_service.initialize_index()
except Exception as e:
    print(f"Error initializing FAISS index: {e}")

app = FastAPI(
    title="ResearchMentor AI API",
    description="Backend foundation for ResearchMentor AI",
    version="0.1.0",
)

# CORS setup for frontend development
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(papers_router, prefix="/papers", tags=["papers"])
app.include_router(graph_router, prefix="/graph", tags=["graph"])
app.include_router(mentor_router, prefix="/mentor", tags=["mentor"])
app.include_router(saved_router, prefix="/saved", tags=["saved"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.on_event("shutdown")
def shutdown_event():
    from services import neo4j_service
    neo4j_service.close_driver()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
