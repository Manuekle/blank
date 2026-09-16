"use client";

import Editor, { loader, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react";

import { SFSymbol } from "@/components/icons/sf-symbol";

import {
  type ComponentFileName,
  type ComponentFiles,
  type ComponentSpec,
} from "@/lib/component-model";

let localMonaco: Promise<void> | undefined;
function loadLocalMonaco() {
  if (!localMonaco) {
    const environment = globalThis as typeof globalThis & { MonacoEnvironment?: { getWorker: (_: string, label: string) => Worker } };
    environment.MonacoEnvironment = { getWorker: (_, label) => {
      const name = label === "typescript" || label === "javascript" ? "ts" : ["css", "scss", "less"].includes(label) ? "css" : ["html", "handlebars", "razor"].includes(label) ? "html" : label === "json" ? "json" : "editor";
      return new Worker(`/monaco/${name}.worker.js`, { type: "module" });
    } };
    const url = "/monaco/index.js";
    localMonaco = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url).then(monaco => { loader.config({ monaco }); }).catch(error => { localMonaco = undefined; throw error; });
  }
  return localMonaco;
}

type CodeWorkspaceProps = {
  spec: ComponentSpec;

  files: ComponentFiles;

  activeFile: ComponentFileName;

  setActiveFile: (file: ComponentFileName) => void;

  onChangeFile: (file: ComponentFileName, value: string) => void;
};

export function CodeWorkspace({
  spec,
  files,
  activeFile,
  setActiveFile,
  onChangeFile,
}: CodeWorkspaceProps) {
  const [editorReady, setEditorReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const shellRef = useRef<HTMLDivElement>(null);
  const firstPaint = useRef(true);
  useEffect(() => {
    let mounted = true;
    loadLocalMonaco().then(() => { if (mounted) setEditorReady(true); }).catch(() => { if (mounted) setLoadError("Code editor unavailable. You can continue editing below."); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (firstPaint.current) { firstPaint.current = false; return; }
    el.style.setProperty(
      "--t-tab-from-x",
      activeFile === "styles.css"
        ? "var(--page-slide-distance)"
        : "calc(var(--page-slide-distance) * -1)",
    );
    el.classList.remove("t-tab-enter");
    void el.offsetWidth;
    el.classList.add("t-tab-enter");
  }, [activeFile]);
  const value = activeFile === spec.fileName ? files.tsx : files.css;
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const latestValue = useRef(value);
  latestValue.current = value;
  const applyingExternalChange = useRef(false);

  // Monaco owns the text while the user types. Echoing React state back into it
  // mid-typing restores stale text and loops onChange, so only push changes made
  // elsewhere (visual controls, reset, undo) while the editor is not focused.
  // Models outlive remounts per path, so the same check runs on mount.
  function pushExternalValue() {
    const editor = editorRef.current;
    const model = editor?.getModel();
    const next = latestValue.current;
    if (!editor || !model || editor.hasTextFocus() || model.getValue() === next) return;
    applyingExternalChange.current = true;
    editor.executeEdits("blank-sync", [{ range: model.getFullModelRange(), text: next }]);
    applyingExternalChange.current = false;
  }

  useEffect(() => pushExternalValue(), [value, editorReady]);

  const language = activeFile === spec.fileName ? "typescript" : "css";

  const beforeMount: BeforeMount = (monaco) => {
    monaco.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,

      noSyntaxValidation: false,
    });

    monaco.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.typescript.ScriptTarget.ES2020,

      module: monaco.typescript.ModuleKind.ESNext,

      moduleResolution:
        monaco.typescript.ModuleResolutionKind.NodeJs,

      jsx: monaco.typescript.JsxEmit.ReactJSX,

      allowNonTsExtensions: true,

      allowJs: true,

      esModuleInterop: true,

      allowSyntheticDefaultImports: true,

      strict: true,
    });

    monaco.editor.defineTheme("blank-dark", {
      base: "vs-dark",
      inherit: true,

      rules: [
        {
          token: "comment",
          foreground: "565656",
        },
        {
          token: "keyword",
          foreground: "C5C5C5",
        },
        {
          token: "string",
          foreground: "8EB99F",
        },
        {
          token: "number",
          foreground: "B9AA86",
        },
        {
          token: "type.identifier",
          foreground: "91A9C3",
        },
        {
          token: "identifier",
          foreground: "BBBBBB",
        },
      ],

      colors: {
        "editor.background": "#111113",

        "editor.foreground": "#B8B8B8",

        "editorLineNumber.foreground": "#404040",

        "editorLineNumber.activeForeground": "#7A7A7A",

        "editorCursor.foreground": "#F0F0F0",

        "editor.selectionBackground": "#315A7F88",

        "editor.inactiveSelectionBackground": "#273B4F66",

        "editor.lineHighlightBackground": "#FFFFFF07",

        "editorLineHighlightBorder": "#00000000",

        "editorIndentGuide.background1": "#FFFFFF08",

        "editorIndentGuide.activeBackground1": "#FFFFFF16",

        "editorWidget.background": "#181818",

        "editorWidget.border": "#FFFFFF10",

        "editorSuggestWidget.background": "#181818",

        "editorSuggestWidget.border": "#FFFFFF10",

        "editorSuggestWidget.selectedBackground": "#252525",

        "editorHoverWidget.background": "#181818",

        "editorHoverWidget.border": "#FFFFFF10",

        "input.background": "#181818",

        "input.border": "#FFFFFF12",

        "input.foreground": "#C2C2C2",

        "input.placeholderForeground": "#5A5A5A",

        "inputOption.activeBorder": "#5DA8FF99",

        "inputOption.activeBackground": "#5DA8FF22",

        "focusBorder": "#5DA8FF99",

        "scrollbar.shadow": "#00000000",

        "scrollbarSlider.background": "#FFFFFF0C",

        "scrollbarSlider.hoverBackground": "#FFFFFF16",

        "scrollbarSlider.activeBackground": "#FFFFFF20",
      },
    });
  };

  return (
    <section
      className="code-workspace t-tab-enter"
      style={{ "--t-tab-from-x": "var(--page-slide-distance)" } as CSSProperties}
    >
      <link rel="stylesheet" href="/monaco/index.css" />
      <div className="code-workspace-header">
        <div className="code-file-tabs">
          <button
            className={activeFile === spec.fileName ? "code-file-tab-active" : ""}
            onClick={() => setActiveFile(spec.fileName)}
          >
            <SFSymbol name="doc.text" size={13} />
            {spec.fileName}
          </button>

          <button
            className={activeFile === "styles.css" ? "code-file-tab-active" : ""}
            onClick={() => setActiveFile("styles.css")}
          >
            <SFSymbol name="paintbrush" size={13} />
            styles.css
          </button>
        </div>

        <div className="code-runtime-status">
          <SFSymbol name="checkmark.circle" size={11} />
          Editable files
        </div>
      </div>

      <div className="code-workspace-body">
        <div className="t-acc" data-open={activeFile === "styles.css"}>
          <div className="t-acc-panel" inert={activeFile !== "styles.css"}>
            <div className="t-acc-panel-inner">
              <div className="generated-css-notice">
                <SFSymbol name="exclamationmark.circle" size={13} />

                <span>
                  Design controls rewrite only <code>blank:generated</code>. Your{" "}
                  <code>blank:custom</code> CSS is never overwritten.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="monaco-shell" ref={shellRef}>
          {loadError ? <><p className="code-fallback-notice" role="status"><SFSymbol name="exclamationmark.circle" size={13} />{loadError}</p><textarea className="code-fallback" aria-label={activeFile} value={value} onChange={event => onChangeFile(activeFile, event.target.value)} spellCheck={false} /></> : !editorReady ? <div className="editor-loading">Loading editor…</div> : <Editor
            path={activeFile}
            defaultValue={value}
            language={language}
            theme="blank-dark"
            beforeMount={beforeMount}
            onMount={(editor) => { editorRef.current = editor; pushExternalValue(); }}
            loading={<div className="editor-loading">Loading editor…</div>}
            onChange={(nextValue) => {
              if (applyingExternalChange.current) return;
              // Keystrokes arrive as discrete events; syncing parsers and preview at
              // sync priority on every key trips React's nested update limit.
              startTransition(() => onChangeFile(activeFile, nextValue ?? ""));
            }}
            options={{
              automaticLayout: true,
              editContext: false,

              minimap: {
                enabled: false,
              },

              fontSize: 12,

              lineHeight: 20,

              fontFamily:
                '"SFMono-Regular", "Roboto Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace',

              fontLigatures: true,

              tabSize: 2,

              insertSpaces: true,

              scrollBeyondLastLine: false,

              smoothScrolling: true,

              padding: {
                top: 18,
                bottom: 28,
              },

              renderLineHighlight: "all",

              overviewRulerLanes: 0,

              overviewRulerBorder: false,

              hideCursorInOverviewRuler: true,

              folding: true,

              glyphMargin: false,

              lineDecorationsWidth: 8,

              lineNumbersMinChars: 3,

              bracketPairColorization: {
                enabled: true,
              },

              guides: {
                bracketPairs: true,

                indentation: true,
              },

              wordWrap: "off",

              cursorBlinking: "smooth",

              cursorSmoothCaretAnimation: "on",

              cursorWidth: 1,

              stickyScroll: {
                enabled: false,
              },

              suggest: {
                showWords: true,
              },

              scrollbar: {
                verticalScrollbarSize: 7,

                horizontalScrollbarSize: 7,

                alwaysConsumeMouseWheel: false,
              },
            }}
          />}
        </div>
      </div>
    </section>
  );
}
