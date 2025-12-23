"use client";

import type { Player } from "@/types";

interface SelectBatterModalProps {
  show: boolean;
  role: "striker" | "nonStriker";
  battingPlayers: Player[];
  dismissedPlayerIds: Set<string>;
  retiredPlayerIds: Set<string>;
  strikerId: string;
  nonStrikerId: string;
  selectedBatterId: string;
  onSelectedBatterChange: (id: string) => void;
  onUseExisting: () => void;
  onAddNew: () => void;
  onCancel: () => void;
}

export default function SelectBatterModal({
  show,
  role,
  battingPlayers,
  dismissedPlayerIds,
  retiredPlayerIds,
  strikerId,
  nonStrikerId,
  selectedBatterId,
  onSelectedBatterChange,
  onUseExisting,
  onAddNew,
  onCancel,
}: SelectBatterModalProps) {
  if (!show) return null;

  const availableBatters = battingPlayers.filter(
    (p) => !dismissedPlayerIds.has(p.id)
  );

  const otherEndId = role === "striker" ? nonStrikerId : strikerId;
  const title =
    role === "striker" ? "Select New Striker" : "Select New Non-Striker";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="max-w-md w-full rounded-lg p-6"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-lg font-medium mb-4">{title}</h3>

        <div className="mb-4">
          <label className="text-sm muted-text mb-1 block">Batter *</label>
          <div className="flex gap-2">
            <select
              value={selectedBatterId}
              onChange={(e) => onSelectedBatterChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="">Select batter...</option>
              {availableBatters.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === otherEndId}>
                  {p.name}
                  {p.id === otherEndId ? " (at other end)" : ""}
                  {retiredPlayerIds.has(p.id) ? " (retired)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={onAddNew}
              className="px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap"
              style={{ background: "var(--accent)" }}
            >
              + New
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onUseExisting}
            disabled={!selectedBatterId}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            Continue
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
