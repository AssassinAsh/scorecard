"use client";

import type { Player } from "@/types";

export type { Player };

// New Over Modal
interface NewOverModalProps {
  show: boolean;
  ballsBowled: number;
  newOverBowlerId: string;
  bowlingPlayers: Player[];
  isStartingOver: boolean;

  onBowlerChange: (id: string) => void;
  onAddPlayer: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NewOverModal({
  show,
  ballsBowled,
  newOverBowlerId,
  bowlingPlayers,
  isStartingOver,
  onBowlerChange,
  onAddPlayer,
  onConfirm,
  onCancel,
}: NewOverModalProps) {
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
        <h3 className="text-lg font-medium mb-4">
          Start Over {Math.floor(ballsBowled / 6) + 1}
        </h3>

        <p className="text-sm muted-text mb-4">
          Select bowler for the new over
        </p>

        <div className="mb-4">
          <label className="text-sm muted-text mb-1 block">Bowler *</label>
          <div className="flex gap-2">
            <select
              value={newOverBowlerId}
              onChange={(e) => onBowlerChange(e.target.value)}
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
              onClick={onAddPlayer}
              className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
              style={{ background: "var(--accent)" }}
            >
              + New
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={!newOverBowlerId || isStartingOver}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            {isStartingOver ? "Starting..." : "Start Over"}
          </button>
          <button
            onClick={onCancel}
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
  );
}

// Delete Last Ball Confirmation
interface DeleteBallModalProps {
  show: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteBallModal({
  show,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteBallModalProps) {
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
        <h3 className="text-lg font-medium mb-4">Delete Last Delivery</h3>
        <p className="text-sm muted-text mb-4">
          Are you sure you want to delete the most recent delivery? This will
          remove it from the database and restore the previous scorecard state.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--danger)" }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onCancel}
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
  );
}

// Change Strike Confirmation
interface ChangeStrikeModalProps {
  show: boolean;
  strikerName: string;
  nonStrikerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChangeStrikeModal({
  show,
  nonStrikerName,
  onConfirm,
  onCancel,
}: ChangeStrikeModalProps) {
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
        <h3 className="text-lg font-medium mb-4">Change Strike</h3>
        <p className="text-sm muted-text mb-4">
          Swap striker and non-striker? {nonStrikerName} will face the next
          ball.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Change Strike
          </button>
          <button
            onClick={onCancel}
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
  );
}

// Retire Batsman Modal
interface RetireModalProps {
  show: boolean;
  strikerName?: string;
  nonStrikerName?: string;
  retiringPlayer: "striker" | "nonStriker" | null;
  onRetiringPlayerChange: (player: "striker" | "nonStriker") => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RetireModal({
  show,
  strikerName,
  nonStrikerName,
  retiringPlayer,
  onRetiringPlayerChange,
  isSubmitting,
  onConfirm,
  onCancel,
}: RetireModalProps) {
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
        <h3 className="text-lg font-medium mb-4">Retire Batsman</h3>
        <div className="mb-4 space-y-2">
          <div>
            <label className="text-sm muted-text block mb-1">
              Select batter to retire
            </label>
            <div className="space-y-1">
              {strikerName && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="retiring-batter"
                    value="striker"
                    checked={retiringPlayer === "striker"}
                    onChange={() => onRetiringPlayerChange("striker")}
                  />
                  <span>
                    Striker: <span className="font-medium">{strikerName}</span>
                  </span>
                </label>
              )}
              {nonStrikerName && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="retiring-batter"
                    value="nonStriker"
                    checked={retiringPlayer === "nonStriker"}
                    onChange={() => onRetiringPlayerChange("nonStriker")}
                  />
                  <span>
                    Non-striker:{" "}
                    <span className="font-medium">{nonStrikerName}</span>
                  </span>
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm muted-text block mb-1">Reason</label>
            <div
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Retired
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={!retiringPlayer || isSubmitting}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {isSubmitting ? "Retiring..." : "Retire"}
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-50"
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
  );
}

// Change Player Modal
interface ChangePlayerModalProps {
  show: boolean;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  battingPlayers: Player[];
  bowlingPlayers: Player[];
  dismissedPlayerIds: Set<string>;
  retiredPlayerIds: Set<string>;
  onStrikerChange: (id: string) => void;
  onNonStrikerChange: (id: string) => void;
  onBowlerChange: (id: string) => void;
  onAddPlayer: (role: "striker" | "nonStriker" | "bowler") => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChangePlayerModal({
  show,
  strikerId,
  nonStrikerId,
  bowlerId,
  battingPlayers,
  bowlingPlayers,
  dismissedPlayerIds,
  retiredPlayerIds,
  onStrikerChange,
  onNonStrikerChange,
  onBowlerChange,
  onAddPlayer,
  onConfirm,
  onCancel,
}: ChangePlayerModalProps) {
  if (!show) return null;

  // Filter batters: exclude dismissed players, but allow retired players
  const availableBatters = battingPlayers.filter(
    (p) => !dismissedPlayerIds.has(p.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="max-w-md w-full rounded-lg p-6"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-lg font-medium mb-4">Change Players</h3>
        <p className="text-sm muted-text mb-4">
          Update striker, non-striker, or bowler
        </p>

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
              {availableBatters.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={p.id === nonStrikerId}
                >
                  {p.name}
                  {p.id === nonStrikerId ? " (selected as non-striker)" : ""}
                  {retiredPlayerIds.has(p.id) ? " (retired)" : ""}
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
              {availableBatters.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === strikerId}>
                  {p.name}
                  {p.id === strikerId ? " (selected as striker)" : ""}
                  {retiredPlayerIds.has(p.id) ? " (retired)" : ""}
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

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={!strikerId || !nonStrikerId || !bowlerId}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            Update Players
          </button>
          <button
            onClick={onCancel}
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
  );
}
