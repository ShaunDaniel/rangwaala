"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useImagePalette } from "@/hooks/useImagePalette";
import { readableTextColor } from "@/lib/color/contrast";

const MAX_BYTES = 20 * 1024 * 1024; // ~20 MB

export default function ImageDrop({
  onApply,
}: {
  onApply: (hexes: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hexes, setHexes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { extract, status } = useImagePalette();

  // Revoke the previous object URL whenever the preview changes or we unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const reset = useCallback(() => {
    setPreview(null);
    setHexes([]);
    setError(null);
    setDragging(false);
    dragCounter.current = 0;
  }, []);

  const close = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setError(null);
      setHexes([]);
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
        if (result.length === 0) setError("Couldn't read colors from that image.");
        else setHexes(result);
      } catch {
        setError("Couldn't decode that image — try a JPG or PNG.");
      }
    },
    [extract],
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
    if (hexes.length) {
      onApply(hexes);
      close();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/70 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:border-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:bg-black/50 dark:hover:border-white/30"
      >
        <ImagePlus size={15} />
        From image
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
              className="w-full max-w-md rounded-2xl bg-white p-5 text-black shadow-2xl dark:bg-neutral-900 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">
                  Palette from image
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
                {status === "extracting" ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <ImagePlus size={22} />
                )}
                <span className="opacity-80">
                  {status === "extracting"
                    ? "Reading colors…"
                    : "Drop, browse, or paste an image"}
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Selected upload preview"
                    className="mx-auto max-h-40 rounded-lg object-contain"
                  />
                  {hexes.length > 0 && (
                    <div className="mt-3 flex overflow-hidden rounded-lg">
                      {hexes.map((hex) => (
                        <div
                          key={hex}
                          className="flex h-12 flex-1 items-end justify-center pb-1 text-[10px] font-medium"
                          style={{
                            backgroundColor: hex,
                            color: readableTextColor(hex),
                            fontFamily: "var(--font-geist-mono), monospace",
                          }}
                        >
                          {hex.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={apply}
                disabled={hexes.length === 0}
                className="mt-4 w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-white dark:text-black"
              >
                Apply palette
              </button>

              <p className="mt-3 text-center text-xs opacity-60">
                The image never leaves your browser <br /> only the palette is saved or shared.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
