"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaperRedirectPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams.id) {
      router.replace(`/app/paper/${resolvedParams.id}`);
    }
  }, [resolvedParams.id, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">
      RESOLVING METADATA REFERENCE...
    </div>
  );
}
