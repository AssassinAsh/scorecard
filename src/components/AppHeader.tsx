import { getUser, logout } from "@/app/actions/auth";
import { getProfile } from "@/app/actions/profile";
import LoginDialog from "./LoginDialog";
import BackButton from "./BackButton";
import Link from "next/link";

export default async function AppHeader() {
  // Parallelize auth queries to reduce blocking time
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  const displayName = profile?.first_name
    ? profile.first_name
    : profile?.email || user?.email;

  return (
    <header
      className="cricket-card sticky top-0 z-20 border-b shadow-sm backdrop-blur-sm bg-opacity-95"
      style={{ background: "var(--card-bg)" }}
    >
      <div className="max-w-6xl mx-auto px-2 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
        <BackButton />

        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl sm:text-3xl">🏏</span>
          <h1
            className="text-base sm:text-2xl font-bold tracking-tight whitespace-nowrap"
            style={{
              background:
                "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CrickSnap
          </h1>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 ml-auto">
          {user ? (
            <>
              {/* Role Badge - Show for Admin, Manager, and Scorer */}
              {profile?.role === "Admin" && (
                <div
                  className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-3 sm:py-2 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)",
                    border: "1.5px solid rgba(220, 38, 38, 0.3)",
                  }}
                  title="Admin"
                >
                  <span className="text-base sm:text-lg">👑</span>
                  <span
                    className="hidden sm:inline text-xs sm:text-sm font-bold"
                    style={{ color: "#dc2626" }}
                  >
                    Admin
                  </span>
                </div>
              )}

              {profile?.role === "Manager" && (
                <div
                  className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-3 sm:py-2 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)",
                    border: "1.5px solid rgba(99, 102, 241, 0.3)",
                  }}
                  title="Manager"
                >
                  <span className="text-base sm:text-lg">⚡</span>
                  <span
                    className="hidden sm:inline text-xs sm:text-sm font-bold"
                    style={{ color: "#6366f1" }}
                  >
                    Manager
                  </span>
                </div>
              )}

              {profile?.role === "Scorer" && (
                <div
                  className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-3 sm:py-2 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)",
                    border: "1.5px solid rgba(234, 179, 8, 0.3)",
                  }}
                  title={`Credits: ${profile.credits ?? 0}`}
                >
                  <span className="text-base sm:text-lg">🔥</span>
                  <span
                    className="hidden sm:inline text-xs sm:text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Credits:
                  </span>
                  <span
                    className="text-xs sm:text-sm font-bold"
                    style={{ color: "#eab308" }}
                  >
                    {profile.credits ?? 0}
                  </span>
                </div>
              )}

              <Link
                href="/profile"
                className="text-xs sm:text-sm muted-text max-w-[80px] sm:max-w-[150px] lg:max-w-[200px] truncate hover:text-[var(--accent)] transition-colors"
                title={displayName}
              >
                {displayName}
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[var(--border)] transition-all active:scale-95"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </header>
  );
}
