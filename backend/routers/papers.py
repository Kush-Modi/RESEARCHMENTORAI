from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.paper import Paper
from services.openalex_service import search_papers
from services import embedding_service, faiss_service

router = APIRouter()

# Schema for incoming OpenAlex keyword search queries
class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = Field(20, ge=1, le=100)

# Schema for semantic search requests
class SemanticSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = Field(10, ge=1, le=100)

@router.post("/search")
async def search_and_store_papers(payload: SearchRequest, db: Session = Depends(get_db)):
    """
    Search OpenAlex, save newly discovered papers to Supabase PostgreSQL,
    avoid duplicate openalex_id entries, and return the aggregated results.
    """
    if not payload.query.strip():
        return {"papers": []}

    results = await search_papers(payload.query, payload.limit)
    if not results:
        return {"papers": []}

    openalex_ids = [p["openalex_id"] for p in results]
    existing_papers = db.query(Paper).filter(Paper.openalex_id.in_(openalex_ids)).all()
    existing_map = {p.openalex_id: p for p in existing_papers}

    final_papers = []
    papers_to_insert = []

    for paper_data in results:
        openalex_id = paper_data["openalex_id"]
        if openalex_id in existing_map:
            final_papers.append(existing_map[openalex_id])
        else:
            new_paper = Paper(
                openalex_id=openalex_id,
                title=paper_data["title"],
                abstract=paper_data["abstract"],
                authors=paper_data["authors"],
                publication_year=paper_data["publication_year"],
                citation_count=paper_data["citation_count"],
                paper_url=paper_data["paper_url"],
            )
            papers_to_insert.append(new_paper)

    if papers_to_insert:
        try:
            db.add_all(papers_to_insert)
            db.commit()
            for paper in papers_to_insert:
                db.refresh(paper)
                final_papers.append(paper)
        except Exception as e:
            db.rollback()
            print(f"Error persisting new papers: {e}")
            db.rollback()
            refetched_papers = db.query(Paper).filter(Paper.openalex_id.in_(openalex_ids)).all()
            final_papers = refetched_papers

    response_papers = []
    for paper in final_papers:
        response_papers.append({
            "id": paper.id,
            "openalex_id": paper.openalex_id,
            "title": paper.title,
            "abstract": paper.abstract,
            "authors": paper.authors,
            "publication_year": paper.publication_year,
            "citation_count": paper.citation_count,
            "paper_url": paper.paper_url,
            "created_at": paper.created_at.isoformat() if paper.created_at else None
        })

    return {"papers": response_papers}

@router.post("/build-index")
async def build_faiss_index(db: Session = Depends(get_db)):
    """
    Load all papers from PostgreSQL, generate missing embedding vectors,
    build/append to the FAISS index, and save the updated index to disk.
    """
    try:
        # 1. Retrieve all ingested papers from the database
        papers = db.query(Paper).all()
        if not papers:
            return {"papers_indexed": 0}

        # 2. Index papers in FAISS (generates embeddings for missing ones)
        total_indexed = faiss_service.add_papers(papers)
        
        return {"papers_indexed": total_indexed}
    except Exception as e:
        print(f"Error building FAISS index: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to compile FAISS vector index: {str(e)}"
        )

@router.post("/semantic-search")
async def semantic_search(payload: SemanticSearchRequest, db: Session = Depends(get_db)):
    """
    Executes a semantic vector similarity search against the FAISS index.
    Generates a query embedding, queries FAISS, retrieves matching papers,
    and returns them ranked by similarity score.
    """
    if not payload.query.strip():
        return []

    try:
        # 1. Generate query embedding
        query_vector = embedding_service.generate_embedding(payload.query)

        # 2. Search FAISS index
        search_results = faiss_service.search(query_vector, payload.top_k)
        if not search_results:
            return []

        # 3. Retrieve matching database records
        paper_ids = [res[0] for res in search_results]
        papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
        papers_map = {p.id: p for p in papers}

        # 4. Rank papers according to FAISS results order
        ranked_papers = []
        for paper_id, score in search_results:
            paper = papers_map.get(paper_id)
            if not paper:
                continue

            ranked_papers.append({
                "paper": {
                    "id": paper.id,
                    "openalex_id": paper.openalex_id,
                    "title": paper.title,
                    "abstract": paper.abstract,
                    "authors": paper.authors,
                    "publication_year": paper.publication_year,
                    "citation_count": paper.citation_count,
                    "paper_url": paper.paper_url,
                    "created_at": paper.created_at.isoformat() if paper.created_at else None
                },
                "similarity_score": score
            })

        return ranked_papers
    except Exception as e:
        print(f"Error executing semantic search: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to execute semantic vector search: {str(e)}"
        )

@router.get("/{paper_id}")
async def get_paper_by_id(paper_id: int, db: Session = Depends(get_db)):
    """
    Retrieves detailed database record for a single paper by its primary key ID.
    """
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=404, 
            detail="Paper not found in local database."
        )

    return {
        "id": paper.id,
        "openalex_id": paper.openalex_id,
        "title": paper.title,
        "abstract": paper.abstract,
        "authors": paper.authors,
        "publication_year": paper.publication_year,
        "citation_count": paper.citation_count,
        "paper_url": paper.paper_url,
        "created_at": paper.created_at.isoformat() if paper.created_at else None
    }

@router.get("/{paper_id}/recommendations")
async def get_paper_recommendations(
    paper_id: int, 
    limit: Optional[int] = 10, 
    db: Session = Depends(get_db)
):
    """
    Computes and returns hybrid recommendations for a specified paper.
    Calculates weights: 60% semantic similarity, 25% OpenAlex Jaccard citation/concept overlap, 15% citation count popularity.
    """
    try:
        from services.recommendation_service import get_hybrid_recommendations
        results = await get_hybrid_recommendations(paper_id, limit, db)
        return results
    except Exception as e:
        print(f"Error computing hybrid recommendations: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to compile paper recommendations: {str(e)}"
        )
