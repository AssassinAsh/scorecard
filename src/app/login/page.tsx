import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";

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
        <div
          className="rounded-lg p-6 sm:p-8"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-medium mb-2">
              Sign In to CrickSnap
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Access your cricket scoring dashboard
            </p>
          </div>

          {params.error && (
            <div
              className="rounded-md p-3 text-sm mb-4"
              style={{
                background:
                  "color-mix(in srgb, var(--danger) 10%, transparent)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
              }}
            >
              {params.error === "auth_failed"
                ? "Authentication failed. Please try again."
                : decodeURIComponent(params.error)}
            </div>
          )}

          <GoogleSignInButton />

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm"
              style={{ color: "var(--accent)" }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
