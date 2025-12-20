import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import {
  getCurrentInnings,
  getAllInnings,
  getRecentBalls,
  getInningsWithBalls,
} from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import {
  formatScore,
  formatOvers,
  calculateOvers,
  calculateBallRuns,
  isLegalBall,
} from "@/lib/cricket/scoring";
import ScoringInterface from "@/components/ScoringInterface";

type LiveBattingRow = {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
};

type LiveBowlingRow = {
  playerId: string;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
};

export default async function ScoringPage({
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
  const currentInnings = await getCurrentInnings(id);
  const allInnings = await getAllInnings(id);
  const recentBalls = currentInnings
    ? await getRecentBalls(currentInnings.id)
    : [];

  const inningsDetail = currentInnings
    ? await getInningsWithBalls(currentInnings.id)
    : null;

  const completedInnings = allInnings.filter((i) => i.is_completed);
  const firstCompletedInnings = completedInnings[0];

  const firstInnings = allInnings[0] || null;
  const firstInningsTeam: "A" | "B" | null = firstInnings
    ? firstInnings.batting_team
    : null;

  // Second innings chase information
  const isSecondInnings =
    currentInnings &&
    firstCompletedInnings &&
    currentInnings.id !== firstCompletedInnings.id;

  const targetRuns = isSecondInnings
    ? firstCompletedInnings.total_runs + 1
    : null;

  const ballsRemaining = isSecondInnings
    ? match.overs_per_innings * 6 - currentInnings!.balls_bowled
    : null;

  // Live batting and bowling stats for the current innings
  let liveBatting: LiveBattingRow[] = [];
  let liveBowling: LiveBowlingRow[] = [];

  if (currentInnings && inningsDetail) {
    const battingPlayersForInnings = players.filter(
      (p) => p.team === currentInnings.batting_team
    );
    const bowlingPlayersForInnings = players.filter(
      (p) => p.team === currentInnings.bowling_team
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

    const formatStrikeRate = (runs: number, balls: number): string => {
      if (balls === 0) return "-";
      return ((runs * 100) / balls).toFixed(2);
    };

    const formatEconomy = (runs: number, legalBalls: number): string => {
      if (legalBalls === 0) return "-";
      return ((runs * 6) / legalBalls).toFixed(2);
    };

    if (inningsDetail.overs) {
      for (const over of inningsDetail.overs) {
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

            if (ball.wicket_type !== "None" && ball.wicket_type !== "RunOut") {
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

    liveBatting = battingPlayersForInnings
      .slice()
      .sort((a, b) => a.batting_order - b.batting_order)
      .map((player) => {
        const s =
          battingStatsMap.get(player.id) ||
          ({ runs: 0, balls: 0, fours: 0, sixes: 0 } as const);
        return {
          playerId: player.id,
          name: player.name,
          runs: s.runs,
          balls: s.balls,
          fours: s.fours,
          sixes: s.sixes,
          strikeRate: formatStrikeRate(s.runs, s.balls),
        };
      });

    liveBowling = Array.from(bowlingStatsMap.entries())
      .map(([playerId, s]) => {
        const player = bowlingPlayersForInnings.find((p) => p.id === playerId);
        if (!player) return null;
        return {
          playerId,
          name: player.name,
          overs: formatOvers(calculateOvers(s.legalBalls)),
          maidens: s.maidens,
          runs: s.runs,
          wickets: s.wickets,
          economy: formatEconomy(s.runs, s.legalBalls),
        };
      })
      .filter((row): row is LiveBowlingRow => row !== null);
  }

  // First innings scorecard data (for display during second innings)
  let firstInningsBatting: LiveBattingRow[] = [];
  let firstInningsBowling: LiveBowlingRow[] = [];

  if (firstCompletedInnings) {
    const firstDetail = await getInningsWithBalls(firstCompletedInnings.id);

    if (firstDetail && firstDetail.overs) {
      const battingPlayersForFirst = players.filter(
        (p) => p.team === firstCompletedInnings.batting_team
      );
      const bowlingPlayersForFirst = players.filter(
        (p) => p.team === firstCompletedInnings.bowling_team
      );

      const firstBattingStats = new Map<
        string,
        { runs: number; balls: number; fours: number; sixes: number }
      >();
      const firstBowlingStats = new Map<
        string,
        {
          runs: number;
          legalBalls: number;
          maidens: number;
          wickets: number;
        }
      >();

      const formatStrikeRateFirst = (runs: number, balls: number): string => {
        if (balls === 0) return "-";
        return ((runs * 100) / balls).toFixed(2);
      };

      const formatEconomyFirst = (runs: number, legalBalls: number): string => {
        if (legalBalls === 0) return "-";
        return ((runs * 6) / legalBalls).toFixed(2);
      };

      for (const over of firstDetail.overs) {
        const overBalls = over.balls || [];
        const bowlerId: string | null = over.bowler_id;

        // Batting stats
        for (const ball of overBalls) {
          const strikerId: string = ball.striker_id;
          const runsOffBat: number = ball.runs_off_bat;
          const legal = isLegalBall(ball.extras_type);

          if (!firstBattingStats.has(strikerId)) {
            firstBattingStats.set(strikerId, {
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
            });
          }
          const bs = firstBattingStats.get(strikerId)!;
          bs.runs += runsOffBat;
          if (legal) {
            bs.balls += 1;
          }
          if (runsOffBat === 4) bs.fours += 1;
          if (runsOffBat === 6) bs.sixes += 1;
        }

        // Bowling stats per over
        if (bowlerId) {
          if (!firstBowlingStats.has(bowlerId)) {
            firstBowlingStats.set(bowlerId, {
              runs: 0,
              legalBalls: 0,
              maidens: 0,
              wickets: 0,
            });
          }
          const bowlerStats = firstBowlingStats.get(bowlerId)!;

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

            if (ball.wicket_type !== "None" && ball.wicket_type !== "RunOut") {
              wicketsThisOver += 1;
            }
          }

          bowlerStats.runs += runsThisOver;
          bowlerStats.legalBalls += legalBallsThisOver;
          bowlerStats.wickets += wicketsThisOver;
          if (runsThisOver === 0 && legalBallsThisOver === 6) {
            bowlerStats.maidens += 1;
          }
        }
      }

      firstInningsBatting = battingPlayersForFirst
        .slice()
        .sort((a, b) => a.batting_order - b.batting_order)
        .map((player) => {
          const s =
            firstBattingStats.get(player.id) ||
            ({ runs: 0, balls: 0, fours: 0, sixes: 0 } as const);
          return {
            playerId: player.id,
            name: player.name,
            runs: s.runs,
            balls: s.balls,
            fours: s.fours,
            sixes: s.sixes,
            strikeRate: formatStrikeRateFirst(s.runs, s.balls),
          };
        });

      firstInningsBowling = Array.from(firstBowlingStats.entries())
        .map(([playerId, s]) => {
          const player = bowlingPlayersForFirst.find((p) => p.id === playerId);
          if (!player) return null;
          return {
            playerId,
            name: player.name,
            overs: formatOvers(calculateOvers(s.legalBalls)),
            maidens: s.maidens,
            runs: s.runs,
            wickets: s.wickets,
            economy: formatEconomyFirst(s.runs, s.legalBalls),
          };
        })
        .filter((row): row is LiveBowlingRow => row !== null);
    }
  }

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
            href={`/dashboard/match/${id}/setup`}
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Setup
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-medium">
              {match.team_a_name} vs {match.team_b_name}
            </h1>
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background:
                  match.status === "Completed"
                    ? "rgba(15, 157, 88, 0.1)"
                    : "rgba(234, 67, 53, 0.1)",
                color:
                  match.status === "Completed" ? "#0F9D58" : "var(--danger)",
              }}
            >
              {match.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Previous Innings Summary */}
        {allInnings.filter((i) => i.is_completed).length > 0 && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-sm font-medium mb-3 muted-text">
              Previous Innings
            </h2>
            <div className="space-y-2">
              {allInnings
                .filter((i) => i.is_completed)
                .map((inning) => (
                  <div
                    key={inning.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">
                      {inning.batting_team === "A"
                        ? match.team_a_name
                        : match.team_b_name}
                    </span>
                    <span className="text-base">
                      {formatScore(inning.total_runs, inning.wickets)} (
                      {formatOvers(calculateOvers(inning.balls_bowled))} ov)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Scoring Interface */}
        {currentInnings ? (
          <ScoringInterface
            matchId={id}
            inningsId={currentInnings.id}
            battingTeam={currentInnings.batting_team}
            bowlingTeam={currentInnings.bowling_team}
            teamAName={match.team_a_name}
            teamBName={match.team_b_name}
            currentScore={currentInnings.total_runs}
            currentWickets={currentInnings.wickets}
            ballsBowled={currentInnings.balls_bowled}
            maxOvers={match.overs_per_innings}
            existingPlayers={players}
            recentBalls={recentBalls}
            tossWinner={match.toss_winner}
            tossDecision={match.toss_decision}
            isSecondInnings={Boolean(isSecondInnings)}
            targetRuns={targetRuns}
            ballsRemaining={ballsRemaining}
            firstInningsTeam={firstInningsTeam}
            liveBatting={liveBatting}
            liveBowling={liveBowling}
            firstInningsBatting={firstInningsBatting}
            firstInningsBowling={firstInningsBowling}
            readOnly={false}
          />
        ) : (
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text mb-4">
              No active innings. Start the match from the setup page.
            </p>
            <Link
              href={`/dashboard/match/${id}/setup`}
              className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Go to Setup
            </Link>
          </div>
        )}

        {/* View Public Scorecard */}
        <div className="mt-4 text-center">
          <Link
            href={`/match/${id}`}
            target="_blank"
            className="text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            View Public Scorecard →
          </Link>
        </div>
      </main>
    </div>
  );
}
