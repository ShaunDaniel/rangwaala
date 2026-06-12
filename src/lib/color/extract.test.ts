import { describe, it, expect } from "vitest";
import { extractPalette, type ImageDataLike } from "./extract";
import { hexToRgb } from "./convert";

/** Build an ImageData-like object from a per-pixel color function. */
function makeImage(
  width: number,
  height: number,
  colorAt: (x: number, y: number) => [number, number, number, number?],
): ImageDataLike {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const [r, g, b, a = 255] = colorAt(x, y);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { data, width, height };
}

describe("extractPalette", () => {
  it("returns both colors of a two-color checkerboard", () => {
    const image = makeImage(16, 16, (x, y) =>
      (x + y) % 2 === 0 ? [220, 20, 20] : [20, 20, 220],
    );
    const palette = extractPalette(image);
    expect(palette.length).toBe(2);

    const rgbs = palette.map(hexToRgb);
    expect(rgbs.some((c) => c.r > 180 && c.b < 80)).toBe(true); // a red
    expect(rgbs.some((c) => c.b > 180 && c.r < 80)).toBe(true); // a blue
  });

  it("yields a tonal spread for a grayscale ramp", () => {
    const image = makeImage(64, 1, (x) => {
      const v = Math.round((x / 63) * 255);
      return [v, v, v];
    });
    const palette = extractPalette(image);
    expect(palette.length).toBeGreaterThanOrEqual(3);

    // Every color is neutral...
    const rgbs = palette.map(hexToRgb);
    rgbs.forEach((c) => {
      expect(Math.abs(c.r - c.g)).toBeLessThanOrEqual(4);
      expect(Math.abs(c.g - c.b)).toBeLessThanOrEqual(4);
    });
    // ...and they span a wide lightness range.
    const lightness = rgbs.map((c) => c.r);
    expect(Math.max(...lightness) - Math.min(...lightness)).toBeGreaterThan(120);
  });

  it("skips fully transparent pixels", () => {
    const image = makeImage(8, 8, (x, y) =>
      (x + y) % 2 === 0 ? [200, 40, 40, 255] : [0, 255, 0, 0],
    );
    const palette = extractPalette(image);
    // Only the opaque red survives; the transparent green is ignored.
    const rgbs = palette.map(hexToRgb);
    expect(rgbs.every((c) => c.g < 180)).toBe(true);
  });

  it("returns an empty palette when every pixel is transparent", () => {
    const image = makeImage(4, 4, () => [10, 20, 30, 0]);
    expect(extractPalette(image)).toEqual([]);
  });
});
