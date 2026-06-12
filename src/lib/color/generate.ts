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

// Default saturation and lightness — vivid but balanced.
const BASE_SATURATION = 70;
const BASE_LIGHTNESS = 60;

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
function monochromaticColors(baseHue: number): string[] {
  return [
    hslToHex(baseHue, BASE_SATURATION - 20, BASE_LIGHTNESS + 15),
    hslToHex(baseHue, BASE_SATURATION - 10, BASE_LIGHTNESS + 5),
    hslToHex(baseHue, BASE_SATURATION, BASE_LIGHTNESS),
    hslToHex(baseHue, BASE_SATURATION + 5, BASE_LIGHTNESS - 10),
    hslToHex(baseHue, BASE_SATURATION + 10, BASE_LIGHTNESS - 20),
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
    : Math.floor(Math.random() * 360);

  const generated =
    harmony === "monochromatic"
      ? monochromaticColors(baseHue)
      : (harmonyHues(harmony, baseHue) ?? [baseHue, baseHue, baseHue, baseHue, baseHue]).map(
          (hue) => hslToHex(hue, BASE_SATURATION, BASE_LIGHTNESS),
        );

  // Preserve locked slots in place; fill the rest from the generated set.
  const colors = generated.map((hex, i) => (locked[i]?.locked ? locked[i].hex : hex));

  return { colors, harmony };
};
