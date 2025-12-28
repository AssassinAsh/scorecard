"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  metadata?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className = "",
  style = {},
  autoFocus = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Sort options alphabetically by label, excluding empty placeholder values
  const sortedOptions = [...options]
    .filter((opt) => opt.value !== "") // Exclude placeholder options with empty values
    .sort((a, b) => a.label.localeCompare(b.label));

  // Filter options based on search term
  const filteredOptions = sortedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* Selected value display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-md text-sm text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      >
        <span className={!selectedOption ? "opacity-50" : ""}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-md shadow-lg"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            maxHeight: "300px",
            overflow: "hidden",
          }}
        >
          {/* Search input */}
          <div
            className="p-2 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              autoFocus={autoFocus}
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm opacity-50">
                No matches found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                    option.value === value ? "font-medium" : ""
                  }`}
                  style={{
                    background:
                      option.value === value
                        ? "rgba(var(--accent-rgb), 0.1)"
                        : "transparent",
                    color:
                      option.value === value
                        ? "var(--accent)"
                        : "var(--foreground)",
                  }}
                >
                  <div>
                    {option.label}
                    {option.metadata && (
                      <span className="text-xs opacity-70 ml-2">
                        {option.metadata}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
