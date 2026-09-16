"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type ComponentFiles, type ComponentSpec, type NodeStyleDNA, type PreviewState, type ThemeName, isNodeKey, vanillaNodeStyle } from "@/lib/component-model";
import type { IconNode } from "./lucide-icons";
import { previewRuntimeScript } from "./preview-runtime";
import { useLastValue, usePresence } from "./use-presence";

const serialize = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

/** Props the preview passes to the component; icons travel as Lucide nodes and become inline SVG. */
export type PreviewProps = { icons: Record<string, IconNode> };

/** A child node class the preview renders, listed once in document order. */
export type PreviewNode = { key: string; tag: string; depth: number; count: number };

/** The selected child's computed style, measured inside the preview. */
export type NodeMetrics = NodeStyleDNA & { key: string; display: string; parentDisplay: string };

/** An offset gesture from the preview: a drag or an arrow-key nudge. */
export type NodeMove = { dx: number; dy: number; mode: "translate" | "relative" };

type ViewportEvent =
  | { kind: "zoom"; deltaY: number; x: number; y: number; width: number; height: number }
  | { kind: "pan"; dx: number; dy: number };

// The preview runs user code, so its messages are checked before they reach editor state.
function readNodes(value: unknown): PreviewNode[] {
  if (!Array.isArray(value)) return [];
  return value.filter((node): node is PreviewNode =>
    !!node && typeof node.key === "string" && isNodeKey(node.key) && typeof node.tag === "string" && Number.isFinite(node.depth) && Number.isFinite(node.count));
}

function readMetrics(value: unknown): NodeMetrics | null {
  const source = value as Record<string, unknown> | null;
  if (!source || typeof source.key !== "string" || !isNodeKey(source.key)) return null;
  const metrics: Record<string, unknown> = { ...vanillaNodeStyle, key: source.key, display: "block", parentDisplay: "block" };
  for (const [property, fallback] of Object.entries(metrics)) {
    const entry = source[property];
    if (typeof entry === typeof fallback && (typeof entry !== "number" || Number.isFinite(entry))) metrics[property] = entry;
  }
  return metrics as NodeMetrics;
}

export function LivePreview({ spec, files, theme, state, props, grid = true, guides = false, selectedNode = null, onSelectNode, onMoveNode, onNodesChange, onNodeMetrics, onViewport, onUndoRequest }: {
  spec: ComponentSpec;
  files: ComponentFiles;
  theme: ThemeName;
  state: PreviewState;
  props: PreviewProps;
  grid?: boolean;
  guides?: boolean;
  selectedNode?: string | null;
  onSelectNode?: (key: string | null) => void;
  onMoveNode?: (key: string, move: NodeMove) => void;
  onNodesChange?: (nodes: PreviewNode[]) => void;
  onNodeMetrics?: (metrics: NodeMetrics | null) => void;
  /** Wheel zoom and space-drag panning come from inside the preview. */
  onViewport?: (event: ViewportEvent) => void;
  /** Undo/redo asked from inside the preview, where focus lives during canvas work. */
  onUndoRequest?: (redo: boolean) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [compiled, setCompiled] = useState<{ specId: string; source: string; code: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tsx: files.tsx, exportName: spec.exportName }), signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Compilation failed");
        if (!controller.signal.aborted) setCompiled({ specId: spec.id, source: files.tsx, code: result.code });
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Preview unavailable");
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [files.tsx, spec.exportName, spec.id]);

  const handlers = useRef({ onSelectNode, onMoveNode, onNodesChange, onNodeMetrics, onViewport, onUndoRequest });
  handlers.current = { onSelectNode, onMoveNode, onNodesChange, onNodeMetrics, onViewport, onUndoRequest };

  // A pointer released over the editor chrome never reaches the preview, so
  // the drag is closed from here. Window blur is left to the preview itself:
  // focus moving into the iframe blurs this window at the start of every drag.
  useEffect(() => {
    const post = (type: string) => () => frame.current?.contentWindow?.postMessage({ type }, "*");
    const release = post("blank:release");
    const cancel = post("blank:cancel");
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      const handler = handlers.current;
      switch (data?.type) {
        case "blank:error":
          setError(String(data.message).slice(0, 2000));
          break;
        case "blank:select":
          handler.onSelectNode?.(typeof data.key === "string" && isNodeKey(data.key) ? data.key : null);
          break;
        case "blank:drag": {
          const dx = Number(data.dx);
          const dy = Number(data.dy);
          if (typeof data.key === "string" && isNodeKey(data.key) && Number.isFinite(dx) && Number.isFinite(dy)) {
            handler.onMoveNode?.(data.key, { dx, dy, mode: data.mode === "relative" ? "relative" : "translate" });
          }
          break;
        }
        case "blank:nodes":
          handler.onNodesChange?.(readNodes(data.nodes));
          break;
        case "blank:metrics":
          handler.onNodeMetrics?.(readMetrics(data.metrics));
          break;
        case "blank:viewport":
          handler.onViewport?.(data.event);
          break;
        case "blank:undo":
          handler.onUndoRequest?.(!!data.redo);
          break;
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  // Theme, CSS and prop updates preserve component state and focus.
  const propsKey = JSON.stringify(props);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "blank:update", css: files.css, theme, state, props }, "*");
    // `propsKey` stands in for `props`, which is rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.css, theme, state, propsKey]);

  // Design layer: grid, guides and the selected child node.
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "blank:design", grid, guides, selected: selectedNode }, "*");
  }, [grid, guides, selectedNode, files.css]);

  const latest = useRef({ css: files.css, theme, state, props, grid, guides, selected: selectedNode });
  latest.current = { css: files.css, theme, state, props, grid, guides, selected: selectedNode };
  const document = useMemo(() => {
    // A bundle from another component never mounts: it would flash the
    // previous component while the new one is still compiling.
    if (!compiled || compiled.specId !== spec.id) return "";
    const initial = latest.current;
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>html,body{margin:0;height:100%;background:transparent}body{display:grid;place-items:center;padding:32px;box-sizing:border-box}#root{width:100%;max-width:100%;display:flex;align-items:center;justify-content:center}pre{white-space:pre-wrap;color:#ef8888;font:12px monospace}</style><style id="component-css"></style></head><body><div id="root"></div><script>
window.addEventListener('error', event => parent.postMessage({ type: 'blank:error', message: String(event.error?.message || event.message) }, '*'));
window.addEventListener('unhandledrejection', event => parent.postMessage({ type: 'blank:error', message: String(event.reason?.message || event.reason) }, '*'));
const update = data => {
 document.documentElement.dataset.theme = data.theme;
 document.documentElement.style.colorScheme = data.theme;
 document.getElementById('component-css').textContent = data.css;
 window.previewState = data.state;
 window.previewProps = data.props;
 window.renderPreview?.(data.state, data.props);
 // Design-layer fields only travel with full snapshots; CSS and state updates keep them.
 if ('grid' in data) window.blankGrid = data.grid !== false;
 if ('guides' in data) window.blankGuides = !!data.guides;
 if ('selected' in data) window.blankSelectedKey = data.selected ?? null;
};
window.addEventListener('message', event => { if(event.source === parent && event.data?.type === 'blank:update') update(event.data); });
update(${serialize(initial)});
</script><script>${previewRuntimeScript.replace(/<\/script/gi, "<\\/script")}</script><script>${compiled.code.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
  }, [compiled, spec.id]);

  const loader = usePresence(busy, 150);
  const loaderUpdating = useLastValue(!!document, busy);
  const errorPresence = usePresence(!!error, 150);
  const errorText = useLastValue(error, !!error);

  return <div className="live-preview" aria-busy={busy}>
    {document && <iframe ref={frame} title="Component preview" style={{ pointerEvents: busy || error ? "none" : undefined }} sandbox="allow-scripts" srcDoc={document} onLoad={() => frame.current?.contentWindow?.postMessage({ type: "blank:update", ...latest.current }, "*")} />}
    {loader.mounted && <div className={`preview-loader ${loaderUpdating ? "preview-loader-updating" : ""}`} data-state={loader.state} role="status">
      <span className="preview-loader-spinner" aria-hidden="true" />
      {loaderUpdating ? "Updating preview" : "Compiling preview"}
    </div>}
    {errorPresence.mounted && <pre className="preview-feedback preview-error t-presence" data-state={errorPresence.state} role="alert">{errorText}</pre>}
  </div>;
}
