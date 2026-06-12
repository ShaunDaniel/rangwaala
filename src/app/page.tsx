import ColorPalette from "@/components/ColorPalette";
import { generatePalette } from "@/lib/color/generate";
import { decodePalette, type RawSearchParams } from "@/lib/url";
import type { PaletteInit } from "@/hooks/usePalette";

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
    initial = {
      colors: decoded.colors,
      harmony: decoded.harmony,
      mode: decoded.harmony === "image" ? "random" : decoded.harmony,
    };
  } else {
    const palette = generatePalette();
    initial = { colors: palette.colors, harmony: palette.harmony, mode: "random" };
  }

  return <ColorPalette initial={initial} />;
}
