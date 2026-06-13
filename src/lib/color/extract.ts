import { rgbToHex } from "./convert";
import { chroma, oklabToHex, srgbToOklab, type OKLab } from "./oklab";

/** Minimal structural shape of a canvas `ImageData` (keeps the module testable). */
export interface ImageDataLike {
  data: Uint8ClampedArray | Uint8Array | number[];
  width: number;
  height: number;
}

export interface ExtractOptions {
  /** Number of colors to return (default 5). */
  count?: number;
  /** Number of k-means clusters (default 10). */
  k?: number;
  /** Max Lloyd iterations (default 10). */
  maxIterations?: number;
  /** Pixels below this alpha are skipped (default 125). */
  alphaThreshold?: number;
  /** Upper bound on sampled pixels for performance (default 16000). */
  maxSamples?: number;
}

interface Cluster {
  centroid: OKLab;
  population: number;
}

const EPSILON = 1e-6;
// Below this OKLab chroma the whole image reads as near-grayscale.
const GRAYSCALE_CHROMA = 0.02;

const sqDist = (p: OKLab, q: OKLab): number =>
  (p.L - q.L) ** 2 + (p.a - q.a) ** 2 + (p.b - q.b) ** 2;

/** Sample non-transparent pixels into OKLab, capped at `maxSamples`. */
function samplePixels(image: ImageDataLike, alphaThreshold: number, maxSamples: number): OKLab[] {
  const { data, width, height } = image;
  const totalPixels = width * height;
  if (totalPixels === 0) return [];

  const step = Math.max(1, Math.floor(totalPixels / maxSamples));
  const points: OKLab[] = [];
  for (let p = 0; p < totalPixels; p += step) {
    const i = p * 4;
    if (data[i + 3] < alphaThreshold) continue;
    points.push(srgbToOklab({ r: data[i], g: data[i + 1], b: data[i + 2] }));
  }
  return points;
}

/** k-means++ seeding: spread initial centroids proportional to squared distance. */
function seedCentroids(points: OKLab[], k: number): OKLab[] {
  const centroids: OKLab[] = [points[Math.floor(Math.random() * points.length)]];
  const nearest = new Array<number>(points.length).fill(Infinity);

  while (centroids.length < k) {
    const last = centroids[centroids.length - 1];
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      const d = sqDist(points[i], last);
      if (d < nearest[i]) nearest[i] = d;
      sum += nearest[i];
    }
    if (sum === 0) break; // all remaining points coincide with a centroid

    let threshold = Math.random() * sum;
    let idx = 0;
    for (; idx < points.length - 1; idx++) {
      threshold -= nearest[idx];
      if (threshold <= 0) break;
    }
    centroids.push(points[idx]);
  }
  return centroids;
}

/** Lloyd's algorithm until centroids settle or `maxIterations` is reached. */
function kmeans(points: OKLab[], k: number, maxIterations: number): Cluster[] {
  let centroids = seedCentroids(points, Math.min(k, points.length));

  const assignment = new Array<number>(points.length).fill(0);
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign each point to its nearest centroid.
    for (let i = 0; i < points.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = sqDist(points[i], centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      assignment[i] = best;
    }

    // Recompute centroids as the mean of their members.
    const sums = centroids.map(() => ({ L: 0, a: 0, b: 0, n: 0 }));
    for (let i = 0; i < points.length; i++) {
      const s = sums[assignment[i]];
      s.L += points[i].L;
      s.a += points[i].a;
      s.b += points[i].b;
      s.n += 1;
    }

    let movement = 0;
    const next = centroids.map((c, ci) => {
      const s = sums[ci];
      if (s.n === 0) return c;
      const moved = { L: s.L / s.n, a: s.a / s.n, b: s.b / s.n };
      movement += sqDist(c, moved);
      return moved;
    });
    centroids = next;
    if (movement < EPSILON) break;
  }

  // Final populations.
  const populations = new Array<number>(centroids.length).fill(0);
  for (let i = 0; i < points.length; i++) {
    let best = 0;
    let bestD = Infinity;
    for (let c = 0; c < centroids.length; c++) {
      const d = sqDist(points[i], centroids[c]);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    populations[best] += 1;
  }

  return centroids
    .map((centroid, i) => ({ centroid, population: populations[i] }))
    .filter((cluster) => cluster.population > 0);
}

/**
 * Choose `count` clusters by greedy farthest-point sampling, seeded by the
 * highest-scoring cluster (population × chroma). Diversity keeps the palette
 * from collapsing onto one dominant color; the score biases toward prominent,
 * colorful clusters.
 */
function selectClusters(clusters: Cluster[], count: number): Cluster[] {
  const maxChroma = Math.max(...clusters.map((c) => chroma(c.centroid)));
  const grayscale = maxChroma < GRAYSCALE_CHROMA;

  // Near-grayscale: ignore (flat) chroma, score & diversify on lightness instead.
  const score = (c: Cluster) =>
    grayscale ? c.population : c.population * chroma(c.centroid);
  const distance = grayscale
    ? (p: OKLab, q: OKLab) => Math.abs(p.L - q.L)
    : (p: OKLab, q: OKLab) => Math.sqrt(sqDist(p, q));

  const remaining = [...clusters];
  const selected: Cluster[] = [];

  // Seed with the most prominent/colorful cluster.
  let firstIdx = 0;
  for (let i = 1; i < remaining.length; i++) {
    if (score(remaining[i]) > score(remaining[firstIdx])) firstIdx = i;
  }
  selected.push(remaining.splice(firstIdx, 1)[0]);

  while (selected.length < count && remaining.length > 0) {
    let bestIdx = 0;
    let bestValue = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const minDist = Math.min(
        ...selected.map((s) => distance(remaining[i].centroid, s.centroid)),
      );
      const value = minDist * Math.sqrt(score(remaining[i]) + EPSILON);
      if (value > bestValue) {
        bestValue = value;
        bestIdx = i;
      }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }

  return selected;
}

/**
 * Extract a palette from raw image pixels, entirely in OKLab space.
 * Returns up to `count` distinct hexes in prominence order (most populous first).
 */
export function extractPalette(image: ImageDataLike, opts: ExtractOptions = {}): string[] {
  const {
    count = 5,
    k = 10,
    maxIterations = 10,
    alphaThreshold = 125,
    maxSamples = 16000,
  } = opts;

  const points = samplePixels(image, alphaThreshold, maxSamples);
  if (points.length === 0) return [];

  const clusters = kmeans(points, k, maxIterations);
  const selected = selectClusters(clusters, count);

  // Prominence order, de-duplicated (collapsed clusters can share a hex).
  const ordered = [...selected].sort((a, b) => b.population - a.population);
  const hexes: string[] = [];
  for (const cluster of ordered) {
    const hex = oklabToHex(cluster.centroid);
    if (!hexes.includes(hex)) hexes.push(hex);
  }
  return hexes;
}

/** A palette color paired with where in the image it was sampled from. */
export interface Swatch {
  /** `#rrggbb` of the representative pixel. */
  hex: string;
  /** Normalized horizontal position in the source image, 0 (left) → 1 (right). */
  x: number;
  /** Normalized vertical position in the source image, 0 (top) → 1 (bottom). */
  y: number;
}

/** A sampled pixel: its OKLab (for clustering), raw RGB, and image position. */
interface CoordSample {
  lab: OKLab;
  r: number;
  g: number;
  b: number;
  x: number;
  y: number;
}

/** Like `samplePixels`, but keeps each pixel's RGB and normalized coordinates. */
function sampleWithCoords(
  image: ImageDataLike,
  alphaThreshold: number,
  maxSamples: number,
): CoordSample[] {
  const { data, width, height } = image;
  const totalPixels = width * height;
  if (totalPixels === 0) return [];

  const step = Math.max(1, Math.floor(totalPixels / maxSamples));
  const denomX = Math.max(1, width - 1);
  const denomY = Math.max(1, height - 1);
  const samples: CoordSample[] = [];
  for (let p = 0; p < totalPixels; p += step) {
    const i = p * 4;
    if (data[i + 3] < alphaThreshold) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    samples.push({
      lab: srgbToOklab({ r, g, b }),
      r,
      g,
      b,
      x: (p % width) / denomX,
      y: Math.floor(p / width) / denomY,
    });
  }
  return samples;
}

/**
 * Extract a palette *with provenance*: each returned color is the actual pixel
 * nearest the cluster it represents, tagged with its normalized position in the
 * image. This lets the UI show — and let the user drag — exactly where each
 * color came from, re-sampling as the point moves.
 */
export function extractSwatches(
  image: ImageDataLike,
  opts: ExtractOptions = {},
): Swatch[] {
  const {
    count = 5,
    k = 10,
    maxIterations = 10,
    alphaThreshold = 125,
    maxSamples = 16000,
  } = opts;

  const samples = sampleWithCoords(image, alphaThreshold, maxSamples);
  if (samples.length === 0) return [];

  const clusters = kmeans(
    samples.map((s) => s.lab),
    k,
    maxIterations,
  );
  const selected = selectClusters(clusters, count);
  const ordered = [...selected].sort((a, b) => b.population - a.population);

  const swatches: Swatch[] = [];
  for (const cluster of ordered) {
    // The most representative pixel is the sampled pixel closest to the centroid.
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = sqDist(samples[i].lab, cluster.centroid);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const s = samples[bestIdx];
    const hex = rgbToHex({ r: s.r, g: s.g, b: s.b });
    if (!swatches.some((w) => w.hex === hex)) {
      swatches.push({ hex, x: s.x, y: s.y });
    }
  }
  return swatches;
}
