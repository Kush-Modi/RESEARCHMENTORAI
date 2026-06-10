"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { checkBackendHealth } from "../../lib/api";

export const Hero: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const verifyStatus = async () => {
    const status = await checkBackendHealth();
    setIsOnline(status);
    setIsChecking(false);
  };

  useEffect(() => {
    // Initial check
    verifyStatus();

    // Poll status every 5 seconds
    const interval = setInterval(verifyStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden min-h-[85vh]">
      {/* Background radial gradient mesh */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[110px] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Backend Status Indicator Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md mb-8 hover:border-zinc-700/80 transition-all duration-300">
          <span className="relative flex h-2.5 w-2.5">
            {isChecking ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-75"></span>
            ) : isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </>
            )}
            {isChecking && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-500"></span>
            )}
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-300">
            {isChecking
              ? "Checking System Status..."
              : isOnline
              ? "Backend Status: Online"
              : "Backend Status: Offline"}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-500 leading-[1.15] mb-6">
          Your Personal AI <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Research Mentor
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
          Discover papers, understand research, build learning roadmaps, and
          uncover new opportunities.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            Start Exploring
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
