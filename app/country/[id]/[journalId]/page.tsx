"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJournalById } from "@/lib/db";
import type { JournalEntry } from "@/lib/types";
import NotebookViewer from "@/components/journal/NotebookViewer";

const NB_SCALED_W = 580 * 2 * 1.28;

export default function JournalViewPage({
  params,
}: {
  params: Promise<{ id: string; journalId: string }>;
}) {
  const { id, journalId } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getJournalById(journalId)
      .then(e => { setEntry(e ?? null); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [journalId]);

  if (!loaded) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
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
        minHeight: "100vh", display: "flex", flexDirection: "column",
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
      position: "relative",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      width: "100%",
      paddingTop: 61, paddingBottom: 100,
    }}>
      {/* Back button — absolutely positioned to align with the 1/2 counter row inside NotebookViewer */}
      <button
        onClick={() => router.push(`/country/${id}`)}
        style={{
          position: "absolute",
          top: 61,
          left: `calc(50% - ${NB_SCALED_W / 2}px)`,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)",
          display: "flex", alignItems: "center", gap: 6, padding: 0,
          height: 28,
          transition: "color 150ms ease",
          zIndex: 1,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-secondary)")}
      >
        ← {entry.countryName}
      </button>

      <NotebookViewer photos={entry.photos} meta={meta} />
    </div>
  );
}
