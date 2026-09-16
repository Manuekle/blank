"use client";

import type { KeyboardEvent } from "react";

/**
 * Arrow keys move a radio group's selection, like native radios: the group
 * is one tab stop, and the arrows both select and focus the next option.
 * Callers keep `tabIndex={0}` on the selected radio and `-1` on the rest.
 */
export function moveRadioSelection<T extends string>(
  event: KeyboardEvent<HTMLElement>,
  values: readonly T[],
  current: T,
  onChange: (value: T) => void,
) {
  const delta = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key];
  if (!delta) return;
  event.preventDefault();
  const index = (Math.max(0, values.indexOf(current)) + delta + values.length) % values.length;
  onChange(values[index]);
  event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
}
