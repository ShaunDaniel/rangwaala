"use client";

import { toast } from "sonner";
import { Braces, Code2, Image as ImageIcon, Palette } from "lucide-react";
import {
  downloadBlob,
  toCss,
  toJson,
  toPngBlob,
  toTailwind,
} from "@/lib/export";

export default function ExportBar({ colors }: { colors: string[] }) {
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const downloadPng = async () => {
    try {
      const blob = await toPngBlob(colors);
      downloadBlob(blob, "rangwaala-palette.png");
      toast.success("PNG downloaded");
    } catch {
      toast.error("Couldn't generate PNG");
    }
  };

  const actions = [
    { label: "CSS", icon: Code2, run: () => copy("CSS variables", toCss(colors)) },
    { label: "Tailwind", icon: Palette, run: () => copy("Tailwind theme", toTailwind(colors)) },
    { label: "JSON", icon: Braces, run: () => copy("JSON", toJson(colors)) },
    { label: "PNG", icon: ImageIcon, run: downloadPng },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {actions.map(({ label, icon: Icon, run }) => (
        <button
          key={label}
          type="button"
          onClick={run}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/70 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:border-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:bg-black/50 dark:hover:border-white/30"
          style={{ fontFamily: "var(--font-lexend-deca)" }}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}
