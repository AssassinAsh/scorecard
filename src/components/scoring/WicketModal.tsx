"use client";

import { useEffect } from "react";
import type { WicketType, Player } from "@/types";
import SearchableSelect from "../SearchableSelect";

interface WicketModalProps {
  show: boolean;
  wicketType: WicketType;
  fielderId: string;
  keeperId: string;
  runOutBatsmanId: string;
  selectedRuns: number;
  isRecording: boolean;
  isFreeHit: boolean;

  fieldingPlayers: Player[];
  strikerName: string;
  nonStrikerName: string;
  strikerId: string;
  nonStrikerId: string;

  onWicketTypeChange: (type: WicketType) => void;
  onFielderChange: (id: string) => void;
  onKeeperChange: (id: string) => void;
  onRunOutBatsmanChange: (id: string) => void;
  onRunsChange: (runs: number) => void;
  onAddPlayer: (role: "keeper" | "fielder") => void;
  onRecord: () => void;
  onCancel: () => void;
}

export default function WicketModal({
  show,
  wicketType,
  fielderId,
  keeperId,
  runOutBatsmanId,
  selectedRuns,
  isRecording,
  isFreeHit,
  fieldingPlayers,
  strikerName,
  nonStrikerName,
  strikerId,
  nonStrikerId,
  onWicketTypeChange,
  onFielderChange,
  onKeeperChange,
  onRunOutBatsmanChange,
  onRunsChange,
  onAddPlayer,
  onRecord,
  onCancel,
}: WicketModalProps) {
  if (!show) return null;

  // On a free hit, only Run Out is allowed.
  useEffect(() => {
    if (show && isFreeHit && wicketType !== "RunOut") {
      onWicketTypeChange("RunOut");
    }
  }, [show, isFreeHit, wicketType, onWicketTypeChange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="max-w-md w-full rounded-lg p-6"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-lg font-medium mb-4">Record Wicket</h3>

        {/* Wicket Type */}
        <div className="mb-4">
          <label className="text-sm muted-text mb-1 block">Wicket Type *</label>
          {isFreeHit && (
            <p className="text-xs muted-text mb-1">
              Free Hit: only Run Out is allowed.
            </p>
          )}
          <select
            value={wicketType}
            onChange={(e) => onWicketTypeChange(e.target.value as WicketType)}
            className="w-full px-3 py-2 rounded-md"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="Bowled" disabled={isFreeHit}>
              Bowled
            </option>
            <option value="Caught" disabled={isFreeHit}>
              Caught
            </option>
            <option value="LBW" disabled={isFreeHit}>
              LBW
            </option>
            <option value="Stumps" disabled={isFreeHit}>
              Stumped
            </option>
            <option value="RunOut">Run Out</option>
            <option value="HitWicket" disabled={isFreeHit}>
              Hit Wicket
            </option>
          </select>
        </div>

        {/* Run Out Batsman */}
        {wicketType === "RunOut" && (
          <div className="mb-4">
            <label className="text-sm muted-text mb-1 block">
              Batsman Out *
            </label>
            <select
              value={runOutBatsmanId}
              onChange={(e) => onRunOutBatsmanChange(e.target.value)}
              className="w-full px-3 py-2 rounded-md mb-3"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="">Select batsman...</option>
              <option value={strikerId}>{strikerName} (Striker)</option>
              <option value={nonStrikerId}>
                {nonStrikerName} (Non-Striker)
              </option>
            </select>

            <label className="text-sm muted-text mb-1 block">
              Runs Attempted
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((run) => (
                <button
                  key={run}
                  onClick={() => onRunsChange(run)}
                  className="py-2 rounded-md text-sm font-semibold"
                  style={{
                    background:
                      selectedRuns === run
                        ? "var(--accent)"
                        : "var(--background)",
                    color: selectedRuns === run ? "white" : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {run}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fielder/Keeper for Caught/Stumped/RunOut */}
        {(wicketType === "Caught" ||
          wicketType === "Stumps" ||
          wicketType === "RunOut") && (
          <div className="mb-4">
            <label className="text-sm muted-text mb-1 block">
              {wicketType === "Stumps" ? "Keeper" : "Fielder"}
            </label>
            <div className="flex gap-2">
              <SearchableSelect
                value={wicketType === "Stumps" ? keeperId : fielderId}
                onChange={(value) =>
                  wicketType === "Stumps"
                    ? onKeeperChange(value)
                    : onFielderChange(value)
                }
                options={[
                  { value: "", label: "Select..." },
                  ...fieldingPlayers.map((p) => ({
                    value: p.id,
                    label: p.name,
                  })),
                ]}
                placeholder="Select..."
                className="flex-1"
              />
              <button
                onClick={() =>
                  onAddPlayer(wicketType === "Stumps" ? "keeper" : "fielder")
                }
                className="px-3 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                + New
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onRecord}
            disabled={
              isRecording || (wicketType === "RunOut" && !runOutBatsmanId)
            }
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--danger)" }}
          >
            {isRecording ? "Saving..." : "Record Wicket"}
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
