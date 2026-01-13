"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";

interface OnboardingFormProps {
  initialFirstName: string;
  initialLastName: string;
  userEmail: string;
}

export default function OnboardingForm({
  initialFirstName,
  initialLastName,
  userEmail,
}: OnboardingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="cricket-card p-6">
      <div className="mb-4">
        <label className="text-sm" style={{ color: "var(--muted)" }}>
          Email
        </label>
        <p className="font-medium">{userEmail}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium mb-1"
          >
            First Name *
          </label>
          <input
            id="first_name"
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
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium mb-1">
            Last Name *
          </label>
          <input
            id="last_name"
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
            placeholder="Enter your last name"
          />
        </div>

        {error && (
          <div
            className="rounded-md p-3 text-sm"
            style={{
              background: "color-mix(in srgb, var(--danger) 10%, transparent)",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-md font-semibold disabled:opacity-50 text-white"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Saving..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}
