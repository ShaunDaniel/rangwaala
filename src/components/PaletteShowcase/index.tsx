"use client";

import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";
import { readableTextColor } from "@/lib/color/contrast";
import { paletteRoles } from "@/lib/color/roles";

/**
 * A full-screen showcase of the live palette applied the way palettes actually
 * get used: a neutral canvas with the colors as *accents* — buttons, tags, a
 * chart, avatars — never as body text or invisible fills. Color roles come
 * from {@link paletteRoles}, which guarantees every accent is legible, so no
 * "weird" washed-out or unreadable swatches sneak into the mockups.
 *
 * Layout is mobile-first: a single readable column on phones that steps up to
 * a two-column composition on tablets and desktops.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Preset bar heights so the mini chart reads as data, not noise.
const BAR_HEIGHTS = [54, 86, 42, 96, 70];

export default function PaletteShowcase({ colors }: { colors: string[] }) {
  const roles = useMemo(() => paletteRoles(colors), [colors]);
  const { primary, onPrimary, secondary, onSecondary, soft, onSoft, ramp } =
    roles;

  return (
    <section className="relative w-full overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-10 px-5 py-16 sm:gap-14 sm:px-6 sm:py-24 md:px-10"
      >
        <motion.p
          variants={item}
          className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-neutral-400 sm:text-xs"
        >
          Your palette, in the wild
        </motion.p>

        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Copy column */}
          <div className="text-center md:text-left">
            <motion.span
              variants={item}
              className="inline-block rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide sm:text-xs"
              style={{ backgroundColor: soft, color: onSoft }}
            >
              Your brand
            </motion.span>
            <motion.h2
              variants={item}
              className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Design that speaks{" "}
              <span style={{ color: primary }}>in color.</span>
            </motion.h2>
            <motion.p
              variants={item}
              className="mx-auto mt-4 max-w-md text-sm text-neutral-500 sm:mt-5 sm:text-base md:mx-0 md:text-lg dark:text-neutral-400"
            >
              A neutral canvas with your five colors used the way real products
              use them, as accents on buttons, tags, and charts. Generate until
              it feels right.
            </motion.p>
            <motion.p
              variants={item}
              className="mx-auto mt-3 max-w-md text-xs text-neutral-400 sm:text-sm md:mx-0 dark:text-neutral-500"
            >
              Press{" "}
              <kbd className="rounded bg-black/10 px-1.5 py-0.5 font-semibold dark:bg-white/15">
                Space
              </kbd>{" "}
              to change the palette.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start"
            >
              <button
                type="button"
                className="rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
                style={{ backgroundColor: primary, color: onPrimary }}
              >
                Get started
              </button>
              <button
                type="button"
                className="rounded-full border-2 px-6 py-3 text-sm font-semibold transition-colors"
                style={{ borderColor: secondary, color: secondary }}
              >
                Learn more
              </button>
            </motion.div>
          </div>

          {/* Sample product card — neutral surface, palette as accents */}
          <motion.div
            variants={item}
            className="mx-auto w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl sm:p-6 md:max-w-none md:p-8 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: primary, color: onPrimary }}
              >
                Aa
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-2.5 w-28 max-w-full rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <div className="mt-2 h-2 w-20 max-w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                style={{ backgroundColor: secondary, color: onSecondary }}
              >
                New
              </span>
            </div>

            {/* Mini chart — every palette color, as data */}
            <div className="mt-6 flex h-28 items-end gap-2 sm:gap-2.5">
              {ramp.map((hex, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{
                    backgroundColor: hex,
                    height: `${BAR_HEIGHTS[i % BAR_HEIGHTS.length]}%`,
                  }}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <button
                type="button"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95"
                style={{ backgroundColor: primary, color: onPrimary }}
              >
                Subscribe
              </button>
              <div className="flex -space-x-2">
                {ramp.slice(0, 4).map((hex, i) => (
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

        {/* Full-width swatch band: the palette itself, labelled and legible */}
        <motion.div
          variants={item}
          className="flex h-20 overflow-hidden rounded-2xl shadow-lg sm:h-24"
        >
          {ramp.map((hex, i) => (
            <div
              key={i}
              className="flex flex-1 items-end justify-center pb-2"
              style={{ backgroundColor: hex, color: readableTextColor(hex) }}
            >
              <span
                className="text-[9px] font-medium tracking-tight sm:text-xs"
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
