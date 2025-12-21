"use client";

import type { Player } from "@/types";

interface PlayerSelectionModalProps {
  // Control visibility
  show: boolean;

  // Team info
  teamAName: string;
  teamBName: string;
  tossWinner: "A" | "B" | null;
  tossDecision: "Bat" | "Bowl" | null;

  // Player lists
  battingPlayers: Player[];
  bowlingPlayers: Player[];

  // Selection state
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  ballsBowled: number;

  // Handlers
  onStrikerChange: (id: string) => void;
  onNonStrikerChange: (id: string) => void;
  onBowlerChange: (id: string) => void;
  onAddPlayer: (role: "striker" | "nonStriker" | "bowler") => void;
  onStart: () => void;
}

export default function PlayerSelectionModal({
  show,
  teamAName,
  teamBName,
  tossWinner,
  tossDecision,
  battingPlayers,
  bowlingPlayers,
  strikerId,
  nonStrikerId,
  bowlerId,
  ballsBowled,
  onStrikerChange,
  onNonStrikerChange,
  onBowlerChange,
  onAddPlayer,
  onStart,
}: PlayerSelectionModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="max-w-md w-full rounded-lg p-6"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-lg font-medium mb-4">Select Players to Start</h3>

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
              onChange={(e) => onStrikerChange(e.target.value)}
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
                  {p.id === nonStrikerId ? " (selected as non-striker)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => onAddPlayer("striker")}
              className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
              style={{ background: "var(--accent)" }}
            >
              + New
            </button>
          </div>
        </div>

        {/* Non-Striker */}
        <div className="mb-3">
          <label className="text-sm muted-text mb-1 block">Non-Striker *</label>
          <div className="flex gap-2">
            <select
              value={nonStrikerId}
              onChange={(e) => onNonStrikerChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="">Select non-striker...</option>
              {battingPlayers.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === strikerId}>
                  {p.name}
                  {p.id === strikerId ? " (selected as striker)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => onAddPlayer("nonStriker")}
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
              onChange={(e) => onBowlerChange(e.target.value)}
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
              onClick={() => onAddPlayer("bowler")}
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
            onClick={onStart}
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
  );
}
