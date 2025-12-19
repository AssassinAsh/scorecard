import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import { getCurrentInnings, getAllInnings } from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import { formatScore, formatOvers } from "@/lib/cricket/scoring";

export default async function ScoringPage({
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
  const currentInnings = await getCurrentInnings(id);
  const allInnings = await getAllInnings(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/dashboard/match/${id}/setup`}
            className="text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Setup
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {match.team_a_name} vs {match.team_b_name}
          </h1>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            LIVE SCORING
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Current Score Display */}
        {currentInnings && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {currentInnings.batting_team === "A"
                ? match.team_a_name
                : match.team_b_name}{" "}
              Batting
            </h2>
            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-bold text-blue-600">
                {formatScore(currentInnings.total_runs, currentInnings.wickets)}
              </p>
              <p className="text-xl text-gray-600">
                ({formatOvers(currentInnings.overs_completed)} ov)
              </p>
            </div>
          </div>
        )}

        {/* Previous Innings */}
        {allInnings.filter((i) => i.is_completed).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Previous Innings</h2>
            <div className="space-y-2">
              {allInnings
                .filter((i) => i.is_completed)
                .map((inning) => (
                  <div
                    key={inning.id}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">
                      {inning.batting_team === "A"
                        ? match.team_a_name
                        : match.team_b_name}
                    </span>
                    <span className="text-lg">
                      {formatScore(inning.total_runs, inning.wickets)} (
                      {formatOvers(inning.overs_completed)} ov)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Scoring Interface */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">
            🚧 Scoring Interface - TODO
          </h2>
          <div className="space-y-4 text-yellow-800">
            <p>
              <strong>
                The full ball-by-ball scoring UI needs to be implemented.
              </strong>{" "}
              This is the most complex part of the application.
            </p>

            <div className="bg-white rounded-lg p-4 text-gray-800">
              <h3 className="font-semibold mb-2">Required Components:</h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Striker/Non-striker selection dropdowns</li>
                <li>Bowler selection dropdown</li>
                <li>Button grid for runs: 0, 1, 2, 3, 4, 5, 6</li>
                <li>
                  Extras buttons: Wide, No Ball, Bye, Leg Bye (with run counts)
                </li>
                <li>
                  Wicket button → opens modal with wicket type and dismissed
                  player
                </li>
                <li>Current over display (showing last 6 balls)</li>
                <li>Auto strike rotation logic</li>
                <li>New over prompt (select new bowler)</li>
                <li>Innings end detection and prompt for next innings</li>
                <li>End match button (select winner)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 text-gray-800">
              <h3 className="font-semibold mb-2">Server Actions to Use:</h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>
                  <code>startInnings(matchId, battingTeam, bowlingTeam)</code>
                </li>
                <li>
                  <code>startNewOver(inningsId, overNumber, bowlerName)</code>
                </li>
                <li>
                  <code>recordBall(ballData)</code> - returns rotateStrike,
                  shouldEndInnings, isLegalBall
                </li>
                <li>
                  <code>updateMatchWinner(matchId, winner)</code>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 text-gray-800">
              <h3 className="font-semibold mb-2">State Management Needed:</h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Current striker (player name)</li>
                <li>Current non-striker (player name)</li>
                <li>Current bowler (player name)</li>
                <li>Current over ID</li>
                <li>Legal ball count in current over (1-6)</li>
                <li>Recent balls array for display</li>
              </ul>
            </div>

            <p className="text-sm">
              <strong>Quick Implementation Path:</strong> Start with a simple
              form that takes all ball details at once, then gradually add
              button-based UI with proper state management.
            </p>
          </div>
        </div>

        {/* View Public Scorecard */}
        <div className="mt-6 text-center">
          <Link
            href={`/match/${id}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            View Public Scorecard →
          </Link>
        </div>
      </main>
    </div>
  );
}
