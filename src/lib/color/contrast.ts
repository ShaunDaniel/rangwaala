/**
 * WCAG 2.x contrast math.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

import { hexToRgb } from "./convert";

/**
 * Linearize a single sRGB channel given as a 0–255 value.
 * Exported because the OKLab pipeline (Phase 3) reuses the same gamma curve.
 */
export function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance of a hex color in the 0–1 range. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Contrast ratio between two hex colors, from 1 (identical) to 21 (black/white). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lmax = Math.max(la, lb);
  const lmin = Math.min(la, lb);
  return (lmax + 0.05) / (lmin + 0.05);
}

/** Return `#000` or `#fff`, whichever has higher contrast against the given color. */
export function readableTextColor(hex: string): "#000" | "#fff" {
  return contrastRatio(hex, "#000000") >= contrastRatio(hex, "#ffffff")
    ? "#000"
    : "#fff";
}
