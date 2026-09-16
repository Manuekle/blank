"use client";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import type { AIChangeSet } from "@/lib/ai/change-set";
import { changedFiles, isCheckpoint } from "@/lib/ai/change-set";

import { AIPopover } from "./ai-popover";

type ChangeHistoryProps = {
  open: boolean;
  entries: AIChangeSet[];
  onClose: () => void;
  onView: (entry: AIChangeSet) => void;
  onRevert: (entry: AIChangeSet) => void;
  onReapply: (entry: AIChangeSet) => void;
  onAddCheckpoint: () => void;
};

function dayLabel(at: number): string {
  const date = new Date(at);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChangeHistory({
  open,
  entries,
  onClose,
  onView,
  onRevert,
  onReapply,
  onAddCheckpoint,
}: ChangeHistoryProps) {
  const ordered = [...entries].reverse();
  let lastDay = "";

  return (
    <AIPopover open={open} onClose={onClose} label="Change history" className="ai-history">
      <div className="ai-history-header">
        <strong>Changes</strong>

        <Button variant="ghost" size="sm" leftIcon={<SFSymbol name="clock" size={12} />} onClick={onAddCheckpoint}>
          Checkpoint
        </Button>
      </div>

      <div className="ai-history-list">
        {ordered.length === 0 && <p className="ai-popover-note">AI edits appear here once applied.</p>}

        {ordered.map((entry) => {
          const checkpoint = isCheckpoint(entry);
          const day = dayLabel(entry.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;

          return (
            <div key={entry.id}>
              {showDay && <p className="ai-history-day">{day}</p>}

              {checkpoint ? (
                <div className="ai-history-row ai-history-row-static">
                  <span className="ai-history-dot is-hollow" aria-hidden="true" />

                  <span className="ai-history-copy">
                    <strong>{entry.prompt}</strong>
                    <small>Checkpoint</small>
                  </span>

                  <button type="button" className="ai-history-action" onClick={() => onReapply(entry)}>
                    Restore
                  </button>
                </div>
              ) : (
                <div className="ai-history-row">
                  <button
                    type="button"
                    className="ai-history-main"
                    onClick={() => onView(entry)}
                  >
                    <span className={`ai-history-dot ${entry.status === "reverted" ? "is-hollow" : ""}`} aria-hidden="true" />

                    <span className="ai-history-copy">
                      <strong>{entry.summary}</strong>
                      <small>
                        {changedFiles(entry).length} file{changedFiles(entry).length === 1 ? "" : "s"} ·{" "}
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {entry.commit ? " · committed" : ""}
                        {entry.status === "reverted" ? " · reverted" : ""}
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="ai-history-action"
                    onClick={() => (entry.status === "reverted" ? onReapply(entry) : onRevert(entry))}
                  >
                    {entry.status === "reverted" ? "Re-apply" : "Revert"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div className="ai-history-row ai-history-current">
          <span className="ai-history-dot is-current" aria-hidden="true" />
          <span className="ai-history-copy">
            <strong>Current</strong>
            <small>
              {entries.filter((entry) => !isCheckpoint(entry) && entry.status === "applied").length} applied change
              {entries.filter((entry) => !isCheckpoint(entry) && entry.status === "applied").length === 1 ? "" : "s"}
            </small>
          </span>
        </div>
      </div>
    </AIPopover>
  );
}
