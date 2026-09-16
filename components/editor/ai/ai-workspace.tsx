"use client";

import { useState } from "react";

import { ChangesIcon } from "@/components/icons/changes";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import type { ComponentFiles, ComponentSpec } from "@/lib/component-model";
import type { AIChangeSet } from "@/lib/ai/change-set";
import { isCheckpoint } from "@/lib/ai/change-set";

import { AIComposer } from "./ai-composer";
import { AIConversation } from "./ai-conversation";
import { AIPopover } from "./ai-popover";
import { ChangeDiff } from "./change-diff";
import { ChangeHistory } from "./change-history";
import { GitHubControl } from "./github-control";
import { useAIWorkspace } from "./use-ai-workspace";

type AIWorkspaceProps = {
  spec: ComponentSpec;
  files: ComponentFiles;
  onApplyFiles: (files: ComponentFiles) => ComponentFiles | null;
  onNotice: (message: string) => void;
};

export function AIWorkspace({ spec, files, onApplyFiles, onNotice }: AIWorkspaceProps) {
  const workspace = useAIWorkspace({ spec, files, applyFiles: onApplyFiles, onNotice });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [diffId, setDiffId] = useState<string | null>(null);

  const edits = workspace.changeSets.filter((entry) => !isCheckpoint(entry));

  const selected = diffId
    ? workspace.changeSets.find((entry) => entry.id === diffId) ?? null
    : null;

  function view(entry: AIChangeSet) {
    setHistoryOpen(false);
    setDiffId(entry.id);
  }

  return (
    <section className="ai-workspace">
      <div className="ai-workspace-actions">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ChangesIcon size={14} />}
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen((value) => !value)}
        >
          {edits.length > 0 ? `Changes ${edits.length}` : "Changes"}
        </Button>

        <GitHubControl spec={spec} files={files} uncommitted={workspace.uncommitted} onCommitted={workspace.commit} />

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
            onClick={() => { setMenuOpen(false); workspace.addCheckpoint(); }}
          >
            <SFSymbol name="clock" size={12} />
            New checkpoint
          </button>

          <button
            type="button"
            onClick={() => { setMenuOpen(false); workspace.clearConversation(); }}
          >
            <SFSymbol name="bubble.left" size={12} />
            Clear conversation
          </button>
        </AIPopover>
      </div>

      <AIConversation
        spec={spec}
        messages={workspace.messages}
        changeSets={workspace.changeSets}
        busy={workspace.busy}
        status={workspace.status}
        onView={view}
        onRevert={workspace.revert}
        onReapply={workspace.reapply}
      />

      <AIComposer
        spec={spec}
        busy={workspace.busy}
        mode={workspace.mode}
        setMode={workspace.setMode}
        context={workspace.context}
        setContext={workspace.setContext}
        onSend={workspace.send}
      />

      <ChangeHistory
        open={historyOpen}
        entries={workspace.changeSets}
        onClose={() => setHistoryOpen(false)}
        onView={view}
        onRevert={workspace.revert}
        onReapply={workspace.reapply}
        onAddCheckpoint={workspace.addCheckpoint}
      />

      {selected && (
        <ChangeDiff
          entry={selected}
          onRevert={workspace.revert}
          onReapply={workspace.reapply}
          onClose={() => setDiffId(null)}
        />
      )}
    </section>
  );
}
