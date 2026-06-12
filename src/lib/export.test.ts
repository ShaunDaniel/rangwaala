import { describe, it, expect } from "vitest";
import { toCss, toTailwind, toJson } from "./export";

const COLORS = ["#a1d2ce", "#50858b", "#123456", "#abcdef", "#ffffff"];

describe("toCss", () => {
  it("emits :root custom properties for every color", () => {
    const css = toCss(COLORS);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-1: #a1d2ce;");
    expect(css).toContain("--color-5: #ffffff;");
    expect(css.match(/--color-\d:/g)).toHaveLength(5);
  });
});

describe("toTailwind", () => {
  it("emits a @theme block with --color-brand tokens", () => {
    const tw = toTailwind(COLORS);
    expect(tw.startsWith("@theme {")).toBe(true);
    expect(tw).toContain("--color-brand-1: #a1d2ce;");
    expect(tw).toContain("--color-brand-5: #ffffff;");
  });
});

describe("toJson", () => {
  it("produces parseable JSON with the colors array", () => {
    expect(JSON.parse(toJson(COLORS))).toEqual({ colors: COLORS });
  });
});
