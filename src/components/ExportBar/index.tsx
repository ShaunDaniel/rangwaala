"use client";

import { toast } from "sonner";
import { Braces, Image as ImageIcon } from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";

/** Official Tailwind CSS mark, in brand cyan so it reads at a glance. */
function TailwindLogo() {
  return (
    <svg viewBox="0 0 54 33" className="h-full w-full" aria-hidden>
      <path
        fill="#38bdf8"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
      />
    </svg>
  );
}
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
      icon: (
        <span className="text-[10px] font-bold leading-none tracking-tight text-neutral-600 dark:text-neutral-300">
          CSS
        </span>
      ),
      onClick: () => copy("CSS variables", toCss(colors)),
    },
    {
      title: "Copy Tailwind theme",
      icon: <TailwindLogo />,
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
