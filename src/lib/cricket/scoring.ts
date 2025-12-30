import { ExtrasType, WicketType } from "@/types";

/**
 * Determines if a ball is a legal delivery (counts toward the 6-ball over).
 * Wide and No-Ball are NOT legal deliveries and do not increment the ball count.
 */
export function isLegalBall(extrasType: ExtrasType): boolean {
  return extrasType !== "Wide" && extrasType !== "NoBall";
}

/**
 * Calculate total runs from a single ball delivery.
 * Total = runs off bat + extras runs
 */
export function calculateBallRuns(
  runsOffBat: number,
  extrasRuns: number
): number {
  return runsOffBat + extrasRuns;
}

/**
 * Determine if strike should rotate after this ball.
 * Strike rotates on:
 * - Odd runs (1, 3, 5) including runs off bat, byes, and leg byes
 * - NOT on wides (batsmen don't run)
 * - NOT on no-balls where batsmen don't run
 */
export function shouldRotateStrike(
  runsOffBat: number,
  extrasType: ExtrasType,
  extrasRuns: number
): boolean {
  // For Wide: strike does NOT rotate (batsmen don't run)
  if (extrasType === "Wide") {
    return false;
  }

  // For NoBall: only rotate if batsmen actually ran
  // (runs off bat OR bye/legbye runs)
  if (extrasType === "NoBall") {
    // For no-balls, only runs actually scored (off the bat or by running)
    // should affect strike rotation. The penalty run for the no-ball itself
    // does NOT rotate the strike.
    return runsOffBat % 2 === 1;
  }

  // For Bye and LegBye: count those runs for strike rotation
  if (extrasType === "Bye" || extrasType === "LegBye") {
    return extrasRuns % 2 === 1;
  }

  // Normal ball: rotate on odd runs off bat
  return runsOffBat % 2 === 1;
}

/**
 * Calculate overs completed as a decimal (e.g., 5.3 = 5 overs and 3 balls).
 * This is used for display purposes.
 */
export function calculateOvers(legalBalls: number): number {
  const completeOvers = Math.floor(legalBalls / 6);
  const remainingBalls = legalBalls % 6;
  return completeOvers + remainingBalls / 10;
}

/**
 * Check if the current over is completed (6 legal balls bowled).
 * Returns true if we've bowled 6 legal balls in this over.
 */
export function isOverComplete(legalBallsInOver: number): boolean {
  return legalBallsInOver >= 6;
}

/**
 * Get the next ball number for the current over.
 * This increments only for legal deliveries.
 */
export function getNextBallNumber(
  currentBallNumber: number,
  isLegal: boolean
): number {
  if (isLegal) {
    return currentBallNumber + 1;
  }
  return currentBallNumber; // Don't increment for Wide/NoBall
}

/**
 * Check if innings should end.
 * Innings ends when:
 * - All overs are completed (legal balls >= overs * 6)
 * - All wickets are taken (10 wickets for 11 players)
 */
export function shouldEndInnings(
  legalBalls: number,
  wickets: number,
  oversPerInnings: number
): boolean {
  const maxBalls = oversPerInnings * 6;
  const maxWickets = 10;

  return legalBalls >= maxBalls || wickets >= maxWickets;
}

/**
 * Format overs for display (e.g., "5.3 overs" or "20 overs").
 */
export function formatOvers(overs: number): string {
  const completeOvers = Math.floor(overs);
  const balls = Math.round((overs - completeOvers) * 10);

  if (balls === 0) {
    return `${completeOvers}`;
  }
  return `${completeOvers}.${balls}`;
}

/**
 * Format score display (e.g., "145/3" means 145 runs for 3 wickets).
 */
export function formatScore(runs: number, wickets: number): string {
  return `${runs}/${wickets}`;
}

/**
 * Calculate current run rate (runs per over).
 * Uses total runs (including extras) and legal balls bowled.
 * Returns runs per over, or null if no balls bowled yet.
 */
export function calculateRunRate(
  runs: number,
  legalBalls: number
): number | null {
  if (legalBalls <= 0) return null;
  return (runs * 6) / legalBalls;
}

/**
 * Calculate required run rate for a chase.
 * runsNeeded = targetRuns - currentRuns.
 * Returns runs per over, or null if no balls remaining or no runs needed.
 */
export function calculateRequiredRunRate(
  targetRuns: number,
  currentRuns: number,
  ballsRemaining: number
): number | null {
  const runsNeeded = targetRuns - currentRuns;
  if (ballsRemaining <= 0 || runsNeeded <= 0) return null;
  return (runsNeeded * 6) / ballsRemaining;
}

/**
 * Format run rate to two decimals, or '-' if not available.
 */
export function formatRunRate(rr: number | null): string {
  if (rr === null || !Number.isFinite(rr)) return "-";
  return rr.toFixed(2);
}

/**
 * Get display text for a ball (for scorecard UI).
 * Examples: "4", "W", "1W", "2nb", ".", "1lb"
 */
export function getBallDisplayText(
  runsOffBat: number,
  extrasType: ExtrasType,
  extrasRuns: number,
  wicketType: WicketType
): string {
  // Wicket
  if (wicketType !== "None") {
    const totalRuns = runsOffBat + extrasRuns;
    return totalRuns > 0 ? `${totalRuns}W` : "W";
  }

  // Wide
  if (extrasType === "Wide") {
    return extrasRuns > 0 ? `${extrasRuns}wd` : "wd";
  }

  // No Ball
  if (extrasType === "NoBall") {
    const totalRuns = runsOffBat + extrasRuns;
    return totalRuns > 0 ? `${totalRuns}nb` : "nb";
  }

  // Bye
  if (extrasType === "Bye") {
    return `${extrasRuns}b`;
  }

  // Leg Bye
  if (extrasType === "LegBye") {
    return `${extrasRuns}lb`;
  }

  // Normal runs
  if (runsOffBat === 0) {
    return "•"; // Dot ball
  }

  return runsOffBat.toString();
}

/**
 * Build display over balls from recent balls.
 * Returns balls for the current over that should be displayed.
 * If needsNewOver is true (over just completed), returns empty array.
 */
export function buildDisplayOverBalls(
  recentBalls: Array<{
    over_id: string;
    extras_type: string;
    [key: string]: any;
  }>,
  totalLegalBalls: number,
  needsNewOver: boolean = false
): any[] {
  if (needsNewOver || recentBalls.length === 0) {
    return [];
  }

  const latestBall = recentBalls[0];
  const currentOverId = latestBall.over_id;
  const currentOverBalls = recentBalls.filter(
    (b) => b.over_id === currentOverId
  );

  return currentOverBalls;
}

/**
 * Validate ball input before saving.
 * Returns error message if invalid, null if valid.
 */
export function validateBallInput(
  runsOffBat: number,
  extrasType: ExtrasType,
  extrasRuns: number,
  wicketType: WicketType,
  dismissedPlayer: string | null
): string | null {
  // Runs off bat should be 0-6
  if (runsOffBat < 0 || runsOffBat > 10) {
    return "Runs off bat must be between 0 and 10";
  }

  // Extras runs validation
  if (extrasType === "Wide" && (extrasRuns < 0 || extrasRuns > 10)) {
    return "Wide runs must be between 0 and 10";
  }

  if (
    (extrasType === "Bye" || extrasType === "LegBye") &&
    (extrasRuns < 0 || extrasRuns > 10)
  ) {
    return "Bye/Leg Bye runs must be between 0 and 10";
  }

  if (extrasType === "NoBall" && (extrasRuns < 0 || extrasRuns > 10)) {
    return "No Ball runs must be between 0 and 10";
  }

  // If wicket, must have dismissed player
  if (wicketType !== "None" && !dismissedPlayer) {
    return "Must select dismissed player for a wicket";
  }

  // Wide cannot have runs off bat
  if (extrasType === "Wide" && runsOffBat > 0) {
    return "Cannot score runs off bat on a wide";
  }

  return null;
}
