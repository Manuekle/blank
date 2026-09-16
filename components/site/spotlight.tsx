"use client";

import type { HTMLAttributes, PointerEvent } from "react";

/**
 * Tracks a mouse pointer over any descendant marked `data-spotlight` and
 * writes its local position to `--mx` / `--my`, so CSS can paint a glow
 * that follows the cursor. One listener covers a whole grid.
 */
export function Spotlight({ onPointerMove, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (event.pointerType !== "mouse") return;
        const target = (event.target as Element).closest<HTMLElement>("[data-spotlight]");
        if (!target || !event.currentTarget.contains(target)) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        target.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
    />
  );
}
