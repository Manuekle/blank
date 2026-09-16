import type { ComponentSpec } from "@/lib/component-model";

export const defaultSelectTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type SelectHTMLAttributes,
} from "react";

import "./styles.css";

export type SelectProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    /** Forwarded to the inner control. */
    selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
  };

export const Select = forwardRef<
  HTMLSpanElement,
  SelectProps
>(function Select(
  {
    className = "",
    disabled,
    selectProps,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        "blank-select",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <select
        {...selectProps}
        disabled={disabled}
        defaultValue={
          selectProps?.defaultValue ??
          "one"
        }
        className="blank-select__control"
      >
        <option value="one">
          Option one
        </option>

        <option value="two">
          Option two
        </option>

        <option value="three">
          Option three
        </option>
      </select>
    </span>
  );
});
`;

const selectSubCSS = `.blank-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.blank-select__control {
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}
.blank-select::after {
  content: "";
  width: 6px;
  height: 6px;
  margin-inline-start: 8px;
  border-inline-end: 1.5px solid currentColor;
  border-block-end: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  pointer-events: none;
}`;

export const SELECT_SPEC: ComponentSpec = {
  id: "select",
  name: "Select",
  fileName: "Select.tsx",
  exportName: "Select",
  className: "blank-select",
  vanillaTSX: defaultSelectTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: selectSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
