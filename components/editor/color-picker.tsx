"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { SFSymbol } from "@/components/icons/sf-symbol";

import { readDurationMs } from "./duration";
import { NumberField } from "./number-field";
import { useShake } from "./use-shake";

type RGBA = { r: number; g: number; b: number; a: number };

/** Hue in degrees; saturation, brightness in percent; alpha 0–1. */
type HSVA = { h: number; s: number; v: number; a: number };

type Phase = "closed" | "open" | "closing";

const HEX_COLOR = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;

const POPOVER_GAP = 8;

const VIEWPORT_MARGIN = 8;

const AREA_KEYS: Record<string, [saturation: number, brightness: number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sameColor = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

let canvasContext: CanvasRenderingContext2D | null | undefined;

/** Resolves a CSS color to sRGB. Hex and `transparent` parse exactly; other syntaxes go through canvas. */
function parseColor(value: string): RGBA | null {
  const input = value.trim();
  const hex = HEX_COLOR.exec(input)?.[1];

  if (hex) {
    const digits = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join("") : hex;
    const channel = (index: number) => parseInt(digits.slice(index, index + 2), 16);

    return { r: channel(0), g: channel(2), b: channel(4), a: digits.length === 8 ? channel(6) / 255 : 1 };
  }

  if (/^transparent$/i.test(input)) return { r: 0, g: 0, b: 0, a: 0 };

  if (typeof document === "undefined") return null;

  canvasContext ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });

  if (!canvasContext) return null;

  // Canvas keeps its previous fillStyle when it rejects a value, so two sentinels expose invalid input.
  canvasContext.fillStyle = "#000000";
  canvasContext.fillStyle = input;
  const first = canvasContext.fillStyle;
  canvasContext.fillStyle = "#ffffff";
  canvasContext.fillStyle = input;

  if (canvasContext.fillStyle !== first) return null;

  canvasContext.clearRect(0, 0, 1, 1);
  canvasContext.fillRect(0, 0, 1, 1);

  const [r, g, b, alpha] = canvasContext.getImageData(0, 0, 1, 1).data;

  return { r, g, b, a: alpha / 255 };
}

function formatHex({ r, g, b, a }: RGBA, withAlpha = true) {
  const byte = (value: number) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
  const alpha = Math.round(clamp(a, 0, 1) * 255);

  return `#${byte(r)}${byte(g)}${byte(b)}${withAlpha && alpha < 255 ? byte(alpha) : ""}`;
}

function rgbaToHsva({ r, g, b, a }: RGBA): HSVA {
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  const sector = !delta ? 0 : max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;

  return { h: (sector * 60 + 360) % 360, s: max ? (delta / max) * 100 : 0, v: (max / 255) * 100, a };
}

function hsvaToRgba({ h, s, v, a }: HSVA): RGBA {
  const channel = (offset: number) => {
    const k = (offset + h / 60) % 6;

    return (v / 100) * 255 * (1 - (s / 100) * clamp(Math.min(k, 4 - k), 0, 1));
  };

  return { r: channel(5), g: channel(3), b: channel(1), a };
}

/** Keeps hue and saturation when the new color cannot express them: grays, black, fully transparent. */
function hsvaFrom(rgba: RGBA | null, previous?: HSVA): HSVA {
  if (!rgba) return previous ?? { h: 0, s: 0, v: 0, a: 1 };

  const next = rgbaToHsva(rgba);

  if (!previous) return next;
  if (next.a === 0) return { ...previous, a: 0 };
  if (next.v === 0) return { ...next, h: previous.h, s: previous.s };
  if (next.s === 0) return { ...next, h: previous.h };

  return next;
}

/**
 * Opens beside the inspector, over the canvas, so the edited row and the preview
 * stay visible. Narrow layouts fall back to below (or above) the swatch.
 */
function placePopover(popover: HTMLElement, trigger: HTMLElement) {
  const anchor = trigger.getBoundingClientRect();
  const panel = trigger.closest(".inspector")?.getBoundingClientRect();
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  let left = anchor.right - width;
  let top = anchor.bottom + POPOVER_GAP;
  let origin = "top-right";

  if (panel && panel.left - POPOVER_GAP - width >= VIEWPORT_MARGIN) {
    left = panel.left - POPOVER_GAP - width;
    top = anchor.top + anchor.height / 2 - 19;
  } else if (top + height > viewportHeight - VIEWPORT_MARGIN && anchor.top - POPOVER_GAP - height >= VIEWPORT_MARGIN) {
    top = anchor.top - POPOVER_GAP - height;
    origin = "bottom-right";
  }

  popover.style.left = `${clamp(left, VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN)}px`;
  popover.style.top = `${clamp(top, VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN)}px`;
  popover.dataset.origin = origin;
}

function closeDuration() {
  return readDurationMs("--dropdown-close-dur", 150);
}

type ColorPickerProps = {
  label: string;

  /** Theme and state being edited, shown in the popover header. */
  context: string;

  value: string;

  swatches: string[];

  onChange: (value: string) => void;
};

/**
 * Swatch trigger plus an in-app color popover (saturation/brightness, hue, opacity,
 * hex and document colors), so picking a color never leaves the editor for the OS
 * color panel. Open/close motion is the transitions.dev dropdown.
 */
export function ColorPicker({ label, context, value, swatches, onChange }: ColorPickerProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusOnOpen = useRef(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const [hsva, setHsva] = useState(() => hsvaFrom(parseColor(value)));
  const latest = useRef(hsva);
  const valueRef = useRef(value);
  valueRef.current = value;

  // Colors sent up that have not come back through `value` yet. Echoes are skipped, so
  // dragging across grays keeps its hue instead of re-deriving it from the hex.
  const pending = useRef<string[]>([]);

  useEffect(() => {
    const echo = pending.current.indexOf(value);

    if (echo !== -1) {
      pending.current = pending.current.slice(echo + 1);
      return;
    }

    pending.current = [];
    latest.current = hsvaFrom(parseColor(value), latest.current);
    setHsva(latest.current);
  }, [value]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function send(color: string) {
    const last = pending.current[pending.current.length - 1] ?? valueRef.current;

    if (sameColor(color, last)) return;

    pending.current = [...pending.current.slice(-19), color];
    onChange(color);
  }

  function commit(next: HSVA) {
    latest.current = next;
    setHsva(next);
    send(formatHex(hsvaToRgba(next)));
  }

  function update(partial: Partial<HSVA>) {
    const current = latest.current;

    // Moving hue or brightness on a fully transparent color makes it visible again.
    commit({ ...current, ...partial, a: partial.a ?? (current.a === 0 ? 1 : current.a) });
  }

  function commitHex(rgba: RGBA, hasAlpha: boolean) {
    const current = latest.current;

    commit({ ...hsvaFrom({ ...rgba, a: 1 }, current), a: hasAlpha ? rgba.a : current.a === 0 ? 1 : current.a });
  }

  function pickSwatch(color: string) {
    latest.current = hsvaFrom(parseColor(color), latest.current);
    setHsva(latest.current);
    send(color);
  }

  function pickFromArea(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    update({
      s: clamp((event.clientX - rect.left) / rect.width, 0, 1) * 100,
      v: (1 - clamp((event.clientY - rect.top) / rect.height, 0, 1)) * 100,
    });
  }

  function open() {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;

    if (!popover || !trigger) return;

    clearTimeout(closeTimer.current);
    placePopover(popover, trigger);
    setPhase("open");
  }

  function close() {
    clearTimeout(closeTimer.current);
    setPhase((current) => (current === "closed" ? current : "closing"));
    closeTimer.current = setTimeout(
      () => setPhase((current) => (current === "closing" ? "closed" : current)),
      closeDuration(),
    );
  }

  useEffect(() => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;

    if (phase !== "open" || !popover || !trigger) return;

    if (focusOnOpen.current) {
      focusOnOpen.current = false;
      areaRef.current?.focus({ preventScroll: true });
    }

    const isInside = (target: EventTarget | null) =>
      target instanceof Node && (popover.contains(target) || trigger.contains(target));

    const reposition = () => placePopover(popover, trigger);

    const dismissOutside = (event: PointerEvent) => {
      if (!isInside(event.target)) close();
    };

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (popover.contains(document.activeElement)) trigger.focus();
      close();
    };

    // Clicks inside the preview iframe never reach this document; they only blur the window.
    const dismissOnFrameFocus = () =>
      setTimeout(() => {
        if (document.activeElement instanceof HTMLIFrameElement) close();
      });

    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("keydown", dismissOnEscape);
    document.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    window.addEventListener("blur", dismissOnFrameFocus);

    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("keydown", dismissOnEscape);
      document.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("blur", dismissOnFrameFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isOpen = phase === "open";
  const opaque = formatHex(hsvaToRgba({ ...hsva, a: 1 }));
  const alpha = Math.round(hsva.a * 100);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="color-swatch-button"
        aria-label={`${label} color picker`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={(event) => {
          if (isOpen) return close();

          // Keyboard activation (detail 0) moves focus into the picker; pointer users keep their place.
          focusOnOpen.current = event.detail === 0;
          open();
        }}
      >
        <span className="color-chip" style={{ "--chip": value } as CSSProperties} />
      </button>

      <div
        ref={popoverRef}
        id={id}
        role="dialog"
        aria-labelledby={`${id}-title`}
        inert={!isOpen}
        className={`t-dropdown color-popover${isOpen ? " is-open" : phase === "closing" ? " is-closing" : ""}`}
        onBlur={(event) => {
          const next = event.relatedTarget;

          if (next instanceof Node && !popoverRef.current?.contains(next) && !triggerRef.current?.contains(next)) close();
        }}
      >
        <div className="color-popover-header">
          <strong id={`${id}-title`}>{label}</strong>

          <span>{context}</span>

          <button
            type="button"
            className="color-popover-close"
            aria-label="Close color picker"
            onClick={() => {
              triggerRef.current?.focus();
              close();
            }}
          >
            <SFSymbol name="xmark" size={10} />
          </button>
        </div>

        <div className="color-popover-body">
          <div
            ref={areaRef}
            className="color-area"
            role="slider"
            tabIndex={0}
            aria-label={`${label} saturation and brightness`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsva.s)}
            aria-valuetext={`Saturation ${Math.round(hsva.s)}%, brightness ${Math.round(hsva.v)}%`}
            style={{ "--hue": hsva.h } as CSSProperties}
            onPointerDown={(event) => {
              if (event.button !== 0) return;

              event.currentTarget.setPointerCapture(event.pointerId);
              pickFromArea(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) pickFromArea(event);
            }}
            onKeyDown={(event) => {
              const direction = AREA_KEYS[event.key];

              if (!direction) return;

              event.preventDefault();

              const step = event.shiftKey ? 10 : 1;

              update({
                s: clamp(latest.current.s + direction[0] * step, 0, 100),
                v: clamp(latest.current.v + direction[1] * step, 0, 100),
              });
            }}
          >
            <span
              className="color-area-thumb"
              style={{ left: `${hsva.s}%`, top: `${100 - hsva.v}%`, background: opaque }}
            />
          </div>

          <input
            type="range"
            className="color-slider color-slider-hue"
            aria-label={`${label} hue`}
            min={0}
            max={360}
            step={1}
            value={Math.round(hsva.h)}
            style={{ "--hue": hsva.h } as CSSProperties}
            onChange={(event) => update({ h: event.target.valueAsNumber })}
          />

          <input
            type="range"
            className="color-slider color-slider-alpha"
            aria-label={`${label} opacity`}
            min={0}
            max={100}
            step={1}
            value={alpha}
            style={{ "--opaque": opaque, "--color": formatHex(hsvaToRgba(hsva)) } as CSSProperties}
            onChange={(event) => update({ a: event.target.valueAsNumber / 100 })}
          />

          <div className="color-popover-fields">
            <HexField label={label} value={opaque.slice(1).toUpperCase()} onCommit={commitHex} />

            <NumberField
              className="color-alpha-field"
              label={`${label} opacity value`}
              value={alpha}
              min={0}
              max={100}
              unit="%"
              onChange={(percent) => update({ a: percent / 100 })}
            />
          </div>
        </div>

        {swatches.length > 0 && (
          <div className="color-popover-swatches">
            <span id={`${id}-swatches`}>Document colors</span>

            <div role="group" aria-labelledby={`${id}-swatches`}>
              {swatches.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  className="color-swatch"
                  title={swatch}
                  aria-pressed={sameColor(swatch, value)}
                  style={{ "--chip": swatch } as CSSProperties}
                  onClick={() => pickSwatch(swatch)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

type HexFieldProps = {
  label: string;

  /** RRGGBB, uppercase, without `#`. */
  value: string;

  onCommit: (rgba: RGBA, hasAlpha: boolean) => void;
};

function HexField({ label, value, onCommit }: HexFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  // A rejected hex used to snap back with no sign it was rejected.
  const { shaking, message, shake } = useShake();

  useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(value);
  }, [value]);

  // Live typing applies once a full RRGGBB or RRGGBBAA is in; short forms apply on Enter or blur.
  function apply(text: string, final: boolean) {
    const digits = text.trim().replace(/^#/, "");

    if (digits.toUpperCase() === value) return null;
    if (!final && digits.length !== 6 && digits.length !== 8) return null;

    const rgba = parseColor(`#${digits}`);

    if (rgba) onCommit(rgba, digits.length === 4 || digits.length === 8);
    else if (final && digits !== "") shake(`${digits} is not a colour. Kept #${value}.`);

    return rgba;
  }

  return (
    <label className={`color-hex-field t-input${shaking ? " is-shaking" : ""}${message ? " is-error" : ""}`}>
      <span aria-hidden="true">#</span>

      <input
        ref={inputRef}
        aria-label={`${label} hex`}
        aria-invalid={message ? true : undefined}
        value={draft}
        maxLength={9}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => {
          setDraft(event.target.value);
          apply(event.target.value, false);
        }}
        onBlur={() => {
          apply(draft, true);
          setDraft(value);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          const rgba = apply(draft, true);

          if (rgba) setDraft(formatHex({ ...rgba, a: 1 }, false).slice(1).toUpperCase());
        }}
      />

      <span className="sr-only" role="status">{message}</span>
    </label>
  );
}
