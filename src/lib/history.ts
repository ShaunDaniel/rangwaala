import type { PaletteSnapshot } from "@/hooks/usePalette";
import { HARMONY_RULES } from "@/lib/color/generate";

const STORAGE_KEY = "rangwaala:history";
const HEX_RE = /^#[0-9a-f]{6}$/;
const VALID_HARMONIES = new Set<string>([...HARMONY_RULES, "image"]);

function isSnapshot(value: unknown): value is PaletteSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.colors) &&
    v.colors.length === 5 &&
    v.colors.every((c) => typeof c === "string" && HEX_RE.test(c)) &&
    typeof v.harmony === "string" &&
    VALID_HARMONIES.has(v.harmony) &&
    typeof v.timestamp === "number"
  );
}

/** Load saved snapshots, tolerating absent/corrupt storage. */
export function loadHistory(): PaletteSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSnapshot) : [];
  } catch {
    return [];
  }
}

/** Persist snapshots, swallowing quota/serialization errors. */
export function saveHistory(history: PaletteSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}
