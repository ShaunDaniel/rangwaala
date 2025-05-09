"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";

export default function ColorCard({ 
  color, 
  onClick, 
  isCopied = false 
}: { 
  color: string; 
  onClick: () => void; 
  isCopied: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="w-full h-full min-h-[8rem] rounded-xl shadow-lg cursor-pointer overflow-hidden flex items-center justify-center"
      style={{ 
        backgroundColor: color,
        color: color.startsWith('#5') || color.startsWith('#6') ? 
          "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
      }}
      whileHover={{ 
        scale: 1.02, 
        rotateX: 5, 
        rotateY: 5, 
        z: 50 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className="text-center font-mono text-base sm:text-xl md:text-2xl font-medium p-2 sm:p-4"
        initial={{ y: 0 }}
        animate={{ 
          y: isHovered ? -6 : 0,
          scale: isHovered ? 1.1 : 1
        }}
      >
        {isCopied ? (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold"
            style={{ fontFamily: "var(--font-lexend-deca)" }}
          >
            Copied!
          </motion.span>
        ) : (
          color
        )}
      </motion.div>
    </motion.div>
  );
}