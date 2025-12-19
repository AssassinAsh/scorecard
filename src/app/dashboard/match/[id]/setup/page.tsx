import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import { notFound } from "next/navigation";

export default async function MatchSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const players = await getPlayersByMatch(id);
  const teamAPlayers = players.filter((p) => p.team === "A");
  const teamBPlayers = players.filter((p) => p.team === "B");

  const hasAllPlayers =
    teamAPlayers.length === 11 && teamBPlayers.length === 11;
  const hasToss = match.toss_winner !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/dashboard/tournament/${match.tournament_id}`}
            className="text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Tournament
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {match.team_a_name} vs {match.team_b_name}
          </h1>
          <p className="text-gray-600">Match Setup</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Progress</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={hasAllPlayers ? "text-green-600" : "text-gray-400"}
                >
                  {hasAllPlayers ? "✓" : "○"}
                </span>
                <span>Players ({players.length}/22)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={hasToss ? "text-green-600" : "text-gray-400"}>
                  {hasToss ? "✓" : "○"}
                </span>
                <span>Toss</span>
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Players</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>TODO:</strong> Build a form component to add 11 players
                for each team with their batting order. For now, add players
                manually via Supabase dashboard.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">
                  {match.team_a_name} ({teamAPlayers.length}/11)
                </h3>
                {teamAPlayers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No players added</p>
                ) : (
                  <ol className="text-sm space-y-1">
                    {teamAPlayers.map((p) => (
                      <li key={p.id}>
                        {p.batting_order}. {p.name}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  {match.team_b_name} ({teamBPlayers.length}/11)
                </h3>
                {teamBPlayers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No players added</p>
                ) : (
                  <ol className="text-sm space-y-1">
                    {teamBPlayers.map((p) => (
                      <li key={p.id}>
                        {p.batting_order}. {p.name}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>

          {/* Toss Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Toss</h2>
            {hasToss ? (
              <p className="text-gray-700">
                {match.toss_winner === "team_a"
                  ? match.team_a_name
                  : match.team_b_name}{" "}
                won the toss and chose to {match.toss_decision}
              </p>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>TODO:</strong> Build a toss form component. For now,
                  update toss details via Supabase dashboard.
                </p>
              </div>
            )}
          </div>

          {/* Start Match */}
          {hasAllPlayers && hasToss && match.status === "Upcoming" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Ready to Start</h2>
              <Link
                href={`/dashboard/match/${id}/score`}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Start Scoring →
              </Link>
            </div>
          )}

          {match.status === "Live" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Match is Live!
              </h3>
              <Link
                href={`/dashboard/match/${id}/score`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Continue Scoring →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
