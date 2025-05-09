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
  const [palette, setPalette] = useState<{ colors: string[]; harmony: string }>({ 
    colors: [], 
    harmony: "" 
  });
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
    <div className={`flex flex-col md:flex-row min-h-screen relative ${lexendDeca.variable}`}>
      {/* Background beams (positioned behind content) */}
      <div className="absolute inset-0 -z-10">
        <GradientBackgroundBeams />
      </div>

      {/* Content section - Full width on mobile, half width on desktop */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center p-6 md:p-12 relative z-10">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-center md:text-left" style={{ fontFamily: "var(--font-lexend-deca)" }}>
            Colors for every mood
          </h1>
          <p className="text-base md:text-lg opacity-75 mb-8 md:mb-12 text-center md:text-left">
            Click on any color bar to copy its hex code to your clipboard.
          </p>

          <div className="flex justify-center md:justify-start">
            <motion.button 
              className="palette-button relative z-10" 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }} 
              onClick={regeneratePalette} 
              style={{ fontFamily: "var(--font-lexend-deca)" }}
            >
              Generate New Palette
            </motion.button>
          </div>
        </div>
      </div>

      {/* Color cards section - Full width on mobile, half width on desktop */}
      <div className="w-full md:w-1/2 flex flex-col justify-between relative z-20 gap-3 md:gap-4 p-6 md:px-4 md:pt-10 max-h-screen overflow-y-auto">
        {colors.map((color, index) => (
          <div key={index} className="flex-1 min-h-[5rem] md:min-h-[8rem]">
            <ColorCard color={color} onClick={() => copyToClipboard(color)} isCopied={copied === color} />
          </div>
        ))}
      </div>
    </div>
  );
}