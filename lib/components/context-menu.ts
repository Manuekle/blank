import type { ComponentSpec } from "@/lib/component-model";

export const defaultContextMenuTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ContextMenuProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const items = ["Copy", "Paste", "Duplicate", "Delete"];

export const ContextMenu = forwardRef<
  HTMLDivElement,
  ContextMenuProps
>(function ContextMenu(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="menu"
      className={[
        "blank-context-menu",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item}
          role="menuitem"
          tabIndex={-1}
          className="blank-context-menu__item"
        >
          {item}
        </div>
      ))}
    </div>
  );
});
`;

const contextMenuSubCSS = `.blank-context-menu {
  display: grid;
  min-width: 160px;
}
.blank-context-menu__item {
  cursor: default;
}`;

export const CONTEXT_MENU_SPEC: ComponentSpec = {
  id: "context-menu",
  name: "Context Menu",
  fileName: "ContextMenu.tsx",
  exportName: "ContextMenu",
  className: "blank-context-menu",
  vanillaTSX: defaultContextMenuTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: contextMenuSubCSS,
  supportedStates: ["default"],
};
