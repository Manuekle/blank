"use client";

import { useEffect, useRef, useState } from "react";

import { useShake } from "./use-shake";

type NumberFieldProps = {
  label: string;

  value: number;

  min: number;

  max: number;

  step?: number;

  unit?: string;

  /** Short visible name inside the field; dragging it scrubs the value. */
  prefix?: string;

  className?: string;

  onChange: (value: number) => void;
};

const format = (value: number) => String(Number.isInteger(value) ? value : Number(value.toFixed(3)));

/** Horizontal pointer travel, in px, per step while scrubbing. */
const SCRUB_DISTANCE = 2;

/**
 * Numeric field that lets a partial or out-of-range draft sit while typing
 * (so "14" can be typed into a 10–48 field) and clamps it on Enter or blur.
 * Shift + arrow keys step by ten.
 */
export function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  prefix,
  className,
  onChange,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(() => format(value));
  const scrub = useRef<{ x: number; value: number; moved: boolean } | null>(null);
  // Typing past the range used to clamp on blur with nothing to show for it.
  const { shaking, message, shake } = useShake();

  useEffect(() => {
    setDraft((current) => (current.trim() !== "" && Number(current) === value ? current : format(value)));
  }, [value]);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  function commit(next: number) {
    const clamped = clamp(Number(next.toFixed(6)));

    if (clamped !== value) onChange(clamped);

    setDraft(format(clamped));
  }

  function commitDraft() {
    const next = Number(draft);

    if (draft.trim() === "" || !Number.isFinite(next)) {
      setDraft(format(value));
      if (draft.trim() !== "") shake(`${label} needs a number. Kept ${format(value)}${unit ?? ""}.`);
      return;
    }

    if (next < min || next > max) {
      shake(`${label} accepts ${min} to ${max}. Set to ${format(clamp(next))}${unit ?? ""}.`);
    }

    commit(next);
  }

  return (
    <label
      className={[
        "numeric-control",
        "t-input",
        prefix && "numeric-control-prefixed",
        shaking && "is-shaking",
        message && "is-error",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {prefix && (
        <span
          className="numeric-prefix"
          aria-hidden="true"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            scrub.current = { x: event.clientX, value, moved: false };
          }}
          onPointerMove={(event) => {
            const start = scrub.current;
            if (!start || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
            const steps = Math.trunc((event.clientX - start.x) / SCRUB_DISTANCE);
            if (steps === 0 && !start.moved) return;
            start.moved = true;
            commit(start.value + steps * step * (event.shiftKey ? 10 : 1));
          }}
          onPointerUp={() => {
            // A drag must not also focus the input through the label.
            if (!scrub.current?.moved) scrub.current = null;
          }}
          onClick={(event) => {
            if (scrub.current?.moved) event.preventDefault();
            scrub.current = null;
          }}
        >
          {prefix}
        </span>
      )}

      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(event) => {
          const next = event.target.valueAsNumber;

          setDraft(event.target.value);

          if (Number.isFinite(next) && next >= min && next <= max && next !== value) onChange(next);
        }}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitDraft();
          } else if (event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
            event.preventDefault();
            commit(value + (event.key === "ArrowUp" ? step : -step) * 10);
          }
        }}
        // A focused number input changes value under the scroll wheel; scrolling the inspector must not edit it.
        onWheel={(event) => event.currentTarget.blur()}
      />

      {unit && <small>{unit}</small>}

      <span className="sr-only" role="status">{message}</span>
    </label>
  );
}
