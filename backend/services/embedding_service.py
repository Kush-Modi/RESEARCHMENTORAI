import os
import numpy as np
from typing import List, Any
from sentence_transformers import SentenceTransformer

# Define and create base directories for embeddings cache
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBEDDINGS_DIR = os.path.join(BASE_DIR, "data", "embeddings")
os.makedirs(EMBEDDINGS_DIR, exist_ok=True)

# Singleton placeholder for the sentence-transformer model
_model = None

def _get_model() -> SentenceTransformer:
    """Lazy-loads and returns the sentence-transformer model singleton."""
    global _model
    if _model is None:
        model_name = "sentence-transformers/all-mpnet-base-v2"
        print(f"Loading SentenceTransformer model: {model_name}...")
        _model = SentenceTransformer(model_name)
        print("SentenceTransformer model loaded.")
    return _model

def generate_embedding(text: str) -> np.ndarray:
    """Generates a 768-dimensional embedding for the given text."""
    model = _get_model()
    # model.encode returns a numpy array
    return model.encode(text)

def generate_paper_embedding(paper: Any) -> np.ndarray:
    """
    Generates or retrieves a cached embedding vector for a single paper.
    Combines title and abstract as the embedding source text.
    """
    filepath = os.path.join(EMBEDDINGS_DIR, f"{paper.id}.npy")
    if os.path.exists(filepath):
        try:
            return np.load(filepath)
        except Exception as e:
            print(f"Error loading cached embedding for paper {paper.id}: {e}")

    # Combine title and abstract
    text = f"{paper.title} {paper.abstract or ''}"
    vector = generate_embedding(text)
    
    # Cache to local disk
    try:
        np.save(filepath, vector)
    except Exception as e:
        print(f"Failed to cache embedding for paper {paper.id}: {e}")

    return vector

def batch_generate_embeddings(papers: List[Any]) -> List[np.ndarray]:
    """
    Generates or retrieves embeddings for a list of papers in batch.
    Loads cached npy files where available, and performs batch inference on the rest.
    """
    results = [None] * len(papers)
    missing_indices = []
    missing_texts = []

    # 1. Identify which papers need embeddings generated
    for idx, paper in enumerate(papers):
        filepath = os.path.join(EMBEDDINGS_DIR, f"{paper.id}.npy")
        if os.path.exists(filepath):
            try:
                results[idx] = np.load(filepath)
            except Exception as e:
                print(f"Error loading cached embedding for paper {paper.id}: {e}")
                missing_indices.append(idx)
                missing_texts.append(f"{paper.title} {paper.abstract or ''}")
        else:
            missing_indices.append(idx)
            missing_texts.append(f"{paper.title} {paper.abstract or ''}")

    # 2. Batch-generate missing embeddings
    if missing_texts:
        model = _get_model()
        # Batch inference is significantly faster than single requests
        generated_vectors = model.encode(missing_texts, batch_size=32, show_progress_bar=False)
        
        # 3. Cache newly generated embeddings and map to results
        for idx_in_missing, original_idx in enumerate(missing_indices):
            vector = generated_vectors[idx_in_missing]
            results[original_idx] = vector
            
            paper_id = papers[original_idx].id
            filepath = os.path.join(EMBEDDINGS_DIR, f"{paper_id}.npy")
            try:
                np.save(filepath, vector)
            except Exception as e:
                print(f"Failed to cache embedding for paper {paper_id}: {e}")

    return results
