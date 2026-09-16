"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";

import { SFSymbol, type SFSymbolName } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import { ColorPicker } from "./color-picker";
import { LucideIcon, useLucideIcons } from "./lucide-icons";
import { NumberField } from "./number-field";
import { moveRadioSelection } from "./radio-keys";
import { fontStacks, iconChoices, iconLabel } from "./style-options";
import { usePresence } from "./use-presence";

/** A value the edited state sets itself. The dot resets it to what Default provides. */
export type Inheritance = {
  overridden: boolean;
  stateLabel: string;
  /** What a reset falls back to; the Default state unless a control says otherwise. */
  target?: string;
  onReset: () => void;
};

function OverrideDot({ label, inheritance }: { label: string; inheritance?: Inheritance }) {
  if (!inheritance?.overridden) return null;
  const target = inheritance.target ?? "Default";

  return (
    <button
      type="button"
      className="override-dot"
      aria-label={`Reset ${label} to ${target}`}
      title={`Set in ${inheritance.stateLabel}. Click to inherit ${target}.`}
      onClick={inheritance.onReset}
    />
  );
}

export function PropertyLabel({ label, name = label, inheritance, htmlFor }: { label: string; name?: string; inheritance?: Inheritance; htmlFor?: string }) {
  return (
    <span className="property-label" data-overridden={inheritance?.overridden || undefined}>
      <OverrideDot label={name} inheritance={inheritance} />

      {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
    </span>
  );
}

export function InspectorSection({
  title,
  children,
  actions,
}: {
  title: string;

  /** Leave empty for a heading-only row, such as an effect that is not added yet. */
  children?: ReactNode;

  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const empty = children === undefined || children === null || children === false;

  return (
    <section className="inspector-section t-acc" data-open={open && !empty} data-empty={empty || undefined}>
      <div className="inspector-section-heading">
        {empty ? (
          <span className="inspector-section-title">{title}</span>
        ) : (
          <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>
            <SFSymbol name="chevron.down" size={11} className="t-acc-chevron" />

            <span>{title}</span>
          </button>
        )}

        {actions && <div className="section-actions">{actions}</div>}
      </div>

      {!empty && (
        <div className="t-acc-panel" inert={!open}>
          <div className="t-acc-panel-inner">
            <div className="inspector-section-content">{children}</div>
          </div>
        </div>
      )}
    </section>
  );
}

export function SectionAction({ label, icon, onClick }: { label: string; icon: SFSymbolName; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-xs" aria-label={label} title={label} onClick={onClick}>
      <SFSymbol name={icon} size={11} />
    </Button>
  );
}

type SliderControlProps = {
  label: string;

  /** Accessible name when the visible label relies on its section, e.g. "Width" in Border. */
  name?: string;

  value: number;

  min: number;

  max: number;

  step?: number;

  unit?: string;

  inheritance?: Inheritance;

  onChange: (value: number) => void;
};

export function SliderControl({
  label,
  name = label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  inheritance,
  onChange,
}: SliderControlProps) {
  const percent = (next: number) => ((Math.min(max, Math.max(min, next)) - min) / (max - min)) * 100;

  // Ranges that cross zero fill from zero, so a negative offset reads as an offset rather than progress.
  const origin = percent(0);

  return (
    <div className="slider-control">
      <div className="slider-control-header">
        <PropertyLabel label={label} name={name} inheritance={inheritance} />

        <NumberField
          label={`${name} value`}
          value={value}
          min={min}
          max={max}
          step={step}
          unit={unit}
          onChange={onChange}
        />
      </div>

      <input
        aria-label={name}
        className="property-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={
          {
            "--range-from": `${Math.min(origin, percent(value))}%`,
            "--range-to": `${Math.max(origin, percent(value))}%`,
          } as CSSProperties
        }
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type CompactNumberProps = {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  inheritance?: Inheritance;
  onChange: (value: number) => void;
};

/** Compact field for effect geometry; drag the short label to scrub. */
export function CompactNumber({ label, name, value, min, max, step = 1, unit = "px", inheritance, onChange }: CompactNumberProps) {
  return (
    <div className="compact-number" data-overridden={inheritance?.overridden || undefined}>
      <OverrideDot label={name} inheritance={inheritance} />

      <NumberField prefix={label} label={`${name} value`} value={value} min={min} max={max} step={step} unit={unit} onChange={onChange} />
    </div>
  );
}

export function NumberGrid({ children }: { children: ReactNode }) {
  return <div className="number-grid">{children}</div>;
}

type ColorControlProps = {
  label: string;

  name?: string;

  context: string;

  value: string;

  swatches: string[];

  inheritance?: Inheritance;

  onChange: (value: string) => void;
};

export function ColorControl({ label, name = label, context, value, swatches, inheritance, onChange }: ColorControlProps) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const valid = typeof CSS === "undefined" || CSS.supports("color", draft);

  return (
    <div className="color-control">
      <PropertyLabel label={label} name={name} inheritance={inheritance} />

      <div className="color-field" data-invalid={valid ? undefined : ""}>
        <ColorPicker label={name} context={context} value={value} swatches={swatches} onChange={onChange} />

        <input
          className="color-value-input"
          aria-label={`${name} color`}
          aria-invalid={!valid}
          title={valid ? undefined : "Not a valid CSS color"}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => { const next = event.target.value; setDraft(next); if (CSS.supports("color", next)) onChange(next); }}
          onBlur={() => { if (!valid) setDraft(value); }}
          onKeyDown={(event) => { if (event.key === "Escape") setDraft(value); }}
        />

        {!valid && <SFSymbol name="exclamationmark.circle" size={11} className="color-field-alert" />}
      </div>
    </div>
  );
}

type Option = { value: string; label: string; name?: string };

type ChoiceControlProps = {
  label: string;
  name?: string;
  value: string;
  options: Option[];
  inheritance?: Inheritance;
  onChange: (value: string) => void;
};

export function SelectControl({ label, name = label, value, options, inheritance, onChange }: ChoiceControlProps) {
  const id = useId();

  return (
    <div className="inspector-field-row">
      <PropertyLabel label={label} name={name} inheritance={inheritance} htmlFor={id} />

      <span className="select-field">
        <select id={id} aria-label={name} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <SFSymbol name="chevron.up.chevron.down" size={10} />
      </span>
    </div>
  );
}

/** Segmented single choice. */
export function OptionControl({ label, name = label, value, options, inheritance, onChange }: ChoiceControlProps) {
  const values = options.map((option) => option.value);
  const selected = values.includes(value) ? value : values[0];

  return (
    <div className="inspector-field-row">
      <PropertyLabel label={label} name={name} inheritance={inheritance} />

      <div className="option-group" role="radiogroup" aria-label={name} onKeyDown={(event) => moveRadioSelection(event, values, selected, onChange)}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === selected}
            aria-label={option.name}
            title={option.name ?? option.label}
            tabIndex={option.value === selected ? 0 : -1}
            className="option-button"
            data-cuelume-toggle=""
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const CUSTOM_FONT = "custom";

export function FontControl({ value, inheritance, onChange }: { value: string; inheritance?: Inheritance; onChange: (value: string) => void }) {
  const isPreset = fontStacks.some((font) => font.value === value);
  const [customizing, setCustomizing] = useState(!isPreset);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
    if (!fontStacks.some((font) => font.value === value)) setCustomizing(true);
  }, [value]);

  const valid = typeof CSS === "undefined" || (draft.trim() !== "" && CSS.supports("font-family", draft));
  const custom = customizing || !isPreset;

  function commit() {
    const next = draft.trim();
    if (!valid) setDraft(value);
    else if (next !== value) onChange(next);
  }

  return (
    <>
      <SelectControl
        label="Font"
        name="Font family"
        value={custom ? CUSTOM_FONT : value}
        options={[...fontStacks, { value: CUSTOM_FONT, label: "Custom…" }]}
        inheritance={inheritance}
        onChange={(next) => {
          setCustomizing(next === CUSTOM_FONT);
          if (next !== CUSTOM_FONT) onChange(next);
        }}
      />

      {custom && (
        <input
          className="inspector-text-input inspector-text-input-block"
          aria-label="Custom font family"
          aria-invalid={!valid}
          placeholder={'"Inter", sans-serif'}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") setDraft(value);
          }}
        />
      )}
    </>
  );
}

type IconSlotControlProps = {
  label: string;

  /** Accessible name, e.g. "Leading icon". */
  name: string;

  /** Lucide icon name, or "" for none. */
  value: string;

  onChange: (value: string) => void;
};

const MAX_RESULTS = 96;

export function IconSlotControl({ label, name, value, onChange }: IconSlotControlProps) {
  const icons = useLucideIcons();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panel = usePresence(open, 150);
  const id = useId();

  const results = useMemo(() => {
    if (!icons) return [];
    const term = query.trim().toLowerCase().replace(/[\s_-]+/g, "");
    const names = term ? Object.keys(icons).filter((icon) => icon.toLowerCase().includes(term)) : iconChoices.filter((icon) => icons[icon]);
    return names.slice(0, MAX_RESULTS);
  }, [icons, query]);

  function pick(icon: string) {
    onChange(icon);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="icon-slot">
      <div className="inspector-field-row">
        <span className="control-label">{label}</span>

        <div className="icon-slot-field">
          <button
            type="button"
            className="icon-slot-trigger"
            aria-expanded={open}
            aria-controls={id}
            aria-label={`${name}: ${value ? iconLabel(value) : "None"}`}
            onClick={() => setOpen((current) => !current)}
          >
            <span className="icon-slot-glyph">{value && <LucideIcon node={icons?.[value]} size={12} />}</span>

            <span className="icon-slot-name">{value ? iconLabel(value) : "None"}</span>

            <SFSymbol name="chevron.down" size={9} className="icon-slot-chevron" />
          </button>

          {value && (
            <button type="button" className="icon-slot-clear" aria-label={`Remove ${name.toLowerCase()}`} title="Remove icon" onClick={() => pick("")}>
              <SFSymbol name="xmark" size={9} />
            </button>
          )}
        </div>
      </div>

      {panel.mounted && (
        <div id={id} className="icon-picker t-presence" data-state={panel.state} inert={!open}>
          <input
            className="icon-picker-search"
            type="search"
            aria-label={`Search ${name.toLowerCase()}`}
            placeholder="Search Lucide icons"
            value={query}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          />

          {!icons ? (
            <p className="icon-picker-empty">Loading icons…</p>
          ) : results.length === 0 ? (
            <p className="icon-picker-empty">No icons match “{query}”.</p>
          ) : (
            <div className="icon-grid" role="group" aria-label={`${name} choices`}>
              {results.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="icon-grid-button"
                  aria-pressed={icon === value}
                  aria-label={iconLabel(icon)}
                  title={iconLabel(icon)}
                  onClick={() => pick(icon)}
                >
                  <LucideIcon node={icons[icon]} size={15} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function InspectorHint({ children, tone }: { children: ReactNode; tone?: "warning" }) {
  return (
    <p className="inspector-hint" data-tone={tone}>
      {tone === "warning" && <SFSymbol name="exclamationmark.triangle" size={11} />}
      <span>{children}</span>
    </p>
  );
}
