"use client";

import { calculateOvers, formatOvers } from "@/lib/cricket/scoring";

interface ScoreDisplayProps {
  // Team info
  battingTeam: "A" | "B";
  teamAName: string;
  teamBName: string;
  teamAContact?: string | null;
  teamBContact?: string | null;

  // Score
  currentScore: number;
  currentWickets: number;
  ballsBowled: number;

  // Toss
  tossWinner: "A" | "B" | null;
  tossDecision: "Bat" | "Bowl" | null;

  // Match result (for completed matches)
  readOnly?: boolean;
  matchResult?: string | null;
  teamASummary?: { runs: number; wickets: number; overs: string } | null;
  teamBSummary?: { runs: number; wickets: number; overs: string } | null;

  // Target info (second innings)
  isSecondInnings: boolean;
  targetRuns: number | null;
  ballsRemaining: number | null;

  // Run rates
  currentRunRateText: string;
  requiredRunRateText: string;

  // Batsmen stats (for scorer view)
  strikerName?: string;
  nonStrikerName?: string;
  strikerStats?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
  } | null;
  nonStrikerStats?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
  } | null;

  // Bowler stats (for scorer view)
  bowlerName?: string;
  bowlerStats?: {
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: string;
  } | null;
}

export default function ScoreDisplay({
  battingTeam,
  teamAName,
  teamBName,
  teamAContact,
  teamBContact,
  currentScore,
  currentWickets,
  ballsBowled,
  tossWinner,
  tossDecision,
  readOnly = false,
  matchResult,
  teamASummary,
  teamBSummary,
  isSecondInnings,
  targetRuns,
  ballsRemaining,
  currentRunRateText,
  requiredRunRateText,
  strikerName,
  nonStrikerName,
  strikerStats,
  nonStrikerStats,
  bowlerName,
  bowlerStats,
}: ScoreDisplayProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Team Name and Score */}
      {readOnly && matchResult && teamASummary && teamBSummary ? (
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-medium team-name mb-1">{teamAName}</h2>
            {teamAContact && (
              <a
                href={`tel:${teamAContact}`}
                className="text-xs block"
                style={{ color: "var(--accent)" }}
              >
                {teamAContact}
              </a>
            )}
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {teamASummary.runs}/{teamASummary.wickets}
              </span>
              <span className="text-sm muted-text">
                ({teamASummary.overs} ov)
              </span>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-sm font-medium team-name mb-1">{teamBName}</h2>
            {teamBContact && (
              <a
                href={`tel:${teamBContact}`}
                className="text-xs block"
                style={{ color: "var(--accent)" }}
              >
                {teamBContact}
              </a>
            )}
            <div className="flex items-baseline gap-2 justify-end">
              <span
                className="text-2xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {teamBSummary.runs}/{teamBSummary.wickets}
              </span>
              <span className="text-sm muted-text">
                ({teamBSummary.overs} ov)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-base font-medium team-name">
            {battingTeam === "A" ? teamAName : teamBName}
          </h2>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {currentScore}/{currentWickets}
            </span>
            <span className="text-lg muted-text">
              ({formatOvers(calculateOvers(ballsBowled))})
            </span>
          </div>
        </div>
      )}

      {/* Toss Info & Match Result (centered under header) */}
      {(tossWinner && tossDecision) || (readOnly && matchResult) ? (
        <div className="mb-2 text-center">
          {tossWinner && tossDecision && (
            <p className="text-xs muted-text">
              {tossWinner === "A" ? teamAName : teamBName} won the toss and
              chose to {tossDecision === "Bat" ? "bat" : "bowl"}.
            </p>
          )}
          {readOnly && matchResult && (
            <p
              className="text-sm"
              style={{ color: "var(--success)", marginTop: "0.25rem" }}
            >
              {matchResult}
            </p>
          )}
        </div>
      ) : null}

      {/* Second Innings Target / Chase Info */}
      {isSecondInnings && targetRuns !== null && ballsRemaining !== null && (
        <p className="text-sm muted-text mb-2">
          Target {targetRuns}. Need {Math.max(targetRuns - currentScore, 0)}{" "}
          runs from {Math.max(ballsRemaining, 0)} balls.
        </p>
      )}

      {/* Run Rates - show during live play (no result yet) */}
      {!matchResult && ballsBowled > 0 && (
        <p className="text-xs muted-text mb-2">
          CRR: {currentRunRateText}
          {isSecondInnings &&
            targetRuns !== null &&
            ballsRemaining !== null && (
              <span> | RRR: {requiredRunRateText}</span>
            )}
        </p>
      )}

      {/* Batsmen Details - hide for completed matches */}
      {strikerName && !matchResult && (
        <div className="space-y-1.5 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">{strikerName} *</span>
            <span className="muted-text">
              {strikerStats
                ? `${strikerStats.runs} (${strikerStats.balls})`
                : "-"}
            </span>
          </div>
          {nonStrikerName && (
            <div className="flex justify-between">
              <span>{nonStrikerName}</span>
              <span className="muted-text">
                {nonStrikerStats
                  ? `${nonStrikerStats.runs} (${nonStrikerStats.balls})`
                  : "-"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bowler Details - hide for completed matches */}
      {bowlerName && !matchResult && (
        <div
          className="pt-2 border-t text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex justify-between">
            <span className="font-medium">{bowlerName}</span>
            <span className="muted-text">
              {bowlerStats
                ? `${bowlerStats.overs}-${bowlerStats.maidens}-${bowlerStats.runs}-${bowlerStats.wickets}`
                : `0-0-0-0`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
