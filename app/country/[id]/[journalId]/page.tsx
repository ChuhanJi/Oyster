"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJournalById } from "@/lib/db";
import type { JournalEntry } from "@/lib/types";
import NotebookViewer from "@/components/journal/NotebookViewer";

const PAGE_H = 740;
// header(94) + main-padding-bottom(48) + spread-counter(26)
const CHROME_H = 168;
const ZOOM = 0.8;

export default function JournalViewPage({
  params,
}: {
  params: Promise<{ id: string; journalId: string }>;
}) {
  const { id, journalId } = use(params);
  const router = useRouter();
  const [entry, setEntry]   = useState<JournalEntry | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [nbScale, setNbScale] = useState(1.0);

  useEffect(() => {
    const compute = () => {
      const available = window.innerHeight / ZOOM - CHROME_H;
      setNbScale(Math.min(1.3, Math.max(0.55, available / PAGE_H)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    getJournalById(journalId)
      .then(e => { setEntry(e ?? null); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [journalId]);

  if (!loaded) {
    return (
      <div style={{
        minHeight: "calc(100vh / 0.8)", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 14, color: "var(--color-text-tertiary)",
      }}>
        Loading…
      </div>
    );
  }

  if (!entry) {
    return (
      <div style={{
        minHeight: "calc(100vh / 0.8)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
          Journal not found.
        </p>
        <button className="btn-primary" onClick={() => router.push(`/country/${id}`)}>
          ← Back
        </button>
      </div>
    );
  }

  const meta = {
    city:        entry.city,
    destination: entry.destination,
    date:        entry.date,
  };

  return (
    <div style={{
      width: "100%",
      height: "calc(100vh / 0.8)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
    }}>
      {/* Header — mirrors add/layout.tsx header style */}
      <header style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 24,
        paddingLeft: 96,
        paddingRight: 96,
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push(`/country/${id}`)}
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
          {entry.countryName}
        </button>
      </header>

      {/* Notebook — fills remaining space, vertically centered */}
      <main style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 48,
      }}>
        <NotebookViewer photos={entry.photos} meta={meta} scale={nbScale} />
      </main>
    </div>
  );
}
