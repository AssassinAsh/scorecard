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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/dashboard/tournament/${tournamentId}`}
            className="text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Tournament
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Match</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="team_a_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Team A Name *
              </label>
              <input
                id="team_a_name"
                name="team_a_name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mumbai Indians"
              />
            </div>

            <div>
              <label
                htmlFor="team_b_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Team B Name *
              </label>
              <input
                id="team_b_name"
                name="team_b_name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chennai Super Kings"
              />
            </div>

            <div>
              <label
                htmlFor="match_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Match Date *
              </label>
              <input
                id="match_date"
                name="match_date"
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="overs_per_innings"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Overs Per Innings *
              </label>
              <select
                id="overs_per_innings"
                name="overs_per_innings"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="20"
              >
                <option value="5">5 overs (Practice)</option>
                <option value="10">10 overs</option>
                <option value="20">20 overs (T20)</option>
                <option value="50">50 overs (ODI)</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewMatchForm />
    </Suspense>
  );
}
