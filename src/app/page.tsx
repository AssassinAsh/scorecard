import Link from "next/link";
import { Suspense } from "react";
import { getTournaments, isAdmin } from "./actions/tournaments";
import { getUser, logout } from "./actions/auth";
import NewTournamentButton from "@/components/NewTournamentButton";
import { RootSkeleton } from "@/components/Skeletons";

export default function Home() {
  return (
    <Suspense fallback={<RootSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const tournaments = await getTournaments();
  const user = await getUser();
  const admin = user ? await isAdmin() : false;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="cricket-card sticky top-0 z-10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-medium team-name">
              🏏 Cricket Scorecard
            </h1>
            {user ? (
              <div className="flex gap-3 items-center">
                <span className="text-sm muted-text hidden sm:inline">
                  {user.email}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded-md"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-full font-medium"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Scorer Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 sm:px-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-medium team-name">
            Tournaments
          </h2>
          {admin && <NewTournamentButton />}
        </div>

        {tournaments.length === 0 ? (
          <div className="cricket-card p-6 text-center muted-text">
            No tournaments available yet
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}`}
                className="cricket-card block p-4 sm:p-5 hover:shadow-lg transition-all"
              >
                <h3 className="text-base sm:text-lg font-medium team-name mb-2">
                  {tournament.name}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm muted-text">
                  <span className="flex items-center gap-1">
                    <span className="text-base">📍</span>
                    {tournament.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-base">📅</span>
                    {new Date(tournament.start_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
