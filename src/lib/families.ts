import {
  generatePalette,
  type ColorPalette,
  type GenerateOptions,
  type HarmonyRule,
} from "@/lib/color/generate";

export interface Family {
  name: string;
  /** OKLCH hue (0–360) — the generation anchor. */
  hue: number;
  /** A canonical hex for this family, used for the section dot/pill. */
  swatch: string;
  /** Multiplier on chroma for inherently-soft families (e.g. Lavender). */
  chromaScale?: number;
}

// Hue-anchored families. Each is generated with hue-preserving schemes so a
// section really is "shades of <family>". Hues are in OKLCH (see ./color/oklab)
// to match the generator; the swatch is a hand-picked canonical color so the
// dot looks unmistakably like its name — a flat oklch(L C h) makes warm hues
// (yellow, orange) read muddy.
export const FAMILIES: Family[] = [
  { name: "Red", hue: 25, swatch: "#e5383b" },
  { name: "Orange", hue: 54, swatch: "#f77f00" },
  { name: "Yellow", hue: 90, swatch: "#ffce2e" },
  { name: "Green", hue: 138, swatch: "#5bba32" },
  { name: "Teal", hue: 183, swatch: "#14b8a6" },
  { name: "Cyan", hue: 211, swatch: "#22b8cf" },
  { name: "Blue", hue: 260, swatch: "#3b82f6" },
  { name: "Violet", hue: 293, swatch: "#7c3aed" },
  { name: "Purple", hue: 324, swatch: "#a21caf" },
  { name: "Magenta", hue: 345, swatch: "#d6249f" },
  { name: "Pink", hue: 7, swatch: "#ff5c8a" },
  { name: "Lavender", hue: 299, swatch: "#b9a6e0", chromaScale: 0.55 },
];

export const slug = (name: string) => name.toLowerCase();

// Hue-preserving schemes keep a group within its family.
const FAMILY_SCHEMES: HarmonyRule[] = ["analogous", "monochromatic"];

// Distinct "moods" so palettes in one hue family still look different from each
// other: vivid, muted, pale, deep, punchy, soft. Each tweaks the OKLCH role
// ramp's overall colorfulness and lightness rather than picking new hues.
const MOODS: Array<Pick<GenerateOptions, "chromaScale" | "lightnessShift">> = [
  { chromaScale: 1.05, lightnessShift: 0 }, //    vivid
  { chromaScale: 0.6, lightnessShift: 0 }, //     muted
  { chromaScale: 0.85, lightnessShift: 0.06 }, //  pale
  { chromaScale: 0.95, lightnessShift: -0.07 }, // deep
  { chromaScale: 1.25, lightnessShift: 0.02 }, //  punchy
  { chromaScale: 0.75, lightnessShift: 0.03 }, //  soft
];

const jitter = (amount: number) => Math.round((Math.random() * 2 - 1) * amount);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Generate `count` palettes within the family's hue, varied across moods. */
export function generateFamilyPalettes(family: Family, count: number): ColorPalette[] {
  return Array.from({ length: count }, (_, i) => {
    // Cycle moods for the initial few (guarantees on-screen variety), then
    // randomize for "show more".
    const mood = i < MOODS.length ? MOODS[i] : pick(MOODS);
    const options: GenerateOptions = {
      harmony: FAMILY_SCHEMES[i % FAMILY_SCHEMES.length],
      baseHue: family.hue + jitter(10),
      chromaScale: (family.chromaScale ?? 1) * (mood.chromaScale ?? 1),
      lightnessShift: mood.lightnessShift,
    };
    return generatePalette(options);
  });
}
