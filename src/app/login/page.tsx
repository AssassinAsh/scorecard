import Link from "next/link";
import { login } from "../actions/auth";
import LoginSubmitButton from "@/components/LoginSubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-sm hover:underline mb-3 inline-block"
          style={{ color: "var(--accent)" }}
        >
          ← Back to Home
        </Link>
        <div
          className="rounded-lg p-6 sm:p-8"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <h1 className="text-xl sm:text-2xl font-medium text-center mb-6">
            Scorer Login
          </h1>

          <form action={login} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                placeholder="scorer@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                placeholder="••••••••"
              />
            </div>

            {params.error && (
              <div
                className="rounded-md p-3 text-sm"
                style={{
                  background: "rgba(234, 67, 53, 0.1)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                }}
              >
                {params.error}
              </div>
            )}

            <LoginSubmitButton />
          </form>

          <p className="mt-4 text-sm text-center muted-text">
            Only registered scorers can log in
          </p>
        </div>
      </div>
    </div>
  );
}
