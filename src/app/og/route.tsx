import { ImageResponse } from "next/og";
import { decodePalette } from "@/lib/url";
import { generatePalette } from "@/lib/color/generate";
import { readableTextColor } from "@/lib/color/contrast";
import type { PaletteHarmony } from "@/hooks/usePalette";

const SIZE = { width: 1200, height: 630 };

const HARMONY_LABELS: Record<PaletteHarmony, string> = {
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  splitComplementary: "Split complementary",
  monochromatic: "Monochromatic",
  image: "From image",
};

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const decoded = decodePalette({
    c: searchParams.get("c"),
    h: searchParams.get("h"),
  });

  const palette = decoded ?? {
    colors: generatePalette().colors,
    harmony: "analogous" as PaletteHarmony,
  };
  const { colors, harmony } = palette;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Five full-bleed swatches */}
        <div style={{ display: "flex", flex: 1 }}>
          {colors.map((hex) => {
            const ink = readableTextColor(hex);
            return (
              <div
                key={hex}
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 28,
                  backgroundColor: hex,
                  color: ink,
                  fontSize: 30,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                }}
              >
                {hex.toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* Footer bar with the wordmark + harmony label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "26px 44px",
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex" }}>Rangwaala</div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>
            {HARMONY_LABELS[harmony]}
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
