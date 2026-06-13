"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { generateFamilyPalettes, slug, type Family } from "@/lib/families";
import { encodePalette } from "@/lib/url";
import { readableTextColor } from "@/lib/color/contrast";
import type { ColorPalette } from "@/lib/color/generate";

// A modest batch (three desktop rows) so each "Show me more!" press grows the
// section by a satisfying chunk that animates in smoothly, rather than dumping
// 50 at once.
const BATCH = 9;

export default function FamilyGroup({
  family,
  initialPalettes,
}: {
  family: Family;
  initialPalettes: ColorPalette[];
}) {
  const [palettes, setPalettes] = useState<ColorPalette[]>(initialPalettes);
  // Index at which the most recent batch starts, so only the new cards animate
  // in (the existing ones stay put).
  const [batchStart, setBatchStart] = useState(initialPalettes.length);

  const showMore = () => {
    setBatchStart(palettes.length);
    setPalettes((prev) => [...prev, ...generateFamilyPalettes(family, BATCH)]);
  };

  return (
    <section id={slug(family.name)} className="scroll-mt-40">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold md:text-2xl">
        <span
          className="inline-block h-4 w-4 rounded-full ring-1 ring-black/10 dark:ring-white/15"
          style={{ backgroundColor: family.swatch }}
        />
        {family.name}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {palettes.map((palette, i) => {
          const isNew = i >= batchStart;
          return (
            <motion.div
              key={i}
              // Only freshly-added cards animate; the initial render and
              // already-visible cards mount in place.
              initial={isNew ? { opacity: 0, y: 18, scale: 0.97 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: isNew ? ((i - batchStart) % BATCH) * 0.05 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/${encodePalette(palette.colors)}`}
                aria-label={`Open this ${family.name.toLowerCase()} palette in the generator`}
                className="group block overflow-hidden rounded-2xl border border-black/5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/10"
              >
                <div className="flex h-28 sm:h-24 md:h-28">
                  {palette.colors.map((hex, j) => (
                    <div
                      key={j}
                      className="flex flex-1 items-end justify-center pb-2"
                      style={{ backgroundColor: hex, color: readableTextColor(hex) }}
                    >
                      <span className="text-[10px] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-90">
                        {hex.replace("#", "").toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end px-3 py-2 text-xs">
                  <span className="opacity-50 transition-opacity group-hover:opacity-90">
                    open →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-center">
        <motion.button
          type="button"
          onClick={showMore}
          whileTap={{ scale: 0.96 }}
          className="rounded-full border border-black/15 px-5 py-2 text-sm font-medium transition-colors hover:border-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:hover:border-white/40"
        >
          show me more!
        </motion.button>
      </div>
    </section>
  );
}
