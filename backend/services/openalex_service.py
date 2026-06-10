import httpx
from typing import List, Dict, Any

async def search_papers(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Queries the OpenAlex API for works matching the given search query.
    Reconstructs the abstract from the inverted index and returns structured objects.
    """
    url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "per_page": limit,
    }
    headers = {
        "User-Agent": "ResearchMentorAI/0.1.0 (mailto:kushmodi.0505@gmail.com)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
    except Exception as e:
        print(f"Error querying OpenAlex API: {e}")
        return []

    parsed_papers = []
    for work in results:
        openalex_id = work.get("id")
        if not openalex_id:
            continue

        # Extract title
        title = work.get("title") or "Untitled Paper"

        # Reconstruct abstract from inverted index
        abstract = ""
        inv_index = work.get("abstract_inverted_index")
        if inv_index:
            try:
                positions = {}
                for word, idxs in inv_index.items():
                    for idx in idxs:
                        positions[idx] = word
                abstract = " ".join([positions[i] for i in sorted(positions.keys())])
            except Exception:
                abstract = ""

        # Extract authors
        authorships = work.get("authorships", [])
        authors = []
        for a in authorships:
            author_info = a.get("author")
            if author_info and author_info.get("display_name"):
                authors.append(author_info.get("display_name"))

        # Extract publication year
        publication_year = work.get("publication_year")

        # Extract citations
        citation_count = work.get("cited_by_count", 0)

        # Extract landing page URL or DOI
        paper_url = work.get("doi") or ""
        if not paper_url:
            primary_location = work.get("primary_location") or {}
            paper_url = primary_location.get("landing_page_url") or ""

        parsed_papers.append({
            "openalex_id": openalex_id,
            "title": title,
            "abstract": abstract,
            "authors": authors,
            "publication_year": publication_year,
            "citation_count": citation_count,
            "paper_url": paper_url
        })

    return parsed_papers

async def fetch_work_details(openalex_id: str) -> Dict[str, Any]:
    """
    Fetches detailed metadata (including referenced_works, concepts, topics)
    for a single OpenAlex work ID.
    """
    work_id = openalex_id.split("/")[-1]
    url = f"https://api.openalex.org/works/{work_id}"
    headers = {
        "User-Agent": "ResearchMentorAI/0.1.0 (mailto:kushmodi.0505@gmail.com)"
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Error fetching work details for {openalex_id}: {e}")
        return {}

async def fetch_works_batch(openalex_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Fetches detailed metadata for multiple OpenAlex work IDs in a single batch
    call using the openalex_id filter (chunked to 20 to respect query string length limits).
    Returns a dictionary mapping openalex_id -> work_details.
    """
    if not openalex_ids:
        return {}

    chunk_size = 20
    results_map = {}
    headers = {
        "User-Agent": "ResearchMentorAI/0.1.0 (mailto:kushmodi.0505@gmail.com)"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            for i in range(0, len(openalex_ids), chunk_size):
                chunk = openalex_ids[i:i+chunk_size]
                # Filter join format e.g. openalex_id:https://openalex.org/W1|https://openalex.org/W2
                filter_str = "|".join(chunk)
                url = f"https://api.openalex.org/works?filter=openalex_id:{filter_str}"
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()
                for work in data.get("results", []):
                    results_map[work.get("id")] = work
    except Exception as e:
        print(f"Error fetching works batch: {e}")

    return results_map
