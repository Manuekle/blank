import type { CSSProperties, ReactNode } from "react";
import { Logo } from "@/components/icons/logo";
import { SFSymbol, type SFSymbolName } from "@/components/icons/sf-symbol";
import { compositionCatalog, primitiveCatalog } from "@/components/editor/component-catalog";
import { PopText, SwapText } from "@/components/editor/motion";
import { Button } from "@/components/ui/button";
import {
  type ButtonStyleDNA,
  type ComponentDNA,
  type NodeOverrides,
  cloneButtonDNA,
  countModifications,
  createComponentFiles,
  replaceGeneratedCSS,
  replaceNodeCSS,
  setNodeStyle,
  updateBaseStyle,
  vanillaButtonDNA,
} from "@/lib/component-model";
import { getSpec } from "@/lib/components/registry";

/**
 * A still of the editor for the landing hero, served at /still and
 * framed there by an iframe.
 *
 * The markup mirrors `components/editor` class for class, so the editor's
 * own stylesheets draw it: when the chrome changes, update this file to the
 * new markup and the styling follows. Nothing here holds state.
 *
 * The document is a real Alert Dialog edit. The styles go through the same
 * DNA functions the inspector calls, so the canvas CSS, the "modified"
 * count, the inspector values and the layer dots all agree.
 */

const spec = getSpec("alert-dialog");
const DOC_NAME = "Error dialog";

/** Root styles, as set from the inspector. */
const BASE_STYLES: Partial<ButtonStyleDNA> = {
  fontFamily: "system-ui, sans-serif",
  background: "#121214",
  borderWidth: 1,
  borderColor: "#2a2a2f",
  radius: 16,
  paddingX: 22,
  paddingY: 18,
  shadowY: 24,
  shadowBlur: 60,
  shadowOpacity: 55,
};

/** Child overrides, as set on the canvas layers. */
const NODE_STYLES: Record<string, NodeOverrides> = {
  "blank-alert-dialog__icon-wrapper": { color: "#ff6b6b" },
  "blank-alert-dialog__title": { fontSize: 15, fontWeight: 600 },
  "blank-alert-dialog__description": { color: "#9b9ba1", fontSize: 13 },
  "blank-alert-dialog__action": { paddingX: 14, paddingY: 8, radius: 10, background: "#1e1e22", fontSize: 13, fontWeight: 500 },
  "blank-alert-dialog__close": { width: 32, height: 32, radius: 16, background: "#1e1e22" },
  "blank-alert-dialog__footer": { paddingY: 12, color: "#8b8b91", fontSize: 12.5 },
};

/** What the DNA cannot express, written in the file's custom section. */
const CUSTOM_CSS = `.blank-alert-dialog {
  width: min(600px, 100%);
}

.blank-alert-dialog__icon-wrapper {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.blank-alert-dialog__icon,
.blank-alert-dialog__close svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.blank-alert-dialog__close svg {
  width: 14px;
  height: 14px;
}

.blank-alert-dialog__action,
.blank-alert-dialog__close {
  border: 1px solid #2e2e34;
  color: #ededf0;
}

.blank-alert-dialog .blank-alert-dialog__action--primary {
  border-color: transparent;
  background: #f3f3f5;
  color: #111113;
}

.blank-alert-dialog__footer {
  margin: 16px -22px -18px;
  border-top: 1px solid #232327;
}

.blank-alert-dialog__footer strong {
  color: #ff6b6b;
  font-weight: 600;
}
`;

/** The vanilla AlertDialog.tsx render, as the preview mounts it. */
const DIALOG_MARKUP = `<div role="alertdialog" aria-labelledby="blank-alert-dialog-title" aria-describedby="blank-alert-dialog-description" class="blank-alert-dialog" data-preview-state="default"><div class="blank-alert-dialog__card"><div class="blank-alert-dialog__content"><div class="blank-alert-dialog__icon-wrapper" aria-hidden="true"><svg class="blank-alert-dialog__icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"></circle><path d="M12 10.5V15"></path><circle cx="12" cy="7.5" r="0.75" fill="currentColor" stroke="none"></circle></svg></div><div class="blank-alert-dialog__text"><h2 id="blank-alert-dialog-title" class="blank-alert-dialog__title">${spec.defaultContent}</h2><p id="blank-alert-dialog-description" class="blank-alert-dialog__description">We apologize for the inconvenience you experienced.</p></div></div><div class="blank-alert-dialog__actions"><button type="button" class="blank-alert-dialog__action blank-alert-dialog__action--primary">Retry</button><button type="button" class="blank-alert-dialog__action blank-alert-dialog__action--secondary">Learn more</button><button type="button" aria-label="Close" class="blank-alert-dialog__close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7L17 17"></path><path d="M17 7L7 17"></path></svg></button></div></div><div class="blank-alert-dialog__footer"><span>This message will automatically close in <strong>12 sec</strong></span></div></div>`;

/** Child nodes in document order, as the preview reports them to the Layers panel. */
const LAYERS = [
  { name: "card", tag: "div", depth: 0 },
  { name: "content", tag: "div", depth: 1 },
  { name: "icon-wrapper", tag: "div", depth: 2 },
  { name: "icon", tag: "svg", depth: 3 },
  { name: "text", tag: "div", depth: 2 },
  { name: "title", tag: "h2", depth: 3 },
  { name: "description", tag: "p", depth: 3 },
  { name: "actions", tag: "div", depth: 1 },
  { name: "action", tag: "button", depth: 2, count: 2 },
  { name: "close", tag: "button", depth: 2 },
  { name: "footer", tag: "div", depth: 0 },
];

const STATES = ["Default", "Hover", "Pressed", "Focus", "Disabled"];

function buildDNA(): ComponentDNA {
  let dna = cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent });
  for (const key of Object.keys(BASE_STYLES) as Array<keyof ButtonStyleDNA>) {
    dna = updateBaseStyle(dna, "dark", key, BASE_STYLES[key]!);
  }
  for (const [node, patch] of Object.entries(NODE_STYLES)) dna = setNodeStyle(dna, node, patch);
  return dna;
}

/** The preview frame document from live-preview.tsx, with the component rendered and no runtime. */
function previewDocument(css: string) {
  return `<!doctype html><html data-theme="dark" style="color-scheme: dark"><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:transparent}body{display:grid;place-items:center;padding:32px;box-sizing:border-box}#root{width:100%;max-width:100%;display:flex;align-items:center;justify-content:center}</style><style id="component-css">${css}</style></head><body><div id="root">${DIALOG_MARKUP}</div></body></html>`;
}

function catalogIcon(name: string): SFSymbolName {
  return [...primitiveCatalog, ...compositionCatalog].find((entry) => entry.name === name)?.icon ?? "square.dashed";
}

/** Same mapping as the editor's Layers panel. */
function layerIcon(tag: string): SFSymbolName {
  if (tag === "button" || tag === "a") return "cursorarrow";
  if (["img", "svg", "picture", "video", "canvas"].includes(tag)) return "photo.stack";
  if (["span", "p", "label", "strong", "em", "small", "code", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return "textformat";
  return "square.dashed";
}

export function EditorStill() {
  const dna = buildDNA();
  const style = dna.themes.dark.base;
  const generated = replaceNodeCSS(replaceGeneratedCSS(createComponentFiles(spec).css, dna, spec), dna, spec);
  const css = generated.replace("/* blank:custom:end */", `${CUSTOM_CSS}/* blank:custom:end */`);
  const specIcon = catalogIcon(spec.name);

  return (
    <main className="editor-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-button">
            <span className="brand-mark">
              <Logo size={21} />
            </span>
            <span className="brand-word">blank</span>
          </div>
          <span className="topbar-divider" />
          <input className="document-name" aria-label="Document name" defaultValue={DOC_NAME} />
          <span className="save-state" data-state="saved">
            Saved locally
          </span>
        </div>

        {/* SlidingTabs measures its pill after mount; the still pins it to the first tab at 1280px. */}
        <Tabs
          label="Workspace"
          size="m"
          pillWidth={82}
          options={[
            <>
              <SFSymbol name="slider.horizontal.3" size={12} />
              Design
            </>,
            <>
              <SFSymbol name="chevron.left.forwardslash.chevron.right" size={13} />
              Code
            </>,
            <>
              <SFSymbol name="sparkles" size={12} />
              AI
            </>,
          ]}
        />

        <div className="topbar-actions">
          <Button variant="neutral" size="sm" leftIcon={<SFSymbol name="doc.text" size={11} />}>
            Fork
          </Button>
          <Button variant="neutral" size="sm" leftIcon={<SFSymbol name="arrow.down" size={11} />}>
            Export files
          </Button>
          <Button variant="primary" size="sm" leftIcon={<SFSymbol name="arrow.up.right" size={10} />} disabled>
            Publish
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <SFSymbol name="gearshape" size={14} />
          </Button>
        </div>
      </header>

      <div className="editor-workspace">
        <aside className="left-sidebar">
          <div className="left-sidebar-scroll">
            <SidebarHeading count={1}>Primitives</SidebarHeading>
            <div className="sidebar-items">
              <SidebarItem label="Avatar" />
            </div>

            <SidebarHeading count={2}>Composition</SidebarHeading>
            <div className="sidebar-items">
              <SidebarItem label="Alert" />
              <SidebarItem label={spec.name} active />
            </div>

            <div className="sidebar-separator" />

            <SidebarHeading count={LAYERS.length}>Layers</SidebarHeading>
            <div className="layer-tree">
              <button type="button" className="layer-row layer-row-active" aria-pressed="true">
                <SFSymbol name="chevron.down" size={11} />
                <SFSymbol name={specIcon} size={13} />
                {DOC_NAME}
              </button>
              <button type="button" className="layer-row layer-row-child">
                <SFSymbol name="textformat" size={12} />
                {spec.contentLabel}
              </button>
              {LAYERS.map((node) => (
                <button
                  key={node.name}
                  type="button"
                  className="layer-row layer-row-child layer-row-node"
                  style={{ "--layer-depth": node.depth } as CSSProperties}
                  aria-pressed="false"
                >
                  <SFSymbol name={layerIcon(node.tag)} size={12} />
                  <span className="layer-row-name">{node.name}</span>
                  {node.count && <span className="layer-row-count">{node.count}</span>}
                  {dna.nodes?.[`blank-alert-dialog__${node.name}`] && (
                    <span className="layer-row-dot" role="img" aria-label="Has overrides" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-bottom">
            <button type="button" className="sidebar-add-components">
              <SFSymbol name="plus" size={12} />
              Add components
            </button>
            <button type="button" className="sidebar-mode-card">
              <div className="sidebar-mode-card-icon">
                <SFSymbol name="chevron.left.forwardslash.chevron.right" size={14} />
              </div>
              <div>
                <strong>Open code</strong>
                <span>Edit TSX &amp; CSS</span>
              </div>
            </button>
          </div>
        </aside>

        <section className="canvas canvas-dark" data-theme="dark">
          <div className="canvas-overlay">
            <div className="canvas-corner canvas-corner-start">
              <div className="floating-group canvas-meta-group">
                <strong>{DOC_NAME}</strong>
                <span className="canvas-status canvas-status-modified">
                  <i className="canvas-status-dot" aria-hidden="true" />
                  <PopText text={`${countModifications(dna, spec)} modified`} />
                </span>
              </div>
            </div>
            <div className="canvas-corner canvas-corner-end">
              <Tabs label="Preview state" pillWidth={58} options={STATES} />
            </div>
          </div>

          <div className="canvas-stage" style={{ colorScheme: "dark" }}>
            <div className="design-component-wrapper" style={{ transform: "translate(0px, 0px) scale(1)" }}>
              <div className="live-preview" aria-busy="false">
                <iframe title="Component preview" sandbox="" srcDoc={previewDocument(css)} />
              </div>
            </div>
          </div>

          <div className="canvas-floating-bar">
            <div className="floating-group canvas-toolbar">
              <Button variant="ghost" size="xs" aria-label="Light theme" aria-pressed={false} leftIcon={<SFSymbol name="sun.max" size={12} />}>
                <SwapText text="Light" />
              </Button>
              <Button variant="ghost" size="xs" aria-label="Dark theme" aria-pressed leftIcon={<SFSymbol name="moon" size={12} />}>
                <SwapText text="Dark" />
              </Button>
              <span className="canvas-toolbar-divider" aria-hidden="true" />
              <Button variant="ghost" size="icon-xs" aria-label="Zoom out">
                <SFSymbol name="minus" size={12} />
              </Button>
              <button type="button" className="zoom-value" aria-label="Reset view">
                100%
              </button>
              <Button variant="ghost" size="icon-xs" aria-label="Zoom in">
                <SFSymbol name="plus" size={12} />
              </Button>
              <span className="canvas-toolbar-divider" aria-hidden="true" />
              <Button variant="ghost" size="icon-xs" aria-label="Grid" aria-pressed>
                <SFSymbol name="square.grid.2x2" size={12} />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="Guides" aria-pressed={false}>
                <SFSymbol name="aspectratio" size={12} />
              </Button>
            </div>
          </div>
        </section>

        <aside className="inspector">
          <div className="inspector-header">
            <div className="component-file-icon" aria-hidden="true">
              <SFSymbol name={specIcon} size={14} />
            </div>
            <div className="inspector-title">
              <strong>{spec.name}</strong>
              <span>{spec.fileName}</span>
            </div>
          </div>

          <fieldset className="inspector-scroll inspector-fields">
            <Section title="Component">
              <div className="inspector-field-row">
                <label htmlFor="still-content">{spec.contentLabel}</label>
                <input id="still-content" className="inspector-text-input" defaultValue={dna.content} />
              </div>
              <div className="component-props-card">
                <div>
                  <span>Props</span>
                  <strong>TSX</strong>
                </div>
                <p>
                  Props and logic are defined in {spec.fileName}. Visual controls edit managed CSS; custom CSS can override
                  it.
                </p>
              </div>
            </Section>

            <div className="inspector-state">
              <div className="inspector-state-top">
                <span>Editing</span>
                <strong>
                  <SwapText text="Dark · Default" />
                </strong>
                <Button variant="ghost" size="icon-sm" aria-label="Reset default styles">
                  <SFSymbol name="arrow.counterclockwise" size={12} />
                </Button>
              </div>
              <div className="state-switcher" role="radiogroup" aria-label="Editing state">
                {STATES.map((state, index) => (
                  <button key={state} type="button" role="radio" aria-checked={index === 0} tabIndex={index === 0 ? 0 : -1}>
                    {state}
                  </button>
                ))}
              </div>
            </div>

            <Section title="Layout">
              <Slider label="Padding X" value={style.paddingX} min={0} max={64} unit="px" />
              <Slider label="Padding Y" value={style.paddingY} min={0} max={40} unit="px" />
              <Slider label="Radius" value={style.radius} min={0} max={80} unit="px" />
            </Section>

            <Section title="Appearance">
              <Color label="Fill" value={style.background} />
              <Slider label="Opacity" value={style.opacity} min={0} max={100} unit="%" />
            </Section>

            <Section title="Typography">
              <div className="inspector-field-row">
                <span className="property-label">
                  <label htmlFor="still-font">Font</label>
                </span>
                <span className="select-field">
                  <select id="still-font" aria-label="Font family" defaultValue={style.fontFamily}>
                    <option value={style.fontFamily}>System</option>
                  </select>
                  <SFSymbol name="chevron.up.chevron.down" size={10} />
                </span>
              </div>
              <Color label="Text" value={style.color} />
              <Slider label="Size" name="Font size" value={style.fontSize} min={8} max={72} unit="px" />
              <Slider label="Weight" name="Font weight" value={style.fontWeight} min={100} max={900} step={100} />
            </Section>
          </fieldset>

          <div className="inspector-footer">
            <Button variant="outline" size="sm" fullWidth leftIcon={<SFSymbol name="arrow.counterclockwise" size={12} />}>
              Reset component
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

/** SlidingTabs markup with the first option selected. */
function Tabs({ label, size, pillWidth, options }: { label: string; size?: "m"; pillWidth: number; options: ReactNode[] }) {
  return (
    <div role="radiogroup" aria-label={label} className={size === "m" ? "t-tabs t-tabs-m" : "t-tabs"}>
      <span className="t-tabs-pill" aria-hidden="true" style={{ transform: "translateX(3px)", width: pillWidth }} />
      {options.map((option, index) => (
        <button key={index} type="button" role="radio" aria-checked={index === 0} tabIndex={index === 0 ? 0 : -1} className="t-tab">
          {option}
        </button>
      ))}
    </div>
  );
}

function SidebarHeading({ children, count }: { children: ReactNode; count: number }) {
  return (
    <div className="sidebar-heading">
      <span>{children}</span>
      <span className="sidebar-heading-count">{count}</span>
    </div>
  );
}

function SidebarItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <SFSymbol name={catalogIcon(label)} size={14} />
      <span>{label}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="inspector-section t-acc" data-open="true">
      <div className="inspector-section-heading">
        <button type="button" aria-expanded="true">
          <SFSymbol name="chevron.down" size={11} className="t-acc-chevron" />
          <span>{title}</span>
        </button>
      </div>
      <div className="t-acc-panel">
        <div className="t-acc-panel-inner">
          <div className="inspector-section-content">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  name = label,
  value,
  min,
  max,
  step = 1,
  unit,
}: {
  label: string;
  name?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  const percent = (next: number) => ((Math.min(max, Math.max(min, next)) - min) / (max - min)) * 100;
  const origin = percent(0);

  return (
    <div className="slider-control">
      <div className="slider-control-header">
        <span className="property-label">
          <span>{label}</span>
        </span>
        <label className="numeric-control t-input">
          <input aria-label={`${name} value`} type="number" min={min} max={max} step={step} defaultValue={value} />
          {unit && <small>{unit}</small>}
        </label>
      </div>
      <input
        aria-label={name}
        className="property-range"
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        style={
          {
            "--range-from": `${Math.min(origin, percent(value))}%`,
            "--range-to": `${Math.max(origin, percent(value))}%`,
          } as CSSProperties
        }
      />
    </div>
  );
}

function Color({ label, value }: { label: string; value: string }) {
  return (
    <div className="color-control">
      <span className="property-label">
        <span>{label}</span>
      </span>
      <div className="color-field">
        <button type="button" className="color-swatch-button" aria-label={`${label} color picker`}>
          <span className="color-chip" style={{ "--chip": value } as CSSProperties} />
        </button>
        <input className="color-value-input" aria-label={`${label} color`} defaultValue={value} spellCheck={false} autoComplete="off" />
      </div>
    </div>
  );
}
