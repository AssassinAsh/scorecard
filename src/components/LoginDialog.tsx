"use client";

import Link from "next/link";

export default function LoginDialog() {
  return (
    <Link
      href="/login"
      className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-full font-medium"
      style={{ background: "var(--accent)", color: "#fff" }}
    >
      Sign In
    </Link>
  );
}
