import {
  generatePalette,
  type ColorPalette,
  type GenerateOptions,
  type HarmonyRule,
} from "@/lib/color/generate";

/** A saturation/lightness band — what makes a "vivid" vs "pastel" vs "deep" cut. */
interface Tone {
  saturation: [number, number];
  lightness: [number, number];
}

export interface Family {
  name: string;
  /** Representative hue (0–360) for the section dot and generation anchor. */
  hue: number;
  /** Tonal range to draw from. Defaults give vivid→deep→muted→pastel variety. */
  tones?: Tone[];
}

// A spread of tones so palettes in the same hue family still look distinct:
// vivid, deep, muted, pastel, bright.
const DEFAULT_TONES: Tone[] = [
  { saturation: [72, 90], lightness: [48, 58] },
  { saturation: [55, 75], lightness: [30, 42] },
  { saturation: [26, 46], lightness: [46, 60] },
  { saturation: [34, 54], lightness: [74, 84] },
  { saturation: [78, 94], lightness: [60, 70] },
];

// Lavender stays soft, but still varies between pale and mid.
const LAVENDER_TONES: Tone[] = [
  { saturation: [30, 48], lightness: [76, 86] },
  { saturation: [34, 52], lightness: [60, 70] },
];

// Hue-anchored families. Each is generated with hue-preserving schemes so a
// section really is "shades of <family>".
export const FAMILIES: Family[] = [
  { name: "Red", hue: 2 },
  { name: "Orange", hue: 28 },
  { name: "Yellow", hue: 50 },
  { name: "Green", hue: 130 },
  { name: "Teal", hue: 172 },
  { name: "Cyan", hue: 190 },
  { name: "Blue", hue: 220 },
  { name: "Violet", hue: 258 },
  { name: "Purple", hue: 282 },
  { name: "Magenta", hue: 312 },
  { name: "Pink", hue: 338 },
  { name: "Lavender", hue: 266, tones: LAVENDER_TONES },
];

export const slug = (name: string) => name.toLowerCase();

// Hue-preserving schemes keep a group within its family.
const FAMILY_SCHEMES: HarmonyRule[] = ["analogous", "monochromatic"];
const jitter = (amount: number) => Math.round((Math.random() * 2 - 1) * amount);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Generate `count` palettes within the family's hue, varied across tones. */
export function generateFamilyPalettes(family: Family, count: number): ColorPalette[] {
  const tones = family.tones ?? DEFAULT_TONES;
  return Array.from({ length: count }, (_, i) => {
    // Cycle tones for the initial few (guarantees on-screen variety), then
    // randomize for "show more".
    const tone = i < tones.length ? tones[i] : pick(tones);
    const options: GenerateOptions = {
      harmony: FAMILY_SCHEMES[i % FAMILY_SCHEMES.length],
      baseHue: family.hue + jitter(12),
      saturation: tone.saturation,
      lightness: tone.lightness,
    };
    return generatePalette(options);
  });
}
