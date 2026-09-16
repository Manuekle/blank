import type { CSSProperties } from "react";

export type PreviewState =
  | "default"
  | "hover"
  | "active"
  | "focus"
  | "disabled";

export type ThemeName = "light" | "dark";

export type EditorMode = "design" | "code" | "ai";

export type ComponentFileName = string;

/**
 * Everything that differs between primitives. The style DNA stays shared
 * (colors, spacing, radius, motion…), but files, export name, className,
 * editable content prop, sub-CSS and supported states belong to the spec.
 */
export type ComponentSpec = {
  id: string;
  name: string;
  fileName: string;
  exportName: string;
  className: string;
  vanillaTSX: string;
  /** AST key of the editable text default, e.g. "children" or "placeholder". */
  contentProp: string | null;
  contentLabel: string;
  defaultContent: string;
  /** Extra managed CSS appended after the shared rules. */
  subCSS: string;
  supportedStates: readonly PreviewState[];
  /** Inspector sections this component offers; see controlsFor() for defaults. */
  controls?: readonly InspectorControl[];
  /** Props that take an icon; the inspector shows a Lucide picker for each. */
  iconSlots?: readonly { prop: string; label: string }[];
  /** Template forks without managed CSS: code-only, so visual controls stay off. */
  visual?: boolean;
};

export type InspectorControl =
  | "layout"
  | "appearance"
  | "typography"
  | "placeholder"
  | "icon"
  | "border"
  | "innerBorder"
  | "shadow"
  | "innerShadow"
  | "ring"
  | "motion";

export type ButtonStyleDNA = {
  fontFamily: string;
  fontStyle: string;
  lineHeight: number;
  textTransform: string;
  placeholderColor: string;
  borderStyle: string;
  innerBorderWidth: number;
  innerBorderColor: string;
  ringWidth: number;
  ringOffset: number;
  ringColor: string;
  shadowX: number;
  shadowSpread: number;
  shadowColor: string;
  innerShadowX: number;
  innerShadowY: number;
  innerShadowBlur: number;
  innerShadowSpread: number;
  innerShadowOpacity: number;
  innerShadowColor: string;
  iconSize: number;
  iconGap: number;
  background: string;
  color: string;

  borderColor: string;
  borderWidth: number;
  radius: number;

  paddingX: number;
  paddingY: number;

  fontSize: number;
  fontWeight: number;
  letterSpacing: number;

  opacity: number;

  shadowBlur: number;
  shadowY: number;
  shadowOpacity: number;

  scale: number;
  translateY: number;

  duration: number;
};

export type ButtonThemeDNA = {
  base: ButtonStyleDNA;
  modified?: Array<keyof ButtonStyleDNA>;

  states: {
    hover: Partial<ButtonStyleDNA>;
    active: Partial<ButtonStyleDNA>;
    focus: Partial<ButtonStyleDNA>;
    disabled: Partial<ButtonStyleDNA>;
  };
};

/**
 * Figma-style per-child overrides. Nodes are addressed by their semantic
 * `blank-*__*` class, so the emitted CSS stays portable with the exported TSX.
 */
export type NodeStyleDNA = {
  /** Visual offset from the node's place in the layout; siblings never move. */
  x: number;
  y: number;
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  background: string;
  color: string;
  radius: number;
  opacity: number;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  alignSelf: "auto" | "start" | "center" | "end" | "stretch";
  textAlign: "start" | "center" | "end";
};

/**
 * Only the properties a child sets are stored; the rest keep the component CSS.
 * Plain inline boxes ignore `translate`, so their offset uses relative positioning.
 */
export type NodeOverrides = Partial<NodeStyleDNA> & { offsetMode?: "relative" };

/** Shown until the preview reports the child's computed style. */
export const vanillaNodeStyle: NodeStyleDNA = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  paddingX: 0,
  paddingY: 0,
  background: "transparent",
  color: "currentColor",
  radius: 0,
  opacity: 100,
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: 0,
  alignSelf: "auto",
  textAlign: "start",
};

export type ComponentDNA = {
  content: string;

  /** Preview prop values chosen in the inspector, e.g. { leftIcon: "ArrowRight" }. */
  props?: Record<string, string>;

  /** Child overrides keyed by node class, e.g. "blank-card__footer". */
  nodes?: Record<string, NodeOverrides>;

  themes: {
    light: ButtonThemeDNA;
    dark: ButtonThemeDNA;
  };
};

/** Backwards-compatible alias. */
export type ButtonDNA = ComponentDNA;

export type ComponentFiles = {
  tsx: string;
  css: string;
};

// Themes vary their colors; geometry and interaction values belong to one button.
export function isSharedStyle(property: keyof ButtonStyleDNA): boolean {
  return property !== "background" && property !== "color" && !property.endsWith("Color");
}

export const extendedStyleDefaults = {
  fontFamily: "system-ui, sans-serif", fontStyle: "normal", lineHeight: 1.2, textTransform: "none", placeholderColor: "#8c8c8c",
  borderStyle: "solid", innerBorderWidth: 0, innerBorderColor: "#000000",
  ringWidth: 0, ringOffset: 2, ringColor: "#3b82f6",
  shadowX: 0, shadowSpread: 0, shadowColor: "#000000",
  innerShadowX: 0, innerShadowY: 2, innerShadowBlur: 4, innerShadowSpread: 0,
  innerShadowOpacity: 0, innerShadowColor: "#000000", iconSize: 16, iconGap: 8,
};

const lightVanillaStyle: ButtonStyleDNA = {
  ...extendedStyleDefaults,
  background: "transparent",
  color: "#111111",

  borderColor: "#111111",
  borderWidth: 0,
  radius: 0,

  paddingX: 0,
  paddingY: 0,

  fontSize: 14,
  fontWeight: 400,
  letterSpacing: 0,

  opacity: 100,

  shadowBlur: 0,
  shadowY: 0,
  shadowOpacity: 0,

  scale: 100,
  translateY: 0,

  duration: 180,
};

const darkVanillaStyle: ButtonStyleDNA = {
  ...extendedStyleDefaults,
  background: "transparent",
  color: "#f3f3f3",

  borderColor: "#f3f3f3",
  borderWidth: 0,
  radius: 0,

  paddingX: 0,
  paddingY: 0,

  fontSize: 14,
  fontWeight: 400,
  letterSpacing: 0,

  opacity: 100,

  shadowBlur: 0,
  shadowY: 0,
  shadowOpacity: 0,

  scale: 100,
  translateY: 0,

  duration: 180,
};

export const vanillaStyleByTheme: Record<ThemeName, ButtonStyleDNA> = {
  light: lightVanillaStyle,
  dark: darkVanillaStyle,
};

/**
 * Tracking is intentionally restricted: normal (0) or tighter,
 * down to -0.05em. Wide / wider spacing is never emitted.
 */
export const TRACKING_MIN = -0.05;

export const TRACKING_MAX = 0;

export function clampTracking(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(TRACKING_MAX, Math.max(TRACKING_MIN, value));
}

function createVanillaTheme(theme: ThemeName): ButtonThemeDNA {
  return {
    base: {
      ...vanillaStyleByTheme[theme],
    },

    states: {
      hover: {},
      active: {},
      focus: {},
      disabled: {},
    },
  };
}

export const vanillaButtonDNA: ComponentDNA = {
  content: "Button",

  themes: {
    light: createVanillaTheme("light"),
    dark: createVanillaTheme("dark"),
  },
};

export const defaultButtonTSX = `import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /**
     * Shows a loading indicator and disables the button.
     */
    loading?: boolean;

    /**
     * Content rendered before the label.
     */
    leftIcon?: ReactNode;

    /**
     * Content rendered after the label.
     */
    rightIcon?: ReactNode;

    /**
     * Makes the button fill its parent width.
     */
    fullWidth?: boolean;
  };

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  {
    children = "Button",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = "",
    disabled,
    type = "button",
    style,
    ...props
  },
  ref,
) {
  const isDisabled =
    disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      className={[
        "blank-button",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width:
          fullWidth
            ? "100%"
            : undefined,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          className="blank-button__spinner"
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span
            className="blank-button__icon"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )
      )}

      <span className="blank-button__label">
        {children}
      </span>

      {!loading && rightIcon && (
        <span
          className="blank-button__icon"
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
});
`;

const buttonSubCSS = `.blank-button {
  cursor: pointer;
}
.blank-button__label, .blank-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.blank-button__icon {
  vertical-align: middle;
}
.blank-button__icon:has(+ .blank-button__label) { margin-inline-end: var(--blank-icon-gap, 8px); }
.blank-button__label + .blank-button__icon { margin-inline-start: var(--blank-icon-gap, 8px); }
.blank-button__icon svg { width: var(--blank-icon-size, 16px); height: var(--blank-icon-size, 16px); display: block; }
.blank-button__spinner {
  width: 1em;
  height: 1em;
  display: inline-block;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: blank-button-spin 600ms linear infinite;
}
@keyframes blank-button-spin {
  to { transform: rotate(360deg); }
}`;

export const BUTTON_SPEC: ComponentSpec = {
  id: "button",
  name: "Button",
  fileName: "Button.tsx",
  exportName: "Button",
  className: "blank-button",
  vanillaTSX: defaultButtonTSX,
  contentProp: "children",
  contentLabel: "Label",
  defaultContent: "Button",
  subCSS: buttonSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
  controls: ["layout", "appearance", "typography", "icon", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  iconSlots: [
    { prop: "leftIcon", label: "Leading" },
    { prop: "rightIcon", label: "Trailing" },
  ],
};

const GENERATED_START = "/* blank:generated:start */";

const GENERATED_END = "/* blank:generated:end */";

const CUSTOM_START = "/* blank:custom:start */";

const CUSTOM_END = "/* blank:custom:end */";

function cloneThemeDNA(source: ButtonThemeDNA): ButtonThemeDNA {
  return {
    modified: [...(source.modified ?? [])],
    base: {
      ...source.base,
    },

    states: {
      hover: {
        ...source.states.hover,
      },

      active: {
        ...source.states.active,
      },

      focus: {
        ...source.states.focus,
      },

      disabled: {
        ...source.states.disabled,
      },
    },
  };
}

export function cloneButtonDNA(source: ComponentDNA): ComponentDNA {
  return {
    content: source.content,

    ...(source.props ? { props: { ...source.props } } : {}),

    ...(source.nodes
      ? {
          nodes: Object.fromEntries(
            Object.entries(source.nodes).map(([key, style]) => [key, { ...style }]),
          ),
        }
      : {}),

    themes: {
      light: cloneThemeDNA(source.themes.light),

      dark: cloneThemeDNA(source.themes.dark),
    },
  };
}

export function createVanillaNodeStyle(): NodeStyleDNA {
  return { ...vanillaNodeStyle };
}

/** Semantic child classes such as `blank-card__footer`; the pattern also keeps them safe as selectors. */
export function isNodeKey(key: string): boolean {
  return /^blank-[A-Za-z0-9_-]+__[A-Za-z0-9_-]+$/.test(key);
}

/** Applies a patch to a child's overrides; `undefined` removes a property. */
function mergeNodeOverrides(current: NodeOverrides, patch: NodeOverrides): NodeOverrides {
  const overrides: Record<string, unknown> = { ...current };

  for (const [property, value] of Object.entries(patch)) {
    if (value === undefined) delete overrides[property];
    else overrides[property] = property === "letterSpacing" ? clampTracking(value as number) : value;
  }

  // The offset mode only describes an offset.
  if (overrides.x === undefined && overrides.y === undefined) delete overrides.offsetMode;

  return overrides as NodeOverrides;
}

export function setNodeStyle(
  dna: ComponentDNA,
  node: string,
  patch: NodeOverrides,
): ComponentDNA {
  const next = cloneButtonDNA(dna);
  const overrides = mergeNodeOverrides(next.nodes?.[node] ?? {}, patch);
  const nodes = { ...(next.nodes ?? {}) };

  if (Object.keys(overrides).length > 0) nodes[node] = overrides;
  else delete nodes[node];

  if (Object.keys(nodes).length > 0) next.nodes = nodes;
  else delete next.nodes;

  return next;
}

export function resetNodeProperties(
  dna: ComponentDNA,
  node: string,
  properties: Array<keyof NodeOverrides>,
): ComponentDNA {
  return setNodeStyle(dna, node, Object.fromEntries(properties.map((property) => [property, undefined])));
}

export function resetNodeStyle(dna: ComponentDNA, node: string): ComponentDNA {
  const next = cloneButtonDNA(dna);
  if (next.nodes) {
    delete next.nodes[node];
    if (Object.keys(next.nodes).length === 0) delete next.nodes;
  }
  return next;
}

const nodeNumberProperties = ["x", "y", "width", "height", "paddingX", "paddingY", "radius", "opacity", "fontSize", "fontWeight", "letterSpacing"] as const;
const alignSelfValues: readonly string[] = ["auto", "start", "center", "end", "stretch"];
const textAlignValues: readonly string[] = ["start", "center", "end"];

/**
 * Documents saved before overrides were partial stored every property, with
 * unset sentinels and drag offsets written as margins.
 */
function upgradeLegacyNode(style: Record<string, unknown>): Record<string, unknown> {
  const number = (property: string, fallback: number) => (typeof style[property] === "number" ? (style[property] as number) : fallback);
  const next: Record<string, unknown> = {};

  if (number("marginX", 0) !== 0 || number("marginY", 0) !== 0) Object.assign(next, { x: number("marginX", 0), y: number("marginY", 0) });
  if (number("paddingX", 0) !== 0 || number("paddingY", 0) !== 0) Object.assign(next, { paddingX: number("paddingX", 0), paddingY: number("paddingY", 0) });
  if (typeof style.width === "number") next.width = style.width;
  if (typeof style.height === "number") next.height = style.height;
  if (style.background !== "transparent") next.background = style.background;
  if (style.color !== "inherit") next.color = style.color;
  if (number("radius", 0) !== 0) next.radius = style.radius;
  if (number("opacity", 100) !== 100) next.opacity = style.opacity;
  if (number("fontSize", 0) !== 0) next.fontSize = style.fontSize;
  if (number("fontWeight", 400) !== 400) next.fontWeight = style.fontWeight;
  if (number("letterSpacing", 0) !== 0) next.letterSpacing = style.letterSpacing;
  if (style.alignSelf !== "auto") next.alignSelf = style.alignSelf;
  if (style.textAlign !== "start") next.textAlign = style.textAlign;

  return next;
}

/** Validates stored child overrides and drops anything that cannot be emitted as CSS. */
export function normalizeNodeOverrides(value: unknown): Record<string, NodeOverrides> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const nodes: Record<string, NodeOverrides> = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!isNodeKey(key) || !entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const raw = entry as Record<string, unknown>;
    const source = "marginX" in raw || "marginY" in raw ? upgradeLegacyNode(raw) : raw;
    const patch: Record<string, unknown> = {};

    for (const property of nodeNumberProperties) {
      const number = source[property];
      if (typeof number === "number" && Number.isFinite(number)) patch[property] = number;
    }

    for (const property of ["background", "color"]) {
      const color = source[property];
      // Colors are written into a declaration, so they must not be able to close it.
      if (typeof color === "string" && color.trim() && !/[;{}]/.test(color)) patch[property] = color.trim();
    }

    if (typeof source.alignSelf === "string" && alignSelfValues.includes(source.alignSelf)) patch.alignSelf = source.alignSelf;
    if (typeof source.textAlign === "string" && textAlignValues.includes(source.textAlign)) patch.textAlign = source.textAlign;
    if (source.offsetMode === "relative") patch.offsetMode = "relative";

    const overrides = mergeNodeOverrides({}, patch as NodeOverrides);
    if (Object.keys(overrides).length > 0) nodes[key] = overrides;
  }

  return Object.keys(nodes).length > 0 ? nodes : undefined;
}

function nodeDeclarations(style: NodeOverrides): string[] {
  const lines: string[] = [];
  const add = (property: string, value: string | number) => lines.push(`  ${property}: ${value};`);

  if (style.x !== undefined || style.y !== undefined) {
    const x = style.x ?? 0;
    const y = style.y ?? 0;

    // Offsets never reflow siblings or resize the parent.
    if (style.offsetMode === "relative") {
      add("position", "relative");
      add("left", `${x}px`);
      add("top", `${y}px`);
    } else {
      add("translate", `${x}px ${y}px`);
    }
  }

  if (style.width !== undefined) add("width", `${style.width}px`);
  if (style.height !== undefined) add("height", `${style.height}px`);
  if (style.paddingX !== undefined) add("padding-inline", `${style.paddingX}px`);
  if (style.paddingY !== undefined) add("padding-block", `${style.paddingY}px`);
  if (style.background !== undefined) add("background", style.background);
  if (style.color !== undefined) add("color", style.color);
  if (style.radius !== undefined) add("border-radius", `${style.radius}px`);
  if (style.opacity !== undefined) add("opacity", Number((style.opacity / 100).toFixed(4)));
  if (style.fontSize !== undefined) add("font-size", `${style.fontSize}px`);
  if (style.fontWeight !== undefined) add("font-weight", style.fontWeight);
  if (style.letterSpacing !== undefined) add("letter-spacing", `${clampTracking(style.letterSpacing)}em`);
  if (style.alignSelf !== undefined) add("align-self", style.alignSelf);
  if (style.textAlign !== undefined) add("text-align", style.textAlign);

  return lines;
}

const NODES_START = "/* blank:nodes:start */";
const NODES_END = "/* blank:nodes:end */";

/** Child overrides live in their own managed section so hand edits stay intact. */
export function generateNodeCSS(
  dna: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): string {
  const nodes = dna.nodes ?? {};

  const rules = Object.entries(nodes)
    .map(([node, style]) => {
      const lines = isNodeKey(node) ? nodeDeclarations(style) : [];
      if (lines.length === 0) return "";
      return `.${spec.className} .${node} {\n${lines.join("\n")}\n}`;
    })
    .filter(Boolean);

  return `${NODES_START}
${rules.length > 0 ? rules.join("\n\n") : "/* No child overrides yet. */"}
${NODES_END}`;
}

export function replaceNodeCSS(
  css: string,
  dna: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): string {
  const generated = generateNodeCSS(dna, spec);
  const start = css.indexOf(NODES_START);
  const end = css.indexOf(NODES_END);

  if (start === -1 || end === -1 || end < start) {
    return `${css.replace(/\s*$/, "\n")}\n${generated}\n`;
  }

  return css.slice(0, start) + generated + css.slice(end + NODES_END.length);
}

function alphaHex(percentage: number): string {
  const normalized = Math.max(0, Math.min(100, percentage));

  return Math.round((normalized / 100) * 255)
    .toString(16)
    .padStart(2, "0");
}

function createShadow(style: ButtonStyleDNA): string {
  const alpha = (color: string, opacity: number) => `color-mix(in srgb, ${color} ${opacity}%, transparent)`;
  return [
    `inset 0 0 0 ${style.innerBorderWidth}px ${style.innerBorderColor}`,
    `inset ${style.innerShadowX}px ${style.innerShadowY}px ${style.innerShadowBlur}px ${style.innerShadowSpread}px ${alpha(style.innerShadowColor, style.innerShadowOpacity)}`,
    `${style.shadowX}px ${style.shadowY}px ${style.shadowBlur}px ${style.shadowSpread}px ${alpha(style.shadowColor, style.shadowOpacity)}`,
  ].join(", ");
}

export const shadowProperties: (keyof ButtonStyleDNA)[] = ["shadowX", "shadowY", "shadowBlur", "shadowSpread", "shadowOpacity", "shadowColor", "innerShadowX", "innerShadowY", "innerShadowBlur", "innerShadowSpread", "innerShadowOpacity", "innerShadowColor", "innerBorderWidth", "innerBorderColor"];

const ringProperties: (keyof ButtonStyleDNA)[] = ["ringWidth", "ringOffset", "ringColor"];

function cssVariable(property: keyof ButtonStyleDNA) {
  return `--blank-${property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
}

function variableValue(source: ButtonStyleDNA, property: keyof ButtonStyleDNA) {
  const unit = property.endsWith("Color") ? "" : property.endsWith("Opacity") ? "%" : "px";
  return `${source[property]}${unit}`;
}

/** Styles carried by custom properties, e.g. shadowBlur → --blank-shadow-blur. */
export const styleVariables = Object.fromEntries(
  [...shadowProperties, "iconSize", "iconGap", "placeholderColor"].map(property => [property, cssVariable(property as keyof ButtonStyleDNA)]),
) as Partial<Record<keyof ButtonStyleDNA, string>>;

// Each layer reads variables, so a state that changes one value keeps the rest from Default.
const layer = (property: keyof ButtonStyleDNA) => `var(${cssVariable(property)}, ${variableValue(lightVanillaStyle, property)})`;
const tint = (color: keyof ButtonStyleDNA, opacity: keyof ButtonStyleDNA) => `color-mix(in srgb, ${layer(color)} ${layer(opacity)}, transparent)`;
const layeredShadowCSS = [
  `inset 0 0 0 ${layer("innerBorderWidth")} ${layer("innerBorderColor")}`,
  `inset ${layer("innerShadowX")} ${layer("innerShadowY")} ${layer("innerShadowBlur")} ${layer("innerShadowSpread")} ${tint("innerShadowColor", "innerShadowOpacity")}`,
  `${layer("shadowX")} ${layer("shadowY")} ${layer("shadowBlur")} ${layer("shadowSpread")} ${tint("shadowColor", "shadowOpacity")}`,
].join(", ");

/** Declarations for the properties a rule sets, in a stable order. */
function styleDeclarations(source: ButtonStyleDNA, sets: (property: keyof ButtonStyleDNA) => boolean): string[] {
  const lines: string[] = [];
  const add = (property: string, value: string | number) => lines.push(`  ${property}: ${value};`);

  if (sets("paddingX")) { add("padding-left", `${source.paddingX}px`); add("padding-right", `${source.paddingX}px`); }
  if (sets("paddingY")) { add("padding-top", `${source.paddingY}px`); add("padding-bottom", `${source.paddingY}px`); }
  if (sets("background")) add("background", source.background);
  if (sets("color")) add("color", source.color);
  if (sets("borderColor")) add("border-color", source.borderColor);
  if (sets("borderWidth") || sets("borderStyle")) add("border-style", source.borderStyle);
  if (sets("borderWidth")) add("border-width", `${source.borderWidth}px`);
  if (sets("radius")) add("border-radius", `${source.radius}px`);
  if (sets("fontFamily")) add("font-family", source.fontFamily);
  if (sets("fontSize")) add("font-size", `${source.fontSize}px`);
  if (sets("fontWeight")) add("font-weight", source.fontWeight);
  if (sets("fontStyle")) add("font-style", source.fontStyle);
  if (sets("lineHeight")) add("line-height", source.lineHeight);
  if (sets("letterSpacing")) add("letter-spacing", `${source.letterSpacing}em`);
  if (sets("textTransform")) add("text-transform", source.textTransform);
  if (sets("opacity")) add("opacity", source.opacity / 100);

  const effects = shadowProperties.filter(sets);
  for (const property of effects) add(cssVariable(property), variableValue(source, property));
  if (effects.length > 0) add("box-shadow", layeredShadowCSS);

  for (const property of ["iconSize", "iconGap", "placeholderColor"] as const) {
    if (sets(property)) add(cssVariable(property), variableValue(source, property));
  }

  if (sets("scale") || sets("translateY")) { add("transform", createTransform(source)); add("transform-origin", "center"); }

  return lines;
}

function ringDeclarations(source: ButtonStyleDNA): string[] {
  return source.ringWidth > 0
    ? [`  outline: ${source.ringWidth}px solid ${source.ringColor};`, `  outline-offset: ${source.ringOffset}px;`]
    : ["  outline: none;"];
}

function createTransform(style: ButtonStyleDNA): string {
  return `translateY(${style.translateY}px) scale(${style.scale / 100})`;
}

function getThemeDNA(dna: ButtonDNA, theme: ThemeName): ButtonThemeDNA {
  return dna.themes[theme];
}

function getVanillaStyle(theme: ThemeName): ButtonStyleDNA {
  return vanillaStyleByTheme[theme];
}

function isBaseModified<K extends keyof ButtonStyleDNA>(
  dna: ButtonDNA,
  theme: ThemeName,
  property: K,
): boolean {
  return (
    dna.themes[theme].modified?.includes(property) ||
    dna.themes[theme].base[property] !== getVanillaStyle(theme)[property]
  );
}

/**
 * The CSS properties each style key writes, used to build an explicit
 * transition list. `transition: all` would also animate whatever the author
 * adds to the exported stylesheet by hand, which is the kind of surprise a
 * generated file should not ship.
 *
 * Keys absent here write only custom properties, which do not animate unless
 * they are registered with `@property`, so listing them would change nothing.
 */
const transitionedProperties: Partial<Record<keyof ButtonStyleDNA, readonly string[]>> = {
  paddingX: ["padding-left", "padding-right"],
  paddingY: ["padding-top", "padding-bottom"],
  background: ["background-color"],
  color: ["color"],
  borderColor: ["border-color"],
  borderWidth: ["border-width"],
  radius: ["border-radius"],
  fontSize: ["font-size"],
  fontWeight: ["font-weight"],
  lineHeight: ["line-height"],
  letterSpacing: ["letter-spacing"],
  opacity: ["opacity"],
  scale: ["transform"],
  translateY: ["transform"],
  ringWidth: ["outline-width"],
  ringColor: ["outline-color"],
  ringOffset: ["outline-offset"],
};

/** Every state override resolves to `box-shadow`, whichever layer it edits. */
const shadowTransition = "box-shadow";

/**
 * The properties any state of this theme actually changes, in a stable order.
 * Empty when nothing is overridden, so the caller can skip the declaration.
 */
function transitionList(dna: ButtonDNA, theme: ThemeName): string[] {
  const states = dna.themes[theme].states;
  const keys = new Set<keyof ButtonStyleDNA>();
  for (const state of [states.hover, states.active, states.focus, states.disabled]) {
    for (const key of Object.keys(state) as Array<keyof ButtonStyleDNA>) keys.add(key);
  }

  const properties: string[] = [];
  const push = (property: string) => { if (!properties.includes(property)) properties.push(property); };

  for (const key of keys) {
    if (shadowProperties.includes(key)) push(shadowTransition);
    for (const property of transitionedProperties[key] ?? []) push(property);
  }

  return properties;
}

function themeHasStateOverrides(dna: ButtonDNA, theme: ThemeName): boolean {
  const states = dna.themes[theme].states;

  return (
    Object.keys(states.hover).length > 0 ||
    Object.keys(states.active).length > 0 ||
    Object.keys(states.focus).length > 0 ||
    Object.keys(states.disabled).length > 0
  );
}

export function resolveStyle(
  dna: ButtonDNA,
  theme: ThemeName,
  state: PreviewState,
): ButtonStyleDNA {
  const themeDNA = getThemeDNA(dna, theme);

  if (state === "default") {
    return themeDNA.base;
  }

  return {
    ...themeDNA.base,
    ...themeDNA.states[state],
  };
}

function applyCSSProperty(
  result: CSSProperties,
  property: keyof ButtonStyleDNA,
  source: ButtonStyleDNA,
) {
  switch (property) {
    case "background":
      result.background = source.background;
      break;

    case "color":
      result.color = source.color;
      break;

    case "borderColor":
      result.borderColor = source.borderColor;
      break;

    case "borderWidth":
      result.borderWidth = source.borderWidth;

      result.borderStyle = "solid";
      break;

    case "radius":
      result.borderRadius = source.radius;
      break;

    case "paddingX":
      result.paddingLeft = source.paddingX;

      result.paddingRight = source.paddingX;
      break;

    case "paddingY":
      result.paddingTop = source.paddingY;

      result.paddingBottom = source.paddingY;
      break;

    case "fontSize":
      result.fontSize = source.fontSize;
      break;

    case "fontWeight":
      result.fontWeight = source.fontWeight;
      break;

    case "letterSpacing":
      result.letterSpacing = `${source.letterSpacing}em`;
      break;

    case "opacity":
      result.opacity = source.opacity / 100;
      break;

    case "shadowBlur":
    case "shadowY":
    case "shadowOpacity":
      result.boxShadow = createShadow(source);
      break;

    case "scale":
    case "translateY":
      result.transform = createTransform(source);

      result.transformOrigin = "center";
      break;

    case "duration":
      result.transition = `all ${source.duration}ms cubic-bezier(.2,.8,.2,1)`;
      break;
  }
}

export function createDesignPreviewStyle(
  dna: ButtonDNA,
  theme: ThemeName,
  state: PreviewState,
): CSSProperties {
  const style: CSSProperties = {
    colorScheme: theme,
  };

  const themeDNA = getThemeDNA(dna, theme);

  const baseKeys = Object.keys(themeDNA.base) as Array<
    keyof ButtonStyleDNA
  >;

  for (const key of baseKeys) {
    if (isBaseModified(dna, theme, key)) {
      applyCSSProperty(style, key, themeDNA.base);
    }
  }

  if (
    themeHasStateOverrides(dna, theme) &&
    !isBaseModified(dna, theme, "duration")
  ) {
    style.transition = `all ${themeDNA.base.duration}ms cubic-bezier(.2,.8,.2,1)`;
  }

  if (state !== "default") {
    const overrides = themeDNA.states[state];

    const resolved = resolveStyle(dna, theme, state);

    const overrideKeys = Object.keys(overrides) as Array<
      keyof ButtonStyleDNA
    >;

    for (const key of overrideKeys) {
      applyCSSProperty(style, key, resolved);
    }
  }

  return style;
}

export function updateDNAStyle<K extends keyof ButtonStyleDNA>(
  dna: ButtonDNA,
  theme: ThemeName,
  state: PreviewState,
  property: K,
  value: ButtonStyleDNA[K],
): ButtonDNA {
  const next = cloneButtonDNA(dna);

  const safeValue =
    property === "letterSpacing"
      ? (clampTracking(value as number) as ButtonStyleDNA[K])
      : value;

  if (state === "default") {
    next.themes[theme].modified = [...new Set([...(next.themes[theme].modified ?? []), property])];
    next.themes[theme].base = {
      ...next.themes[theme].base,

      [property]: safeValue,
    };

    if (isSharedStyle(property)) {
      const other = theme === "dark" ? "light" : "dark";
      next.themes[other].base[property] = safeValue;
      next.themes[other].modified = [...new Set([...(next.themes[other].modified ?? []), property])];
    }

    return next;
  }

  next.themes[theme].states[state] = {
    ...next.themes[theme].states[state],

    [property]: safeValue,
  };

  if (isSharedStyle(property)) {
    next.themes[theme === "dark" ? "light" : "dark"].states[state][property] = safeValue;
  }

  return next;
}

export function updateBaseStyle<K extends keyof ButtonStyleDNA>(
  dna: ButtonDNA,
  theme: ThemeName,
  property: K,
  value: ButtonStyleDNA[K],
): ButtonDNA {
  return updateDNAStyle(dna, theme, "default", property, value);
}

/** Upgrade older documents that stored independent geometry per theme. */
export function shareButtonStructure(dna: ButtonDNA): ButtonDNA {
  let next = cloneButtonDNA(dna);
  for (const property of Object.keys(dna.themes.dark.base) as (keyof ButtonStyleDNA)[]) {
    if (!isSharedStyle(property)) continue;
    // The initial editor theme wins conflicts; otherwise retain the authored value.
    const source = isBaseModified(dna, "dark", property) ? "dark" : "light";
    if (isBaseModified(dna, source, property)) {
      next = updateDNAStyle(next, source, "default", property, dna.themes[source].base[property]);
    }
    for (const state of ["hover", "active", "focus", "disabled"] as const) {
      const source = property in dna.themes.dark.states[state] ? "dark" : "light";
      const value = dna.themes[source].states[state][property];
      if (value !== undefined) next = updateDNAStyle(next, source, state, property, value);
    }
  }
  return next;
}

export function resetStateDNA(
  dna: ButtonDNA,
  theme: ThemeName,
  state: PreviewState,
): ButtonDNA {
  const next = cloneButtonDNA(dna);
  const other = theme === "dark" ? "light" : "dark";

  if (state === "default") {
    next.themes[theme].modified = [];
    next.themes[theme].base = {
      ...getVanillaStyle(theme),
    };

    for (const key of Object.keys(next.themes[other].base) as (keyof ButtonStyleDNA)[]) {
      if (isSharedStyle(key)) Object.assign(next.themes[other].base, { [key]: getVanillaStyle(other)[key] });
    }
    next.themes[other].modified = next.themes[other].modified?.filter(key => !isSharedStyle(key));

    return next;
  }

  next.themes[theme].states[state] = {};
  for (const key of Object.keys(next.themes[other].states[state]) as (keyof ButtonStyleDNA)[]) {
    if (isSharedStyle(key)) delete next.themes[other].states[state][key];
  }

  return next;
}

export function resetThemeDNA(
  dna: ButtonDNA,
  theme: ThemeName,
): ButtonDNA {
  let next = resetStateDNA(dna, theme, "default");
  for (const state of ["hover", "active", "focus", "disabled"] as const) {
    next = resetStateDNA(next, theme, state);
  }
  return next;
}

export function countModifications(
  dna: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): number {
  let count = (dna.content === spec.defaultContent ? 0 : 1) + Object.values(dna.props ?? {}).filter(Boolean).length;

  for (const theme of ["light", "dark"] as const) {
    const themeDNA = dna.themes[theme];

      const keys = Object.keys(themeDNA.base) as Array<
      keyof ButtonStyleDNA
    >;

    for (const key of keys) {
      if (theme === "light" && isSharedStyle(key)) continue;
      if (isBaseModified(dna, theme, key)) {
        count++;
      }
    }

    for (const state of ["hover", "active", "focus", "disabled"] as const) {
      count += (Object.keys(themeDNA.states[state]) as (keyof ButtonStyleDNA)[])
        .filter(key => theme === "dark" || !isSharedStyle(key)).length;
    }
  }

  for (const overrides of Object.values(dna.nodes ?? {})) {
    // An offset counts once, whichever axes it moves.
    count += Object.keys(overrides).filter((key) => key !== "offsetMode" && !(key === "y" && "x" in overrides)).length;
  }

  return count;
}

export function getStateOverrideCount(
  dna: ButtonDNA,
  theme: ThemeName,
  state: PreviewState,
): number {
  if (state === "default") {
    return 0;
  }

  return Object.keys(dna.themes[theme].states[state]).length;
}

function baseDeclarations(dna: ButtonDNA, theme: ThemeName): string {
  const source = dna.themes[theme].base;
  const modified = (property: keyof ButtonStyleDNA) => isBaseModified(dna, theme, property);

  const lines = ["  all: revert;", fScheme(theme)];
  if (!modified("background")) lines.push("  background: ButtonFace;");
  if (!modified("color")) lines.push("  color: ButtonText;");
  if (!modified("borderColor")) lines.push("  border-color: ButtonBorder;");
  lines.push(...styleDeclarations(source, modified));

  if (modified("ringWidth") && source.ringWidth > 0) lines.push(...ringDeclarations(source));

  if (modified("duration") || themeHasStateOverrides(dna, theme)) {
    const properties = transitionList(dna, theme);
    // A duration set without any state override still belongs in the file:
    // it is the value the author chose, and `all` is the honest default until
    // there is a state to name properties from.
    // Longhands, because the shorthand would need the duration and easing
    // repeated after every property in the list.
    lines.push(`  transition-property: ${properties.length > 0 ? properties.join(", ") : "all"};`);
    lines.push(`  transition-duration: ${source.duration}ms;`);
    lines.push("  transition-timing-function: cubic-bezier(.2, .8, .2, 1);");
  }

  return lines.join("\n");
}

function stateDeclarations(
  dna: ButtonDNA,
  theme: ThemeName,
  state: "hover" | "active" | "focus" | "disabled",
): string {
  const overrides = dna.themes[theme].states[state];
  const resolved = resolveStyle(dna, theme, state);
  const sets = (property: keyof ButtonStyleDNA) => property in overrides;

  const lines = styleDeclarations(resolved, sets);

  // Focus keeps the browser ring until a ring is designed or removed.
  if (state === "focus") {
    if (resolved.ringWidth > 0) lines.unshift(...ringDeclarations(resolved));
    else lines.unshift(sets("ringWidth") ? "  outline: none;" : "  outline: auto;");
  } else if (ringProperties.some(sets)) {
    lines.push(...ringDeclarations(resolved));
  }

  if (sets("duration")) lines.push(`  transition-duration: ${resolved.duration}ms;`);

  return lines.length > 0 ? lines.join("\n") : `  /* Inherits ${theme} default. */`;
}

function fScheme(theme: ThemeName) { return `  color-scheme: ${theme};`; }

function themeCSS(
  dna: ComponentDNA,
  theme: ThemeName,
  spec: ComponentSpec,
  selectorPrefix = "",
): string {
  const selector = `${selectorPrefix ? selectorPrefix + " " : ""}.${spec.className}`;
  return `${selector} {
${baseDeclarations(dna, theme)}
}

` +
    (["hover", "active", "focus", "disabled"] as const).map(state => {
      const pseudo = state === "focus" ? "focus-visible" : state;
      const native = state === "disabled"
        ? `${selector}:disabled`
        : `${selector}:where(:${pseudo}:not(:disabled):not([data-preview-state]))`;
      return `${native},
${selector}:where([data-preview-state="${state}"]) {
${stateDeclarations(dna, theme, state)}
}`;
    }).join("\n\n");
}

/**
 * Theme rules use `all: revert` with a higher-specificity selector, so spec
 * sub-CSS must match that weight to keep structural declarations (display,
 * position, aspect-ratio…) from being reverted.
 */
function boostSubCSS(className: string, css: string): string {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.replace(
    new RegExp(`\\.${escaped}(?![\\w-])`, "g"),
    `.${className}.${className}`,
  );
}

export function generateComponentCSS(
  dna: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): string {
  // Code-only forks (template imports) carry no managed theme rules; their
  // whole design lives in the sub-CSS the fork was created from.
  const themeBlocks = spec.visual === false
    ? ""
    : `/* Native styles are preserved. Explicit themes override the system theme. */
@media (prefers-color-scheme: light) {
${indentBlock(themeCSS(dna, "light", spec), 2)}
}
@media (prefers-color-scheme: dark) {
${indentBlock(themeCSS(dna, "dark", spec), 2)}
}
${themeCSS(dna, "light", spec, ':is([data-theme="light"], .light)')}
${themeCSS(dna, "dark", spec, ':is([data-theme="dark"], .dark)')}
`;

  return `${GENERATED_START}
@layer blank {
${themeBlocks}${boostSubCSS(spec.className, spec.subCSS)}
/* Disabled controls never invite a click. */
.${spec.className}:disabled,
.${spec.className} :disabled,
.${spec.className}[aria-disabled="true"],
.${spec.className} [aria-disabled="true"] {
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .${spec.className} { animation: none !important; transition: none !important; }
}
}
${GENERATED_END}`;
}

/** Button-bound wrapper kept for backwards compatibility. */
export function generateButtonCSS(dna: ComponentDNA): string {
  return generateComponentCSS(dna, BUTTON_SPEC);
}

function indentBlock(value: string, spaces: number): string {
  const indentation = " ".repeat(spaces);

  return value
    .split("\n")
    .map((line) => (line.length === 0 ? line : `${indentation}${line}`))
    .join("\n");
}

export function createDefaultCSS(
  dna: ComponentDNA = vanillaButtonDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): string {
  return `${generateComponentCSS(dna, spec)}

${generateNodeCSS(dna, spec)}

${CUSTOM_START}

/*
 * Your custom CSS lives here.
 *
 * Blank never overwrites this section.
 */

${CUSTOM_END}
`;
}

export const defaultComponentFiles: ComponentFiles = {
  tsx: defaultButtonTSX,

  css: createDefaultCSS(),
};

export function createComponentFiles(spec: ComponentSpec): ComponentFiles {
  return {
    tsx: spec.vanillaTSX,
    css: createDefaultCSS({ ...vanillaButtonDNA, content: spec.defaultContent }, spec),
  };
}

/**
 * Clones a spec into a standalone custom component: its own id, file and export
 * name, so the fork and the template can live in the same workspace.
 */
export function forkSpec(source: ComponentSpec, suffix: string): ComponentSpec {
  const fileName = source.fileName.replace(/\.tsx$/, "");
  const exportName = `${source.exportName}Custom`;

  return {
    ...source,
    id: `${source.id}-fork-${suffix}`,
    name: `${source.name} Custom`,
    fileName: `${fileName}Custom.tsx`,
    exportName,
  };
}

/** Renames only the export surface; string literals like the default label stay. */
export function renameComponentExports(tsx: string, from: string, to: string): string {
  return tsx
    .replace(new RegExp(`export const ${from}\\b`, "g"), `export const ${to}`)
    .replace(new RegExp(`export function ${from}\\b`, "g"), `export function ${to}`)
    .replace(new RegExp(`export default ${from}\\b`, "g"), `export default ${to}`)
    .replace(new RegExp(`function ${from}\\(`, "g"), `function ${to}(`)
    .replace(new RegExp(`${from}\\.displayName`, "g"), `${to}.displayName`);
}

export function replaceGeneratedCSS(
  currentCSS: string,
  dna: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): string {
  const generated = generateComponentCSS(dna, spec);

  const start = currentCSS.indexOf(GENERATED_START);

  const end = currentCSS.indexOf(GENERATED_END);

  if (start === -1 || end === -1 || end < start) {
    return `${generated}

${currentCSS}`;
  }

  const before = currentCSS.slice(0, start);

  const after = currentCSS.slice(end + GENERATED_END.length);

  return `${before}${generated}${after}`;
}
