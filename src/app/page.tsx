import Link from "next/link";
import { Suspense } from "react";
import { getTournaments, isAdmin } from "./actions/tournaments";
import { getUser } from "./actions/auth";
import NewTournamentButton from "@/components/NewTournamentButton";
import TournamentQrButton from "@/components/TournamentQrButton";
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
                <div className="flex flex-wrap items-center gap-3 text-sm muted-text">
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
                  <TournamentQrButton
                    tournamentId={tournament.id}
                    tournamentName={tournament.name}
                    tournamentLocation={tournament.location}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
