"use client";

import { HARMONY_RULES, type HarmonyRule } from "@/lib/color/generate";

const RULE_LABELS: Record<HarmonyRule, string> = {
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  splitComplementary: "Split complementary",
  monochromatic: "Monochromatic",
};

export default function HarmonySelector({
  value,
  onChange,
}: {
  value: HarmonyRule | "random";
  onChange: (value: HarmonyRule | "random") => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="opacity-70">Harmony</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as HarmonyRule | "random")}
        className="rounded-full border border-black/15 bg-white/70 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:border-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:bg-black/50 dark:hover:border-white/30"
        style={{ fontFamily: "var(--font-lexend-deca)" }}
      >
        <option value="random">Random</option>
        {HARMONY_RULES.map((rule) => (
          <option key={rule} value={rule}>
            {RULE_LABELS[rule]}
          </option>
        ))}
      </select>
    </label>
  );
}
