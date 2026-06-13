"use client";

import Link from "next/link";

/**
 * The wordmark: "रंग" (colour) carries a spectrum gradient — on-brand for a
 * palette tool — while "waala" stays in the foreground ink. Both halves share
 * one Devanagari-capable typeface so the scripts sit together cleanly.
 */
export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Rangwaala — home"
      draggable={false}
      className="group relative z-50 inline-flex cursor-pointer select-none items-baseline overflow-visible leading-none tracking-tight"
      style={{ fontFamily: "var(--font-anek), sans-serif", fontWeight: 800 }}
    >
      <span
        className="bg-clip-text text-2xl leading-normal text-transparent transition-transform duration-300 group-hover:-translate-y-px sm:text-3xl"
        style={{
          backgroundImage:
            "linear-gradient(105deg,#fb7185 0%,#f59e0b 28%,#10b981 55%,#3b82f6 80%,#8b5cf6 100%)",
        }}
      >
        रंग
      </span>
      <span className="ml-0.5 text-2xl text-neutral-900 transition-transform duration-300 group-hover:translate-y-px sm:text-3xl dark:text-neutral-100">
        waala
      </span>
    </Link>
  );
}
