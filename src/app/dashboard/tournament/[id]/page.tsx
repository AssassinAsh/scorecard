import Link from "next/link";
import { getTournamentById } from "@/app/actions/tournaments";
import { getMatchesByTournament } from "@/app/actions/matches";
import { notFound } from "next/navigation";

export default async function DashboardTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  const matches = await getMatchesByTournament(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {tournament.name}
          </h1>
          <p className="text-gray-600">
            📍 {tournament.location} • 📅{" "}
            {new Date(tournament.start_date).toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Matches</h2>
          <Link
            href={`/dashboard/match/new?tournament_id=${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Match
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No matches yet. Create your first match!
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/dashboard/match/${match.id}/setup`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {match.team_a_name} vs {match.team_b_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 {new Date(match.match_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      🏏 {match.overs_per_innings} overs per innings
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === "Live"
                          ? "bg-red-100 text-red-800"
                          : match.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {match.status}
                    </span>
                    {match.status === "Live" && (
                      <Link
                        href={`/dashboard/match/${match.id}/score`}
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Score →
                      </Link>
                    )}
                  </div>
                </div>
                {match.winner_team && (
                  <p className="mt-2 text-sm font-medium text-green-600">
                    Winner:{" "}
                    {match.winner_team === "team_a"
                      ? match.team_a_name
                      : match.team_b_name}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
