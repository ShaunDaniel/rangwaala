import { HARMONY_RULES } from "@/lib/color/generate";
import type { PaletteHarmony } from "@/hooks/usePalette";

/**
 * Shareable-URL codec.
 *
 * Schema: `?c=a1d2ce-50858b-xxxxxx-xxxxxx-xxxxxx`
 *  - `c`: five lowercase 6-digit hexes joined by dashes
 */

const HEX_RE = /^[0-9a-f]{6}$/;
const VALID_HARMONIES = new Set<PaletteHarmony>([...HARMONY_RULES, "image"]);

export interface DecodedPalette {
  colors: string[];
  harmony: PaletteHarmony;
}

/** Accepts whatever a server `searchParams` prop or `URLSearchParams.get` yields. */
type RawParam = string | string[] | null | undefined;
export interface RawSearchParams {
  c?: RawParam;
  h?: RawParam;
}

const firstValue = (v: RawParam): string | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

/** Build the `?c=…` query string for a palette. */
export function encodePalette(colors: string[]): string {
  const c = colors.map((hex) => hex.replace(/^#/, "").toLowerCase()).join("-");
  return `?c=${c}`;
}

/**
 * Strictly decode palette params. Anything malformed → `null`, so callers can
 * fall back to a fresh random palette.
 */
export function decodePalette(params: RawSearchParams): DecodedPalette | null {
  const c = firstValue(params.c);
  if (!c) return null;

  const parts = c.toLowerCase().split("-");
  if (parts.length !== 5) return null;
  if (!parts.every((part) => HEX_RE.test(part))) return null;

  // Harmony is optional in the URL (kept for backwards-compat with old links)
  const h = firstValue(params.h);
  const harmony: PaletteHarmony =
    h && VALID_HARMONIES.has(h as PaletteHarmony)
      ? (h as PaletteHarmony)
      : "complementary";

  return {
    colors: parts.map((part) => `#${part}`),
    harmony,
  };
}
