"use client";

interface AddPlayerModalProps {
  show: boolean;
  playerName: string;
  isSaving: boolean;
  title: string;
  placeholder: string;
  buttonLabel: string;

  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function AddPlayerModal({
  show,
  playerName,
  isSaving,
  title,
  placeholder,
  buttonLabel,
  onNameChange,
  onSave,
  onCancel,
}: AddPlayerModalProps) {
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
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <input
          type="text"
          value={playerName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md mb-4"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
        />
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={isSaving || !playerName.trim()}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            {isSaving ? "Saving..." : buttonLabel}
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
