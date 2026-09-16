"use client";

import { useEffect, useRef, useState } from "react";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import type { ComponentSpec } from "@/lib/component-model";
import type { AIComposerMode } from "@/lib/ai/change-set";

import { AIPopover } from "./ai-popover";

type AIComposerProps = {
  spec: ComponentSpec;
  busy: boolean;
  mode: AIComposerMode;
  setMode: (mode: AIComposerMode) => void;
  context: string[];
  setContext: (context: string[]) => void;
  onSend: (prompt: string) => void;
};

const modeCopy: Record<AIComposerMode, { label: string; description: string }> = {
  ask: { label: "Ask", description: "Answers questions without editing the component." },
  agent: { label: "Agent", description: "Edits the component and records reversible changes." },
};

const MAX_COMPOSER_HEIGHT = 132;

export function AIComposer({ spec, busy, mode, setMode, context, setContext, onSend }: AIComposerProps) {
  const [draft, setDraft] = useState("");
  const [modeOpen, setModeOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const files = [
    { key: "tsx", label: spec.fileName, tag: "TSX" },
    { key: "css", label: "styles.css", tag: "CSS" },
  ];

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_COMPOSER_HEIGHT)}px`;
  }, [draft]);

  function submit() {
    const prompt = draft.trim();
    if (!prompt || busy || context.length === 0) return;
    setDraft("");
    onSend(prompt);
  }

  function toggleFile(key: string) {
    setContext(context.includes(key) ? context.filter((entry) => entry !== key) : [...context, key]);
  }

  return (
    <div className="ai-composer">
      <textarea
        ref={textareaRef}
        rows={1}
        value={draft}
        placeholder="Ask Blank to change this component…"
        aria-label="Ask Blank AI"
        title="Enter to send · Shift + Enter for a new line"
        disabled={busy}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />

      <div className="ai-composer-toolbar">
        <button
          type="button"
          className="ai-tool-button"
          aria-expanded={modeOpen}
          aria-label={`Mode: ${modeCopy[mode].label}`}
          onClick={() => setModeOpen(true)}
        >
          {modeCopy[mode].label}
          <SFSymbol name="chevron.up.chevron.down" size={9} />
        </button>

        <AIPopover open={modeOpen} onClose={() => setModeOpen(false)} label="Mode" origin="bottom-left" className="ai-menu">
          {(Object.keys(modeCopy) as AIComposerMode[]).map((key) => (
            <button
              key={key}
              type="button"
              className="ai-menu-option"
              aria-pressed={mode === key}
              onClick={() => { setMode(key); setModeOpen(false); }}
            >
              <span>
                <strong>{modeCopy[key].label}</strong>
                <small>{modeCopy[key].description}</small>
              </span>

              {mode === key && <SFSymbol name="checkmark" size={11} />}
            </button>
          ))}
        </AIPopover>

        <button
          type="button"
          className={`ai-tool-button ${contextOpen ? "is-active" : ""}`}
          aria-expanded={contextOpen}
          onClick={() => setContextOpen(true)}
        >
          <SFSymbol name="curlybraces" size={11} />
          {context.length === files.length
            ? `${files.length} files in context`
            : context.length === 0
              ? "No files in context"
              : `${context.length} file in context`}
        </button>

        <AIPopover open={contextOpen} onClose={() => setContextOpen(false)} label="Files in context" origin="bottom-left" className="ai-menu">
          <p className="ai-menu-heading">Files in context</p>

          {files.map((file) => (
            <div
              key={file.key}
              className="ai-menu-check"
              onClick={(event) => {
                // The whole row toggles; the checkbox handles its own clicks.
                if (!(event.target as HTMLElement).closest(".blank-checkbox")) toggleFile(file.key);
              }}
            >
              <Checkbox
                size="sm"
                checked={context.includes(file.key)}
                aria-label={file.label}
                onChange={() => toggleFile(file.key)}
              />
              <span>{file.label}</span>
              <small>{file.tag}</small>
            </div>
          ))}
        </AIPopover>

        <span className="ai-composer-spacer" />

        <Button
          variant="primary"
          size="icon-sm"
          aria-label={busy ? "Blank AI is working" : "Send to Blank AI"}
          disabled={busy || context.length === 0 || draft.trim().length === 0}
          onClick={submit}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={busy ? { animation: "ai-spark-pulse 1.1s ease-in-out infinite" } : undefined}
          >
            <path d="M12 5.5V19" />
            <path d="M18 11C18 11 13.5811 5.00001 12 5C10.4188 4.99999 6 11 6 11" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
