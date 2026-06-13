"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { Toaster } from "sonner";
import {
  usePalette,
  type PaletteInit,
  type PaletteSnapshot,
} from "@/hooks/usePalette";
import { useHotkeys } from "@/hooks/useHotkeys";
import { encodePalette } from "@/lib/url";
import { loadHistory, saveHistory } from "@/lib/history";
import { readableTextColor } from "@/lib/color/contrast";
import dynamic from "next/dynamic";
import { TextAnimate } from "@/components/ui/text-animate";
import ClickSpark from "@/components/ClickSpark";
import ColorCard from "@/components/ColorCard";
import ExportBar from "@/components/ExportBar";
import PaletteShowcase from "@/components/PaletteShowcase";
import HistoryStrip from "@/components/HistoryStrip";
import ImageDrop from "@/components/ImageDrop";

// The single background effect is the heaviest animation on the page and is
// purely decorative, so defer it out of the initial bundle and skip SSR.
const GradientBackgroundBeams = dynamic(
  () =>
    import("@/components/ui/GradientBackgroundBeams").then(
      (m) => m.GradientBackgroundBeams,
    ),
  { ssr: false },
);



export default function ColorPalette({ initial }: { initial: PaletteInit }) {
  const { state, dispatch } = usePalette(initial);
  const [copied, setCopied] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const router = useRouter();

  const hexes = useMemo(() => state.colors.map((c) => c.hex), [state.colors]);

  // Keep the shareable URL in sync, but don't replace on the initial mount.
  const encoded = useMemo(
    () => encodePalette(hexes),
    [hexes],
  );
  const skipFirstUrl = useRef(true);
  useEffect(() => {
    if (skipFirstUrl.current) {
      skipFirstUrl.current = false;
      return;
    }
    router.replace(encoded, { scroll: false });
  }, [encoded, router]);

  // Load persisted history once, then mirror state.history back to localStorage.
  const historyLoaded = useRef(false);
  useEffect(() => {
    const saved = loadHistory();
    if (saved.length) dispatch({ type: "SET_HISTORY", history: saved });
    historyLoaded.current = true;
  }, [dispatch]);
  useEffect(() => {
    if (historyLoaded.current) saveHistory(state.history);
  }, [state.history]);

  const regeneratePalette = useCallback(() => {
    dispatch({ type: "GENERATE" });
    setAnnouncement("New palette generated");
  }, [dispatch]);
  const toggleLock = useCallback(
    (index: number) => dispatch({ type: "TOGGLE_LOCK", index }),
    [dispatch],
  );
  useHotkeys({ onGenerate: regeneratePalette, onToggleLock: toggleLock });

  const restore = (snapshot: PaletteSnapshot) =>
    dispatch({ type: "RESTORE", snapshot });

  const applyFromImage = (extracted: string[]) => {
    dispatch({ type: "SET_FROM_IMAGE", hexes: extracted });
    setAnnouncement("Palette extracted from image");
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setAnnouncement(`Copied ${color.toUpperCase()}`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col">
        <Toaster position="bottom-center" richColors />

        {/* Screen-reader announcements for palette actions */}
        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>

        {/* Single background effect, breathing with the live palette */}
        <div className="absolute inset-0 -z-10">
          <GradientBackgroundBeams colors={hexes} />
        </div>

        <header className="relative z-10 px-4 pb-3 pt-5 sm:px-5 sm:pt-6 md:px-8 md:pb-4 md:pt-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            {/* Title block */}
            <div className="min-w-0">
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                once
                startOnView={false}
                className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl"
              >
                Colors for every mood
              </TextAnimate>
              <p className="mt-2 text-sm text-black/55 sm:text-base dark:text-white/55">
                Generate, lock, and remix — tap any swatch to copy its hex.
              </p>
            </div>

            {/* Actions: full-width on mobile (Generate fills), natural on desktop */}
            <div className="flex w-full shrink-0 items-stretch gap-2 sm:gap-3 md:w-auto">
              <ImageDrop onApply={applyFromImage} />
              <motion.button
                type="button"
                onClick={regeneratePalette}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="palette-button relative z-10 flex-1 px-4 py-3 text-sm sm:px-8 sm:text-base md:flex-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
              >
                Generate New Palette
              </motion.button>
            </div>
          </div>
        </header>

        {/* Palette strip. Mobile: a stack of rounded color bands with explicit
            heights, so the columns always fill cleanly (no gappy half-bands).
            md+: five equal, full-height, full-bleed columns. */}
        <div className="relative z-10 flex flex-col gap-2 px-3 pb-3 sm:gap-2.5 md:h-[calc(100dvh-12rem)] md:min-h-[24rem] md:flex-row md:gap-0 md:px-0 md:pb-0">
          {state.colors.map((slot, index) => (
            <div
              key={index}
              className="relative flex h-[clamp(4.75rem,14vh,7.5rem)] overflow-hidden rounded-2xl shadow-sm md:h-auto md:flex-1 md:rounded-none md:shadow-none"
            >
              <ClickSpark className="flex w-full" sparkColor={readableTextColor(slot.hex)} sparkCount={10} sparkRadius={20}>
                <ColorCard
                  color={slot.hex}
                  locked={slot.locked}
                  onClick={() => copyToClipboard(slot.hex)}
                  onToggleLock={() => toggleLock(index)}
                  isCopied={copied === slot.hex}
                />
              </ClickSpark>
            </div>
          ))}

          {/* Export / copy palette — pinned to the palette's bottom-right as a
              toolbar action, so it reads as intentional instead of floating. */}
          <div className="absolute bottom-3 right-3 z-30 md:bottom-4 md:right-4">
            <ExportBar colors={hexes} />
          </div>
        </div>

        {/* History strip — scrollable, below export */}
        {state.history.length > 0 && (
          <div className="relative z-10 px-4 py-2 md:px-8">
            <HistoryStrip history={state.history} onRestore={restore} />
          </div>
        )}

        {/* Keyboard shortcut legend */}
        <footer className="relative z-10 hidden items-center justify-center gap-2 py-2 text-xs opacity-70 sm:flex">
          <kbd className="rounded bg-black/10 px-1.5 py-0.5 dark:bg-white/15">Space</kbd>
          <span>generate</span>
          <span aria-hidden className="opacity-50">·</span>
          <kbd className="rounded bg-black/10 px-1.5 py-0.5 dark:bg-white/15">1–5</kbd>
          <span>lock</span>
        </footer>
      </div>

      <PaletteShowcase colors={hexes} />
    </MotionConfig>
  );
}
