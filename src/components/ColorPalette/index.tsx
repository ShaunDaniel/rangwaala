"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type HarmonyRule } from "@/lib/color/generate";
import { usePalette } from "@/hooks/usePalette";
import { useHotkeys } from "@/hooks/useHotkeys";
import { GradientBackgroundBeams } from "@/components/ui/GradientBackgroundBeams";
import { Lexend_Deca } from "next/font/google";
import ColorCard from "@/components/ColorCard";

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

export default function ColorPalette() {
  const { state, dispatch } = usePalette();
  const [copied, setCopied] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Randomize once on mount (SSR renders the deterministic fallback first).
  useEffect(() => {
    dispatch({ type: "GENERATE" });
    setReady(true);
  }, [dispatch]);

  const regeneratePalette = useCallback(() => dispatch({ type: "GENERATE" }), [dispatch]);
  const toggleLock = useCallback(
    (index: number) => dispatch({ type: "TOGGLE_LOCK", index }),
    [dispatch],
  );
  useHotkeys({ onGenerate: regeneratePalette, onToggleLock: toggleLock });

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`relative flex min-h-[calc(100vh-4rem)] flex-col ${lexendDeca.variable}`}>
      {/* Single background effect, breathing with the live palette */}
      <div className="absolute inset-0 -z-10">
        <GradientBackgroundBeams colors={state.colors.map((c) => c.hex)} />
      </div>

      <header className="relative z-10 px-6 pb-6 pt-10 md:px-12 md:pb-8 md:pt-14">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="max-w-xl">
            <div
              className="mb-3 flex justify-center md:justify-start"
              style={{ opacity: ready ? 1 : 0 }}
            >
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
            <h1
              className="text-3xl font-bold md:text-5xl"
              style={{ fontFamily: "var(--font-lexend-deca)" }}
            >
              Colors for every mood
            </h1>
            <p className="mt-3 text-base opacity-75 md:text-lg">
              Click any swatch to copy its hex code. Press{" "}
              <kbd className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/15">
                Space
              </kbd>{" "}
              to generate.
            </p>
          </div>

          <motion.button
            className="palette-button relative z-10 shrink-0"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={regeneratePalette}
            style={{ fontFamily: "var(--font-lexend-deca)" }}
          >
            Generate New Palette
          </motion.button>
        </div>
      </header>

      {/* Full-bleed strip: five equal columns on desktop, stacked rows on mobile */}
      <div className="relative z-10 flex flex-1 flex-col gap-3 px-4 pb-6 md:flex-row md:gap-0 md:px-0 md:pb-0">
        {state.colors.map((slot, index) => (
          <div key={index} className="min-h-[4.5rem] flex-1 md:min-h-0">
            <ColorCard
              color={slot.hex}
              onClick={() => copyToClipboard(slot.hex)}
              isCopied={copied === slot.hex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
