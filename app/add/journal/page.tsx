"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/tripStore";
import { saveJournal } from "@/lib/db";
import type { SavedPhoto } from "@/lib/types";
import NotebookViewer from "@/components/journal/NotebookViewer";

async function toDataUrl(url: string): Promise<string> {
  const blob = await fetch(url).then(r => r.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const PAGE_H = 740;
// header(92) + counter(26) + gap(24) + button(68) + breathing room(50)
const CHROME_H = 260;

export default function JournalPage() {
  const router = useRouter();
  const { draft, resetDraft } = useTripStore();
  const photos = draft.photos;

  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [nbScale, setNbScale] = useState(0.9);
  const isDone = useRef(false);

  useEffect(() => {
    const compute = () => {
      const available = window.innerHeight - CHROME_H;
      setNbScale(Math.min(1.1, Math.max(0.55, available / PAGE_H)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (!photos.length) return;
    Promise.allSettled(
      photos.map(async p => ({
        id:       p.id,
        dataUrl:  await toDataUrl(p.url),
        stickers: p.stickers,
        caption:  p.caption,
      }))
    ).then(results => {
      const saved = results
        .filter((r): r is PromiseFulfilledResult<SavedPhoto> => r.status === "fulfilled")
        .map(r => r.value);
      setSavedPhotos(saved);
      setLoading(false);
    });
  }, [photos]);

  useEffect(() => {
    if (!photos.length && !isDone.current) {
      router.replace("/add/step2");
    }
  }, [photos, router]);

  if (!photos.length && !isDone.current) return null;

  const meta = {
    city:        draft.destinationCity,
    destination: draft.destination,
    date:        draft.date,
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      await saveJournal({
        id:          crypto.randomUUID(),
        countryCode: draft.destinationCountryCode,
        countryName: draft.destinationCountry,
        city:        draft.destinationCity,
        origin:      draft.origin,
        destination: draft.destination,
        date:        draft.date,
        photos:      savedPhotos,
        createdAt:   Date.now(),
      });
      isDone.current = true;
      resetDraft();
      router.refresh(); // invalidate router cache so /home reloads fresh
      router.push("/home");
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32, width: "100%", flex: 1, minHeight: 0, overflow: "hidden",
      paddingBottom: 80,
    }}>
      <NotebookViewer photos={savedPhotos} meta={meta} loading={loading} scale={nbScale} />

      <button
        className="btn-primary"
        onClick={handleDone}
        disabled={saving || loading}
        style={{ opacity: saving || loading ? 0.6 : 1 }}
      >
        {saving ? "Saving…" : "Done ✓"}
      </button>
    </div>
  );
}
