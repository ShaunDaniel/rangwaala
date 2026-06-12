"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { type HarmonyRule } from "@/lib/color/generate";
import {
  usePalette,
  type PaletteInit,
  type PaletteSnapshot,
} from "@/hooks/usePalette";
import { useHotkeys } from "@/hooks/useHotkeys";
import { encodePalette } from "@/lib/url";
import { loadHistory, saveHistory } from "@/lib/history";
import { readableTextColor } from "@/lib/color/contrast";
import { GradientBackgroundBeams } from "@/components/ui/GradientBackgroundBeams";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextAnimate } from "@/components/ui/text-animate";
import ClickSpark from "@/components/ClickSpark";
import { Lexend_Deca } from "next/font/google";
import ColorCard from "@/components/ColorCard";
import HarmonySelector from "@/components/HarmonySelector";
import ExportBar from "@/components/ExportBar";
import HistoryStrip from "@/components/HistoryStrip";
import ImageDrop from "@/components/ImageDrop";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

const HARMONY_LABELS: Record<HarmonyRule | "image", string> = {
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  splitComplementary: "Split complementary",
  monochromatic: "Monochromatic",
  image: "From image",
};

export default function ColorPalette({ initial }: { initial: PaletteInit }) {
  const { state, dispatch } = usePalette(initial);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  const hexes = useMemo(() => state.colors.map((c) => c.hex), [state.colors]);

  // Keep the shareable URL in sync, but don't replace on the initial mount.
  const encoded = useMemo(
    () => encodePalette(hexes, state.harmony),
    [hexes, state.harmony],
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

  const regeneratePalette = useCallback(() => dispatch({ type: "GENERATE" }), [dispatch]);
  const toggleLock = useCallback(
    (index: number) => dispatch({ type: "TOGGLE_LOCK", index }),
    [dispatch],
  );
  useHotkeys({ onGenerate: regeneratePalette, onToggleLock: toggleLock });

  const restore = (snapshot: PaletteSnapshot) =>
    dispatch({ type: "RESTORE", snapshot });

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`relative flex min-h-[calc(100vh-4rem)] flex-col ${lexendDeca.variable}`}>
      <Toaster position="bottom-center" richColors />

      {/* Single background effect, breathing with the live palette */}
      <div className="absolute inset-0 -z-10">
        <GradientBackgroundBeams colors={hexes} />
      </div>

      <header className="relative z-10 px-6 pb-6 pt-8 md:px-12 md:pb-8 md:pt-10">
        <div className="mb-3 flex justify-center md:justify-start">
          <AnimatePresence mode="wait">
            <motion.span
              key={state.harmony}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="rounded-full border border-black/15 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-wide backdrop-blur-sm dark:border-white/15 dark:bg-black/40"
            >
              {HARMONY_LABELS[state.harmony]}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="max-w-xl">
            <TextAnimate
              as="h1"
              by="character"
              animation="blurInUp"
              once
              startOnView={false}
              className="text-3xl font-bold md:text-5xl"
              style={{ fontFamily: "var(--font-lexend-deca)" }}
            >
              Colors for every mood
            </TextAnimate>
            <p className="mt-3 text-base opacity-75 md:text-lg">
              Click any swatch to copy its hex.<br /> Press{" "}
              <kbd className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/15">
                Space
              </kbd>{" "}
              to generate,{" "}
              <kbd className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/15">
                1–5
              </kbd>{" "}
              to lock.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 md:items-end">
            <HarmonySelector
              value={state.mode}
              onChange={(harmony) => dispatch({ type: "SET_HARMONY", harmony })}
            />
            <div className="flex items-center gap-2">
              <ImageDrop
                onApply={(extracted) =>
                  dispatch({ type: "SET_FROM_IMAGE", hexes: extracted })
                }
              />
              <ShimmerButton
                onClick={regeneratePalette}
                background={hexes[0] ?? "#111111"}
                shimmerColor={readableTextColor(hexes[0] ?? "#111111")}
                className="relative z-10 text-sm font-medium"
                style={{
                  fontFamily: "var(--font-lexend-deca)",
                  color: readableTextColor(hexes[0] ?? "#111111"),
                }}
              >
                Generate New Palette
              </ShimmerButton>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <ExportBar colors={hexes} />
          <HistoryStrip history={state.history} onRestore={restore} />
        </div>
      </header>

      {/* Full-bleed strip: five equal columns on desktop, stacked rows on mobile */}
      <div className="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-6 md:flex-row md:gap-0 md:px-0 md:pb-0">
        {state.colors.map((slot, index) => (
          <div key={index} className="min-h-[4.5rem] flex-1 md:min-h-0">
            <ClickSpark sparkColor={readableTextColor(slot.hex)} sparkCount={10} sparkRadius={20}>
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
    </div>
  );
}
