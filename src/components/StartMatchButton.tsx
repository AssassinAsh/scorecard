"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startInnings } from "@/app/actions/scoring";
import { updateMatchStatus } from "@/app/actions/matches";

interface StartMatchButtonProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
}

export default function StartMatchButton({
  matchId,
  teamAName,
  teamBName,
}: StartMatchButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [selectedBattingTeam, setSelectedBattingTeam] = useState<"A" | "B">(
    "A"
  );

  const handleStartMatch = async () => {
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
        onClick={handleStartMatch}
        disabled={isStarting}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isStarting ? "Starting..." : "Start Match"}
      </button>
    </div>
  );
}
