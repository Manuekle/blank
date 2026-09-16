"use client";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  type ComponentDNA,
  type ComponentFiles,
  type ComponentSpec,
  type PreviewState,
  type ThemeName,
  countModifications,
} from "@/lib/component-model";

import { LivePreview, type NodeMetrics, type NodeMove, type PreviewNode, type PreviewProps } from "./live-preview";
import { useLucideIcons } from "./lucide-icons";
import { SlidingTabs } from "./sliding-tabs";
import { PopText, SwapText } from "./motion";

type CanvasProps = {
  spec: ComponentSpec;

  /** The document's own name; renames show up here immediately. */
  docName: string;

  files: ComponentFiles;
  defaultFiles: ComponentFiles;
  dna: ComponentDNA;

  theme: ThemeName;

  setTheme: (theme: ThemeName) => void;

  previewState: PreviewState;

  setPreviewState: (state: PreviewState) => void;

  /** Child node selected in the design layer, addressed by its class. */
  selectedNode?: string | null;

  onSelectNode?: (key: string | null) => void;

  /** Drags and arrow-key nudges on the selected child. */
  onMoveNode?: (key: string, move: NodeMove) => void;

  onNodesChange?: (nodes: PreviewNode[]) => void;

  onNodeMetrics?: (metrics: NodeMetrics | null) => void;

  /** Undo/redo asked from inside the preview, where focus lives during canvas work. */
  onUndoRequest?: (redo: boolean) => void;
};

const states: Array<{
  id: PreviewState;
  label: string;
}> = [
  {
    id: "default",
    label: "Default",
  },
  {
    id: "hover",
    label: "Hover",
  },
  {
    id: "active",
    label: "Pressed",
  },
  {
    id: "focus",
    label: "Focus",
  },
  {
    id: "disabled",
    label: "Disabled",
  },
];

export function Canvas({
  spec,
  docName,
  files,
  defaultFiles,
  dna,
  theme,
  setTheme,
  previewState,
  setPreviewState,
  selectedNode = null,
  onSelectNode,
  onMoveNode,
  onNodesChange,
  onNodeMetrics,
  onUndoRequest,
}: CanvasProps) {
  const [zoom, setZoom] = useState(100);

  const [grid, setGrid] = useState(true);

  const [pan, setPan] = useState({ x: 0, y: 0 });

  const [space, setSpace] = useState(false);
  const [panning, setPanning] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const panOrigin = useRef<{ x: number; y: number } | null>(null);

  const MIN_ZOOM = 25;
  const MAX_ZOOM = 400;

  /** Zooms around a point given in stage pixels relative to the stage centre. */
  function zoomAt(next: number, px: number, py: number) {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(next)));
    if (clamped === zoom) return;
    const factor = clamped / zoom;
    setPan((current) => ({
      x: px - (px - current.x) * factor,
      y: py - (py - current.y) * factor,
    }));
    setZoom(clamped);
  }

  function resetView() {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  }

  // Wheel zooms around the pointer; the listener is non-passive so it can
  // stop the canvas from scrolling.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      const step = event.deltaY > 0 ? -8 : 8;
      zoomAt(zoom + step, event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoom, pan]);

  // Hold space to pan, like a design tool.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpace(true);
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpace(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Wheel and space-drag inside the preview are forwarded here.
  const handleViewport = (event:
    | { kind: "zoom"; deltaY: number; x: number; y: number; width: number; height: number }
    | { kind: "pan"; dx: number; dy: number }) => {
    if (event.kind === "pan") {
      setPan((current) => ({ x: current.x + event.dx, y: current.y + event.dy }));
      return;
    }
    // Preview coordinates are unscaled, so map them through the current view.
    const scale = zoom / 100;
    const px = pan.x + scale * (event.x - event.width / 2);
    const py = pan.y + scale * (event.y - event.height / 2);
    zoomAt(zoom + (event.deltaY > 0 ? -8 : 8), px, py);
  };

  const [guides, setGuides] = useState(false);
  const modifications = countModifications(dna, spec);
  const codeEdited = files.tsx !== defaultFiles.tsx || files.css !== defaultFiles.css;

  const status = modifications > 0
    ? { kind: "modified", text: `${modifications} modified` }
    : codeEdited
      ? { kind: "code", text: "Code edited" }
      : spec.visual === false
        // Template forks start as their own code; "Vanilla" would misread them.
        ? { kind: "code", text: "Custom" }
        : { kind: "vanilla", text: "Vanilla" };

  const lucide = useLucideIcons();
  const previewProps: PreviewProps = { icons: {} };
  for (const slot of spec.iconSlots ?? []) {
    const node = lucide?.[dna.props?.[slot.prop] ?? ""];
    if (node) previewProps.icons[slot.prop] = node;
  }

  return (
    <section
      className={`canvas canvas-${theme} ${grid ? "" : "canvas-no-grid"} t-tab-enter`}
      style={{ "--t-tab-from-x": "calc(var(--page-slide-distance) * -1)" } as CSSProperties}
      data-theme={theme}
    >
      <div className="canvas-overlay">
        <div className="canvas-corner canvas-corner-start">
          <div className="floating-group canvas-meta-group">
            <strong>{docName}</strong>

            <span className={`canvas-status canvas-status-${status.kind}`}>
              <i className="canvas-status-dot" aria-hidden="true" />
              <PopText text={status.text} />
            </span>
          </div>
        </div>

        <div className="canvas-corner canvas-corner-end">
          <SlidingTabs
            label="Preview state"
            value={previewState}
            onChange={setPreviewState}
            options={states
              .filter((state) => spec.supportedStates.includes(state.id))
              .map((state) => ({
                id: state.id,
                label: state.label,
              }))}
          />
        </div>
      </div>

      <div
        ref={stageRef}
        className="canvas-stage"
        style={{ colorScheme: theme, cursor: panning ? "grabbing" : space ? "grab" : undefined }}
        onPointerDown={(event) => {
          if (!space && event.button !== 1) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          panOrigin.current = { x: event.clientX, y: event.clientY };
          setPanning(true);
        }}
        onPointerMove={(event) => {
          const origin = panOrigin.current;
          if (!origin) return;
          setPan((current) => ({ x: current.x + (event.clientX - origin.x), y: current.y + (event.clientY - origin.y) }));
          panOrigin.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={() => { panOrigin.current = null; setPanning(false); }}
        onPointerCancel={() => { panOrigin.current = null; setPanning(false); }}
      >
        <div
          className="design-component-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          }}
        >
          <LivePreview
            spec={spec}
            files={files}
            theme={theme}
            state={previewState}
            props={previewProps}
            grid={grid}
            guides={guides}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
            onMoveNode={onMoveNode}
            onNodesChange={onNodesChange}
            onNodeMetrics={onNodeMetrics}
            onViewport={handleViewport}
            onUndoRequest={onUndoRequest}
          />
        </div>
      </div>

      <div className="canvas-floating-bar">
        <div className="floating-group canvas-toolbar">
          <Button
            variant="ghost"
            size="xs"
            aria-label="Light theme"
            title="Light theme"
            aria-pressed={theme === "light"}
            leftIcon={<SFSymbol name="sun.max" size={12} />}
            onClick={() => setTheme("light")}
          >
            <SwapText text="Light" />
          </Button>

          <Button
            variant="ghost"
            size="xs"
            aria-label="Dark theme"
            title="Dark theme"
            aria-pressed={theme === "dark"}
            leftIcon={<SFSymbol name="moon" size={12} />}
            onClick={() => setTheme("dark")}
          >
            <SwapText text="Dark" />
          </Button>

          <span className="canvas-toolbar-divider" aria-hidden="true" />

          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Zoom out"
            title="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => zoomAt(zoom - 10, 0, 0)}
          >
            <SFSymbol name="minus" size={12} />
          </Button>

          <button
            type="button"
            className="zoom-value"
            aria-label="Reset view"
            title="Reset view"
            onClick={resetView}
          >
            {zoom}%
          </button>

          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Zoom in"
            title="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => zoomAt(zoom + 10, 0, 0)}
          >
            <SFSymbol name="plus" size={12} />
          </Button>

          <span className="canvas-toolbar-divider" aria-hidden="true" />

          <Button variant="ghost" size="icon-xs" aria-label="Grid" title="Grid" aria-pressed={grid} onClick={() => setGrid(value => !value)}>
            <SFSymbol name="square.grid.2x2" size={12} />
          </Button>

          <Button variant="ghost" size="icon-xs" aria-label="Guides" title="Guides" aria-pressed={guides} onClick={() => setGuides(value => !value)}>
            <SFSymbol name="aspectratio" size={12} />
          </Button>
        </div>
      </div>

    </section>
  );
}
