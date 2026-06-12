# 🎨 Rangwaala

A finished-feeling color-palette tool — generate, lock, extract, and share
palettes built on perceptual color and WCAG contrast. **रंग** (colour) +
**-waala** (the one who deals in it).

> _Add a hero GIF here once recorded:_ `![Rangwaala in action](docs/demo.gif)`

---

## Features

- **Harmony generation** — six rules (analogous, complementary, triadic,
  tetradic, split-complementary, monochromatic), with the active rule shown as
  a chip and synced to the URL.
- **Locking** — lock any swatch (click the lock or press `1`–`5`); the next
  generation derives its base hue from the first locked color and only
  overwrites unlocked slots.
- **Keyboard-first** — `Space` generates, `1`–`5` toggle locks. Inputs and
  buttons are guarded so typing never triggers a shortcut.
- **Image → palette** — drop, browse, or paste an image and extract five
  colors via OKLab k-means. The image never leaves the browser.
- **Shareable URLs** — every palette is encoded in `?c=…&h=…`; pasting a link
  reproduces the exact palette with no hydration flash.
- **Export** — copy CSS custom properties, a Tailwind v4 `@theme` block, or
  JSON; download a labeled PNG. Surfaced as a floating dock.
- **Contrast badges** — each swatch shows its contrast ratio (animated) and an
  AA/AAA/Fail tag against its chosen text color.
- **History** — the last 20 palettes persist to `localStorage`; click any to
  restore.
- **Accessible** — real `<button>` swatches with offset focus rings, an
  `aria-live` region announcing copies/generations/extractions, `aria-pressed`
  lock labels, and `reducedMotion="user"`.
- **Live OG images** — shared links unfurl a 1200×630 preview of the actual
  palette via the `/og` route handler.

---

## Architecture

Pure logic lives in `lib/`, stateful logic in `hooks/`, presentation in
`components/`.

- **Reducer state model** (`hooks/usePalette.ts`) — all palette mutations flow
  through one reducer: `GENERATE`, `TOGGLE_LOCK`, `SET_HARMONY`, `RESTORE`,
  `SET_FROM_IMAGE`, `SET_HISTORY`. State is `{ colors: {hex, locked}[5],
  harmony, mode, history }`; each generation pushes a snapshot (capped at 20).
- **Color math** (`lib/color/`) — `convert.ts` (hex↔HSL↔RGB), `contrast.ts`
  (WCAG relative luminance, contrast ratio, readable text color), and
  `generate.ts` (harmony rules over a base hue, respecting locks).
- **OKLab k-means pipeline** (`lib/color/oklab.ts`, `extract.ts`) — image
  samples are converted to OKLab, clustered with k-means++ seeding (k = 10),
  then 5 are chosen by greedy farthest-point sampling scored on population ×
  chroma, with a near-grayscale fallback that diversifies on lightness.
  Extraction runs in a Web Worker (`workers/palette.worker.ts`) with a
  main-thread fallback.
- **URL schema** (`lib/url.ts`) — `?c=a1d2ce-50858b-…&h=triadic`: five
  lowercase 6-digit hexes joined by dashes, plus a rule name or `image`.
  Strictly validated — anything malformed falls back to a fresh palette. The
  server component decodes `searchParams` and hydrates initial state directly.

Pure modules are covered by Vitest unit tests (`npm test`).

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run typecheck  # tsc --noEmit
npm run lint
npm run build
npm test           # vitest
```

---

## Credits

UI-kit components are **copied into the repo** (via the shadcn registry CLI),
not added as runtime dependencies:

- [Magic UI](https://magicui.design/) — Border Beam, Text Animate, Number Ticker
- [Aceternity UI](https://ui.aceternity.com/) — Floating Dock
- [React Bits](https://www.reactbits.dev/) — Click Spark

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, and
[`motion`](https://motion.dev/).