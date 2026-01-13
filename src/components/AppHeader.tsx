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
    <header className="cricket-card sticky top-0 z-20 border-b">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        <BackButton />

        <h1 className="text-xl sm:text-2xl font-medium team-name truncate text-center flex-1">
          🏏 Cricket Scorecard
        </h1>

        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm muted-text hidden sm:inline max-w-[180px] truncate hover:underline"
              >
                {displayName}
              </Link>
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
            </>
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </header>
  );
}
