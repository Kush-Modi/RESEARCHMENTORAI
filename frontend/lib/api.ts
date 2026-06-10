import { 
  HealthResponse, 
  SearchPapersResponse, 
  SemanticSearchPaperResult, 
  BuildIndexResponse,
  Paper,
  RecommendationResult,
  GraphData,
  RoadmapData,
  ConceptExplanation
} from "../types";

/**
 * Checks the status of the backend API.
 * Returns true if the backend returns a 200 status with {"status": "ok"}, false otherwise.
 */
export async function checkBackendHealth(): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const res = await fetch(`${apiUrl}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as HealthResponse;
      return data.status === "ok";
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Searches for papers using the backend service.
 * Connects to POST /papers/search and returns list of papers.
 */
export async function searchPapers(query: string, limit: number = 20): Promise<SearchPapersResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/papers/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch papers: ${res.statusText}`);
  }

  return (await res.json()) as SearchPapersResponse;
}

/**
 * Searches papers semantically using the backend FAISS index and sentence-transformers.
 */
export async function semanticSearchPapers(query: string, topK: number = 10): Promise<SemanticSearchPaperResult[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/papers/semantic-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!res.ok) {
    throw new Error(`Failed to search semantically: ${res.statusText}`);
  }

  return (await res.json()) as SemanticSearchPaperResult[];
}

/**
 * Triggers building/updating the backend FAISS index.
 */
export async function buildIndex(): Promise<BuildIndexResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/papers/build-index`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to build FAISS index: ${res.statusText}`);
  }

  return (await res.json()) as BuildIndexResponse;
}

/**
 * Fetches detail record for a single paper from database.
 */
export async function fetchPaperDetails(id: string | number): Promise<Paper> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/papers/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch paper details: ${res.statusText}`);
  }

  return (await res.json()) as Paper;
}

/**
 * Fetches hybrid recommendations for a given paper database ID.
 */
export async function fetchPaperRecommendations(id: string | number, limit: number = 10): Promise<RecommendationResult[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/papers/${id}/recommendations?limit=${limit}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
  }

  return (await res.json()) as RecommendationResult[];
}

/**
 * Triggers Neo4j citation graph synchronization from stored PostgreSQL papers.
 */
export async function buildGraph(): Promise<{ papers_synchronized: number }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/graph/build`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to build citation graph: ${res.statusText}`);
  }

  return (await res.json()) as { papers_synchronized: number };
}

/**
 * Retrieves Neo4j subgraph nodes and edges for visual graph rendering.
 */
export async function fetchPaperGraph(id: string | number): Promise<GraphData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/graph/paper/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch paper graph: ${res.statusText}`);
  }

  return (await res.json()) as GraphData;
}

/**
 * Triggers progressive AI learning roadmap generation for a given research topic.
 */
export async function generateRoadmap(topic: string): Promise<RoadmapData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/mentor/roadmap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate learning roadmap: ${res.statusText}`);
  }

  return (await res.json()) as RoadmapData;
}

/**
 * Fetches structured research explanation for a specific concept.
 */
export async function explainConcept(concept: string): Promise<ConceptExplanation> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/mentor/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ concept }),
  });

  if (!res.ok) {
    throw new Error(`Failed to explain concept: ${res.statusText}`);
  }

  return (await res.json()) as ConceptExplanation;
}

/**
 * Bookmarks a paper for the authenticated user.
 */
export async function savePaper(paperId: number, token: string): Promise<{ status: string; id: number }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/saved/papers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ paper_id: paperId })
  });

  if (!res.ok) {
    throw new Error(`Failed to bookmark paper: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Unbookmarks a paper.
 */
export async function unsavePaper(paperId: number, token: string): Promise<{ status: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/saved/papers/${paperId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to remove paper bookmark: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Retrieves all bookmarked papers for the user.
 */
export async function fetchSavedPapers(token: string): Promise<Paper[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/saved/papers`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch saved papers: ${res.statusText}`);
  }

  return await res.json();
}

export async function saveRoadmap(roadmapId: number | undefined, token: string, topic?: string): Promise<{ status: string; id: number }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/saved/roadmaps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ 
      roadmap_id: roadmapId,
      topic: topic
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to save learning roadmap: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Unbookmarks a learning roadmap.
 */
export async function unsaveRoadmap(roadmapId: number, token: string): Promise<{ status: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/saved/roadmaps/${roadmapId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to unsave learning roadmap: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Retrieves all bookmarked roadmaps.
 */
export async function fetchSavedRoadmaps(token: string): Promise<Array<{ id: number; topic: string; roadmap_json: any; created_at: string }>> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/saved/roadmaps`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch saved roadmaps: ${res.statusText}`);
  }

  return await res.json();
}
