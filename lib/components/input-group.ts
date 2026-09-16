import type { ComponentSpec } from "@/lib/component-model";

export const defaultInputGroupTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type InputGroupProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Rendered before the control. */
    addon?: ReactNode;

    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const InputGroup = forwardRef<
  HTMLDivElement,
  InputGroupProps
>(function InputGroup(
  {
    addon = "$",
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "blank-input-group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {addon && (
        <span
          className="blank-input-group__addon"
          aria-hidden="true"
        >
          {addon}
        </span>
      )}

      <input
        className="blank-input-group__control"
        placeholder="Value"
        disabled={disabled}
      />
    </div>
  );
});
`;

const inputGroupSubCSS = `.blank-input-group {
  display: inline-flex;
  align-items: stretch;
}
.blank-input-group__addon {
  display: inline-flex;
  align-items: center;
}
.blank-input-group__control {
  flex: 1;
  min-width: 0;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
}`;

export const INPUT_GROUP_SPEC: ComponentSpec = {
  id: "input-group",
  name: "Input Group",
  fileName: "InputGroup.tsx",
  exportName: "InputGroup",
  className: "blank-input-group",
  vanillaTSX: defaultInputGroupTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: inputGroupSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
