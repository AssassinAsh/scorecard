import Link from "next/link";
import { getMatchById } from "@/app/actions/matches";
import { getAllInnings } from "@/app/actions/scoring";
import { getPlayersByMatch } from "@/app/actions/matches";
import { notFound } from "next/navigation";
import { formatScore, formatOvers } from "@/lib/cricket/scoring";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const innings = await getAllInnings(id);
  const players = await getPlayersByMatch(id);

  const teamAPlayers = players.filter((p) => p.team === "A");
  const teamBPlayers = players.filter((p) => p.team === "B");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/tournament/${match.tournament_id}`}
            className="text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Tournament
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {match.team_a_name} vs {match.team_b_name}
          </h1>
          <p className="text-gray-600">
            📅 {new Date(match.match_date).toLocaleDateString()} • 🏏{" "}
            {match.overs_per_innings} overs
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              match.status === "Live"
                ? "bg-red-100 text-red-800"
                : match.status === "Completed"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {match.status}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Toss Details */}
        {match.toss_winner && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Toss</h3>
            <p className="text-gray-700">
              {match.toss_winner === "team_a"
                ? match.team_a_name
                : match.team_b_name}{" "}
              won the toss and chose to {match.toss_decision}
            </p>
          </div>
        )}

        {/* Score Summary */}
        {innings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Score</h2>
            <div className="space-y-4">
              {innings.map((inning, index) => (
                <div key={inning.id} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg">
                    {inning.batting_team === "A"
                      ? match.team_a_name
                      : match.team_b_name}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatScore(inning.total_runs, inning.wickets)}
                  </p>
                  <p className="text-gray-600">
                    {formatOvers(inning.overs_completed)} overs
                  </p>
                  {inning.is_completed && (
                    <span className="text-sm text-gray-500">
                      Innings Completed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner */}
        {match.winner_team && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 text-lg">
              🏆{" "}
              {match.winner_team === "team_a"
                ? match.team_a_name
                : match.team_b_name}{" "}
              Won!
            </h3>
          </div>
        )}

        {/* Teams */}
        {(teamAPlayers.length > 0 || teamBPlayers.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {match.team_a_name}
              </h3>
              {teamAPlayers.length === 0 ? (
                <p className="text-gray-500">No players added yet</p>
              ) : (
                <ol className="space-y-2">
                  {teamAPlayers.map((player) => (
                    <li key={player.id} className="text-gray-700">
                      {player.batting_order}. {player.name}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Team B */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {match.team_b_name}
              </h3>
              {teamBPlayers.length === 0 ? (
                <p className="text-gray-500">No players added yet</p>
              ) : (
                <ol className="space-y-2">
                  {teamBPlayers.map((player) => (
                    <li key={player.id} className="text-gray-700">
                      {player.batting_order}. {player.name}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}

        {match.status === "Upcoming" && innings.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Match hasn't started yet
          </div>
        )}
      </main>
    </div>
  );
}
