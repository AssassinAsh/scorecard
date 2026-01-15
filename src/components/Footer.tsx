"use client";

export default function Footer() {
  return (
    <footer
      className="border-t mt-auto"
      style={{
        borderColor: "var(--border)",
        background: "var(--card-bg)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <span className="text-xl sm:text-2xl">🏏</span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CrickSnap
            </span>
          </div>
          <p className="text-xs sm:text-sm muted-text text-center sm:text-right">
            Developed with ❤️ by{" "}
            <a
              href="https://www.ashvinrokade.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Ashvin Rokade
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
