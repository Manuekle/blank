import type { ComponentSpec } from "@/lib/component-model";

export const defaultButtonGroupTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ButtonGroupProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const items = ["Day", "Week", "Month"];

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  ButtonGroupProps
>(function ButtonGroup(
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
      role="group"
      className={[
        "blank-button-group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          aria-pressed={index === 0}
          disabled={disabled}
          className="blank-button-group__item"
        >
          {item}
        </button>
      ))}
    </div>
  );
});
`;

const buttonGroupSubCSS = `.blank-button-group {
  display: inline-flex;
  align-items: stretch;
}
.blank-button-group__item {
  cursor: pointer;
}
.blank-button-group__item + .blank-button-group__item {
  margin-inline-start: -1px;
}`;

export const BUTTON_GROUP_SPEC: ComponentSpec = {
  id: "button-group",
  name: "Button Group",
  fileName: "ButtonGroup.tsx",
  exportName: "ButtonGroup",
  className: "blank-button-group",
  vanillaTSX: defaultButtonGroupTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: buttonGroupSubCSS,
  supportedStates: ["default"],
};
