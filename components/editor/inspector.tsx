"use client";

import type { ReactNode } from "react";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";
import { SwapText } from "./motion";
import { moveRadioSelection } from "./radio-keys";
import { useLastValue, usePresence } from "./use-presence";

import {
  type ButtonStyleDNA,
  type ComponentDNA,
  type ComponentSpec,
  type InspectorControl,
  type NodeOverrides,
  type NodeStyleDNA,
  type PreviewState,
  type ThemeName,
  getStateOverrideCount,
  resetStateDNA,
  resolveStyle,
  vanillaNodeStyle,
} from "@/lib/component-model";
import {
  type EffectName,
  type RingMode,
  addEffect,
  controlsFor,
  effectProperties,
  isEffectVisible,
  isOverridden,
  removeEffect,
  resetStyleProperties,
  ringMode,
  setRingMode,
  setStyle,
  statesWithOverrides,
} from "@/lib/style-editing";

import {
  ColorControl,
  CompactNumber,
  FontControl,
  IconSlotControl,
  InspectorHint,
  InspectorSection,
  NumberGrid,
  OptionControl,
  SectionAction,
  SelectControl,
  SliderControl,
  type Inheritance,
} from "./inspector-controls";
import { borderStyles, fontStyles, textCases } from "./style-options";
import { compositionCatalog, primitiveCatalog } from "./component-catalog";
import type { NodeMetrics } from "./live-preview";

type StyleKey = keyof ButtonStyleDNA;

type InspectorProps = {
  spec: ComponentSpec;
  contentEditable: boolean;
  disabled: boolean;
  dna: ComponentDNA;

  theme: ThemeName;

  previewState: PreviewState;

  onChangePreviewState: (state: PreviewState) => void;

  onChangeDNA: (dna: ComponentDNA) => void;

  onResetComponent: () => void;

  /** Child node selected in the canvas, addressed by its semantic class. */
  selectedNode?: string | null;

  /** The selected child's computed style, shown for properties it does not override. */
  nodeMetrics?: NodeMetrics | null;

  onChangeNode?: (patch: NodeOverrides) => void;

  onResetNodeProperties?: (properties: Array<keyof NodeOverrides>) => void;

  onResetNode?: () => void;

  onDeselectNode?: () => void;

  lockMessage?: string;
};

const stateLabels: Record<PreviewState, string> = {
  default: "Default",
  hover: "Hover",
  active: "Pressed",
  focus: "Focus",
  disabled: "Disabled",
};

export function Inspector({
  spec,
  contentEditable,
  disabled,
  lockMessage,
  dna,
  theme,
  previewState: state,
  onChangePreviewState,
  onChangeDNA,
  onResetComponent,
  selectedNode = null,
  nodeMetrics = null,
  onChangeNode,
  onResetNodeProperties,
  onResetNode,
  onDeselectNode,
}: InspectorProps) {
  const style = resolveStyle(dna, theme, state);
  const overrideCount = getStateOverrideCount(dna, theme, state);
  const stateLabel = stateLabels[state];
  const colorContext = `${theme === "dark" ? "Dark" : "Light"} · ${stateLabel}`;
  const swatches = documentColors(dna);
  const statesChanged = statesWithOverrides(dna, theme);
  const controls = controlsFor(spec);
  const has = (control: InspectorControl) => controls.includes(control);
  const nodeOverrides: NodeOverrides = (selectedNode ? dna.nodes?.[selectedNode] : undefined) ?? {};
  // Overrides win; every other property shows what the preview measured.
  const nodeValue: NodeStyleDNA = { ...vanillaNodeStyle, ...nodeMetrics, ...nodeOverrides };
  const nodeInherit = (property: keyof NodeStyleDNA): Inheritance => ({
    overridden: nodeOverrides[property] !== undefined,
    stateLabel: "this child",
    target: "the component CSS",
    onReset: () => onResetNodeProperties?.([property]),
  });

  const set = (property: StyleKey) => (value: string | number) => onChangeDNA(setStyle(dna, theme, state, property, value));

  const inherit = (property: StyleKey): Inheritance | undefined =>
    state === "default"
      ? undefined
      : {
          overridden: isOverridden(dna, theme, state, property),
          stateLabel,
          onReset: () => onChangeDNA(resetStyleProperties(dna, theme, state, [property])),
        };

  function resetAction(title: string, properties: StyleKey[]) {
    if (state === "default" || !properties.some((property) => isOverridden(dna, theme, state, property))) return null;
    return (
      <SectionAction
        label={`Reset ${title} overrides`}
        icon="arrow.counterclockwise"
        onClick={() => onChangeDNA(resetStyleProperties(dna, theme, state, properties))}
      />
    );
  }

  function slider(label: string, property: StyleKey, min: number, max: number, options: { name?: string; step?: number; unit?: string } = {}) {
    return (
      <SliderControl
        label={label}
        name={options.name}
        value={Number(style[property])}
        min={min}
        max={max}
        step={options.step}
        unit={options.unit}
        inheritance={inherit(property)}
        onChange={set(property)}
      />
    );
  }

  function color(label: string, property: StyleKey, name = label) {
    return (
      <ColorControl
        label={label}
        name={name}
        context={colorContext}
        value={String(style[property])}
        swatches={swatches}
        inheritance={inherit(property)}
        onChange={set(property)}
      />
    );
  }

  function compact(label: string, name: string, property: StyleKey, min: number, max: number, unit = "px") {
    return (
      <CompactNumber
        label={label}
        name={name}
        value={Number(style[property])}
        min={min}
        max={max}
        unit={unit}
        inheritance={inherit(property)}
        onChange={set(property)}
      />
    );
  }

  function effectSection(title: string, effect: EffectName, content: ReactNode) {
    const visible = isEffectVisible(style, effect);
    const noun = title.toLowerCase();

    return (
      <InspectorSection
        title={title}
        actions={
          <>
            {resetAction(noun, effectProperties[effect])}

            <SectionAction
              label={visible ? `Remove ${noun}` : `Add ${noun}`}
              icon={visible ? "minus" : "plus"}
              onClick={() => onChangeDNA(visible ? removeEffect(dna, theme, state, effect) : addEffect(dna, theme, state, effect))}
            />
          </>
        }
      >
        {visible ? content : null}
      </InspectorSection>
    );
  }

  const ring = ringMode(dna, theme, state);
  const nativeRingAvailable = state === "focus" && resolveStyle(dna, theme, "default").ringWidth === 0;
  const ringOptions = nativeRingAvailable
    ? [
        { value: "native", label: "Native", name: "Native focus ring" },
        { value: "custom", label: "Custom", name: "Custom ring" },
        { value: "none", label: "None", name: "No ring" },
      ]
    : [
        { value: "none", label: "Off", name: "No ring" },
        { value: "custom", label: "On", name: "Custom ring" },
      ];

  const lock = usePresence(!!lockMessage, 150);
  const lockText = useLastValue(lockMessage, !!lockMessage);

  return (
    <aside className="inspector">
      <div className="inspector-header">
        <div className="component-file-icon" aria-hidden="true">
          <SFSymbol
            name={[...primitiveCatalog, ...compositionCatalog].find((entry) => entry.name === spec.name)?.icon ?? "square.dashed"}
            size={14}
          />
        </div>

        <div className="inspector-title">
          <strong>{spec.name}</strong>

          <span>{spec.fileName}</span>
        </div>
      </div>

      {lock.mounted && (
        <div className="inspector-lock t-presence" data-state={lock.state} role="alert" inert={lock.state === "closed"}>
          <SFSymbol name="exclamationmark.circle" size={14} />

          <div>
            <strong>Visual controls paused</strong>

            <p>{lockText}</p>
          </div>

          <button onClick={onResetComponent}>Reset</button>
        </div>
      )}

      <fieldset className="inspector-scroll inspector-fields" disabled={disabled}>
        {selectedNode && onChangeNode && (
          <InspectorSection
            title="Child"
            actions={
              <>
                {Object.keys(nodeOverrides).length > 0 && onResetNode && (
                  <SectionAction label="Reset child overrides" icon="arrow.counterclockwise" onClick={onResetNode} />
                )}

                {onDeselectNode && <SectionAction label="Deselect child" icon="xmark" onClick={onDeselectNode} />}
              </>
            }
          >
            <InspectorHint>
              <strong className="child-name">{selectedNode.replace(/^blank-/, "").replace("__", " · ")}</strong> overrides apply to every theme and state.
            </InspectorHint>

            <ChildGroup label="Position">
              <NumberGrid>
                <CompactNumber label="X" name="Child X" value={nodeValue.x} min={-2000} max={2000} inheritance={nodeInherit("x")} onChange={(value) => onChangeNode({ x: value })} />
                <CompactNumber label="Y" name="Child Y" value={nodeValue.y} min={-2000} max={2000} inheritance={nodeInherit("y")} onChange={(value) => onChangeNode({ y: value })} />
              </NumberGrid>

              <InspectorHint>Drag in the canvas or nudge with the arrow keys; siblings stay put. Shift locks the axis or steps 8px, Option skips snapping.</InspectorHint>
            </ChildGroup>

            <ChildGroup label="Size">
              <NumberGrid>
                <CompactNumber label="W" name="Child width" value={nodeValue.width} min={0} max={4000} inheritance={nodeInherit("width")} onChange={(value) => onChangeNode({ width: value })} />
                <CompactNumber label="H" name="Child height" value={nodeValue.height} min={0} max={4000} inheritance={nodeInherit("height")} onChange={(value) => onChangeNode({ height: value })} />
              </NumberGrid>

              {nodeMetrics?.display === "inline" && <InspectorHint>Inline text ignores width and height.</InspectorHint>}
            </ChildGroup>

            <ChildGroup label="Padding">
              <NumberGrid>
                <CompactNumber label="X" name="Child padding X" value={nodeValue.paddingX} min={0} max={400} inheritance={nodeInherit("paddingX")} onChange={(value) => onChangeNode({ paddingX: value })} />
                <CompactNumber label="Y" name="Child padding Y" value={nodeValue.paddingY} min={0} max={400} inheritance={nodeInherit("paddingY")} onChange={(value) => onChangeNode({ paddingY: value })} />
              </NumberGrid>
            </ChildGroup>

            <ColorControl label="Fill" name="Child fill" context={nodeColorContext} value={nodeValue.background} swatches={swatches} inheritance={nodeInherit("background")} onChange={(value) => onChangeNode({ background: value })} />
            <SliderControl label="Radius" name="Child radius" value={nodeValue.radius} min={0} max={120} unit="px" inheritance={nodeInherit("radius")} onChange={(value) => onChangeNode({ radius: value })} />
            <SliderControl label="Opacity" name="Child opacity" value={nodeValue.opacity} min={0} max={100} unit="%" inheritance={nodeInherit("opacity")} onChange={(value) => onChangeNode({ opacity: value })} />

            <ColorControl label="Text" name="Child text" context={nodeColorContext} value={nodeValue.color} swatches={swatches} inheritance={nodeInherit("color")} onChange={(value) => onChangeNode({ color: value })} />
            <SliderControl label="Size" name="Child font size" value={nodeValue.fontSize} min={6} max={96} unit="px" inheritance={nodeInherit("fontSize")} onChange={(value) => onChangeNode({ fontSize: value })} />
            <SliderControl label="Weight" name="Child font weight" value={nodeValue.fontWeight} min={100} max={900} step={100} inheritance={nodeInherit("fontWeight")} onChange={(value) => onChangeNode({ fontWeight: value })} />
            <SliderControl label="Tracking" name="Child tracking" value={nodeValue.letterSpacing} min={-0.05} max={0} step={0.005} unit="em" inheritance={nodeInherit("letterSpacing")} onChange={(value) => onChangeNode({ letterSpacing: value })} />
            <OptionControl
              label="Text align"
              name="Child text align"
              value={nodeValue.textAlign}
              options={[
                { value: "start", label: "Start", name: "Start" },
                { value: "center", label: "Center", name: "Center" },
                { value: "end", label: "End", name: "End" },
              ]}
              inheritance={nodeInherit("textAlign")}
              onChange={(value) => onChangeNode({ textAlign: value as NodeStyleDNA["textAlign"] })}
            />

            <OptionControl
              label="Align self"
              name="Child align self"
              value={nodeValue.alignSelf}
              options={[
                { value: "auto", label: "Auto", name: "Auto" },
                { value: "start", label: "Start", name: "Start" },
                { value: "center", label: "Center", name: "Center" },
                { value: "end", label: "End", name: "End" },
                { value: "stretch", label: "Stretch", name: "Stretch" },
              ]}
              inheritance={nodeInherit("alignSelf")}
              onChange={(value) => onChangeNode({ alignSelf: value as NodeStyleDNA["alignSelf"] })}
            />
            {nodeMetrics && !/flex|grid/.test(nodeMetrics.parentDisplay) && <InspectorHint>Align self needs a flex or grid parent.</InspectorHint>}
          </InspectorSection>
        )}

        <InspectorSection title="Component">
          {spec.contentProp && (
            <div className="inspector-field-row">
              <label htmlFor="component-content">{spec.contentLabel}</label>

              <input
                id="component-content"
                disabled={!contentEditable}
                title={contentEditable ? `Default ${spec.contentProp} in ${spec.fileName}` : `Edit the ${spec.contentLabel.toLowerCase()} in ${spec.fileName}`}
                className="inspector-text-input"
                value={dna.content}
                onChange={(event) => onChangeDNA({ ...dna, content: event.target.value })}
              />
            </div>
          )}

          <div className="component-props-card">
            <div>
              <span>Props</span>

              <strong>TSX</strong>
            </div>

            <p>
              Props and logic are defined in {spec.fileName}. Visual controls edit managed CSS; custom CSS can override it.
            </p>
          </div>
        </InspectorSection>

        <div className="inspector-state">
          <div className="inspector-state-top">
            <span>Editing</span>

            <strong><SwapText text={colorContext} /></strong>

            {state === "default" ? (
              <Button variant="ghost" size="icon-sm" aria-label="Reset default styles" title="Reset shared styles and this theme’s colors" onClick={() => onChangeDNA(resetStateDNA(dna, theme, state))}>
                <SFSymbol name="arrow.counterclockwise" size={12} />
              </Button>
            ) : (
              <div className="state-override-indicator">
                {overrideCount > 0 ? (
                  <>
                    <span>{overrideCount} override{overrideCount === 1 ? "" : "s"}</span>

                    <button title="Reset state overrides" onClick={() => onChangeDNA(resetStateDNA(dna, theme, state))}>
                      <SFSymbol name="arrow.counterclockwise" size={11} />
                    </button>
                  </>
                ) : (
                  <span>Inherits Default</span>
                )}
              </div>
            )}
          </div>

          <div
            className="state-switcher"
            role="radiogroup"
            aria-label="Editing state"
            onKeyDown={(event) => moveRadioSelection(event, spec.supportedStates, state, onChangePreviewState)}
          >
            {spec.supportedStates.map((option) => {
              const changed = statesChanged.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={option === state}
                  tabIndex={option === state ? 0 : -1}
                  data-overrides={changed || undefined}
                  title={changed ? `${stateLabels[option]} overrides Default` : stateLabels[option]}
                  data-cuelume-toggle=""
                  onClick={() => onChangePreviewState(option)}
                >
                  {stateLabels[option]}
                </button>
              );
            })}
          </div>
        </div>

        {has("layout") && (
          <InspectorSection title="Layout" actions={resetAction("layout", ["paddingX", "paddingY", "radius"])}>
            {slider("Padding X", "paddingX", 0, 64, { unit: "px" })}
            {slider("Padding Y", "paddingY", 0, 40, { unit: "px" })}
            {slider("Radius", "radius", 0, 80, { unit: "px" })}
          </InspectorSection>
        )}

        {has("appearance") && (
          <InspectorSection title="Appearance" actions={resetAction("appearance", ["background", "opacity"])}>
            {color("Fill", "background")}
            {slider("Opacity", "opacity", 0, 100, { unit: "%" })}
          </InspectorSection>
        )}

        {has("typography") && (
          <InspectorSection
            title="Typography"
            actions={resetAction("typography", ["fontFamily", "color", "placeholderColor", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "fontStyle", "textTransform"])}
          >
            <FontControl value={style.fontFamily} inheritance={inherit("fontFamily")} onChange={set("fontFamily")} />
            {color("Text", "color")}
            {has("placeholder") && color("Placeholder", "placeholderColor", "Placeholder text")}
            {slider("Size", "fontSize", 8, 72, { name: "Font size", unit: "px" })}
            {slider("Weight", "fontWeight", 100, 900, { name: "Font weight", step: 100 })}
            {slider("Line height", "lineHeight", 0.8, 2.4, { step: 0.05 })}
            {slider("Tracking", "letterSpacing", -0.05, 0, { step: 0.005, unit: "em" })}
            <OptionControl label="Style" name="Font style" value={style.fontStyle} options={fontStyles} inheritance={inherit("fontStyle")} onChange={set("fontStyle")} />
            <OptionControl label="Case" name="Text case" value={style.textTransform} options={textCases} inheritance={inherit("textTransform")} onChange={set("textTransform")} />
          </InspectorSection>
        )}

        {has("icon") && spec.iconSlots && spec.iconSlots.length > 0 && (
          <InspectorSection title="Icon" actions={resetAction("icon", ["iconSize", "iconGap"])}>
            {spec.iconSlots.map((slot) => (
              <IconSlotControl
                key={slot.prop}
                label={slot.label}
                name={`${slot.label} icon`}
                value={dna.props?.[slot.prop] ?? ""}
                onChange={(icon) => onChangeDNA({ ...dna, props: { ...dna.props, [slot.prop]: icon } })}
              />
            ))}
            {slider("Size", "iconSize", 8, 40, { name: "Icon size", unit: "px" })}
            {slider("Gap", "iconGap", 0, 32, { name: "Icon gap", unit: "px" })}
          </InspectorSection>
        )}

        {has("border") && (
          <InspectorSection title="Border" actions={resetAction("border", ["borderWidth", "borderStyle", "borderColor"])}>
            {slider("Width", "borderWidth", 0, 12, { name: "Border width", unit: "px" })}
            {style.borderWidth > 0 && (
              <>
                <SelectControl label="Style" name="Border style" value={style.borderStyle} options={borderStyles} inheritance={inherit("borderStyle")} onChange={set("borderStyle")} />
                {color("Color", "borderColor", "Border")}
              </>
            )}
          </InspectorSection>
        )}

        {has("innerBorder") && effectSection("Inner border", "innerBorder", (
          <>
            {slider("Width", "innerBorderWidth", 0, 8, { name: "Inner border width", unit: "px" })}
            {color("Color", "innerBorderColor", "Inner border")}
          </>
        ))}

        {has("shadow") && effectSection("Shadow", "shadow", (
          <>
            <NumberGrid>
              {compact("X", "Shadow X", "shadowX", -40, 40)}
              {compact("Y", "Shadow Y", "shadowY", -40, 60)}
              {compact("Blur", "Shadow blur", "shadowBlur", 0, 100)}
              {compact("Spread", "Shadow spread", "shadowSpread", -40, 40)}
            </NumberGrid>
            {color("Color", "shadowColor", "Shadow")}
            {slider("Opacity", "shadowOpacity", 0, 100, { name: "Shadow opacity", unit: "%" })}
          </>
        ))}

        {has("innerShadow") && effectSection("Inner shadow", "innerShadow", (
          <>
            <NumberGrid>
              {compact("X", "Inner shadow X", "innerShadowX", -40, 40)}
              {compact("Y", "Inner shadow Y", "innerShadowY", -40, 40)}
              {compact("Blur", "Inner shadow blur", "innerShadowBlur", 0, 60)}
              {compact("Spread", "Inner shadow spread", "innerShadowSpread", -20, 20)}
            </NumberGrid>
            {color("Color", "innerShadowColor", "Inner shadow")}
            {slider("Opacity", "innerShadowOpacity", 0, 100, { name: "Inner shadow opacity", unit: "%" })}
          </>
        ))}

        {has("ring") && (
          <InspectorSection title={state === "focus" ? "Focus ring" : "Ring"} actions={resetAction("ring", effectProperties.ring)}>
            <OptionControl
              label="Ring"
              name="Ring style"
              value={ring}
              options={ringOptions}
              inheritance={inherit("ringWidth")}
              onChange={(mode) => onChangeDNA(setRingMode(dna, theme, state, mode as RingMode))}
            />
            {ring === "native" && <InspectorHint>Browser focus ring. Choose Custom to set width, offset and color.</InspectorHint>}
            {ring === "none" && state === "focus" && <InspectorHint tone="warning">No focus ring. Keyboard users need another visible change in Focus.</InspectorHint>}
            {ring === "custom" && (
              <>
                <NumberGrid>
                  {compact("Width", "Ring width", "ringWidth", 0, 12)}
                  {compact("Offset", "Ring offset", "ringOffset", -8, 16)}
                </NumberGrid>
                {color("Color", "ringColor", "Ring")}
              </>
            )}
          </InspectorSection>
        )}

        {has("motion") && (
          <InspectorSection title="Motion" actions={resetAction("motion", ["scale", "translateY", "duration"])}>
            {slider("Scale", "scale", 70, 130, { unit: "%" })}
            {slider("Translate Y", "translateY", -40, 40, { unit: "px" })}
            {slider("Duration", "duration", 0, 1200, { step: 10, unit: "ms" })}
          </InspectorSection>
        )}
      </fieldset>

      <div className="inspector-footer">
        <Button variant="outline" size="sm" fullWidth leftIcon={<SFSymbol name="arrow.counterclockwise" size={12} />} onClick={onResetComponent}>
          Reset component
        </Button>
      </div>
    </aside>
  );
}

const colorProperties: StyleKey[] = ["background", "color", "borderColor", "shadowColor", "innerShadowColor", "innerBorderColor", "ringColor", "placeholderColor"];

/** Every color the component uses, across themes and states, for the picker's quick swatches. */
function documentColors(dna: ComponentDNA) {
  const colors = new Map<string, string>();

  for (const { base, states } of Object.values(dna.themes)) {
    for (const style of [base, ...Object.values(states)] as Partial<ButtonStyleDNA>[]) {
      for (const property of colorProperties) {
        const color = style[property];
        if (typeof color === "string" && color.trim()) colors.set(color.trim().toLowerCase(), color.trim());
      }
    }
  }

  for (const overrides of Object.values(dna.nodes ?? {})) {
    for (const color of [overrides.background, overrides.color]) {
      if (color?.trim()) colors.set(color.trim().toLowerCase(), color.trim());
    }
  }

  return [...colors.values()].slice(0, 18);
}

/** Child overrides are theme- and state-independent. */
const nodeColorContext = "Every theme · Every state";

function ChildGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="child-group" role="group" aria-label={label}>
      <span className="control-label">{label}</span>

      {children}
    </div>
  );
}
