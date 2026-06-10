"use client";

import React, { useState, useEffect } from "react";
import { 
  searchPapers, 
  semanticSearchPapers, 
  buildIndex, 
  fetchSavedPapers, 
  savePaper, 
  unsavePaper 
} from "../../../lib/api";
import { Paper, SemanticSearchPaperResult } from "../../../types";
import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function AppSearchPage() {
  const { user, session } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"keyword" | "semantic">("keyword");
  const [query, setQuery] = useState("");
  
  const [keywordPapers, setKeywordPapers] = useState<Paper[]>([]);
  const [keywordSearched, setKeywordSearched] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchPaperResult[]>([]);
  const [semanticSearched, setSemanticSearched] = useState(false);
  const [savedPaperIds, setSavedPaperIds] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexSuccessMessage, setIndexSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && session?.access_token) {
      fetchSavedPapers(session.access_token)
        .then((papers) => {
          setSavedPaperIds(new Set(papers.map((p) => p.id)));
        })
        .catch((err) => console.error("Error loading saved papers:", err));
    }
  }, [user, session]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);
    setIndexSuccessMessage(null);

    try {
      if (activeTab === "keyword") {
        setKeywordSearched(true);
        const response = await searchPapers(trimmedQuery);
        setKeywordPapers(response.papers || []);
      } else {
        setSemanticSearched(true);
        const results = await semanticSearchPapers(trimmedQuery);
        setSemanticResults(results || []);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching papers.");
      if (activeTab === "keyword") {
        setKeywordPapers([]);
      } else {
        setSemanticResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuildIndex = async () => {
    setIndexing(true);
    setError(null);
    setIndexSuccessMessage(null);
    try {
      const response = await buildIndex();
      setIndexSuccessMessage(
        `FAISS index updated. ${response.papers_indexed} papers cached in vector space.`
      );
    } catch (err: any) {
      setError(err.message || "Failed to update vector index.");
    } finally {
      setIndexing(false);
    }
  };

  const handleToggleSavePaper = async (paperId: number) => {
    if (!session?.access_token) return;

    const isSaved = savedPaperIds.has(paperId);
    try {
      if (isSaved) {
        await unsavePaper(paperId, session.access_token);
        setSavedPaperIds((prev) => {
          const next = new Set(prev);
          next.delete(paperId);
          return next;
        });
      } else {
        await savePaper(paperId, session.access_token);
        setSavedPaperIds((prev) => {
          const next = new Set(prev);
          next.add(paperId);
          return next;
        });
      }
    } catch (err: any) {
      console.error("Failed to toggle paper bookmark:", err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#2563EB] block mb-2">
          [ MODULE 01 / INDEX SEARCH ]
        </span>
        <h1 className="text-3xl font-display uppercase tracking-tight text-white">
          Literature Search
        </h1>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-900 pb-px">
        <button
          onClick={() => {
            setActiveTab("keyword");
            setError(null);
            setIndexSuccessMessage(null);
          }}
          className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all duration-300 ${
            activeTab === "keyword"
              ? "border-[#2563EB] text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Keyword Index
        </button>
        <button
          onClick={() => {
            setActiveTab("semantic");
            setError(null);
            setIndexSuccessMessage(null);
          }}
          className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all duration-300 ${
            activeTab === "semantic"
              ? "border-[#2563EB] text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Vector Semantics
        </button>
      </div>

      {/* Vector Indexing Controller */}
      {activeTab === "semantic" && (
        <div className="border border-zinc-900/80 bg-zinc-950/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">FAISS INDEX SYNCHRONIZER</span>
            <p className="text-xs text-zinc-500 max-w-xl">
              Compile local database articles into high-dimensional vector representations using sentence-transformers.
            </p>
          </div>
          <button
            onClick={handleBuildIndex}
            disabled={indexing || loading}
            className="px-5 py-2.5 bg-transparent border border-zinc-850 hover:border-white text-xs font-mono uppercase tracking-wider text-zinc-350 hover:text-white transition-all duration-300 cursor-pointer"
          >
            {indexing ? "Encoding..." : "Sync Vectors"}
          </button>
        </div>
      )}

      {/* Big Search Input Panel */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === "keyword"
                ? "Enter key research terms, authors, or concepts..."
                : "Enter an abstract research hypothesis or detailed query..."
            }
            className="w-full px-6 py-4 bg-[#0F0F0F] border border-zinc-900 rounded-none text-[#F5F5F2] placeholder-zinc-650 focus:outline-none focus:border-[#2563EB] transition-all duration-300 font-sans text-sm"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-650 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || indexing || !query.trim()}
          className="py-4 px-8 bg-[#F5F5F2] hover:bg-[#2563EB] text-black hover:text-white font-mono text-xs uppercase tracking-widest rounded-none transition-all duration-500 cursor-pointer flex-shrink-0"
        >
          {loading ? "Searching..." : "Execute Query"}
        </button>
      </form>

      {/* Status Indicators */}
      <div className="w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 border border-zinc-900/60 bg-black/40">
            <div className="w-8 h-8 rounded-full border border-zinc-800 border-t-[#2563EB] animate-spin" />
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Running semantic scan...</p>
          </div>
        )}

        {indexing && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 border border-zinc-900/60 bg-black/40">
            <div className="w-8 h-8 rounded-full border border-zinc-800 border-t-[#2563EB] animate-spin" />
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Reindexing local vector index...</p>
          </div>
        )}

        {indexSuccessMessage && (
          <div className="border border-emerald-950 bg-emerald-950/5 text-emerald-300 p-4 mb-4 text-xs font-mono flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-450 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{indexSuccessMessage}</span>
          </div>
        )}

        {error && (
          <div className="border border-rose-950 bg-rose-950/5 text-rose-300 p-4 mb-4 text-xs font-mono flex items-start gap-2">
            <svg className="w-4 h-4 text-rose-450 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Results Container (Dense Academic Style) */}
        {!loading && !indexing && !error && (
          <div className="flex flex-col gap-6">
            
            {/* Keyword Papers Loop */}
            {activeTab === "keyword" && keywordSearched && keywordPapers.length === 0 && (
              <div className="text-center py-16 border border-zinc-900 bg-zinc-950/5">
                <p className="text-zinc-550 text-xs font-mono uppercase tracking-wider">No matching articles in primary index.</p>
              </div>
            )}

            {activeTab === "keyword" && keywordPapers.map((paper) => (
              <article key={paper.id} className="py-6 border-b border-zinc-900 flex flex-col gap-3 relative group">
                {/* Bookmark Toggle */}
                <button
                  onClick={() => handleToggleSavePaper(paper.id)}
                  className="absolute right-0 top-6 p-2 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Bookmark"
                >
                  <svg className={`w-4 h-4 ${savedPaperIds.has(paper.id) ? "fill-[#2563EB] text-[#2563EB]" : "fill-none text-zinc-550"}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>

                <h3 className="text-lg font-bold text-white group-hover:text-[#2563EB] transition-colors leading-snug pr-8">
                  <a href={`/app/paper/${paper.id}`}>{paper.title}</a>
                </h3>

                <p className="text-xs text-zinc-400 font-mono">
                  {paper.authors?.join(", ") || "Unknown Authors"}
                </p>

                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-550">
                  {paper.publication_year && <span>YEAR: {paper.publication_year}</span>}
                  <span>CITATIONS: {paper.citation_count}</span>
                  {paper.paper_url && (
                    <a
                      href={paper.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline flex items-center gap-0.5"
                    >
                      OPEN SOURCE
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {paper.abstract && (
                  <p className="text-xs text-zinc-450 leading-relaxed font-sans mt-1 line-clamp-2">
                    {paper.abstract}
                  </p>
                )}
              </article>
            ))}

            {/* Semantic Papers Loop */}
            {activeTab === "semantic" && semanticSearched && semanticResults.length === 0 && (
              <div className="text-center py-16 border border-zinc-900 bg-zinc-950/5">
                <p className="text-zinc-550 text-xs font-mono uppercase tracking-wider">No semantic matches inside index.</p>
              </div>
            )}

            {activeTab === "semantic" && semanticResults.map(({ paper, similarity_score }) => (
              <article key={paper.id} className="py-6 border-b border-zinc-900 flex flex-col gap-3 relative group">
                <button
                  onClick={() => handleToggleSavePaper(paper.id)}
                  className="absolute right-0 top-6 p-2 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Bookmark"
                >
                  <svg className={`w-4 h-4 ${savedPaperIds.has(paper.id) ? "fill-[#2563EB] text-[#2563EB]" : "fill-none text-zinc-550"}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>

                <div className="flex items-start justify-between gap-4 pr-8">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#2563EB] transition-colors leading-snug">
                    <a href={`/app/paper/${paper.id}`}>{paper.title}</a>
                  </h3>
                  <span className="text-[10px] font-mono text-[#2563EB] bg-[#2563EB]/5 border border-[#2563EB]/25 px-2 py-0.5 flex-shrink-0">
                    MATCH: {Math.max(0, Math.round(similarity_score * 1000) / 10)}%
                  </span>
                </div>

                <p className="text-xs text-zinc-400 font-mono">
                  {paper.authors?.join(", ") || "Unknown Authors"}
                </p>

                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-550">
                  {paper.publication_year && <span>YEAR: {paper.publication_year}</span>}
                  <span>CITATIONS: {paper.citation_count}</span>
                  {paper.paper_url && (
                    <a
                      href={paper.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline flex items-center gap-0.5"
                    >
                      OPEN SOURCE
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {paper.abstract && (
                  <p className="text-xs text-zinc-450 leading-relaxed font-sans mt-1 line-clamp-2">
                    {paper.abstract}
                  </p>
                )}
              </article>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
