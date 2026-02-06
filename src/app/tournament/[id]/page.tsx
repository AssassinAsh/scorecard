import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getTournamentById,
  hasAccess,
  isAdmin,
  getUserRole,
} from "@/app/actions/tournaments";
import { canManageTournamentAccess } from "@/app/actions/access";
import { getMatchesByTournament } from "@/app/actions/matches";
import { getProfile } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/server";
import NewMatchButton from "@/components/NewMatchButton";
import DeleteTournamentButton from "@/components/DeleteTournamentButton";
import { TournamentSkeleton } from "@/components/Skeletons";
import TournamentMatchList from "@/components/TournamentMatchList";
import RequestAccessButton from "@/components/RequestAccessButton";
import TournamentRealtimeRefresh from "@/components/TournamentRealtimeRefresh";
import type { AccessStatus } from "@/types";

// Enable ISR: Regenerate page every 10 minutes
// Match updates are handled by Realtime for active users
export const revalidate = 600;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournamentById(id);

  if (!tournament) {
    return {
      title: "Tournament Not Found - CrickSnap",
    };
  }

  return {
    title: `${tournament.name} - CrickSnap`,
    description: `View live scores and matches for ${tournament.name}. Real-time cricket scoring and tournament management.`,
    openGraph: {
      title: `${tournament.name} - CrickSnap`,
      description: `View live scores and matches for ${tournament.name}`,
      type: "website",
    },
  };
}

export default function TournamentPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TournamentSkeleton />}>
      <TournamentPageContent {...props} />
    </Suspense>
  );
}

async function TournamentPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tournament = await getTournamentById(id);

  if (!tournament) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <p className="muted-text">Tournament not found.</p>
      </div>
    );
  }

  // Check if user has scorer access
  const hasScorerAccess = user ? await hasAccess(id) : false;
  const admin = user ? await isAdmin() : false;
  const profile = user ? await getProfile() : null;
  const role = user ? await getUserRole() : "Viewer";
  const canManageAccess = user ? await canManageTournamentAccess(id) : false;

  // For Scorers without access, check their current status
  let accessStatus: AccessStatus | null = null;
  if (user && role === "Scorer" && !hasScorerAccess) {
    const { data: accessRecord } = await supabase
      .from("tournament_scorers")
      .select("status")
      .eq("tournament_id", id)
      .eq("user_id", user.id)
      .single();
    accessStatus = (accessRecord?.status as AccessStatus) || null;
  }

  const matches = await getMatchesByTournament(id);

  // Sort matches by:
  // 1. Last updated (most recent first)
  // 2. Status: Live > Starting Soon > Upcoming > Innings Break > Completed
  // 3. Match date (most recent first)
  const statusOrder = {
    Live: 1,
    "Starting Soon": 2,
    Upcoming: 3,
    "Innings Break": 4,
    Completed: 5,
  };
  const sortedMatches = matches.sort((a, b) => {
    // First, sort by updated_at (most recent first)
    const updatedA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const updatedB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    if (updatedA !== updatedB) {
      return updatedB - updatedA;
    }

    // Then by status
    const orderA = statusOrder[a.status as keyof typeof statusOrder] || 4;
    const orderB = statusOrder[b.status as keyof typeof statusOrder] || 4;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Finally by match_date (most recent first)
    const timeA = a.match_date ? new Date(a.match_date).getTime() : 0;
    const timeB = b.match_date ? new Date(b.match_date).getTime() : 0;
    return timeB - timeA;
  });

  // OPTIMIZATION: Batch fetch all innings for completed matches (avoid N+1)
  const completedMatchIds = sortedMatches
    .filter((m) => m.status === "Completed")
    .map((m) => m.id);

  const { data: allInningsData } =
    completedMatchIds.length > 0
      ? await supabase
          .from("innings")
          .select("*")
          .in("match_id", completedMatchIds)
          .order("created_at", { ascending: true })
      : { data: [] };

  // Group innings by match_id for quick lookup
  const inningsByMatch = new Map<string, typeof allInningsData>();
  allInningsData?.forEach((innings) => {
    const existing = inningsByMatch.get(innings.match_id) || [];
    existing.push(innings);
    inningsByMatch.set(innings.match_id, existing);
  });

  const matchesWithResult = sortedMatches.map((match) => {
    let winnerText: string | null = null;

    if (match.status === "Completed") {
      const innings = inningsByMatch.get(match.id) || [];

      const firstInnings = innings[0];
      const secondInnings = innings[1];

      if (match.winner_team && firstInnings && secondInnings) {
        const winnerName =
          match.winner_team === "A" ? match.team_a_name : match.team_b_name;

        const defendingTeam = firstInnings.batting_team;
        const chasingTeam = secondInnings.batting_team;

        if (match.winner_team === defendingTeam) {
          const margin = firstInnings.total_runs - secondInnings.total_runs;
          if (margin > 0) {
            winnerText = `${winnerName} won by ${margin} run${
              margin === 1 ? "" : "s"
            }`;
          } else {
            winnerText = `${winnerName} won`;
          }
        } else if (match.winner_team === chasingTeam) {
          const wicketsRemaining = 10 - secondInnings.wickets;
          if (wicketsRemaining > 0) {
            winnerText = `${winnerName} won by ${wicketsRemaining} wicket${
              wicketsRemaining === 1 ? "" : "s"
            }`;
          } else {
            winnerText = `${winnerName} won`;
          }
        } else {
          winnerText = `${winnerName} won`;
        }
      } else if (!match.winner_team) {
        winnerText = "Match drawn";
      }
    }

    return { match, winnerText };
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Access Control Banners */}
      {user && !hasScorerAccess && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          {role === "Scorer" ? (
            <RequestAccessButton
              tournamentId={id}
              currentStatus={accessStatus}
            />
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 rounded-r">
              <p className="font-medium">👀 Spectator Mode</p>
              <p className="text-sm mt-1">
                You can view this tournament but cannot make changes.
              </p>
            </div>
          )}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-medium team-name">
                {tournament.name}
              </h1>
              <p className="text-sm mt-1 muted-text">
                {tournament.location} •{" "}
                {new Date(tournament.start_date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canManageAccess && (
                <Link
                  href={`/tournament/${id}/access`}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Manage Access
                </Link>
              )}
              {admin && (
                <DeleteTournamentButton
                  tournamentId={id}
                  tournamentName={tournament.name}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium px-2">Matches</h2>
          {hasScorerAccess && (
            <NewMatchButton
              tournamentId={id}
              userCredits={profile?.credits ?? 0}
              userRole={role}
            />
          )}
        </div>

        <TournamentMatchList
          matches={matchesWithResult}
          user={user}
          isAdmin={admin}
          hasScorerAccess={hasScorerAccess}
        />

        <TournamentRealtimeRefresh tournamentId={id} />
      </main>
    </div>
  );
}
