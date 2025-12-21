"use client";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card-bg)",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <p className="text-sm muted-text" style={{ margin: 0 }}>
        Developed by{" "}
        <a
          href="https://www.ashvinrokade.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Ashvin Rokade
        </a>
      </p>
    </footer>
  );
}
