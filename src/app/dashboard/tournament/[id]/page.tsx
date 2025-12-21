import Link from "next/link";
import { getTournamentById, hasAccess } from "@/app/actions/tournaments";
import { getMatchesByTournament } from "@/app/actions/matches";
import { createClient } from "@/lib/supabase/server";
import DashboardMatchCard from "@/components/DashboardMatchCard";
import { notFound } from "next/navigation";

export default async function DashboardTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  // Check if user has scorer access
  const hasScorerAccess = await hasAccess(id);

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
    return orderA - orderB;
  });

  // OPTIMIZATION: Batch fetch all innings for all matches at once (fixes N+1 query)
  const completedMatchIds = sortedMatches
    .filter((m) => m.status === "Completed")
    .map((m) => m.id);

  const supabase = await createClient();
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
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">{tournament.name}</h1>
          <p className="text-sm muted-text">
            {tournament.location} •{" "}
            {new Date(tournament.start_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {!hasScorerAccess && (
          <div
            className="rounded-lg p-3 mb-4 text-sm"
            style={{
              background: "rgba(251, 188, 5, 0.1)",
              border: "1px solid var(--warning)",
              color: "var(--warning)",
            }}
          >
            👁️ Viewing in spectator mode - You don&apos;t have scorer access to
            this tournament
          </div>
        )}

        <div className="flex justify-between items-center mb-3 px-2">
          <h2 className="text-base font-medium">Matches</h2>
          {hasScorerAccess && (
            <Link
              href={`/dashboard/match/new?tournament_id=${id}`}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              + New
            </Link>
          )}
        </div>

        {matches.length === 0 ? (
          <div
            className="cricket-card rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text">
              No matches yet. Create your first match!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matchesWithResult.map(({ match, winnerText }) => (
              <DashboardMatchCard
                key={match.id}
                match={match}
                winnerText={winnerText}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
