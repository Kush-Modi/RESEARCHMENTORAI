"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/app/search");
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/app/search` : undefined,
        },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message || "An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0B0B] text-[#F5F5F2] gap-4 font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-900 border-t-[#2563EB] animate-spin" />
        <p className="text-xs text-zinc-500 animate-pulse font-mono tracking-widest uppercase">Verifying workstation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F2] font-sans selection:bg-[#2563EB]/40 selection:text-white relative overflow-hidden flex flex-col justify-between p-6 md:p-12">
      {/* Editorial Grain Overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.035] pointer-events-none z-50" />

      {/* Grid background lines */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-6 md:px-24">
        <div className="w-[1px] h-full bg-zinc-900/40" />
        <div className="w-[1px] h-full bg-zinc-900/40" />
      </div>

      {/* Logo Header */}
      <header className="relative z-10 flex items-center justify-between">
        <a href="/" className="font-mono text-sm tracking-widest hover:opacity-80 transition-opacity">
          RESEARCHMENTOR<span className="text-[#2563EB]">AI</span>
        </a>
      </header>

      {/* Center Layout Panel */}
      <main className="relative z-10 flex items-center justify-center flex-grow py-12">
        <div className="w-full max-w-sm border border-zinc-900 bg-zinc-950/20 p-8 md:p-10 rounded-none relative">
          <div className="absolute top-0 left-0 w-8 h-[1px] bg-[#2563EB]" />
          <div className="absolute top-0 left-0 w-[1px] h-8 bg-[#2563EB]" />

          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-550 block mb-6">
            [ SECURE ACCESS GATE ]
          </span>

          <h1 className="text-3xl font-display uppercase tracking-tight text-white mb-3">
            ENTER WORKSTATION
          </h1>
          <p className="text-zinc-500 text-xs leading-relaxed mb-8 font-sans">
            Authenticate to sync literature indices, view customized research journeys, and traverse citation networks.
          </p>

          {error && (
            <div className="w-full bg-rose-500/5 border border-rose-500/20 text-rose-300 text-xs p-4 mb-6 flex items-start gap-2 text-left font-mono">
              <svg className="w-4 h-4 text-rose-450 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-[#F5F5F2] hover:bg-[#2563EB] text-black hover:text-white font-mono text-xs uppercase tracking-wider py-4 transition-all duration-500 rounded-none flex items-center justify-center gap-3 cursor-pointer shadow-none"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-650">
        <p>© {new Date().getFullYear()} RESEARCHMENTOR. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-4">
          <a href="/" className="hover:text-[#F5F5F2] transition-colors">Home</a>
          <a href="mailto:support@researchmentor.ai" className="hover:text-[#F5F5F2] transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
