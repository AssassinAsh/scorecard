"use client";

import { useState, useEffect } from "react";
import {
  formatScore,
  formatOvers,
  calculateOvers,
} from "@/lib/cricket/scoring";

interface FullscreenDisplayProps {
  match: {
    team_a_name: string;
    team_b_name: string;
    status: string;
    match_type: string | null;
    overs_per_innings: number;
    tournaments?: { name?: string | null } | null;
  };
  displayInnings: {
    batting_team: "A" | "B";
    bowling_team: "A" | "B";
    total_runs: number;
    wickets: number;
    balls_bowled: number;
  } | null;
  allInnings: any[];
  completedInnings: any[];
  isSecondInnings: boolean;
  targetRuns: number | null;
  ballsRemaining: number | null;
  currentPartnership: {
    runs: number;
    balls: number;
    striker: { name: string; runs: number; balls: number };
    nonStriker: { name: string; runs: number; balls: number };
  } | null;
  liveBatting: {
    playerId: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
  }[];
  currentBowler: {
    playerId: string;
    name: string;
    overs: string;
    runs: number;
    wickets: number;
    economy: string;
  } | null;
  displayOverBalls: string[];
  matchResult: string | null;
}

export default function FullscreenDisplay({
  match,
  displayInnings,
  completedInnings,
  isSecondInnings,
  targetRuns,
  ballsRemaining,
  currentPartnership,
  liveBatting,
  currentBowler,
  displayOverBalls,
  matchResult,
}: FullscreenDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // When in fullscreen mode, hide the app header/footer and prevent scrolling
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (isFullscreen) {
      root.classList.add("display-fullscreen");
    } else {
      root.classList.remove("display-fullscreen");
    }

    return () => {
      root.classList.remove("display-fullscreen");
    };
  }, [isFullscreen]);

  useEffect(() => {
    setLastUpdate(Date.now());
  }, [displayInnings?.total_runs, displayInnings?.wickets]);

  // Initialize lastUpdate on client mount
  useEffect(() => {
    setLastUpdate(Date.now());
  }, []);

  // Detect very small fullscreen viewports (e.g. mobile landscape)
  // and switch to a more compact layout so that important content
  // fits within the visible area. Fall back to normal layout on
  // larger screens.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (!isFullscreen) {
        setIsCompact(false);
        return;
      }

      const height = window.innerHeight;
      const width = window.innerWidth;
      // Treat landscape viewports with relatively small height as
      // "compact" (e.g. phone/tablet landscape), but keep the
      // larger layout for big screens like TVs or desktops.
      setIsCompact(width > height && height < 900);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // Enter fullscreen
      setIsFullscreen(true);
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }

        // On supported mobile browsers, try to lock orientation to landscape
        // when entering fullscreen. This is a best-effort hint and will be
        // ignored silently if not allowed.
        if (typeof window !== "undefined") {
          const orientation = (screen as any).orientation;
          if (orientation && typeof orientation.lock === "function") {
            try {
              await orientation.lock("landscape");
            } catch {
              // Ignore failures; some browsers require user gesture policies
              // or do not allow programmatic orientation locking.
            }
          }
        }
      } catch {
        // If the browser blocks fullscreen or orientation lock, we still keep
        // our internal fullscreen layout (header/footer hidden, no scroll).
      }
    } else {
      // Exit fullscreen
      setIsFullscreen(false);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          // Ignore errors from exiting fullscreen.
        });
      }
    }
  };

  const tournamentName =
    (match as any).tournaments?.name || (match as any).tournament_name || null;

  const battingTeamName =
    displayInnings?.batting_team === "A"
      ? match.team_a_name
      : match.team_b_name;

  const bowlingTeamName =
    displayInnings?.bowling_team === "A"
      ? match.team_a_name
      : match.team_b_name;

  // Calculate runs needed
  const runsNeeded =
    isSecondInnings && targetRuns
      ? targetRuns - (displayInnings?.total_runs || 0)
      : null;

  // Get current run rate and required run rate
  const currentRunRate =
    displayInnings && displayInnings.balls_bowled > 0
      ? ((displayInnings.total_runs * 6) / displayInnings.balls_bowled).toFixed(
          2
        )
      : "0.00";

  const requiredRunRate =
    isSecondInnings && ballsRemaining && ballsRemaining > 0 && runsNeeded
      ? ((runsNeeded * 6) / ballsRemaining).toFixed(2)
      : null;

  return (
    <div
      style={{
        // Use dynamic viewport units in fullscreen to better respect
        // the visible area on mobile browsers (especially iOS Safari)
        // and avoid content being cut off by browser UI.
        minHeight: isFullscreen ? "100dvh" : "100vh",
        height: isFullscreen ? "100dvh" : "auto",
        background: "linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%)",
        color: "#ffffff",
        position: "relative",
        display: isFullscreen ? "flex" : "block",
        flexDirection: isFullscreen ? "column" : undefined,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          // In fullscreen, add extra top and bottom padding so content
          // doesn't touch the screen edges, while keeping everything
          // within a single non-scrollable slide.
          padding: isFullscreen
            ? isCompact
              ? "0.9rem 0.9rem 2.4rem 0.9rem"
              : "1.5rem 1.5rem 3rem 1.5rem"
            : "1rem 1.5rem",
          flex: isFullscreen ? "1" : undefined,
          // Allow vertical scrolling inside the fullscreen surface on
          // small devices while still preventing horizontal scroll.
          overflowX: "hidden",
          overflowY: isFullscreen ? "auto" : "visible",
          display: "flex",
          flexDirection: "column",
          gap: isFullscreen ? (isCompact ? "0.35rem" : "0.5rem") : "0",
        }}
      >
        {/* Header */}
        {!isFullscreen && (
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontSize: isFullscreen ? "3rem" : "1.75rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              {match.team_a_name} vs {match.team_b_name}
            </h1>
            <div
              style={{
                display: "flex",
                gap: "2rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {match.match_type && (
                <span
                  style={{
                    fontSize: isFullscreen ? "1.25rem" : "0.875rem",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {match.match_type}
                </span>
              )}
              <span
                style={{
                  padding: "0.375rem 1rem",
                  borderRadius: "9999px",
                  fontSize: isFullscreen ? "1.25rem" : "0.875rem",
                  fontWeight: "600",
                  background:
                    match.status === "Live"
                      ? "rgba(239, 68, 68, 0.2)"
                      : match.status === "Completed"
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgba(59, 130, 246, 0.2)",
                  color:
                    match.status === "Live"
                      ? "#fca5a5"
                      : match.status === "Completed"
                      ? "#86efac"
                      : "#93c5fd",
                }}
              >
                {match.status === "Live" && "🔴 "}
                {match.status}
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!displayInnings ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              fontSize: isFullscreen ? "2rem" : "1.5rem",
              color: "#94a3b8",
            }}
          >
            {match.status === "Upcoming"
              ? "Match hasn't started yet"
              : "No score available"}
          </div>
        ) : (
          <>
            {/* Match Result (for completed matches) */}
            {matchResult && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "2px solid rgba(34, 197, 94, 0.4)",
                  borderRadius: "1rem",
                  padding: isFullscreen && isCompact ? "1.25rem" : "2rem",
                  marginBottom: isFullscreen && isCompact ? "1.25rem" : "3rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: isFullscreen ? "2.5rem" : "2rem",
                    fontWeight: "bold",
                    color: "#86efac",
                  }}
                >
                  {matchResult}
                </div>
              </div>
            )}

            {/* Score Display */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "1rem",
                padding: isFullscreen
                  ? isCompact
                    ? "1.25rem 1.25rem"
                    : "2rem 1.5rem"
                  : "1.25rem",
                marginTop: isFullscreen
                  ? isCompact
                    ? "0.25rem"
                    : "0.5rem"
                  : 0,
                marginBottom: isFullscreen
                  ? isCompact
                    ? "0.5rem"
                    : "0.75rem"
                  : "1.25rem",
                border: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "1.1rem"
                        : "1.5rem"
                      : "1.125rem",
                    color: "#94a3b8",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  {battingTeamName}
                </div>
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "2.4rem"
                        : "3rem"
                      : "3.5rem",
                    fontWeight: "bold",
                    lineHeight: "1",
                    marginBottom: "0.5rem",
                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {formatScore(
                    displayInnings.total_runs,
                    displayInnings.wickets
                  )}
                </div>
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.9rem"
                        : "1.1rem"
                      : "1.25rem",
                    color: "#94a3b8",
                    marginBottom: isSecondInnings ? "0.75rem" : "0",
                  }}
                >
                  ({formatOvers(calculateOvers(displayInnings.balls_bowled))} /{" "}
                  {match.overs_per_innings} overs)
                </div>

                {/* Chase Information */}
                {isSecondInnings && targetRuns && (
                  <div
                    style={{
                      marginTop:
                        isFullscreen && isCompact ? "0.5rem" : "0.75rem",
                      padding: isFullscreen && isCompact ? "0.75rem" : "1rem",
                      background: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "0.9rem"
                            : "1rem"
                          : "1.125rem",
                        fontWeight: "600",
                        color: "#93c5fd",
                      }}
                    >
                      Need {runsNeeded} runs from {ballsRemaining} balls
                    </div>
                    {requiredRunRate && (
                      <div
                        style={{
                          fontSize: isFullscreen
                            ? isCompact
                              ? "0.7rem"
                              : "0.8rem"
                            : "1rem",
                          color: "#94a3b8",
                          marginTop: "0.25rem",
                        }}
                      >
                        Required Run Rate: {requiredRunRate}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Current Partnership */}
            {currentPartnership && match.status === "Live" && (
              <div
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "0.75rem",
                  padding: isFullscreen
                    ? isCompact
                      ? "0.45rem 0.6rem"
                      : "0.6rem 0.75rem"
                    : "1rem",
                  marginBottom: isFullscreen
                    ? isCompact
                      ? "0.4rem"
                      : "0.5rem"
                    : "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.7rem"
                        : "0.8rem"
                      : "1rem",
                    color: "#c4b5fd",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  Current Partnership: {currentPartnership.runs} (
                  {currentPartnership.balls})
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "0.7rem"
                            : "0.8rem"
                          : "1rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {currentPartnership.striker.name}*
                    </div>
                    <div
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "1.1rem"
                            : "1.3rem"
                          : "1.5rem",
                        fontWeight: "bold",
                        color: "#a78bfa",
                      }}
                    >
                      {currentPartnership.striker.runs} (
                      {currentPartnership.striker.balls})
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "0.7rem"
                            : "0.8rem"
                          : "1rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {currentPartnership.nonStriker.name}
                    </div>
                    <div
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "1.1rem"
                            : "1.3rem"
                          : "1.5rem",
                        fontWeight: "bold",
                        color: "#a78bfa",
                      }}
                    >
                      {currentPartnership.nonStriker.runs} (
                      {currentPartnership.nonStriker.balls})
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current Over */}
            {displayOverBalls.length > 0 && match.status === "Live" && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.75rem",
                  padding: isFullscreen
                    ? isCompact
                      ? "0.45rem 0.6rem"
                      : "0.6rem 0.75rem"
                    : "1rem",
                  marginBottom: isFullscreen
                    ? isCompact
                      ? "0.4rem"
                      : "0.5rem"
                    : "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.75rem"
                        : "0.875rem"
                      : "1rem",
                    color: "#94a3b8",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  This Over
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: isFullscreen
                      ? isCompact
                        ? "0.7rem"
                        : "1rem"
                      : "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {displayOverBalls.map((ball, index) => (
                    <div
                      key={index}
                      style={{
                        width: isFullscreen
                          ? isCompact
                            ? "1.8rem"
                            : "2.2rem"
                          : "2.5rem",
                        height: isFullscreen
                          ? isCompact
                            ? "1.8rem"
                            : "2.2rem"
                          : "2.5rem",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isFullscreen
                          ? isCompact
                            ? "0.95rem"
                            : "1.1rem"
                          : "1.5rem",
                        fontWeight: "bold",
                        background:
                          ball === "W"
                            ? "rgba(239, 68, 68, 0.3)"
                            : ball === "6"
                            ? "rgba(147, 51, 234, 0.3)"
                            : ball === "4"
                            ? "rgba(34, 197, 94, 0.3)"
                            : "rgba(255, 255, 255, 0.1)",
                        border:
                          ball === "W"
                            ? "2px solid #ef4444"
                            : ball === "6"
                            ? "2px solid #9333ea"
                            : ball === "4"
                            ? "2px solid #22c55e"
                            : "2px solid rgba(255, 255, 255, 0.2)",
                        color:
                          ball === "W"
                            ? "#fca5a5"
                            : ball === "6"
                            ? "#e9d5ff"
                            : ball === "4"
                            ? "#86efac"
                            : "#ffffff",
                      }}
                    >
                      {ball}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Bowler */}
            {currentBowler && match.status === "Live" && (
              <div
                style={{
                  background: "rgba(249, 115, 22, 0.1)",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  borderRadius: "0.75rem",
                  padding: isFullscreen
                    ? isCompact
                      ? "0.45rem 0.6rem"
                      : "0.6rem 0.75rem"
                    : "1rem",
                  marginBottom: isFullscreen
                    ? isCompact
                      ? "0.4rem"
                      : "0.5rem"
                    : "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.7rem"
                        : "0.8rem"
                      : "1rem",
                    color: "#fdba74",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  Current Bowler
                </div>
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.9rem"
                        : "1rem"
                      : "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {currentBowler.name}
                </div>
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.7rem"
                        : "0.8rem"
                      : "1rem",
                    color: "#94a3b8",
                  }}
                >
                  {currentBowler.overs} overs • {currentBowler.wickets}-
                  {currentBowler.runs} • Econ: {currentBowler.economy}
                </div>
              </div>
            )}

            {/* Previous Innings (if second innings) */}
            {completedInnings.length > 0 && match.status === "Live" && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  padding: isFullscreen
                    ? isCompact
                      ? "0.45rem 0.6rem"
                      : "0.6rem 0.75rem"
                    : "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: isFullscreen
                      ? isCompact
                        ? "0.7rem"
                        : "0.8rem"
                      : "1rem",
                    color: "#94a3b8",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  {completedInnings.length > 1
                    ? "First Innings"
                    : "Previous Innings"}
                </div>
                {completedInnings.map((inning) => (
                  <div
                    key={inning.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "0.7rem"
                            : "0.8rem"
                          : "1rem",
                        fontWeight: "600",
                      }}
                    >
                      {inning.batting_team === "A"
                        ? match.team_a_name
                        : match.team_b_name}
                    </span>
                    <span
                      style={{
                        fontSize: isFullscreen
                          ? isCompact
                            ? "0.85rem"
                            : "0.95rem"
                          : "1.125rem",
                        fontWeight: "bold",
                      }}
                    >
                      {formatScore(inning.total_runs, inning.wickets)} (
                      {formatOvers(calculateOvers(inning.balls_bowled))})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer Info */}
        {!isFullscreen && (
          <div
            style={{
              position: "relative",
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            {lastUpdate && (
              <div>
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            )}
            <div style={{ marginTop: "0.25rem", opacity: 0.7 }}>
              Auto-refreshing every 3 seconds
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen footer text */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "1.25rem",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#e2e8f0",
            pointerEvents: "none",
          }}
        >
          {tournamentName && (
            <div
              style={{
                marginBottom: "0.15rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#cbd5f5",
              }}
            >
              {tournamentName}
            </div>
          )}
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "#94a3b8",
            }}
          >
            Developed by Ashvin Rokade
          </div>
        </div>
      )}

      {/* Fullscreen Toggle Button (Bottom Right Corner) */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "fixed",
          bottom: "3rem",
          right: "1.5rem",
          width: "3rem",
          height: "3rem",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "0.5rem",
          fontSize: "1.25rem",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          backdropFilter: "blur(10px)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>
    </div>
  );
}
