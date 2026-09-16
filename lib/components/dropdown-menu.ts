import type { ComponentSpec } from "@/lib/component-model";

export const defaultDropdownMenuTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type DropdownMenuProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

const items = ["Profile", "Settings", "Sign out"];

export const DropdownMenu = forwardRef<
  HTMLSpanElement,
  DropdownMenuProps
>(function DropdownMenu(
  {
    children = "Options",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        "blank-dropdown-menu",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <button
        type="button"
        aria-expanded="true"
        aria-haspopup="menu"
        className="blank-dropdown-menu__trigger"
      >
        {children}
      </button>

      <ul
        role="menu"
        className="blank-dropdown-menu__content"
      >
        {items.map((item) => (
          <li
            key={item}
            role="menuitem"
            className="blank-dropdown-menu__item"
          >
            {item}
          </li>
        ))}
      </ul>
    </span>
  );
});
`;

const dropdownMenuSubCSS = `.blank-dropdown-menu {
  display: inline-grid;
  justify-items: start;
}
.blank-dropdown-menu__trigger {
  cursor: pointer;
}
.blank-dropdown-menu__item {
  cursor: default;
}
.blank-dropdown-menu__content {
  margin: 0;
  padding: 0;
  list-style: none;
}`;

export const DROPDOWN_MENU_SPEC: ComponentSpec = {
  id: "dropdown-menu",
  name: "Dropdown Menu",
  fileName: "DropdownMenu.tsx",
  exportName: "DropdownMenu",
  className: "blank-dropdown-menu",
  vanillaTSX: defaultDropdownMenuTSX,
  contentProp: "children",
  contentLabel: "Trigger",
  defaultContent: "Options",
  subCSS: dropdownMenuSubCSS,
  supportedStates: ["default"],
};
