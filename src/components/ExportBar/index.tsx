"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Braces, Copy, Image as ImageIcon, X } from "lucide-react";
import {
  downloadBlob,
  toCss,
  toJson,
  toPngBlob,
  toTailwind,
} from "@/lib/export";

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

export default function ExportBar({ colors }: { colors: string[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
    setOpen(false);
  };

  const downloadPng = async () => {
    try {
      const blob = await toPngBlob(colors);
      downloadBlob(blob, "rangwaala-palette.png");
      toast.success("PNG downloaded");
    } catch {
      toast.error("Couldn't generate PNG");
    }
    setOpen(false);
  };

  const items = [
    {
      label: "CSS",
      icon: (
        <span className="text-[10px] font-bold leading-none tracking-tight">
          CSS
        </span>
      ),
      onClick: () => copy("CSS variables", toCss(colors)),
    },
    {
      label: "Tailwind",
      icon: <TailwindLogo />,
      onClick: () => copy("Tailwind theme", toTailwind(colors)),
    },
    {
      label: "JSON",
      icon: <Braces className="h-full w-full" />,
      onClick: () => copy("JSON", toJson(colors)),
    },
    {
      label: "PNG",
      icon: <ImageIcon className="h-full w-full" />,
      onClick: downloadPng,
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence mode="wait">
        {!open ? (
          /* Collapsed: single circular button */
          <motion.button
            key="trigger"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            aria-label="Copy palette"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-white/80 dark:text-black"
          >
            <Copy size={18} />
          </motion.button>
        ) : (
          /* Expanded: horizontal pill with options */
          <motion.div
            key="expanded"
            initial={{ width: 44, opacity: 0.8, borderRadius: 9999 }}
            animate={{ width: "auto", opacity: 1, borderRadius: 9999 }}
            exit={{ width: 44, opacity: 0, borderRadius: 9999 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="flex items-center gap-1 overflow-hidden bg-black/80 px-1.5 py-1.5 shadow-lg backdrop-blur-md dark:bg-white/80"
            style={{ borderRadius: 9999 }}
          >
            {items.map((item, i) => (
              <motion.button
                key={item.label}
                type="button"
                onClick={item.onClick}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 22 }}
                aria-label={item.label}
                className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 dark:text-black dark:hover:bg-black/20"
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </div>
                {/* Tooltip */}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-white dark:text-black">
                  {item.label}
                </span>
              </motion.button>
            ))}

            {/* Close button */}
            <motion.button
              type="button"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: items.length * 0.05, type: "spring", stiffness: 400, damping: 22 }}
              aria-label="Close export options"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/20 hover:text-white dark:text-black/60 dark:hover:bg-black/20 dark:hover:text-black"
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
