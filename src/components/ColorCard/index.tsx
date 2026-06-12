"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { contrastRatio, readableTextColor } from "@/lib/color/contrast";

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
  const ratio = contrastRatio(color, textColor === "#000" ? "#000000" : "#ffffff");
  const tag = contrastTag(ratio);

  return (
    <motion.div
      className="relative flex h-full min-h-[4.5rem] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl shadow-lg md:min-h-0 md:rounded-none md:shadow-none"
      style={{
        backgroundColor: color,
        color: textColor,
        boxShadow: locked ? `inset 0 0 0 3px ${textColor}` : undefined,
      }}
      whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5, z: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Lock toggle */}
      <button
        type="button"
        aria-pressed={locked}
        aria-label={`${locked ? "Unlock" : "Lock"} ${color.toUpperCase()}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock();
        }}
        className="absolute right-2 top-2 z-10 rounded-full p-2 transition-opacity hover:bg-current/10"
        style={{ color: textColor, opacity: locked || isHovered ? 1 : 0.45 }}
      >
        {locked ? <Lock size={16} /> : <LockOpen size={16} />}
      </button>

      {/* Contrast badge */}
      <span
        className="absolute bottom-2 left-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
        style={{ color: textColor, opacity: 0.7 }}
      >
        {ratio.toFixed(2)} {tag}
      </span>

      <motion.div
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
            style={{ fontFamily: "var(--font-lexend-deca)" }}
          >
            Copied!
          </motion.span>
        ) : (
          color.toUpperCase()
        )}
      </motion.div>
    </motion.div>
  );
}
