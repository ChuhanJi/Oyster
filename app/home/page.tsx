"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

const WorldMap = dynamic(() => import("@/components/home/WorldMap"), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const handleCount = useCallback((n: number) => setUnlockedCount(n), []);

  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      {/* Map — fills entire viewport */}
      <WorldMap onUnlockedCount={handleCount} />

      {/* Top-left — Explorer progress */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: "var(--space-12)",
          pointerEvents: "none",
          width: 260,
        }}
      >
        {/* Row 1: big number + label + percentage */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 36, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1 }}>
            {unlockedCount}
          </span>
          <span style={{ fontSize: 15, fontWeight: 400, color: "var(--color-text-secondary)" }}>
            / 195 countries
          </span>
          {unlockedCount > 0 && (
            <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginLeft: 2 }}>
              · {((unlockedCount / 195) * 100).toFixed(1)}%
            </span>
          )}
        </div>

        {/* Row 2: progress bar + milestone hint inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", height: 6, borderRadius: 99, background: "rgba(0,0,0,0.10)", flex: 1 }}>
            <div
              style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: `${Math.min(100, (unlockedCount / 195) * 100)}%`,
                borderRadius: 99,
                background: "linear-gradient(90deg, #A8D898 0%, #7EC86A 100%)",
                transition: "width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                minWidth: unlockedCount > 0 ? 8 : 0,
              }}
            />
            {[10, 25, 50, 100].map((m) => (
              <div
                key={m}
                style={{
                  position: "absolute",
                  top: 0, bottom: 0,
                  left: `${(m / 195) * 100}%`,
                  width: 1.5,
                  background: unlockedCount >= m ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.14)",
                }}
              />
            ))}
          </div>
          {(() => {
            const next = [5, 10, 25, 50, 100, 195].find((m) => m > unlockedCount);
            if (!next) return null;
            return (
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", letterSpacing: "0.03em" }}>
                {next - unlockedCount} to {next}
              </span>
            );
          })()}
        </div>
        {unlockedCount === 0 && (
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 6, letterSpacing: "0.04em" }}>
            Start exploring the world
          </div>
        )}
      </div>

      {/* Top-right — Profile */}
      <button
        className="home-profile-btn"
        aria-label="Profile"
        style={{
          position: "absolute",
          top: 24,
          right: "var(--space-12)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Bottom-center FAB */}
      <Link href="/add/step1" className="home-fab" aria-label="Add trip">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Link>
    </main>
  );
}
