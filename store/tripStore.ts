"use client";

import { create } from "zustand";
import type { Photo, TripDraft } from "@/lib/types";

const TICKET_COLORS = [
  "#FFC8D2", // pastel-pink
  "#F1C7F7", // pastel-lavender
  "#FFE1B1", // pastel-peach
  "#C8CDFD", // pastel-periwinkle
  "#D2EDAB", // pastel-sage
  "#B2DCFB", // pastel-blue
  "#AEE7E6", // pastel-teal
];

function randomTicketColor(): string {
  return TICKET_COLORS[Math.floor(Math.random() * TICKET_COLORS.length)];
}

interface TripStore {
  draft: TripDraft;
  ticketColor: string;
  setTicketColor: (color: string) => void;
  setOrigin: (origin: string, city?: string, country?: string) => void;
  setDestination: (destination: string, city?: string, country?: string, countryCode?: string) => void;
  setDate: (date: string) => void;
  setPhotos: (photos: Photo[]) => void;
  addPhotos: (photos: Photo[]) => void;
  removePhoto: (id: string) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  addSticker: (photoId: string, emoji: string, x: number, y: number) => void;
  moveSticker: (photoId: string, stickerId: string, x: number, y: number) => void;
  resetDraft: () => void;
}

const initialDraft: TripDraft = {
  origin: "",
  originCity: "",
  originCountry: "",
  destination: "",
  destinationCity: "",
  destinationCountry: "",
  destinationCountryCode: "",
  date: "",
  photos: [],
};

export const useTripStore = create<TripStore>((set) => ({
  draft: initialDraft,
  ticketColor: TICKET_COLORS[0], // fixed on SSR; randomized client-side via useEffect in step1
  setTicketColor: (color) => set({ ticketColor: color }),

  setOrigin: (origin, city = "", country = "") =>
    set((state) => ({
      draft: { ...state.draft, origin: origin.toUpperCase(), originCity: city, originCountry: country },
    })),

  setDestination: (destination, city = "", country = "", countryCode = "") =>
    set((state) => ({
      draft: {
        ...state.draft,
        destination: destination.toUpperCase(),
        destinationCity: city,
        destinationCountry: country,
        destinationCountryCode: countryCode,
      },
    })),

  setDate: (date) =>
    set((state) => ({ draft: { ...state.draft, date } })),

  setPhotos: (photos) =>
    set((state) => ({ draft: { ...state.draft, photos } })),

  addPhotos: (newPhotos) =>
    set((state) => {
      const combined = [...state.draft.photos, ...newPhotos];
      return { draft: { ...state.draft, photos: combined.slice(0, 8) } };
    }),

  removePhoto: (id) =>
    set((state) => ({
      draft: {
        ...state.draft,
        photos: state.draft.photos.filter((p) => p.id !== id),
      },
    })),

  updatePhotoCaption: (id, caption) =>
    set((state) => ({
      draft: {
        ...state.draft,
        photos: state.draft.photos.map((p) =>
          p.id === id ? { ...p, caption } : p
        ),
      },
    })),

  addSticker: (photoId, emoji, x, y) =>
    set((state) => ({
      draft: {
        ...state.draft,
        photos: state.draft.photos.map((p) =>
          p.id === photoId
            ? {
                ...p,
                stickers: [
                  ...p.stickers,
                  { id: crypto.randomUUID(), emoji, x, y },
                ],
              }
            : p
        ),
      },
    })),

  moveSticker: (photoId, stickerId, x, y) =>
    set((state) => ({
      draft: {
        ...state.draft,
        photos: state.draft.photos.map((p) =>
          p.id === photoId
            ? {
                ...p,
                stickers: p.stickers.map((s) =>
                  s.id === stickerId ? { ...s, x, y } : s
                ),
              }
            : p
        ),
      },
    })),

  resetDraft: () => set({ draft: initialDraft, ticketColor: randomTicketColor() }),
}));
