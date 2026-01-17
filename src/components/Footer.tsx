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
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <a
              href="tel:+919907321792"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                color: "white",
                border: "none",
              }}
            >
              📞 Contact Us
            </a>
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
      </div>
    </footer>
  );
}
