"use client";

import {
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

import { moveRadioSelection } from "./radio-keys";

type SlidingTabOption<T extends string> = {
  id: T;
  label: ReactNode;
};

type SlidingTabsProps<T extends string> = {
  label: string;
  options: Array<SlidingTabOption<T>>;
  value: T;
  onChange: (id: T) => void;
  size?: "s" | "m";
};

/**
 * Segmented tabs with a measured sliding pill.
 * Writes the active tab's offsetLeft / offsetWidth onto the pill
 * so the transition tweens between positions. Snaps without
 * animation on first paint and on resize.
 *
 * Exposed as a radio group: one choice is always active, so arrow keys move
 * the selection and only the active tab is a tab stop, like native radios.
 */
export function SlidingTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "s",
}: SlidingTabsProps<T>) {
  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const pill = pillRef.current;
    const tab = tabRefs.current.get(value);
    if (!bar || !pill || !tab) return;

    const animate = mounted.current;
    mounted.current = true;

    if (!animate) pill.style.transition = "none";
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
    pill.style.width = `${tab.offsetWidth}px`;
    if (!animate) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  }, [value]);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const pill = pillRef.current;
    if (!bar || !pill) return;

    const snap = () => {
      const tab = tabRefs.current.get(value);
      if (!tab) return;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = "";
    };

    snap();

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(snap);
      observer.observe(bar);
    }

    const onFontsReady = () => snap();
    document.fonts?.ready.then(onFontsReady).catch(() => {});

    return () => observer?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={barRef}
      role="radiogroup"
      aria-label={label}
      className={size === "m" ? "t-tabs t-tabs-m" : "t-tabs"}
      onKeyDown={(event) => moveRadioSelection(event, options.map((option) => option.id), value, onChange)}
    >
      <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" />

      {options.map((option) => {
        const selected = option.id === value;

        return (
          <button
            key={option.id}
            ref={(element) => {
              if (element) tabRefs.current.set(option.id, element);
              else tabRefs.current.delete(option.id);
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="t-tab"
            data-cuelume-toggle=""
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
