import type { ComponentSpec } from "@/lib/component-model";

export const defaultSidebarTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type SidebarProps =
  HTMLAttributes<HTMLElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

const items = ["Dashboard", "Projects", "Settings"];

export const Sidebar = forwardRef<
  HTMLElement,
  SidebarProps
>(function Sidebar(
  {
    children = "Acme",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <aside
      ref={ref}
      className={[
        "blank-sidebar",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-sidebar__header">
        {children}
      </div>

      <nav
        aria-label="Sidebar"
        className="blank-sidebar__nav"
      >
        {items.map((item, index) => (
          <a
            key={item}
            href="#"
            aria-current={index === 0 ? "page" : undefined}
            className="blank-sidebar__item"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="blank-sidebar__footer">
        Sign out
      </div>
    </aside>
  );
});
`;

const sidebarSubCSS = `.blank-sidebar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 12px;
}
.blank-sidebar__header,
.blank-sidebar__footer {
  display: block;
}
.blank-sidebar__nav {
  display: grid;
  gap: 2px;
  align-content: start;
}
.blank-sidebar__item {
  display: block;
  text-decoration: none;
  color: inherit;
}`;

export const SIDEBAR_SPEC: ComponentSpec = {
  id: "sidebar",
  name: "Sidebar",
  fileName: "Sidebar.tsx",
  exportName: "Sidebar",
  className: "blank-sidebar",
  vanillaTSX: defaultSidebarTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Acme",
  subCSS: sidebarSubCSS,
  supportedStates: ["default"],
};
