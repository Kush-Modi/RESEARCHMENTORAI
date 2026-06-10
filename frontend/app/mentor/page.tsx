"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MentorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const topic = searchParams.get("topic");
    if (topic) {
      router.replace(`/app/mentor?topic=${encodeURIComponent(topic)}`);
    } else {
      router.replace("/app/mentor");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">
      REDIRECTING WORKSPACE JOURNEY...
    </div>
  );
}
