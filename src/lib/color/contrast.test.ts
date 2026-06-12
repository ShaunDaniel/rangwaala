import { describe, it, expect } from "vitest";
import {
  linearize,
  relativeLuminance,
  contrastRatio,
  readableTextColor,
} from "./contrast";

describe("linearize", () => {
  it("returns 0 and 1 at the extremes", () => {
    expect(linearize(0)).toBe(0);
    expect(linearize(255)).toBeCloseTo(1);
  });

  it("uses the linear segment below the threshold", () => {
    // 10/255 ≈ 0.0392 ≤ 0.03928 → divide by 12.92
    expect(linearize(10)).toBeCloseTo(10 / 255 / 12.92, 6);
  });
});

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
  });
});

describe("contrastRatio", () => {
  it("is 21 for black against white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
  });

  it("is 1 for a color against itself", () => {
    expect(contrastRatio("#a1d2ce", "#a1d2ce")).toBeCloseTo(1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#123456", "#abcdef")).toBeCloseTo(
      contrastRatio("#abcdef", "#123456"),
    );
  });
});

describe("readableTextColor", () => {
  it("chooses black text on light backgrounds", () => {
    expect(readableTextColor("#ffffff")).toBe("#000");
    expect(readableTextColor("#f8e169")).toBe("#000");
  });

  it("chooses white text on dark backgrounds", () => {
    expect(readableTextColor("#000000")).toBe("#fff");
    expect(readableTextColor("#2d2d2d")).toBe("#fff");
    expect(readableTextColor("#6344f5")).toBe("#fff");
  });
});
