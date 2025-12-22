"use client";

interface ScoringControlsProps {
  isRecording: boolean;
  needsNewOver: boolean;
  hasRecentBalls: boolean;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  ballsBowled: number;

  onAddBall: () => void;
  onDeleteLastBall: () => void;
  onChangeStrike: () => void;
  onRetireBatsman: () => void;
  onChangeBowler: () => void;
  onStartNewOver: () => void;
}

export default function ScoringControls({
  isRecording,
  needsNewOver,
  hasRecentBalls,
  strikerId,
  nonStrikerId,
  bowlerId,
  ballsBowled,
  onAddBall,
  onDeleteLastBall,
  onChangeStrike,
  onRetireBatsman,
  onChangeBowler,
  onStartNewOver,
}: ScoringControlsProps) {
  return (
    <>
      {/* New Over Prompt */}
      {needsNewOver && (
        <div
          className="rounded-lg p-4 text-center"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            border: "1px solid var(--accent)",
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--accent)" }}
          >
            Over completed! Start new over?
          </p>
          <button
            onClick={onStartNewOver}
            className="px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Start Over {Math.floor(ballsBowled / 6) + 1}
          </button>
        </div>
      )}

      {/* Main Action Buttons */}
      {strikerId && nonStrikerId && bowlerId && (
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-sm font-medium mb-3">Ball Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            {/* 1. Add Next Ball Button */}
            <button
              onClick={onAddBall}
              disabled={isRecording || needsNewOver}
              className="py-4 rounded-md text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              {isRecording ? "Saving..." : "➕ Add Next Ball"}
            </button>

            {/* 2. Change Strike Button */}
            {strikerId && nonStrikerId && (
              <button
                onClick={onChangeStrike}
                disabled={isRecording}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                ⇄ Change Strike
              </button>
            )}

            {/* 3. Delete Last Delivery Button */}
            {hasRecentBalls && (
              <button
                onClick={onDeleteLastBall}
                disabled={isRecording}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                🗑 Delete Last Delivery
              </button>
            )}

            {/* 4. Change Player Button */}
            {(strikerId || nonStrikerId || bowlerId) && (
              <button
                onClick={onChangeBowler}
                disabled={isRecording}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Change Player
              </button>
            )}

            {/* 5. Retire Batsman Button */}
            {(strikerId || nonStrikerId) && (
              <button
                onClick={onRetireBatsman}
                disabled={isRecording}
                className="py-3 rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Retire Batsman
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
