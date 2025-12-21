"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startInnings, startSecondInnings } from "@/app/actions/scoring";
import { updateMatchStatus } from "@/app/actions/matches";

interface InningsButtonProps {
  matchId: string;
  inningsNumber: 1 | 2;
  teamAName?: string;
  teamBName?: string;
  battingTeamName?: string;
}

export default function InningsButton({
  matchId,
  inningsNumber,
  teamAName,
  teamBName,
  battingTeamName,
}: InningsButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [selectedBattingTeam, setSelectedBattingTeam] = useState<"A" | "B">(
    "A"
  );

  const handleStartFirstInnings = async () => {
    setIsStarting(true);

    try {
      // Update match status to Live
      await updateMatchStatus(matchId, "Live");

      // Start first innings
      const bowlingTeam = selectedBattingTeam === "A" ? "B" : "A";
      const result = await startInnings(
        matchId,
        selectedBattingTeam,
        bowlingTeam
      );

      if (result?.data) {
        // Redirect to scoring page
        router.push(`/dashboard/match/${matchId}/score`);
      } else {
        alert("Failed to start innings");
        setIsStarting(false);
      }
    } catch (error) {
      alert("Error starting match: " + error);
      setIsStarting(false);
    }
  };

  const handleStartSecondInnings = async () => {
    setIsStarting(true);

    try {
      const result = await startSecondInnings(matchId);

      if ((result as any)?.error) {
        alert((result as any).error);
        setIsStarting(false);
        return;
      }

      router.push(`/dashboard/match/${matchId}/score`);
    } catch (error) {
      alert("Error starting second innings: " + error);
      setIsStarting(false);
    }
  };

  if (inningsNumber === 1) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Which team will bat first?
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="batting_team"
                value="A"
                checked={selectedBattingTeam === "A"}
                onChange={() => setSelectedBattingTeam("A")}
                className="w-4 h-4"
              />
              <span>{teamAName}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="batting_team"
                value="B"
                checked={selectedBattingTeam === "B"}
                onChange={() => setSelectedBattingTeam("B")}
                className="w-4 h-4"
              />
              <span>{teamBName}</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleStartFirstInnings}
          disabled={isStarting}
          className="px-6 py-3 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--accent)" }}
        >
          {isStarting ? "Starting..." : "Start Match"}
        </button>
      </div>
    );
  }

  // Second innings
  return (
    <button
      onClick={handleStartSecondInnings}
      disabled={isStarting}
      className="px-6 py-3 text-white rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: "var(--accent)" }}
    >
      {isStarting
        ? "Starting Second Innings..."
        : `Start Second Innings (${battingTeamName} to bat)`}
    </button>
  );
}
