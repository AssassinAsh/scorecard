import Link from "next/link";
import { getUser, logout } from "@/app/actions/auth";
import LoginDialog from "./LoginDialog";

export default async function AppHeader() {
  const user = await getUser();

  return (
    <header className="cricket-card sticky top-0 z-20 border-b">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="text-sm hover:underline shrink-0"
            style={{ color: "var(--accent)" }}
          >
            ← Back
          </Link>
          <h1 className="text-xl sm:text-2xl font-medium team-name truncate">
            🏏 Cricket Scorecard
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <span className="text-sm muted-text hidden sm:inline max-w-[180px] truncate">
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
            </>
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </header>
  );
}
