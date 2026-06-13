"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useImagePalette } from "@/hooks/useImagePalette";
import { readableTextColor } from "@/lib/color/contrast";
import { rgbToHex } from "@/lib/color/convert";
import type { Swatch } from "@/lib/color/extract";

const MAX_BYTES = 20 * 1024 * 1024; // ~20 MB

/** Decoded-image pixel buffer used to read colors live as a point is dragged. */
interface SampleBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export default function ImageDrop({
  onApply,
}: {
  onApply: (hexes: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // The element that exactly wraps the displayed image — pointer coordinates
  // are measured against its bounds so markers stay pixel-aligned.
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const sampleRef = useRef<SampleBuffer | null>(null);
  // The decoded image kept as a canvas so the loupe can draw a zoomed crop.
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingPoint = useRef<number | null>(null);
  const { extract, status } = useImagePalette();

  // Source pixels visible across the loupe, and the loupe's pixel resolution.
  const LOUPE_VIEW = 15;
  const LOUPE_SIZE = 132;

  // Revoke the previous object URL whenever the preview changes or we unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const reset = useCallback(() => {
    setPreview(null);
    setSwatches([]);
    setError(null);
    setDragging(false);
    setActivePoint(null);
    dragCounter.current = 0;
    draggingPoint.current = null;
    sampleRef.current = null;
    sourceCanvasRef.current = null;
  }, []);

  const close = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setError(null);
      setSwatches([]);
      sampleRef.current = null;
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("That image is over 20 MB — try a smaller one.");
        return;
      }
      setPreview(URL.createObjectURL(file));
      try {
        const result = await extract(file);
        if (result.length === 0) {
          setError("Couldn't read colors from that image.");
          return;
        }
        // Decode a modest-resolution copy to read pixel colors while dragging.
        try {
          const bitmap = await createImageBitmap(file, { resizeWidth: 640 });
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
            sampleRef.current = {
              data: id.data,
              width: canvas.width,
              height: canvas.height,
            };
            sourceCanvasRef.current = canvas;
          }
          bitmap.close();
        } catch {
          // Sampling is a nicety; the palette still applies without it.
        }
        setSwatches(result);
      } catch {
        setError("Couldn't decode that image — try a JPG or PNG.");
      }
    },
    [extract],
  );

  /** Read an averaged 3×3 color at a normalized (0–1) position in the image. */
  const sampleAt = useCallback((nx: number, ny: number): string | null => {
    const buf = sampleRef.current;
    if (!buf) return null;
    const { data, width, height } = buf;
    const cx = Math.round(nx * (width - 1));
    const cy = Math.round(ny * (height - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = Math.min(width - 1, Math.max(0, cx + dx));
        const y = Math.min(height - 1, Math.max(0, cy + dy));
        const i = (y * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n += 1;
      }
    }
    return rgbToHex({ r: r / n, g: g / n, b: b / n });
  }, []);

  /** Paint a pixelated, crosshaired zoom of the area around (nx, ny). */
  const drawLoupe = useCallback((nx: number, ny: number) => {
    const src = sourceCanvasRef.current;
    const loupe = loupeCanvasRef.current;
    if (!src || !loupe) return;
    const ctx = loupe.getContext("2d");
    if (!ctx) return;

    const { width, height } = src;
    const cx = nx * (width - 1);
    const cy = ny * (height - 1);
    // Top-left of the source crop, clamped to stay inside the image.
    const sx = Math.min(width - LOUPE_VIEW, Math.max(0, cx - LOUPE_VIEW / 2));
    const sy = Math.min(height - LOUPE_VIEW, Math.max(0, cy - LOUPE_VIEW / 2));

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    ctx.drawImage(
      src,
      sx,
      sy,
      LOUPE_VIEW,
      LOUPE_VIEW,
      0,
      0,
      LOUPE_SIZE,
      LOUPE_SIZE,
    );

    // Highlight the exact center pixel, wherever it lands after clamping.
    const cell = LOUPE_SIZE / LOUPE_VIEW;
    const px = ((cx - sx) / LOUPE_VIEW) * LOUPE_SIZE;
    const py = ((cy - sy) / LOUPE_VIEW) * LOUPE_SIZE;
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 3;
    ctx.strokeRect(px - cell / 2, py - cell / 2, cell, cell);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px - cell / 2, py - cell / 2, cell, cell);
  }, []);

  /** Move point `index` to the pointer, re-sampling the color underneath it. */
  const movePoint = useCallback(
    (index: number, clientX: number, clientY: number) => {
      const box = imageBoxRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const ny = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      const hex = sampleAt(nx, ny);
      setSwatches((prev) =>
        prev.map((s, i) =>
          i === index ? { hex: hex ?? s.hex, x: nx, y: ny } : s,
        ),
      );
      drawLoupe(nx, ny);
    },
    [sampleAt, drawLoupe],
  );

  // Paste-from-clipboard while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((it) =>
        it.type.startsWith("image/"),
      );
      if (item) handleFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, handleFile]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) setDragging(false);
  };

  const apply = () => {
    if (swatches.length) {
      onApply(swatches.map((s) => s.hex));
      close();
    }
  };

  // The point currently being dragged drives the loupe; park it on the side
  // opposite the point so a finger/cursor never covers the magnified view.
  const activeSwatch =
    activePoint !== null ? (swatches[activePoint] ?? null) : null;
  const loupeOnLeft = activeSwatch ? activeSwatch.x > 0.6 : false;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/70 px-2.5 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:border-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-3 dark:border-white/15 dark:bg-black/50 dark:hover:border-white/30"
        aria-label="Extract palette from image"
      >
        <ImagePlus size={15} />
        <span className="hidden sm:inline">from image</span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Extract a palette from an image"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <div
              className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white p-5 text-black shadow-2xl transition-[max-width] duration-300 dark:bg-neutral-900 dark:text-white ${preview ? "max-w-2xl sm:p-6" : "max-w-md"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">
                  palette from image
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="rounded-full p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body — scrollbar hidden so growing the modal never
                  shows an ugly bar; the footer below stays pinned. */}
              <div className="scrollbar-hide -mx-1 min-h-0 flex-1 overflow-y-auto px-1">
                {!preview && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDrop={onDrop}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center text-sm transition-colors ${dragging
                      ? "border-black/50 bg-black/5 dark:border-white/50 dark:bg-white/5"
                      : "border-black/20 dark:border-white/20"
                      }`}
                  >
                    <ImagePlus size={22} />
                    <span className="opacity-80">
                      drop, browse, or paste an image
                    </span>
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

                {preview && (
                  <div className="mt-1">
                    {/* Image + draggable sample points. The wrapper hugs the
                      image so a point's % position maps to the right pixel. */}
                    <div
                      ref={imageBoxRef}
                      className="relative mx-auto w-fit touch-none select-none"
                    >
                      <img
                        src={preview}
                        alt="Selected upload preview"
                        draggable={false}
                        className="block max-h-[50vh] max-w-full rounded-lg"
                      />

                      {status === "extracting" && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 text-white">
                          <Loader2 className="animate-spin" size={22} />
                        </div>
                      )}

                      {swatches.map((s, index) => {
                        const ink = readableTextColor(s.hex);
                        const active = activePoint === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Sample point ${index + 1}: ${s.hex.toUpperCase()}. Drag to adjust.`}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.currentTarget.setPointerCapture(e.pointerId);
                              draggingPoint.current = index;
                              setActivePoint(index);
                              drawLoupe(s.x, s.y);
                            }}
                            onPointerMove={(e) => {
                              if (draggingPoint.current === index) {
                                movePoint(index, e.clientX, e.clientY);
                              }
                            }}
                            onPointerUp={(e) => {
                              e.currentTarget.releasePointerCapture(e.pointerId);
                              draggingPoint.current = null;
                              setActivePoint(null);
                            }}
                            onPointerCancel={() => {
                              draggingPoint.current = null;
                              setActivePoint(null);
                            }}
                            className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full text-[10px] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.4)] ring-2 ring-white transition-transform active:cursor-grabbing dark:ring-neutral-900"
                            style={{
                              left: `${s.x * 100}%`,
                              top: `${s.y * 100}%`,
                              backgroundColor: s.hex,
                              color: ink,
                              zIndex: active ? 20 : 10,
                              transform: `translate(-50%, -50%) scale(${active ? 1.25 : 1})`,
                            }}
                          >
                            {index + 1}
                          </button>
                        );
                      })}

                      {/* Magnifier loupe — pixel-zoom of the active point, with a
                        crosshair on the exact pixel being sampled. Always
                        mounted (so its canvas ref exists) but only shown while
                        a point is being dragged. */}
                      <div
                        className={`pointer-events-none absolute top-2 z-30 flex flex-col items-center gap-1 transition-opacity duration-150 ${loupeOnLeft ? "left-2" : "right-2"
                          }`}
                        style={{ opacity: activeSwatch ? 1 : 0 }}
                      >
                        <canvas
                          ref={loupeCanvasRef}
                          width={LOUPE_SIZE}
                          height={LOUPE_SIZE}
                          className="h-28 w-28 rounded-full border-2 border-white bg-neutral-200 shadow-lg ring-1 ring-black/20 dark:border-neutral-800 dark:bg-neutral-700"
                        />
                        {activeSwatch && (
                          <span
                            className="rounded-md px-2 py-0.5 text-[11px] font-semibold shadow"
                            style={{
                              backgroundColor: activeSwatch.hex,
                              color: readableTextColor(activeSwatch.hex),
                              fontFamily: "var(--font-geist-mono), monospace",
                            }}
                          >
                            {activeSwatch.hex.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {swatches.length > 0 && (
                      <>
                        <p className="mt-3 text-center text-xs opacity-60">
                          drag the numbered points to fine-tune each color.
                        </p>
                        {/* Live swatch row, kept in sync with the points */}
                        <div className="mt-2 flex overflow-hidden rounded-lg">
                          {swatches.map((s, index) => (
                            <div
                              key={index}
                              className="flex h-12 flex-1 items-end justify-center pb-1 text-[10px] font-medium"
                              style={{
                                backgroundColor: s.hex,
                                color: readableTextColor(s.hex),
                                fontFamily: "var(--font-geist-mono), monospace",
                              }}
                            >
                              {s.hex.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Pinned footer — always visible, no scrolling needed to apply. */}
              <div className="shrink-0 pt-4">
                {preview && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="mb-2 w-full rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:border-black/40 dark:border-white/15 dark:hover:border-white/40"
                  >
                    choose a different image
                  </button>
                )}
                <button
                  type="button"
                  onClick={apply}
                  disabled={swatches.length === 0}
                  className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-white dark:text-black"
                >
                  apply palette
                </button>
                <p className="mt-3 text-center text-xs opacity-60">
                  the image never leaves your browser <br /> only the palette is
                  saved or shared.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
