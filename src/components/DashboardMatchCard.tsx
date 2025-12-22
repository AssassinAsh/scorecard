"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Match } from "@/types";
import { startInnings } from "@/app/actions/scoring";
import { updateMatchStatus, deleteMatch } from "@/app/actions/matches";
import TossForm from "./TossForm";

interface DashboardMatchCardProps {
  match: Match;
  isAdmin?: boolean;
  winnerText?: string | null;
}

export default function DashboardMatchCard({
  match,
  isAdmin,
  winnerText,
}: DashboardMatchCardProps) {
  const router = useRouter();
  const [showTossDialog, setShowTossDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [isStartingFirstInnings, setIsStartingFirstInnings] = useState(false);

  const handleStartFirstInnings = async () => {
    if (!match.toss_winner || !match.toss_decision) {
      alert("Please record the toss before starting the match.");
      return;
    }
    if (isStartingFirstInnings) return;

    setIsStartingFirstInnings(true);
    try {
      const tossWinner = match.toss_winner;
      const battingTeam =
        match.toss_decision === "Bat"
          ? tossWinner
          : tossWinner === "A"
          ? "B"
          : "A";
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

  const getPrimaryCta = () => {
    switch (match.status) {
      case "Upcoming":
        return {
          label: "Update Toss Decision",
          action: () => setShowTossDialog(true),
        };
      case "Starting Soon":
        return {
          label: isStartingFirstInnings ? "Starting..." : "Start First Innings",
          action: handleStartFirstInnings,
        };
      case "Live":
        return {
          label: "Score Live",
          action: () => router.push(`/match/${match.id}/score`),
        };
      case "Innings Break":
        return {
          label: "Start Second Innings",
          action: () => router.push(`/match/${match.id}/setup`),
        };
      case "Completed":
        return {
          label: "Update Info",
          action: () => setShowInfoDialog(true),
        };
      default:
        return null;
    }
  };

  const primary = getPrimaryCta();

  const statusStyles = (() => {
    if (match.status === "Live") {
      return {
        background: "rgba(234, 67, 53, 0.1)",
        color: "var(--danger)",
      };
    }
    if (match.status === "Completed") {
      return {
        background: "rgba(52, 168, 83, 0.1)",
        color: "var(--success)",
      };
    }
    return {
      background: "rgba(128, 134, 139, 0.1)",
      color: "var(--muted)",
    };
  })();

  const tossText =
    match.toss_winner && match.toss_decision
      ? `${
          match.toss_winner === "A" ? match.team_a_name : match.team_b_name
        } won the toss and chose to ${
          match.toss_decision === "Bat" ? "bat" : "bowl"
        } first.`
      : null;

  // Basic winner text fallback; detailed margin can be passed from parent
  const fallbackWinnerText = match.winner_team
    ? `${match.winner_team === "A" ? match.team_a_name : match.team_b_name} won`
    : match.status === "Completed"
    ? "Match drawn"
    : null;

  return (
    <div
      className="cricket-card rounded-lg p-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <Link href={`/match/${match.id}`} className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-medium team-name truncate">
            {match.team_a_name} vs {match.team_b_name}
          </h3>
          <p className="text-sm muted-text mt-1">
            {new Date(match.match_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · {match.overs_per_innings} overs
          </p>
        </Link>
        <div className="text-right flex-shrink-0">
          <span
            className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap inline-block"
            style={statusStyles}
          >
            {match.status}
          </span>
          {match.match_type && (
            <div className="mt-1 text-[11px] font-medium uppercase tracking-wide muted-text">
              {match.match_type}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        {primary && (
          <button
            type="button"
            onClick={primary.action}
            disabled={
              match.status === "Starting Soon" && isStartingFirstInnings
            }
            className="text-sm px-3 py-1.5 rounded-md font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            {primary.label}
          </button>
        )}
        {isAdmin && (
          <form action={deleteMatch}>
            <input type="hidden" name="matchId" value={match.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (
                  !window.confirm(
                    "Are you sure you want to delete this match and all its data?"
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="text-sm px-3 py-1.5 rounded-md font-medium text-white bg-red-600 ml-1"
            >
              Delete Match
            </button>
          </form>
        )}
      </div>

      {(winnerText ?? fallbackWinnerText) && (
        <p
          className="mt-2 text-sm font-medium"
          style={{
            color: match.winner_team ? "var(--success)" : "var(--muted)",
          }}
        >
          {winnerText ?? fallbackWinnerText}
        </p>
      )}

      {tossText && <p className="mt-1 text-sm muted-text">{tossText}</p>}

      {/* Toss Dialog */}
      {showTossDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Update Toss Decision</h3>
              <button
                type="button"
                onClick={() => setShowTossDialog(false)}
                className="text-sm"
                style={{ color: "var(--muted)" }}
              >
                Close
              </button>
            </div>
            <TossForm
              matchId={match.id}
              teamAName={match.team_a_name}
              teamBName={match.team_b_name}
              existingWinner={match.toss_winner}
              existingDecision={match.toss_decision}
              onSaved={() => setShowTossDialog(false)}
            />
          </div>
        </div>
      )}

      {/* Completed match info dialog */}
      {showInfoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="max-w-sm w-full rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-base font-medium mb-2">Update Match Info</h3>
            <p className="text-sm muted-text mb-4">Feature - Coming Soon.</p>
            <button
              type="button"
              onClick={() => setShowInfoDialog(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
