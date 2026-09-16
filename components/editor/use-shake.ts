"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { readDurationMs } from "./duration";

/**
 * Error state shake (transitions-dev): a field whose value was rejected and
 * silently corrected shakes once so the correction is not invisible. The
 * shake is paired with `message`, which callers render in a live region —
 * motion alone would not reach a screen reader.
 */
export function useShake() {
  const [shaking, setShaking] = useState(false);
  const [message, setMessage] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const shake = useCallback((reason: string) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Drop the class before re-adding it so a second rejection replays the
    // animation instead of being swallowed as "already running".
    setShaking(false);
    const shakeMs = readDurationMs("--shake-dur-a", 80) * 2 + readDurationMs("--shake-dur-b", 60) * 2;
    timers.current.push(
      window.setTimeout(() => setShaking(true), 0),
      window.setTimeout(() => setShaking(false), shakeMs + 20),
      // The message clears on its own so the live region is empty and ready
      // for the next announcement.
      window.setTimeout(() => setMessage(""), shakeMs + readDurationMs("--revert-hold", 3000)),
    );
    setMessage(reason);
  }, []);

  return { shaking, message, shake };
}
