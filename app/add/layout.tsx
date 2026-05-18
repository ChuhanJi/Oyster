"use client";

import { usePathname, useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";

const STEPS = [
  { label: "Route" },
  { label: "Moments" },
  { label: "Notes" },
];

const STEP_PATHS = ["/add/step1", "/add/step2", "/add/step3"];
const NO_HEADER_PATHS = ["/add/journal"];

const PREV_STEPS: Record<string, { path: string; label: string }> = {
  "/add/step2":   { path: "/add/step1", label: "Route"   },
  "/add/step3":   { path: "/add/step2", label: "Moments" },
  "/add/journal": { path: "/add/step3", label: "Notes"   },
};

export default function AddLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentStep = Math.max(0, STEP_PATHS.findIndex((p) => pathname?.startsWith(p)));
  const showHeader = !NO_HEADER_PATHS.some(p => pathname?.startsWith(p));
  const prevStep = Object.entries(PREV_STEPS).find(([k]) => pathname?.startsWith(k))?.[1] ?? null;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "calc(100vh / 0.8)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
    }}>

      {/* ── Top bar: Home | StepIndicator | (spacer) ── */}
      <header style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        paddingTop: "var(--space-6)",
        paddingBottom: "var(--space-3)",
        paddingLeft: "var(--space-12)",
        paddingRight: "var(--space-12)",
      }}>
        {/* Left: Back button (to previous step; hidden on step 1) */}
        <div style={{ width: 160, flexShrink: 0, display: "flex", alignItems: "center" }}>
          {prevStep && (
            <button
              onClick={() => router.push(prevStep.path)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 17, fontWeight: 500,
                color: "var(--color-text-secondary)", transition: "color 150ms ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {prevStep.label}
            </button>
          )}
        </div>

        {/* Center: StepIndicator — only on step pages */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {showHeader && <StepIndicator steps={STEPS} currentStep={currentStep} />}
        </div>

        {/* Right: Exit — mirrors ← Back exactly */}
        <div style={{ width: 160, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => router.push("/home")}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 17, fontWeight: 500,
              color: "var(--color-text-secondary)", transition: "color 150ms ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-secondary)")}
          >
            Exit
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <main style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "var(--space-3)",
        paddingBottom: "var(--space-3)",
        paddingLeft: "var(--space-12)",
        paddingRight: "var(--space-12)",
      }}>
        {children}
      </main>
    </div>
  );
}
