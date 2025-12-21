"use client";

type BallAction =
  | "runs"
  | "wide"
  | "noball"
  | "bye"
  | "legbye"
  | "wicket"
  | null;

interface BallActionModalProps {
  show: boolean;
  currentAction: BallAction;
  selectedRuns: number;
  isRecording: boolean;
  isFreeHit: boolean;

  onSelectAction: (action: BallAction) => void;
  onSelectRuns: (runs: number) => void;
  onRecord: () => void;
  onCancel: () => void;
}

export default function BallActionModal({
  show,
  currentAction,
  selectedRuns,
  isRecording,
  isFreeHit,
  onSelectAction,
  onSelectRuns,
  onRecord,
  onCancel,
}: BallActionModalProps) {
  if (!show) return null;

  // Initial ball type selection
  if (!currentAction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          className="max-w-md w-full rounded-lg p-6"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-lg font-medium mb-4">Select Ball Type</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => {
                onSelectAction("runs");
                onSelectRuns(0);
              }}
              className="py-4 rounded-md text-sm font-semibold"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              Runs (0-10)
            </button>
            <button
              onClick={() => {
                onSelectAction("wicket");
              }}
              disabled={isRecording || isFreeHit}
              className="py-4 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--danger)",
                color: "white",
              }}
            >
              Wicket
              {isFreeHit && (
                <div className="text-xs font-normal mt-1">(Free Hit)</div>
              )}
            </button>
            <button
              onClick={() => {
                onSelectAction("wide");
                onSelectRuns(0);
              }}
              className="py-4 rounded-md text-sm font-medium"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Wide
            </button>
            <button
              onClick={() => {
                onSelectAction("noball");
                onSelectRuns(0);
              }}
              className="py-4 rounded-md text-sm font-medium"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              No Ball
            </button>
            <button
              onClick={() => {
                onSelectAction("bye");
                onSelectRuns(0);
              }}
              className="py-4 rounded-md text-sm font-medium"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Bye
            </button>
            <button
              onClick={() => {
                onSelectAction("legbye");
                onSelectRuns(0);
              }}
              className="py-4 rounded-md text-sm font-medium"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Leg Bye
            </button>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-2 rounded-md text-sm font-medium"
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
    );
  }

  // Wicket will be handled by separate WicketModal
  if (currentAction === "wicket") {
    return null;
  }

  // Runs/Extras selection
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
          {currentAction === "runs" && "Select Runs"}
          {currentAction === "wide" && "Wide + Runs"}
          {currentAction === "noball" && "No Ball + Runs"}
          {currentAction === "bye" && "Bye Runs"}
          {currentAction === "legbye" && "Leg Bye Runs"}
        </h3>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {currentAction === "runs"
            ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((run) => (
                <button
                  key={run}
                  onClick={() => onSelectRuns(run)}
                  className="py-3 rounded-md text-lg font-bold"
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
              ))
            : [0, 1, 2, 3, 4, 5, 6, 7].map((run) => (
                <button
                  key={run}
                  onClick={() => onSelectRuns(run)}
                  className="py-3 rounded-md text-lg font-bold"
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

        <div className="flex gap-2">
          <button
            onClick={onRecord}
            disabled={isRecording}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            {isRecording ? "Saving..." : "Record"}
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
