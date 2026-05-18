"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJournalsByCountry } from "@/lib/db";
import type { JournalEntry } from "@/lib/types";

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function flagEmoji(code: string) {
  return code.toUpperCase().split("").map(c =>
    String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6)
  ).join("");
}

function TripCard({ entry, countryCode }: { entry: JournalEntry; countryCode: string }) {
  const router = useRouter();
  const thumb = entry.photos[0]?.dataUrl;

  return (
    <div
      onClick={() => router.push(`/country/${countryCode}/${entry.id}`)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--color-surface-raised)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "transform 160ms ease,box-shadow 160ms ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 32px rgba(0,0,0,0.12),0 3px 8px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 20px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.05)";
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: "100%", paddingTop: "66%",
        position: "relative",
        background: "var(--color-surface)",
        flexShrink: 0,
      }}>
        {thumb ? (
          <img
            src={thumb}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: "var(--color-text-tertiary)",
          }}>
            ✈
          </div>
        )}
      </div>

      {/* Info strip */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{
          fontSize: 18, fontWeight: 600,
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-caveat), cursive",
          lineHeight: 1.2,
        }}>
          {entry.city || entry.destination}
        </div>
        <div style={{
          fontSize: 13, color: "var(--color-text-secondary)",
          marginTop: 4,
        }}>
          {fmtDate(entry.date)}
        </div>
        <div style={{
          marginTop: 8, fontSize: 11, fontWeight: 500,
          color: "var(--color-text-tertiary)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {entry.photos.length} {entry.photos.length === 1 ? "photo" : "photos"}
        </div>
      </div>
    </div>
  );
}

export default function CountryJournalListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    getJournalsByCountry(id.toUpperCase())
      .then(e => { setEntries(e.sort((a, b) => b.createdAt - a.createdAt)); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [id]);

  const countryName = entries[0]?.countryName ?? id.toUpperCase();
  const flag = flagEmoji(id);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      padding: "48px 96px 100px",
    }}>
      {/* Back */}
      <button
        onClick={() => router.push("/home")}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)",
          display: "flex", alignItems: "center", gap: 6, padding: 0,
          marginBottom: 40, transition: "color 150ms ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-secondary)")}
      >
        ← Back to map
      </button>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 8 }}>{flag}</div>
        <h1 style={{
          fontFamily: "var(--font-caveat), cursive",
          fontSize: 48, fontWeight: 700,
          color: "var(--color-text-primary)",
          margin: 0, lineHeight: 1.1,
        }}>
          {countryName}
        </h1>
        {loaded && (
          <p style={{
            margin: "8px 0 0",
            fontSize: 16, color: "var(--color-text-secondary)",
          }}>
            {entries.length} {entries.length === 1 ? "trip" : "trips"}
          </p>
        )}
      </div>

      {/* Grid */}
      {!loaded ? (
        <div style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>Loading…</div>
      ) : entries.length === 0 ? (
        <div style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
          No journal entries yet.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 24,
          maxWidth: 1200,
        }}>
          {entries.map(e => (
            <TripCard key={e.id} entry={e} countryCode={id} />
          ))}
        </div>
      )}
    </div>
  );
}
