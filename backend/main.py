import os

print("STEP 0 - main.py import started")

from fastapi import FastAPI

print("STEP 1 - FastAPI imported")

from fastapi.middleware.cors import CORSMiddleware

print("STEP 2 - CORSMiddleware imported")

from dotenv import load_dotenv

print("STEP 3 - dotenv imported")

# Load environment variables
load_dotenv()

print("STEP 4 - dotenv loaded")

# Import database engine and models
print("STEP 5 - importing database")
from database import engine, Base
print("STEP 6 - database imported")

print("STEP 7 - importing models")
import models
print("STEP 8 - models imported")

print("STEP 9 - importing papers router")
from routers.papers import router as papers_router
print("STEP 10 - papers router imported")

print("STEP 11 - importing graph router")
from routers.graph import router as graph_router
print("STEP 12 - graph router imported")

print("STEP 13 - importing mentor router")
from routers.mentor import router as mentor_router
print("STEP 14 - mentor router imported")

print("STEP 15 - importing saved router")
from routers.saved import router as saved_router
print("STEP 16 - saved router imported")

print("STEP 17 - importing faiss service")
from services import faiss_service
print("STEP 18 - faiss service imported")

# Auto-create tables
try:
    print("STEP 19 - BEFORE create_all")
    Base.metadata.create_all(bind=engine)
    print("STEP 20 - AFTER create_all")
except Exception as e:
    print(f"CREATE_ALL ERROR: {e}")

# Initialize FAISS
try:
    print("STEP 21 - BEFORE FAISS INIT")
    faiss_service.initialize_index()
    print("STEP 22 - AFTER FAISS INIT")
except Exception as e:
    print(f"FAISS INIT ERROR: {e}")

print("STEP 23 - Creating FastAPI app")

app = FastAPI(
    title="ResearchMentor AI API",
    description="Backend foundation for ResearchMentor AI",
    version="0.1.0",
)

print("STEP 24 - FastAPI app created")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://researchmentorai.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("STEP 25 - Middleware added")

# Routers
app.include_router(papers_router, prefix="/papers", tags=["papers"])
print("STEP 26 - Papers router mounted")

app.include_router(graph_router, prefix="/graph", tags=["graph"])
print("STEP 27 - Graph router mounted")

app.include_router(mentor_router, prefix="/mentor", tags=["mentor"])
print("STEP 28 - Mentor router mounted")

app.include_router(saved_router, prefix="/saved", tags=["saved"])
print("STEP 29 - Saved router mounted")

@app.get("/")
async def root():
    return {"message": "ResearchMentor AI running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.on_event("shutdown")
def shutdown_event():
    print("STEP 30 - Shutdown event")
    try:
        from services import neo4j_service
        neo4j_service.close_driver()
    except Exception as e:
        print(f"Shutdown error: {e}")

print("STEP 31 - End of main.py")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)