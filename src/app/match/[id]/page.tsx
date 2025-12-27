import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import {
  getCurrentInnings,
  getAllInnings,
  getRecentBalls,
  getInningsWithBalls,
  getRetirementsForInnings,
} from "@/app/actions/scoring";
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
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { hasAccess, isAdmin } from "@/app/actions/tournaments";
import { MatchSkeleton } from "@/components/Skeletons";
import MatchHeader from "@/components/MatchHeader";

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

export default function MatchPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <MatchPageContent {...props} />
    </Suspense>
  );
}

async function MatchPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Check if user has scorer access to this tournament
  const hasScorerAccess = user ? await hasAccess(match.tournament_id) : false;
  const admin = user ? await isAdmin() : false;
  const canEditContacts = Boolean(user && (hasScorerAccess || admin));
  const completedInnings = allInnings.filter((i) => i.is_completed);
  const firstCompletedInnings = completedInnings[0];

  // In case the match is completed and there's no active innings,
  // fall back to the last completed innings so we can still
  // render a full scorecard for finished games.
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

  const isCompletedMatch = match.status === "Completed";

  // Final team summaries for completed matches
  let teamASummary: { runs: number; wickets: number; overs: string } | null =
    null;
  let teamBSummary: { runs: number; wickets: number; overs: string } | null =
    null;

  if (isCompletedMatch && completedInnings.length > 0) {
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

  // Live batting and bowling stats for the current innings
  let liveBatting: LiveBattingRow[] = [];
  let liveBowling: LiveBowlingRow[] = [];

  if (displayInnings && inningsDetail) {
    const battingPlayersForInnings = players.filter(
      (p) => p.team === displayInnings.batting_team
    );
    const bowlingPlayersForInnings = players.filter(
      (p) => p.team === displayInnings.bowling_team
    );

    // Use shared stat calculation utilities
    const battingStatsMap = calculateBattingStats(inningsDetail);
    const bowlingStatsMap = calculateBowlingStats(inningsDetail);
    const dismissalMap = buildDismissalMap(
      inningsDetail,
      bowlingPlayersForInnings
    );

    const retirementMap = new Map<string, string>();
    for (const r of retirements) {
      retirementMap.set(r.player_id, r.reason);
    }

    // Get actual batting appearance order (critical for correct scorecard)
    const battingAppearanceOrder = getBattingAppearanceOrder(inningsDetail);

    liveBatting = battingPlayersForInnings
      .slice()
      .sort((a, b) => {
        const orderA = battingAppearanceOrder.get(a.id);
        const orderB = battingAppearanceOrder.get(b.id);

        // Both have batted: sort by appearance
        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }
        // Only one has batted: they come first
        if (orderA !== undefined) return -1;
        if (orderB !== undefined) return 1;
        // Neither has batted: use batting_order
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

  // First innings scorecard data (for display during second innings)
  let firstInningsBatting: LiveBattingRow[] = [];
  let firstInningsBowling: LiveBowlingRow[] = [];
  let firstInningsExtras: number | null = null;
  let firstInningsRunRate: string | null = null;

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
        // Defending team won by runs
        const margin = Math.max(firstRuns - secondRuns, 0);
        matchResult =
          margin > 0
            ? `${winnerName} won by ${margin} run${margin === 1 ? "" : "s"}.`
            : `${winnerName} won the match.`;
      } else if (winnerSide === secondInningsCompleted.batting_team) {
        // Chasing team won by wickets
        const wicketsRemaining = Math.max(
          10 - secondInningsCompleted.wickets,
          1
        );
        matchResult = `${winnerName} won by ${wicketsRemaining} wicket${
          wicketsRemaining === 1 ? "" : "s"
        }.`;
      }
    } else if (firstCompletedInnings && completedInnings.length >= 2) {
      // Handle tie or no winner case
      const firstRuns = completedInnings[0].total_runs;
      const secondRuns = completedInnings[1].total_runs;
      if (firstRuns === secondRuns) {
        matchResult = "Match tied.";
      }
    }
  }

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

      const firstDismissalMap = new Map<string, string>();

      let extras = 0;

      for (const over of firstDetail.overs) {
        const overBalls = over.balls || [];
        const bowlerId: string | null = over.bowler_id;

        // Batting stats and extras
        for (const ball of overBalls) {
          const strikerId: string = ball.striker_id;
          const runsOffBat: number = ball.runs_off_bat;
          const legal = isLegalBall(ball.extras_type);

          extras += ball.extras_runs;

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

        for (const ball of overBalls) {
          if (
            ball.wicket_type === "None" ||
            !ball.dismissed_player_id ||
            firstDismissalMap.has(ball.dismissed_player_id)
          ) {
            continue;
          }

          const dismissedId: string = ball.dismissed_player_id;
          const bowler = bowlerId
            ? bowlingPlayersForFirst.find((p) => p.id === bowlerId)
            : null;
          const bowlerName = bowler?.name;

          let text: string | null = null;

          if (ball.wicket_type === "Bowled") {
            text = bowlerName ? `b ${bowlerName}` : "b";
          } else if (ball.wicket_type === "LBW") {
            text = bowlerName ? `lbw b ${bowlerName}` : "lbw";
          } else if (ball.wicket_type === "HitWicket") {
            text = bowlerName ? `hit wicket b ${bowlerName}` : "hit wicket";
          } else if (ball.wicket_type === "Caught") {
            const fielder =
              ball.fielder_id &&
              bowlingPlayersForFirst.find((p) => p.id === ball.fielder_id);
            if (fielder && bowlerName) {
              text = `c ${fielder.name} b ${bowlerName}`;
            } else if (bowlerName) {
              text = `c b ${bowlerName}`;
            } else if (fielder) {
              text = `c ${fielder.name}`;
            } else {
              text = "c";
            }
          } else if (ball.wicket_type === "Stumps") {
            const keeper =
              ball.keeper_id &&
              bowlingPlayersForFirst.find((p) => p.id === ball.keeper_id);
            if (keeper && bowlerName) {
              text = `stumped ${keeper.name} b ${bowlerName}`;
            } else if (bowlerName) {
              text = `stumped b ${bowlerName}`;
            } else if (keeper) {
              text = `stumped ${keeper.name}`;
            } else {
              text = "stumped";
            }
          } else if (ball.wicket_type === "RunOut") {
            const fielder =
              ball.fielder_id &&
              bowlingPlayersForFirst.find((p) => p.id === ball.fielder_id);
            text = fielder ? `run out (${fielder.name})` : "run out";
          }

          if (text) {
            firstDismissalMap.set(dismissedId, text);
          }
        }
      }

      firstInningsExtras = extras;
      firstInningsRunRate = formatRunRate(
        calculateRunRate(
          firstCompletedInnings.total_runs,
          firstCompletedInnings.balls_bowled
        )
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
            strikeRate: formatStrikeRateFirst(s.runs, s.balls),
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
            economy: formatEconomyFirst(s.runs, s.legalBalls),
          };
        })
        .filter((row): row is LiveBowlingRow => row !== null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--card-bg)" }}></div>

      <MatchHeader
        match={{
          id: match.id,
          tournament_id: match.tournament_id,
          team_a_id: match.team_a_id,
          team_b_id: match.team_b_id,
          team_a_name: match.team_a_name,
          team_b_name: match.team_b_name,
          team_a_contact: match.team_a_contact ?? null,
          team_b_contact: match.team_b_contact ?? null,
          status: match.status,
          match_type: match.match_type,
          match_date: match.match_date,
          overs: match.overs_per_innings,
        }}
        canEditContacts={canEditContacts}
        showScorerActions={hasScorerAccess && match.status !== "Completed"}
        showDisplayCTA={hasScorerAccess}
        hasTossData={Boolean(match.toss_winner_id)}
        hasPlayers={players.length > 0}
        tossWinner={match.toss_winner}
        tossDecision={match.toss_decision}
      />

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Previous Innings Summary (only for ongoing matches) */}
        {match.status !== "Completed" &&
          allInnings.filter((i) => i.is_completed).length > 0 && (
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

        {/* Scoring Interface (read-only) */}
        {displayInnings ? (
          <ScoringInterface
            matchId={id}
            inningsId={displayInnings.id}
            battingTeam={displayInnings.batting_team}
            bowlingTeam={displayInnings.bowling_team}
            teamAName={match.team_a_name}
            teamBName={match.team_b_name}
            teamAContact={canEditContacts ? match.team_a_contact ?? null : null}
            teamBContact={canEditContacts ? match.team_b_contact ?? null : null}
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
            readOnly={true}
          />
        ) : (
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text">
              {match.status === "Upcoming"
                ? "Match hasn't started yet."
                : "No score available for this match yet."}
            </p>
          </div>
        )}
      </main>

      {/* Real-time updates for all users viewing live matches */}
      <RealtimeRefresh
        matchId={id}
        enabled={match.status === "Live" || match.status === "Innings Break"}
      />
    </div>
  );
}
