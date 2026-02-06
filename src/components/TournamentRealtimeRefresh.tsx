"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface TournamentRealtimeRefreshProps {
  tournamentId: string;
  enabled?: boolean;
}

/**
 * Subscribes to match creation/updates for a tournament and refreshes the page.
 * This ensures new matches appear instantly without waiting for ISR revalidation.
 */
export default function TournamentRealtimeRefresh({
  tournamentId,
  enabled = true,
}: TournamentRealtimeRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    let channel: RealtimeChannel;

    // Subscribe to match changes for this tournament
    channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          // Match created, updated, or deleted - refresh to show changes
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, enabled, router]);

  return null;
}
