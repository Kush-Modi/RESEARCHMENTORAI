import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.paper import Paper
from models.roadmap import Roadmap
from models.saved_content import SavedPaper, SavedRoadmap

router = APIRouter()
security = HTTPBearer()

# Pydantic schemas
class SavePaperRequest(BaseModel):
    paper_id: int

class SaveRoadmapRequest(BaseModel):
    roadmap_id: int = None
    topic: str = None

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verifies the Supabase Access Token (JWT) by calling the Supabase auth/v1/user API.
    Returns the Supabase user UUID if the token is valid.
    """
    token = credentials.credentials
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_anon_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase environment configuration variables are not set on the backend."
        )

    headers = {
        "apikey": supabase_anon_key,
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(f"{supabase_url}/auth/v1/user", headers=headers, timeout=5)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid, expired, or malformed authentication credentials."
            )
        
        user_data = response.json()
        user_id = user_data.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is valid but does not contain a valid user ID."
            )
        return user_id
    except requests.exceptions.RequestException as e:
        print(f"Failed to connect to Supabase Auth API: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication server is currently unreachable. Please try again later."
        )

# Paper saved content endpoints
@router.post("/papers", status_code=status.HTTP_201_CREATED)
async def save_paper(req: SavePaperRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    # Check if paper exists
    paper = db.query(Paper).filter(Paper.id == req.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found in database.")

    # Check if already saved
    existing = db.query(SavedPaper).filter(
        SavedPaper.user_id == user_id, 
        SavedPaper.paper_id == req.paper_id
    ).first()
    if existing:
        return {"status": "already_saved", "id": existing.id}

    # Save paper
    saved = SavedPaper(user_id=user_id, paper_id=req.paper_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"status": "saved", "id": saved.id}

@router.delete("/papers/{paper_id}")
async def unsave_paper(paper_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    record = db.query(SavedPaper).filter(
        SavedPaper.user_id == user_id,
        SavedPaper.paper_id == paper_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Bookmark not found for this user.")

    db.delete(record)
    db.commit()
    return {"status": "unsaved"}

@router.get("/papers")
async def get_saved_papers(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    records = db.query(SavedPaper).filter(SavedPaper.user_id == user_id).all()
    papers = []
    for r in records:
        paper = db.query(Paper).filter(Paper.id == r.paper_id).first()
        if paper:
            papers.append({
                "id": paper.id,
                "openalex_id": paper.openalex_id,
                "title": paper.title,
                "authors": paper.authors,
                "publication_year": paper.publication_year,
                "citation_count": paper.citation_count,
                "paper_url": paper.paper_url,
                "abstract": paper.abstract
            })
    return papers

# Roadmap saved content endpoints
@router.post("/roadmaps", status_code=status.HTTP_201_CREATED)
async def save_roadmap(req: SaveRoadmapRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    if req.roadmap_id:
        roadmap = db.query(Roadmap).filter(Roadmap.id == req.roadmap_id).first()
    elif req.topic:
        topic_normalized = req.topic.strip().lower()
        roadmap = db.query(Roadmap).filter(Roadmap.topic == topic_normalized).first()
    else:
        raise HTTPException(status_code=400, detail="Either roadmap_id or topic must be specified.")

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found in database.")

    # Check if already saved
    existing = db.query(SavedRoadmap).filter(
        SavedRoadmap.user_id == user_id, 
        SavedRoadmap.roadmap_id == roadmap.id
    ).first()
    if existing:
        return {"status": "already_saved", "id": existing.id, "roadmap_id": roadmap.id}

    # Save roadmap
    saved = SavedRoadmap(user_id=user_id, roadmap_id=roadmap.id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"status": "saved", "id": saved.id, "roadmap_id": roadmap.id}

@router.delete("/roadmaps/{roadmap_id}")
async def unsave_roadmap(roadmap_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    record = db.query(SavedRoadmap).filter(
        SavedRoadmap.user_id == user_id,
        SavedRoadmap.roadmap_id == roadmap_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Saved roadmap not found for this user.")

    db.delete(record)
    db.commit()
    return {"status": "unsaved"}

@router.get("/roadmaps")
async def get_saved_roadmaps(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    records = db.query(SavedRoadmap).filter(SavedRoadmap.user_id == user_id).all()
    roadmaps = []
    for r in records:
        roadmap = db.query(Roadmap).filter(Roadmap.id == r.roadmap_id).first()
        if roadmap:
            roadmaps.append({
                "id": roadmap.id,
                "topic": roadmap.topic,
                "roadmap_json": roadmap.roadmap_json,
                "created_at": roadmap.created_at
            })
    return roadmaps
