"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TABBABLE = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Tabbable descendants in DOM order, skipping anything hidden or inert. */
function tabbable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (element) =>
      !element.closest("[inert]") &&
      element.offsetWidth + element.offsetHeight > 0 &&
      getComputedStyle(element).visibility !== "hidden",
  );
}

type DialogOptions = {
  /** Called on Escape. */
  onClose?: () => void;
  /** Keeps Tab inside the surface. Off for surfaces that stay in the page flow. */
  trap?: boolean;
  /** Picks the control that receives focus on open; defaults to the first tabbable one. */
  initialFocus?: (root: HTMLElement) => HTMLElement | null | undefined;
};

/**
 * Focus handling shared by every overlay surface: moves focus in on open,
 * keeps Tab inside while it is open, closes on Escape, and returns focus to
 * whatever opened it. Without this a modal is announced but leaves the
 * keyboard behind it.
 *
 * Returns a callback ref so the effect runs on the render that actually
 * attaches the node — surfaces that mount a frame after `open` flips still
 * receive focus.
 */
export function useDialog<T extends HTMLElement>(
  open: boolean,
  { onClose, trap = true, initialFocus }: DialogOptions = {},
) {
  const [surface, setSurface] = useState<T | null>(null);
  // Read through refs so a caller's inline arrow doesn't re-run the effect
  // and steal focus back on every render.
  const close = useRef(onClose);
  close.current = onClose;
  const pickFocus = useRef(initialFocus);
  pickFocus.current = initialFocus;

  useEffect(() => {
    if (!open || !surface) return;

    const opener = document.activeElement as HTMLElement | null;

    const target = pickFocus.current?.(surface) ?? tabbable(surface)[0] ?? surface;
    if (target === surface && !surface.hasAttribute("tabindex")) surface.tabIndex = -1;
    target.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (!surface) return;

      if (event.key === "Escape") {
        event.stopPropagation();
        close.current?.();
        return;
      }
      if (event.key !== "Tab" || !trap) return;

      const stops = tabbable(surface);
      if (stops.length === 0) {
        event.preventDefault();
        surface.focus({ preventScroll: true });
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      // Focus outside the surface (or on the surface itself) re-enters at an edge.
      if (!surface.contains(active) || active === surface) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Only take focus back if the surface still held it, or it fell to the
      // body on unmount; a close that deliberately moved focus elsewhere
      // keeps its destination.
      const active = document.activeElement;
      const stray = !active || active === document.body || surface.contains(active);
      if (opener?.isConnected && stray) opener.focus({ preventScroll: true });
    };
  }, [open, surface, trap]);

  return useCallback((node: T | null) => setSurface(node), []);
}
