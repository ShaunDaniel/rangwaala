/**
 * Semantic role assignment for an arbitrary palette.
 *
 * The generator can hand us any five colors — three near-white pastels, a
 * neon, a near-black. Dropping those into a UI verbatim is how you get the
 * "weird" look: an invisible pastel button, white text on a light tag, a
 * heading you can't read. This module maps the raw colors onto the handful of
 * roles a real interface actually needs — a brand accent, a supporting accent,
 * and a soft surface tint — and *guarantees* each one is legible. It keeps the
 * hue but nudges lightness/chroma into a usable band whenever a raw color
 * won't do, so the mockups always look intentional.
 */

import { contrastRatio, readableTextColor } from "./contrast";
import { hexToOklch, oklchToHex } from "./oklab";

export type Ink = "#000" | "#fff";

export interface PaletteRoles {
  /** Brand accent — vivid, visible on a light surface, with a legible label. */
  primary: string;
  onPrimary: Ink;
  /** Supporting accent, kept distinct in hue from `primary`. */
  secondary: string;
  onSecondary: Ink;
  /** A pale wash of the palette, usable as a tinted background block. */
  soft: string;
  onSoft: Ink;
  /** The raw colors (deduped order preserved) for swatch bands & charts. */
  ramp: string[];
}

const LIGHT_SURFACE = "#ffffff";
const FALLBACK = "#111111";

/** A filled accent works when its label is legible *and* it shows on white. */
function isUsableAccent(hex: string): boolean {
  const label = Math.max(
    contrastRatio(hex, "#000000"),
    contrastRatio(hex, "#ffffff"),
  );
  const onSurface = contrastRatio(hex, LIGHT_SURFACE);
  return label >= 4.5 && onSurface >= 1.45;
}

/**
 * Pull a color into a mid, saturated band so it reads as a solid accent —
 * only when it isn't already usable, so vivid colors pass through untouched.
 */
function toAccent(hex: string): string {
  if (isUsableAccent(hex)) return hex;
  const { L, C, h } = hexToOklch(hex);
  const clampedL = Math.min(0.7, Math.max(0.5, L));
  const boostedC = Math.max(0.1, C);
  return oklchToHex(clampedL, boostedC, h);
}

/** A pale, low-chroma tint of a hue — always reads as a light surface. */
function toSoft(hex: string): string {
  const { C, h } = hexToOklch(hex);
  return oklchToHex(0.95, Math.min(0.04, C), h);
}

const chromaOf = (hex: string) => hexToOklch(hex).C;
const lightnessOf = (hex: string) => hexToOklch(hex).L;

/** Smallest angular distance between two hues, in degrees (0–180). */
function hueGap(a: string, b: string): number {
  const d = Math.abs(hexToOklch(a).h - hexToOklch(b).h) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Derive legible UI roles from a raw palette. Pure and deterministic, so the
 * same palette always renders the same mockup.
 */
export function paletteRoles(colors: string[]): PaletteRoles {
  const ramp = (colors.length ? colors : [FALLBACK]).slice(0, 5);
  const pool = [...new Set(ramp.map((c) => c.toLowerCase()))];

  // Primary: the most colorful color that's usable as-is; otherwise the most
  // colorful overall, nudged into a button-friendly shade.
  const usable = pool.filter(isUsableAccent);
  const byChroma = [...(usable.length ? usable : pool)].sort(
    (a, b) => chromaOf(b) - chromaOf(a),
  );
  const primaryRaw = byChroma[0];
  const primary = toAccent(primaryRaw);

  // Secondary: the most colorful *remaining* hue at least 25° off the primary,
  // so the two accents never read as the same color. Falls back gracefully on
  // monochrome palettes.
  const secondaryRaw =
    pool
      .filter((c) => c !== primaryRaw && hueGap(c, primaryRaw) >= 25)
      .sort((a, b) => chromaOf(b) - chromaOf(a))[0] ??
    pool.find((c) => c !== primaryRaw) ??
    primaryRaw;
  const secondary = toAccent(secondaryRaw);

  // Soft: a pale tint of the lightest color, so the wash stays on-palette.
  const lightest = [...pool].sort((a, b) => lightnessOf(b) - lightnessOf(a))[0];
  const soft = toSoft(lightest);

  return {
    primary,
    onPrimary: readableTextColor(primary),
    secondary,
    onSecondary: readableTextColor(secondary),
    soft,
    onSoft: readableTextColor(soft),
    ramp,
  };
}
