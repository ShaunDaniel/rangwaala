import { describe, it, expect } from "vitest";
import { generatePalette, HARMONY_RULES, type LockedSlot } from "./generate";
import { hexToHsl, normalizeHue } from "./convert";

const isHex = (s: string) => /^#[0-9a-f]{6}$/.test(s);

describe("generatePalette", () => {
  it("returns five valid hexes and a known harmony rule", () => {
    const { colors, harmony } = generatePalette();
    expect(colors).toHaveLength(5);
    colors.forEach((c) => expect(isHex(c)).toBe(true));
    expect(HARMONY_RULES).toContain(harmony);
  });

  it("honors an explicitly requested rule", () => {
    expect(generatePalette({ harmony: "triadic" }).harmony).toBe("triadic");
  });

  it("keeps locked hexes and changes unlocked ones", () => {
    const locked: LockedSlot[] = [
      { hex: "#a1d2ce", locked: true },
      { hex: "#111111", locked: false },
      { hex: "#222222", locked: false },
      { hex: "#333333", locked: false },
      { hex: "#444444", locked: false },
    ];
    const { colors } = generatePalette({ harmony: "analogous", locked });
    expect(colors[0]).toBe("#a1d2ce"); // locked slot survives verbatim
    // The four unlocked slots should no longer be the placeholder grays.
    expect(colors.slice(1)).not.toContain("#111111");
  });

  it("derives the harmony from the first locked color's hue", () => {
    const lockedHex = "#a1d2ce";
    const locked: LockedSlot[] = [
      { hex: lockedHex, locked: true },
      { hex: "#000000", locked: false },
      { hex: "#000000", locked: false },
      { hex: "#000000", locked: false },
      { hex: "#000000", locked: false },
    ];
    const { colors } = generatePalette({ harmony: "analogous", locked });
    const baseHue = Math.round(hexToHsl(lockedHex).h);

    // For analogous, the unlocked slots sit at base ±15 / ±30 degrees.
    const expectedOffsets = [-30, -15, 0, 15, 30];
    colors.forEach((hex, i) => {
      if (i === 0) return; // locked slot is verbatim, not derived
      const hue = hexToHsl(hex).h;
      const expected = normalizeHue(baseHue + expectedOffsets[i]);
      const diff = Math.min(
        Math.abs(hue - expected),
        360 - Math.abs(hue - expected),
      );
      expect(diff).toBeLessThan(2);
    });
  });

  it("preserves a locked slot even at a non-zero index", () => {
    const locked: LockedSlot[] = [
      { hex: "#000000", locked: false },
      { hex: "#000000", locked: false },
      { hex: "#abcdef", locked: true },
      { hex: "#000000", locked: false },
      { hex: "#000000", locked: false },
    ];
    expect(generatePalette({ locked }).colors[2]).toBe("#abcdef");
  });
});
