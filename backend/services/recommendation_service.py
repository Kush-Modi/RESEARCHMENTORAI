import numpy as np
import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.paper import Paper
from services import embedding_service, faiss_service
from services.openalex_service import fetch_work_details, fetch_works_batch

async def get_hybrid_recommendations(paper_id: int, limit: int, db: Session) -> List[Dict[str, Any]]:
    """
    Computes hybrid recommendation scores for candidate papers relative to a target paper.
    Formula:
        Final Score = 0.60 * Semantic Similarity + 0.25 * Citation Similarity + 0.15 * Popularity Score
    """
    # 1. Retrieve the target paper from PostgreSQL
    target_paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not target_paper:
        print(f"Target paper ID {paper_id} not found in database.")
        return []

    # 2. Fetch detailed metadata for the target paper from OpenAlex
    target_details = await fetch_work_details(target_paper.openalex_id)
    target_refs = set(target_details.get("referenced_works", []))
    
    # Collect target concepts/topics
    target_concepts = set()
    for c in target_details.get("concepts", []):
        if c.get("id"):
            target_concepts.add(c.get("id"))
    for t in target_details.get("topics", []):
        if t.get("id"):
            target_concepts.add(t.get("id"))

    # 3. Retrieve target paper embedding
    target_vec = embedding_service.generate_paper_embedding(target_paper)

    # 4. Ensure FAISS index is initialized and loaded
    if faiss_service._index is None or faiss_service._index.ntotal == 0:
        print("FAISS index empty on recommendation request. Rebuilding...")
        all_papers = db.query(Paper).all()
        faiss_service.add_papers(all_papers)

    # Retrieve candidate papers using FAISS search
    # Fetch top 30 semantic matches (plus 1 to account for the target paper itself)
    total_db_papers = db.query(Paper).count()
    top_k = min(30, total_db_papers)
    if top_k <= 1:
        # Not enough papers to recommend
        return []

    search_results = faiss_service.search(target_vec, top_k=top_k + 1)
    
    # Filter out target paper ID
    candidate_ids = [res[0] for res in search_results if res[0] != target_paper.id]
    if not candidate_ids:
        # Fallback to fetching all other papers if FAISS is not compiled
        candidates = db.query(Paper).filter(Paper.id != target_paper.id).limit(30).all()
        candidate_ids = [c.id for c in candidates]

    if not candidate_ids:
        return []

    # Fetch PostgreSQL candidate records
    db_candidates = db.query(Paper).filter(Paper.id.in_(candidate_ids)).all()
    candidates_map = {c.id: c for c in db_candidates}

    # 5. Fetch candidate metadata from OpenAlex in a single batch call
    candidate_openalex_ids = [c.openalex_id for c in db_candidates]
    openalex_details_map = await fetch_works_batch(candidate_openalex_ids)

    # 6. Normalize Popularity Score (Log-scale citations)
    # log_pop = ln(citation_count + 1)
    # We find the maximum log_pop among candidates to normalize in range [0, 1]
    max_log_pop = 1.0
    popularity_vals = {}
    for candidate in db_candidates:
        log_pop = math.log1p(candidate.citation_count)
        popularity_vals[candidate.id] = log_pop
        if log_pop > max_log_pop:
            max_log_pop = log_pop

    recommendations = []
    for c_id in candidate_ids:
        candidate = candidates_map.get(c_id)
        if not candidate:
            continue

        # A. Semantic Similarity: Cosine similarity of MPNet vectors
        candidate_vec = embedding_service.generate_paper_embedding(candidate)
        dot_prod = np.dot(target_vec, candidate_vec)
        norm_t = np.linalg.norm(target_vec)
        norm_c = np.linalg.norm(candidate_vec)
        cos_sim = float(dot_prod / (norm_t * norm_c)) if (norm_t > 0 and norm_c > 0) else 0.0
        # Clip to [0.0, 1.0] range
        semantic_score = max(0.0, min(1.0, cos_sim))

        # B. Citation Similarity: Jaccard overlap of references & concepts
        c_details = openalex_details_map.get(candidate.openalex_id, {})
        c_refs = set(c_details.get("referenced_works", []))
        
        c_concepts = set()
        for con in c_details.get("concepts", []):
            if con.get("id"):
                c_concepts.add(con.get("id"))
        for topic in c_details.get("topics", []):
            if topic.get("id"):
                c_concepts.add(topic.get("id"))

        # Jaccard index for references (overlap / union)
        ref_union = len(target_refs | c_refs)
        ref_jaccard = len(target_refs & c_refs) / ref_union if ref_union > 0 else 0.0

        # Jaccard index for concepts/topics (overlap / union)
        concept_union = len(target_concepts | c_concepts)
        concept_jaccard = len(target_concepts & c_concepts) / concept_union if concept_union > 0 else 0.0

        # Combine Jaccard indexes
        citation_score = 0.5 * ref_jaccard + 0.5 * concept_jaccard

        # C. Popularity Score: Scale normalized log-citations
        pop_score = popularity_vals[candidate.id] / max_log_pop

        # D. Hybrid recommendation score
        final_score = (0.60 * semantic_score) + (0.25 * citation_score) + (0.15 * pop_score)

        recommendations.append({
            "paper": {
                "id": candidate.id,
                "openalex_id": candidate.openalex_id,
                "title": candidate.title,
                "authors": candidate.authors,
                "publication_year": candidate.publication_year,
                "citation_count": candidate.citation_count,
                "paper_url": candidate.paper_url,
                "abstract": candidate.abstract
            },
            "recommendation_score": final_score
        })

    # Sort final list by recommendation score descending
    recommendations.sort(key=lambda r: r["recommendation_score"], reverse=True)
    
    return recommendations[:limit]
