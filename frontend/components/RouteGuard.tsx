"use client";

import React, { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { usePathname, useRouter } from "next/navigation";

export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Protect anything under the /app/ route workspace
  const isProtected = pathname.startsWith("/app");

  useEffect(() => {
    if (loading) return;

    if (isProtected && !user) {
      router.push("/login");
    }
  }, [user, loading, pathname, router, isProtected]);

  if (loading && isProtected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#F5F5F2] gap-4 font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-900 border-t-[#2563EB] animate-spin" />
        <p className="text-xs text-zinc-500 animate-pulse font-mono tracking-widest uppercase">Verifying workstation token...</p>
      </div>
    );
  }

  if (isProtected && !user) {
    return null; // Prevent flash of private UI before redirect
  }

  return <>{children}</>;
};
