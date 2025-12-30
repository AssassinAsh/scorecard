import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import { createClient } from "@/lib/supabase/server";
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
  buildDisplayOverBalls,
} from "@/lib/cricket/scoring";
import {
  calculateBattingStats,
  calculateBowlingStats,
  buildDismissalMap,
  formatStrikeRate,
  formatEconomy,
  getBattingAppearanceOrder,
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

  // Require authentication for the display route, but do not enforce
  // scorer/admin permissions. Any logged-in user can view the
  // fullscreen display.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
  let isFreeHit = false;

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

    const battingAppearanceOrder = getBattingAppearanceOrder(inningsDetail);

    liveBatting = battingPlayers
      .slice()
      .sort((a, b) => {
        const orderA = battingAppearanceOrder.get(a.id);
        const orderB = battingAppearanceOrder.get(b.id);

        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }
        if (orderA !== undefined) return -1;
        if (orderB !== undefined) return 1;
        return a.batting_order - b.batting_order;
      })
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

    // Get current bowler. Prefer the bowler from the latest over so that
    // bowler changes (including a brand new over) are reflected even before
    // the first ball of that over is bowled.
    if (inningsDetail.overs && inningsDetail.overs.length > 0) {
      const sortedOvers = [...inningsDetail.overs].sort(
        (a: any, b: any) => a.over_number - b.over_number
      );
      const latestOver = sortedOvers[sortedOvers.length - 1];

      if (latestOver?.bowler_id) {
        currentBowler =
          liveBowling.find((b) => b.playerId === latestOver.bowler_id) || null;
      }
    } else if (recentBalls.length > 0) {
      // Fallback: derive from the latest ball's over if overs metadata
      // is unavailable for some reason.
      const latestBall = recentBalls[0];
      const latestOver = inningsDetail.overs?.find(
        (o: any) => o.id === latestBall.over_id
      );
      if (latestOver?.bowler_id) {
        currentBowler =
          liveBowling.find((b) => b.playerId === latestOver.bowler_id) || null;
      }
    }

    // Free hit handling: if the most recent delivery was a no-ball
    // without a wicket, the next ball is a free hit. This mirrors
    // the logic used in the scoring interface.
    if (
      recentBalls.length > 0 &&
      recentBalls[0].extras_type === "NoBall" &&
      recentBalls[0].wicket_type === "None"
    ) {
      isFreeHit = true;
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

  // Get current over balls for display using shared utility
  const displayOverBalls = buildDisplayOverBalls(
    recentBalls,
    displayInnings?.balls_bowled || 0,
    false
  );

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
        isFreeHit={isFreeHit}
      />

      {/* Real-time updates for live matches */}
      <RealtimeRefresh
        matchId={id}
        enabled={match.status === "Live" || match.status === "Innings Break"}
      />
    </>
  );
}
