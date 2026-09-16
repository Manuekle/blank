import type { ComponentSpec } from "@/lib/component-model";

export const defaultCheckboxTSX = `import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import "./styles.css";

export type CheckboxProps =
  InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(function Checkbox(
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
      className={[
        "blank-checkbox",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

const checkboxSubCSS = `.blank-checkbox {
  cursor: pointer;
}`;

export const CHECKBOX_SPEC: ComponentSpec = {
  id: "checkbox",
  name: "Checkbox",
  fileName: "Checkbox.tsx",
  exportName: "Checkbox",
  className: "blank-checkbox",
  vanillaTSX: defaultCheckboxTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: checkboxSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
