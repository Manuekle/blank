"use client";

/**
 * Reads a CSS duration token in milliseconds.
 *
 * `parseFloat` alone is not enough: the build's CSS minifier rewrites
 * `250ms` as `.25s`, so a naive read returns 0.25 and every timer that
 * mirrors a transition fires a thousand times too early.
 */
export function parseDurationMs(raw: string, fallback: number) {
  const text = raw.trim();
  const value = parseFloat(text);

  if (!Number.isFinite(value)) return fallback;
  if (/ms$/i.test(text)) return value;
  if (/s$/i.test(text)) return value * 1000;

  return fallback;
}

export function readDurationMs(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback;

  return parseDurationMs(getComputedStyle(document.documentElement).getPropertyValue(name), fallback);
}
