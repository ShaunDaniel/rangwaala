/**
 * sRGB ↔ OKLab conversion (Björn Ottosson's OKLab).
 * OKLab is perceptually uniform, which makes Euclidean distance a good proxy
 * for "how different do these colors look" — ideal for clustering (Phase 3).
 *
 * @see https://bottosson.github.io/posts/oklab/
 */

import { linearize } from "./contrast";
import { rgbToHex, type RGB } from "./convert";

export interface OKLab {
  L: number;
  a: number;
  b: number;
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

/** Convert OKLab back to an sRGB color (0–255 channels, clamped by rgbToHex). */
export function oklabToSrgb({ L, a, b }: OKLab): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: delinearize(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: delinearize(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: delinearize(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/** OKLab → `#rrggbb`. */
export const oklabToHex = (lab: OKLab): string => rgbToHex(oklabToSrgb(lab));

/** Chroma (colorfulness) of an OKLab color: distance from the neutral axis. */
export const chroma = ({ a, b }: OKLab): number => Math.hypot(a, b);
