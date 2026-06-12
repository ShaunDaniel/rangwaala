"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { readableTextColor } from "@/lib/color/contrast";

export default function ColorCard({
  color,
  onClick,
  isCopied = false,
}: {
  color: string;
  onClick: () => void;
  isCopied: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const textColor = readableTextColor(color);

  return (
    <motion.div
      className="flex h-full min-h-[4.5rem] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl shadow-lg md:min-h-0 md:rounded-none md:shadow-none"
      style={{ backgroundColor: color, color: textColor }}
      whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5, z: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
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
