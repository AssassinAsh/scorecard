"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TeamEditDialog from "./TeamEditDialog";
import TossDialog from "./TossDialog";
import { startInnings } from "@/app/actions/scoring";
import { updateMatchStatus } from "@/app/actions/matches";
import type { TeamSide, TossDecision } from "@/types";

interface MatchHeaderProps {
  match: {
    id: string;
    tournament_id: string;
    team_a_id: string;
    team_b_id: string;
    team_a_name: string;
    team_b_name: string;
    team_a_contact: string | null;
    team_b_contact: string | null;
    status: string;
    match_type: string | null;
    match_date: string | null;
    overs: number;
  };
  canEditContacts: boolean;
  showScorerActions: boolean;
  hasTossData: boolean;
  hasPlayers: boolean;
  tossWinner: TeamSide | null;
  tossDecision: TossDecision | null;
  showDisplayCTA: boolean;
}

export default function MatchHeader({
  match,
  canEditContacts,
  showScorerActions,
  hasTossData,
  hasPlayers,
  tossWinner,
  tossDecision,
  showDisplayCTA,
}: MatchHeaderProps) {
  const [editingTeam, setEditingTeam] = useState<"A" | "B" | null>(null);
  const [showTossDialog, setShowTossDialog] = useState(false);
  const [isStartingFirstInnings, setIsStartingFirstInnings] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleStartFirstInnings = async () => {
    if (!tossWinner || !tossDecision) {
      alert("Please record the toss before starting the match.");
      return;
    }
    if (isStartingFirstInnings) return;

    setIsStartingFirstInnings(true);
    try {
      const battingTeam =
        tossDecision === "Bat" ? tossWinner : tossWinner === "A" ? "B" : "A";
      const bowlingTeam = battingTeam === "A" ? "B" : "A";

      await updateMatchStatus(match.id, "Live");
      const result = await startInnings(match.id, battingTeam, bowlingTeam);

      if (!result || ("error" in result && result.error)) {
        alert("Failed to start innings");
        setIsStartingFirstInnings(false);
        return;
      }

      router.push(`/match/${match.id}/score`);
    } catch (error) {
      alert("Error starting match: " + error);
      setIsStartingFirstInnings(false);
    }
  };

  return (
    <>
      <header
        className="py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-medium flex items-center gap-2">
                <span>{match.team_a_name}</span>
                {canEditContacts && (
                  <button
                    onClick={() => setEditingTeam("A")}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent)" }}
                    title="Edit team"
                  >
                    ✏️
                  </button>
                )}
                <span className="mx-1">vs</span>
                <span>{match.team_b_name}</span>
                {canEditContacts && (
                  <button
                    onClick={() => setEditingTeam("B")}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent)" }}
                    title="Edit team"
                  >
                    ✏️
                  </button>
                )}
              </h1>
              <p className="text-sm muted-text mt-1">
                {formatDate(match.match_date)} • {match.overs} overs
              </p>
            </div>
            <div className="flex items-end flex-col gap-1">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  match.status === "Live"
                    ? "bg-red-600/20 text-red-500"
                    : match.status === "Completed"
                    ? "bg-green-600/20 text-green-500"
                    : "bg-blue-600/20 text-blue-500"
                }`}
              >
                {match.status}
              </span>
              {match.match_type && (
                <span className="text-xs uppercase muted-text tracking-wide">
                  {match.match_type}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs">
            {showScorerActions && match.status === "Upcoming" && (
              <button
                onClick={() => setShowTossDialog(true)}
                className="px-3 py-1.5 rounded-md font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                {hasTossData ? "Update Toss" : "Complete Toss"}
              </button>
            )}
            {showScorerActions && match.status === "Starting Soon" && (
              <button
                onClick={handleStartFirstInnings}
                disabled={isStartingFirstInnings}
                className="px-3 py-1.5 rounded-md font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)" }}
              >
                {isStartingFirstInnings ? "Starting..." : "Start First Innings"}
              </button>
            )}
            {showScorerActions &&
              (match.status === "Live" || match.status === "Innings Break") && (
                <Link
                  href={`/match/${match.id}/score`}
                  className="px-3 py-1.5 rounded-md font-medium text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {match.status === "Live"
                    ? "Score Live"
                    : "Start Second Innings"}
                </Link>
              )}
            {showDisplayCTA &&
              (match.status === "Live" ||
                match.status === "Innings Break" ||
                match.status === "Completed") && (
                <Link
                  href={`/match/${match.id}/display`}
                  className="px-3 py-1.5 rounded-md font-medium"
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "var(--accent)",
                  }}
                >
                  ⛶ Full Screen
                </Link>
              )}
          </div>
        </div>
      </header>

      {editingTeam === "A" && (
        <TeamEditDialog
          isOpen={true}
          onClose={() => setEditingTeam(null)}
          teamId={match.team_a_id}
          teamName={match.team_a_name}
          contactNumber={match.team_a_contact}
          matchId={match.id}
          tournamentId={match.tournament_id}
        />
      )}

      {editingTeam === "B" && (
        <TeamEditDialog
          isOpen={true}
          onClose={() => setEditingTeam(null)}
          teamId={match.team_b_id}
          teamName={match.team_b_name}
          contactNumber={match.team_b_contact}
          matchId={match.id}
          tournamentId={match.tournament_id}
        />
      )}

      <TossDialog
        isOpen={showTossDialog}
        onClose={() => setShowTossDialog(false)}
        matchId={match.id}
        teamAName={match.team_a_name}
        teamBName={match.team_b_name}
        existingWinner={tossWinner}
        existingDecision={tossDecision}
      />
    </>
  );
}
