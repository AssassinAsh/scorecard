"use client";

import { useState } from "react";

interface BattingRow {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  dismissal?: string | null;
  isOut?: boolean;
}

interface BowlingRow {
  playerId: string;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
}

interface FullScorecardProps {
  // Team names
  teamAName: string;
  teamBName: string;

  // Team order (left/right based on who batted first)
  leftTeam: "A" | "B";
  rightTeam: "A" | "B";

  // Current batting team
  battingTeam: "A" | "B";
  firstInningsTeam: "A" | "B" | null;

  // Current innings data
  liveBatting: BattingRow[];
  liveBowling: BowlingRow[];
  currentInningsExtras?: number | null;
  currentRunRateText: string;

  // First innings data
  firstInningsBatting: BattingRow[];
  firstInningsBowling: BowlingRow[];
  firstInningsExtras?: number | null;
  firstInningsRunRate?: string | null;

  // Current batsmen IDs (for striker indicator)
  strikerId: string;
  nonStrikerId: string;
}

export default function FullScorecard({
  teamAName,
  teamBName,
  leftTeam,
  rightTeam,
  battingTeam,
  firstInningsTeam,
  liveBatting,
  liveBowling,
  currentInningsExtras,
  currentRunRateText,
  firstInningsBatting,
  firstInningsBowling,
  firstInningsExtras,
  firstInningsRunRate,
  strikerId,
  nonStrikerId,
}: FullScorecardProps) {
  const [showScorecard, setShowScorecard] = useState(false);
  const [activeScorecardTeam, setActiveScorecardTeam] = useState<"A" | "B">(
    battingTeam
  );

  const isActiveCurrentBatting = activeScorecardTeam === battingTeam;
  const isActiveFirstInningsTeam =
    firstInningsTeam !== null && activeScorecardTeam === firstInningsTeam;

  const scorecardBatting = isActiveCurrentBatting
    ? liveBatting
    : isActiveFirstInningsTeam
    ? firstInningsBatting
    : [];

  const scorecardBowling = isActiveCurrentBatting
    ? liveBowling
    : isActiveFirstInningsTeam
    ? firstInningsBowling
    : [];

  return (
    <div className="rounded-lg">
      <button
        type="button"
        className="w-full flex items-center justify-between text-xs sm:text-sm px-2 py-2 rounded-md"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
        onClick={() => setShowScorecard((prev) => !prev)}
      >
        <span className="font-medium">Scorecard</span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {showScorecard ? "Hide" : "Show"}
        </span>
      </button>

      {showScorecard && (
        <div
          className="mt-2 rounded-lg p-0 overflow-hidden"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Team Tabs */}
          <div className="flex text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveScorecardTeam(leftTeam)}
              className="flex-1 px-3 py-2 font-medium"
              style={
                activeScorecardTeam === leftTeam
                  ? {
                      background: "var(--background)",
                      color: "var(--foreground)",
                      borderBottom: "2px solid var(--accent)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--muted)",
                      borderBottom: "1px solid var(--border)",
                    }
              }
            >
              {leftTeam === "A" ? teamAName : teamBName}
            </button>
            <button
              type="button"
              onClick={() => setActiveScorecardTeam(rightTeam)}
              className="flex-1 px-3 py-2 font-medium"
              style={
                activeScorecardTeam === rightTeam
                  ? {
                      background: "var(--background)",
                      color: "var(--foreground)",
                      borderBottom: "2px solid var(--accent)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--muted)",
                      borderBottom: "1px solid var(--border)",
                    }
              }
            >
              {rightTeam === "A" ? teamAName : teamBName}
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 space-y-4 overflow-x-auto">
            {scorecardBatting.length > 0 ? (
              <>
                {/* Batting Table */}
                <div>
                  <div
                    className="mb-2 text-[11px] sm:text-xs"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(0,1.7fr) 0.4fr 0.4fr 0.4fr 0.4fr 0.6fr",
                      columnGap: "0.5rem",
                    }}
                  >
                    <span className="text-xs sm:text-sm font-medium">
                      Batting
                    </span>
                    <span className="tabular-nums muted-text">R</span>
                    <span className="tabular-nums muted-text">B</span>
                    <span className="tabular-nums muted-text">4s</span>
                    <span className="tabular-nums muted-text">6s</span>
                    <span className="tabular-nums muted-text">SR</span>
                  </div>
                  <div className="space-y-1">
                    {(isActiveCurrentBatting
                      ? scorecardBatting.filter(
                          (row) =>
                            row.balls > 0 ||
                            row.runs > 0 ||
                            row.playerId === strikerId ||
                            row.playerId === nonStrikerId
                        )
                      : scorecardBatting
                    ).map((row) => (
                      <div
                        key={row.playerId}
                        className="text-[11px] sm:text-xs"
                        style={{ color: "var(--foreground)" }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(0,1.7fr) 0.4fr 0.4fr 0.4fr 0.4fr 0.6fr",
                            columnGap: "0.5rem",
                          }}
                        >
                          <div className="flex flex-col">
                            <span>
                              {row.name}
                              {row.playerId === strikerId ? " *" : ""}
                            </span>
                            {row.isOut && row.dismissal && (
                              <span className="text-[10px] sm:text-[11px] muted-text">
                                {row.dismissal}
                              </span>
                            )}
                          </div>
                          <span className="tabular-nums">{row.runs}</span>
                          <span className="tabular-nums">{row.balls}</span>
                          <span className="tabular-nums">{row.fours}</span>
                          <span className="tabular-nums">{row.sixes}</span>
                          <span className="tabular-nums">{row.strikeRate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Innings Summary: Run Rate & Extras */}
                <div className="mt-3 text-[11px] sm:text-xs muted-text">
                  <p>
                    Run Rate:{" "}
                    {activeScorecardTeam === battingTeam
                      ? currentRunRateText
                      : firstInningsRunRate || "-"}
                  </p>
                  {(activeScorecardTeam === battingTeam
                    ? currentInningsExtras
                    : firstInningsExtras) != null && (
                    <p>
                      Extras:{" "}
                      {(activeScorecardTeam === battingTeam
                        ? currentInningsExtras
                        : firstInningsExtras) ?? 0}
                    </p>
                  )}
                </div>

                {/* Separator */}
                <div
                  className="border-t"
                  style={{ borderColor: "var(--border)" }}
                />

                {/* Bowling Table */}
                {scorecardBowling.length > 0 && (
                  <div>
                    <div
                      className="mb-2 text-[11px] sm:text-xs"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0,1.7fr) 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr",
                        columnGap: "0.5rem",
                      }}
                    >
                      <span className="text-xs sm:text-sm font-medium">
                        Bowling
                      </span>
                      <span className="tabular-nums muted-text">O</span>
                      <span className="tabular-nums muted-text">M</span>
                      <span className="tabular-nums muted-text">R</span>
                      <span className="tabular-nums muted-text">W</span>
                      <span className="tabular-nums muted-text">Econ</span>
                    </div>
                    <div className="space-y-1">
                      {scorecardBowling.map((row) => (
                        <div
                          key={row.playerId}
                          className="text-[11px] sm:text-xs"
                          style={{ color: "var(--foreground)" }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "minmax(0,1.7fr) 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr",
                              columnGap: "0.5rem",
                            }}
                          >
                            <span>{row.name}</span>
                            <span className="tabular-nums">{row.overs}</span>
                            <span className="tabular-nums">{row.maidens}</span>
                            <span className="tabular-nums">{row.runs}</span>
                            <span className="tabular-nums">{row.wickets}</span>
                            <span className="tabular-nums">{row.economy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs sm:text-sm muted-text">Yet to bat.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
