"use client";

import { motion, type Variants } from "framer-motion";
import { readableTextColor } from "@/lib/color/contrast";
import { hexToHsl } from "@/lib/color/convert";

/**
 * A full-screen showcase of the live palette applied the way palettes actually
 * get used: a neutral canvas with the colors as accents — buttons, tags, a
 * chart, avatars — plus the palette as a swatch band. Reveals on scroll.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// A few preset bar heights so the mini chart reads as data, not noise.
const BAR_HEIGHTS = [52, 84, 40, 96, 68];

export default function PaletteShowcase({ colors }: { colors: string[] }) {
  const palette = [0, 1, 2, 3, 4].map(
    (i) => colors[i] ?? colors[colors.length - 1] ?? "#111111",
  );

  // Use the most saturated color as the brand accent; the next as a secondary.
  const bySaturation = [...palette].sort((a, b) => hexToHsl(b).s - hexToHsl(a).s);
  const primary = bySaturation[0];
  const secondary = bySaturation[1];
  const primaryInk = readableTextColor(primary);
  const secondaryInk = readableTextColor(secondary);

  return (
    <section className="relative w-full overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12%" }}
        className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-8 px-4 py-16 sm:gap-12 sm:px-6 sm:py-24 md:px-10"
      >
        <motion.p
          variants={item}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400"
        >
          Your palette, in the wild
        </motion.p>

        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          {/* Copy column */}
          <div>
            <motion.span
              variants={item}
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: primary, color: primaryInk }}
            >
              Your brand
            </motion.span>
            <motion.h2
              variants={item}
              className="mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-6xl"
            >
              Design that speaks in color.
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-5 max-w-md text-base text-neutral-500 md:text-lg dark:text-neutral-400"
            >
              A neutral canvas with your five colors used the way real products
              use them — as accents on buttons, tags, and charts. Generate until
              it feels right.
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
                style={{ backgroundColor: primary, color: primaryInk }}
              >
                Get started
              </span>
              <span className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold dark:border-neutral-700">
                Learn more
              </span>
            </motion.div>
          </div>

          {/* Sample card — neutral surface, palette as accents */}
          <motion.div
            variants={item}
            className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl sm:p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: primary, color: primaryInk }}
              >
                Aa
              </div>
              <div className="flex-1">
                <div className="h-2.5 w-28 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <div className="mt-2 h-2 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                style={{ backgroundColor: secondary, color: secondaryInk }}
              >
                New
              </span>
            </div>

            {/* Mini chart — every palette color, as data */}
            <div className="mt-6 flex h-28 items-end gap-2.5">
              {palette.map((hex, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{ backgroundColor: hex, height: `${BAR_HEIGHTS[i]}%` }}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <span
                className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                style={{ backgroundColor: primary, color: primaryInk }}
              >
                Subscribe
              </span>
              <div className="flex -space-x-2">
                {palette.slice(0, 4).map((hex, i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-neutral-900"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-width swatch band: the palette itself */}
        <motion.div
          variants={item}
          className="flex h-20 overflow-hidden rounded-2xl shadow-lg md:h-24"
        >
          {palette.map((hex, i) => (
            <div
              key={i}
              className="flex flex-1 items-end justify-center pb-2"
              style={{ backgroundColor: hex, color: readableTextColor(hex) }}
            >
              <span
                className="text-[10px] font-medium md:text-xs"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                {hex.toUpperCase()}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
