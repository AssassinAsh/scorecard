import Link from "next/link";
import { logout, getUser } from "../actions/auth";
import { getTournaments, isAdmin } from "../actions/tournaments";

export default async function DashboardPage() {
  const user = await getUser();
  const tournaments = await getTournaments();
  const admin = await isAdmin();

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
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-lg sm:text-xl font-medium">Scorer Dashboard</h1>
            <div className="flex gap-3 items-center">
              <span className="text-sm muted-text hidden sm:inline">
                {user?.email}
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-3 px-2">
          <h2 className="text-base font-medium">Tournaments</h2>
          {admin && (
            <Link
              href="/dashboard/tournament/new"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              + New
            </Link>
          )}
        </div>

        {tournaments.length === 0 ? (
          <div
            className="cricket-card rounded-lg p-6 text-center"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="muted-text">
              No tournaments yet. Create your first tournament!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/dashboard/tournament/${tournament.id}`}
                className="cricket-card block rounded-lg p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3 className="text-base sm:text-lg font-medium team-name mb-1">
                  {tournament.name}
                </h3>
                <p className="text-sm muted-text">
                  {tournament.location} •{" "}
                  {new Date(tournament.start_date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div
          className="mt-4 rounded-lg p-4"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            border: "1px solid var(--accent)",
          }}
        >
          <h3
            className="font-medium text-sm mb-2"
            style={{ color: "var(--accent)" }}
          >
            Quick Links
          </h3>
          <ul className="space-y-1.5">
            <li>
              <Link
                href="/"
                className="text-sm hover:underline"
                style={{ color: "var(--accent)" }}
              >
                → View Public Tournament List
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
