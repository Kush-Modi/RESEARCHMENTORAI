"use client";

import React, { useState, useEffect, use } from "react";
import { 
  fetchPaperDetails, 
  fetchPaperRecommendations, 
  fetchSavedPapers, 
  savePaper, 
  unsavePaper 
} from "../../../../lib/api";
import { Paper, RecommendationResult } from "../../../../types";
import { useAuth } from "../../../../context/AuthProvider";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppPaperDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const paperId = resolvedParams.id;

  const { user, session } = useAuth();
  const router = useRouter();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [savedPaperIds, setSavedPaperIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailsRes, recommendationsRes] = await Promise.all([
          fetchPaperDetails(paperId),
          fetchPaperRecommendations(paperId, 10),
        ]);
        setPaper(detailsRes);
        setRecommendations(recommendationsRes || []);
      } catch (err: any) {
        setError(err.message || "Failed to load paper details and recommendations.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [paperId]);

  useEffect(() => {
    if (user && session?.access_token) {
      fetchSavedPapers(session.access_token)
        .then((papers) => {
          setSavedPaperIds(new Set(papers.map((p) => p.id)));
        })
        .catch((err) => console.error("Error loading saved papers:", err));
    }
  }, [user, session]);

  const handleToggleSavePaper = async (id: number) => {
    if (!session?.access_token) return;

    const isSaved = savedPaperIds.has(id);
    try {
      if (isSaved) {
        await unsavePaper(id, session.access_token);
        setSavedPaperIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await savePaper(id, session.access_token);
        setSavedPaperIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    } catch (err: any) {
      console.error("Failed to toggle paper bookmark:", err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push("/app/search")}
          className="inline-flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-wider transition-colors cursor-pointer group"
        >
          <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search index
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-zinc-900/60 bg-black/40">
          <div className="w-8 h-8 rounded-full border border-zinc-850 border-t-[#2563EB] animate-spin" />
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Scanning metadata repository...</p>
        </div>
      )}

      {/* Error notification */}
      {error && !loading && (
        <div className="border border-rose-955 bg-rose-955/5 text-rose-300 p-4 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Document Details */}
      {paper && !loading && !error && (
        <div className="flex flex-col gap-10">
          <article className="border border-zinc-900 bg-zinc-950/10 p-8 relative flex flex-col gap-6">
            
            {/* Bookmark button */}
            <button
              onClick={() => handleToggleSavePaper(paper.id)}
              className="absolute right-6 top-6 p-2 text-zinc-600 hover:text-white transition-colors cursor-pointer"
              title="Toggle Bookmark"
            >
              <svg className={`w-4 h-4 ${savedPaperIds.has(paper.id) ? "fill-[#2563EB] text-[#2563EB]" : "fill-none text-zinc-550"}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">[ ARTICLE METADATA SHEET ]</span>

            <h1 className="text-2xl font-bold tracking-tight text-white leading-snug pr-8 font-sans">
              {paper.title}
            </h1>

            <p className="text-xs text-zinc-400 font-mono">
              {paper.authors?.join(", ") || "Unknown Authors"}
            </p>

            <div className="flex flex-wrap gap-4 items-center text-[10px] font-mono text-zinc-550 border-t border-b border-zinc-900 py-4">
              {paper.publication_year && <span>PUBLICATION YEAR: {paper.publication_year}</span>}
              <span>CITATIONS: {paper.citation_count}</span>
              <span>OPENALEX ID: {paper.openalex_id.split("/").pop()}</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">ABSTRACT DESCRIPTION</span>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {paper.abstract || "No abstract text cached in system."}
              </p>
            </div>

            {/* Citations and Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-zinc-900/60 mt-2">
              <button
                onClick={() => router.push(`/app/graph/${paper.id}`)}
                className="inline-flex items-center justify-center gap-2 border border-zinc-850 hover:border-[#2563EB] text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white py-2.5 px-4 transition-all duration-300 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                View citation graph network
              </button>

              {paper.paper_url && (
                <a
                  href={paper.paper_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-850 hover:border-white text-[10px] font-mono uppercase tracking-wider text-[#2563EB] hover:text-white py-2.5 px-4 transition-all duration-300 cursor-pointer"
                >
                  Open publisher link
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </article>

          {/* Recommendations Area */}
          <div className="flex flex-col gap-6">
            <h2 className="text-base font-mono uppercase tracking-widest text-[#2563EB] border-b border-zinc-900 pb-3 flex items-center gap-2">
              RECOMMENDED LITERATURE
            </h2>

            {recommendations.length === 0 ? (
              <div className="text-center py-10 border border-zinc-900 bg-zinc-950/10">
                <p className="text-zinc-550 text-xs font-mono uppercase tracking-wider">No matching vector recommendations found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {recommendations.map(({ paper: recPaper, recommendation_score }) => (
                  <article key={recPaper.id} className="py-6 border-b border-zinc-900 flex flex-col gap-3 relative group">
                    
                    <button
                      onClick={() => handleToggleSavePaper(recPaper.id)}
                      className="absolute right-0 top-6 p-2 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                      title="Toggle Bookmark"
                    >
                      <svg className={`w-4 h-4 ${savedPaperIds.has(recPaper.id) ? "fill-[#2563EB] text-[#2563EB]" : "fill-none text-zinc-550"}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>

                    <div className="flex items-start justify-between gap-4 pr-8">
                      <h3 className="text-base font-bold text-white group-hover:text-[#2563EB] transition-colors leading-snug font-sans">
                        <a href={`/app/paper/${recPaper.id}`}>{recPaper.title}</a>
                      </h3>
                      <span className="text-[9px] font-mono text-[#2563EB] bg-[#2563EB]/5 border border-[#2563EB]/25 px-2 py-0.5 flex-shrink-0">
                        MATCH: {(recommendation_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-mono font-medium">
                      {recPaper.authors?.join(", ") || "Unknown Authors"}
                    </p>

                    <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-550">
                      {recPaper.publication_year && <span>YEAR: {recPaper.publication_year}</span>}
                      <span>CITATIONS: {recPaper.citation_count}</span>
                    </div>

                    {recPaper.abstract && (
                      <p className="text-xs text-zinc-450 leading-relaxed font-sans mt-1 line-clamp-2">
                        {recPaper.abstract}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
