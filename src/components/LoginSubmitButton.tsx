"use client";

import { useFormStatus } from "react-dom";

export default function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 rounded-md font-medium text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "var(--accent)",
      }}
    >
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}
