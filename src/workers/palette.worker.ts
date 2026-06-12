/// <reference lib="webworker" />
import { extractPalette } from "../lib/color/extract";

export interface ExtractRequest {
  file: File;
}
export type ExtractResponse = { hexes: string[] } | { error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent<ExtractRequest>) => {
  try {
    const { file } = event.data;
    // Downscale on decode — extraction quality holds at a fraction of the cost.
    const bitmap = await createImageBitmap(file, { resizeWidth: 128 });
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("OffscreenCanvas 2D context unavailable");
    context.drawImage(bitmap, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    bitmap.close();

    const hexes = extractPalette(imageData);
    ctx.postMessage({ hexes } satisfies ExtractResponse);
  } catch (err) {
    ctx.postMessage({ error: (err as Error).message } satisfies ExtractResponse);
  }
};
