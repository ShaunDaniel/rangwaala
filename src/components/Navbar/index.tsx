"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <nav className="fixed items-center top-0 left-0 right-0 z-50 py-4 px-4 sm:px-6 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 overflow-visible">
      <div className="flex items-center justify-between gap-3">
        <Logo />

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/explore"
            className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium transition-colors hover:border-black/40 sm:text-sm dark:border-white/15 dark:hover:border-white/40"
          >
            explore
          </Link>

          <p className="hidden text-xs sm:block sm:text-sm">
            made with <span className="text-red-500">💝</span> by{" "}
            <a
              href="https://shaundaniel.work"
              className="underline transition-colors duration-200 hover:text-blue-500"
            >
              shaun
            </a>
          </p>
        </div>
      </div>
    </nav>
  );
}
