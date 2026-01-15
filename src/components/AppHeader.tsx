import { getUser, logout } from "@/app/actions/auth";
import { getProfile } from "@/app/actions/profile";
import LoginDialog from "./LoginDialog";
import BackButton from "./BackButton";
import Link from "next/link";

export default async function AppHeader() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.email || user?.email;

  return (
    <header
      className="cricket-card sticky top-0 z-20 border-b shadow-sm backdrop-blur-sm bg-opacity-95"
      style={{ background: "var(--card-bg)" }}
    >
      <div className="max-w-6xl mx-auto px-3 py-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <BackButton />

        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 flex-1 justify-center hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl sm:text-3xl">🏏</span>
          <h1
            className="text-lg sm:text-2xl font-bold tracking-tight"
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

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-xs sm:text-sm muted-text hidden sm:inline max-w-[150px] lg:max-w-[200px] truncate hover:text-[var(--accent)] transition-colors"
                title={displayName}
              >
                {displayName}
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm rounded-lg hover:bg-[var(--border)] transition-all active:scale-95"
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
