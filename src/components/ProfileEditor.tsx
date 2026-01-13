"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

interface ProfileEditorProps {
  firstName: string;
  lastName: string;
}

export default function ProfileEditor({
  firstName: initialFirstName,
  lastName: initialLastName,
}: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both first and last name");
      setLoading(false);
      return;
    }

    const result = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setIsEditing(false);
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  function handleCancel() {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setIsEditing(false);
    setError(null);
  }

  return (
    <div className="cricket-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm px-4 py-2 rounded-md"
            style={{
              background: "var(--accent)",
              color: "white",
            }}
          >
            Edit
          </button>
        )}
      </div>

      {success && (
        <div
          className="rounded-md p-3 text-sm mb-4"
          style={{
            background: "color-mix(in srgb, var(--success) 10%, transparent)",
            border: "1px solid var(--success)",
            color: "var(--success)",
          }}
        >
          Profile updated successfully!
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: "var(--muted)" }}>
              First Name
            </label>
            <p className="font-medium">{firstName || "Not set"}</p>
          </div>
          <div>
            <label className="text-sm" style={{ color: "var(--muted)" }}>
              Last Name
            </label>
            <p className="font-medium">{lastName || "Not set"}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit_first_name"
              className="block text-sm font-medium mb-1"
            >
              First Name *
            </label>
            <input
              id="edit_first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="edit_last_name"
              className="block text-sm font-medium mb-1"
            >
              Last Name *
            </label>
            <input
              id="edit_last_name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md"
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-md font-semibold disabled:opacity-50 text-white"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-md font-semibold disabled:opacity-50"
              style={{
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
