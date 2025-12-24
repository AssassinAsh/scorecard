import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import {
  getCurrentInnings,
  getAllInnings,
  getRecentBalls,
  getInningsWithBalls,
} from "@/app/actions/scoring";
import {
  formatScore,
  formatOvers,
  calculateOvers,
  calculateBallRuns,
  isLegalBall,
} from "@/lib/cricket/scoring";
import {
  calculateBattingStats,
  calculateBowlingStats,
  buildDismissalMap,
  formatStrikeRate,
  formatEconomy,
} from "@/lib/cricket/stats";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import FullscreenDisplay from "@/components/FullscreenDisplay";

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
  runs: number;
  wickets: number;
  economy: string;
};

export default function DisplayPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#000" }}
        >
          <div className="text-white text-2xl">Loading...</div>
        </div>
      }
    >
      <DisplayPageContent {...props} />
    </Suspense>
  );
}

async function DisplayPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Parallelize independent queries for faster page loads
  const [match, players, currentInnings, allInnings] = await Promise.all([
    getMatchById(id),
    getPlayersByMatch(id),
    getCurrentInnings(id),
    getAllInnings(id),
  ]);

  if (!match) {
    notFound();
  }
  const completedInnings = allInnings.filter((i) => i.is_completed);
  const firstCompletedInnings = completedInnings[0];

  const displayInnings =
    currentInnings || completedInnings[completedInnings.length - 1] || null;

  // Parallelize displayInnings-dependent queries
  const [recentBalls, inningsDetail] = displayInnings
    ? await Promise.all([
        getRecentBalls(displayInnings.id),
        getInningsWithBalls(displayInnings.id),
      ])
    : [[], null];

  // Second innings chase information
  const isSecondInnings =
    displayInnings &&
    firstCompletedInnings &&
    displayInnings.id !== firstCompletedInnings.id &&
    match.status !== "Completed";

  const targetRuns = isSecondInnings
    ? firstCompletedInnings.total_runs + 1
    : null;

  const ballsRemaining = isSecondInnings
    ? match.overs_per_innings * 6 - displayInnings!.balls_bowled
    : null;

  // Calculate current partnership
  let currentPartnership: {
    runs: number;
    balls: number;
    striker: { name: string; runs: number; balls: number };
    nonStriker: { name: string; runs: number; balls: number };
  } | null = null;

  // Live batting and bowling stats
  let liveBatting: LiveBattingRow[] = [];
  let liveBowling: LiveBowlingRow[] = [];
  let currentBowler: LiveBowlingRow | null = null;

  if (displayInnings && inningsDetail) {
    const battingPlayers = players.filter(
      (p) => p.team === displayInnings.batting_team
    );
    const bowlingPlayers = players.filter(
      (p) => p.team === displayInnings.bowling_team
    );

    // Use shared stat calculation utilities
    const battingStatsMap = calculateBattingStats(inningsDetail);
    const bowlingStatsMap = calculateBowlingStats(inningsDetail);

    liveBatting = battingPlayers
      .slice()
      .sort((a, b) => a.batting_order - b.batting_order)
      .map((player) => {
        const s = battingStatsMap.get(player.id) || {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
        };
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
        const player = bowlingPlayers.find((p) => p.id === playerId);
        if (!player) return null;
        return {
          playerId,
          name: player.name,
          overs: formatOvers(calculateOvers(s.legalBalls)),
          runs: s.runs,
          wickets: s.wickets,
          economy: formatEconomy(s.runs, s.legalBalls),
        };
      })
      .filter((row): row is LiveBowlingRow => row !== null);

    // Get current bowler (from latest ball)
    if (recentBalls.length > 0) {
      const latestBall = recentBalls[0];
      const latestOver = inningsDetail.overs?.find(
        (o: any) => o.id === latestBall.over_id
      );
      if (latestOver?.bowler_id) {
        currentBowler =
          liveBowling.find((b) => b.playerId === latestOver.bowler_id) || null;
      }
    }

    // Calculate current partnership
    if (recentBalls.length > 0) {
      const latestBall = recentBalls[0];
      const strikerId = latestBall.striker_id;
      const nonStrikerId = latestBall.non_striker_id;

      const strikerStats = battingStatsMap.get(strikerId);
      const nonStrikerStats = battingStatsMap.get(nonStrikerId);

      if (strikerStats && nonStrikerStats) {
        const striker = battingPlayers.find((p) => p.id === strikerId);
        const nonStriker = battingPlayers.find((p) => p.id === nonStrikerId);

        if (striker && nonStriker) {
          // Calculate partnership from recent balls
          let partnershipRuns = 0;
          let partnershipBalls = 0;

          for (const ball of recentBalls) {
            if (
              (ball.striker_id === strikerId ||
                ball.striker_id === nonStrikerId) &&
              (ball.non_striker_id === strikerId ||
                ball.non_striker_id === nonStrikerId)
            ) {
              partnershipRuns += ball.runs_off_bat + ball.extras_runs;
              if (isLegalBall(ball.extras_type)) {
                partnershipBalls += 1;
              }
            } else {
              break; // Partnership ended
            }
          }

          currentPartnership = {
            runs: partnershipRuns,
            balls: partnershipBalls,
            striker: {
              name: striker.name,
              runs: strikerStats.runs,
              balls: strikerStats.balls,
            },
            nonStriker: {
              name: nonStriker.name,
              runs: nonStrikerStats.runs,
              balls: nonStrikerStats.balls,
            },
          };
        }
      }
    }
  }

  // Get current over balls for display
  const totalLegalBalls = displayInnings?.balls_bowled || 0;
  const legalThisOver = totalLegalBalls === 0 ? 0 : totalLegalBalls % 6;
  const displayOverBalls: string[] = [];

  if (legalThisOver > 0 && recentBalls.length > 0) {
    let legalCount = 0;
    for (const ball of recentBalls) {
      const isLegal = isLegalBall(ball.extras_type);

      let ballDisplay = "";
      if (ball.wicket_type !== "None") {
        ballDisplay = "W";
      } else if (ball.runs_off_bat === 6) {
        ballDisplay = "6";
      } else if (ball.runs_off_bat === 4) {
        ballDisplay = "4";
      } else if (ball.extras_type === "Wide") {
        ballDisplay = `Wd`;
      } else if (ball.extras_type === "NoBall") {
        ballDisplay = `Nb`;
      } else {
        ballDisplay = ball.runs_off_bat.toString();
      }

      displayOverBalls.unshift(ballDisplay);

      if (isLegal) {
        legalCount += 1;
        if (legalCount >= legalThisOver) break;
      }
    }
  }

  // Match result for completed matches
  let matchResult: string | null = null;
  if (match.status === "Completed" && completedInnings.length >= 2) {
    const firstInningsCompleted = completedInnings[0];
    const secondInningsCompleted = completedInnings[1];
    const winnerSide = match.winner_team;
    const winnerName =
      winnerSide === "A"
        ? match.team_a_name
        : winnerSide === "B"
        ? match.team_b_name
        : null;

    if (winnerName) {
      const firstRuns = firstInningsCompleted.total_runs;
      const secondRuns = secondInningsCompleted.total_runs;

      if (winnerSide === firstInningsCompleted.batting_team) {
        const margin = Math.max(firstRuns - secondRuns, 0);
        matchResult = `${winnerName} won by ${margin} run${
          margin === 1 ? "" : "s"
        }`;
      } else if (winnerSide === secondInningsCompleted.batting_team) {
        const wicketsRemaining = Math.max(
          10 - secondInningsCompleted.wickets,
          1
        );
        matchResult = `${winnerName} won by ${wicketsRemaining} wicket${
          wicketsRemaining === 1 ? "" : "s"
        }`;
      }
    }
  }

  return (
    <>
      <FullscreenDisplay
        match={match}
        displayInnings={displayInnings}
        allInnings={allInnings}
        completedInnings={completedInnings}
        isSecondInnings={Boolean(isSecondInnings)}
        targetRuns={targetRuns}
        ballsRemaining={ballsRemaining}
        currentPartnership={currentPartnership}
        liveBatting={liveBatting}
        currentBowler={currentBowler}
        displayOverBalls={displayOverBalls}
        matchResult={matchResult}
      />

      {/* Real-time updates for live matches */}
      <RealtimeRefresh
        matchId={id}
        enabled={match.status === "Live" || match.status === "Innings Break"}
      />
    </>
  );
}
