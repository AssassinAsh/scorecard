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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-3xl">🏏</span>
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
            <p className="text-sm muted-text text-center md:text-left max-w-xs">
              Professional cricket scoring made simple and accessible for
              everyone
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center gap-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--foreground)" }}
            >
              Quick Links
            </h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <a
                href="/terms"
                className="hover:text-[var(--accent)] transition-colors text-center font-medium"
                style={{ color: "var(--muted)" }}
              >
                Terms & Conditions
              </a>
              <a
                href="/privacy"
                className="hover:text-[var(--accent)] transition-colors text-center font-medium"
                style={{ color: "var(--muted)" }}
              >
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Contact Managers Section */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--foreground)" }}
            >
              Contact Our Team
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-center md:text-right">
              <a
                href="tel:+919907321792"
                className="hover:text-[var(--accent)] transition-colors font-medium"
                style={{ color: "var(--muted)" }}
              >
                Anup Patel
              </a>
              <a
                href="tel:+919770894274"
                className="hover:text-[var(--accent)] transition-colors font-medium"
                style={{ color: "var(--muted)" }}
              >
                Nirmal Joshi
              </a>
              <a
                href="tel:+919425983055"
                className="hover:text-[var(--accent)] transition-colors font-medium"
                style={{ color: "var(--muted)" }}
              >
                Suyash Chouhan
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p className="muted-text text-center sm:text-left">
              © {new Date().getFullYear()} CrickSnap. All rights reserved.
            </p>
            <p className="muted-text text-center sm:text-right">
              Crafted with ❤️ by{" "}
              <a
                href="https://www.ashvinrokade.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors font-semibold"
                style={{
                  color: "var(--accent)",
                  textDecoration: "none",
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
