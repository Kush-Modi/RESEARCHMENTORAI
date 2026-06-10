import React from "react";
import { Card } from "../ui/Card";

interface FeatureItem {
  title: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
}

export const Features: React.FC = () => {
  const features: FeatureItem[] = [
    {
      title: "Semantic Search",
      description: "Search papers conceptually. Go beyond simple keyword matching to find papers that truly share your research direction.",
      gradient: "from-blue-500 to-cyan-500",
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10h.01M15 10h.01M12 14h.01" />
        </svg>
      ),
    },
    {
      title: "Research Recommendations",
      description: "Receive daily paper feeds curated specifically for your projects, research drafts, and current reading queue.",
      gradient: "from-purple-500 to-indigo-500",
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.372-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      title: "Citation Knowledge Graph",
      description: "Visualize literature citation networks and map connections between influential papers and foundational theories.",
      gradient: "from-cyan-500 to-emerald-500",
      icon: (
        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11h.01M12 15h.01" />
        </svg>
      ),
    },
    {
      title: "AI Research Mentor",
      description: "Ask complex questions, clarify dense mathematical proofs, and brainstorm experimental setups in natural language.",
      gradient: "from-pink-500 to-rose-500",
      icon: (
        <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: "Personalized Learning Paths",
      description: "Generate structured curricula and reading pathways with curated milestones designed to bring you up to speed on any subfield.",
      gradient: "from-indigo-500 to-purple-500",
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      title: "Research Gap Finder",
      description: "Identify under-explored niches, contradictions in recent works, or logical gaps in current literature to focus your research.",
      gradient: "from-amber-500 to-orange-500",
      icon: (
        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 px-4 bg-zinc-950/20 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold tracking-wider text-purple-400 uppercase mb-3">
            Core Competencies
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Designed for Modern Academics
          </h3>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            Everything you need to accelerate your literature review, synthesize complex materials, and unlock breakthroughs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="h-full flex flex-col justify-between">
              <div>
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-zinc-900 border border-zinc-800 mb-6 group-hover:border-zinc-700 transition-colors duration-300`}>
                  {feature.icon}
                </div>
                {/* Title */}
                <h4 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h4>
                {/* Description */}
                <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Action decoration */}
              <div className="mt-6 flex items-center text-xs font-semibold text-zinc-500 group-hover:text-purple-400 transition-colors duration-300">
                <span>Learn more</span>
                <svg className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
