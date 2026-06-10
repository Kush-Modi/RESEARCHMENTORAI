"use client";

import React from "react";
import { motion } from "framer-motion";
import { CitationNetwork } from "../components/landing/CitationNetwork";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    if (user) {
      router.push("/app/search");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F2] font-sans selection:bg-[#2563EB]/40 selection:text-white relative overflow-hidden flex flex-col">
      {/* Editorial Grain Overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.035] pointer-events-none z-50" />

      {/* Structured grid background guides */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-6 md:px-24">
        <div className="w-[1px] h-full bg-zinc-900/40" />
        <div className="w-[1px] h-full bg-zinc-900/40 hidden md:block" />
        <div className="w-[1px] h-full bg-zinc-900/40 hidden md:block" />
        <div className="w-[1px] h-full bg-zinc-900/40" />
      </div>

      {/* Layered monochromatic blurs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-zinc-900/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-900/5 blur-[160px] pointer-events-none z-0" />

      {/* Minimal Header Navigation */}
      <header className="relative z-40 px-6 md:px-12 py-8 flex items-center justify-between border-b border-zinc-900/40">
        <a href="/" className="font-mono text-sm tracking-widest hover:opacity-80 transition-opacity">
          RESEARCHMENTOR<span className="text-[#2563EB]">AI</span>
        </a>
        <div className="flex items-center gap-6">
          <button
            onClick={handleCTA}
            className="text-xs font-mono tracking-wider uppercase border border-zinc-800 hover:border-[#F5F5F2] px-5 py-2.5 rounded-none transition-all duration-500 cursor-pointer bg-transparent hover:bg-[#F5F5F2] hover:text-[#0B0B0B]"
          >
            {user ? "Enter Workstation" : "Access Platform"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        
        {/* Cinematic Hero Section */}
        <section className="min-h-[90vh] flex flex-col justify-end px-6 md:px-12 pb-24 pt-20 border-b border-zinc-900/40">
          <div className="max-w-7xl mx-auto w-full">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 block mb-6">
              [ RESEARCH INTELLIGENCE SYSTEM 01.0 ]
            </span>
            
            <h1 className="text-[12vw] md:text-[8.5vw] font-black tracking-tighter leading-[0.85] uppercase font-display block select-none">
              <motion.span 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                DISCOVER
              </motion.span>
              <motion.span 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="block text-[#2563EB]"
              >
                THE LINKS
              </motion.span>
              <motion.span 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                OTHERS MISS.
              </motion.span>
            </h1>

            <div className="mt-16 flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12 border-t border-zinc-900/60">
              <p className="text-zinc-400 max-w-md text-sm md:text-base leading-relaxed font-sans">
                A high-fidelity academic workspace integrating FAISS semantic search, knowledge graphs, and AI learning journeys to guide deep literature review.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCTA}
                className="px-8 py-4 bg-[#F5F5F2] text-[#0B0B0B] font-mono text-xs uppercase tracking-widest rounded-none hover:bg-[#2563EB] hover:text-white transition-all duration-500 cursor-pointer self-start md:self-auto"
              >
                Open Workstation
              </motion.button>
            </div>
          </div>
        </section>

        {/* Dynamic Citation Network Visualization */}
        <section className="border-b border-zinc-900/40 py-24 px-6 md:px-12 bg-black/40">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
              <div className="lg:col-span-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#2563EB] block mb-3">[ VISUALIZATION ]</span>
                <h2 className="text-3xl font-display uppercase tracking-tight leading-none text-white">THE SCIENTIFIC GRAPH</h2>
              </div>
              <div className="lg:col-span-2">
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Hover over the network nodes to map relationships between classic publications and modern foundation models. Each edge represents deep semantic connections calculated across local index layers.
                </p>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="w-full h-[600px] border border-zinc-900/80 bg-zinc-950/20 relative">
              <CitationNetwork />
            </div>
          </div>
        </section>

        {/* Editorial Features Section */}
        <section className="py-32 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2563EB] block mb-8">[ FUNCTIONAL MODULES ]</span>
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-16 border-t border-zinc-900/60 items-baseline">
              <div className="lg:col-span-2 text-2xl font-mono text-zinc-650">[01]</div>
              <div className="lg:col-span-5">
                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white mb-4">FAISS Hybrid Semantic Indexing</h3>
              </div>
              <div className="lg:col-span-5 text-zinc-400 text-sm leading-relaxed">
                Retrieve literature by abstract concept and relational content rather than strict keyword match. Matches paper embeddings against vector indices.
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-16 border-t border-zinc-900/60 items-baseline">
              <div className="lg:col-span-2 text-2xl font-mono text-zinc-650">[02]</div>
              <div className="lg:col-span-5">
                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white mb-4">Neo4j Interactive Citation Graphs</h3>
              </div>
              <div className="lg:col-span-5 text-zinc-400 text-sm leading-relaxed">
                Traverse academic co-authorship paths and publication loops inside a hardware-accelerated force network layout.
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-16 border-t border-b border-zinc-900/60 items-baseline">
              <div className="lg:col-span-2 text-2xl font-mono text-zinc-650">[03]</div>
              <div className="lg:col-span-5">
                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white mb-4">Gemini-Powered Research Journeys</h3>
              </div>
              <div className="lg:col-span-5 text-zinc-400 text-sm leading-relaxed">
                Generate vertical learning paths on any topic, organizing concepts into chapters from beginner fundamentals to advanced research frontiers.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="relative z-10 px-6 md:px-12 py-16 border-t border-zinc-900/60 bg-black/80 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-zinc-600 text-xs font-mono">
          © {new Date().getFullYear()} RESEARCHMENTOR. PRIVACY & SECURITY FIRST.
        </div>
        <div className="flex gap-8 text-xs font-mono tracking-wider uppercase text-zinc-400">
          <a href="/login" className="hover:text-white transition-colors">Workspace Login</a>
          <a href="https://github.com" className="hover:text-white transition-colors">Index Repository</a>
        </div>
      </footer>
    </div>
  );
}
