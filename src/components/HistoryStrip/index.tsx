"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PaletteSnapshot } from "@/hooks/usePalette";

export default function HistoryStrip({
  history,
  onRestore,
}: {
  history: PaletteSnapshot[];
  onRestore: (snapshot: PaletteSnapshot) => void;
}) {
  if (history.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <AnimatePresence initial={false}>
        {history.map((snapshot) => (
          <motion.button
            key={`${snapshot.timestamp}-${snapshot.colors.join("")}`}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            onClick={() => onRestore(snapshot)}
            aria-label={`Restore palette ${snapshot.colors.join(", ")}`}
            title={snapshot.colors.join(" · ")}
            className="flex h-8 shrink-0 overflow-hidden rounded-md border border-black/10 shadow-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/10"
          >
            {snapshot.colors.map((hex, i) => (
              <span
                key={i}
                className="block h-full w-4"
                style={{ backgroundColor: hex }}
              />
            ))}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
