import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import {
  getCurrentInnings,
  getAllInnings,
  getRecentBalls,
  getInningsWithBalls,
  getRetirementsForInnings,
} from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import {
  formatScore,
  formatOvers,
  calculateOvers,
  calculateBallRuns,
  calculateRunRate,
  formatRunRate,
  isLegalBall,
} from "@/lib/cricket/scoring";
import {
  calculateBattingStats,
  calculateBowlingStats,
  calculateExtras,
  buildDismissalMap,
  formatStrikeRate,
  formatEconomy,
  getBattingAppearanceOrder,
} from "@/lib/cricket/stats";
import ScoringInterface from "@/components/ScoringInterface";
import InningsButton from "@/components/InningsButton";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { MatchSkeleton } from "@/components/Skeletons";

// Enable ISR with very short revalidation for live scoring page
export const revalidate = 10;

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    return { title: "Match Not Found - CrickSnap" };
  }

  return {
    title: `Score: ${match.team_a_name} vs ${match.team_b_name} - CrickSnap`,
    description: `Live scoring interface for ${match.team_a_name} vs ${match.team_b_name}`,
    robots: "noindex", // Don't index scoring interface (private)
  };
}

type LiveBattingRow = {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  dismissal?: string | null;
  isOut?: boolean;
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

export default function ScoringPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <ScoringPageContent {...props} />
    </Suspense>
  );
}

async function ScoringPageContent({
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

  const hasActiveInnings = Boolean(currentInnings);

  const secondInningsBattingTeamName = firstCompletedInnings
    ? firstCompletedInnings.bowling_team === "A"
      ? match.team_a_name
      : match.team_b_name
    : "";

  // For scorers, show a scorecard even after the match is completed.
  // Prefer the active innings if there is one, otherwise fall back to
  // the last completed innings.
  const displayInnings =
    currentInnings || completedInnings[completedInnings.length - 1] || null;

  // Parallelize displayInnings-dependent queries
  const [recentBalls, inningsDetail, retirements] = displayInnings
    ? await Promise.all([
        getRecentBalls(displayInnings.id),
        getInningsWithBalls(displayInnings.id),
        getRetirementsForInnings(displayInnings.id),
      ])
    : [[], null, []];

  const firstInnings = allInnings[0] || null;
  const firstInningsTeam: "A" | "B" | null = firstInnings
    ? firstInnings.batting_team
    : null;

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

  // Extras for the current/last innings
  const currentInningsExtras =
    displayInnings && inningsDetail ? calculateExtras(inningsDetail) : null;

  // Live batting and bowling stats for the current innings
  let liveBatting: LiveBattingRow[] = [];
  let liveBowling: LiveBowlingRow[] = [];

  // Match result text for completed games
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
        matchResult =
          margin > 0
            ? `${winnerName} won by ${margin} run${margin === 1 ? "" : "s"}.`
            : `${winnerName} won the match.`;
      } else if (winnerSide === secondInningsCompleted.batting_team) {
        const wicketsRemaining = Math.max(
          10 - secondInningsCompleted.wickets,
          1,
        );
        matchResult = `${winnerName} won by ${wicketsRemaining} wicket${
          wicketsRemaining === 1 ? "" : "s"
        }.`;
      }
    } else if (firstCompletedInnings && completedInnings.length >= 2) {
      const firstRuns = completedInnings[0].total_runs;
      const secondRuns = completedInnings[1].total_runs;
      if (firstRuns === secondRuns) {
        matchResult = "Match tied.";
      }
    }
  }

  // Final team summaries for completed matches
  let teamASummary: { runs: number; wickets: number; overs: string } | null =
    null;
  let teamBSummary: { runs: number; wickets: number; overs: string } | null =
    null;

  if (match.status === "Completed" && completedInnings.length > 0) {
    for (const inning of completedInnings) {
      const summary = {
        runs: inning.total_runs,
        wickets: inning.wickets,
        overs: formatOvers(calculateOvers(inning.balls_bowled)),
      };

      if (inning.batting_team === "A") {
        teamASummary = summary;
      } else {
        teamBSummary = summary;
      }
    }
  }

  if (displayInnings && inningsDetail) {
    const battingPlayersForInnings = players.filter(
      (p) => p.team === displayInnings.batting_team,
    );
    const bowlingPlayersForInnings = players.filter(
      (p) => p.team === displayInnings.bowling_team,
    );

    // Use shared stat calculation utilities
    const battingStatsMap = calculateBattingStats(inningsDetail);
    const bowlingStatsMap = calculateBowlingStats(inningsDetail);
    const dismissalMap = buildDismissalMap(
      inningsDetail,
      bowlingPlayersForInnings,
    );

    const retirementMap = new Map<string, string>();
    for (const r of retirements) {
      retirementMap.set(r.player_id, r.reason);
    }

    const battingAppearanceOrder = getBattingAppearanceOrder(inningsDetail);

    liveBatting = battingPlayersForInnings
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
        const s =
          battingStatsMap.get(player.id) ||
          ({ runs: 0, balls: 0, fours: 0, sixes: 0 } as const);
        let dismissal: string | null = dismissalMap.get(player.id) || null;

        const retireReason = retirementMap.get(player.id);
        if (retireReason) {
          dismissal = "Retired";
        }
        return {
          playerId: player.id,
          name: player.name,
          runs: s.runs,
          balls: s.balls,
          fours: s.fours,
          sixes: s.sixes,
          strikeRate: formatStrikeRate(s.runs, s.balls),
          dismissal,
          isOut: Boolean(dismissal),
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

  const betweenInnings =
    !hasActiveInnings &&
    completedInnings.length === 1 &&
    match.status === "Innings Break";

  // First innings scorecard data (for display during second innings)
  let firstInningsBatting: LiveBattingRow[] = [];
  let firstInningsBowling: LiveBowlingRow[] = [];
  let firstInningsExtras: number | null = null;
  let firstInningsRunRate: string | null = null;

  if (firstCompletedInnings) {
    const firstDetail = await getInningsWithBalls(firstCompletedInnings.id);

    if (firstDetail) {
      const battingPlayersForFirst = players.filter(
        (p) => p.team === firstCompletedInnings.batting_team,
      );
      const bowlingPlayersForFirst = players.filter(
        (p) => p.team === firstCompletedInnings.bowling_team,
      );

      // Use shared stat calculation utilities
      const firstBattingStats = calculateBattingStats(firstDetail);
      const firstBowlingStats = calculateBowlingStats(firstDetail);
      const firstDismissalMap = buildDismissalMap(
        firstDetail,
        bowlingPlayersForFirst,
      );

      firstInningsExtras = calculateExtras(firstDetail);
      firstInningsRunRate = formatRunRate(
        calculateRunRate(
          firstCompletedInnings.total_runs,
          firstCompletedInnings.balls_bowled,
        ),
      );

      const firstBattingAppearanceOrder =
        getBattingAppearanceOrder(firstDetail);

      firstInningsBatting = battingPlayersForFirst
        .slice()
        .sort((a, b) => {
          const orderA = firstBattingAppearanceOrder.get(a.id);
          const orderB = firstBattingAppearanceOrder.get(b.id);

          if (orderA !== undefined && orderB !== undefined) {
            return orderA - orderB;
          }
          if (orderA !== undefined) return -1;
          if (orderB !== undefined) return 1;
          return a.batting_order - b.batting_order;
        })
        .map((player) => {
          const s =
            firstBattingStats.get(player.id) ||
            ({ runs: 0, balls: 0, fours: 0, sixes: 0 } as const);
          const dismissal = firstDismissalMap.get(player.id) || null;
          return {
            playerId: player.id,
            name: player.name,
            runs: s.runs,
            balls: s.balls,
            fours: s.fours,
            sixes: s.sixes,
            strikeRate: formatStrikeRate(s.runs, s.balls),
            dismissal,
            isOut: Boolean(dismissal),
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
            economy: formatEconomy(s.runs, s.legalBalls),
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

        {/* Scoring Interface or Second Innings CTA */}
        {betweenInnings ? (
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-base font-medium mb-2">Start Second Innings</h2>
            <p className="text-sm muted-text mb-4">
              {secondInningsBattingTeamName} will bat next.
            </p>
            <InningsButton
              matchId={id}
              inningsNumber={2}
              battingTeamName={secondInningsBattingTeamName}
            />
          </div>
        ) : displayInnings ? (
          <ScoringInterface
            key={displayInnings.id}
            matchId={id}
            inningsId={displayInnings.id}
            battingTeam={displayInnings.batting_team}
            bowlingTeam={displayInnings.bowling_team}
            teamAName={match.team_a_name}
            teamBName={match.team_b_name}
            currentScore={displayInnings.total_runs}
            currentWickets={displayInnings.wickets}
            ballsBowled={displayInnings.balls_bowled}
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
            currentInningsExtras={currentInningsExtras}
            firstInningsExtras={firstInningsExtras}
            firstInningsRunRate={firstInningsRunRate}
            teamASummary={teamASummary}
            teamBSummary={teamBSummary}
            matchResult={matchResult}
            readOnly={match.status !== "Live"}
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
              No active innings. Start the match from the match page.
            </p>
            <Link
              href={`/match/${id}`}
              className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Go to Match
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

      {/* Real-time updates with input suppression for scorers */}
      <RealtimeRefresh
        matchId={id}
        enabled={match.status === "Live" || match.status === "Innings Break"}
        suppressDuringInput={true}
      />
    </div>
  );
}
