import Link from "next/link";
import { getMatchById } from "@/app/actions/matches";
import { getAllInnings, getInningsWithBalls } from "@/app/actions/scoring";
import { getPlayersByMatch } from "@/app/actions/matches";
import { notFound } from "next/navigation";
import {
  formatScore,
  formatOvers,
  calculateOvers,
  calculateBallRuns,
  isLegalBall,
} from "@/lib/cricket/scoring";
import type { Player } from "@/types";

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

  const inningsWithBalls = await Promise.all(
    innings.map(async (inn) => ({
      base: inn,
      detail: await getInningsWithBalls(inn.id),
    }))
  );

  const teamAPlayers = players.filter((p) => p.team === "A");
  const teamBPlayers = players.filter((p) => p.team === "B");

  const getTeamPlayers = (side: "A" | "B"): Player[] =>
    side === "A" ? teamAPlayers : teamBPlayers;

  const formatStrikeRate = (runs: number, balls: number): string => {
    if (balls === 0) return "-";
    return ((runs * 100) / balls).toFixed(2);
  };

  const formatEconomy = (runs: number, legalBalls: number): string => {
    if (legalBalls === 0) return "-";
    return ((runs * 6) / legalBalls).toFixed(2);
  };

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
        {inningsWithBalls.length > 0 ? (
          <div className="space-y-3">
            {inningsWithBalls.map(({ base: inning, detail }) => {
              const battingPlayersForInnings = getTeamPlayers(
                inning.batting_team
              );
              const bowlingPlayersForInnings = getTeamPlayers(
                inning.bowling_team
              );

              const battingStatsMap = new Map<
                string,
                { runs: number; balls: number; fours: number; sixes: number }
              >();
              const bowlingStatsMap = new Map<
                string,
                {
                  runs: number;
                  legalBalls: number;
                  maidens: number;
                  wickets: number;
                }
              >();

              if (detail && detail.overs) {
                for (const over of detail.overs) {
                  const overBalls = over.balls || [];
                  const bowlerId: string | null = over.bowler_id;

                  // Batting stats from each ball
                  for (const ball of overBalls) {
                    const strikerId: string = ball.striker_id;
                    const runsOffBat: number = ball.runs_off_bat;
                    const legal = isLegalBall(ball.extras_type);

                    if (!battingStatsMap.has(strikerId)) {
                      battingStatsMap.set(strikerId, {
                        runs: 0,
                        balls: 0,
                        fours: 0,
                        sixes: 0,
                      });
                    }
                    const bs = battingStatsMap.get(strikerId)!;
                    bs.runs += runsOffBat;
                    if (legal) {
                      bs.balls += 1;
                    }
                    if (runsOffBat === 4) bs.fours += 1;
                    if (runsOffBat === 6) bs.sixes += 1;
                  }

                  // Bowling stats per over
                  if (bowlerId) {
                    if (!bowlingStatsMap.has(bowlerId)) {
                      bowlingStatsMap.set(bowlerId, {
                        runs: 0,
                        legalBalls: 0,
                        maidens: 0,
                        wickets: 0,
                      });
                    }
                    const bowlerStats = bowlingStatsMap.get(bowlerId)!;

                    let runsThisOver = 0;
                    let legalBallsThisOver = 0;
                    let wicketsThisOver = 0;

                    for (const ball of overBalls) {
                      const runsConceded = calculateBallRuns(
                        ball.runs_off_bat,
                        ball.extras_runs
                      );
                      runsThisOver += runsConceded;

                      const legal = isLegalBall(ball.extras_type);
                      if (legal) {
                        legalBallsThisOver += 1;
                      }

                      if (
                        ball.wicket_type !== "None" &&
                        ball.wicket_type !== "RunOut"
                      ) {
                        wicketsThisOver += 1;
                      }
                    }

                    bowlerStats.runs += runsThisOver;
                    bowlerStats.legalBalls += legalBallsThisOver;
                    bowlerStats.wickets += wicketsThisOver;
                    // Maiden only after a complete over of 6 legal balls
                    if (runsThisOver === 0 && legalBallsThisOver === 6) {
                      bowlerStats.maidens += 1;
                    }
                  }
                }
              }

              const battingRows = battingPlayersForInnings
                .slice()
                .sort((a, b) => a.batting_order - b.batting_order)
                .map((player) => {
                  const s = battingStatsMap.get(player.id) || {
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                  };
                  return { player, ...s };
                });

              const bowlingRows = Array.from(bowlingStatsMap.entries())
                .map(([playerId, s]) => {
                  const player = bowlingPlayersForInnings.find(
                    (p) => p.id === playerId
                  );
                  if (!player) return null;
                  return { player, ...s };
                })
                .filter(Boolean) as Array<{
                player: Player;
                runs: number;
                legalBalls: number;
                maidens: number;
                wickets: number;
              }>;

              return (
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

                  {/* Batting & Bowling Scorecards */}
                  <div className="mt-4 grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Batting */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Batting</span>
                        <span className="muted-text">R B 4s 6s SR</span>
                      </div>
                      <div className="space-y-1">
                        {battingRows.map(
                          ({ player, runs, balls, fours, sixes }) => (
                            <div
                              key={player.id}
                              className="flex justify-between items-center"
                              style={{ color: "var(--foreground)" }}
                            >
                              <span>{player.name}</span>
                              <span className="tabular-nums">
                                {runs} {balls} {fours} {sixes}{" "}
                                {formatStrikeRate(runs, balls)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Bowling */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Bowling</span>
                        <span className="muted-text">O M R W Econ</span>
                      </div>
                      <div className="space-y-1">
                        {bowlingRows.map(
                          ({ player, runs, legalBalls, maidens, wickets }) => (
                            <div
                              key={player.id}
                              className="flex justify-between items-center"
                              style={{ color: "var(--foreground)" }}
                            >
                              <span>{player.name}</span>
                              <span className="tabular-nums">
                                {formatOvers(calculateOvers(legalBalls))}{" "}
                                {maidens} {runs} {wickets}{" "}
                                {formatEconomy(runs, legalBalls)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

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
