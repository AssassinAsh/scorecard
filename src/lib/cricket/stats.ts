import {
  isLegalBall,
  calculateBallRuns,
  calculateOvers,
  formatOvers,
} from "./scoring";
import type { Player, ExtrasType } from "@/types";

export type BattingStats = {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
};

export type BowlingStats = {
  runs: number;
  legalBalls: number;
  maidens: number;
  wickets: number;
};

export type InningsWithOvers = {
  overs?: Array<{
    bowler_id: string | null;
    balls?: Array<{
      striker_id: string;
      runs_off_bat: number;
      extras_type: string;
      extras_runs: number;
      wicket_type: string;
      dismissed_player_id: string | null;
      fielder_id: string | null;
      keeper_id: string | null;
    }>;
  }>;
};

/**
 * Calculate batting statistics from innings overs data
 */
export function calculateBattingStats(
  inningsDetail: InningsWithOvers
): Map<string, BattingStats> {
  const battingStatsMap = new Map<string, BattingStats>();

  if (!inningsDetail.overs) return battingStatsMap;

  for (const over of inningsDetail.overs) {
    const overBalls = over.balls || [];

    for (const ball of overBalls) {
      const strikerId: string = ball.striker_id;
      const runsOffBat: number = ball.runs_off_bat;
      const legal = isLegalBall(ball.extras_type as ExtrasType);

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
  }

  return battingStatsMap;
}

/**
 * Calculate bowling statistics from innings overs data
 */
export function calculateBowlingStats(
  inningsDetail: InningsWithOvers
): Map<string, BowlingStats> {
  const bowlingStatsMap = new Map<string, BowlingStats>();

  if (!inningsDetail.overs) return bowlingStatsMap;

  for (const over of inningsDetail.overs) {
    const overBalls = over.balls || [];
    const bowlerId: string | null = over.bowler_id;

    if (!bowlerId) continue;

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

      const legal = isLegalBall(ball.extras_type as ExtrasType);
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

  return bowlingStatsMap;
}

/**
 * Calculate total extras from innings overs data
 */
export function calculateExtras(inningsDetail: InningsWithOvers): number {
  let extras = 0;

  if (!inningsDetail.overs) return extras;

  for (const over of inningsDetail.overs) {
    for (const ball of over.balls || []) {
      extras += ball.extras_runs;
    }
  }

  return extras;
}

/**
 * Build dismissal text for a player
 */
export function formatDismissal(
  ball: {
    wicket_type: string;
    fielder_id: string | null;
    keeper_id: string | null;
  },
  bowlerName: string | null,
  bowlingPlayers: Player[]
): string | null {
  let text: string | null = null;

  if (ball.wicket_type === "Bowled") {
    text = bowlerName ? `b ${bowlerName}` : "b";
  } else if (ball.wicket_type === "LBW") {
    text = bowlerName ? `lbw b ${bowlerName}` : "lbw";
  } else if (ball.wicket_type === "HitWicket") {
    text = bowlerName ? `hit wicket b ${bowlerName}` : "hit wicket";
  } else if (ball.wicket_type === "Caught") {
    const fielder =
      ball.fielder_id && bowlingPlayers.find((p) => p.id === ball.fielder_id);
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
      ball.keeper_id && bowlingPlayers.find((p) => p.id === ball.keeper_id);
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
      ball.fielder_id && bowlingPlayers.find((p) => p.id === ball.fielder_id);
    text = fielder ? `run out (${fielder.name})` : "run out";
  }

  return text;
}

/**
 * Build dismissal map from innings overs data
 */
export function buildDismissalMap(
  inningsDetail: InningsWithOvers,
  bowlingPlayers: Player[]
): Map<string, string> {
  const dismissalMap = new Map<string, string>();

  if (!inningsDetail.overs) return dismissalMap;

  for (const over of inningsDetail.overs) {
    const overBalls = over.balls || [];
    const bowlerId: string | null = over.bowler_id;
    const bowler = bowlerId
      ? bowlingPlayers.find((p) => p.id === bowlerId)
      : null;
    const bowlerName = bowler?.name || null;

    for (const ball of overBalls) {
      if (
        ball.wicket_type === "None" ||
        !ball.dismissed_player_id ||
        dismissalMap.has(ball.dismissed_player_id)
      ) {
        continue;
      }

      const text = formatDismissal(ball, bowlerName, bowlingPlayers);
      if (text) {
        dismissalMap.set(ball.dismissed_player_id, text);
      }
    }
  }

  return dismissalMap;
}

/**
 * Format strike rate display
 */
export function formatStrikeRate(runs: number, balls: number): string {
  if (balls === 0) return "-";
  return ((runs * 100) / balls).toFixed(2);
}

/**
 * Format economy rate display
 */
export function formatEconomy(runs: number, legalBalls: number): string {
  if (legalBalls === 0) return "-";
  return ((runs * 6) / legalBalls).toFixed(2);
}
