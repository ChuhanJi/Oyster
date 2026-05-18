"use client";

import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/tripStore";
import AirportSearchInput from "@/components/ui/AirportSearchInput";
import type { Airport } from "@/lib/airports";
import { useCallback, useEffect } from "react";

function BarcodeSVG({ width, height, fill }: { width: number; height: number; fill: string }) {
  const bars = [3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1];
  const totalW = bars.reduce((a, b) => a + b, 0);
  let x = 0;
  const rects: { x: number; w: number }[] = [];
  bars.forEach((bw, i) => {
    if (i % 2 === 0) rects.push({ x, w: bw });
    x += bw;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${totalW} 1`} preserveAspectRatio="none" style={{ display: "block" }}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={1} fill={fill} />
      ))}
    </svg>
  );
}

function StubField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, writingMode: "vertical-rl", transform: "rotate(180deg)", alignItems: "flex-start" }}>
      <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.38)" }}>
        {label}
      </span>
      <span style={{ fontSize: 18, fontWeight: 400, color: "rgba(0,0,0,0.65)", letterSpacing: "0.03em" }}>
        {value}
      </span>
    </div>
  );
}

function DecorField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.38)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{ fontSize: 18, fontWeight: 400, color: "rgba(0,0,0,0.65)" }}>
        {value}
      </span>
    </div>
  );
}

const TICKET_COLORS = [
  "#FFC8D2","#F1C7F7","#FFE1B1","#C8CDFD","#D2EDAB","#B2DCFB","#AEE7E6",
];

export default function Step1Page() {
  const router = useRouter();
  const { draft, ticketColor, setTicketColor, setOrigin, setDestination, setDate } = useTripStore();

  useEffect(() => {
    setTicketColor(TICKET_COLORS[Math.floor(Math.random() * TICKET_COLORS.length)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOriginSelect = useCallback(
    (airport: Airport) => setOrigin(airport.code, airport.city, airport.country),
    [setOrigin]
  );
  const handleDestinationSelect = useCallback(
    (airport: Airport) => setDestination(airport.code, airport.city, airport.country, airport.countryCode),
    [setDestination]
  );

  const isComplete =
    draft.origin.length === 3 &&
    draft.destination.length === 3 &&
    draft.date.length > 0;

  const stubFrom = draft.origin || "—";
  const stubTo = draft.destination || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)", width: "100%" }}>
      {/* ── Ticket ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          width: 1296,
          boxShadow: "0 8px 48px rgba(0,0,0,0.11)",
          borderRadius: 22,
        }}
      >
        {/* ── Main body ─────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#F6F5F0",
            borderRadius: "22px 0 0 22px",
            padding: "62px 62px 56px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 58, marginBottom: 44 }}>
            <DecorField label="Passenger" value="TRAVELER" />
            <DecorField label="Flight" value="OYS-1" />
            <DecorField label="Gate" value="01" />
            <DecorField label="Seat" value="6A" />
            {/* Editable date */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Date
              </span>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDate(e.target.value)}
                className="ticket-date-input"
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: draft.date ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.35)",
                  borderBottom: "1.5px solid rgba(0,0,0,0.2)",
                  paddingBottom: 6,
                }}
              />
            </div>
          </div>

          {/* Airport codes — focal point */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 48,
              flex: 1,
              paddingBottom: 44,
            }}
          >
            <AirportSearchInput
              label="From"
              hint="Departure"
              code={draft.origin}
              city={draft.originCity}
              onSelect={handleOriginSelect}
            />

            {/* Airplane icon */}
            <div style={{ fontSize: 34, color: ticketColor, flexShrink: 0, filter: "brightness(0.8) saturate(1.2)" }}>
              ✈
            </div>

            <AirportSearchInput
              label="To"
              hint="Destination"
              code={draft.destination}
              city={draft.destinationCity}
              onSelect={handleDestinationSelect}
            />
          </div>

          {/* Footer: barcode + disclaimer */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <BarcodeSVG width={144} height={38} fill="rgba(0,0,0,0.45)" />
              <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(0,0,0,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ANOTHERADVENTURETOGETHER
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>
              *Please note there is no boarding time
            </span>
          </div>
        </div>

        {/* ── Perforated divider ─────────────────────────── */}
        <div style={{ width: 1, borderLeft: "dashed 2px rgba(0,0,0,0.12)", flexShrink: 0 }} />

        {/* ── Right stub ────────────────────────────────── */}
        <div
          style={{
            width: 360,
            background: ticketColor,
            borderRadius: "0 22px 22px 0",
            padding: "62px 0 56px 34px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* Stub header: FROM ✈ TO */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 34 }}>
            <span style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: 34, color: "rgba(0,0,0,0.65)", letterSpacing: "0.02em" }}>
              {stubFrom}
            </span>
            <span style={{ fontSize: 16, color: "rgba(0,0,0,0.4)" }}>✈</span>
            <span style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: 34, color: "rgba(0,0,0,0.65)", letterSpacing: "0.02em" }}>
              {stubTo}
            </span>
          </div>

          {/* Vertical info columns */}
          <div style={{ display: "flex", flex: 1, gap: 0 }}>
            {[
              { label: "Passenger", value: "TRAVELER" },
              { label: "Flight", value: "OYS-1" },
              { label: "Gate", value: "01" },
              { label: "Seat", value: "6A" },
            ].map((field, i) => (
              <div
                key={field.label}
                style={{
                  paddingLeft: i > 0 ? 16 : 0,
                  paddingRight: 16,
                  borderRight: i < 3 ? "1px solid rgba(0,0,0,0.12)" : "none",
                }}
              >
                <StubField label={field.label} value={field.value} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Next button ─────────────────────────────────────── */}
      <button
        onClick={() => router.push("/add/step2")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          height: 68,
          padding: "0 40px",
          borderRadius: 36,
          background: "#1A1A1A",
          border: "none",
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 500,
          color: "#FFFFFF",
          fontFamily: "inherit",
          letterSpacing: "0.03em",
          boxShadow: "0 20px 56px rgba(0,0,0,0.32), 0 6px 18px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
          opacity: isComplete ? 1 : 0,
          pointerEvents: isComplete ? "auto" : "none",
          marginTop: 40,
          transition: "opacity 250ms ease, transform 120ms ease, box-shadow 180ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#2E2E2E";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 28px 64px rgba(0,0,0,0.36), 0 8px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#1A1A1A";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 20px 56px rgba(0,0,0,0.32), 0 6px 18px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)";
        }}
      >
        Continue
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
