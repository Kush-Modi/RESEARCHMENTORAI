"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SavedRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/saved");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">
      REDIRECTING WORKSPACE LIBRARY...
    </div>
  );
}
