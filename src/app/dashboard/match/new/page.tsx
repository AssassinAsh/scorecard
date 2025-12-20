"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createMatch } from "@/app/actions/matches";

function NewMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tournamentId = searchParams.get("tournament_id");

  useEffect(() => {
    if (!tournamentId) {
      router.push("/dashboard");
    }
  }, [tournamentId, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createMatch({
      tournament_id: tournamentId!,
      team_a_name: formData.get("team_a_name") as string,
      team_b_name: formData.get("team_b_name") as string,
      match_date: formData.get("match_date") as string,
      overs_per_innings: parseInt(formData.get("overs_per_innings") as string),
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Success case will redirect automatically
  }

  if (!tournamentId) {
    return null;
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
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/dashboard/tournament/${tournamentId}`}
            className="mb-2 inline-block text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
             Back to Tournament
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">Create New Match</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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
                htmlFor="team_a_name"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Team A Name *
              </label>
              <input
                id="team_a_name"
                name="team_a_name"
                type="text"
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
                htmlFor="team_b_name"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Team B Name *
              </label>
              <input
                id="team_b_name"
                name="team_b_name"
                type="text"
                required
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                placeholder="Chennai Super Kings"
              />
            </div>

            <div>
              <label
                htmlFor="match_date"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Match Date *
              </label>
              <input
                id="match_date"
                name="match_date"
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

            <div>
              <label
                htmlFor="overs_per_innings"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Overs Per Innings * (1-10)
              </label>
              <input
                id="overs_per_innings"
                name="overs_per_innings"
                type="number"
                min="1"
                max="10"
                required
                defaultValue="5"
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                placeholder="5"
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
              {loading ? "Creating..." : "Create Match"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          Loading...
        </div>
      }
    >
      <NewMatchForm />
    </Suspense>
  );
}
