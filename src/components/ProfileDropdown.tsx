"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

interface ProfileDropdownProps {
  displayName: string;
}

export default function ProfileDropdown({ displayName }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"right" | "left">(
    "left",
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position to keep it on screen
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // 48 * 4 (w-48 in Tailwind)
      const spaceOnLeft = buttonRect.left;

      // If not enough space on left, position on right
      if (spaceOnLeft < dropdownWidth) {
        setDropdownPosition("right");
      } else {
        setDropdownPosition("left");
      }
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
        style={{
          width: "40px",
          height: "40px",
          minWidth: "40px",
          minHeight: "40px",
          background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          aspectRatio: "1/1",
        }}
        title={displayName}
        aria-label="Profile menu"
      >
        <span className="text-lg">👤</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            right: dropdownPosition === "left" ? "0" : "auto",
            left: dropdownPosition === "right" ? "0" : "auto",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* User Name Header */}
          <div
            className="px-4 py-3 border-b"
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Signed in as
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--foreground)" }}
            >
              {displayName}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
              style={{
                color: "var(--foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="text-base">👤</span>
              <span>Profile</span>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors"
                style={{
                  color: "var(--foreground)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--background)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="text-base">🚪</span>
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
