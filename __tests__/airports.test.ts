import { describe, it, expect } from "vitest";
import { searchAirports } from "@/lib/airports";

describe("searchAirports", () => {
  it("returns empty array for an empty query", () => {
    expect(searchAirports("")).toEqual([]);
  });

  it("returns empty array for a single-character query (below minimum length)", () => {
    expect(searchAirports("J")).toEqual([]);
  });

  it("finds airports by IATA code prefix (case-insensitive)", () => {
    const results = searchAirports("jfk");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toBe("JFK");
  });

  it("finds airports by city name", () => {
    const results = searchAirports("tokyo");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((a) => a.city.toLowerCase().includes("tokyo"))).toBe(true);
  });

  it("returns at most 6 results", () => {
    // "airport" matches many name fields
    const results = searchAirports("international");
    expect(results.length).toBeLessThanOrEqual(6);
  });

  it("search is case-insensitive for codes", () => {
    const lower = searchAirports("sfo");
    const upper = searchAirports("SFO");
    expect(lower).toEqual(upper);
  });
});
