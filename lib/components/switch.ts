import type { ComponentSpec } from "@/lib/component-model";

export const defaultSwitchTSX = `import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import "./styles.css";

export type SwitchProps =
  InputHTMLAttributes<HTMLInputElement>;

export const Switch = forwardRef<
  HTMLInputElement,
  SwitchProps
>(function Switch(
  {
    className = "",
    type = "checkbox",
    ...props
  },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      role="switch"
      className={[
        "blank-switch",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

const switchSubCSS = `.blank-switch {
  cursor: pointer;
}`;

export const SWITCH_SPEC: ComponentSpec = {
  id: "switch",
  name: "Switch",
  fileName: "Switch.tsx",
  exportName: "Switch",
  className: "blank-switch",
  vanillaTSX: defaultSwitchTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: switchSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
