from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import neo4j_service

router = APIRouter()

@router.post("/build")
async def build_knowledge_graph(db: Session = Depends(get_db)):
    """
    Reads PostgreSQL papers, fetches metadata details from OpenAlex,
    and constructs the interactive citation knowledge graph in Neo4j.
    """
    try:
        count = await neo4j_service.build_graph_from_postgres(db)
        return {"papers_synchronized": count}
    except Exception as e:
        print(f"Error building Neo4j knowledge graph: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to synchronize Neo4j citation knowledge graph: {str(e)}"
        )

@router.get("/paper/{paper_id}")
async def get_paper_citation_graph(paper_id: int):
    """
    Retrieves the 1-hop subgraph around a specified paper ID.
    Returns format mapping for visual graph networks (nodes, edges).
    """
    try:
        graph_data = neo4j_service.get_paper_graph(paper_id)
        if not graph_data["nodes"]:
            raise HTTPException(
                status_code=404,
                detail="Paper node not found in Neo4j graph database. Run /graph/build first."
            )
        return graph_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching paper citation graph: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve paper subgraph from Neo4j: {str(e)}"
        )
