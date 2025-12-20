import Link from "next/link";
import { getMatchById } from "@/app/actions/matches";
import { getAllInnings } from "@/app/actions/scoring";
import { getPlayersByMatch } from "@/app/actions/matches";
import { notFound } from "next/navigation";
import {
  formatScore,
  formatOvers,
  calculateOvers,
} from "@/lib/cricket/scoring";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const innings = await getAllInnings(id);
  const players = await getPlayersByMatch(id);

  const teamAPlayers = players.filter((p) => p.team === "A");
  const teamBPlayers = players.filter((p) => p.team === "B");

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
            href={`/tournament/${match.tournament_id}`}
            className="text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            ← Back to Tournament
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        {/* Match Header Card */}
        <div
          className="cricket-card rounded-lg p-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg sm:text-xl font-medium">
              {match.team_a_name} vs {match.team_b_name}
            </h1>
            <span
              className="px-2 py-1 rounded text-xs font-medium"
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
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {new Date(match.match_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            • {match.overs_per_innings} overs per side
          </p>

          {/* Toss Info */}
          {match.toss_winner && (
            <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
              {match.toss_winner === "team_a"
                ? match.team_a_name
                : match.team_b_name}{" "}
              won the toss and chose to {match.toss_decision}
            </p>
          )}
        </div>

        {/* Score Cards - Google Style */}
        {innings.length > 0 ? (
          <div className="space-y-3">
            {innings.map((inning) => (
              <div
                key={inning.id}
                className="cricket-card rounded-lg p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Team Name */}
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base sm:text-lg font-medium team-name">
                    {inning.batting_team === "A"
                      ? match.team_a_name
                      : match.team_b_name}
                  </h2>
                  {inning.is_completed && (
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        color: "var(--muted)",
                        background: "var(--background)",
                      }}
                    >
                      Completed
                    </span>
                  )}
                </div>

                {/* Score - Large and Prominent */}
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-4xl sm:text-5xl font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {formatScore(inning.total_runs, inning.wickets)}
                  </span>
                  <span className="text-lg sm:text-xl muted-text">
                    ({formatOvers(calculateOvers(inning.balls_bowled))} ov)
                  </span>
                </div>
              </div>
            ))}

            {/* Result Banner */}
            {match.status === "Completed" && (
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: match.winner_team
                    ? "color-mix(in srgb, var(--success) 10%, transparent)"
                    : "color-mix(in srgb, var(--muted) 10%, transparent)",
                  border: match.winner_team
                    ? "1px solid var(--success)"
                    : "1px solid var(--border)",
                }}
              >
                <p
                  className="font-medium text-base sm:text-lg"
                  style={{
                    color: match.winner_team
                      ? "var(--success)"
                      : "var(--muted)",
                  }}
                >
                  {match.winner_team ? (
                    <>
                      🏆{" "}
                      {match.winner_team === "team_a"
                        ? match.team_a_name
                        : match.team_b_name}{" "}
                      won the match
                    </>
                  ) : (
                    "Match drawn"
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="cricket-card rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text">
              {match.status === "Upcoming"
                ? "Match hasn't started yet"
                : "No score available"}
            </p>
          </div>
        )}

        {/* Teams Section */}
        {(teamAPlayers.length > 0 || teamBPlayers.length > 0) && (
          <div className="space-y-3">
            {/* Team A */}
            {teamAPlayers.length > 0 && (
              <div
                className="cricket-card rounded-lg p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3 className="text-base font-medium mb-3 team-name">
                  {match.team_a_name}
                </h3>
                <ol className="space-y-1.5">
                  {teamAPlayers.map((player) => (
                    <li
                      key={player.id}
                      className="text-sm flex items-center gap-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      <span
                        className="w-6 text-right"
                        style={{ color: "var(--muted)" }}
                      >
                        {player.batting_order}.
                      </span>
                      <span>{player.name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Team B */}
            {teamBPlayers.length > 0 && (
              <div
                className="cricket-card rounded-lg p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3 className="text-base font-medium mb-3 team-name">
                  {match.team_b_name}
                </h3>
                <ol className="space-y-1.5">
                  {teamBPlayers.map((player) => (
                    <li
                      key={player.id}
                      className="text-sm flex items-center gap-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      <span
                        className="w-6 text-right"
                        style={{ color: "var(--muted)" }}
                      >
                        {player.batting_order}.
                      </span>
                      <span>{player.name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
