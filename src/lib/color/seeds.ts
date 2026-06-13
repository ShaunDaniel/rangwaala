/**
 * Seed palettes — the "taste" layer.
 *
 * Pure color-theory math (analogous, triadic, …) reliably produces *harmonious*
 * palettes, but rarely the curated, slightly-irregular feel of a palette a human
 * designer would publish. Tools like Colormind get that feel by learning from
 * real palettes; we get most of the way there far more cheaply by seeding the
 * generator with a hand-picked library and perturbing entries in OKLCH.
 *
 * Each entry is a 5-color palette chosen for two properties the procedural
 * engine also targets, so seeded and procedural results feel of a piece:
 *   1. A wide tonal range — there's a near-light and a near-dark, not five
 *      mid-tones all shouting at once.
 *   2. A restrained hue set — usually two or three hue families, so variety
 *      comes from tone, not from spraying colors around the wheel.
 *
 * Ordered light→dark-ish where it reads well; the generator may reorder.
 */
export const SEED_PALETTES: readonly string[][] = [
  // — Warm / earthy —
  ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
  ["#CB997E", "#DDBEA9", "#FFE8D6", "#B7B7A4", "#6B705C"],
  ["#FFFCF2", "#CCC5B9", "#403D39", "#252422", "#EB5E28"],
  ["#582F0E", "#7F4F24", "#936639", "#A68A64", "#B6AD90"],
  ["#E9D8A6", "#EE9B00", "#CA6702", "#BB3E03", "#9B2226"],
  ["#386641", "#6A994E", "#A7C957", "#F2E8CF", "#BC4749"],
  ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"],

  // — Cool / serene —
  ["#03045E", "#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"],
  ["#012A4A", "#013A63", "#01497C", "#2A6F97", "#A9D6E5"],
  ["#1B4332", "#2D6A4F", "#40916C", "#74C69D", "#D8F3DC"],
  ["#001219", "#005F73", "#0A9396", "#94D2BD", "#E9D8A6"],
  ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"],
  ["#CAD2C5", "#84A98C", "#52796F", "#354F52", "#2F3E46"],
  ["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"],
  ["#177E89", "#084C61", "#DB3A34", "#FFC857", "#E5E5E5"],

  // — Soft / pastel —
  ["#CDB4DB", "#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF"],
  ["#D8E2DC", "#FFE5D9", "#FFCAD4", "#F4ACB7", "#9D8189"],
  ["#FAF3DD", "#C8D5B9", "#8FC0A9", "#68B0AB", "#4A7C59"],
  ["#EDEDE9", "#D6CCC2", "#F5EBE0", "#E3D5CA", "#D5BDAF"],
  ["#FEC5BB", "#FCD5CE", "#FAE1DD", "#E8E8E4", "#D8E2DC"],
  ["#F6BD60", "#F7EDE2", "#F5CAC3", "#84A59D", "#F28482"],

  // — Bold / modern —
  ["#22223B", "#4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4"],
  ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"],
  ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
  ["#1A535C", "#4ECDC4", "#F7FFF7", "#FF6B6B", "#FFE66D"],
  ["#000000", "#14213D", "#FCA311", "#E5E5E5", "#FFFFFF"],
  ["#233D4D", "#FE7F2D", "#FCCA46", "#A1C181", "#619B8A"],
  ["#3D348B", "#7678ED", "#F7B801", "#F18701", "#F35B04"],

  // — Sunset / vivid ramps —
  ["#F72585", "#B5179E", "#7209B7", "#560BAD", "#3A0CA3"],
  ["#FFBA08", "#FAA307", "#F48C06", "#E85D04", "#DC2F02"],
  ["#03071E", "#370617", "#6A040F", "#9D0208", "#D00000"],
  ["#FF9F1C", "#FFBF69", "#FFFFFF", "#CBF3F0", "#2EC4B6"],
  ["#FFB997", "#F67E7D", "#843B62", "#0B032D", "#74546A"],

  // — Moody / dark —
  ["#10002B", "#3C096C", "#5A189A", "#9D4EDD", "#E0AAFF"],
  ["#0B090A", "#161A1D", "#660708", "#A4161A", "#BA181B"],
  ["#231942", "#5E548E", "#9F86C0", "#BE95C4", "#E0B1CB"],
  ["#001524", "#15616D", "#FFECD1", "#FF7D00", "#78290F"],

  // — Fresh / nature —
  ["#D9ED92", "#99D98C", "#52B69A", "#168AAD", "#1E6091"],
  ["#004B23", "#008000", "#38B000", "#9EF01A", "#CCFF33"],
  ["#FB8B24", "#D90368", "#820263", "#291720", "#04A777"],
];
