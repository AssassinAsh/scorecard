import Link from "next/link";
import { getTournamentById } from "@/app/actions/tournaments";
import { getMatchesByTournament } from "@/app/actions/matches";
import { getAllInnings } from "@/app/actions/scoring";
import { notFound } from "next/navigation";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  const matches = await getMatchesByTournament(id);

  const matchesWithResult = await Promise.all(
    matches.map(async (match) => {
      let winnerText: string | null = null;

      if (match.status === "Completed") {
        const innings = await getAllInnings(match.id);

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
    })
  );

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
            ← All Tournaments
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

      <main className="max-w-4xl mx-auto px-4 py-4">
        <h2 className="text-base font-medium mb-3 px-2">Matches</h2>

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
            {matchesWithResult.map(({ match, winnerText }) => (
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
                      {new Date(match.match_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
