"use client";

import { TextHoverEffect } from "@/components/ui/TextHoverEffect";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed items-center top-0 left-0 right-0 z-50 py-3 px-4 sm:px-6 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <Link href="/" className="h-8 sm:h-12">
          <TextHoverEffect text="रंग-Waala" duration={0.2} />
        </Link>

        <p className="text-xs sm:text-sm">
          Made with <span className="text-red-500">♥</span> by <a href="https://github.com/shaundaniel" className="underline hover:text-blue-500 transition-colors duration-200">Shaun</a>
        </p>
      </div>
    </nav>
  );
}