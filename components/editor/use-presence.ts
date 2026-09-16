"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PresenceState = "open" | "closed";

/**
 * Keeps an element mounted long enough to play its exit transition.
 * Mounts in the closed state, flips to open on the next frame so the
 * enter transition runs, and unmounts `exitMs` after `show` turns false.
 */
export function usePresence(show: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(show);
  const [state, setState] = useState<PresenceState>(show ? "open" : "closed");

  useEffect(() => {
    if (show) {
      setMounted(true);
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setState("open"));
      });
      return () => cancelAnimationFrame(frame);
    }
    setState("closed");
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [show, exitMs]);

  return { mounted, state };
}

/** Holds the last non-empty value so exiting content doesn't blank out mid-fade. */
export function useLastValue<T>(value: T, keep: boolean) {
  const [last, setLast] = useState(value);
  useEffect(() => {
    if (keep) setLast(value);
  }, [value, keep]);
  return keep ? value : last;
}

export type ExitPhase = "enter" | "open" | "closing";

/**
 * Enter/exit for a surface the parent mounts only while it is open. It plays
 * the enter on the frame after mount, and `leave` runs the exit before handing
 * control back, so the parent can keep its plain `{open && <Surface />}`.
 */
export function useExitPhase(exitMs: number) {
  const [phase, setPhase] = useState<ExitPhase>("enter");
  const leaving = useRef(false);

  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPhase("open"));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /** No-ops without a callback so an optional action stays optional. */
  const leave = useCallback(
    (done: (() => void) | undefined) => {
      if (!done || leaving.current) return;
      leaving.current = true;
      setPhase("closing");
      setTimeout(done, exitMs);
    },
    [exitMs],
  );

  return { phase, leave };
}
