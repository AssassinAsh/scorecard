"use client";

import { useState } from "react";
import { loginWithEmailPassword, loginWithGoogle } from "@/lib/firebase/client";

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailPasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const { idToken } = await loginWithEmailPassword(email, password);

      await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      });

      setOpen(false);
      // Reload to let server components pick up new session
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    try {
      setLoading(true);
      const { idToken } = await loginWithGoogle();

      await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      });

      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-full font-medium"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Scorer Login
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative w-full max-w-md rounded-lg p-6 sm:p-8"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-medium">Scorer Login</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm muted-text"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="dialog-email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--foreground)" }}
                >
                  Email
                </label>
                <input
                  id="dialog-email"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="dialog-password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--foreground)" }}
                >
                  Password
                </label>
                <input
                  id="dialog-password"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div
                  className="rounded-md p-3 text-sm"
                  style={{
                    background: "rgba(234, 67, 53, 0.1)",
                    border: "1px solid var(--danger)",
                    color: "var(--danger)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md font-medium text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--accent)",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center">
              <span className="h-px flex-1 bg-[var(--border)]" />
              <span className="mx-3 text-xs muted-text">OR</span>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full py-2.5 px-4 rounded-md font-medium text-sm border flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: "var(--border)",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              <span>Continue with Google</span>
            </button>

            <div
              id="firebase-recaptcha-container"
              className="mt-2"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm text-center muted-text">
              Only registered scorers can log in
            </p>
          </div>
        </div>
      )}
    </>
  );
}
