"use client";

import { useReducer } from "react";
import {
  generatePalette,
  type HarmonyRule,
} from "@/lib/color/generate";

export type PaletteHarmony = HarmonyRule | "image";

export interface PaletteColor {
  hex: string;
  locked: boolean;
}

export interface PaletteSnapshot {
  colors: string[];
  harmony: PaletteHarmony;
  timestamp: number;
}

export interface PaletteState {
  colors: PaletteColor[];
  /** The harmony actually applied to the current palette (or "image"). */
  harmony: PaletteHarmony;
  /** The selector preference used by GENERATE ("random" re-picks each time). */
  mode: HarmonyRule | "random";
  history: PaletteSnapshot[];
}

export type PaletteAction =
  | { type: "GENERATE" }
  | { type: "TOGGLE_LOCK"; index: number }
  | { type: "SET_HARMONY"; harmony: HarmonyRule | "random" }
  | { type: "RESTORE"; snapshot: PaletteSnapshot }
  | { type: "SET_FROM_IMAGE"; hexes: string[] }
  | { type: "SET_HISTORY"; history: PaletteSnapshot[] };

export interface PaletteInit {
  colors: string[];
  harmony: PaletteHarmony;
  mode?: HarmonyRule | "random";
}

const FALLBACK_COLORS = ["#a1d2ce", "#78cad2", "#62a8ac", "#5497a7", "#50858b"];
const MAX_HISTORY = 20;

/** Rebuild the five PaletteColor slots from generated hexes, keeping lock flags. */
function applyColors(prev: PaletteColor[], hexes: string[]): PaletteColor[] {
  return hexes.map((hex, i) => ({ hex, locked: prev[i]?.locked ?? false }));
}

/** Prepend the outgoing palette to history, capped at MAX_HISTORY. */
function pushHistory(state: PaletteState): PaletteSnapshot[] {
  const snapshot: PaletteSnapshot = {
    colors: state.colors.map((slot) => slot.hex),
    harmony: state.harmony,
    timestamp: Date.now(),
  };
  return [snapshot, ...state.history].slice(0, MAX_HISTORY);
}

function createInitialState(init?: PaletteInit): PaletteState {
  const colors = init?.colors?.length === 5 ? init.colors : FALLBACK_COLORS;
  const harmony: PaletteHarmony = init?.harmony ?? "analogous";
  const mode: HarmonyRule | "random" =
    init?.mode ?? (harmony === "image" ? "random" : harmony);
  return {
    colors: colors.map((hex) => ({ hex, locked: false })),
    harmony,
    mode,
    history: [],
  };
}

export function paletteReducer(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case "GENERATE": {
      const { colors, harmony } = generatePalette({
        harmony: state.mode,
        locked: state.colors,
      });
      return {
        ...state,
        history: pushHistory(state),
        colors: applyColors(state.colors, colors),
        harmony,
      };
    }

    case "SET_HARMONY": {
      const { colors, harmony } = generatePalette({
        harmony: action.harmony,
        locked: state.colors,
      });
      return {
        ...state,
        history: pushHistory(state),
        mode: action.harmony,
        colors: applyColors(state.colors, colors),
        harmony,
      };
    }

    case "TOGGLE_LOCK":
      return {
        ...state,
        colors: state.colors.map((slot, i) =>
          i === action.index ? { ...slot, locked: !slot.locked } : slot,
        ),
      };

    case "SET_FROM_IMAGE": {
      // Locked swatches stay; unlocked fill from extracted colors in order.
      let next = 0;
      const colors = state.colors.map((slot) =>
        slot.locked
          ? slot
          : { hex: action.hexes[next++] ?? slot.hex, locked: false },
      );
      return { ...state, history: pushHistory(state), colors, harmony: "image" };
    }

    case "RESTORE":
      return {
        ...state,
        history: pushHistory(state),
        colors: action.snapshot.colors.map((hex) => ({ hex, locked: false })),
        harmony: action.snapshot.harmony,
        mode:
          action.snapshot.harmony === "image" ? state.mode : action.snapshot.harmony,
      };

    case "SET_HISTORY":
      return { ...state, history: action.history };

    default:
      return state;
  }
}

export function usePalette(init?: PaletteInit) {
  const [state, dispatch] = useReducer(paletteReducer, init, createInitialState);
  return { state, dispatch };
}
