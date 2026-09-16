"use client";

import { SFSymbol, type SFSymbolName } from "@/components/icons/sf-symbol";
import { Logo } from "@/components/icons/logo";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { play } from "cuelume";
import { readCSSChanges, readContent, writeContent, writeVisualChanges } from "@/lib/code-sync";
import { strToU8, zipSync } from "fflate";
import { recoveryKey, readStoredDocument, saveDocument, type StoredDocument } from "@/lib/persistence";
import { buildDesignSystemFiles } from "@/lib/design-system-export";

import {
  BUTTON_SPEC,
  type ComponentDNA,
  type ComponentFileName,
  type ComponentFiles,
  type ComponentSpec,
  type EditorMode,
  type NodeOverrides,
  type PreviewState,
  type ThemeName,
  cloneButtonDNA,
  createComponentFiles,
  forkSpec,
  isNodeKey,
  renameComponentExports,
  replaceGeneratedCSS,
  replaceNodeCSS,
  resetNodeProperties,
  resetNodeStyle,
  setNodeStyle,
  vanillaButtonDNA,
} from "@/lib/component-model";
import { COMPONENT_SPECS, getSpec, listForkSpecs, registerForkSpec } from "@/lib/components/registry";

import { Canvas } from "./canvas";
import { CodeWorkspace } from "./code-workspace";
import { ContextMenu, type ContextMenuState } from "./context-menu";
import { FeedbackLayer, celebrate } from "./feedback";
import { SettingsDialog, type WorkspaceComponent } from "./settings-dialog";
import {
  compositionCatalog,
  primitiveCatalog,
  type CatalogEntry,
} from "./component-catalog";
import { Inspector } from "./inspector";
import type { NodeMetrics, NodeMove, PreviewNode } from "./live-preview";
import { SlidingTabs } from "./sliding-tabs";
import { useLastValue, usePresence } from "./use-presence";
import { WorkspaceSetup } from "./workspace-setup";
import { Button } from "@/components/ui/button";
import { AIWorkspace } from "./ai/ai-workspace";

function createDocument(spec: ComponentSpec): StoredDocument {
  return {
    name: `Untitled ${spec.id}`,
    dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }),
    files: createComponentFiles(spec),
  };
}

/** Forks keep the catalog icon of the component they came from. */
function componentIcon(spec: ComponentSpec): SFSymbolName {
  const name = spec.name.replace(/ Custom$/, "");
  return [...primitiveCatalog, ...compositionCatalog].find((entry) => entry.name === name)?.icon ?? "square.dashed";
}

export function Editor() {
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeSticky, setNoticeSticky] = useState(false);
  const [undo, setUndo] = useState<{ specId: string; doc: StoredDocument } | null>(null);
  const [mode, setMode] = useState<EditorMode>("design");
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [previewState, setPreviewState] = useState<PreviewState>("default");
  const [activeSpecId, setActiveSpecId] = useState<string>(BUTTON_SPEC.id);
  const [docs, setDocs] = useState<Record<string, StoredDocument>>(() => ({
    [BUTTON_SPEC.id]: createDocument(BUTTON_SPEC),
  }));
  const [activeFile, setActiveFile] = useState<ComponentFileName>("Button.tsx");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [previewNodes, setPreviewNodes] = useState<PreviewNode[]>([]);
  const [nodeMetrics, setNodeMetrics] = useState<NodeMetrics | null>(null);
  const [enabled, setEnabled] = useState<string[]>([]);
  const [setupOpen, setSetupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menu, setMenu] = useState<ContextMenuState>(null);
  const latestCSS = useRef(createComponentFiles(BUTTON_SPEC).css);

  // Undo/redo keeps full workspace snapshots so a step can also un-fork
  // or switch back the component the edit was made on.
  type HistoryEntry = {
    docs: Record<string, StoredDocument>;
    enabled: string[];
    activeSpecId: string;
    activeFile: ComponentFileName;
  };
  const past = useRef<HistoryEntry[]>([]);
  const future = useRef<HistoryEntry[]>([]);
  const lastCommit = useRef(0);
  const workspace = useRef({ docs, enabled, activeSpecId, activeFile });
  workspace.current = { docs, enabled, activeSpecId, activeFile };

  /** A mutation outside the coalescing window starts a new undo step. */
  function pushHistory() {
    const now = Date.now();
    if (now - lastCommit.current > 400) {
      past.current.push({ ...workspace.current });
      if (past.current.length > 100) past.current.shift();
      future.current = [];
    }
    lastCommit.current = now;
  }

  function restoreHistory(entry: HistoryEntry) {
    setDocs(entry.docs);
    setEnabled(entry.enabled);
    setActiveSpecId(entry.activeSpecId);
    setActiveFile(entry.activeFile);
    setSelectedNode(null);
    setSyncError("");
    latestCSS.current = entry.docs[entry.activeSpecId]?.files.css ?? latestCSS.current;
  }

  function undoEdit() {
    const entry = past.current.pop();
    if (!entry) return;
    future.current.push({ ...workspace.current });
    lastCommit.current = 0;
    restoreHistory(entry);
    showNotice("Undo");
  }

  function redoEdit() {
    const entry = future.current.pop();
    if (!entry) return;
    past.current.push({ ...workspace.current });
    lastCommit.current = 0;
    restoreHistory(entry);
    showNotice("Redo");
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      const wantsUndo = key === "z" && !event.shiftKey;
      const wantsRedo = key === "y" || (key === "z" && event.shiftKey);
      if (!wantsUndo && !wantsRedo) return;
      const target = event.target;
      // Text fields and the code editor keep their own undo stacks.
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable], .monaco-editor")) return;
      event.preventDefault();
      if (wantsRedo) redoEdit();
      else undoEdit();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  // ⌘, opens Settings, as it does in Mac apps.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key !== ",") return;
      event.preventDefault();
      openSettings();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Read through a ref: the shortcut listener above is registered once.
  const settingsOpenRef = useRef(settingsOpen);
  settingsOpenRef.current = settingsOpen;

  function openSettings() {
    if (settingsOpenRef.current) return;
    play("bloom");
    setSettingsOpen(true);
  }

  const spec = useMemo(() => getSpec(activeSpecId), [activeSpecId]);
  const doc = docs[spec.id] ?? createDocument(spec);
  const dna = doc.dna;
  const files = doc.files;

  const defaultFiles = useMemo(() => createComponentFiles(spec), [spec]);

  useEffect(() => {
    try {
      const saved = readStoredDocument();
      if (saved) {
        const restored = { ...saved.docs };
        for (const id of Object.keys(restored)) {
          const restoredSpec = getSpec(id);
          try {
            // Code-only template forks keep their files verbatim; the rest re-sync DNA.
            if (restoredSpec.visual !== false) {
              readCSSChanges(restored[id].files.css, restored[id].files.css, restored[id].dna, restoredSpec);
              // Migration may have unified shared geometry, so the managed CSS
              // is regenerated while any custom CSS is preserved.
              const css = replaceGeneratedCSS(restored[id].files.css, restored[id].dna, restoredSpec);
              restored[id] = {
                ...restored[id],
                files: {
                  ...restored[id].files,
                  // Child overrides may have been upgraded on load, so their managed section is rewritten too.
                  css: restored[id].dna.nodes ? replaceNodeCSS(css, restored[id].dna, restoredSpec) : css,
                },
              };
            }
          } catch (error) {
            setSyncError(error instanceof Error ? error.message : "Invalid saved CSS");
          }
        }
        setDocs((current) => ({ ...current, ...restored }));
        setEnabled(saved.enabled ?? [saved.activeSpecId]);
        if (!saved.enabled) setSetupOpen(true);
        setActiveSpecId(saved.activeSpecId);
        setActiveFile(getSpec(saved.activeSpecId).fileName);
        latestCSS.current = restored[saved.activeSpecId]?.files.css ?? latestCSS.current;
      }
    } catch {
      try {
        const raw = localStorage.getItem("blank:document:v2") ?? localStorage.getItem("blank:document:v1");
        if (raw) localStorage.setItem(recoveryKey(), raw);
      } catch { /* Storage may be disabled. */ }
      showNotice("The saved document could not be loaded. A recovery copy is kept when local storage is available.", true);
    }
    setSetupOpen((open) => open || !(localStorage.getItem("blank:document:v2") ?? localStorage.getItem("blank:document:v1")));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Nothing is stored until the workspace has at least one component.
    if (setupOpen && enabled.length === 0) return;
    setSaveState("Saving…");
    const persist = () => {
      try {
        saveDocument({ activeSpecId, docs, enabled });
        setSaveState("Saved locally");
      } catch { setSaveState("Not saved — export a backup"); }
    };
    const timer = setTimeout(persist, 250);
    window.addEventListener("pagehide", persist);
    return () => { clearTimeout(timer); window.removeEventListener("pagehide", persist); };
  }, [activeSpecId, docs, enabled, ready, setupOpen]);

  const [saveState, setSaveState] = useState("Loading…");

  /** Errors stay until dismissed; confirmations clear themselves. */
  function showNotice(text: string, sticky = false) {
    setNotice(text);
    setNoticeSticky(sticky);
  }

  // A confirmation with nothing to act on should not need dismissing —
  // otherwise every undo leaves a toast behind.
  useEffect(() => {
    if (!notice || noticeSticky || undo) return;
    const timer = setTimeout(() => showNotice(""), notice.length > 60 ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [notice, noticeSticky, undo]);

  // The notice animates out, so it stays mounted while it fades.
  const noticeVisible = Boolean(notice || undo);
  const noticePresence = usePresence(noticeVisible, 250);
  const noticeText = useLastValue(notice || "Component reset.", noticeVisible);

  function patchDocument(specId: string, patch: Partial<StoredDocument>) {
    pushHistory();
    setDocs((current) => ({
      ...current,
      [specId]: { ...(current[specId] ?? createDocument(getSpec(specId))), ...patch },
    }));
  }

  function updateDNA(nextDNA: ComponentDNA) {
    try {
      const css = writeVisualChanges(files.css, dna, nextDNA, spec);
      const tsx =
        spec.contentProp && nextDNA.content !== dna.content
          ? writeContent(files.tsx, spec.contentProp, nextDNA.content)
          : files.tsx;
      setSyncError("");
      patchDocument(spec.id, { dna: nextDNA, files: { tsx, css } });
      latestCSS.current = css;
    } catch (error) { setSyncError(error instanceof Error ? error.message : "Unable to sync CSS"); }
  }

  function updateFile(file: ComponentFileName, value: string) {
    if (file === spec.fileName) {
      patchDocument(spec.id, { files: { ...files, tsx: value } });
      if (spec.contentProp) {
        const content = readContent(value, spec.contentProp);
        if (content !== null) patchDocument(spec.id, { dna: { ...dna, content } });
      }
      return;
    }
    // Code-only template forks have no managed CSS to decode; the file is authoritative.
    if (spec.visual === false) {
      patchDocument(spec.id, { files: { ...files, css: value } });
      return;
    }
    try {
      const next = readCSSChanges(latestCSS.current, value, dna, spec);
      const syncedCSS = writeVisualChanges(value, dna, next, spec);
      setSyncError("");
      patchDocument(spec.id, { dna: next, files: { ...files, css: syncedCSS } });
      latestCSS.current = syncedCSS;
    } catch (error) { setSyncError(error instanceof Error ? error.message : "Invalid CSS"); }
  }

  function selectComponent(entry: CatalogEntry) {
    const next = COMPONENT_SPECS.find((candidate) => candidate.name === entry.name);
    if (!next) return;
    selectSpec(next);
  }

  function selectSpec(next: ComponentSpec) {
    setDocs((current) => current[next.id] ? current : { ...current, [next.id]: createDocument(next) });
    setActiveSpecId(next.id);
    setActiveFile(next.fileName);
    setPreviewState("default");
    setSelectedNode(null);
    setPreviewNodes([]);
    setNodeMetrics(null);
    setSyncError("");
  }

  /**
   * Removes a component from the workspace and discards its document; forks
   * go with their files. One undo step (⌘Z) brings both back. The last
   * component stays, since the editor always has one open.
   */
  function deleteComponent(id: string, name: string) {
    const remaining = enabled.filter((entry) => entry !== id);
    if (remaining.length === 0) {
      play("error");
      showNotice("A workspace keeps at least one component.");
      return;
    }
    pushHistory();
    setEnabled(remaining);
    setDocs((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (id === spec.id) selectSpec(getSpec(remaining[0]));
    play("droplet");
    showNotice(`Deleted ${name}. Press ⌘Z to undo.`);
  }

  function openComponentMenu(id: string, name: string, event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    // The context-menu key and Shift+F10 report no pointer position.
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const rect = event.currentTarget.getBoundingClientRect();
    const last = enabled.length <= 1;
    setMenu({
      x: fromKeyboard ? rect.left + 12 : event.clientX,
      y: fromKeyboard ? rect.bottom + 4 : event.clientY,
      label: `${name} actions`,
      items: [
        {
          id: "delete",
          label: `Delete ${name}`,
          icon: "trash",
          tone: "danger",
          disabled: last,
          note: last ? "A workspace keeps at least one component" : undefined,
          onSelect: () => deleteComponent(id, name),
        },
      ],
    });
  }

  const forkIds = new Set(listForkSpecs().map((fork) => fork.id));
  const workspaceComponents: WorkspaceComponent[] = enabled
    .map((id) => getSpec(id))
    .map((candidate) => {
      const custom = forkIds.has(candidate.id);
      return {
        id: candidate.id,
        name: custom ? docs[candidate.id]?.name ?? candidate.name : candidate.name,
        fileName: candidate.fileName,
        icon: componentIcon(candidate),
        custom,
        open: candidate.id === spec.id,
      };
    });

  /** Clones the active component into a standalone custom document with its own export name. */
  function forkComponent() {
    pushHistory();
    const forked = forkSpec(spec, Date.now().toString(36));
    registerForkSpec(forked);

    // A source file that no longer exports the expected name (hand-edited,
    // damaged by an older build…) would fail the fork's first compile; the
    // fork then starts from the component template instead of inheriting it.
    const renamed = renameComponentExports(files.tsx, spec.exportName, forked.exportName);
    const exportsFork = new RegExp(`export (const|function|default) ${forked.exportName}\\b`).test(renamed)
      || /\bexport default\b/.test(renamed);
    const tsx = exportsFork
      ? renamed
      : renameComponentExports(spec.vanillaTSX, spec.exportName, forked.exportName);

    setDocs((current) => ({
      ...current,
      [forked.id]: { name: `${spec.name} Custom`, dna: cloneButtonDNA(dna), files: { tsx, css: files.css }, spec: forked },
    }));
    setEnabled((current) => (current.includes(forked.id) ? current : [...current, forked.id]));
    setActiveSpecId(forked.id);
    setActiveFile(forked.fileName);
    setPreviewState("default");
    setSelectedNode(null);
    setPreviewNodes([]);
    setNodeMetrics(null);
    setSyncError("");
    play("sparkle");
    showNotice(`Forked ${spec.name} into ${forked.fileName}`);
  }

  /** Child overrides live in their own managed CSS section. */
  function applyNodeDNA(nextDNA: ComponentDNA) {
    const css = replaceNodeCSS(files.css, nextDNA, spec);
    patchDocument(spec.id, { dna: nextDNA, files: { ...files, css } });
    latestCSS.current = css;
  }

  function selectNode(key: string | null) {
    setSelectedNode(key);
    if (!key) setNodeMetrics(null);
  }

  /** Drags and arrow-key nudges from the canvas add to the child's offset. */
  function moveNode(key: string, move: NodeMove) {
    if (!isNodeKey(key)) return;
    // Nudges can arrive faster than renders, so each one builds on the latest document.
    pushHistory();
    setDocs((current) => {
      const target = current[spec.id] ?? createDocument(spec);
      const style = target.dna.nodes?.[key] ?? {};
      const x = Math.round(((style.x ?? 0) + move.dx) * 100) / 100;
      const y = Math.round(((style.y ?? 0) + move.dy) * 100) / 100;
      // Back at its layout position, the child drops the offset instead of storing zeros.
      const home = x === 0 && y === 0;
      const nextDNA = setNodeStyle(target.dna, key, {
        x: home ? undefined : x,
        y: home ? undefined : y,
        offsetMode: move.mode === "relative" ? "relative" : undefined,
      });
      const css = replaceNodeCSS(target.files.css, nextDNA, spec);
      latestCSS.current = css;
      return { ...current, [spec.id]: { ...target, dna: nextDNA, files: { ...target.files, css } } };
    });
    setSelectedNode(key);
  }

  function changeNode(patch: NodeOverrides) {
    if (!selectedNode) return;
    const next: NodeOverrides = { ...patch };
    // Typed offsets use the positioning a drag on the same child would.
    if ((patch.x !== undefined || patch.y !== undefined) && nodeMetrics?.key === selectedNode) {
      next.offsetMode = nodeMetrics.display === "inline" ? "relative" : undefined;
    }
    applyNodeDNA(setNodeStyle(dna, selectedNode, next));
  }

  function resetNodeProperty(properties: Array<keyof NodeOverrides>) {
    if (!selectedNode) return;
    applyNodeDNA(resetNodeProperties(dna, selectedNode, properties));
  }

  function resetNode() {
    if (!selectedNode) return;
    applyNodeDNA(resetNodeStyle(dna, selectedNode));
  }

  // A child that no longer renders (for example after a TSX edit) cannot stay selected.
  useEffect(() => {
    if (selectedNode && previewNodes.length > 0 && !previewNodes.some((node) => node.key === selectedNode)) setSelectedNode(null);
  }, [previewNodes, selectedNode]);

  function resetComponent() {
    setUndo({ specId: spec.id, doc: { name: doc.name, dna: cloneButtonDNA(dna), files: { ...files } } });
    const clean = createDocument(spec);
    patchDocument(spec.id, clean);
    latestCSS.current = clean.files.css;
    setSyncError(""); setPreviewState("default"); setActiveFile(spec.fileName);
  }

  /** Applies files edited outside the visual controls (assistant) and re-syncs DNA. */
  function applyExternalFiles(next: ComponentFiles): ComponentFiles | null {
    try {
      const nextDNA = readCSSChanges(latestCSS.current, next.css, dna, spec);
      const syncedCSS = writeVisualChanges(next.css, dna, nextDNA, spec);
      const content = spec.contentProp ? readContent(next.tsx, spec.contentProp) : null;
      const syncedDNA = content !== null ? { ...nextDNA, content } : nextDNA;
      setSyncError("");
      patchDocument(spec.id, { dna: syncedDNA, files: { tsx: next.tsx, css: syncedCSS } });
      latestCSS.current = syncedCSS;
      return { tsx: next.tsx, css: syncedCSS };
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Unable to apply the change");
      return null;
    }
  }

  /** `origin` is the button that asked for the export; the confetti bursts from it. */
  function exportDesignSystem(origin?: HTMLElement) {
    const included = [
      ...COMPONENT_SPECS.filter((candidate) => enabled.includes(candidate.id)),
      ...listForkSpecs().filter((candidate) => enabled.includes(candidate.id)),
    ];
    const documents = Object.fromEntries(
      included.map((candidate) => [candidate.id, docs[candidate.id] ?? createDocument(candidate)]),
    );

    const entries: Record<string, Uint8Array> = {};
    for (const [path, contents] of Object.entries(buildDesignSystemFiles(included, documents))) {
      entries[path] = strToU8(contents);
    }

    const archive = zipSync(entries);
    const url = URL.createObjectURL(new Blob([new Uint8Array(archive)], { type: "application/zip" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "blank-design-system.zip";
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);

    celebrate(origin);
    showNotice(`Exported ${included.length} component${included.length === 1 ? "" : "s"} with design-system.css and a README.`);
  }

  return (
    <main className="editor-shell">
      <Topbar
        mode={mode}
        setMode={setMode}
        name={doc.name}
        setName={(name) => patchDocument(spec.id, { name })}
        saveState={saveState}
        onExport={exportDesignSystem}
        onFork={forkComponent}
        onOpenSettings={openSettings}
      />
      {noticePresence.mounted && <div className={`editor-notice t-toast ${noticePresence.state === "open" ? "is-open" : ""}`} role="status">
        <span>{noticeText}</span>
        {undo && <button onClick={() => { setDocs((current) => ({ ...current, [undo.specId]: undo.doc })); latestCSS.current = undo.doc.files.css; setUndo(null); showNotice(""); }}>Undo reset</button>}
        <button aria-label="Dismiss notice" onClick={() => { showNotice(""); setUndo(null); }}><SFSymbol name="xmark" size={10} /></button>
      </div>}

      {setupOpen && (
        <WorkspaceSetup
          initial={enabled}
          onCancel={enabled.length > 0 ? () => setSetupOpen(false) : undefined}
          onConfirm={(ids) => {
            // A first workspace is worth marking; later edits to it are routine.
            if (enabled.length === 0) celebrate();
            setEnabled(ids);
            setSetupOpen(false);
            const next = COMPONENT_SPECS.find((candidate) => candidate.id === ids[0]);
            if (next && !enabled.includes(next.id)) {
              setDocs((current) => current[next.id] ? current : { ...current, [next.id]: createDocument(next) });
              setActiveSpecId(next.id);
              setActiveFile(next.fileName);
              setSelectedNode(null);
            }
          }}
        />
      )}

      <div className="editor-workspace">
        <LeftSidebar
          mode={mode}
          activeSpecId={spec.id}
          enabled={enabled}
          onAddComponents={() => setSetupOpen(true)}
          onSelect={selectComponent}
          onSelectSpec={selectSpec}
          forks={listForkSpecs()
            .filter((candidate) => enabled.includes(candidate.id))
            .map((candidate) => ({ spec: candidate, name: docs[candidate.id]?.name ?? candidate.name }))}
          docName={doc.name}
          activeFile={activeFile}
          spec={spec}
          setActiveFile={setActiveFile}
          setMode={setMode}
          nodes={previewNodes}
          selectedNode={selectedNode}
          overriddenNodes={Object.keys(dna.nodes ?? {})}
          onSelectNode={selectNode}
          onComponentMenu={openComponentMenu}
        />

        {mode === "design" ? (
          <Canvas
            spec={spec}
            docName={doc.name}
            files={files}
            defaultFiles={defaultFiles}
            dna={dna}
            theme={theme}
            setTheme={setTheme}
            previewState={previewState}
            setPreviewState={setPreviewState}
            selectedNode={selectedNode}
            onSelectNode={selectNode}
            onMoveNode={moveNode}
            onNodesChange={setPreviewNodes}
            onNodeMetrics={setNodeMetrics}
            onUndoRequest={(redo) => (redo ? redoEdit() : undoEdit())}
          />
        ) : (
          <div className="code-and-preview">
            {mode === "ai" ? (
              <AIWorkspace
                spec={spec}
                files={files}
                onApplyFiles={applyExternalFiles}
                onNotice={(text: string) => showNotice(text)}
              />
            ) : (
              <CodeWorkspace
                spec={spec}
                files={files}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                onChangeFile={updateFile}
              />
            )}
            <Canvas
              spec={spec}
              docName={doc.name}
              files={files}
              defaultFiles={defaultFiles}
              dna={dna}
              theme={theme}
              setTheme={setTheme}
              previewState={previewState}
              setPreviewState={setPreviewState}
              selectedNode={selectedNode}
              onSelectNode={selectNode}
              onMoveNode={moveNode}
              onNodesChange={setPreviewNodes}
              onNodeMetrics={setNodeMetrics}
              onUndoRequest={(redo) => (redo ? redoEdit() : undoEdit())}
            />
          </div>
        )}

        <Inspector
          spec={spec}
          dna={dna}
          theme={theme}
          previewState={previewState}
          onChangePreviewState={setPreviewState}
          onChangeDNA={updateDNA}
          onResetComponent={resetComponent}
          selectedNode={selectedNode}
          nodeMetrics={nodeMetrics?.key === selectedNode ? nodeMetrics : null}
          onChangeNode={changeNode}
          onResetNodeProperties={resetNodeProperty}
          onResetNode={resetNode}
          onDeselectNode={() => selectNode(null)}
          contentEditable={spec.contentProp !== null && readContent(files.tsx, spec.contentProp) !== null}
          disabled={!ready || !!syncError || spec.visual === false}
          lockMessage={spec.visual === false
            ? "This forked template ships plain HTML and CSS. Edit its code in the Code workspace."
            : syncError}
        />
      </div>

      {settingsOpen && (
        <SettingsDialog
          components={workspaceComponents}
          onDeleteComponent={deleteComponent}
          onAddComponents={() => {
            setSettingsOpen(false);
            setSetupOpen(true);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <ContextMenu menu={menu} onClose={() => setMenu(null)} />

      <FeedbackLayer />
    </main>
  );
}

type TopbarProps = {
  name: string;
  setName: (name: string) => void;
  saveState: string;
  onExport: (origin: HTMLElement) => void;
  onFork: () => void;
  onOpenSettings: () => void;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
};

function Topbar({ mode, setMode, name, setName, saveState, onExport, onFork, onOpenSettings }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand-button">
          <span className="brand-mark">
            <Logo size={21} />
          </span>

          <span className="brand-word">blank</span>
        </div>

        <span className="topbar-divider" />

        <input
          className="document-name"
          value={name}
          aria-label="Document name"
          onChange={(event) => setName(event.target.value)}
        />

        <span
          className="save-state"
          data-state={saveState.startsWith("Saved") ? "saved" : saveState.startsWith("Not") ? "error" : "pending"}
        >
          {saveState}
        </span>
      </div>

      <SlidingTabs
        label="Workspace"
        size="m"
        value={mode}
        onChange={setMode}
        options={[
          {
            id: "design",
            label: (
              <>
                <SFSymbol name="slider.horizontal.3" size={12} />
                Design
              </>
            ),
          },
          {
            id: "code",
            label: (
              <>
                <SFSymbol name="chevron.left.forwardslash.chevron.right" size={13} />
                Code
              </>
            ),
          },
          {
            id: "ai",
            label: (
              <>
                <SFSymbol name="sparkles" size={12} />
                AI
              </>
            ),
          },
        ]}
      />

      <div className="topbar-actions">
        <Button variant="neutral" size="sm" leftIcon={<SFSymbol name="doc.text" size={11} />} onClick={onFork}>
          Fork
        </Button>
        <Button variant="neutral" size="sm" leftIcon={<SFSymbol name="arrow.down" size={11} />} onClick={(event) => onExport(event.currentTarget)}>Export files</Button>
        <Button variant="primary" size="sm" leftIcon={<SFSymbol name="arrow.up.right" size={10} />} disabled title="Publishing requires a connected registry, which is not configured yet.">Publish</Button>
        <Button variant="ghost" size="icon-sm" aria-label="Settings" title="Settings (⌘,)" onClick={onOpenSettings}>
          <SFSymbol name="gearshape" size={14} />
        </Button>
      </div>
    </header>
  );
}

type LeftSidebarProps = {
  mode: EditorMode;

  activeSpecId: string;

  enabled: string[];

  onAddComponents: () => void;

  onSelect: (entry: CatalogEntry) => void;

  /** Forked documents listed under their own section, selectable like catalog entries. */
  forks: Array<{ spec: ComponentSpec; name: string }>;

  /** The active document's own name; renames show up everywhere immediately. */
  docName: string;

  onSelectSpec: (spec: ComponentSpec) => void;

  activeFile: ComponentFileName;

  spec: ComponentSpec;

  setActiveFile: (file: ComponentFileName) => void;

  setMode: (mode: EditorMode) => void;

  /** Child nodes the preview renders, for the Layers outline. */
  nodes: PreviewNode[];

  selectedNode: string | null;

  overriddenNodes: string[];

  onSelectNode: (key: string | null) => void;

  /** Right-click on a workspace component. */
  onComponentMenu: (id: string, name: string, event: MouseEvent<HTMLElement>) => void;
};

function LeftSidebar({
  mode,
  activeSpecId,
  enabled,
  onAddComponents,
  onSelect,
  forks,
  docName,
  onSelectSpec,
  activeFile,
  spec,
  setActiveFile,
  setMode,
  nodes,
  selectedNode,
  overriddenNodes,
  onSelectNode,
  onComponentMenu,
}: LeftSidebarProps) {
  const available = (entry: CatalogEntry) => {
    const match = COMPONENT_SPECS.find((candidate) => candidate.name === entry.name);
    return match && enabled.includes(match.id) ? match : undefined;
  };

  const primitives = primitiveCatalog.filter(available);
  const composition = compositionCatalog.filter(available);
  const specIcon = componentIcon(spec);

  return (
    <aside className="left-sidebar">
      <div className="left-sidebar-scroll">
        {mode === "design" ? (
          <>
            <SidebarHeading count={primitives.length}>Primitives</SidebarHeading>

            <div className="sidebar-items">
              {primitives.map((entry) => {
                const match = available(entry);
                return (
                  <SidebarItem
                    key={entry.name}
                    icon={entry.icon}
                    label={entry.name}
                    active={match?.id === activeSpecId}
                    onClick={match ? () => onSelect(entry) : undefined}
                    onContextMenu={match ? (event) => onComponentMenu(match.id, entry.name, event) : undefined}
                  />
                );
              })}
            </div>

            <SidebarHeading count={composition.length}>Composition</SidebarHeading>

            <div className="sidebar-items">
              {composition.map((entry) => {
                const match = available(entry);
                return (
                  <SidebarItem
                    key={entry.name}
                    icon={entry.icon}
                    label={entry.name}
                    active={match?.id === activeSpecId}
                    onClick={match ? () => onSelect(entry) : undefined}
                    onContextMenu={match ? (event) => onComponentMenu(match.id, entry.name, event) : undefined}
                  />
                );
              })}
            </div>

            {forks.length > 0 && (
              <>
                <SidebarHeading count={forks.length}>Custom</SidebarHeading>

                <div className="sidebar-items">
                  {forks.map((fork) => (
                    <SidebarItem
                      key={fork.spec.id}
                      icon={componentIcon(fork.spec)}
                      label={fork.name}
                      active={fork.spec.id === activeSpecId}
                      onClick={() => onSelectSpec(fork.spec)}
                      onContextMenu={(event) => onComponentMenu(fork.spec.id, fork.name, event)}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="sidebar-separator" />

            <SidebarHeading count={nodes.length > 0 ? nodes.length : undefined}>Layers</SidebarHeading>

            <div className="layer-tree">
              <button
                type="button"
                className="layer-row layer-row-active"
                aria-pressed={!selectedNode}
                title={`Select ${docName}`}
                data-cuelume-toggle="whisper"
                onClick={() => onSelectNode(null)}
              >
                <SFSymbol name="chevron.down" size={11} />

                <SFSymbol name={specIcon} size={13} />

                {docName}
              </button>

              {spec.contentProp && (
                <button className="layer-row layer-row-child" onClick={() => document.getElementById("component-content")?.focus()}>
                  <SFSymbol name="textformat" size={12} />

                  {spec.contentLabel}
                </button>
              )}

              {nodes.map((node) => (
                <button
                  key={node.key}
                  type="button"
                  className="layer-row layer-row-child layer-row-node"
                  style={{ "--layer-depth": node.depth } as CSSProperties}
                  aria-pressed={node.key === selectedNode}
                  title={`.${node.key} <${node.tag}>${node.count > 1 ? ` · ${node.count} instances` : ""}`}
                  data-cuelume-toggle="whisper"
                  onClick={() => onSelectNode(node.key)}
                >
                  <SFSymbol name={layerIcon(node.tag)} size={12} />

                  <span className="layer-row-name">{node.key.slice(node.key.indexOf("__") + 2)}</span>

                  {node.count > 1 && <span className="layer-row-count">{node.count}</span>}

                  {overriddenNodes.includes(node.key) && <span className="layer-row-dot" role="img" aria-label="Has overrides" />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <SidebarHeading>Files</SidebarHeading>

            <div className="file-tree">
              <div className="file-folder">
                <SFSymbol name="chevron.down" size={11} />

                <SFSymbol name="folder" size={13} />

                <span>component</span>
              </div>

              {[spec.fileName, "styles.css"].map((file) => (
                <button
                  key={file}
                  className={`file-row ${activeFile === file ? "file-row-active" : ""}`}
                  data-cuelume-toggle="whisper"
                  onClick={() => setActiveFile(file)}
                >
                  {file.endsWith(".css")
                    ? <span className="css-file-icon">#</span>
                    : <SFSymbol name="doc.text" size={13} />}

                  <span>{file}</span>

                  <span className="file-language">{file.endsWith(".css") ? "CSS" : "TSX"}</span>
                </button>
              ))}
            </div>

            <div className="sidebar-separator" />

            <div className="code-file-help">
              <div className="code-file-help-icon">
                <SFSymbol name="chevron.left.forwardslash.chevron.right" size={14} />
              </div>

              <div>
                <strong>Real files</strong>

                <p>Edit logic, props and CSS directly.</p>
              </div>
            </div>

            <div className="code-file-help">
              <div className="code-file-help-icon">
                <SFSymbol name="slider.horizontal.3" size={14} />
              </div>

              <div>
                <strong>Visual sync</strong>

                <p>Design rewrites only managed CSS.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-add-components"
          onClick={onAddComponents}
        >
          <SFSymbol name="plus" size={12} />
          Add components
        </button>

        <button
          className="sidebar-mode-card"
          onClick={() => setMode(mode === "design" ? "code" : "design")}
        >
          <div className="sidebar-mode-card-icon">
            <SFSymbol name={mode === "design" ? "chevron.left.forwardslash.chevron.right" : "square.3.layers.3d"} size={14} />
          </div>

          <div>
            <strong>{mode === "design" ? "Open code" : "Open design"}</strong>

            <span>{mode === "design" ? "Edit TSX & CSS" : "Visual editor"}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

function layerIcon(tag: string): SFSymbolName {
  if (tag === "button" || tag === "a") return "cursorarrow";
  if (["input", "textarea", "select"].includes(tag)) return "textbox";
  if (["ul", "ol", "li"].includes(tag)) return "list.bullet";
  if (["img", "svg", "picture", "video", "canvas"].includes(tag)) return "photo.stack";
  if (["span", "p", "label", "strong", "em", "small", "code", "kbd", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return "textformat";
  return "square.dashed";
}

function SidebarHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="sidebar-heading">
      <span>{children}</span>
      {count !== undefined && <span className="sidebar-heading-count">{count}</span>}
    </div>
  );
}

type SidebarItemProps = {
  icon: SFSymbolName;

  label: string;

  active?: boolean;

  onClick?: () => void;

  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;
};

function SidebarItem({ icon, label, active = false, onClick, onContextMenu }: SidebarItemProps) {
  if (onClick) {
    return (
      <button
        type="button"
        className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}
        aria-current={active ? "page" : undefined}
        data-cuelume-toggle="whisper"
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        <SFSymbol name={icon} size={14} />
        <span>{label}</span>
      </button>
    );
  }
  return (
    <button disabled title="Coming soon" className="sidebar-item">
      <SFSymbol name={icon} size={14} />

      <span>{label}</span>

      <span className="sidebar-item-soon">Soon</span>
    </button>
  );
}
