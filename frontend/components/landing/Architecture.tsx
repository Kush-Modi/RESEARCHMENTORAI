import React from "react";
import { Card } from "../ui/Card";

export const Architecture: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-zinc-950/40 relative overflow-hidden">
      {/* Decorative backdrop mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold tracking-wider text-purple-400 uppercase mb-3">
            System Design
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Next-Gen Architecture
          </h3>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            A highly scalable, performant system stack engineered to process complex academic datasets in real-time.
          </p>
        </div>

        {/* Visual Node Diagram */}
        <div className="flex flex-col items-center gap-12 relative w-full mt-12">
          
          {/* Frontend Node */}
          <div className="w-64 z-10">
            <Card hoverGlow={false} className="border-blue-500/40 bg-zinc-950/80 shadow-lg shadow-blue-500/5 hover:border-blue-400 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Frontend</h4>
                  <p className="text-xs text-blue-400">Next.js 15 App Router</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-3">
                Interactive UI, state management, and visual node graphs.
              </p>
            </Card>
          </div>

          {/* Animated Connector Line: Frontend -> Backend */}
          <div className="h-12 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full" />
          </div>

          {/* Backend Node */}
          <div className="w-64 z-10">
            <Card hoverGlow={false} className="border-purple-500/40 bg-zinc-950/80 shadow-lg shadow-purple-500/5 hover:border-purple-400 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Backend API</h4>
                  <p className="text-xs text-purple-400">FastAPI Gateway</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-3">
                CORS enabled, routing, controller logic, and model schemas.
              </p>
            </Card>
          </div>

          {/* SVG Connector Lines for Leaves (Desktop/Wide screens view) */}
          <div className="hidden md:block absolute top-[270px] left-1/2 -translate-x-1/2 w-[70%] h-20 -z-10">
            <svg className="w-full h-full" fill="none" viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg">
              {/* Connection Left (Vector Search) */}
              <path d="M300 0 C 300 40, 100 40, 100 80" stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.4" />
              {/* Connection Middle (Knowledge Graph) */}
              <path d="M300 0 L 300 80" stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.4" />
              {/* Connection Right (AI Mentor) */}
              <path d="M300 0 C 300 40, 500 40, 500 80" stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.4" />
            </svg>
          </div>

          {/* Leaf Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4 z-10">
            {/* Vector Search Node */}
            <Card hoverGlow={false} className="border-cyan-500/20 bg-zinc-950/60 hover:border-cyan-500/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h5 className="font-bold text-white text-sm">Vector Search</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                FAISS indexing and semantic embeddings for high-dimensional paper queries.
              </p>
            </Card>

            {/* Knowledge Graph Node */}
            <Card hoverGlow={false} className="border-emerald-500/20 bg-zinc-950/60 hover:border-emerald-500/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h5 className="font-bold text-white text-sm">Knowledge Graph</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Neo4j property graphs representing co-citation pathways and conceptual linkages.
              </p>
            </Card>

            {/* AI Mentor Node */}
            <Card hoverGlow={false} className="border-rose-500/20 bg-zinc-950/60 hover:border-rose-500/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h5 className="font-bold text-white text-sm">AI Mentor</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gemini LLM reasoning agents for personalized tutoring, gap analysis, and syntheses.
              </p>
            </Card>
          </div>
          
        </div>
      </div>
    </section>
  );
};
