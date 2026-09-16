import type { ComponentSpec } from "@/lib/component-model";

export const defaultMenubarTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type MenubarProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const menus = ["File", "Edit", "View", "Help"];

export const Menubar = forwardRef<
  HTMLDivElement,
  MenubarProps
>(function Menubar(
  {
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="menubar"
      className={[
        "blank-menubar",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {menus.map((menu) => (
        <button
          key={menu}
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          disabled={disabled}
          className="blank-menubar__item"
        >
          {menu}
        </button>
      ))}
    </div>
  );
});
`;

const menubarSubCSS = `.blank-menubar {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.blank-menubar__item {
  cursor: pointer;
}`;

export const MENUBAR_SPEC: ComponentSpec = {
  id: "menubar",
  name: "Menubar",
  fileName: "Menubar.tsx",
  exportName: "Menubar",
  className: "blank-menubar",
  vanillaTSX: defaultMenubarTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: menubarSubCSS,
  supportedStates: ["default"],
};
