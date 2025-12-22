"use client";

import { useState } from "react";
import { updateTeam } from "@/app/actions/teams";

interface TeamEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  contactNumber: string | null;
  matchId: string;
  tournamentId: string;
}

export default function TeamEditDialog({
  isOpen,
  onClose,
  teamId,
  teamName,
  contactNumber,
  matchId,
  tournamentId,
}: TeamEditDialogProps) {
  const [name, setName] = useState(teamName);
  const [contact, setContact] = useState(contactNumber || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate team name
    if (!name.trim()) {
      setError("Team name cannot be empty");
      return;
    }

    // Validate contact number if provided
    if (contact.trim() && !/^\d{10}$/.test(contact.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setSaving(true);

    const result = await updateTeam({
      id: teamId,
      name: name.trim(),
      contact_number: contact.trim(),
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    // Reload the page to reflect changes
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Edit Team</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none"
            style={{ color: "var(--muted)" }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="team_name"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--muted)" }}
            >
              Team Name *
            </label>
            <input
              id="team_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="Mumbai Indians"
            />
          </div>

          <div>
            <label
              htmlFor="contact_number"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--muted)" }}
            >
              Contact Number (10 digits)
            </label>
            <input
              id="contact_number"
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="9876543210"
              maxLength={10}
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
              disabled={saving}
              className="flex-1 py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{ background: "var(--accent)" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
