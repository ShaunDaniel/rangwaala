import { describe, it, expect } from "vitest";
import { srgbToOklab, oklabToHex, chroma } from "./oklab";
import { hexToRgb } from "./convert";

describe("srgbToOklab", () => {
  it("places white near L=1 and black at L=0", () => {
    expect(srgbToOklab({ r: 255, g: 255, b: 255 }).L).toBeCloseTo(1, 2);
    expect(srgbToOklab({ r: 0, g: 0, b: 0 }).L).toBeCloseTo(0, 3);
  });

  it("reports ~zero chroma for neutrals and higher chroma for vivid colors", () => {
    expect(chroma(srgbToOklab({ r: 128, g: 128, b: 128 }))).toBeLessThan(0.001);
    expect(chroma(srgbToOklab({ r: 255, g: 0, b: 0 }))).toBeGreaterThan(0.1);
  });
});

describe("oklab round-trip", () => {
  it("recovers the original color within a small tolerance", () => {
    for (const hex of ["#a1d2ce", "#50858b", "#ff0000", "#00ff00", "#0000ff", "#123456"]) {
      const original = hexToRgb(hex);
      const out = hexToRgb(oklabToHex(srgbToOklab(original)));
      expect(Math.abs(out.r - original.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(out.g - original.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(out.b - original.b)).toBeLessThanOrEqual(2);
    }
  });
});
