"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

import { SFSymbol, type SFSymbolName } from "@/components/icons/sf-symbol";

import { useDialog } from "./use-dialog";
import { useLastValue, usePresence } from "./use-presence";

import "./context-menu.css";

export type ContextMenuItem = {
  id: string;
  label: string;
  icon?: SFSymbolName;
  tone?: "danger";
  disabled?: boolean;
  /** Short reason shown under a disabled item. */
  note?: string;
  onSelect: () => void;
};

export type ContextMenuState = {
  /** Viewport position the menu opens from. */
  x: number;
  y: number;
  label: string;
  items: ContextMenuItem[];
} | null;

const EDGE = 8;

/** A right-click menu at the pointer, kept inside the viewport. */
export function ContextMenu({ menu, onClose }: { menu: ContextMenuState; onClose: () => void }) {
  const presence = usePresence(Boolean(menu), 120);
  const current = useLastValue(menu, Boolean(menu));
  const surfaceRef = useDialog<HTMLDivElement>(Boolean(menu), { onClose });
  const node = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!menu || !node.current) return;
    const { offsetWidth, offsetHeight } = node.current;
    setPosition({
      left: Math.max(EDGE, Math.min(menu.x, window.innerWidth - offsetWidth - EDGE)),
      top: Math.max(EDGE, Math.min(menu.y, window.innerHeight - offsetHeight - EDGE)),
    });
  }, [menu, presence.mounted]);

  if (!presence.mounted || !current) return null;

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')];
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "ArrowDown" ? items[(index + 1) % items.length]
      : event.key === "ArrowUp" ? items[(index - 1 + items.length) % items.length]
      : event.key === "Home" ? items[0]
      : event.key === "End" ? items[items.length - 1]
      : null;
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return (
    <>
      <div
        className="context-menu-scrim"
        onPointerDown={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />

      <div
        ref={(element) => {
          node.current = element;
          surfaceRef(element);
        }}
        role="menu"
        aria-label={current.label}
        data-origin="top-left"
        className={`t-dropdown context-menu ${presence.state === "open" ? "is-open" : "is-closing"}`}
        style={position}
        onKeyDown={moveFocus}
      >
        {current.items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            className="context-menu-item"
            data-tone={item.tone}
            disabled={item.disabled}
            data-cuelume-hover="tick"
            onClick={() => {
              onClose();
              item.onSelect();
            }}
          >
            {item.icon && <SFSymbol name={item.icon} size={12} />}
            <span>
              {item.label}
              {item.note && <small>{item.note}</small>}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
