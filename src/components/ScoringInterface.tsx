"use client";

import { useState, useEffect, useRef } from "react";
import { recordBall, startNewOver } from "@/app/actions/scoring";
import { createPlayer } from "@/app/actions/matches";
import {
  calculateOvers,
  formatOvers,
  getBallDisplayText,
} from "@/lib/cricket/scoring";
import type { Ball, Player, ExtrasType, WicketType } from "@/types";

type BallAction =
  | "runs"
  | "wide"
  | "noball"
  | "bye"
  | "legbye"
  | "wicket"
  | null;

interface ScoringInterfaceProps {
  matchId: string;
  inningsId: string;
  battingTeam: "A" | "B";
  bowlingTeam: "A" | "B";
  teamAName: string;
  teamBName: string;
  currentScore: number;
  currentWickets: number;
  ballsBowled: number;
  maxOvers: number;
  existingPlayers: Player[];
  recentBalls: Ball[];
  tossWinner: "A" | "B" | null;
  tossDecision: "Bat" | "Bowl" | null;
  isSecondInnings: boolean;
  targetRuns: number | null;
  ballsRemaining: number | null;
}

export default function ScoringInterface({
  matchId,
  inningsId,
  battingTeam,
  bowlingTeam,
  teamAName,
  teamBName,
  currentScore,
  currentWickets,
  ballsBowled,
  maxOvers,
  existingPlayers,
  recentBalls,
  tossWinner,
  tossDecision,
  isSecondInnings,
  targetRuns,
  ballsRemaining,
}: ScoringInterfaceProps) {
  // Get the latest ball to extract current players
  const latestBall = recentBalls[0];
  const latestOverId = latestBall?.over_id || "";

  const [strikerId, setStrikerId] = useState<string>(
    latestBall?.striker_id || ""
  );
  const [nonStrikerId, setNonStrikerId] = useState<string>(
    latestBall?.non_striker_id || ""
  );
  const [bowlerId, setBowlerId] = useState<string>(
    (latestBall?.bowler_id as string) || ""
  );
  const [currentOverId, setCurrentOverId] = useState<string>(latestOverId);

  // Track if we've explicitly set a new over (to prevent useEffect from overriding)
  const hasSetNewOver = useRef(false);

  // Sync currentOverId with latestOverId after balls are recorded
  useEffect(() => {
    if (latestOverId) {
      // If we just created a new over, wait until balls exist in it
      if (hasSetNewOver.current) {
        const ballsInNewOver = recentBalls.filter(
          (b) => b.over_id === currentOverId
        );
        if (ballsInNewOver.length > 0) {
          // Now we have balls in the new over, safe to sync
          hasSetNewOver.current = false;
        }
        // Don't update currentOverId yet, keep the explicitly set one
        return;
      }
      // Normal case: sync with latest over from database
      setCurrentOverId(latestOverId);
    }
  }, [latestOverId, currentOverId, recentBalls]);

  // Player management
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addingPlayerFor, setAddingPlayerFor] = useState<
    "striker" | "nonStriker" | "bowler" | "keeper" | "fielder"
  >("striker");

  // Ball action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<BallAction>(null);
  const [selectedRuns, setSelectedRuns] = useState<number>(0);

  // Wicket details
  const [showWicketTypeModal, setShowWicketTypeModal] = useState(false);
  const [wicketType, setWicketType] = useState<WicketType>("Bowled");
  const [fielderId, setFielderId] = useState<string>("");
  const [keeperId, setKeeperId] = useState<string>("");
  const [runOutBatsmanId, setRunOutBatsmanId] = useState<string>("");

  // Free hit tracking
  const [isFreeHit, setIsFreeHit] = useState(false);

  // Restore free hit state after a page reload (set on previous no-ball)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `free_hit_${inningsId}`;
    if (window.sessionStorage.getItem(key) === "1") {
      setIsFreeHit(true);
    }
  }, [inningsId]);

  // New over modal
  const [showNewOverModal, setShowNewOverModal] = useState(false);
  const [newOverBowlerId, setNewOverBowlerId] = useState<string>("");

  // Loading states
  const [isRecording, setIsRecording] = useState(false);
  const [isAddingNewOverBowler, setIsAddingNewOverBowler] = useState(false);

  const isAddingBatter =
    addingPlayerFor === "striker" || addingPlayerFor === "nonStriker";
  const addPlayerTitle = isAddingBatter
    ? "Add New Batter"
    : addingPlayerFor === "bowler"
    ? "Add New Bowler"
    : addingPlayerFor === "keeper"
    ? "Add New Keeper"
    : "Add New Fielder";
  const addPlayerButtonLabel = isAddingBatter
    ? "Add Batter"
    : addingPlayerFor === "bowler"
    ? "Add Bowler"
    : "Add Player";
  const addPlayerPlaceholder = isAddingBatter
    ? "Batter name..."
    : addingPlayerFor === "bowler"
    ? "Bowler name..."
    : addingPlayerFor === "keeper"
    ? "Keeper name..."
    : "Fielder name...";

  const battingPlayers = existingPlayers.filter((p) => p.team === battingTeam);
  const bowlingPlayers = existingPlayers.filter((p) => p.team === bowlingTeam);
  const fieldingPlayers = bowlingPlayers;

  // Get all balls from the current over (including wides/no-balls)
  // Use currentOverId state instead of latestOverId to track active over
  const currentOverBalls = recentBalls.filter(
    (b) => b.over_id === currentOverId
  );
  const legalBallsInOver = currentOverBalls.filter(
    (b) => b.extras_type !== "Wide" && b.extras_type !== "NoBall"
  ).length;

  const needsNewOver = legalBallsInOver >= 6 && currentOverId !== "";

  // Get player names
  const strikerName =
    battingPlayers.find((p) => p.id === strikerId)?.name || "";
  const nonStrikerName =
    battingPlayers.find((p) => p.id === nonStrikerId)?.name || "";
  const bowlerName = bowlingPlayers.find((p) => p.id === bowlerId)?.name || "";

  // Handle adding new player
  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;

    const team = ["bowler", "keeper", "fielder"].includes(addingPlayerFor)
      ? bowlingTeam
      : battingTeam;
    const battingOrder =
      (team === battingTeam ? battingPlayers : bowlingPlayers).length + 1;

    const result = await createPlayer(matchId, {
      name: newPlayerName.trim(),
      team,
      batting_order: battingOrder,
    });

    if (!result || result.error || !result.data) {
      if (result?.error) {
        alert(result.error);
      } else {
        alert("Error creating player");
      }
      return;
    }

    const newPlayer = result.data;

    if (newPlayer) {
      if (addingPlayerFor === "striker") setStrikerId(newPlayer.id);
      else if (addingPlayerFor === "nonStriker") setNonStrikerId(newPlayer.id);
      else if (addingPlayerFor === "bowler") setBowlerId(newPlayer.id);
      else if (addingPlayerFor === "keeper") setKeeperId(newPlayer.id);
      else if (addingPlayerFor === "fielder") setFielderId(newPlayer.id);

      // Only reload for keeper/fielder (during wicket recording)
      // For batsman/bowler, state update is enough
      if (addingPlayerFor === "keeper" || addingPlayerFor === "fielder") {
        window.location.reload();
      }

      // If we just added a new bowler specifically for the next over,
      // start that over immediately with this new bowler.
      if (addingPlayerFor === "bowler" && isAddingNewOverBowler) {
        const overNumber = Math.floor(ballsBowled / 6) + 1;
        const result = await startNewOver(inningsId, overNumber, newPlayer.id);

        if (result?.error) {
          alert(result.error);
          setIsAddingNewOverBowler(false);
          return;
        }

        if (result?.data) {
          setBowlerId(newPlayer.id);
          setCurrentOverId(result.data.id);
          hasSetNewOver.current = true;

          // Rotate strike at end of over (only if this is not the first over)
          if (ballsBowled > 0) {
            const temp = strikerId;
            setStrikerId(nonStrikerId);
            setNonStrikerId(temp);
          }

          setShowNewOverModal(false);
        }

        setIsAddingNewOverBowler(false);
      }
    }

    setNewPlayerName("");
    setShowAddPlayer(false);
  };

  // Handle starting first over with already-selected bowler
  const handleStartFirstOver = async () => {
    if (!bowlerId) {
      alert("Please select a bowler");
      return;
    }

    const result = await startNewOver(inningsId, 1, bowlerId);

    if (result?.data) {
      setCurrentOverId(result.data.id);
      hasSetNewOver.current = true; // Mark that we've explicitly set a new over
    }
  };

  // Handle starting new over - show modal first
  const handleStartNewOver = () => {
    setNewOverBowlerId("");
    setShowNewOverModal(true);
  };

  // Confirm new over after bowler selected
  const confirmNewOver = async () => {
    if (!newOverBowlerId) {
      alert("Please select a bowler");
      return;
    }

    // Prevent the same bowler from bowling two consecutive overs
    if (newOverBowlerId === bowlerId) {
      alert(
        "A bowler cannot bowl two consecutive overs. Please select a different bowler."
      );
      return;
    }

    const overNumber = Math.floor(ballsBowled / 6) + 1;
    const result = await startNewOver(inningsId, overNumber, newOverBowlerId);

    if (result?.error) {
      alert(result.error);
      return;
    }

    if (result?.data) {
      setBowlerId(newOverBowlerId);
      setCurrentOverId(result.data.id);
      hasSetNewOver.current = true; // Mark that we've explicitly set a new over
      // Rotate strike at end of over (only if this is not the first over)
      if (ballsBowled > 0) {
        const temp = strikerId;
        setStrikerId(nonStrikerId);
        setNonStrikerId(temp);
      }
      setShowNewOverModal(false);
      setNewOverBowlerId("");
    } else {
      alert("Could not start new over");
    }
  };

  // Open action modal for ball type selection
  const openActionModal = (action: BallAction) => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      alert("Please select striker, non-striker, and bowler");
      return;
    }
    if (needsNewOver && !currentOverId) {
      alert("Please start a new over first");
      return;
    }
    setCurrentAction(action);
    setSelectedRuns(0);
    setShowActionModal(true);
  };

  // Record the ball
  const handleRecordBall = async (isWicket: boolean = false) => {
    setIsRecording(true);

    try {
      let runs = 0;
      let extrasType: ExtrasType = "None";
      let extrasRuns = 0;

      if (currentAction === "runs") {
        runs = selectedRuns;
      } else if (currentAction === "wide") {
        extrasType = "Wide";
        extrasRuns = selectedRuns + 1; // Wide is always 1 + additional runs
        runs = 0;
      } else if (currentAction === "noball") {
        extrasType = "NoBall";
        extrasRuns = selectedRuns + 1; // No ball is always 1 + additional runs
        runs = 0;
      } else if (currentAction === "bye") {
        extrasType = "Bye";
        extrasRuns = selectedRuns;
        runs = 0;
      } else if (currentAction === "legbye") {
        extrasType = "LegBye";
        extrasRuns = selectedRuns;
        runs = 0;
      }

      const ballData = {
        over_id: currentOverId,
        ball_number: legalBallsInOver + 1,
        striker_id: strikerId,
        non_striker_id: nonStrikerId,
        runs_off_bat: runs,
        extras_type: extrasType,
        extras_runs: extrasRuns,
        wicket_type: isWicket ? wicketType : "None",
        dismissed_player_id: isWicket
          ? wicketType === "RunOut"
            ? runOutBatsmanId
            : strikerId
          : null,
      };

      const result = await recordBall(ballData);

      if (result) {
        // Handle strike rotation
        let shouldRotate = result.rotateStrike;

        // Special case: Wide with odd runs should rotate strike
        if (currentAction === "wide" && selectedRuns % 2 === 1) {
          shouldRotate = true;
        }

        if (shouldRotate) {
          const temp = strikerId;
          setStrikerId(nonStrikerId);
          setNonStrikerId(temp);
        }

        // Handle innings end
        if (result.shouldEndInnings) {
          alert("Innings completed!");
        }

        // Reset modals
        setShowActionModal(false);
        setShowWicketTypeModal(false);
        setCurrentAction(null);
        setWicketType("Bowled");
        setFielderId("");
        setKeeperId("");
        setRunOutBatsmanId("");

        // If wicket, prompt for new batsman
        if (isWicket) {
          setStrikerId("");
          setAddingPlayerFor("striker");
          setShowAddPlayer(true);
        }

        // Clear free hit after this ball (if it wasn't a no ball)
        if (currentAction !== "noball") {
          setIsFreeHit(false);
          if (typeof window !== "undefined") {
            const key = `free_hit_${inningsId}`;
            window.sessionStorage.removeItem(key);
          }
        }

        // Only reload if not a wicket (wicket will prompt for new batsman)
        if (!isWicket) {
          if (currentAction === "noball" && typeof window !== "undefined") {
            const key = `free_hit_${inningsId}`;
            window.sessionStorage.setItem(key, "1");
          }
          window.location.reload();
        }
      }
    } catch (error) {
      alert("Error recording ball: " + error);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ICC-Style Scorecard Display */}
      <div
        className="rounded-lg p-4"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Team Name and Score */}
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

        {/* Second Innings Target / Chase Info */}
        {isSecondInnings && targetRuns !== null && ballsRemaining !== null && (
          <p className="text-sm muted-text mb-2">
            Target {targetRuns}. Need {Math.max(targetRuns - currentScore, 0)}{" "}
            runs from {Math.max(ballsRemaining, 0)} balls.
          </p>
        )}

        {/* Batsmen Details */}
        {strikerId && (
          <div className="space-y-1.5 mb-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{strikerName} *</span>
              <span className="muted-text">-</span>
            </div>
            {nonStrikerId && (
              <div className="flex justify-between">
                <span>{nonStrikerName}</span>
                <span className="muted-text">-</span>
              </div>
            )}
          </div>
        )}

        {/* Bowler Details */}
        {bowlerId && (
          <div
            className="pt-2 border-t text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex justify-between">
              <span className="font-medium">{bowlerName}</span>
              <span className="muted-text">
                {calculateOvers(legalBallsInOver)}-0-0-0
              </span>
            </div>
          </div>
        )}

        {/* Current Over Display */}
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs muted-text mb-2">This Over:</p>
          <div className="flex gap-2 flex-wrap">
            {currentOverBalls.length === 0 ? (
              <span className="text-sm muted-text">No balls yet</span>
            ) : (
              currentOverBalls.map((ball, idx) => (
                <span
                  key={idx}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background:
                      ball.wicket_type !== "None"
                        ? "var(--danger)"
                        : ball.runs_off_bat === 4 || ball.runs_off_bat === 6
                        ? "var(--success)"
                        : "var(--background)",
                    color:
                      ball.wicket_type !== "None" ||
                      ball.runs_off_bat === 4 ||
                      ball.runs_off_bat === 6
                        ? "white"
                        : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {getBallDisplayText(
                    ball.runs_off_bat,
                    ball.extras_type,
                    ball.extras_runs,
                    ball.wicket_type
                  )}
                </span>
              ))
            )}
          </div>
          {isFreeHit && (
            <p
              className="text-xs font-medium mt-2"
              style={{ color: "var(--danger)" }}
            >
              ⚠️ FREE HIT
            </p>
          )}
        </div>
      </div>

      {/* Player Selection - Only show at innings start or after wicket */}
      {((ballsBowled === 0 && !currentOverId) || !strikerId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">
              Select Players to Start
            </h3>

            {/* Toss Results */}
            {tossWinner && tossDecision && (
              <div
                className="mb-4 p-3 rounded-md"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <p className="text-sm muted-text mb-1">Toss Result:</p>
                <p className="text-sm font-medium">
                  {tossWinner === "A" ? teamAName : teamBName} won the toss and
                  chose to {tossDecision === "Bat" ? "bat" : "bowl"}
                </p>
              </div>
            )}

            {/* Striker */}
            <div className="mb-3">
              <label className="text-sm muted-text mb-1 block">Striker *</label>
              <div className="flex gap-2">
                <select
                  value={strikerId}
                  onChange={(e) => setStrikerId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value="">Select striker...</option>
                  {battingPlayers.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.id === nonStrikerId}
                    >
                      {p.name}
                      {p.id === nonStrikerId
                        ? " (selected as non-striker)"
                        : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setAddingPlayerFor("striker");
                    setShowAddPlayer(true);
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            {/* Non-Striker */}
            <div className="mb-3">
              <label className="text-sm muted-text mb-1 block">
                Non-Striker *
              </label>
              <div className="flex gap-2">
                <select
                  value={nonStrikerId}
                  onChange={(e) => setNonStrikerId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value="">Select non-striker...</option>
                  {battingPlayers.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.id === strikerId}
                    >
                      {p.name}
                      {p.id === strikerId ? " (selected as striker)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setAddingPlayerFor("nonStriker");
                    setShowAddPlayer(true);
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            {/* Bowler */}
            <div className="mb-4">
              <label className="text-sm muted-text mb-1 block">Bowler *</label>
              <div className="flex gap-2">
                <select
                  value={bowlerId}
                  onChange={(e) => setBowlerId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value="">Select bowler...</option>
                  {bowlingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setAddingPlayerFor("bowler");
                    setIsAddingNewOverBowler(false);
                    setShowAddPlayer(true);
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            {/* Validation messages */}
            {strikerId && nonStrikerId && strikerId === nonStrikerId && (
              <p className="text-xs mb-3" style={{ color: "var(--danger)" }}>
                ⚠ Striker and non-striker must be different players
              </p>
            )}

            {/* Start Button */}
            {ballsBowled === 0 && (
              <button
                onClick={() => {
                  if (!strikerId || !nonStrikerId || !bowlerId) {
                    alert("Please select all three players");
                    return;
                  }
                  if (strikerId === nonStrikerId) {
                    alert("Striker and non-striker must be different players");
                    return;
                  }
                  // Start scoring by starting the first over with selected bowler
                  handleStartFirstOver();
                }}
                disabled={
                  !strikerId ||
                  !nonStrikerId ||
                  !bowlerId ||
                  strikerId === nonStrikerId
                }
                className="w-full py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)" }}
              >
                Start Scoring
              </button>
            )}

            {ballsBowled > 0 && (
              <p className="text-xs muted-text text-center">
                Select a new batsman to continue
              </p>
            )}
          </div>
        </div>
      )}

      {/* New Over Prompt */}
      {needsNewOver && (
        <div
          className="rounded-lg p-4 text-center"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            border: "1px solid var(--accent)",
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--accent)" }}
          >
            Over completed! Start new over?
          </p>
          <button
            onClick={handleStartNewOver}
            className="px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Start Over {Math.floor(ballsBowled / 6) + 1}
          </button>
        </div>
      )}

      {/* Main Action Buttons */}
      {currentOverId && strikerId && nonStrikerId && bowlerId && (
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-sm font-medium mb-3">Ball Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            {/* Add Next Ball Button */}
            <button
              onClick={() => setShowActionModal(true)}
              disabled={isRecording || needsNewOver}
              className="py-4 rounded-md text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              ➕ Add Next Ball
            </button>

            {/* Edit Previous Ball Button */}
            {recentBalls.length > 0 && (
              <button
                onClick={() => {
                  alert("Edit previous ball feature coming soon!");
                }}
                disabled={isRecording}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                ✏️ Edit Previous Ball
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ball Type Selection Modal - Shown when Add Next Ball is clicked */}
      {showActionModal && !currentAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">Select Ball Type</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setCurrentAction("runs");
                  setSelectedRuns(0);
                }}
                className="py-4 rounded-md text-sm font-semibold"
                style={{
                  background: "var(--accent)",
                  color: "white",
                }}
              >
                Runs (0-6)
              </button>
              <button
                onClick={() => {
                  setCurrentAction("wicket");
                }}
                disabled={isRecording}
                className="py-4 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                Wicket
              </button>
              <button
                onClick={() => {
                  setCurrentAction("wide");
                  setSelectedRuns(0);
                }}
                className="py-4 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Wide
              </button>
              <button
                onClick={() => {
                  setCurrentAction("noball");
                  setSelectedRuns(0);
                }}
                className="py-4 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                No Ball
              </button>
              <button
                onClick={() => {
                  setCurrentAction("bye");
                  setSelectedRuns(0);
                }}
                className="py-4 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Bye
              </button>
              <button
                onClick={() => {
                  setCurrentAction("legbye");
                  setSelectedRuns(0);
                }}
                className="py-4 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Leg Bye
              </button>
            </div>

            <button
              onClick={() => {
                setShowActionModal(false);
                setCurrentAction(null);
              }}
              className="w-full py-2 rounded-md text-sm font-medium"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Runs/Extras Selection Modal */}
      {showActionModal && currentAction && currentAction !== "wicket" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">
              {currentAction === "runs" && "Select Runs"}
              {currentAction === "wide" && "Wide + Runs"}
              {currentAction === "noball" && "No Ball + Runs"}
              {currentAction === "bye" && "Bye Runs"}
              {currentAction === "legbye" && "Leg Bye Runs"}
            </h3>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {currentAction === "runs"
                ? [0, 1, 2, 3, 4, 5, 6].map((run) => (
                    <button
                      key={run}
                      onClick={() => setSelectedRuns(run)}
                      className="py-3 rounded-md text-lg font-bold"
                      style={{
                        background:
                          selectedRuns === run
                            ? "var(--accent)"
                            : "var(--background)",
                        color:
                          selectedRuns === run ? "white" : "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {run}
                    </button>
                  ))
                : currentAction === "bye" || currentAction === "legbye"
                ? [1, 2, 3, 4, 5].map((run) => (
                    <button
                      key={run}
                      onClick={() => setSelectedRuns(run)}
                      className="py-3 rounded-md text-sm font-semibold"
                      style={{
                        background:
                          selectedRuns === run
                            ? "var(--accent)"
                            : "var(--background)",
                        color:
                          selectedRuns === run ? "white" : "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {run}
                    </button>
                  ))
                : [0, 1, 2, 3, 4, 5, 6, 7, 8].map((run) => (
                    <button
                      key={run}
                      onClick={() => setSelectedRuns(run)}
                      className="py-3 rounded-md text-sm font-semibold"
                      style={{
                        background:
                          selectedRuns === run
                            ? "var(--accent)"
                            : "var(--background)",
                        color:
                          selectedRuns === run ? "white" : "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {run}
                    </button>
                  ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleRecordBall(false)}
                disabled={isRecording}
                className="flex-1 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setCurrentAction(null);
                  setSelectedRuns(0);
                }}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wicket Type Modal */}
      {showActionModal && currentAction === "wicket" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">Select Wicket Type</h3>

            {isFreeHit && (
              <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>
                ⚠️ Free Hit: Only Run Out is allowed
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => {
                  setWicketType("Bowled");
                  handleRecordBall(true);
                }}
                disabled={isRecording || isFreeHit}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                Bowled
              </button>
              <button
                onClick={() => {
                  setWicketType("LBW");
                  handleRecordBall(true);
                }}
                disabled={isRecording || isFreeHit}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                LBW
              </button>
              <button
                onClick={() => {
                  setWicketType("Caught");
                  setShowWicketTypeModal(true);
                }}
                disabled={isFreeHit}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                Caught
              </button>
              <button
                onClick={() => {
                  setWicketType("Stumps");
                  setShowWicketTypeModal(true);
                }}
                disabled={isFreeHit}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                Stumped
              </button>
              <button
                onClick={() => {
                  setWicketType("RunOut");
                  setShowWicketTypeModal(true);
                }}
                className="py-3 rounded-md text-sm font-medium"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                Run Out
              </button>
              <button
                onClick={() => {
                  setWicketType("HitWicket");
                  handleRecordBall(true);
                }}
                disabled={isRecording || isFreeHit}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
              >
                Hit Wicket
              </button>
            </div>

            <button
              onClick={() => {
                setShowActionModal(false);
                setCurrentAction(null);
              }}
              className="w-full py-2 rounded-md text-sm font-medium"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Wicket Details Modal (for Caught/Stumped/Run Out) */}
      {showWicketTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">
              {wicketType === "Caught" && "Caught by"}
              {wicketType === "Stumps" && "Stumped by"}
              {wicketType === "RunOut" && "Run Out Details"}
            </h3>

            {wicketType === "RunOut" && (
              <div className="mb-4">
                <label className="text-sm muted-text mb-1 block">
                  Batsman Out
                </label>
                <select
                  value={runOutBatsmanId}
                  onChange={(e) => setRunOutBatsmanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md mb-3"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value="">Select batsman...</option>
                  <option value={strikerId}>{strikerName} (Striker)</option>
                  <option value={nonStrikerId}>
                    {nonStrikerName} (Non-Striker)
                  </option>
                </select>

                <label className="text-sm muted-text mb-1 block">
                  Runs Attempted
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0, 1, 2, 3].map((run) => (
                    <button
                      key={run}
                      onClick={() => setSelectedRuns(run)}
                      className="py-2 rounded-md text-sm font-semibold"
                      style={{
                        background:
                          selectedRuns === run
                            ? "var(--accent)"
                            : "var(--background)",
                        color:
                          selectedRuns === run ? "white" : "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {run}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm muted-text mb-1 block">
                {wicketType === "Stumps" ? "Keeper" : "Fielder"}
              </label>
              <div className="flex gap-2">
                <select
                  value={wicketType === "Stumps" ? keeperId : fielderId}
                  onChange={(e) =>
                    wicketType === "Stumps"
                      ? setKeeperId(e.target.value)
                      : setFielderId(e.target.value)
                  }
                  className="flex-1 px-3 py-2 rounded-md"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value="">Select...</option>
                  {fieldingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setAddingPlayerFor(
                      wicketType === "Stumps" ? "keeper" : "fielder"
                    );
                    setShowAddPlayer(true);
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleRecordBall(true)}
                disabled={
                  isRecording || (wicketType === "RunOut" && !runOutBatsmanId)
                }
                className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--danger)" }}
              >
                Record Wicket
              </button>
              <button
                onClick={() => {
                  setShowWicketTypeModal(false);
                  setShowActionModal(false);
                  setCurrentAction(null);
                  setWicketType("Bowled");
                  setFielderId("");
                  setKeeperId("");
                  setRunOutBatsmanId("");
                  setSelectedRuns(0);
                }}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">{addPlayerTitle}</h3>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder={addPlayerPlaceholder}
              className="w-full px-3 py-2 rounded-md mb-4"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddPlayer}
                className="flex-1 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                {addPlayerButtonLabel}
              </button>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setNewPlayerName("");
                }}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Over Modal - Bowler Selection */}
      {showNewOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-medium mb-4">
              Start Over {Math.floor(ballsBowled / 6) + 1}
            </h3>

            <p className="text-sm muted-text mb-4">
              Select bowler for the new over
            </p>

            {/* Bowler Selection */}
            <div className="mb-4">
              <label className="text-sm muted-text mb-1 block">Bowler *</label>
              <div className="flex gap-2">
                <select
                  value={newOverBowlerId}
                  onChange={(e) => {
                    setNewOverBowlerId(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  autoFocus
                >
                  <option value="">Select bowler...</option>
                  {bowlingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setAddingPlayerFor("bowler");
                    setIsAddingNewOverBowler(true);
                    setShowAddPlayer(true);
                    setShowNewOverModal(false);
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmNewOver}
                disabled={!newOverBowlerId}
                className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)" }}
              >
                Start Over
              </button>
              <button
                onClick={() => {
                  setShowNewOverModal(false);
                  setNewOverBowlerId("");
                }}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
