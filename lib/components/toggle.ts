import type { ComponentSpec } from "@/lib/component-model";

export const defaultToggleTSX = `import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type ToggleProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Pressed state of the toggle. */
    pressed?: boolean;

    children?: ReactNode;
  };

export const Toggle = forwardRef<
  HTMLButtonElement,
  ToggleProps
>(function Toggle(
  {
    children = "Toggle",
    pressed = false,
    className = "",
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      className={[
        "blank-toggle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});
`;

const toggleSubCSS = `.blank-toggle {
  cursor: pointer;
}`;

export const TOGGLE_SPEC: ComponentSpec = {
  id: "toggle",
  name: "Toggle",
  fileName: "Toggle.tsx",
  exportName: "Toggle",
  className: "blank-toggle",
  vanillaTSX: defaultToggleTSX,
  contentProp: "children",
  contentLabel: "Label",
  defaultContent: "Toggle",
  subCSS: toggleSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
