import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import { getCurrentInnings, getAllInnings } from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import InningsButton from "@/components/InningsButton";
import TossForm from "@/components/TossForm";

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
  const currentInnings = await getCurrentInnings(id);
  const allInnings = await getAllInnings(id);

  const hasInnings = currentInnings !== null;
  const completedInnings = allInnings.filter((i) => i.is_completed);
  const firstCompletedInnings = completedInnings[0];
  const secondInningsBattingTeamName = firstCompletedInnings
    ? firstCompletedInnings.bowling_team === "A"
      ? match.team_a_name
      : match.team_b_name
    : "";

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
            href={`/tournament/${match.tournament_id}`}
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Back to Tournament
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">
            {match.team_a_name} vs {match.team_b_name}
          </h1>
          <p className="text-sm muted-text">Match Setup</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="space-y-3">
          {/* Pre-match and first innings setup CTAs */}
          {!hasInnings && (
            <>
              {match.status === "Upcoming" && (
                <div
                  className="rounded-lg p-6"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h2 className="text-base font-medium mb-2">
                    Update Toss Decision
                  </h2>
                  <p className="text-sm muted-text mb-4">
                    Set or update the toss winner and decision before starting
                    the match.
                  </p>
                  <TossForm
                    matchId={id}
                    teamAName={match.team_a_name}
                    teamBName={match.team_b_name}
                    existingWinner={match.toss_winner}
                    existingDecision={match.toss_decision}
                  />
                </div>
              )}

              {match.status === "Starting Soon" && (
                <div
                  className="rounded-lg p-6"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h2 className="text-base font-medium mb-2">
                    Start First Inning
                  </h2>
                  <p className="text-sm muted-text mb-4">
                    Choose which team will bat first and begin scoring.
                  </p>
                  <InningsButton
                    matchId={id}
                    inningsNumber={1}
                    teamAName={match.team_a_name}
                    teamBName={match.team_b_name}
                  />
                </div>
              )}
            </>
          )}

          {/* Start Second Innings Section */}
          {!hasInnings &&
            completedInnings.length === 1 &&
            match.status === "Innings Break" && (
              <div
                className="rounded-lg p-6"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h2 className="text-base font-medium mb-2">
                  Start Second Inning
                </h2>
                <p className="text-sm muted-text mb-4">
                  {secondInningsBattingTeamName} will bat next.
                </p>
                <InningsButton
                  matchId={id}
                  inningsNumber={2}
                  battingTeamName={secondInningsBattingTeamName}
                />
              </div>
            )}

          {/* Completed match CTA */}
          {!hasInnings && match.status === "Completed" && (
            <div
              className="rounded-lg p-6"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <h2 className="text-base font-medium mb-2">Update Info</h2>
              <p className="text-sm muted-text mb-4">
                Match is completed. Detailed result editing will be available
                here. For now you can review the full scorecard.
              </p>
              <Link
                href={`/match/${id}`}
                className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                View Scorecard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
