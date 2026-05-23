import { describe, it, expect } from "vitest";
import { countryCodes } from "@/lib/countryCodes";

describe("countryCodes", () => {
  it("maps numeric code 840 to the United States", () => {
    expect(countryCodes["840"]).toEqual({ alpha2: "US", name: "United States" });
  });

  it("maps numeric code 392 to Japan", () => {
    expect(countryCodes["392"]).toEqual({ alpha2: "JP", name: "Japan" });
  });

  it("maps numeric code 156 to China", () => {
    expect(countryCodes["156"]).toEqual({ alpha2: "CN", name: "China" });
  });

  it("returns undefined for an unknown numeric code", () => {
    expect(countryCodes["000"]).toBeUndefined();
  });

  it("every entry has a valid 2-letter alpha2 code", () => {
    for (const [, value] of Object.entries(countryCodes)) {
      expect(value.alpha2).toMatch(/^[A-Z]{2}$/);
    }
  });
});
