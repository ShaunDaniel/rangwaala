"use client";

import { useState } from "react";
import Link from "next/link";
import { generateFamilyPalettes, slug, type Family } from "@/lib/families";
import { encodePalette } from "@/lib/url";
import { readableTextColor } from "@/lib/color/contrast";
import type { ColorPalette } from "@/lib/color/generate";

const SHOW_MORE_COUNT = 50;

export default function FamilyGroup({
  family,
  initialPalettes,
}: {
  family: Family;
  initialPalettes: ColorPalette[];
}) {
  const [palettes, setPalettes] = useState<ColorPalette[]>(initialPalettes);

  const showMore = () =>
    setPalettes((prev) => [
      ...prev,
      ...generateFamilyPalettes(family, SHOW_MORE_COUNT),
    ]);

  return (
    <section id={slug(family.name)} className="scroll-mt-32">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold md:text-2xl">
        <span
          className="inline-block h-4 w-4 rounded-full ring-1 ring-black/10 dark:ring-white/15"
          style={{ backgroundColor: `hsl(${family.hue} 70% 55%)` }}
        />
        {family.name}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {palettes.map((palette, i) => (
          <Link
            key={i}
            href={`/${encodePalette(palette.colors)}`}
            aria-label={`Open this ${family.name.toLowerCase()} palette in the generator`}
            className="group block overflow-hidden rounded-2xl border border-black/5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/10"
          >
            <div className="flex h-24 md:h-28">
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
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="font-medium capitalize opacity-70">{palette.harmony}</span>
              <span className="opacity-50 transition-opacity group-hover:opacity-90">
                Open →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={showMore}
          className="rounded-full border border-black/15 px-5 py-2 text-sm font-medium transition-colors hover:border-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:hover:border-white/40"
        >
          Show 50 more {family.name.toLowerCase()} palettes
        </button>
      </div>
    </section>
  );
}
