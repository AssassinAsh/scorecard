"use client";

import { useState, useTransition } from "react";
import { updateToss } from "@/app/actions/matches";
import type { TeamSide, TossDecision } from "@/types";

interface TossFormProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
  existingWinner: TeamSide | null;
  existingDecision: TossDecision | null;
  onSaved?: () => void;
}

export default function TossForm({
  matchId,
  teamAName,
  teamBName,
  existingWinner,
  existingDecision,
  onSaved,
}: TossFormProps) {
  const [winner, setWinner] = useState<TeamSide | "">(existingWinner || "");
  const [decision, setDecision] = useState<TossDecision | "">(
    existingDecision || ""
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winner || !decision) {
      alert("Please select both toss winner and decision.");
      return;
    }

    startTransition(async () => {
      const result = await updateToss(matchId, {
        toss_winner: winner as TeamSide,
        toss_decision: decision as TossDecision,
      });

      if ("error" in result && result.error) {
        alert(result.error);
      } else if (onSaved) {
        onSaved();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Toss winner</label>
        <div className="space-y-1 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="toss_winner"
              value="A"
              checked={winner === "A"}
              onChange={() => setWinner("A")}
              className="w-4 h-4"
            />
            <span>{teamAName}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="toss_winner"
              value="B"
              checked={winner === "B"}
              onChange={() => setWinner("B")}
              className="w-4 h-4"
            />
            <span>{teamBName}</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Decision</label>
        <div className="space-y-1 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="toss_decision"
              value="Bat"
              checked={decision === "Bat"}
              onChange={() => setDecision("Bat")}
              className="w-4 h-4"
            />
            <span>Bat</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="toss_decision"
              value="Bowl"
              checked={decision === "Bowl"}
              onChange={() => setDecision("Bowl")}
              className="w-4 h-4"
            />
            <span>Bowl</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !winner || !decision}
        className="px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--accent)" }}
      >
        {isPending ? "Saving..." : "Save Toss"}
      </button>
    </form>
  );
}
