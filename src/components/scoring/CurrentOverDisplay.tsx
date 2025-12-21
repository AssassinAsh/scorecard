"use client";

import { getBallDisplayText } from "@/lib/cricket/scoring";
import type { Ball } from "@/types";

interface CurrentOverDisplayProps {
  displayOverBalls: Ball[];
  isFreeHit: boolean;
  readOnly?: boolean;
  matchResult?: string | null;
}

export default function CurrentOverDisplay({
  displayOverBalls,
  isFreeHit,
  readOnly = false,
  matchResult,
}: CurrentOverDisplayProps) {
  // Don't show for completed/read-only result view
  if (readOnly && matchResult) {
    return null;
  }

  return (
    <div
      className="mt-3 pt-3 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="text-xs muted-text mb-2">This Over:</p>
      <div className="flex gap-2 flex-wrap">
        {displayOverBalls.length === 0 ? (
          <span className="text-sm muted-text">No balls yet</span>
        ) : (
          displayOverBalls.map((ball, idx) => (
            <span
              key={idx}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background:
                  ball.wicket_type !== "None"
                    ? "var(--danger)"
                    : ball.runs_off_bat === 4 || ball.runs_off_bat === 6
                    ? "var(--success)"
                    : "var(--background)",
                color:
                  ball.wicket_type !== "None" ||
                  ball.runs_off_bat === 4 ||
                  ball.runs_off_bat === 6
                    ? "white"
                    : "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {getBallDisplayText(
                ball.runs_off_bat,
                ball.extras_type,
                ball.extras_runs,
                ball.wicket_type
              )}
            </span>
          ))
        )}
      </div>
      {isFreeHit && (
        <p
          className="text-xs font-medium mt-2"
          style={{ color: "var(--danger)" }}
        >
          ⚠️ FREE HIT
        </p>
      )}
    </div>
  );
}
