/**
 * Bidirectional color conversion between HEX, RGB, and HSL.
 *
 * Conventions:
 *  - RGB channels are 0–255.
 *  - HSL hue is 0–360 degrees; saturation and lightness are 0–100 (percent),
 *    matching the values the palette generator works in.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/** Wrap a hue into the canonical 0–360 range (handles negatives and overflow). */
export const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;

const clampChannel = (c: number): number => Math.max(0, Math.min(255, Math.round(c)));

/** Parse a 3- or 6-digit hex string (with or without `#`) into RGB. */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Serialize RGB into a lowercase `#rrggbb` string. */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number) => clampChannel(c).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convert RGB (0–255) to HSL (h 0–360, s/l 0–100). */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** Convert HSL (h 0–360, s/l 0–100) to RGB (0–255). */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const hue = normalizeHue(h) / 360;
  const sat = s / 100;
  const light = l / 100;

  if (sat === 0) {
    const v = light * 255;
    return { r: v, g: v, b: v };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;

  return {
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255,
  };
}

/** HEX → HSL. Required for locking (Phase 1) and URL hydration (Phase 2). */
export const hexToHsl = (hex: string): HSL => rgbToHsl(hexToRgb(hex));

/** HSL → HEX, taking the components as separate arguments for ergonomic call sites. */
export const hslToHex = (h: number, s: number, l: number): string =>
  rgbToHex(hslToRgb({ h, s, l }));
