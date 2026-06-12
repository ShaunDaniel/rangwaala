"use client";

import { useEffect } from "react";

interface HotkeyHandlers {
  onGenerate: () => void;
  onToggleLock: (index: number) => void;
}

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

/** True when focus is in a field where our shortcuts shouldn't fire. */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return TYPING_TAGS.has(el.tagName);
}

/**
 * Global keyboard shortcuts: Space generates, digits 1–5 toggle the lock on
 * the corresponding swatch. Ignored while typing in a field.
 */
export function useHotkeys({ onGenerate, onToggleLock }: HotkeyHandlers) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      if (event.code === "Space") {
        event.preventDefault(); // stop the page from scrolling
        onGenerate();
        return;
      }

      if (event.key >= "1" && event.key <= "5") {
        event.preventDefault();
        onToggleLock(Number(event.key) - 1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onGenerate, onToggleLock]);
}
