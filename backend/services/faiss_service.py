import os
import json
import faiss
import numpy as np
from typing import List, Tuple, Any
from services.embedding_service import batch_generate_embeddings

# Base paths for FAISS index and mapping
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAISS_DIR = os.path.join(BASE_DIR, "data", "faiss")
os.makedirs(FAISS_DIR, exist_ok=True)

INDEX_PATH = os.path.join(FAISS_DIR, "papers.index")
MAPPING_PATH = os.path.join(FAISS_DIR, "paper_mapping.json")

# In-memory singletons for the FAISS index and mapping
_index = None
_paper_ids = []  # Index maps directly to FAISS position

def initialize_index():
    """Initializes the FAISS index by loading from disk if available, or creating a new one."""
    global _index, _paper_ids

    if os.path.exists(INDEX_PATH) and os.path.exists(MAPPING_PATH):
        try:
            load_index()
            print(f"Successfully loaded FAISS index with {len(_paper_ids)} papers.")
            return
        except Exception as e:
            print(f"Error loading FAISS files from disk: {e}. Recreating a blank index.")

    # Create flat inner product index (equivalent to Cosine Similarity when vectors are L2-normalized)
    _index = faiss.IndexFlatIP(768)
    _paper_ids = []
    print("Created a new, empty FAISS IndexFlatIP(768).")

def load_index():
    """Loads index and metadata mapping from disk."""
    global _index, _paper_ids
    _index = faiss.read_index(INDEX_PATH)
    with open(MAPPING_PATH, "r", encoding="utf-8") as f:
        _paper_ids = json.load(f)

def save_index():
    """Saves index and metadata mapping to disk."""
    global _index, _paper_ids
    if _index is not None:
        faiss.write_index(_index, INDEX_PATH)
        with open(MAPPING_PATH, "w", encoding="utf-8") as f:
            json.dump(_paper_ids, f, indent=2)

def add_papers(papers: List[Any]) -> int:
    """
    Generates embeddings, L2-normalizes, adds to FAISS index, and saves mapping data.
    Skips any papers that have already been registered in the index mapping.
    """
    global _index, _paper_ids
    if _index is None:
        initialize_index()

    # Identify and filter out papers that are already indexed
    indexed_set = set(_paper_ids)
    papers_to_add = [p for p in papers if p.id not in indexed_set]

    if not papers_to_add:
        print("All provided papers are already indexed in FAISS.")
        return len(_paper_ids)

    # 1. Generate embeddings (either loads cached npy or computes new ones)
    vectors = batch_generate_embeddings(papers_to_add)
    if not vectors:
        return len(_paper_ids)

    # 2. Structure as a single 2D float32 numpy matrix
    V = np.vstack(vectors).astype("float32")

    # 3. L2-normalize the matrix rows (essential for flat IP to serve Cosine Similarity)
    norms = np.linalg.norm(V, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    V = V / norms

    # 4. Add to FAISS index
    _index.add(V)

    # 5. Expand mapping array
    for p in papers_to_add:
        _paper_ids.append(p.id)

    # 6. Persist to disk
    save_index()
    print(f"Added {len(papers_to_add)} papers to FAISS. Current index size: {len(_paper_ids)}.")
    return len(_paper_ids)

def search(query_vector: np.ndarray, top_k: int = 10) -> List[Tuple[int, float]]:
    """
    Executes a search against the FAISS index.
    Returns a list of (paper_id, cosine_similarity_score) sorted by highest similarity.
    """
    global _index, _paper_ids
    if _index is None or _index.ntotal == 0:
        return []

    # Ensure shape is 2D matrix (1, Dimension)
    q = np.array(query_vector).astype("float32").reshape(1, -1)

    # L2-normalize query vector
    q_norm = np.linalg.norm(q)
    if q_norm > 0:
        q = q / q_norm

    # Limit search quantity to total indexed count
    k = min(top_k, _index.ntotal)
    if k <= 0:
        return []

    # FAISS search returns similarity scores and match indices
    scores, indices = _index.search(q, k)

    results = []
    for rank, pos in enumerate(indices[0]):
        if pos == -1:
            continue
        paper_id = _paper_ids[pos]
        score = float(scores[0][rank])
        results.append((paper_id, score))

    return results
