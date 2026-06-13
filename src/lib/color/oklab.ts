/**
 * sRGB ↔ OKLab conversion (Björn Ottosson's OKLab).
 * OKLab is perceptually uniform, which makes Euclidean distance a good proxy
 * for "how different do these colors look" — ideal for clustering (Phase 3).
 *
 * @see https://bottosson.github.io/posts/oklab/
 */

import { linearize } from "./contrast";
import { hexToRgb, rgbToHex, type RGB } from "./convert";

export interface OKLab {
  L: number;
  a: number;
  b: number;
}

/**
 * OKLCH — the cylindrical form of OKLab.
 *  - `L` lightness, 0 (black) → 1 (white). Perceptually uniform.
 *  - `C` chroma (colorfulness), 0 (gray) → ~0.37 at the sRGB gamut edge.
 *  - `h` hue angle in degrees, 0–360.
 *
 * This is the space the generator reasons in: independent, perceptual knobs for
 * "how light", "how colorful", and "which color", which HSL can't give you.
 */
export interface OKLCH {
  L: number;
  C: number;
  h: number;
}

/** Inverse sRGB companding: linear (0–1) → gamma-encoded channel (0–255). */
function delinearize(channel: number): number {
  const c =
    channel <= 0.0031308
      ? channel * 12.92
      : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
  return c * 255;
}

/** Convert an sRGB color (0–255 channels) to OKLab. */
export function srgbToOklab({ r, g, b }: RGB): OKLab {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/**
 * OKLab → *linear* sRGB (channels 0–1, **not** clamped — values can fall
 * outside [0,1] when the color is outside the sRGB gamut). Kept separate from
 * `oklabToSrgb` so gamut-testing can inspect the raw linear channels without
 * the `Math.pow` of a negative number that delinearizing would hit.
 */
function oklabToLinearRgb({ L, a, b }: OKLab): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/** Convert OKLab back to an sRGB color (0–255 channels, clamped by rgbToHex). */
export function oklabToSrgb(lab: OKLab): RGB {
  const { r, g, b } = oklabToLinearRgb(lab);
  return { r: delinearize(r), g: delinearize(g), b: delinearize(b) };
}

/** OKLab → `#rrggbb`. */
export const oklabToHex = (lab: OKLab): string => rgbToHex(oklabToSrgb(lab));

/** Chroma (colorfulness) of an OKLab color: distance from the neutral axis. */
export const chroma = ({ a, b }: OKLab): number => Math.hypot(a, b);

const DEG = Math.PI / 180;

/** OKLCH (cylindrical) → OKLab (rectangular). */
export const oklchToOklab = ({ L, C, h }: OKLCH): OKLab => ({
  L,
  a: C * Math.cos(h * DEG),
  b: C * Math.sin(h * DEG),
});

/** OKLab → OKLCH. Hue is normalized to 0–360. */
export const oklabToOklch = (lab: OKLab): OKLCH => ({
  L: lab.L,
  C: chroma(lab),
  h: (Math.atan2(lab.b, lab.a) / DEG + 360) % 360,
});

/** A linear-sRGB triple is displayable iff every channel sits within [0,1]. */
const inGamut = ({ r, g, b }: RGB): boolean => {
  const EPS = 1e-4;
  return (
    r >= -EPS && r <= 1 + EPS &&
    g >= -EPS && g <= 1 + EPS &&
    b >= -EPS && b <= 1 + EPS
  );
};

/**
 * OKLCH → `#rrggbb`, **gamut-mapped**.
 *
 * Requesting a vivid chroma at an extreme lightness (say a punchy yellow at
 * L=0.25) lands outside sRGB; naively converting then clamping per-channel
 * shifts the hue and muddies the color. Instead we keep L and h fixed and
 * binary-search the largest chroma that still fits the gamut — the standard
 * "reduce chroma to fit" mapping that preserves the color's identity.
 */
export function oklchToHex(L: number, C: number, h: number): string {
  const Lc = Math.max(0, Math.min(1, L));
  const linearAt = (c: number) => oklabToLinearRgb(oklchToOklab({ L: Lc, C: c, h }));

  let c = C;
  if (!inGamut(linearAt(C))) {
    let lo = 0;
    let hi = C;
    // ~18 iterations resolves chroma to < 1e-5 — visually exact.
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(linearAt(mid))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }

  return oklabToHex(oklchToOklab({ L: Lc, C: c, h }));
}

/** HEX → OKLCH, for reading the perceptual coordinates of an existing color. */
export const hexToOklch = (hex: string): OKLCH =>
  oklabToOklch(srgbToOklab(hexToRgb(hex)));
