"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startSecondInnings } from "@/app/actions/scoring";

interface StartSecondInningsButtonProps {
  matchId: string;
  battingTeamName: string;
}

export default function StartSecondInningsButton({
  matchId,
  battingTeamName,
}: StartSecondInningsButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

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

  return (
    <button
      onClick={handleStartSecondInnings}
      disabled={isStarting}
      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isStarting
        ? "Starting Second Innings..."
        : `Start Second Innings (${battingTeamName} to bat)`}
    </button>
  );
}
