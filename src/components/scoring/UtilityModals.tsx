"use client";

import type { Player } from "@/types";

// New Over Modal
interface NewOverModalProps {
  show: boolean;
  ballsBowled: number;
  newOverBowlerId: string;
  bowlingPlayers: Player[];

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
            disabled={!newOverBowlerId}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            Start Over
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
  retireReason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RetireModal({
  show,
  retireReason,
  onReasonChange,
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
        <div className="mb-4">
          <label className="text-sm muted-text mb-1 block">Reason</label>
          <input
            type="text"
            value={retireReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g. retired hurt"
            className="w-full px-3 py-2 rounded-md"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={!retireReason.trim()}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            Retire
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

// Change Bowler Modal
interface ChangeBowlerModalProps {
  show: boolean;
  newBowlerForOverId: string;
  bowlingPlayers: Player[];
  onBowlerChange: (id: string) => void;
  onAddPlayer: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChangeBowlerModal({
  show,
  newBowlerForOverId,
  bowlingPlayers,
  onBowlerChange,
  onAddPlayer,
  onConfirm,
  onCancel,
}: ChangeBowlerModalProps) {
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
        <h3 className="text-lg font-medium mb-4">Change Bowler</h3>
        <p className="text-sm muted-text mb-4">
          Select new bowler for the current over
        </p>

        <div className="mb-4">
          <label className="text-sm muted-text mb-1 block">Bowler *</label>
          <div className="flex gap-2">
            <select
              value={newBowlerForOverId}
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
            disabled={!newBowlerForOverId}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            Change Bowler
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
