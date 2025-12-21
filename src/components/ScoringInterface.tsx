"use client";

import { useState, useEffect, useRef } from "react";
import {
  recordBall,
  startNewOver,
  deleteLastBall,
  retireBatsman,
  updateOverBowler,
} from "@/app/actions/scoring";
import { createPlayer } from "@/app/actions/matches";
import {
  calculateRunRate,
  calculateRequiredRunRate,
  formatRunRate,
  isLegalBall,
} from "@/lib/cricket/scoring";
import type { Ball, Player, ExtrasType, WicketType } from "@/types";

// Import all subcomponents
import ScoreDisplay from "./scoring/ScoreDisplay";
import CurrentOverDisplay from "./scoring/CurrentOverDisplay";
import FullScorecard from "./scoring/FullScorecard";
import PlayerSelectionModal from "./scoring/PlayerSelectionModal";
import BallActionModal from "./scoring/BallActionModal";
import WicketModal from "./scoring/WicketModal";
import ScoringControls from "./scoring/ScoringControls";
import AddPlayerModal from "./scoring/AddPlayerModal";
import {
  NewOverModal,
  DeleteBallModal,
  ChangeStrikeModal,
  RetireModal,
  ChangeBowlerModal,
} from "./scoring/UtilityModals";

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
  firstInningsTeam: "A" | "B" | null;
  liveBatting: {
    playerId: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
    dismissal?: string | null;
    isOut?: boolean;
  }[];
  liveBowling: {
    playerId: string;
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: string;
  }[];
  firstInningsBatting: {
    playerId: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
    dismissal?: string | null;
    isOut?: boolean;
  }[];
  firstInningsBowling: {
    playerId: string;
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: string;
  }[];
  currentInningsExtras?: number | null;
  firstInningsExtras?: number | null;
  firstInningsRunRate?: string | null;
  teamASummary?: { runs: number; wickets: number; overs: string } | null;
  teamBSummary?: { runs: number; wickets: number; overs: string } | null;
  matchResult?: string | null;
  readOnly?: boolean;
}

export default function ScoringInterface(props: ScoringInterfaceProps) {
  const {
    matchId,
    inningsId,
    battingTeam,
    bowlingTeam,
    teamAName,
    teamBName,
    currentScore,
    currentWickets,
    ballsBowled,
    existingPlayers,
    recentBalls,
    tossWinner,
    tossDecision,
    isSecondInnings,
    targetRuns,
    ballsRemaining,
    firstInningsTeam,
    liveBatting,
    liveBowling,
    firstInningsBatting,
    firstInningsBowling,
    currentInningsExtras,
    firstInningsExtras,
    firstInningsRunRate,
    teamASummary,
    teamBSummary,
    matchResult,
    readOnly = false,
  } = props;

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
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);

  // Undo / strike change modals
  const [showDeleteLastBallModal, setShowDeleteLastBallModal] = useState(false);
  const [isDeletingLastBall, setIsDeletingLastBall] = useState(false);
  const [showChangeStrikeModal, setShowChangeStrikeModal] = useState(false);

  // Retire batsman modal
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retirePlayerId, setRetirePlayerId] = useState<string>("");
  const [retireReason, setRetireReason] = useState<string>("");

  // Change bowler modal (for current over)
  const [showChangeBowlerModal, setShowChangeBowlerModal] = useState(false);
  const [newBowlerForOverId, setNewBowlerForOverId] = useState<string>("");

  // Computed values
  const leftTeam: "A" | "B" = firstInningsTeam || "A";
  const rightTeam: "A" | "B" = leftTeam === "A" ? "B" : "A";

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

  // Balls belonging to the currently selected over
  const currentOverBalls = recentBalls.filter(
    (b) => b.over_id === currentOverId
  );
  const legalBallsInCurrentSegment = currentOverBalls.filter((b) =>
    isLegalBall(b.extras_type as ExtrasType)
  ).length;

  // Global over state is driven by innings.balls_bowled
  const totalLegalBalls = ballsBowled;
  const legalThisOver = totalLegalBalls === 0 ? 0 : totalLegalBalls % 6;
  // When over is complete (legalThisOver === 0) and needsNewOver is true, show empty
  const targetLegalForDisplay = legalThisOver;

  const displayOverBalls: Ball[] = [];
  if (targetLegalForDisplay > 0) {
    let legalCount = 0;
    for (const ball of recentBalls) {
      // Push to keep most recent at the left (index 0)
      displayOverBalls.push(ball);
      if (isLegalBall(ball.extras_type as ExtrasType)) {
        legalCount += 1;
        if (legalCount >= targetLegalForDisplay) {
          break;
        }
      }
    }
  }

  // A new over is needed whenever we've completed a multiple of 6 legal balls
  const needsNewOver =
    !readOnly &&
    totalLegalBalls > 0 &&
    totalLegalBalls % 6 === 0 &&
    !hasSetNewOver.current;

  // Get player names
  const strikerName =
    battingPlayers.find((p) => p.id === strikerId)?.name || "";
  const nonStrikerName =
    battingPlayers.find((p) => p.id === nonStrikerId)?.name || "";
  const bowlerName = bowlingPlayers.find((p) => p.id === bowlerId)?.name || "";

  // Run rates
  const currentRunRate = calculateRunRate(currentScore, ballsBowled);
  const currentRunRateText = formatRunRate(currentRunRate);
  const requiredRunRateText =
    isSecondInnings &&
    targetRuns !== null &&
    ballsRemaining !== null &&
    ballsRemaining > 0
      ? formatRunRate(
          calculateRequiredRunRate(targetRuns, currentScore, ballsRemaining)
        )
      : "-";

  // Live stats for current striker, non-striker and bowler
  const strikerStats = liveBatting.find((b) => b.playerId === strikerId);
  const nonStrikerStats = liveBatting.find((b) => b.playerId === nonStrikerId);
  const bowlerStats = liveBowling.find((b) => b.playerId === bowlerId);

  // Handle adding new player
  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;

    setIsSavingPlayer(true);

    const team = ["bowler", "keeper", "fielder"].includes(addingPlayerFor)
      ? bowlingTeam
      : battingTeam;
    const battingOrder =
      (team === battingTeam ? battingPlayers : bowlingPlayers).length + 1;

    try {
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
        else if (addingPlayerFor === "nonStriker")
          setNonStrikerId(newPlayer.id);
        else if (addingPlayerFor === "bowler") setBowlerId(newPlayer.id);
        else if (addingPlayerFor === "keeper") setKeeperId(newPlayer.id);
        else if (addingPlayerFor === "fielder") setFielderId(newPlayer.id);

        // If we just added a new bowler specifically for the next over
        if (addingPlayerFor === "bowler" && isAddingNewOverBowler) {
          const overNumber = Math.floor(ballsBowled / 6) + 1;
          const result = await startNewOver(
            inningsId,
            overNumber,
            newPlayer.id
          );

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
    } finally {
      setIsSavingPlayer(false);
    }
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
      hasSetNewOver.current = true;
    }
  };

  // Handle starting new over - show modal first
  const handleStartNewOver = () => {
    setNewOverBowlerId("");
    setShowNewOverModal(true);
  };

  // Delete the most recent delivery
  const handleDeleteLastBall = async () => {
    if (!inningsId) return;
    setIsDeletingLastBall(true);
    try {
      const result = await deleteLastBall(inningsId);
      if (!result || (result as { error?: string }).error) {
        alert(result?.error || "Error deleting last delivery");
        return;
      }
    } catch (error) {
      alert("Error deleting last delivery: " + error);
    } finally {
      setIsDeletingLastBall(false);
      setShowDeleteLastBallModal(false);
    }
  };

  const handleRetireBatsman = async () => {
    if (!inningsId || !retirePlayerId || !retireReason.trim()) {
      return;
    }

    const result = await retireBatsman(inningsId, retirePlayerId, retireReason);

    if ((result as { error?: string })?.error) {
      alert(result.error);
      return;
    }

    // Clear retired batter from strike if needed and prompt a replacement batter
    if (retirePlayerId === strikerId) {
      setStrikerId("");
      setAddingPlayerFor("striker");
      setShowAddPlayer(true);
    } else if (retirePlayerId === nonStrikerId) {
      setNonStrikerId("");
      setAddingPlayerFor("nonStriker");
      setShowAddPlayer(true);
    }

    setShowRetireModal(false);
    setRetirePlayerId("");
    setRetireReason("");
  };

  const handleChangeBowlerForOver = async () => {
    if (!currentOverId || !newBowlerForOverId) return;

    // If no balls have been bowled in this over yet, simply correct the bowler
    if (currentOverBalls.length === 0) {
      const result = await updateOverBowler(currentOverId, newBowlerForOverId);

      if ((result as { error?: string })?.error) {
        alert(result.error);
        return;
      }

      setBowlerId(newBowlerForOverId);
      setShowChangeBowlerModal(false);
      setNewBowlerForOverId("");
      return;
    }

    // Mid-over change: start a new over for the new bowler
    const overNumber = Math.floor(ballsBowled / 6) + 1;
    const result = await startNewOver(
      inningsId,
      overNumber,
      newBowlerForOverId
    );

    if (result?.error) {
      alert(result.error);
      return;
    }

    if (result?.data) {
      setBowlerId(newBowlerForOverId);
      setCurrentOverId(result.data.id);
      hasSetNewOver.current = true;
      setShowChangeBowlerModal(false);
      setNewBowlerForOverId("");
    } else {
      alert("Could not change bowler");
    }
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
      hasSetNewOver.current = true;

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
        extrasRuns = selectedRuns + 1;
        runs = 0;
      } else if (currentAction === "noball") {
        extrasType = "NoBall";
        extrasRuns = selectedRuns + 1;
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
        ball_number: legalBallsInCurrentSegment + 1,
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
        fielder_id:
          isWicket && (wicketType === "Caught" || wicketType === "RunOut")
            ? fielderId || null
            : null,
        keeper_id:
          isWicket && wicketType === "Stumps" ? keeperId || null : null,
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
          hasSetNewOver.current = true;
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

        // Persist free hit flag client-side
        if (
          !isWicket &&
          currentAction === "noball" &&
          typeof window !== "undefined"
        ) {
          const key = `free_hit_${inningsId}`;
          window.sessionStorage.setItem(key, "1");
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
      {/* Score Display */}
      <ScoreDisplay
        battingTeam={battingTeam}
        teamAName={teamAName}
        teamBName={teamBName}
        currentScore={currentScore}
        currentWickets={currentWickets}
        ballsBowled={ballsBowled}
        tossWinner={tossWinner}
        tossDecision={tossDecision}
        readOnly={readOnly}
        matchResult={matchResult}
        teamASummary={teamASummary}
        teamBSummary={teamBSummary}
        isSecondInnings={isSecondInnings}
        targetRuns={targetRuns}
        ballsRemaining={ballsRemaining}
        currentRunRateText={currentRunRateText}
        requiredRunRateText={requiredRunRateText}
        strikerName={strikerName}
        nonStrikerName={nonStrikerName}
        strikerStats={strikerStats || null}
        nonStrikerStats={nonStrikerStats || null}
        bowlerName={bowlerName}
        bowlerStats={bowlerStats || null}
      />

      {/* Current Over Display */}
      <CurrentOverDisplay
        displayOverBalls={displayOverBalls}
        isFreeHit={isFreeHit}
        readOnly={readOnly}
        matchResult={matchResult}
      />

      {/* Full Scorecard */}
      <FullScorecard
        teamAName={teamAName}
        teamBName={teamBName}
        leftTeam={leftTeam}
        rightTeam={rightTeam}
        battingTeam={battingTeam}
        firstInningsTeam={firstInningsTeam}
        liveBatting={liveBatting}
        liveBowling={liveBowling}
        currentInningsExtras={currentInningsExtras}
        currentRunRateText={currentRunRateText}
        firstInningsBatting={firstInningsBatting}
        firstInningsBowling={firstInningsBowling}
        firstInningsExtras={firstInningsExtras}
        firstInningsRunRate={firstInningsRunRate}
        strikerId={strikerId}
        nonStrikerId={nonStrikerId}
      />

      {/* Player Selection Modal */}
      {!readOnly && (
        <PlayerSelectionModal
          show={ballsBowled === 0 && !currentOverId}
          teamAName={teamAName}
          teamBName={teamBName}
          tossWinner={tossWinner}
          tossDecision={tossDecision}
          battingPlayers={battingPlayers}
          bowlingPlayers={bowlingPlayers}
          strikerId={strikerId}
          nonStrikerId={nonStrikerId}
          bowlerId={bowlerId}
          ballsBowled={ballsBowled}
          onStrikerChange={setStrikerId}
          onNonStrikerChange={setNonStrikerId}
          onBowlerChange={setBowlerId}
          onAddPlayer={(role) => {
            setAddingPlayerFor(role);
            setShowAddPlayer(true);
          }}
          onStart={() => {
            if (!strikerId || !nonStrikerId || !bowlerId) {
              alert("Please select all three players");
              return;
            }
            if (strikerId === nonStrikerId) {
              alert("Striker and non-striker must be different players");
              return;
            }
            handleStartFirstOver();
          }}
        />
      )}

      {/* Scoring Controls */}
      {!readOnly && currentOverId && (
        <ScoringControls
          isRecording={isRecording}
          needsNewOver={needsNewOver}
          hasRecentBalls={recentBalls.length > 0}
          strikerId={strikerId}
          nonStrikerId={nonStrikerId}
          bowlerId={bowlerId}
          ballsBowled={ballsBowled}
          onAddBall={() => setShowActionModal(true)}
          onDeleteLastBall={() => setShowDeleteLastBallModal(true)}
          onChangeStrike={() => setShowChangeStrikeModal(true)}
          onRetireBatsman={() => {
            setRetirePlayerId(strikerId || nonStrikerId);
            setRetireReason("retired hurt");
            setShowRetireModal(true);
          }}
          onChangeBowler={() => {
            setNewBowlerForOverId(bowlerId);
            setShowChangeBowlerModal(true);
          }}
          onStartNewOver={handleStartNewOver}
        />
      )}

      {/* Ball Action Modal */}
      {!readOnly && (
        <BallActionModal
          show={showActionModal}
          currentAction={currentAction}
          selectedRuns={selectedRuns}
          isRecording={isRecording}
          isFreeHit={isFreeHit}
          onSelectAction={(action) => {
            setCurrentAction(action);
            if (action === "wicket") {
              setShowWicketTypeModal(true);
            }
          }}
          onSelectRuns={setSelectedRuns}
          onRecord={() => handleRecordBall(false)}
          onCancel={() => {
            setShowActionModal(false);
            setCurrentAction(null);
            setSelectedRuns(0);
          }}
        />
      )}

      {/* Wicket Modal */}
      {!readOnly && currentAction === "wicket" && (
        <WicketModal
          show={showWicketTypeModal}
          wicketType={wicketType}
          fielderId={fielderId}
          keeperId={keeperId}
          runOutBatsmanId={runOutBatsmanId}
          selectedRuns={selectedRuns}
          isRecording={isRecording}
          fieldingPlayers={fieldingPlayers}
          strikerName={strikerName}
          nonStrikerName={nonStrikerName}
          strikerId={strikerId}
          nonStrikerId={nonStrikerId}
          onWicketTypeChange={setWicketType}
          onFielderChange={setFielderId}
          onKeeperChange={setKeeperId}
          onRunOutBatsmanChange={setRunOutBatsmanId}
          onRunsChange={setSelectedRuns}
          onAddPlayer={(role) => {
            setAddingPlayerFor(role);
            setShowAddPlayer(true);
          }}
          onRecord={() => handleRecordBall(true)}
          onCancel={() => {
            setShowWicketTypeModal(false);
            setShowActionModal(false);
            setCurrentAction(null);
            setWicketType("Bowled");
            setFielderId("");
            setKeeperId("");
            setRunOutBatsmanId("");
            setSelectedRuns(0);
          }}
        />
      )}

      {/* Add Player Modal */}
      {!readOnly && (
        <AddPlayerModal
          show={showAddPlayer}
          playerName={newPlayerName}
          isSaving={isSavingPlayer}
          title={addPlayerTitle}
          placeholder={addPlayerPlaceholder}
          buttonLabel={addPlayerButtonLabel}
          onNameChange={setNewPlayerName}
          onSave={handleAddPlayer}
          onCancel={() => {
            setShowAddPlayer(false);
            setNewPlayerName("");
          }}
        />
      )}

      {/* Utility Modals */}
      {!readOnly && (
        <>
          <NewOverModal
            show={showNewOverModal}
            ballsBowled={ballsBowled}
            newOverBowlerId={newOverBowlerId}
            bowlingPlayers={bowlingPlayers}
            onBowlerChange={setNewOverBowlerId}
            onAddPlayer={() => {
              setAddingPlayerFor("bowler");
              setIsAddingNewOverBowler(true);
              setShowAddPlayer(true);
              setShowNewOverModal(false);
            }}
            onConfirm={confirmNewOver}
            onCancel={() => {
              setShowNewOverModal(false);
              setNewOverBowlerId("");
            }}
          />

          <DeleteBallModal
            show={showDeleteLastBallModal}
            isDeleting={isDeletingLastBall}
            onConfirm={handleDeleteLastBall}
            onCancel={() => setShowDeleteLastBallModal(false)}
          />

          <ChangeStrikeModal
            show={showChangeStrikeModal}
            strikerName={strikerName}
            nonStrikerName={nonStrikerName}
            onConfirm={() => {
              const temp = strikerId;
              setStrikerId(nonStrikerId);
              setNonStrikerId(temp);
              setShowChangeStrikeModal(false);
            }}
            onCancel={() => setShowChangeStrikeModal(false)}
          />

          <RetireModal
            show={showRetireModal}
            retireReason={retireReason}
            onReasonChange={setRetireReason}
            onConfirm={handleRetireBatsman}
            onCancel={() => {
              setShowRetireModal(false);
              setRetirePlayerId("");
              setRetireReason("");
            }}
          />

          <ChangeBowlerModal
            show={showChangeBowlerModal}
            newBowlerForOverId={newBowlerForOverId}
            bowlingPlayers={bowlingPlayers}
            onBowlerChange={setNewBowlerForOverId}
            onAddPlayer={() => {
              setAddingPlayerFor("bowler");
              setShowAddPlayer(true);
              setShowChangeBowlerModal(false);
            }}
            onConfirm={handleChangeBowlerForOver}
            onCancel={() => {
              setShowChangeBowlerModal(false);
              setNewBowlerForOverId("");
            }}
          />
        </>
      )}
    </div>
  );
}
