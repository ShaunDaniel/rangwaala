import type { Metadata } from "next";
import ColorPalette from "@/components/ColorPalette";
import { generatePalette } from "@/lib/color/generate";
import { decodePalette, encodePalette, type RawSearchParams } from "@/lib/url";
import type { PaletteInit } from "@/hooks/usePalette";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const decoded = decodePalette(params);

  // Point OG/Twitter at the route handler with the exact palette, so a shared
  // link unfurls the real colors (a static opengraph-image can't read params).
  const ogQuery = decoded
    ? encodePalette(decoded.colors)
    : "";
  const ogUrl = `/og${ogQuery}`;
  const description = decoded
    ? `A color palette: ${decoded.colors
        .map((c) => c.toUpperCase())
        .join(", ")}.`
    : "Generate, lock, and share beautiful color palettes — built around perceptual color and WCAG contrast.";

  return {
    title: decoded ? "A shared palette · Rangwaala" : "Rangwaala — color palettes",
    description,
    openGraph: {
      title: "Rangwaala",
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Rangwaala",
      description,
      images: [ogUrl],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const decoded = decodePalette(params);

  // A valid share URL hydrates exactly; otherwise serve a fresh random palette
  // (generated once on the server, so there's no hydration flash).
  let initial: PaletteInit;
  if (decoded) {
    initial = { colors: decoded.colors, harmony: decoded.harmony };
  } else {
    const palette = generatePalette();
    initial = { colors: palette.colors, harmony: palette.harmony };
  }

  return <ColorPalette initial={initial} />;
}
