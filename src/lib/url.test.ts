import { describe, it, expect } from "vitest";
import { encodePalette, decodePalette } from "./url";

const COLORS = ["#a1d2ce", "#50858b", "#123456", "#abcdef", "#ffffff"];

describe("encodePalette", () => {
  it("builds the documented query schema", () => {
    expect(encodePalette(COLORS, "triadic")).toBe(
      "?c=a1d2ce-50858b-123456-abcdef-ffffff&h=triadic",
    );
  });

  it("lowercases and strips the leading #", () => {
    expect(encodePalette(["#AABBCC", "#DDEEFF", "#001122", "#334455", "#667788"], "image")).toBe(
      "?c=aabbcc-ddeeff-001122-334455-667788&h=image",
    );
  });
});

describe("decodePalette", () => {
  it("round-trips an encoded palette", () => {
    const encoded = encodePalette(COLORS, "triadic");
    const params = new URLSearchParams(encoded);
    const decoded = decodePalette({ c: params.get("c"), h: params.get("h") });
    expect(decoded).toEqual({ colors: COLORS, harmony: "triadic" });
  });

  it("accepts the image harmony", () => {
    expect(
      decodePalette({ c: "a1d2ce-50858b-123456-abcdef-ffffff", h: "image" })?.harmony,
    ).toBe("image");
  });

  it("rejects malformed input", () => {
    expect(decodePalette({})).toBeNull();
    expect(decodePalette({ c: "a1d2ce-50858b-123456-abcdef", h: "triadic" })).toBeNull(); // 4 colors
    expect(
      decodePalette({ c: "a1d2ce-50858b-123456-abcdef-ffffff-extra", h: "triadic" }),
    ).toBeNull(); // 6 colors
    expect(decodePalette({ c: "zzzzzz-50858b-123456-abcdef-ffffff", h: "triadic" })).toBeNull(); // bad hex
    expect(decodePalette({ c: "a1d2c-50858b-123456-abcdef-ffffff", h: "triadic" })).toBeNull(); // short hex
    expect(
      decodePalette({ c: "a1d2ce-50858b-123456-abcdef-ffffff", h: "rainbow" }),
    ).toBeNull(); // unknown harmony
  });

  it("takes the first value when params arrive as arrays", () => {
    expect(
      decodePalette({ c: ["a1d2ce-50858b-123456-abcdef-ffffff"], h: ["triadic"] }),
    ).toEqual({ colors: COLORS, harmony: "triadic" });
  });
});
