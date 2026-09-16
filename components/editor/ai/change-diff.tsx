"use client";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import { useDialog } from "../use-dialog";
import { useExitPhase } from "../use-presence";

import type { AIChangeSet } from "@/lib/ai/change-set";
import { changeStats, changedFiles } from "@/lib/ai/change-set";
import { diffLines } from "@/lib/revisions";

type ChangeDiffProps = {
  entry: AIChangeSet;
  onRevert: (entry: AIChangeSet) => void;
  onReapply: (entry: AIChangeSet) => void;
  onClose: () => void;
};

const CLOSE_MS = 150;

export function ChangeDiff({ entry, onRevert, onReapply, onClose }: ChangeDiffProps) {
  const reverted = entry.status === "reverted";
  const files = changedFiles(entry);
  const stats = changeStats(entry);
  // The parent unmounts on close, so the exit plays here first.
  const { phase, leave } = useExitPhase(CLOSE_MS);
  const close = () => leave(onClose);
  // Opens on the close button: the diff is read-only, so the way out is the
  // first thing the keyboard should reach.
  const overlayRef = useDialog<HTMLDivElement>(true, {
    onClose: close,
    initialFocus: (root) => root.querySelector<HTMLElement>("[data-diff-close]"),
  });

  return (
    <div
      ref={overlayRef}
      className="ai-diff-overlay t-presence"
      data-state={phase === "open" ? "open" : "closed"}
      role="dialog"
      aria-modal="true"
      aria-label={`Changes in ${entry.prompt}`}
      // A surface that is on its way out is no longer part of the page: it
      // leaves the accessibility tree and the tab order for the whole exit,
      // not only once React unmounts it.
      inert={phase === "closing"}
      aria-hidden={phase === "closing" || undefined}
    >
      <header className="ai-diff-overlay-header">
        <div>
          <strong>Changes</strong>
          <small>{entry.summary}</small>
        </div>

        <div className="ai-diff-overlay-actions">
          <span className="ai-diff-stat">+{stats.added} −{stats.removed}</span>

          {reverted ? (
            <Button variant="ghost" size="sm" onClick={() => onReapply(entry)}>Re-apply</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => onRevert(entry)}>Revert</Button>
          )}

          <Button data-diff-close variant="ghost" size="icon-sm" aria-label="Close changes" onClick={close}>
            <SFSymbol name="xmark" size={11} />
          </Button>
        </div>
      </header>

      <div className="ai-diff-overlay-body">
        {entry.changes.map((change) => {
          const lines = diffLines(change.before, change.after);
          let beforeNumber = 1;
          let afterNumber = 1;

          return (
            <section key={change.path} className="ai-diff-file">
              <div className="ai-diff-file-header">
                <span>{change.path}</span>
                <span className="ai-diff-file-badge">M</span>
              </div>

              <div className="ai-diff-lines">
                {lines.map((line, index) => {
                  if (line.kind === "del") beforeNumber += 1;
                  else if (line.kind === "add") afterNumber += 1;
                  else {
                    beforeNumber += 1;
                    afterNumber += 1;
                  }

                  const number = line.kind === "add" ? afterNumber - 1 : beforeNumber - 1;

                  return (
                    <div key={`${change.path}-${index}`} className="ai-diff-line" data-kind={line.kind}>
                      <span className="ai-diff-line-number">{number}</span>
                      <span className="ai-diff-line-mark">
                        {line.kind === "add" ? "+" : line.kind === "del" ? "−" : " "}
                      </span>
                      <code>{line.text || " "}</code>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
