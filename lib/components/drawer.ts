import type { ComponentSpec } from "@/lib/component-model";

export const defaultDrawerTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type DrawerProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Drawer = forwardRef<
  HTMLDivElement,
  DrawerProps
>(function Drawer(
  {
    children = "Drawer",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby="blank-drawer-title"
      className={[
        "blank-drawer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-drawer__header">
        <h2
          id="blank-drawer-title"
          className="blank-drawer__title"
        >
          {children}
        </h2>
      </div>

      <div className="blank-drawer__content">
        Drawer content
      </div>
    </div>
  );
});
`;

const drawerSubCSS = `.blank-drawer {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.blank-drawer__header {
  display: flex;
  align-items: center;
}
.blank-drawer__title {
  margin: 0;
}`;

export const DRAWER_SPEC: ComponentSpec = {
  id: "drawer",
  name: "Drawer",
  fileName: "Drawer.tsx",
  exportName: "Drawer",
  className: "blank-drawer",
  vanillaTSX: defaultDrawerTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Drawer",
  subCSS: drawerSubCSS,
  supportedStates: ["default"],
};
