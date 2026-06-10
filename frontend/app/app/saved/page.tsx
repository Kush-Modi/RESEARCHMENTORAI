"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchSavedPapers, 
  fetchSavedRoadmaps, 
  unsavePaper, 
  unsaveRoadmap 
} from "../../../lib/api";
import { Paper } from "../../../types";
import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function AppSavedPage() {
  const { user, session } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"papers" | "roadmaps">("papers");
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Array<{ id: number; topic: string; roadmap_json: any; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedContent = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const [papers, roadmaps] = await Promise.all([
        fetchSavedPapers(session.access_token),
        fetchSavedRoadmaps(session.access_token),
      ]);
      setSavedPapers(papers || []);
      setSavedRoadmaps(roadmaps || []);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve saved bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session?.access_token) {
      loadSavedContent();
    }
  }, [user, session]);

  const handleUnsavePaper = async (paperId: number) => {
    if (!session?.access_token) return;
    try {
      await unsavePaper(paperId, session.access_token);
      setSavedPapers((prev) => prev.filter((p) => p.id !== paperId));
    } catch (err: any) {
      console.error("Failed to remove paper bookmark:", err);
    }
  };

  const handleUnsaveRoadmap = async (roadmapId: number) => {
    if (!session?.access_token) return;
    try {
      await unsaveRoadmap(roadmapId, session.access_token);
      setSavedRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
    } catch (err: any) {
      console.error("Failed to remove roadmap bookmark:", err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#2563EB] block mb-2">
          [ MODULE 03 / PERSONAL ARCHIVE ]
        </span>
        <h1 className="text-3xl font-display uppercase tracking-tight text-white">
          Saved Library
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-900 pb-px">
        <button
          onClick={() => setActiveTab("papers")}
          className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all duration-300 ${
            activeTab === "papers"
              ? "border-[#2563EB] text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Papers ({savedPapers.length})
        </button>
        <button
          onClick={() => setActiveTab("roadmaps")}
          className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all duration-300 ${
            activeTab === "roadmaps"
              ? "border-[#2563EB] text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Roadmaps ({savedRoadmaps.length})
        </button>
      </div>

      {/* Status Indicators */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-zinc-900/60 bg-black/40">
          <div className="w-8 h-8 rounded-full border border-zinc-850 border-t-[#2563EB] animate-spin" />
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Loading personal archive...</p>
        </div>
      )}

      {error && !loading && (
        <div className="border border-rose-955 bg-rose-955/5 text-rose-300 p-4 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Papers Tab */}
      {!loading && !error && activeTab === "papers" && (
        savedPapers.length === 0 ? (
          <div className="text-center py-16 border border-zinc-900 bg-zinc-950/5">
            <p className="text-zinc-550 text-xs font-mono uppercase tracking-wider mb-4">No bookmarked papers in database.</p>
            <button
              onClick={() => router.push("/app/search")}
              className="px-5 py-2.5 bg-transparent border border-zinc-850 hover:border-white text-xs font-mono uppercase tracking-wider text-zinc-350 hover:text-white transition-all duration-300 cursor-pointer"
            >
              Search Literature
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {savedPapers.map((paper) => (
              <article key={paper.id} className="py-6 border-b border-zinc-900 flex flex-col gap-3 relative group">
                {/* Remove Bookmark */}
                <button
                  onClick={() => handleUnsavePaper(paper.id)}
                  className="absolute right-0 top-6 p-2 text-zinc-650 hover:text-rose-450 transition-colors cursor-pointer"
                  title="Remove Bookmark"
                >
                  <svg className="w-4 h-4 fill-current" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          </div>
        )
      )}

      {/* Roadmaps Tab */}
      {!loading && !error && activeTab === "roadmaps" && (
        savedRoadmaps.length === 0 ? (
          <div className="text-center py-16 border border-zinc-900 bg-zinc-950/5">
            <p className="text-zinc-550 text-xs font-mono uppercase tracking-wider mb-4">No saved Journeys.</p>
            <button
              onClick={() => router.push("/app/mentor")}
              className="px-5 py-2.5 bg-transparent border border-zinc-850 hover:border-white text-xs font-mono uppercase tracking-wider text-zinc-350 hover:text-white transition-all duration-300 cursor-pointer"
            >
              Generate Journey
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {savedRoadmaps.map((item) => (
              <div key={item.id} className="py-6 border-b border-zinc-900 flex justify-between items-center gap-6 relative group">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">ROADMAP PATH</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#2563EB] transition-colors leading-snug">
                    <a href={`/app/mentor?topic=${encodeURIComponent(item.topic)}`}>{item.topic}</a>
                  </h3>
                  <p className="text-[9px] font-mono text-zinc-650">
                    SAVED ON: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push(`/app/mentor?topic=${encodeURIComponent(item.topic)}`)}
                    className="px-4 py-2 border border-zinc-850 hover:border-white text-[10px] font-mono uppercase tracking-wider text-zinc-350 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    Open Journey
                  </button>
                  <button
                    onClick={() => handleUnsaveRoadmap(item.id)}
                    className="p-2 text-zinc-650 hover:text-rose-450 transition-colors cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <svg className="w-4 h-4 fill-current" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
