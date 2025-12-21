"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTournament } from "@/app/actions/tournaments";

export default function NewTournamentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    }
    // Success case will redirect automatically
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header
        className="shadow-sm border-b"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">
            Create New Tournament
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div
          className="rounded-lg p-6"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
