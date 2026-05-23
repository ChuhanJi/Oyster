import { describe, it, expect, beforeEach } from "vitest";
import { useTripStore } from "@/store/tripStore";
import type { Photo } from "@/lib/types";

function makePhoto(id: string): Photo {
  return { id, url: `blob:${id}`, stickers: [], caption: "" };
}

describe("tripStore", () => {
  beforeEach(() => {
    useTripStore.getState().resetDraft();
  });

  it("setOrigin uppercases the IATA code", () => {
    useTripStore.getState().setOrigin("sfo", "San Francisco", "United States");
    expect(useTripStore.getState().draft.origin).toBe("SFO");
    expect(useTripStore.getState().draft.originCity).toBe("San Francisco");
  });

  it("setDestination stores destination details correctly", () => {
    useTripStore.getState().setDestination("nrt", "Tokyo", "Japan", "JP");
    const draft = useTripStore.getState().draft;
    expect(draft.destination).toBe("NRT");
    expect(draft.destinationCountryCode).toBe("JP");
  });

  it("addPhotos caps the total at 8 photos", () => {
    const batch1 = Array.from({ length: 6 }, (_, i) => makePhoto(`p${i}`));
    const batch2 = Array.from({ length: 5 }, (_, i) => makePhoto(`q${i}`));
    useTripStore.getState().addPhotos(batch1);
    useTripStore.getState().addPhotos(batch2);
    expect(useTripStore.getState().draft.photos).toHaveLength(8);
  });

  it("removePhoto deletes only the targeted photo", () => {
    const photos = [makePhoto("a"), makePhoto("b"), makePhoto("c")];
    useTripStore.getState().setPhotos(photos);
    useTripStore.getState().removePhoto("b");
    const ids = useTripStore.getState().draft.photos.map((p) => p.id);
    expect(ids).toEqual(["a", "c"]);
  });

  it("resetDraft clears all draft fields", () => {
    useTripStore.getState().setOrigin("lax", "Los Angeles", "US");
    useTripStore.getState().setDate("2026-05-01");
    useTripStore.getState().resetDraft();
    const draft = useTripStore.getState().draft;
    expect(draft.origin).toBe("");
    expect(draft.date).toBe("");
    expect(draft.photos).toHaveLength(0);
  });
});
