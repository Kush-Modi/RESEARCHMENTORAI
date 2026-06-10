export interface HealthResponse {
  status: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  iconName: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: "frontend" | "backend" | "core" | "storage" | "ai";
  description: string;
}

export interface Paper {
  id: number;
  openalex_id: string;
  title: string;
  abstract: string | null;
  authors: string[] | null;
  publication_year: number | null;
  citation_count: number;
  paper_url: string | null;
  created_at: string | null;
}

export interface SearchPapersResponse {
  papers: Paper[];
}

export interface SemanticSearchPaperResult {
  paper: Paper;
  similarity_score: number;
}

export interface BuildIndexResponse {
  papers_indexed: number;
}

export interface RecommendationResult {
  paper: Paper;
  recommendation_score: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  isTarget: boolean;
  properties: any;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RoadmapStage {
  concepts: string[];
  learning_objectives: string[];
  recommended_progression: string;
  recommended_papers: Paper[];
}

export interface RoadmapData {
  Beginner: RoadmapStage;
  Intermediate: RoadmapStage;
  Advanced: RoadmapStage;
  "Research Frontier": RoadmapStage;
}

export interface ConceptExplanation {
  simple_explanation: string;
  key_ideas: string[];
  common_mistakes: string[];
  related_concepts: string[];
}
