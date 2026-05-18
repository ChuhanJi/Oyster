import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { JournalEntry } from "./types";

interface OysterDB extends DBSchema {
  journals: {
    key: string;
    value: JournalEntry;
    indexes: {
      "by-country": string;
      "by-date": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OysterDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OysterDB>("oyster", 1, {
      upgrade(db) {
        const store = db.createObjectStore("journals", { keyPath: "id" });
        store.createIndex("by-country", "countryCode");
        store.createIndex("by-date", "date");
      },
    });
  }
  return dbPromise;
}

export async function saveJournal(entry: JournalEntry): Promise<void> {
  const db = await getDB();
  await db.put("journals", entry);
}

export async function getJournalsByCountry(countryCode: string): Promise<JournalEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex("journals", "by-country", countryCode);
}

export async function getJournalById(id: string): Promise<JournalEntry | undefined> {
  const db = await getDB();
  return db.get("journals", id);
}

export async function getAllJournals(): Promise<JournalEntry[]> {
  const db = await getDB();
  return db.getAll("journals");
}

export async function getUnlockedCountries(): Promise<string[]> {
  const journals = await getAllJournals();
  return [...new Set(journals.map((j) => j.countryCode))];
}
