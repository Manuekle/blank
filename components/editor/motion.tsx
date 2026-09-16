"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { readDurationMs } from "./duration";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Text states swap: old text exits up with blur, new text enters from below.
 * Honors reduced motion by swapping instantly.
 */
export function SwapText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    const element = ref.current;
    if (!element || text === shown) return;
    if (prefersReducedMotion()) {
      setShown(text);
      return;
    }
    element.classList.add("is-exit");
    const timer = setTimeout(() => {
      element.classList.remove("is-exit");
      element.classList.add("is-enter-start");
      setShown(text);
    }, readDurationMs("--text-swap-dur", 150));
    return () => clearTimeout(timer);
    // `shown` is intentionally read at the time `text` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element?.classList.contains("is-enter-start")) return;
    void element.offsetHeight;
    element.classList.remove("is-enter-start");
  }, [shown]);

  return (
    <span ref={ref} className={className ? `t-text-swap ${className}` : "t-text-swap"}>
      {shown}
    </span>
  );
}

/**
 * Number pop-in: every character re-enters with a blurred slide when the text
 * changes, staggered by `--digit-stagger`. Honors reduced motion.
 */
export function PopText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(text);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (previous.current === text) return;
    previous.current = text;
    if (prefersReducedMotion()) return;

    setAnimating(false);
    // Reflow between removal and re-add so the animation replays.
    const frame = requestAnimationFrame(() => {
      void ref.current?.offsetWidth;
      setAnimating(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [text]);

  return (
    <span
      ref={ref}
      className={[
        "t-digit-group",
        animating ? "is-animating" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {[...text].map((character, index) => (
        <span
          key={`${index}-${character}`}
          className="t-digit"
          {...(index > 0 && index < 3 ? { "data-stagger": String(index) } : {})}
          style={index > 2 ? { animationDelay: `calc(var(--digit-stagger) * ${index})` } : undefined}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

type CrossFadeProps<T extends string> = {
  value: T;
  children: (value: T) => ReactNode;
  /** How long the leaving view stays mounted; covers the exit and the enter. */
  exitMs?: number;
  className?: string;
  /** -1 leaves toward the start edge, 1 toward the end edge. */
  direction?: (value: T) => number;
};

/**
 * Keeps the previous view mounted while it fades out, stacked in the same
 * grid cell as the incoming view. Layers render in a stable key order so
 * React never moves DOM nodes (moving an iframe would reload it).
 */
export function CrossFade<T extends string>({
  value,
  children,
  exitMs = 250,
  className,
  direction,
}: CrossFadeProps<T>) {
  const [shown, setShown] = useState(value);
  const [leaving, setLeaving] = useState<T | null>(null);

  if (shown !== value) {
    setLeaving(shown);
    setShown(value);
  }

  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => setLeaving(null), exitMs);
    return () => clearTimeout(timer);
  }, [leaving, exitMs]);

  const layers = (leaving !== null && leaving !== shown ? [leaving, shown] : [shown]).sort();

  return (
    <div className={className ? `t-crossfade ${className}` : "t-crossfade"}>
      {layers.map((layer) => {
        const exiting = layer !== shown;
        return (
          <div
            key={layer}
            className="t-crossfade-layer"
            data-state={exiting ? "exit" : leaving !== null ? "enter" : "idle"}
            inert={exiting}
            aria-hidden={exiting || undefined}
            style={direction ? ({ "--t-dir": direction(layer) } as CSSProperties) : undefined}
          >
            {children(layer)}
          </div>
        );
      })}
    </div>
  );
}
