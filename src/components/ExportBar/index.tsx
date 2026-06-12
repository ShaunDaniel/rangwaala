"use client";

import { toast } from "sonner";
import { Braces, Code2, Image as ImageIcon, Palette } from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";
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

  const items = [
    {
      title: "Copy CSS variables",
      icon: <Code2 className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      onClick: () => copy("CSS variables", toCss(colors)),
    },
    {
      title: "Copy Tailwind theme",
      icon: <Palette className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      onClick: () => copy("Tailwind theme", toTailwind(colors)),
    },
    {
      title: "Copy JSON",
      icon: <Braces className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      onClick: () => copy("JSON", toJson(colors)),
    },
    {
      title: "Download PNG",
      icon: <ImageIcon className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      onClick: downloadPng,
    },
  ];

  return (
    <FloatingDock
      items={items}
      desktopClassName="border border-black/10 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/70"
      mobileClassName="fixed bottom-6 right-6 z-40"
    />
  );
}
