import type { ComponentSpec } from "@/lib/component-model";

export const defaultToggleGroupTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ToggleGroupProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const items = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const ToggleGroup = forwardRef<
  HTMLDivElement,
  ToggleGroupProps
>(function ToggleGroup(
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
        "blank-toggle-group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((item, index) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={index === 0}
          disabled={disabled}
          className="blank-toggle-group__item"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});
`;

const toggleGroupSubCSS = `.blank-toggle-group {
  display: inline-flex;
  align-items: stretch;
}
.blank-toggle-group__item {
  cursor: pointer;
}
.blank-toggle-group__item + .blank-toggle-group__item {
  margin-inline-start: -1px;
}`;

export const TOGGLE_GROUP_SPEC: ComponentSpec = {
  id: "toggle-group",
  name: "Toggle Group",
  fileName: "ToggleGroup.tsx",
  exportName: "ToggleGroup",
  className: "blank-toggle-group",
  vanillaTSX: defaultToggleGroupTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: toggleGroupSubCSS,
  supportedStates: ["default"],
};
