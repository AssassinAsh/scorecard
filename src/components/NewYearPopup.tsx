"use client";

import { useState, useEffect } from "react";

export default function NewYearPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-in-out",
      }}
      onClick={() => setIsOpen(false)}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="relative max-w-md w-full rounded-2xl p-8 text-center shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          animation: "slideUp 0.5s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                width: "10px",
                height: "10px",
                background: ["#FFD700", "#FF69B4", "#00CED1", "#FF6347"][
                  Math.floor(Math.random() * 4)
                ],
                borderRadius: "50%",
                animation: `confetti ${2 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Happy New Year!
          </h2>
          <p className="text-6xl font-bold text-yellow-300 mb-4">2026</p>
          <p className="text-white text-lg mb-6 opacity-90">
            Wishing you a year full of boundaries, centuries, and memorable
            matches!
          </p>
        </div>
      </div>
    </div>
  );
}
