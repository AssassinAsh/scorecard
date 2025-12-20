import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import {
  getCurrentInnings,
  getAllInnings,
  getRecentBalls,
} from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import {
  formatScore,
  formatOvers,
  calculateOvers,
} from "@/lib/cricket/scoring";
import ScoringInterface from "@/components/ScoringInterface";

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
  const recentBalls = currentInnings
    ? await getRecentBalls(currentInnings.id)
    : [];

  const completedInnings = allInnings.filter((i) => i.is_completed);
  const firstCompletedInnings = completedInnings[0];

  // Second innings chase information
  const isSecondInnings =
    currentInnings &&
    firstCompletedInnings &&
    currentInnings.id !== firstCompletedInnings.id;

  const targetRuns = isSecondInnings
    ? firstCompletedInnings.total_runs + 1
    : null;

  const ballsRemaining = isSecondInnings
    ? match.overs_per_innings * 6 - currentInnings!.balls_bowled
    : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href={`/dashboard/match/${id}/setup`}
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Setup
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-medium">
              {match.team_a_name} vs {match.team_b_name}
            </h1>
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background:
                  match.status === "Completed"
                    ? "rgba(15, 157, 88, 0.1)"
                    : "rgba(234, 67, 53, 0.1)",
                color:
                  match.status === "Completed" ? "#0F9D58" : "var(--danger)",
              }}
            >
              {match.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Previous Innings Summary */}
        {allInnings.filter((i) => i.is_completed).length > 0 && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-sm font-medium mb-3 muted-text">
              Previous Innings
            </h2>
            <div className="space-y-2">
              {allInnings
                .filter((i) => i.is_completed)
                .map((inning) => (
                  <div
                    key={inning.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">
                      {inning.batting_team === "A"
                        ? match.team_a_name
                        : match.team_b_name}
                    </span>
                    <span className="text-base">
                      {formatScore(inning.total_runs, inning.wickets)} (
                      {formatOvers(calculateOvers(inning.balls_bowled))} ov)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Scoring Interface */}
        {currentInnings ? (
          <ScoringInterface
            matchId={id}
            inningsId={currentInnings.id}
            battingTeam={currentInnings.batting_team}
            bowlingTeam={currentInnings.bowling_team}
            teamAName={match.team_a_name}
            teamBName={match.team_b_name}
            currentScore={currentInnings.total_runs}
            currentWickets={currentInnings.wickets}
            ballsBowled={currentInnings.balls_bowled}
            maxOvers={match.overs_per_innings}
            existingPlayers={players}
            recentBalls={recentBalls}
            tossWinner={match.toss_winner}
            tossDecision={match.toss_decision}
            isSecondInnings={Boolean(isSecondInnings)}
            targetRuns={targetRuns}
            ballsRemaining={ballsRemaining}
          />
        ) : (
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text mb-4">
              No active innings. Start the match from the setup page.
            </p>
            <Link
              href={`/dashboard/match/${id}/setup`}
              className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Go to Setup
            </Link>
          </div>
        )}

        {/* View Public Scorecard */}
        <div className="mt-4 text-center">
          <Link
            href={`/match/${id}`}
            target="_blank"
            className="text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            View Public Scorecard →
          </Link>
        </div>
      </main>
    </div>
  );
}
