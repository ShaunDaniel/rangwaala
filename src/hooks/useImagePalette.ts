"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractSwatches, type Swatch } from "@/lib/color/extract";
import type { ExtractResponse } from "@/workers/palette.worker";

export type ExtractStatus = "idle" | "extracting" | "error";

/** Decode + extract on the main thread (fallback when the worker is unavailable). */
async function extractOnMainThread(file: File): Promise<Swatch[]> {
  const bitmap = await createImageBitmap(file, { resizeWidth: 128 });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  bitmap.close();
  return extractSwatches(imageData);
}

/** Run one extraction through the worker, resolving on its reply. */
function extractViaWorker(worker: Worker, file: File): Promise<Swatch[]> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };
    const onMessage = (event: MessageEvent<ExtractResponse>) => {
      cleanup();
      if ("error" in event.data) reject(new Error(event.data.error));
      else resolve(event.data.swatches);
    };
    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || "Worker error"));
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage({ file });
  });
}

/**
 * Extract a palette from an image file, off the main thread when possible.
 * The image is decoded locally and never leaves the browser.
 */
export function useImagePalette() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<ExtractStatus>("idle");

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL("../workers/palette.worker.ts", import.meta.url),
      );
    } catch {
      // Turbopack worker bundling can misbehave — fall back to the main thread.
      workerRef.current = null;
    }
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const extract = useCallback(async (file: File): Promise<Swatch[]> => {
    setStatus("extracting");
    try {
      const worker = workerRef.current;
      let swatches: Swatch[];
      if (worker) {
        try {
          swatches = await extractViaWorker(worker, file);
        } catch {
          swatches = await extractOnMainThread(file);
        }
      } else {
        swatches = await extractOnMainThread(file);
      }
      setStatus("idle");
      return swatches;
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }, []);

  return { extract, status };
}
