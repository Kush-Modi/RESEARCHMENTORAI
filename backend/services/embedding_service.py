import os
import time
import numpy as np
from typing import List, Any
import google.generativeai as genai

# Load Gemini API Key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Define and create base directories for embeddings cache
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBEDDINGS_DIR = os.path.join(BASE_DIR, "data", "embeddings")
os.makedirs(EMBEDDINGS_DIR, exist_ok=True)

def _embed_with_retry(texts, is_batch=False):
    """
    Calls Gemini Embedding API with exponential backoff retry logic to handle rate limits and transient errors.
    """
    max_retries = 5
    base_delay = 1.0
    
    for attempt in range(max_retries):
        try:
            # We use models/gemini-embedding-2 as the standard high-quality embedding model.
            # We enforce 768-dimensional outputs to be fully compatible with the existing FAISS IndexFlatIP(768).
            res = genai.embed_content(
                model="models/gemini-embedding-2",
                content=texts,
                output_dimensionality=768
            )
            return res["embedding"]
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            delay = base_delay * (2 ** attempt)
            print(f"Gemini embedding API call failed (attempt {attempt+1}/{max_retries}): {e}. Retrying in {delay:.2f}s...")
            time.sleep(delay)

def generate_embedding(text: str) -> np.ndarray:
    """Generates a 768-dimensional embedding for the given text using Gemini Embeddings API."""
    if not text.strip():
        # Return a zero vector if input text is empty
        return np.zeros(768, dtype=np.float32)
        
    vector_list = _embed_with_retry(text)
    return np.array(vector_list, dtype=np.float32)

def generate_paper_embedding(paper: Any) -> np.ndarray:
    """
    Generates or retrieves a cached embedding vector for a single paper.
    Combines title and abstract as the embedding source text.
    """
    filepath = os.path.join(EMBEDDINGS_DIR, f"{paper.id}.npy")
    if os.path.exists(filepath):
        try:
            vector = np.load(filepath)
            # Ensure dimension is correct
            if vector.shape == (768,):
                return vector.astype(np.float32)
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
                vector = np.load(filepath)
                if vector.shape == (768,):
                    results[idx] = vector.astype(np.float32)
                    continue
            except Exception as e:
                print(f"Error loading cached embedding for paper {paper.id}: {e}")
        
        missing_indices.append(idx)
        missing_texts.append(f"{paper.title} {paper.abstract or ''}")

    # 2. Batch-generate missing embeddings (handling Gemini's batch limit, max 100 per call)
    if missing_texts:
        chunk_size = 100
        generated_vectors = []
        
        for i in range(0, len(missing_texts), chunk_size):
            chunk = missing_texts[i:i + chunk_size]
            chunk_vectors = _embed_with_retry(chunk, is_batch=True)
            generated_vectors.extend(chunk_vectors)
            
        # 3. Cache newly generated embeddings and map to results
        for idx_in_missing, original_idx in enumerate(missing_indices):
            vector = np.array(generated_vectors[idx_in_missing], dtype=np.float32)
            results[original_idx] = vector
            
            paper_id = papers[original_idx].id
            filepath = os.path.join(EMBEDDINGS_DIR, f"{paper_id}.npy")
            try:
                np.save(filepath, vector)
            except Exception as e:
                print(f"Failed to cache embedding for paper {paper_id}: {e}")

    return results
