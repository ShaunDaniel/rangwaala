import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  normalizeHue,
} from "./convert";

describe("hex ↔ rgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#a1d2ce")).toEqual({ r: 161, g: 210, b: 206 });
  });

  it("parses 3-digit shorthand", () => {
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("serializes rgb to lowercase padded hex", () => {
    expect(rgbToHex({ r: 161, g: 210, b: 206 })).toBe("#a1d2ce");
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  it("round-trips hex → rgb → hex", () => {
    for (const hex of ["#a1d2ce", "#50858b", "#ff0000", "#00ff00", "#0000ff", "#123456"]) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex);
    }
  });

  it("clamps out-of-range channels", () => {
    expect(rgbToHex({ r: 300, g: -10, b: 255 })).toBe("#ff00ff");
  });
});

describe("hex ↔ hsl", () => {
  it("matches known primaries", () => {
    expect(hexToHsl("#ff0000")).toMatchObject({ h: 0, s: 100, l: 50 });
    const green = hexToHsl("#00ff00");
    expect(green.h).toBeCloseTo(120);
    expect(green.s).toBeCloseTo(100);
    expect(green.l).toBeCloseTo(50);
  });

  it("reports grayscale with zero saturation", () => {
    const gray = hexToHsl("#808080");
    expect(gray.s).toBe(0);
  });

  it("round-trips hex → hsl → hex for pure colors", () => {
    for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"]) {
      const { h, s, l } = hexToHsl(hex);
      expect(hslToHex(h, s, l)).toBe(hex);
    }
  });

  it("round-trips arbitrary colors within a 1/255 tolerance", () => {
    for (const hex of ["#a1d2ce", "#50858b", "#789abc", "#445566"]) {
      const { h, s, l } = hexToHsl(hex);
      const out = hexToRgb(hslToHex(h, s, l));
      const original = hexToRgb(hex);
      expect(Math.abs(out.r - original.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(out.g - original.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(out.b - original.b)).toBeLessThanOrEqual(1);
    }
  });
});

describe("normalizeHue", () => {
  it("wraps into 0–360", () => {
    expect(normalizeHue(-30)).toBe(330);
    expect(normalizeHue(390)).toBe(30);
    expect(normalizeHue(360)).toBe(0);
    expect(normalizeHue(180)).toBe(180);
  });
});
