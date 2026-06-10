from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.roadmap import Roadmap
from models.paper import Paper
from services.gemini_service import generate_roadmap_ai, generate_concept_explanation_ai
from services.embedding_service import generate_embedding
from services import faiss_service

router = APIRouter()

class RoadmapRequest(BaseModel):
    topic: str

class ExplainRequest(BaseModel):
    concept: str

@router.post("/roadmap")
async def get_roadmap(req: RoadmapRequest, db: Session = Depends(get_db)):
    """
    Retrieves or generates a 4-stage progressive learning roadmap for a topic.
    Integrates matching papers from the local database for each stage dynamically.
    """
    topic_stripped = req.topic.strip()
    if not topic_stripped:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    # Normalize topic key for database caching
    topic_normalized = topic_stripped.lower()

    # 1. Query database cache
    cached_roadmap = db.query(Roadmap).filter(Roadmap.topic == topic_normalized).first()
    
    if cached_roadmap:
        roadmap_data = cached_roadmap.roadmap_json
    else:
        # Generate fresh roadmap using Gemini
        try:
            roadmap_data = generate_roadmap_ai(topic_stripped)
            # Save raw structure to cache
            new_cache = Roadmap(topic=topic_normalized, roadmap_json=roadmap_data)
            db.add(new_cache)
            db.commit()
        except Exception as e:
            print(f"Error generating AI roadmap: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate roadmap from AI mentor: {str(e)}"
            )

    # 2. Dynamic integration of matching papers via FAISS semantic search
    compiled_roadmap = {}
    for stage_name, stage_info in roadmap_data.items():
        concepts = stage_info.get("concepts", [])
        
        recommended_papers = []
        if concepts:
            concepts_query = ", ".join(concepts)
            try:
                # Generate embedding for the concept list of this stage
                query_vector = generate_embedding(concepts_query)
                # Query FAISS index for top 3 matching papers
                matches = faiss_service.search(query_vector, top_k=3)
                
                # Fetch matching Paper objects from PostgreSQL
                for paper_id, score in matches:
                    paper = db.query(Paper).filter(Paper.id == paper_id).first()
                    if paper:
                        recommended_papers.append({
                            "id": paper.id,
                            "openalex_id": paper.openalex_id,
                            "title": paper.title,
                            "authors": paper.authors,
                            "publication_year": paper.publication_year,
                            "citation_count": paper.citation_count,
                            "paper_url": paper.paper_url,
                            "abstract": paper.abstract
                        })
            except Exception as e:
                # Log error and proceed with empty list to maintain stability
                print(f"Error matching papers for stage {stage_name}: {e}")

        # Construct final stage response dictionary
        compiled_roadmap[stage_name] = {
            "concepts": concepts,
            "learning_objectives": stage_info.get("learning_objectives", []),
            "recommended_progression": stage_info.get("recommended_progression", ""),
            "recommended_papers": recommended_papers
        }

    return compiled_roadmap

@router.post("/explain")
async def explain_concept(req: ExplainRequest):
    """
    Uses Gemini to return a structured explanation of a specific learning concept.
    """
    concept_stripped = req.concept.strip()
    if not concept_stripped:
        raise HTTPException(status_code=400, detail="Concept name cannot be empty.")

    try:
        explanation = generate_concept_explanation_ai(concept_stripped)
        return explanation
    except Exception as e:
        print(f"Error generating concept explanation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch AI concept explanation: {str(e)}"
        )
