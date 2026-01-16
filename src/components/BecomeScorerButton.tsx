"use client";

import { useState } from "react";
import { becomeScorer } from "@/app/actions/profile";
import { useRouter } from "next/navigation";

export default function BecomeScorerButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleBecomeScorer() {
    setLoading(true);
    setError(null);

    const result = await becomeScorer();

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Success - refresh the page to show new role
      router.refresh();
    }
  }

  return (
    <div>
      {error && (
        <div
          className="rounded-md p-3 text-sm mb-4"
          style={{
            background:
              "color-mix(in srgb, var(--destructive) 10%, transparent)",
            border: "1px solid var(--destructive)",
            color: "var(--destructive)",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleBecomeScorer}
        disabled={loading}
        className="px-6 py-2 rounded-md font-medium transition-all"
        style={{
          background: loading ? "var(--muted)" : "var(--accent)",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Upgrading..." : "Become a Scorer (Get 20 Credits)"}
      </button>
    </div>
  );
}
