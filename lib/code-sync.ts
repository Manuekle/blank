import { parse } from "@babel/parser";
import postcss, { type AtRule, type Rule } from "postcss";
import { BUTTON_SPEC, type ButtonStyleDNA, type ComponentDNA, type ComponentSpec, type PreviewState, type ThemeName, clampTracking, cloneButtonDNA, generateComponentCSS, isSharedStyle, styleVariables, vanillaButtonDNA } from "./component-model";

const GENERATED_START = "/* blank:generated:start */";
const GENERATED_END = "/* blank:generated:end */";

function rules(css: string, spec: ComponentSpec = BUTTON_SPEC) {
  const start = css.indexOf(GENERATED_START);
  const end = css.indexOf(GENERATED_END);
  if (start < 0 || end < start) throw new Error("Managed CSS markers are missing. Restore them to use visual controls.");
  const root = postcss.parse(css.slice(start, end));
  const result: { rule: Rule; theme: ThemeName; state: PreviewState }[] = [];
  const base = `.${spec.className}`;
  root.walkRules(rule => {
    if (!rule.selector.includes(base) || rule.selector.includes(`${base}__`) || rule.selector.includes("::")) return;
    const explicit = rule.selector.match(/data-theme="(light|dark)"/);
    const parent = rule.parent;
    const media = parent?.type === "atrule" && "params" in parent ? String(parent.params).match(/prefers-color-scheme\s*:\s*(light|dark)/) : null;
    const theme = (explicit?.[1] || media?.[1]) as ThemeName | undefined;
    if (!theme) return;
    const state = (rule.selector.match(/data-preview-state="(\w+)"/)?.[1] || "default") as PreviewState;
    result.push({ rule, theme, state });
  });
  if (result.length !== 20) throw new Error("Managed theme or state rules are missing. Restore them in code or reset the component to use visual controls.");
  return result;
}

const numeric: Record<string, keyof ButtonStyleDNA> = {
  "padding-left": "paddingX", "padding-right": "paddingX", "padding-top": "paddingY", "padding-bottom": "paddingY",
  "border-width": "borderWidth", "border-radius": "radius", "font-size": "fontSize", "font-weight": "fontWeight",
};
const variableProperties = Object.fromEntries(Object.entries(styleVariables).map(([property, variable]) => [variable, property])) as Record<string, keyof ButtonStyleDNA>;
const ringProperties = ["ringWidth", "ringOffset", "ringColor"] as const;

function decode(prop: string, value: string): Partial<ButtonStyleDNA> {
  if (["background", "color", "border-color"].includes(prop)) return { [prop === "border-color" ? "borderColor" : prop]: value };
  if (prop === "letter-spacing") {
    const em = value.match(/^(-?[\d.]+)em$/);
    if (em) return { letterSpacing: clampTracking(Number(em[1])) };
    const px = value.match(/^(-?[\d.]+)(px)?$/);
    if (px) return { letterSpacing: clampTracking(Number(px[1]) / 16) };
    return {};
  }
  if (numeric[prop] && /^-?[\d.]+(?:px)?$/.test(value)) return { [numeric[prop]]: parseFloat(value) };
  if (prop === "opacity" && /^[\d.]+$/.test(value)) return { opacity: Number(value) * 100 };
  if (prop === "padding") {
    const match = value.match(/^([\d.]+)px(?: ([\d.]+)px)?$/);
    if (match) return { paddingY: Number(match[1]), paddingX: Number(match[2] ?? match[1]) };
  }
  if (prop === "transform") {
    const match = value.match(/^translateY\((-?[\d.]+)px\) scale\(([\d.]+)\)$/);
    if (match) return { translateY: Number(match[1]), scale: Number(match[2]) * 100 };
  }
  if (prop === "box-shadow") {
    if (value === "none") return { shadowOpacity: 0, shadowBlur: 0, shadowY: 0 };
    const match = value.match(/^0 (-?[\d.]+)px ([\d.]+)px #000000([\da-f]{2})$/i);
    if (match) return { shadowY: Number(match[1]), shadowBlur: Number(match[2]), shadowOpacity: Math.round(parseInt(match[3], 16) / 255 * 100) };
  }
  if (prop === "transition" || prop === "transition-duration") {
    const match = value.match(/([\d.]+)ms/);
    if (match) return { duration: Number(match[1]) };
  }
  const variable = variableProperties[prop];
  if (variable) {
    if (variable.endsWith("Color")) return { [variable]: value };
    const amount = value.match(/^(-?[\d.]+)(?:px|%)?$/);
    return amount ? { [variable]: Number(amount[1]) } : {};
  }
  if (prop === "font-family") return { fontFamily: value };
  if (prop === "font-style" && /^(normal|italic|oblique)$/.test(value)) return { fontStyle: value };
  if (prop === "line-height" && /^[\d.]+$/.test(value)) return { lineHeight: Number(value) };
  if (prop === "text-transform" && /^(none|lowercase|capitalize)$/.test(value)) return { textTransform: value };
  if (prop === "border-style" && /^(solid|dashed|dotted|double)$/.test(value)) return { borderStyle: value };
  if (prop === "outline") {
    if (value === "none") return { ringWidth: 0 };
    const ring = value.match(/^([\d.]+)px\s+solid\s+(.+)$/);
    if (ring) return { ringWidth: Number(ring[1]), ringColor: ring[2] };
  }
  if (prop === "outline-offset" && /^-?[\d.]+px$/.test(value)) return { ringOffset: parseFloat(value) };
  return {};
}
function selectorKey(selector: string) { return selector.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").trim(); }
function parentKey(rule: Rule) {
  const parent = rule.parent;
  return parent?.type === "atrule" && "name" in parent && "params" in parent ? `${parent.name}:${String(parent.params).replace(/\s/g, "")}` : "";
}
function declarations(rule: Rule) {
  const values = new Map<string, string>();
  rule.walkDecls(decl => { values.set(decl.prop, decl.value); });
  return values;
}

// Read changed managed declarations; custom CSS stays authoritative in the preview.
export function readCSSChanges(
  previous: string,
  css: string,
  dna: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): ComponentDNA {
  postcss.parse(css); // Keep the last usable inspector values while CSS is incomplete.
  const before = rules(previous, spec);
  const after = rules(css, spec);
  const next = cloneButtonDNA(dna);
  for (const item of after) {
    const old = before.find(entry => entry.theme === item.theme && entry.state === item.state && selectorKey(entry.rule.selector) === selectorKey(item.rule.selector));
    const oldValues = old ? declarations(old.rule) : new Map<string, string>();
    const values = declarations(item.rule);
    const target = item.state === "default" ? next.themes[item.theme].base : next.themes[item.theme].states[item.state];
    const changedKeys = new Set<keyof ButtonStyleDNA>();
    for (const [prop, value] of values) {
      if (oldValues.get(prop) !== value) {
        // Returning Focus to `outline: auto` restores the browser ring.
        if (prop === "outline" && value === "auto" && item.state === "focus") {
          for (const theme of ["light", "dark"] as const) for (const key of ringProperties) delete next.themes[theme].states.focus[key];
          continue;
        }
        const decoded = decode(prop, value);
        Object.assign(target, decoded);
        for (const key of Object.keys(decoded) as (keyof ButtonStyleDNA)[]) changedKeys.add(key);
        if (item.state === "default") next.themes[item.theme].modified = [...new Set([...(next.themes[item.theme].modified ?? []), ...Object.keys(decoded) as (keyof ButtonStyleDNA)[]])];
        const other = next.themes[item.theme === "dark" ? "light" : "dark"];
        for (const key of Object.keys(decoded) as (keyof ButtonStyleDNA)[]) {
          if (!isSharedStyle(key)) continue;
          Object.assign(item.state === "default" ? other.base : other.states[item.state], { [key]: decoded[key] });
          if (item.state === "default") other.modified = [...new Set([...(other.modified ?? []), key])];
        }
      }
    }
    for (const [prop, value] of oldValues) {
      if (values.has(prop)) continue;
      for (const key of Object.keys(decode(prop, value)) as (keyof ButtonStyleDNA)[]) {
        if (changedKeys.has(key)) continue;
        if (item.state === "default") {
          Object.assign(target, { [key]: vanillaButtonDNA.themes[item.theme].base[key] });
          next.themes[item.theme].modified = next.themes[item.theme].modified?.filter(value => value !== key);
        }
        else delete target[key];
        if (isSharedStyle(key)) {
          const otherTheme = item.theme === "dark" ? "light" : "dark";
          const other = next.themes[otherTheme];
          if (item.state === "default") {
            Object.assign(other.base, { [key]: vanillaButtonDNA.themes[otherTheme].base[key] });
            other.modified = other.modified?.filter(value => value !== key);
          } else delete other.states[item.state][key];
        }
      }
    }
  }
  return next;
}

// Patch only declarations affected by a visual edit, preserving hand-written code.
export function writeVisualChanges(
  css: string,
  previous: ComponentDNA,
  next: ComponentDNA,
  spec: ComponentSpec = BUTTON_SPEC,
): string {
  const before = rules(generateComponentCSS(previous, spec), spec);
  const after = rules(generateComponentCSS(next, spec), spec);
  const start = css.indexOf(GENERATED_START);
  const end = css.indexOf(GENERATED_END);
  rules(css, spec);
  const root = postcss.parse(css.slice(start, end));
  for (let i = 0; i < after.length; i++) {
    const oldValues = declarations(before[i].rule);
    const values = declarations(after[i].rule);
    root.walkRules(rule => {
      if (selectorKey(rule.selector) !== selectorKey(after[i].rule.selector) || parentKey(rule) !== parentKey(after[i].rule)) return;
      const currentValues = declarations(rule);
      for (const prop of new Set([...oldValues.keys(), ...values.keys()])) {
        // Older documents relied on UA disabled colors. Add missing native base
        // colors without replacing any hand-written declarations.
        const missingBaseColor = after[i].state === "default" && !currentValues.has(prop)
          && ["ButtonFace", "ButtonText", "ButtonBorder"].includes(values.get(prop) ?? "");
        if (oldValues.get(prop) === values.get(prop) && !missingBaseColor) continue;
        rule.walkDecls(prop, declaration => { declaration.remove(); });
        if (values.has(prop)) rule.append({ prop, value: values.get(prop)! });
      }
    });
  }
  return css.slice(0, start) + root.toString() + css.slice(end);
}

/**
 * Adds managed helper rules (icon sizing, placeholder color…) introduced after a
 * document was saved. Rules that already exist stay exactly as written.
 */
export function upgradeManagedCSS(css: string, spec: ComponentSpec = BUTTON_SPEC): string {
  const start = css.indexOf(GENERATED_START);
  const end = css.indexOf(GENERATED_END);
  if (start < 0 || end < start || !spec.subCSS) return css;
  try {
    const root = postcss.parse(css.slice(start, end));
    const layer = root.nodes.find((node): node is AtRule => node.type === "atrule" && node.name === "layer");
    if (!layer) return css;
    const existing = new Set<string>();
    root.walkRules(rule => { existing.add(selectorKey(rule.selector)); });
    let added = false;
    postcss.parse(spec.subCSS).each(node => {
      if (node.type !== "rule" || existing.has(selectorKey(node.selector))) return;
      layer.append(node.clone());
      added = true;
    });
    return added ? css.slice(0, start) + root.toString() + css.slice(end) : css;
  } catch {
    return css;
  }
}

function findContent(tsx: string, prop: string): { start: number; end: number; value: string } | null {
  try {
    const ast = parse(tsx, { sourceType: "module", plugins: ["typescript", "jsx"] });
    function visit(node: unknown): { start: number; end: number; value: string } | null {
      if (!node || typeof node !== "object") return null;
      const entry = node as Record<string, any>;
      if (entry.type === "ObjectProperty" && entry.key?.name === prop && entry.value?.type === "AssignmentPattern" && entry.value.right.type === "StringLiteral") {
        const literal = entry.value.right;
        return { start: literal.start, end: literal.end, value: literal.value };
      }
      for (const value of Object.values(entry)) {
        if (Array.isArray(value)) { for (const child of value) { const found = visit(child); if (found) return found; } }
        else if (value && typeof value === "object") { const found = visit(value); if (found) return found; }
      }
      return null;
    }
    return visit(ast);
  } catch { return null; }
}
export function readContent(tsx: string, prop = "children"): string | null {
  return findContent(tsx, prop)?.value ?? null;
}

export function writeContent(tsx: string, prop: string, value: string): string {
  const literal = findContent(tsx, prop);
  return literal ? tsx.slice(0, literal.start) + JSON.stringify(value) + tsx.slice(literal.end) : tsx;
}

export function readLabel(tsx: string): string | null { return readContent(tsx, "children"); }
export function writeLabel(tsx: string, label: string): string {
  return writeContent(tsx, "children", label);
}
