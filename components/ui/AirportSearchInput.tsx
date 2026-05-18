"use client";

import { useState, useRef, useCallback } from "react";
import { searchAirports, type Airport } from "@/lib/airports";

interface AirportSearchInputProps {
  label: string;        // "FROM" or "TO" — small caps above the input
  hint: string;         // e.g. "出发地" or "到达地"
  code: string;
  city: string;
  onSelect: (airport: Airport) => void;
}

export default function AirportSearchInput({
  label,
  hint,
  code,
  city,
  onSelect,
}: AirportSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = searchAirports(query);
  const hasCode = code.length === 3;

  const openSearch = useCallback(() => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setIsOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleBlur = useCallback(() => {
    blurTimeout.current = setTimeout(() => {
      setIsOpen(false);
      setQuery("");
    }, 150);
  }, []);

  const handleSelect = useCallback(
    (airport: Airport) => {
      onSelect(airport);
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    },
    [onSelect]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative", minWidth: 310 }}>
      {/* Small label: FROM / TO */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(0,0,0,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 10,
        }}
      >
        {label}
      </span>

      {/* Code or search input */}
      <div
        style={{
          borderBottom: isOpen
            ? "2px solid rgba(0,0,0,0.3)"
            : "1.5px solid rgba(0,0,0,0.15)",
          paddingBottom: hasCode && !isOpen ? 0 : 10,
          cursor: "text",
          transition: "border-color 150ms ease",
        }}
        onClick={openSearch}
      >
        {isOpen ? (
          /* Search mode */
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={handleBlur}
            placeholder={hint}
            autoComplete="off"
            spellCheck={false}
            style={{
              fontFamily: "inherit",
              fontWeight: 400,
              fontSize: 38,
              color: "var(--color-text-primary)",
              background: "transparent",
              border: "none",
              outline: "none",
              width: "100%",
              padding: 0,
            }}
          />
        ) : hasCode ? (
          /* Selected — big Barlow Condensed code */
          <span
            style={{
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              fontWeight: 900,
              fontSize: 206,
              lineHeight: 1,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
              display: "block",
            }}
          >
            {code}
          </span>
        ) : (
          /* Empty — hint text */
          <span
            style={{
              fontSize: 38,
              fontWeight: 300,
              color: "rgba(0,0,0,0.22)",
              letterSpacing: "0.02em",
              display: "block",
            }}
          >
            {hint}
          </span>
        )}
      </div>

      {/* City name below */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(0,0,0,0.35)",
          marginTop: 10,
          minHeight: 18,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {city}
      </span>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 6,
            background: "#FFFFFF",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            zIndex: 200,
            minWidth: 340,
            overflow: "hidden",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.map((airport) => (
            <button
              key={airport.code}
              onClick={() => handleSelect(airport)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "12px 18px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 100ms ease",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#F6F6F6")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "transparent")
              }
            >
              <span
                style={{
                  fontFamily: "var(--font-barlow-condensed), sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "var(--color-text-primary)",
                  minWidth: 52,
                  letterSpacing: "0.02em",
                }}
              >
                {airport.code}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {airport.city}
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-text-secondary)" }}>
                  {airport.name} · {airport.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
