"use client";

import { useState, useActionState } from "react";
import { loginFromDialog } from "@/app/actions/auth";
import LoginSubmitButton from "@/components/LoginSubmitButton";

const initialState = { error: null as string | null };

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(loginFromDialog, initialState);

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

            <form action={formAction} className="space-y-4">
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
                />
              </div>

              {state.error && (
                <div
                  className="rounded-md p-3 text-sm"
                  style={{
                    background: "rgba(234, 67, 53, 0.1)",
                    border: "1px solid var(--danger)",
                    color: "var(--danger)",
                  }}
                >
                  {state.error}
                </div>
              )}

              <LoginSubmitButton />
            </form>

            <p className="mt-4 text-sm text-center muted-text">
              Only registered scorers can log in
            </p>
          </div>
        </div>
      )}
    </>
  );
}
