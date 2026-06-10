import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-base">
                R
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                ResearchMentor<span className="text-purple-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              Empowering researchers, students, and academics to explore literature, chart learning paths, and discover research opportunities with state-of-the-art AI.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h5 className="text-zinc-300 font-bold text-sm uppercase tracking-wider mb-4">
              Platform
            </h5>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Semantic Search
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Knowledge Graph
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Roadmaps
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h5 className="text-zinc-300 font-bold text-sm uppercase tracking-wider mb-4">
              Resources
            </h5>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} ResearchMentor AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
