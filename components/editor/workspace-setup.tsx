"use client";

import { useId, useMemo, useState } from "react";

import { SFSymbol } from "@/components/icons/sf-symbol";

import { findSpecByName } from "@/lib/components/registry";
import { Button } from "@/components/ui/button";

import {
  compositionCatalog,
  primitiveCatalog,
} from "./component-catalog";
import { useDialog } from "./use-dialog";
import { useExitPhase } from "./use-presence";

type WorkspaceSetupProps = {
  /** Components already in the workspace; empty on first run. */
  initial: string[];
  onConfirm: (ids: string[]) => void;
  onCancel?: () => void;
};

const CLOSE_MS = 150;

/**
 * Workspace setup: pick the components you actually want. Nothing is created
 * until the selection is confirmed, and the choice stays editable later.
 */
export function WorkspaceSetup({ initial, onConfirm, onCancel }: WorkspaceSetupProps) {
  const [selected, setSelected] = useState<string[]>(initial);
  // Mounted by the parent only while open, so the surface plays its enter on
  // the frame after mount and its exit before the callback unmounts it.
  const { phase, leave } = useExitPhase(CLOSE_MS);
  const headingId = useId();
  const descriptionId = useId();

  const cancel = onCancel ? () => leave(onCancel) : undefined;
  const panelRef = useDialog<HTMLDivElement>(true, { onClose: cancel });

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const groups = useMemo(
    () => [
      { title: "Primitives", entries: primitiveCatalog.filter((entry) => findSpecByName(entry.name)) },
      { title: "Composition", entries: compositionCatalog.filter((entry) => findSpecByName(entry.name)) },
    ],
    [],
  );

  return (
    <div className="workspace-setup" data-state={phase}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className={`workspace-setup-panel t-modal ${phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : ""}`}
        // The closing panel leaves the accessibility tree and the tab order
        // right away rather than lingering for the length of its exit.
        inert={phase === "closing"}
        aria-hidden={phase === "closing" || undefined}
      >
        <header className="workspace-setup-header">
          <div>
            <strong id={headingId}>Choose your components</strong>

            <p id={descriptionId}>Start with the ones you need. You can add or remove them any time.</p>
          </div>

          {cancel && (
            <Button variant="ghost" size="icon-sm" aria-label="Cancel" onClick={cancel}>
              <SFSymbol name="xmark" size={12} />
            </Button>
          )}
        </header>

        <div className="workspace-setup-body">
          {groups.map((group) => (
            <section key={group.title} className="workspace-setup-group">
              <h2>{group.title}</h2>

              <div className="workspace-setup-grid">
                {group.entries.map((entry) => {
                  const spec = findSpecByName(entry.name)!;

                  return (
                    <button
                      key={spec.id}
                      type="button"
                      aria-pressed={selected.includes(spec.id)}
                      className="workspace-setup-item"
                      data-cuelume-toggle=""
                      onClick={() => toggle(spec.id)}
                    >
                      <SFSymbol name={entry.icon} size={13} />

                      <span>{spec.name}</span>

                      <span className="workspace-setup-item-check" aria-hidden="true">
                        <SFSymbol name="checkmark.circle" size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="workspace-setup-footer">
          {/* A stable region so the count is re-announced as it changes. */}
          <span role="status">
            {selected.length === 0
              ? "Select at least one component"
              : `${selected.length} selected`}
          </span>

          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              Clear
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={selected.length === 0}
              onClick={() => leave(() => onConfirm(selected))}
            >
              {initial.length > 0 ? "Save workspace" : "Start workspace"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
