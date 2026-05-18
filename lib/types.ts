export interface Photo {
  id: string;
  file: File;
  url: string; // object URL
  stickers: Sticker[];
  caption: string;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number; // percentage of photo width
  y: number; // percentage of photo height
}

export interface TripDraft {
  origin: string;             // IATA code, e.g. "SFO"
  originCity: string;
  originCountry: string;
  destination: string;        // IATA code, e.g. "PSP"
  destinationCity: string;
  destinationCountry: string;
  destinationCountryCode: string;
  date: string;               // ISO date string
  photos: Photo[];
}

export interface JournalEntry {
  id: string;
  countryCode: string;  // ISO 3166-1 alpha-2, e.g. "US"
  countryName: string;
  city: string;
  origin: string;
  destination: string;
  date: string;
  photos: SavedPhoto[];
  createdAt: number;    // timestamp
}

export interface SavedPhoto {
  id: string;
  dataUrl: string;      // base64 data URL (persisted in IndexedDB)
  stickers: Sticker[];
  caption: string;
}
