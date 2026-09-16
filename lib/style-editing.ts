import {
  type ButtonStyleDNA,
  type ComponentDNA,
  type ComponentSpec,
  type InspectorControl,
  type PreviewState,
  type ThemeName,
  cloneButtonDNA,
  isSharedStyle,
  resolveStyle,
  updateDNAStyle,
  vanillaStyleByTheme,
} from "./component-model";

type StyleKey = keyof ButtonStyleDNA;

const allControls: InspectorControl[] = ["layout", "appearance", "typography", "icon", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"];

/** Sections per component when its spec does not list them: only what that element can render. */
const controlsById: Record<string, InspectorControl[]> = {
  input: ["layout", "appearance", "typography", "placeholder", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  textarea: ["layout", "appearance", "typography", "placeholder", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  badge: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "innerShadow", "motion"],
  label: ["layout", "appearance", "typography", "motion"],
  kbd: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "innerShadow", "motion"],
  checkbox: ["appearance", "border", "shadow", "ring", "motion"],
  switch: ["appearance", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  separator: ["layout", "appearance", "motion"],
  spinner: ["appearance", "border", "shadow", "motion"],
  skeleton: ["layout", "appearance", "border", "innerBorder", "shadow", "innerShadow", "motion"],
  slider: ["layout", "appearance", "border", "shadow", "ring", "motion"],
  progress: ["layout", "appearance", "border", "innerBorder", "shadow", "motion"],
  select: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  "native-select": ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  "radio-group": ["layout", "appearance", "typography", "motion"],
  toggle: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "innerShadow", "ring", "motion"],
  "toggle-group": ["layout", "appearance", "border", "shadow", "ring", "motion"],
  avatar: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  item: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "motion"],
  marker: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  typography: ["layout", "appearance", "typography", "motion"],
  field: ["layout", "appearance", "typography", "motion"],
  "input-group": ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "ring", "motion"],
  "input-otp": ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "ring", "motion"],
  "button-group": ["layout", "appearance", "border", "shadow", "ring", "motion"],
  table: ["layout", "appearance", "typography", "border", "motion"],
  tabs: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  accordion: ["layout", "appearance", "typography", "border", "motion"],
  collapsible: ["layout", "appearance", "typography", "border", "motion"],
  alert: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "motion"],
  card: ["layout", "appearance", "border", "innerBorder", "shadow", "innerShadow", "motion"],
  dialog: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "alert-dialog": ["layout", "appearance", "typography", "border", "shadow", "motion"],
  drawer: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  sheet: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  toast: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  tooltip: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  popover: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "dropdown-menu": ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "aspect-ratio": ["layout", "appearance", "border", "shadow", "motion"],
  attachment: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  breadcrumb: ["layout", "appearance", "typography", "motion"],
  bubble: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "motion"],
  carousel: ["layout", "appearance", "border", "shadow", "motion"],
  direction: ["layout", "appearance", "typography", "motion"],
  empty: ["layout", "appearance", "typography", "motion"],
  message: ["layout", "appearance", "typography", "motion"],
  "message-scroller": ["layout", "appearance", "typography", "motion"],
  pagination: ["layout", "appearance", "border", "shadow", "motion"],
  resizable: ["layout", "appearance", "border", "shadow", "motion"],
  "scroll-area": ["layout", "appearance", "border", "shadow", "motion"],
  calendar: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  chart: ["layout", "appearance", "border", "shadow", "motion"],
  combobox: ["layout", "appearance", "typography", "border", "innerBorder", "shadow", "ring", "motion"],
  command: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "context-menu": ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "data-table": ["layout", "appearance", "typography", "border", "motion"],
  "date-picker": ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "hover-card": ["layout", "appearance", "typography", "border", "shadow", "motion"],
  menubar: ["layout", "appearance", "typography", "border", "shadow", "motion"],
  "navigation-menu": ["layout", "appearance", "typography", "motion"],
  questionnaire: ["layout", "appearance", "typography", "motion"],
  sidebar: ["layout", "appearance", "typography", "border", "shadow", "motion"],
};

export function controlsFor(spec: ComponentSpec): readonly InspectorControl[] {
  return spec.controls ?? controlsById[spec.id] ?? allControls.filter((control) => control !== "icon");
}

const themes: ThemeName[] = ["light", "dark"];

export const editableStates: PreviewState[] = ["default", "hover", "active", "focus", "disabled"];

export function setStyle(dna: ComponentDNA, theme: ThemeName, state: PreviewState, property: StyleKey, value: string | number): ComponentDNA {
  return updateDNAStyle(dna, theme, state, property, value as never);
}

/**
 * Returns properties to their inherited value: vanilla for Default, the Default
 * value for a state. Shared properties reset in both themes, like edits do.
 */
export function resetStyleProperties(
  dna: ComponentDNA,
  theme: ThemeName,
  state: PreviewState,
  properties: StyleKey[],
  { bothThemes = false } = {},
): ComponentDNA {
  const next = cloneButtonDNA(dna);
  for (const property of properties) {
    for (const target of bothThemes || isSharedStyle(property) ? themes : [theme]) {
      const themeDNA = next.themes[target];
      if (state === "default") {
        Object.assign(themeDNA.base, { [property]: vanillaStyleByTheme[target][property] });
        themeDNA.modified = themeDNA.modified?.filter(key => key !== property);
      } else {
        delete themeDNA.states[state][property];
      }
    }
  }
  return next;
}

export function isOverridden(dna: ComponentDNA, theme: ThemeName, state: PreviewState, property: StyleKey) {
  return state !== "default" && property in dna.themes[theme].states[state];
}

/** States that change at least one property in this theme, for the state switcher. */
export function statesWithOverrides(dna: ComponentDNA, theme: ThemeName): PreviewState[] {
  return editableStates.filter(state => state !== "default" && Object.keys(dna.themes[theme].states[state]).length > 0);
}

/**
 * States the editor offers for a component. Only controls support states
 * (a card is never pressed); a state that already holds overrides from an
 * earlier edit stays listed so those styles remain editable.
 */
export function visibleStates(spec: ComponentSpec, dna: ComponentDNA): PreviewState[] {
  const overridden = new Set(themes.flatMap((theme) => statesWithOverrides(dna, theme)));
  return editableStates.filter((state) => spec.supportedStates.includes(state) || overridden.has(state));
}

export type EffectName = "shadow" | "innerShadow" | "innerBorder" | "ring";

export const effectProperties: Record<EffectName, StyleKey[]> = {
  shadow: ["shadowX", "shadowY", "shadowBlur", "shadowSpread", "shadowColor", "shadowOpacity"],
  innerShadow: ["innerShadowX", "innerShadowY", "innerShadowBlur", "innerShadowSpread", "innerShadowColor", "innerShadowOpacity"],
  innerBorder: ["innerBorderWidth", "innerBorderColor"],
  ring: ["ringWidth", "ringOffset", "ringColor"],
};

/** Zero on this property hides the effect without losing its other values. */
const effectSwitch: Record<EffectName, StyleKey> = {
  shadow: "shadowOpacity",
  innerShadow: "innerShadowOpacity",
  innerBorder: "innerBorderWidth",
  ring: "ringWidth",
};

const effectPresets: Record<EffectName, {
  visible: number;
  geometry?: Partial<Record<StyleKey, number>>;
  colors?: Record<ThemeName, Partial<Record<StyleKey, string>>>;
}> = {
  shadow: { visible: 20, geometry: { shadowY: 4, shadowBlur: 12 } },
  innerShadow: { visible: 25 },
  innerBorder: { visible: 1, colors: { light: { innerBorderColor: "#0000001a" }, dark: { innerBorderColor: "#ffffff26" } } },
  ring: { visible: 2 },
};

export function isEffectVisible(style: ButtonStyleDNA, effect: EffectName) {
  return Number(style[effectSwitch[effect]]) > 0;
}

/** Shows an effect with a visible starting point; values tuned earlier are kept. */
export function addEffect(dna: ComponentDNA, theme: ThemeName, state: PreviewState, effect: EffectName): ComponentDNA {
  const preset = effectPresets[effect];
  const style = resolveStyle(dna, theme, state);
  let next = dna;

  const geometry = effectProperties[effect].filter(key => key !== effectSwitch[effect] && typeof style[key] === "number");
  if (preset.geometry && geometry.every(key => style[key] === 0)) {
    for (const [key, value] of Object.entries(preset.geometry)) next = setStyle(next, theme, state, key as StyleKey, value);
  }

  // Untouched colors get a tint that reads on that theme's surfaces.
  for (const target of themes) {
    for (const [key, value] of Object.entries(preset.colors?.[target] ?? {})) {
      const property = key as StyleKey;
      if (resolveStyle(next, target, state)[property] === vanillaStyleByTheme[target][property]) next = setStyle(next, target, state, property, value);
    }
  }

  return setStyle(next, theme, state, effectSwitch[effect], preset.visible);
}

/**
 * Default removes the effect entirely. A state hides an effect it inherits,
 * or drops its own overrides when Default has none.
 */
export function removeEffect(dna: ComponentDNA, theme: ThemeName, state: PreviewState, effect: EffectName): ComponentDNA {
  const cleared = resetStyleProperties(dna, theme, state, effectProperties[effect], { bothThemes: true });
  if (state === "default" || !isEffectVisible(resolveStyle(cleared, theme, state), effect)) return cleared;
  return setStyle(cleared, theme, state, effectSwitch[effect], 0);
}

/**
 * native: the browser focus ring (Focus only, while Default draws no ring).
 * custom: an outline with its own width, offset and color. none: no outline.
 */
export type RingMode = "native" | "custom" | "none";

export function ringMode(dna: ComponentDNA, theme: ThemeName, state: PreviewState): RingMode {
  if (resolveStyle(dna, theme, state).ringWidth > 0) return "custom";
  return state === "focus" && !("ringWidth" in dna.themes[theme].states.focus) ? "native" : "none";
}

export function setRingMode(dna: ComponentDNA, theme: ThemeName, state: PreviewState, mode: RingMode): ComponentDNA {
  if (mode === "custom") return ringMode(dna, theme, state) === "custom" ? dna : addEffect(dna, theme, state, "ring");
  if (mode === "native") return resetStyleProperties(dna, theme, "focus", effectProperties.ring, { bothThemes: true });
  if (state === "default") return resetStyleProperties(dna, theme, state, effectProperties.ring, { bothThemes: true });
  return setStyle(resetStyleProperties(dna, theme, state, ["ringWidth"]), theme, state, "ringWidth", 0);
}
