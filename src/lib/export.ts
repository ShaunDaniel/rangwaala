import { readableTextColor } from "@/lib/color/contrast";

/**
 * Pure export builders. The string formats are deterministic and unit-tested;
 * `toPngBlob` is browser-only (it rasterizes via a canvas).
 */

/** CSS custom properties under `:root`. */
export function toCss(colors: string[]): string {
  const lines = colors.map((hex, i) => `  --color-${i + 1}: ${hex};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

/** Tailwind v4 `@theme` block with `--color-*` tokens. */
export function toTailwind(colors: string[]): string {
  const lines = colors.map((hex, i) => `  --color-brand-${i + 1}: ${hex};`);
  return `@theme {\n${lines.join("\n")}\n}`;
}

/** Pretty-printed JSON. */
export function toJson(colors: string[]): string {
  return JSON.stringify({ colors }, null, 2);
}

/** Render five labeled columns to a PNG blob (client-side only). */
export async function toPngBlob(
  colors: string[],
  { width = 1000, height = 360 }: { width?: number; height?: number } = {},
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const columnWidth = width / colors.length;
  colors.forEach((hex, i) => {
    const x = i * columnWidth;
    ctx.fillStyle = hex;
    ctx.fillRect(x, 0, columnWidth + 1, height); // +1 avoids seams from rounding

    ctx.fillStyle = readableTextColor(hex);
    ctx.font = "600 28px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(hex.toUpperCase(), x + columnWidth / 2, height - 36);
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png",
    );
  });
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
