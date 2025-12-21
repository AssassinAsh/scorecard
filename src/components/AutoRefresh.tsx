"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
  intervalMs?: number;
  enabled?: boolean;
}

export default function AutoRefresh({
  intervalMs = 5000,
  enabled = true,
}: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs, enabled]);

  return null;
}
