import type { Metadata } from "next";
import Link from "next/link";
import { FAMILIES, generateFamilyPalettes, slug } from "@/lib/families";
import FamilyGroup from "@/components/FamilyGroup";

// Fresh palettes on every visit.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore palettes",
  description:
    "Ready-made palettes grouped by color family — blues, reds, magentas, and more. Click any to open it in the generator.",
};

const INITIAL_PER_FAMILY = 6;

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
          Explore palettes
        </h1>
        <p className="mt-3 max-w-xl text-base opacity-75 md:text-lg">
          fresh palettes generated every time you visit!
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-black/15 px-4 py-1.5 text-sm font-medium transition-colors hover:border-black/40 dark:border-white/15 dark:hover:border-white/40"
        >
          ← Back
        </Link>
      </header>

      {/* Quick-nav: jump to any color family */}
      <nav className="sticky top-19 z-30 -mx-5 mb-10 border-y border-black/5 bg-white/80 px-5 py-2 backdrop-blur-md md:-mx-8 md:px-8 dark:border-white/10 dark:bg-black/70">
        <ul className="flex flex-wrap gap-2 ">
          {FAMILIES.map((family) => (
            <li key={family.name}>
              <a
                href={`#${slug(family.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-xs font-medium transition-colors hover:border-black/40 dark:border-white/15 dark:hover:border-white/40"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: `hsl(${family.hue} 70% 55%)` }}
                />
                {family.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-12">
        {FAMILIES.map((family) => (
          <FamilyGroup
            key={family.name}
            family={family}
            initialPalettes={generateFamilyPalettes(family, INITIAL_PER_FAMILY)}
          />
        ))}
      </div>
    </main>
  );
}
