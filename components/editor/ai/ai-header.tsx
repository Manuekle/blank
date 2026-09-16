"use client";

import { useState } from "react";

import { ChangesIcon } from "@/components/icons/changes";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import type { ComponentFiles, ComponentSpec } from "@/lib/component-model";
import type { AIChangeSet } from "@/lib/ai/change-set";
import { isCheckpoint } from "@/lib/ai/change-set";

import { AIPopover } from "./ai-popover";
import { GitHubControl } from "./github-control";

type AIHeaderProps = {
  spec: ComponentSpec;
  files: ComponentFiles;
  changeSets: AIChangeSet[];
  uncommitted: AIChangeSet[];
  historyOpen: boolean;
  onToggleHistory: () => void;
  onAddCheckpoint: () => void;
  onClearConversation: () => void;
  onCommitted: (ids: string[], sha: string, url: string) => void;
};

export function AIHeader({
  spec,
  files,
  changeSets,
  uncommitted,
  historyOpen,
  onToggleHistory,
  onAddCheckpoint,
  onClearConversation,
  onCommitted,
}: AIHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const edits = changeSets.filter((entry) => !isCheckpoint(entry));

  return (
    <header className="ai-header">
      <div className="ai-header-title">
        <span className="ai-header-mark" aria-hidden="true">
          <SFSymbol name="sparkles" size={13} />
        </span>

        <strong>Blank AI</strong>

        <span className="ai-header-context">Editing {spec.name}</span>
      </div>

      <div className="ai-header-actions">
        <button
          type="button"
          className={`ai-chip-button ${historyOpen ? "is-active" : ""}`}
          aria-expanded={historyOpen}
          onClick={onToggleHistory}
        >
          <ChangesIcon size={13} />
          {edits.length > 0 ? `Changes ${edits.length}` : "Changes"}
        </button>

        <GitHubControl spec={spec} files={files} uncommitted={uncommitted} onCommitted={onCommitted} />

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="More AI actions"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <SFSymbol name="ellipsis" size={13} />
        </Button>

        <AIPopover open={menuOpen} onClose={() => setMenuOpen(false)} label="AI actions" className="ai-menu">
          <button
            type="button"
            onClick={() => { setMenuOpen(false); onAddCheckpoint(); }}
          >
            <SFSymbol name="clock" size={12} />
            New checkpoint
          </button>

          <button
            type="button"
            onClick={() => { setMenuOpen(false); onClearConversation(); }}
          >
            <SFSymbol name="bubble.left" size={12} />
            Clear conversation
          </button>
        </AIPopover>
      </div>
    </header>
  );
}
