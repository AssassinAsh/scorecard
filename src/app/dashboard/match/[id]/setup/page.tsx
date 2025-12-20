import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import { getCurrentInnings, getAllInnings } from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import StartMatchButton from "@/components/StartMatchButton";
import StartSecondInningsButton from "@/components/StartSecondInningsButton";

export default async function MatchSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const players = await getPlayersByMatch(id);
  const teamAPlayers = players.filter((p) => p.team === "A");
  const teamBPlayers = players.filter((p) => p.team === "B");
  const currentInnings = await getCurrentInnings(id);
  const allInnings = await getAllInnings(id);

  const hasInnings = currentInnings !== null;
  const completedInnings = allInnings.filter((i) => i.is_completed);
  const firstCompletedInnings = completedInnings[0];
  const secondInningsBattingTeamName = firstCompletedInnings
    ? firstCompletedInnings.bowling_team === "A"
      ? match.team_a_name
      : match.team_b_name
    : "";

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
            href={`/dashboard/tournament/${match.tournament_id}`}
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Back to Tournament
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">
            {match.team_a_name} vs {match.team_b_name}
          </h1>
          <p className="text-sm muted-text">Match Setup</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="space-y-3">
          {/* Start Match Section - First Innings */}
          {!hasInnings &&
            completedInnings.length === 0 &&
            match.status === "Upcoming" && (
              <div
                className="rounded-lg p-6"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h2 className="text-base font-medium mb-2">Start Match</h2>
                <p className="text-sm muted-text mb-4">
                  Start the first innings. Players and toss details can be added
                  during scoring.
                </p>
                <StartMatchButton
                  matchId={id}
                  teamAName={match.team_a_name}
                  teamBName={match.team_b_name}
                />
              </div>
            )}

          {/* Start Second Innings Section */}
          {!hasInnings &&
            completedInnings.length === 1 &&
            match.status === "Live" && (
              <div
                className="rounded-lg p-6"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h2 className="text-base font-medium mb-2">
                  Start Second Innings
                </h2>
                <p className="text-sm muted-text mb-4">
                  {secondInningsBattingTeamName} will bat next.
                </p>
                <StartSecondInningsButton
                  matchId={id}
                  battingTeamName={secondInningsBattingTeamName}
                />
              </div>
            )}

          {/* Players Section */}
          {players.length > 0 && (
            <div
              className="rounded-lg p-4"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <h2 className="text-base font-medium mb-3">Players Added</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    {match.team_a_name} ({teamAPlayers.length})
                  </h3>
                  {teamAPlayers.length === 0 ? (
                    <p className="text-sm muted-text">No players yet</p>
                  ) : (
                    <ol className="text-sm space-y-1">
                      {teamAPlayers.map((p) => (
                        <li key={p.id} style={{ color: "var(--foreground)" }}>
                          {p.batting_order}. {p.name}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">
                    {match.team_b_name} ({teamBPlayers.length})
                  </h3>
                  {teamBPlayers.length === 0 ? (
                    <p className="text-sm muted-text">No players yet</p>
                  ) : (
                    <ol className="text-sm space-y-1">
                      {teamBPlayers.map((p) => (
                        <li key={p.id} style={{ color: "var(--foreground)" }}>
                          {p.batting_order}. {p.name}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Match (any ongoing innings) */}
          {hasInnings && (
            <div
              className="rounded-lg p-6 text-center"
              style={{
                background:
                  "color-mix(in srgb, var(--accent) 10%, transparent)",
                border: "1px solid var(--accent)",
              }}
            >
              <h3
                className="text-base font-medium mb-3"
                style={{ color: "var(--accent)" }}
              >
                Match is {match.status}!
              </h3>
              <Link
                href={`/dashboard/match/${id}/score`}
                className="inline-block px-6 py-3 rounded-md font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                Go to Scoring →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
