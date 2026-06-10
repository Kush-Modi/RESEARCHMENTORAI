"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { fetchPaperGraph, buildGraph, fetchPaperDetails } from "../../../../lib/api";
import { GraphData, GraphNode, Paper } from "../../../../types";
import { Network } from "vis-network/standalone";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ paperId: string }>;
}

export default function AppCitationGraphPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const paperId = resolvedParams.paperId;
  const router = useRouter();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    setSyncSuccess(null);
    try {
      const [paperRes, graphRes] = await Promise.all([
        fetchPaperDetails(paperId),
        fetchPaperGraph(paperId)
      ]);
      setPaper(paperRes);
      setGraphData(graphRes);
    } catch (err: any) {
      setError(
        err.message?.includes("not found in Neo4j")
          ? "Neo4j graph layers not compiled yet. Synchronize database papers with the graph system below."
          : err.message || "Failed to load citation graph data."
      );
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paperId) {
      loadGraph();
    }
  }, [paperId]);

  const handleSyncGraph = async () => {
    setSyncing(true);
    setError(null);
    setSyncSuccess(null);
    try {
      const response = await buildGraph();
      setSyncSuccess(
        `Citation graph sync complete: ${response.papers_synchronized} papers compiled.`
      );
      await loadGraph();
    } catch (err: any) {
      setError(err.message || "Failed to rebuild Neo4j citation graph database.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !graphData || graphData.nodes.length === 0) return;

    const formattedNodes = graphData.nodes.map((node) => {
      let color = { border: "#2563EB", background: "#0B0C10" };
      let size = 16;
      let fontColor = "#F5F5F2";

      if (node.isTarget) {
        color = { border: "#F5F5F2", background: "#2563EB" };
        size = 24;
      } else if (node.type === "Author") {
        color = { border: "#10B981", background: "#0F1A15" };
        size = 12;
      } else if (node.type === "Concept") {
        color = { border: "#8B5CF6", background: "#150F22" };
        size = 12;
      } else if (node.type === "Paper") {
        if (!node.properties || !node.properties.paper_id) {
          color = { border: "#3F3F46", background: "#0F0F0F" };
          size = 10;
          fontColor = "#A1A1AA";
        }
      }

      const cleanLabel =
        node.label.length > 25 ? node.label.substring(0, 22) + "..." : node.label;

      return {
        id: node.id,
        label: cleanLabel,
        title: node.label,
        color,
        shape: "dot",
        size,
        font: { color: fontColor, size: 9, face: "system-ui" }
      };
    });

    const formattedEdges = graphData.edges.map((edge) => {
      let color = "#1A1A1A";

      if (edge.label === "AUTHORED") color = "#064E3B";
      else if (edge.label === "HAS_CONCEPT") color = "#3B0764";
      else if (edge.label === "CITES") color = "#1E3A8A";

      return {
        from: edge.from,
        to: edge.to,
        label: edge.label,
        arrows: { to: { enabled: true, scaleFactor: 0.35 } },
        color: { color, highlight: "#2563EB", hover: "#2563EB" },
        font: { color: "#3F3F46", size: 7, align: "top" }
      };
    });

    const data = { nodes: formattedNodes, edges: formattedEdges };

    const options = {
      nodes: {
        borderWidth: 1.5,
        shadow: { enabled: false }
      },
      edges: {
        width: 1,
        selectionWidth: 2,
        smooth: {
          enabled: true,
          type: "continuous",
          roundness: 0.5
        }
      },
      physics: {
        stabilization: { enabled: true, iterations: 120 },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.25,
          springLength: 90,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.35
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 120,
        zoomView: true,
        dragView: true
      }
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    network.on("selectNode", (params) => {
      const nodeId = params.nodes[0];
      const matchNode = graphData.nodes.find((n) => n.id === nodeId);
      if (matchNode) {
        setSelectedNode(matchNode);
      }
    });

    network.on("deselectNode", () => {
      setSelectedNode(null);
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0B0B] text-[#F5F5F2] font-sans overflow-hidden relative">
      {/* Editorial Grain Overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.035] pointer-events-none z-50" />

      {/* Header bar */}
      <header className="z-10 bg-[#0C0C0C]/90 border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(paper ? `/app/paper/${paper.id}` : "/app/search")}
            className="p-2 border border-zinc-850 hover:border-white text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Go Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
              Citation Graph
              <span className="px-2 py-0.5 text-[9px] bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB] font-mono">
                NEO4J ACTIVE
              </span>
            </h1>
            <p className="text-xs text-zinc-500 font-sans truncate max-w-md mt-0.5">
              {paper ? paper.title : "Resolving targets..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncGraph}
            disabled={syncing || loading}
            className="px-4 py-2 border border-zinc-850 hover:border-white text-[10px] font-mono uppercase tracking-wider text-zinc-350 hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
          >
            {syncing ? "Syncing Neo4j..." : "Sync Neo4j"}
          </button>
        </div>
      </header>

      {/* Main Graph Viewport */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* Canvas container */}
        <div className="flex-grow h-full bg-[#0B0B0B]" ref={containerRef} />

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-10 border border-zinc-900 bg-[#0C0C0C]/90 p-4 flex flex-col gap-2.5 shadow-2xl pointer-events-none select-none">
          <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest mb-0.5">Legend</span>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-3 h-3 bg-[#2563EB] border border-[#F5F5F2]" />
            <span>Target Paper</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-3 h-3 bg-[#0B0C10] border border-[#2563EB]" />
            <span>PostgreSQL Paper</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-3 h-3 bg-[#0F0F0F] border border-[#3F3F46]" />
            <span>External Citation</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-3 h-3 bg-[#0F1A15] border border-[#10B981]" />
            <span>Author</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-3 h-3 bg-[#150F22] border border-[#8B5CF6]" />
            <span>Concept</span>
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="absolute inset-0 z-25 bg-[#0B0B0B]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full border border-zinc-850 border-t-[#2563EB] animate-spin" />
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Running graph query scan...</p>
          </div>
        )}

        {syncing && (
          <div className="absolute inset-0 z-25 bg-[#0B0B0B]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full border border-zinc-850 border-t-[#2563EB] animate-spin" />
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Rebuilding citation linkages inside Neo4j...</p>
          </div>
        )}

        {syncSuccess && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-25 border border-emerald-950 bg-emerald-950/20 text-emerald-300 px-6 py-3 text-xs font-mono">
            {syncSuccess}
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-25 bg-[#0B0B0B]/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="border border-rose-955 bg-rose-955/5 p-8 max-w-sm flex flex-col items-center text-center gap-4">
              <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest">VISUALIZATION ERROR</span>
              <p className="text-xs text-rose-350 leading-relaxed mt-2">{error}</p>
              {error.includes("Sync Neo4j") || error.includes("compiled") && (
                <button
                  onClick={handleSyncGraph}
                  className="px-5 py-2.5 border border-rose-800 hover:border-rose-600 text-xs font-mono uppercase text-rose-350 hover:text-white transition-all cursor-pointer"
                >
                  Sync Neo4j Database
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected Node Details side panel */}
        {selectedNode && (
          <div className="absolute top-6 right-6 bottom-6 z-10 w-80 bg-[#0C0C0C]/95 border border-zinc-900 p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-[#2563EB] border border-[#2563EB]/40 px-2 py-0.5">
                {selectedNode.type} {selectedNode.isTarget && "(TARGET)"}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-white leading-snug font-sans">
                {selectedNode.label}
              </h3>

              {selectedNode.type === "Paper" && selectedNode.properties && (
                <div className="flex flex-col gap-4 text-xs text-zinc-400 border-t border-zinc-900 pt-4 font-mono">
                  {selectedNode.properties.year && (
                    <div className="flex justify-between pb-2 border-b border-zinc-900/60">
                      <span className="text-zinc-550">PUBLICATION YEAR</span>
                      <span className="text-zinc-300">{selectedNode.properties.year}</span>
                    </div>
                  )}
                  {selectedNode.properties.citation_count !== undefined && (
                    <div className="flex justify-between pb-2 border-b border-zinc-900/60">
                      <span className="text-zinc-550">CITATIONS</span>
                      <span className="text-zinc-300">{selectedNode.properties.citation_count}</span>
                    </div>
                  )}

                  {selectedNode.properties.paper_id && (
                    <div className="mt-4 pt-4 border-t border-zinc-900">
                      <button
                        onClick={() => router.push(`/app/paper/${selectedNode.properties.paper_id}`)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-zinc-850 hover:border-white text-zinc-350 hover:text-white transition-all uppercase tracking-wider text-[10px]"
                      >
                        Inspect details sheet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedNode.type === "Author" && (
                <div className="text-xs text-zinc-400 border-t border-zinc-900 pt-4 font-sans leading-relaxed">
                  <p>Co-authorship cluster node related to one or more publications in this graph.</p>
                </div>
              )}

              {selectedNode.type === "Concept" && (
                <div className="text-xs text-zinc-400 border-t border-zinc-900 pt-4 font-sans leading-relaxed">
                  <p>Taxonomy tag node representing thematic classification of research papers.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
