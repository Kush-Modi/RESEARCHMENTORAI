"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ paperId: string }>;
}

export default function GraphRedirectPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams.paperId) {
      router.replace(`/app/graph/${resolvedParams.paperId}`);
    }
  }, [resolvedParams.paperId, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">
      RESOLVING CITATION STRUCTURE...
    </div>
  );
}
