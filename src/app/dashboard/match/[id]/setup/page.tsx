import Link from "next/link";
import { getMatchById, getPlayersByMatch } from "@/app/actions/matches";
import { getCurrentInnings, getAllInnings } from "@/app/actions/scoring";
import { notFound } from "next/navigation";
import InningsButton from "@/components/InningsButton";

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
            href={`/dashboard/tournament/${match.tournament_id}`}
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
                  Start Second Innings
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

          {/* Players Section intentionally removed to always direct scorers to the live scorecard */}

          {/* Active Match (any ongoing innings) */}
          {hasInnings && (
            <div
              className="rounded-lg p-6 text-center"
              style={{
                background:
                  "color-mix(in srgb, var(--accent) 10%, transparent)",
                border: "1px solid var(--accent)",
              }}
            >
              <h3
                className="text-base font-medium mb-3"
                style={{ color: "var(--accent)" }}
              >
                Match is {match.status}!
              </h3>
              <Link
                href={`/dashboard/match/${id}/score`}
                className="inline-block px-6 py-3 rounded-md font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                Go to Scoring →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
