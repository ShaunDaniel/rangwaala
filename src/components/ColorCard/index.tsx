"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { contrastRatio, readableTextColor } from "@/lib/color/contrast";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";

function contrastTag(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

export default function ColorCard({
  color,
  locked = false,
  onClick,
  onToggleLock,
  isCopied = false,
}: {
  color: string;
  locked?: boolean;
  onClick: () => void;
  onToggleLock: () => void;
  isCopied: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const textColor = readableTextColor(color);
  const hex = color.toUpperCase();

  // Which text colors are actually usable on this swatch? (≥ 4.5 = AA pass.)
  // This is the question a designer is really asking, and it varies per color —
  // unlike the auto-picked label, which is always readable by construction.
  const onBlack = contrastRatio(color, "#000000");
  const onWhite = contrastRatio(color, "#ffffff");

  return (
    <motion.div
      className="relative flex h-full min-h-[4.5rem] w-full items-center justify-center overflow-hidden rounded-xl shadow-lg md:min-h-0 md:rounded-none md:shadow-none"
      style={{ backgroundColor: color, color: textColor }}
      whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5, z: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Locked indicator: a beam traces the card's border */}
      {locked && (
        <BorderBeam
          size={90}
          duration={5}
          borderWidth={2}
          colorFrom={textColor}
          colorTo={`${textColor}00`}
        />
      )}

      {/* The swatch itself is the copy button (fills the card) */}
      <button
        type="button"
        onClick={onClick}
        aria-label={`Copy ${hex}`}
        className="absolute inset-0 z-0 flex cursor-pointer items-center justify-center rounded-[inherit] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px]"
        style={{ outlineColor: textColor }}
      >
        <motion.span
          className="p-2 text-center text-base font-medium sm:p-4 sm:text-xl md:text-2xl"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          initial={{ y: 0 }}
          animate={{ y: isHovered ? -6 : 0, scale: isHovered ? 1.1 : 1 }}
        >
          {isCopied ? (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold sm:text-2xl md:text-3xl"
            >
              Copied!
            </motion.span>
          ) : (
            hex
          )}
        </motion.span>
      </button>

      {/* Lock toggle — sibling of the swatch button, layered above it */}
      <button
        type="button"
        aria-pressed={locked}
        aria-label={`${locked ? "Unlock" : "Lock"} ${hex}`}
        onClick={onToggleLock}
        className="absolute right-2 top-2 z-20 rounded-full p-2 transition-opacity hover:bg-current/10 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: textColor, outlineColor: textColor, opacity: locked || isHovered ? 1 : 0.45 }}
      >
        {locked ? <Lock size={16} /> : <LockOpen size={16} />}
      </button>

      {/* Text-usability badge: shows whether black / white text works on this
          swatch. The dimmed "Aa" is the one that fails — legibility you can
          see. Hover/focus reveals the exact ratios. */}
      <div
        tabIndex={0}
        role="img"
        aria-label={`Black text ${onBlack.toFixed(1)} to 1 (${contrastTag(
          onBlack,
        )}), white text ${onWhite.toFixed(1)} to 1 (${contrastTag(onWhite)})`}
        className="group/badge absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded outline-none"
      >
        <span
          className="text-sm font-bold leading-none"
          style={{ color: "#000000", opacity: onBlack >= 4.5 ? 1 : 0.28 }}
        >
          Aa
        </span>
        <span
          className="text-sm font-bold leading-none"
          style={{ color: "#ffffff", opacity: onWhite >= 4.5 ? 1 : 0.28 }}
        >
          Aa
        </span>

        {/* Tooltip: exact ratios + grades on hover or keyboard focus */}
        <span
          className="pointer-events-none absolute bottom-full left-0 mb-1.5 flex w-max flex-col gap-0.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium leading-tight opacity-0 shadow-md transition-opacity duration-150 group-hover/badge:opacity-100 group-focus-visible/badge:opacity-100"
          style={{ backgroundColor: textColor, color }}
        >
          <span className="flex items-center gap-1">
            Black text{" "}
            <NumberTicker
              value={onBlack}
              decimalPlaces={1}
              className="text-[10px] leading-none tracking-normal"
              style={{ color }}
            />
            :1 · {contrastTag(onBlack)}
          </span>
          <span className="flex items-center gap-1">
            White text{" "}
            <NumberTicker
              value={onWhite}
              decimalPlaces={1}
              className="text-[10px] leading-none tracking-normal"
              style={{ color }}
            />
            :1 · {contrastTag(onWhite)}
          </span>
        </span>
      </div>
    </motion.div>
  );
}
