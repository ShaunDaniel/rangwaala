import { normalizeHue } from "./convert";
import { hexToOklch, oklchToHex } from "./oklab";
import { SEED_PALETTES } from "./seeds";

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

/**
 * The generator reasons in OKLCH (see ./oklab), not HSL. That matters because
 * HSL lightness is perceptually uneven — a yellow and a blue at the same HSL
 * "L" look nothing alike in brightness — so HSL palettes drift out of balance.
 * OKLCH L is perceptually uniform, so the role ramp below reads as an even
 * light→dark progression regardless of hue.
 *
 * What actually makes a palette look *designed* (rather than five random vivid
 * mid-tones) is two things, and we bake both in:
 *   1. A wide tonal range — a near-white tint and a near-black deep anchor the
 *      ends, with a vivid hero in the middle. The fixed role ramp guarantees it.
 *   2. A restrained hue set — two or three hue families, not five. The harmony
 *      rules below emit a short hue list, and roles reuse it.
 *
 * Each role pins a target lightness (L, 0–1) and chroma (C). Anchors are muted;
 * the accent is the colorful hero. Values are jittered per generation, and the
 * accent's chroma can be scaled (`chromaScale`) for muted vs. vivid moods.
 */
interface Role {
  L: number;
  C: number;
}

const ROLES: Role[] = [
  { L: 0.94, C: 0.035 }, // tint   — near-white "paper"
  { L: 0.82, C: 0.1 }, //   light
  { L: 0.62, C: 0.17 }, //  accent — the vivid hero
  { L: 0.45, C: 0.145 }, // dark
  { L: 0.26, C: 0.075 }, // deep   — near-black "ink"
];

// The lightness of the accent role, and the reference point hue-lightness
// correction is measured against.
const ACCENT_L = 0.62;

/**
 * How strongly each role tracks its hue's natural lightness (below). The accent
 * — the hero — tracks fully; the tint and deep anchors barely move, so a palette
 * keeps its near-white and near-black ends even for a bright hue like yellow.
 */
const ROLE_HUE_L_WEIGHT = [0.22, 0.5, 1, 0.6, 0.16];

/**
 * The lightness at which each hue reads as *itself*. Yellow only looks yellow
 * when it's bright (~0.87); red, blue and purple read true when darker
 * (~0.52–0.62). A flat lightness is exactly what turns yellow olive and red
 * coral — so we sample canonical colors here and interpolate around the wheel.
 */
const HUE_LIGHTNESS: [number, number][] = [
  [7, 0.64], [25, 0.61], [54, 0.72], [90, 0.87], [138, 0.7],
  [183, 0.7], [211, 0.72], [260, 0.62], [293, 0.54], [324, 0.52], [345, 0.6],
];

/** Natural lightness for a hue, linearly interpolated around the wheel. */
function hueLightness(h: number): number {
  const hue = normalizeHue(h);
  for (let i = 0; i < HUE_LIGHTNESS.length; i++) {
    const [h0, l0] = HUE_LIGHTNESS[i];
    const [h1, l1] = HUE_LIGHTNESS[(i + 1) % HUE_LIGHTNESS.length];
    const lo = h0;
    const hi = h1 < h0 ? h1 + 360 : h1;
    const x = hue < lo ? hue + 360 : hue;
    if (x >= lo && x <= hi) return l0 + (l1 - l0) * ((x - lo) / (hi - lo || 1));
  }
  return ACCENT_L;
}

const SEED_PROBABILITY = 0.6;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randJitter = (amount: number) => (Math.random() * 2 - 1) * amount;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Fisher–Yates copy — used to interleave the tonal roles across positions. */
function shuffled<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The (short) hue set for a harmony rule around a base hue. Deliberately 1–3
 * hues: restraint is what reads as harmonious. `[dominant, accent?, accent2?]`.
 */
function harmonyHues(rule: HarmonyRule, base: number): number[] {
  const n = normalizeHue;
  switch (rule) {
    case "monochromatic":
      return [base];
    case "analogous":
      return [base, n(base + pick([25, 30, 35]) * pick([1, -1]))];
    case "complementary":
      return [base, n(base + 180)];
    case "splitComplementary":
      return [base, n(base + pick([150, 210]))];
    case "triadic":
      return [base, n(base + 120), n(base + 240)];
    case "tetradic":
      return [base, n(base + 90), n(base + 180)];
  }
}

/**
 * Which hue (by index into the rule's hue list) each of the five roles uses.
 * The dominant hue carries the light/dark anchors; the accent hue carries the
 * vivid hero — so a palette stays anchored in one hue family with a contrasting
 * pop, the hallmark of a curated palette rather than a rainbow.
 */
function roleHueIndices(hueCount: number): number[] {
  if (hueCount <= 1) return [0, 0, 0, 0, 0];
  if (hueCount === 2) return [0, 0, 1, 1, 0];
  return [0, 0, 1, 1, 2]; // tint/light → dom, accent/dark → accent, deep → 3rd
}

interface ProceduralOptions {
  chromaScale: number;
  lightnessShift: number;
}

/** Build the five role colors for a hue set, jittered and gamut-mapped. */
function buildRoleColors(hues: number[], opts: ProceduralOptions): string[] {
  const idx = roleHueIndices(hues.length);
  return ROLES.map((role, i) => {
    const hue = normalizeHue(hues[idx[i]] + randJitter(7));
    // Pull each role toward its hue's natural lightness so warm hues read true
    // (yellow stays yellow, not olive) without flattening the tonal range.
    const shift = (hueLightness(hue) - ACCENT_L) * ROLE_HUE_L_WEIGHT[i];
    const L = clamp01(role.L + shift + opts.lightnessShift + randJitter(0.016));
    const C = Math.max(0, role.C * opts.chromaScale + randJitter(0.012));
    return oklchToHex(L, C, hue);
  });
}

/**
 * Place colors into the five slots, preserving locked slots verbatim and
 * filling the rest from `pool` in order. Works whether or not anything is
 * locked, so it's the single placement path.
 */
function assemble(pool: string[], locked: LockedSlot[]): string[] {
  let p = 0;
  return Array.from({ length: 5 }, (_, i) =>
    locked[i]?.locked ? locked[i].hex : (pool[p++] ?? pool[pool.length - 1]),
  );
}

/** Angular span (0–360) covered by a set of hues on the wheel. */
function angularSpan(hues: number[]): number {
  if (hues.length < 2) return 0;
  const sorted = [...hues].sort((a, b) => a - b);
  let maxGap = 360 - sorted[sorted.length - 1] + sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    maxGap = Math.max(maxGap, sorted[i] - sorted[i - 1]);
  }
  return 360 - maxGap;
}

/**
 * Label a finished palette with its nearest harmony rule, by the angular spread
 * of its chromatic (non-neutral) hues. Used so seed palettes still surface a
 * meaningful scheme name in the UI and share URLs.
 */
function classifyHarmony(hexes: string[]): HarmonyRule {
  const chromatic = hexes.map(hexToOklch).filter((c) => c.C > 0.04);
  if (chromatic.length <= 1) return "monochromatic";
  const spread = angularSpan(chromatic.map((c) => c.h));
  if (spread < 40) return "analogous";
  if (spread < 110) return "splitComplementary";
  if (spread < 150) return "triadic";
  if (spread < 200) return "complementary";
  return "tetradic";
}

/** A small per-color nudge in OKLCH, keeping a seed recognisable but fresh. */
const perturb = (hex: string): string => {
  const { L, C, h } = hexToOklch(hex);
  return oklchToHex(
    clamp01(L + randJitter(0.02)),
    Math.max(0, C * rand(0.9, 1.1)),
    normalizeHue(h + randJitter(5)),
  );
};

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
   * used instead of a random hue — handy for a specific family ("shades of
   * blue"). Setting it also forces procedural generation (no seed library).
   */
  baseHue?: number;
  /** Scale the accent chroma: <1 muted/pastel, >1 vivid. Default 1. */
  chromaScale?: number;
  /** Shift the whole tonal ramp lighter (+) or darker (−). Default 0. */
  lightnessShift?: number;
  /** Set false to never draw from the seed library (force procedural). */
  seeds?: boolean;
}

const pickRandomRule = (): HarmonyRule =>
  HARMONY_RULES[Math.floor(Math.random() * HARMONY_RULES.length)];

/**
 * Generate a five-color palette.
 *
 * Two engines feed this:
 *  - a **seed** library of hand-picked palettes, lightly perturbed (the "taste"
 *    layer — only when the call is unconstrained), and
 *  - a **procedural** OKLCH role engine that guarantees a light→dark tonal ramp
 *    around a restrained hue set.
 *
 * When any slot is locked, the base hue is derived from the **first locked
 * color** so the harmony holds from what the user kept; only unlocked slots are
 * overwritten. A specific `harmony` or `baseHue` also forces the procedural
 * engine so the request is honored exactly.
 */
export const generatePalette = (options: GenerateOptions = {}): ColorPalette => {
  const locked = options.locked ?? [];
  const firstLocked = locked.find((slot) => slot.locked);
  const wantsRule = options.harmony !== undefined && options.harmony !== "random";
  const hasBaseHue = options.baseHue !== undefined;

  // The seed library only applies to fully unconstrained requests — there's no
  // way to honor a specific rule, a locked hue, or a forced base hue from a
  // pre-baked palette.
  const seedsAllowed =
    options.seeds !== false && !wantsRule && !firstLocked && !hasBaseHue;
  if (seedsAllowed && Math.random() < SEED_PROBABILITY) {
    const colors = pick(SEED_PALETTES).map(perturb);
    return { colors, harmony: classifyHarmony(colors) };
  }

  const rule: HarmonyRule = wantsRule
    ? (options.harmony as HarmonyRule)
    : pickRandomRule();

  const baseHue = firstLocked
    ? hexToOklch(firstLocked.hex).h
    : hasBaseHue
      ? normalizeHue(options.baseHue as number)
      : Math.random() * 360;

  const hues = harmonyHues(rule, baseHue);
  const roleColors = buildRoleColors(hues, {
    chromaScale: options.chromaScale ?? 1,
    lightnessShift: options.lightnessShift ?? 0,
  });

  // Monochromatic reads best as a clean light→dark ramp; multi-hue palettes
  // look more designed when the tonal roles interleave across positions.
  const pool = rule === "monochromatic" ? roleColors : shuffled(roleColors);

  return { colors: assemble(pool, locked), harmony: rule };
};
