"use client";

import { useEffect, useRef, useState } from "react";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import type { AIChangeSet } from "@/lib/ai/change-set";
import { changedFiles } from "@/lib/ai/change-set";

type ChangeCardProps = {
  entry: AIChangeSet;
  onView: (entry: AIChangeSet) => void;
  onRevert: (entry: AIChangeSet) => void;
  onReapply: (entry: AIChangeSet) => void;
};

/** Applied changes settle with a small stroke-drawn check. */
function SuccessCheck() {
  const [state, setState] = useState<"out" | "in">("out");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setState("in"));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span className="t-success-check ai-change-mark" data-state={state} aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path d="M3.4 8.4L6.3 11.3L12.6 4.9" />
      </svg>
    </span>
  );
}

export function ChangeCard({ entry, onView, onRevert, onReapply }: ChangeCardProps) {
  const files = changedFiles(entry);
  const reverted = entry.status === "reverted";

  return (
    <div className="ai-change-card">
      <div className="ai-change-card-heading">
        {reverted ? (
          <span className="ai-change-mark is-reverted" aria-hidden="true">
            <SFSymbol name="arrow.uturn.backward" size={10} />
          </span>
        ) : (
          <SuccessCheck />
        )}

        <p>{entry.summary}</p>
      </div>

      <ul className="ai-change-files">
        {files.map((path) => (
          <li key={path}>
            <span className="ai-change-file-name">{path}</span>
            <span className="ai-change-file-tag">M</span>
          </li>
        ))}
      </ul>

      <div className="ai-change-card-footer">
        <span>
          {entry.changes.length} change{entry.changes.length === 1 ? "" : "s"}
        </span>

        <div className="ai-change-card-actions">
          <Button variant="neutral" size="xs" onClick={() => onView(entry)}>View changes</Button>

          {reverted ? (
            <Button variant="neutral" size="xs" onClick={() => onReapply(entry)}>Re-apply</Button>
          ) : (
            <Button variant="neutral" size="xs" onClick={() => onRevert(entry)}>Revert</Button>
          )}
        </div>
      </div>

      {entry.commit && (
        <a className="ai-change-card-commit" href={entry.commit.url} target="_blank" rel="noreferrer">
          Committed {entry.commit.sha.slice(0, 7)}
        </a>
      )}
    </div>
  );
}
