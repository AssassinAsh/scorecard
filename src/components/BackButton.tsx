"use client";

import { useRouter } from "next/navigation";
import type React from "react";

export default function BackButton() {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm hover:underline shrink-0"
      style={{ color: "var(--accent)" }}
    >
      ← Back
    </button>
  );
}
