"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
  generateRoadmap, 
  explainConcept, 
  fetchSavedRoadmaps, 
  saveRoadmap, 
  unsaveRoadmap 
} from "../../../lib/api";
import { RoadmapData, ConceptExplanation, Paper } from "../../../types";
import { useAuth } from "../../../context/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";

function MentorPageContent() {
  const { user, session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTopicParam = searchParams.get("topic");

  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRoadmapSaved, setIsRoadmapSaved] = useState(false);
  const [savingRoadmap, setSavingRoadmap] = useState(false);

  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  const checkSavedStatus = async (topicName: string) => {
    if (!session?.access_token) return;
    try {
      const savedList = await fetchSavedRoadmaps(session.access_token);
      const exists = savedList.some((r) => r.topic.toLowerCase() === topicName.toLowerCase());
      setIsRoadmapSaved(exists);
    } catch (err) {
      console.error("Error checking saved roadmap status:", err);
    }
  };

  const handleGenerate = async (searchTopic: string) => {
    if (!searchTopic.trim()) return;
    setLoading(true);
    setError(null);
    setRoadmap(null);
    setIsRoadmapSaved(false);
    try {
      const data = await generateRoadmap(searchTopic);
      setRoadmap(data);
      await checkSavedStatus(searchTopic);
    } catch (err: any) {
      setError(err.message || "Failed to compile learning roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTopicParam) {
      setTopic(searchTopicParam);
      handleGenerate(searchTopicParam);
    }
  }, [searchTopicParam]);

  const handleToggleSaveRoadmap = async () => {
    if (!session?.access_token) return;
    setSavingRoadmap(true);
    try {
      if (isRoadmapSaved) {
        const savedList = await fetchSavedRoadmaps(session.access_token);
        const matched = savedList.find((r) => r.topic.toLowerCase() === topic.toLowerCase());
        if (matched) {
          await unsaveRoadmap(matched.id, session.access_token);
          setIsRoadmapSaved(false);
        }
      } else {
        await saveRoadmap(undefined, session.access_token, topic);
        setIsRoadmapSaved(true);
      }
    } catch (err: any) {
      console.error("Failed to toggle roadmap bookmark:", err);
    } finally {
      setSavingRoadmap(false);
    }
  };

  const handleConceptClick = async (conceptName: string) => {
    setSelectedConcept(conceptName);
    setExplainLoading(true);
    setExplainError(null);
    setExplanation(null);
    try {
      const data = await explainConcept(conceptName);
      setExplanation(data);
    } catch (err: any) {
      setExplainError(err.message || "Failed to retrieve explanation for this concept.");
    } finally {
      setExplainLoading(false);
    }
  };

  const stages: Array<{ key: keyof RoadmapData; label: string }> = [
    { key: "Beginner", label: "01 / FOUNDATIONS" },
    { key: "Intermediate", label: "02 / ARCHITECTURES" },
    { key: "Advanced", label: "03 / SYSTEM INTEGRATIONS" },
    { key: "Research Frontier", label: "04 / THE FRONTIER" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#2563EB] block mb-2">
          [ MODULE 02 / DYNAMIC PROGRESSION ]
        </span>
        <h1 className="text-3xl font-display uppercase tracking-tight text-white">
          Research Journey
        </h1>
      </div>

      {/* Query Form */}
      <div className="max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(topic);
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Enter research field to generate roadmap (e.g. LLM Reasoning)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-[#0F0F0F] border border-zinc-905 px-4 py-3 text-xs text-white outline-none focus:border-[#2563EB] transition-all duration-300 font-mono uppercase placeholder-zinc-650"
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="bg-[#F5F5F2] hover:bg-[#2563EB] text-black hover:text-white px-5 py-3 font-mono text-[10px] uppercase tracking-wider transition-all duration-350 cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {loading ? "Compiling..." : "Generate"}
          </button>
        </form>

        {/* Quick Topics */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["Agentic AI", "Vector Embeddings", "AI Agents", "Prompt Engineering"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t);
                handleGenerate(t);
              }}
              className="text-[9px] font-mono uppercase border border-zinc-900 hover:border-zinc-700 text-zinc-500 hover:text-white px-2.5 py-1 transition-all duration-300 cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col gap-10 max-w-3xl w-full animate-pulse mt-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex gap-8">
              <div className="w-8 h-8 rounded-none border border-zinc-900 bg-zinc-950/20 flex-shrink-0 flex items-center justify-center font-mono text-zinc-550 text-xs">
                {s}
              </div>
              <div className="flex-grow flex flex-col gap-4 border border-zinc-900 bg-zinc-950/5 p-6">
                <div className="h-4 w-32 bg-zinc-900" />
                <div className="h-3 w-full bg-zinc-900 mt-2" />
                <div className="h-8 w-full bg-zinc-900 mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="border border-rose-950 bg-rose-950/5 text-rose-300 p-4 mb-4 text-xs font-mono flex items-start gap-2 max-w-xl">
          <svg className="w-4 h-4 text-rose-450 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Roadmap Output */}
      {roadmap && (
        <div className="flex flex-col gap-12 max-w-3xl w-full relative mt-8">
          
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-zinc-900 bg-zinc-950/10 p-6">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">CHAPTER PROGRESSION FOR</span>
              <h2 className="text-xl font-display uppercase tracking-tight text-white mt-1">{topic}</h2>
            </div>
            <button
              onClick={handleToggleSaveRoadmap}
              disabled={savingRoadmap}
              className="flex items-center gap-2 border border-zinc-850 hover:border-white text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white py-2 px-4 transition-all duration-300 cursor-pointer"
            >
              <svg className={`w-3.5 h-3.5 ${isRoadmapSaved ? "fill-[#2563EB] text-[#2563EB]" : "fill-none text-white"}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {isRoadmapSaved ? "SAVED TO WORKSPACE" : "SAVE JOURNEY"}
            </button>
          </div>

          {/* Vertical Grid Line */}
          <div className="absolute left-4 top-24 bottom-8 w-px bg-zinc-900 -z-10" />

          {/* Stages Loop */}
          {stages.map((stage, sIdx) => {
            const stageData = roadmap[stage.key];
            if (!stageData) return null;

            return (
              <div key={stage.key} className="flex gap-8 relative group">
                {/* Timeline circle badge */}
                <div className="w-8 h-8 rounded-none border border-zinc-900 bg-[#0C0C0C] flex-shrink-0 flex items-center justify-center font-mono text-zinc-550 text-xs z-10 transition-colors group-hover:border-[#2563EB] group-hover:text-white">
                  0{sIdx + 1}
                </div>

                {/* Content Panel */}
                <div className="flex-grow flex flex-col gap-5 border border-zinc-900 bg-zinc-950/5 p-6 transition-all duration-300 hover:border-zinc-800">
                  <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
                    <h3 className="text-sm font-mono text-white tracking-widest uppercase">
                      {stage.label}
                    </h3>
                  </div>

                  {/* Objectives */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">CHAPTER OBJECTIVES</span>
                    <ul className="list-disc list-inside text-xs text-zinc-400 leading-relaxed space-y-1 font-sans">
                      {stageData.learning_objectives.map((obj, oIdx) => (
                        <li key={oIdx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Progression Notes */}
                  {stageData.recommended_progression && (
                    <div className="border-l border-[#2563EB]/40 pl-4 py-1.5 text-xs text-zinc-500 italic font-sans leading-relaxed">
                      {stageData.recommended_progression}
                    </div>
                  )}

                  {/* Concepts */}
                  {stageData.concepts && stageData.concepts.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">CORE CONCEPTS</span>
                      <div className="flex flex-wrap gap-2">
                        {stageData.concepts.map((concept, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleConceptClick(concept)}
                            className="text-[10px] font-mono uppercase bg-transparent hover:bg-[#2563EB] border border-zinc-850 hover:border-[#2563EB] text-zinc-350 hover:text-white px-3 py-1.5 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                          >
                            {concept}
                            <svg className="w-2.5 h-2.5 text-[#2563EB] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Papers attachments */}
                  {stageData.recommended_papers && stageData.recommended_papers.length > 0 && (
                    <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900/60">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">ATTACHED LITERATURE</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {stageData.recommended_papers.map((paper: Paper) => (
                          <div
                            key={paper.id}
                            className="border border-zinc-900 bg-zinc-950/20 p-4 flex flex-col gap-1"
                          >
                            <a
                              href={`/app/paper/${paper.id}`}
                              className="text-xs font-bold text-white hover:text-[#2563EB] transition-colors leading-snug cursor-pointer font-sans"
                            >
                              {paper.title}
                            </a>
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-550 mt-1">
                              <span className="truncate max-w-[200px]">
                                {paper.authors && paper.authors.length > 0 ? paper.authors[0] : "Unknown"} {paper.authors && paper.authors.length > 1 && "et al."}
                              </span>
                              <span>CITATIONS: {paper.citation_count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Concept Explanation Dialog Overlay */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0C0C0C] border border-zinc-900 rounded-none w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-900">
              <div>
                <span className="text-[9px] font-mono text-[#2563EB] uppercase tracking-widest">AI EXPLICATOR</span>
                <h3 className="text-base font-mono uppercase tracking-wide text-white mt-1">{selectedConcept}</h3>
              </div>
              <button
                onClick={() => setSelectedConcept(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
              {explainLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 rounded-full border border-zinc-850 border-t-[#2563EB] animate-spin" />
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Running concept extraction...</p>
                </div>
              )}

              {explainError && !explainLoading && (
                <div className="border border-rose-955 bg-rose-955/5 text-rose-300 p-4 text-xs font-mono">
                  {explainError}
                </div>
              )}

              {explanation && !explainLoading && !explainError && (
                <div className="flex flex-col gap-5">
                  
                  {/* Summary */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">EXPLANATION SUMMARY</span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {explanation.simple_explanation}
                    </p>
                  </div>

                  {/* Key Ideas */}
                  {explanation.key_ideas && explanation.key_ideas.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">CORE PRINCIPLES</span>
                      <ul className="list-disc list-inside text-xs text-zinc-405 leading-relaxed space-y-1 font-sans">
                        {explanation.key_ideas.map((item, idx) => (
                          <li key={idx}>
                            <span className="text-zinc-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Pitfalls */}
                  {explanation.common_mistakes && explanation.common_mistakes.length > 0 && (
                    <div className="border border-rose-950 bg-rose-950/5 p-4 flex flex-col gap-2">
                      <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest">COMMON PITFALLS</span>
                      <ul className="list-disc list-inside text-xs text-rose-200/90 leading-relaxed space-y-1 font-sans">
                        {explanation.common_mistakes.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Concepts */}
                  {explanation.related_concepts && explanation.related_concepts.length > 0 && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-zinc-900">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest">RELATED EXPLORATIONS</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {explanation.related_concepts.map((concept, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleConceptClick(concept)}
                            className="text-[9px] font-mono uppercase bg-transparent hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-450 hover:text-white px-2.5 py-1 transition-all duration-300 cursor-pointer"
                          >
                            {concept}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-900 flex justify-end">
              <button
                onClick={() => setSelectedConcept(null)}
                className="px-4 py-2 border border-zinc-850 hover:border-white text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppMentorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#F5F5F2] font-mono">
        <div className="w-8 h-8 border border-zinc-850 border-t-[#2563EB] animate-spin" />
      </div>
    }>
      <MentorPageContent />
    </Suspense>
  );
}
