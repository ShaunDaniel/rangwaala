"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { generatePalette } from "@/utils/colorGenerator";
import { GradientBackgroundBeams } from "@/components/ui/GradientBackgroundBeams";
import { Lexend_Deca } from "next/font/google";
import ColorCard from "@/components/ColorCard";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

export default function ColorPalette() {
  const [palette, setPalette] = useState({ colors: [], harmony: "" });
  const [copied, setCopied] = useState<string | null>(null);

  // Generate palette on initial load
  useEffect(() => {
    setPalette(generatePalette());
  }, []);

  const regeneratePalette = () => {
    setPalette(generatePalette());
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  // Use first 4 colors from palette, or a default set if not enough
  const colors = palette.colors.length >= 4 ? palette.colors.slice(0, 4) : ["#a1d2ce", "#78cad2", "#62a8ac", "#5497a7"];

  if (!colors.length) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`flex min-h-screen relative ${lexendDeca.variable}`}>
      {/* Background beams (positioned behind content) */}
      <div className="absolute inset-0 -z-10">
        <GradientBackgroundBeams />
      </div>

      {/* Left side - Content and button */}
      <div className="w-1/2 flex flex-col items-start justify-center p-12 relative z-10">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-lexend-deca)" }}>
            Colors for every mood
          </h1>
          <p className="text-lg opacity-75 mb-12">Click on any color bar to copy its hex code to your clipboard.</p>

          <motion.button className="palette-button relative z-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={regeneratePalette} style={{ fontFamily: "var(--font-lexend-deca)" }}>
            Generate New Palette
          </motion.button>
        </div>
      </div>

      <div className="w-1/2 flex flex-col justify-between relative z-20 gap-4 px-4 pt-10 h-screen">
        {colors.map((color, index) => (
          <div key={index} className="flex-1">
            <ColorCard color={color} onClick={() => copyToClipboard(color)} isCopied={copied === color} />
          </div>
        ))}
      </div>
    </div>
  );
}
