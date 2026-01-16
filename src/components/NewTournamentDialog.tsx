"use client";

import { useState } from "react";
import { createTournament } from "@/app/actions/tournaments";

interface NewTournamentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userCredits?: number;
  userRole?: string;
}

export default function NewTournamentDialog({
  isOpen,
  onClose,
  userCredits = 0,
  userRole = "Viewer",
}: NewTournamentDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isScorer = userRole === "Scorer";
  const hasEnoughCredits = userCredits >= 10;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createTournament({
      name: formData.get("name") as string,
      start_date: formData.get("start_date") as string,
      location: formData.get("location") as string,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Success - close dialog (redirect happens in server action)
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Create New Tournament</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none"
            style={{ color: "var(--muted)" }}
          >
            ×
          </button>
        </div>

        {isScorer && (
          <div
            className="rounded-md p-3 text-sm mb-4"
            style={{
              background: hasEnoughCredits
                ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                : "color-mix(in srgb, var(--destructive) 10%, transparent)",
              border: hasEnoughCredits
                ? "1px solid var(--accent)"
                : "1px solid var(--destructive)",
              color: hasEnoughCredits ? "var(--accent)" : "var(--destructive)",
            }}
          >
            <p className="font-medium">
              Your Credits: {userCredits} | Cost: 10 credits
            </p>
            {!hasEnoughCredits && (
              <p className="text-xs mt-1">
                Insufficient credits to create a tournament
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--muted)" }}
            >
              Tournament Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="Summer Cricket League 2025"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--muted)" }}
            >
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="Mumbai"
            />
          </div>

          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--muted)" }}
            >
              Start Date *
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-md p-3 text-sm"
              style={{
                background:
                  "color-mix(in srgb, var(--danger) 10%, transparent)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md font-medium"
              style={{
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isScorer && !hasEnoughCredits)}
              className="flex-1 py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
