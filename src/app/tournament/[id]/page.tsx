import { Suspense } from "react";
import {
  getTournamentById,
  hasAccess,
  isAdmin,
} from "@/app/actions/tournaments";
import { getMatchesByTournament } from "@/app/actions/matches";
import { createClient } from "@/lib/supabase/server";
import NewMatchButton from "@/components/NewMatchButton";
import { TournamentSkeleton } from "@/components/Skeletons";
import TournamentMatchList from "@/components/TournamentMatchList";

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

  const matches = await getMatchesByTournament(id);

  // Sort matches by status: Live > Starting Soon > Upcoming > Innings Break > Completed
  const statusOrder = {
    Live: 1,
    "Starting Soon": 2,
    Upcoming: 3,
    "Innings Break": 4,
    Completed: 5,
  };
  const sortedMatches = matches.sort((a, b) => {
    const orderA = statusOrder[a.status as keyof typeof statusOrder] || 4;
    const orderB = statusOrder[b.status as keyof typeof statusOrder] || 4;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Within same status, sort by match_date (most recent first)
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
      {/* Spectator Mode Banner */}
      {user && !hasScorerAccess && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 rounded-r">
            <p className="font-medium">👀 Spectator Mode</p>
            <p className="text-sm mt-1">
              You can view this tournament but cannot make changes.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="mb-4">
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
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium px-2">Matches</h2>
          {hasScorerAccess && <NewMatchButton tournamentId={id} />}
        </div>

        <TournamentMatchList
          matches={matchesWithResult}
          user={user}
          isAdmin={admin}
          hasScorerAccess={hasScorerAccess}
        />
      </main>
    </div>
  );
}
