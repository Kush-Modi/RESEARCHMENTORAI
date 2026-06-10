"use client";

import React from "react";
import { useAuth } from "../context/AuthProvider";

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-zinc-900/60 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
            R
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            ResearchMentor<span className="text-purple-400">AI</span>
          </span>
        </a>
        <nav className="flex items-center gap-4 sm:gap-6">
          <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Home
          </a>
          <a href="/search" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Search
          </a>
          <a href="/mentor" className="text-sm text-zinc-400 hover:text-white transition-colors">
            AI Mentor
          </a>
          {user && (
            <a href="/saved" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Saved
            </a>
          )}

          {user ? (
            <div className="flex items-center gap-3 sm:gap-4 border-l border-zinc-800 pl-3 sm:pl-4">
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.email || "user"}
                    className="w-7 h-7 rounded-full border border-zinc-850"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {user.email?.[0].toUpperCase() || "U"}
                  </div>
                )}
                <span className="hidden md:inline text-xs text-zinc-400 max-w-[120px] truncate" title={user.email}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-xs font-semibold bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer shadow-sm shadow-purple-500/10"
            >
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
