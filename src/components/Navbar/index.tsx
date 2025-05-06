"use client";

import { TextHoverEffect } from "@/components/ui/TextHoverEffect";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-3 px-6 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl flex items-center justify-between">
        <Link href="/" className="w-44 h-12">
          <TextHoverEffect text="रंगwaala" duration={0.2} />
        </Link>
        <div className="flex items-center gap-4">
        </div>
      </div>
    </nav>
  );
}