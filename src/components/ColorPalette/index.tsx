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

        <header className="relative z-10 px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4 md:px-8 md:pb-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <TextAnimate
                as="h1"
                by="character"
                animation="blurInUp"
                once
                startOnView={false}
                className="font-display text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl"
              >
                Colors for every mood
              </TextAnimate>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ImageDrop onApply={applyFromImage} />
              <motion.button
                type="button"
                onClick={regeneratePalette}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="palette-button relative z-10 px-4 py-2 text-sm sm:px-8 sm:py-3 sm:text-base focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
              >
                Generate New Palette
              </motion.button>
            </div>
          </div>
        </header>

        {/* Full-bleed strip: five equal columns on desktop, stacked rows on mobile */}
        <div className="relative z-10 flex min-h-[60vh] flex-1 flex-col overflow-hidden sm:gap-2 sm:px-3 sm:pb-3 md:flex-row md:gap-0 md:px-0 md:pb-0">
          {state.colors.map((slot, index) => (
            <div key={index} className="flex flex-1 flex-col md:min-h-0">
              <ClickSpark className="flex flex-1 flex-col" sparkColor={readableTextColor(slot.hex)} sparkCount={10} sparkRadius={20}>
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
        </div>

        {/* Export button — sits at the bottom-center edge of the palette */}
        <div className="relative z-20 flex justify-center -mt-3">
          <ExportBar colors={hexes} />
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
