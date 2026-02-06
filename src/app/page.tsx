import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getTournaments,
  canCreateTournament,
  getUserRole,
} from "./actions/tournaments";
import { getUser } from "./actions/auth";
import { getProfile } from "./actions/profile";
import NewTournamentButton from "@/components/NewTournamentButton";
import TournamentQrButton from "@/components/TournamentQrButton";
import { RootSkeleton } from "@/components/Skeletons";

// Enable ISR: Regenerate page every hour
// Active users get instant updates via Realtime, so this only affects new visitors
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "CrickSnap - Live Cricket Scoring & Tournament Management",
  description:
    "Create cricket tournaments, score matches live, and share scorecards instantly. Free real-time cricket scoring app.",
};

export default function Home() {
  return (
    <Suspense fallback={<RootSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  // Parallelize all independent queries to reduce TTFB
  const [tournaments, user] = await Promise.all([getTournaments(), getUser()]);

  // Only fetch profile/role if user exists (dependent query)
  const [profile, role, canCreate] = user
    ? await Promise.all([getProfile(), getUserRole(), canCreateTournament()])
    : [null, "Viewer" as const, false];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Hero Section */}
      <div
        className="cricket-card mx-3 sm:mx-auto max-w-5xl mt-4 sm:mt-6 p-6 sm:p-8 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
          borderColor: "var(--accent)",
          borderWidth: "2px",
        }}
      >
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Welcome to CrickSnap 🏏
        </h2>
        <p className="text-sm sm:text-base lg:text-lg muted-text max-w-2xl mx-auto">
          Real-time cricket scoring made simple. Create tournaments, score
          matches live, and share scorecards instantly.
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 py-4 sm:py-6 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold team-name mb-1">
              Tournaments
            </h3>
            <p className="text-xs sm:text-sm muted-text">
              {tournaments.length}{" "}
              {tournaments.length === 1 ? "tournament" : "tournaments"}{" "}
              available
            </p>
          </div>
          <NewTournamentButton
            canCreate={canCreate}
            userCredits={profile?.credits ?? 0}
            userRole={role}
          />
        </div>

        {tournaments.length === 0 ? (
          <div className="cricket-card p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🏏</div>
            <p className="text-base sm:text-lg muted-text mb-2">
              No tournaments available yet
            </p>
            <p className="text-xs sm:text-sm muted-text">
              Create your first tournament to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}`}
                className="cricket-card-interactive block p-4 sm:p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold team-name group-hover:text-[var(--accent)] transition-colors flex-1 pr-2">
                    {tournament.name}
                  </h3>
                  <TournamentQrButton
                    tournamentId={tournament.id}
                    tournamentName={tournament.name}
                    tournamentLocation={tournament.location}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm muted-text">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📍</span>
                    <span className="truncate">{tournament.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📅</span>
                    {new Date(tournament.start_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
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
