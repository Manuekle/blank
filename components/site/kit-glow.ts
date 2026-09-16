import type { CSSProperties } from "react";
import type { TemplateKit } from "@/lib/templates";

export type KitGlow = [string, string, string];

/** The editor's own accents: the glow before any kit is applied. */
export const BLANK_GLOW: KitGlow = ["#4f7cff", "#8b7bff", "#3ecf8e"];

/** Hand-tuned per kit: the palette's loudest hues, readable as light on the dark ground. */
const TUNED: Record<string, KitGlow> = {
  "vhs-osd": ["#2a2aef", "#00e5ff", "#ff2d3a"],
  "classic-desktop": ["#008080", "#1084d0", "#000080"],
  aqua: ["#3a8ef0", "#6cc0ff", "#6fcf5b"],
  "web-2-0": ["#7ac943", "#ff8a00", "#3fa9f5"],
  "skeuomorphic-ios": ["#6d84a2", "#1a73e8", "#e3170d"],
  "flat-metro": ["#1abc9c", "#3498db", "#9b59b6"],
  "bento-saas": ["#a78bfa", "#22d3ee", "#4f7cff"],
  "liquid-glass": ["#9fb4d8", "#12b750", "#4d7cfe"],
};

/** Spread between the strongest and weakest channel of a #rrggbb color. */
function chroma(value: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return 0;
  const channels = [0, 2, 4].map((offset) => parseInt(match[1].slice(offset, offset + 2), 16));
  return Math.max(...channels) - Math.min(...channels);
}

export function kitGlow(kit: Pick<TemplateKit, "id" | "palette">): KitGlow {
  const tuned = TUNED[kit.id];
  if (tuned) return tuned;
  const vivid = kit.palette.map((swatch) => swatch.value).filter((value) => chroma(value) > 60);
  return [0, 1, 2].map((index) => vivid[index] ?? BLANK_GLOW[index]) as KitGlow;
}

export function glowStyle(glow: KitGlow): CSSProperties {
  return { "--kit-a": glow[0], "--kit-b": glow[1], "--kit-c": glow[2] } as CSSProperties;
}
