"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generatePalette, type HarmonyRule } from "@/lib/color/generate";
import { GradientBackgroundBeams } from "@/components/ui/GradientBackgroundBeams";
import { Lexend_Deca } from "next/font/google";
import ColorCard from "@/components/ColorCard";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

const HARMONY_LABELS: Record<HarmonyRule, string> = {
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  splitComplementary: "Split complementary",
  monochromatic: "Monochromatic",
};

export default function ColorPalette() {
  const [palette, setPalette] = useState<{ colors: string[]; harmony: HarmonyRule | "" }>({
    colors: [],
    harmony: "",
  });
  const [copied, setCopied] = useState<string | null>(null);

  // Generate the first palette on the client to avoid a hydration mismatch.
  useEffect(() => {
    setPalette(generatePalette());
  }, []);

  const regeneratePalette = () => setPalette(generatePalette());

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!palette.colors.length) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-[calc(100vh-4rem)] flex-col ${lexendDeca.variable}`}>
      {/* Single background effect, breathing with the live palette */}
      <div className="absolute inset-0 -z-10">
        <GradientBackgroundBeams colors={palette.colors} />
      </div>

      <header className="relative z-10 px-6 pb-6 pt-10 md:px-12 md:pb-8 md:pt-14">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="max-w-xl">
            <div className="mb-3 flex justify-center md:justify-start">
              <AnimatePresence mode="wait">
                <motion.span
                  key={palette.harmony}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-full border border-black/15 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-wide backdrop-blur-sm dark:border-white/15 dark:bg-black/40"
                >
                  {palette.harmony ? HARMONY_LABELS[palette.harmony] : ""}
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
              Click any swatch to copy its hex code to your clipboard.
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
        {palette.colors.map((color, index) => (
          <div key={index} className="min-h-[4.5rem] flex-1 md:min-h-0">
            <ColorCard
              color={color}
              onClick={() => copyToClipboard(color)}
              isCopied={copied === color}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
