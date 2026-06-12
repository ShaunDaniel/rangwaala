import { hexToHsl, hslToHex, normalizeHue } from "./convert";

export type HarmonyRule =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "splitComplementary"
  | "monochromatic";

export const HARMONY_RULES: HarmonyRule[] = [
  "analogous",
  "complementary",
  "triadic",
  "tetradic",
  "splitComplementary",
  "monochromatic",
];

export interface ColorPalette {
  colors: string[];
  harmony: HarmonyRule;
}

// Saturation and lightness are randomized per generation within these vivid-
// but-balanced ranges, and each swatch gets a lightness offset so a palette
// spans light→dark instead of five flat same-lightness colors. Together with a
// freshly-picked scheme every generation, this is what keeps results varied —
// even when a locked color pins the base hue.
const SATURATION_RANGE: [number, number] = [62, 84];
const LIGHTNESS_RANGE: [number, number] = [52, 62];

// A gentle light→dark spread across the five positions; jittered per swatch.
const LIGHTNESS_SPREAD = [16, 8, 0, -9, -18];

const randIn = ([min, max]: [number, number]) =>
  Math.round(min + Math.random() * (max - min));

const randJitter = (amount: number) =>
  Math.round((Math.random() * 2 - 1) * amount);

const clampPct = (value: number) => Math.max(6, Math.min(94, value));

/**
 * Compute the five hues for a harmony rule around a base hue.
 * Returns `null` for monochromatic, which varies saturation/lightness instead
 * and is handled by the caller.
 */
function harmonyHues(harmony: HarmonyRule, baseHue: number): number[] | null {
  switch (harmony) {
    case "analogous":
      return [
        normalizeHue(baseHue - 30),
        normalizeHue(baseHue - 15),
        baseHue,
        normalizeHue(baseHue + 15),
        normalizeHue(baseHue + 30),
      ];
    case "complementary":
      return [
        baseHue,
        normalizeHue(baseHue + 30),
        normalizeHue(baseHue + 60),
        normalizeHue(baseHue + 150),
        normalizeHue(baseHue + 180),
      ];
    case "triadic":
      return [
        baseHue,
        normalizeHue(baseHue + 60),
        normalizeHue(baseHue + 120),
        normalizeHue(baseHue + 180),
        normalizeHue(baseHue + 240),
      ];
    case "tetradic":
      return [
        baseHue,
        normalizeHue(baseHue + 90),
        normalizeHue(baseHue + 180),
        normalizeHue(baseHue + 270),
        normalizeHue(baseHue + 45),
      ];
    case "splitComplementary":
      return [
        baseHue,
        normalizeHue(baseHue + 60),
        normalizeHue(baseHue + 120),
        normalizeHue(baseHue + 150),
        normalizeHue(baseHue + 210),
      ];
    case "monochromatic":
      return null;
  }
}

/** The five monochromatic swatches for a base hue: one hue, varied S/L. */
function monochromaticColors(
  baseHue: number,
  saturation: number,
  lightness: number,
): string[] {
  return [
    hslToHex(baseHue, saturation - 20, lightness + 15),
    hslToHex(baseHue, saturation - 10, lightness + 5),
    hslToHex(baseHue, saturation, lightness),
    hslToHex(baseHue, saturation + 5, lightness - 10),
    hslToHex(baseHue, saturation + 10, lightness - 20),
  ];
}

/** A slot the generator may be asked to preserve. */
export interface LockedSlot {
  hex: string;
  locked: boolean;
}

export interface GenerateOptions {
  /** A specific rule, or "random"/undefined to pick one. */
  harmony?: HarmonyRule | "random";
  /** Current slots; locked hexes are preserved and seed the base hue. */
  locked?: LockedSlot[];
  /**
   * Force the base hue (0–360). A locked color still wins; otherwise this is
   * used instead of a random hue — handy for generating a specific color
   * family (e.g. "shades of blue").
   */
  baseHue?: number;
  /** Override the saturation range (default vivid). Lets callers ask for pastels. */
  saturation?: [number, number];
  /** Override the lightness centre range (default mid). */
  lightness?: [number, number];
}

const pickRandomRule = (): HarmonyRule =>
  HARMONY_RULES[Math.floor(Math.random() * HARMONY_RULES.length)];

/**
 * Generate a five-color palette.
 *
 * When any slots are locked, the base hue is derived from the **first locked
 * color** (via HEX→HSL) so the harmony relationship holds from what the user
 * kept; only unlocked slots are overwritten.
 */
export const generatePalette = (options: GenerateOptions = {}): ColorPalette => {
  const locked = options.locked ?? [];
  const harmony: HarmonyRule =
    !options.harmony || options.harmony === "random" ? pickRandomRule() : options.harmony;

  const firstLocked = locked.find((slot) => slot.locked);
  const baseHue = firstLocked
    ? Math.round(hexToHsl(firstLocked.hex).h)
    : options.baseHue !== undefined
      ? normalizeHue(options.baseHue)
      : Math.floor(Math.random() * 360);

  const saturation = randIn(options.saturation ?? SATURATION_RANGE);
  const lightness = randIn(options.lightness ?? LIGHTNESS_RANGE);

  const generated =
    harmony === "monochromatic"
      ? monochromaticColors(baseHue, saturation, lightness)
      : (harmonyHues(harmony, baseHue) ?? [baseHue, baseHue, baseHue, baseHue, baseHue]).map(
          (hue, i) =>
            hslToHex(
              hue,
              clampPct(saturation + randJitter(5)),
              clampPct(lightness + LIGHTNESS_SPREAD[i] + randJitter(4)),
            ),
        );

  // Preserve locked slots in place; fill the rest from the generated set.
  const colors = generated.map((hex, i) => (locked[i]?.locked ? locked[i].hex : hex));

  return { colors, harmony };
};
