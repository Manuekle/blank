"use client";

import { type ReactNode } from "react";

import { usePresence } from "../use-presence";
import { useDialog } from "../use-dialog";

type AIPopoverProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  origin?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  className?: string;
  children: ReactNode;
};

/** Dropdown surface shared by the AI header, composer toolbar and GitHub control. */
export function AIPopover({ open, onClose, label, origin = "top-right", className, children }: AIPopoverProps) {
  const presence = usePresence(open, 170);
  // Escape, the Tab loop and the return trip to the trigger all live in the hook.
  const surfaceRef = useDialog<HTMLDivElement>(open, { onClose });

  if (!presence.mounted) return null;

  return (
    <>
      <button type="button" className="ai-scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />

      <div
        ref={surfaceRef}
        role="dialog"
        aria-label={label}
        data-origin={origin}
        className={`t-dropdown ai-popover ${presence.state === "open" ? "is-open" : "is-closing"} ${className ?? ""}`}
      >
        {children}
      </div>
    </>
  );
}
