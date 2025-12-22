import Link from "next/link";
import { getTournamentById, hasAccess } from "@/app/actions/tournaments";
import { getMatchesByTournament } from "@/app/actions/matches";
import { createClient } from "@/lib/supabase/server";
import DashboardMatchCard from "@/components/DashboardMatchCard";
import Footer from "@/components/Footer";
import NewMatchButton from "@/components/NewMatchButton";
import { notFound } from "next/navigation";

export default async function TournamentPage({
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
    notFound();
  }

  // Check if user has scorer access
  const hasScorerAccess = user ? await hasAccess(id) : false;

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
            href="/"
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← {user ? "Dashboard" : "All Tournaments"}
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">{tournament.name}</h1>
          <p className="text-sm mt-1 muted-text">
            {tournament.location} •{" "}
            {new Date(tournament.start_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

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
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium px-2">Matches</h2>
          {hasScorerAccess && <NewMatchButton tournamentId={id} />}
        </div>

        {matches.length === 0 ? (
          <div
            className="cricket-card rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text">No matches scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matchesWithResult.map(({ match, winnerText }) =>
              user ? (
                <DashboardMatchCard
                  key={match.id}
                  match={match}
                  winnerText={winnerText}
                />
              ) : (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="cricket-card block rounded-lg p-4"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium team-name truncate">
                        {match.team_a_name} vs {match.team_b_name}
                      </h3>
                      <p className="text-sm muted-text mt-1">
                        {new Date(match.match_date).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}{" "}
                        • {match.overs_per_innings} overs
                      </p>
                      {winnerText && (
                        <p
                          className="text-sm mt-2 font-medium"
                          style={{ color: "var(--success)" }}
                        >
                          {winnerText}
                        </p>
                      )}
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
                      style={{
                        background:
                          match.status === "Live"
                            ? "rgba(234, 67, 53, 0.1)"
                            : match.status === "Completed"
                            ? "rgba(52, 168, 83, 0.1)"
                            : "rgba(128, 134, 139, 0.1)",
                        color:
                          match.status === "Live"
                            ? "var(--danger)"
                            : match.status === "Completed"
                            ? "var(--success)"
                            : "var(--muted)",
                      }}
                    >
                      {match.status}
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
