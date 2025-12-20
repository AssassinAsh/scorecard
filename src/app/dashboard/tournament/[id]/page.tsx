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
            href="/dashboard"
            className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--accent)" }}
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg sm:text-xl font-medium">{tournament.name}</h1>
          <p className="text-sm muted-text">
            {tournament.location} •{" "}
            {new Date(tournament.start_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-3 px-2">
          <h2 className="text-base font-medium">Matches</h2>
          <Link
            href={`/dashboard/match/new?tournament_id=${id}`}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            + New
          </Link>
        </div>

        {matches.length === 0 ? (
          <div
            className="cricket-card rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text">
              No matches yet. Create your first match!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="cricket-card rounded-lg p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <Link
                    href={`/dashboard/match/${match.id}/setup`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-base sm:text-lg font-medium team-name truncate">
                      {match.team_a_name} vs {match.team_b_name}
                    </h3>
                    <p className="text-sm muted-text mt-1">
                      {new Date(match.match_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {match.overs_per_innings} overs
                    </p>
                  </Link>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background:
                        match.status === "Live"
                          ? "rgba(234, 67, 53, 0.1)"
                          : match.status === "Completed"
                          ? "rgba(52, 168, 83, 0.1)"
                          : "rgba(128, 134, 139, 0.1)",
                      color:
                        match.status === "Live"
                          ? "var(--danger)"
                          : match.status === "Completed"
                          ? "var(--success)"
                          : "var(--muted)",
                    }}
                  >
                    {match.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {match.status === "Live" && (
                    <Link
                      href={`/dashboard/match/${match.id}/score`}
                      className="text-sm px-3 py-1.5 rounded-md font-medium text-white"
                      style={{ background: "var(--danger)" }}
                    >
                      Score Live
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/match/${match.id}/setup`}
                    className="text-sm px-3 py-1.5 rounded-md font-medium"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Setup
                  </Link>
                </div>
                {match.winner_team && (
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: "var(--success)" }}
                  >
                    {match.winner_team === "team_a"
                      ? match.team_a_name
                      : match.team_b_name}{" "}
                    won
                  </p>
                )}
                {!match.winner_team && match.status === "Completed" && (
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Match drawn
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
