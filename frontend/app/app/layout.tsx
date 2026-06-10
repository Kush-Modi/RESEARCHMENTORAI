"use client";

import React from "react";
import { useAuth } from "../../context/AuthProvider";
import { usePathname, useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Search",
      path: "/app/search",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      label: "Research Journey",
      path: "/app/mentor",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      label: "Saved Library",
      path: "/app/saved",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F2] font-sans relative flex">
      {/* Editorial Grain Overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.035] pointer-events-none z-50" />

      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-zinc-900/80 bg-[#0C0C0C] h-screen fixed top-0 left-0 flex flex-col justify-between py-8 px-6 z-40 select-none">
        
        {/* Brand Header */}
        <div className="flex flex-col gap-1.5">
          <a href="/" className="font-mono text-xs tracking-widest text-[#F5F5F2] uppercase hover:opacity-80 transition-opacity">
            RESEARCHMENTOR<span className="text-[#2563EB]">AI</span>
          </a>
          <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-wider">[ STATION WORKSPACE v1 ]</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 my-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all duration-300 border rounded-none cursor-pointer text-left ${
                  isActive
                    ? "bg-[#2563EB] text-[#F5F5F2] border-[#2563EB]"
                    : "bg-transparent text-zinc-450 border-transparent hover:text-white hover:border-zinc-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile/Footer panel */}
        <div className="flex flex-col gap-4 border-t border-zinc-900 pt-6">
          {user && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.email || "user"}
                    className="w-6 h-6 rounded-none border border-zinc-800"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-550 font-mono">
                    {user.email?.[0].toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex flex-col max-w-[140px] truncate">
                  <span className="text-[10px] font-mono text-zinc-400 truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full text-center border border-zinc-850 hover:border-rose-900/50 hover:bg-rose-950/10 text-[10px] font-mono text-zinc-500 hover:text-rose-450 py-2 transition-all duration-300 cursor-pointer uppercase tracking-wider"
              >
                Log Out Station
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col relative z-10">
        <main className="flex-grow p-6 md:p-12 max-w-5xl w-full mx-auto">
          {children}
        </main>

        {/* Workspace Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-zinc-900/60 flex justify-between text-[9px] font-mono text-zinc-650 mt-auto ml-auto w-full max-w-5xl">
          <span>SECURE ACADEMIC NODE</span>
          <span>LATENCY: LOCAL_INDEX</span>
        </footer>
      </div>
    </div>
  );
}
