import type { ComponentSpec } from "@/lib/component-model";

export const defaultRadioGroupTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type RadioGroupProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const options = [
  { value: "one", label: "Option one" },
  { value: "two", label: "Option two" },
  { value: "three", label: "Option three" },
];

export const RadioGroup = forwardRef<
  HTMLDivElement,
  RadioGroupProps
>(function RadioGroup(
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
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={[
        "blank-radio-group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {options.map((option, index) => (
        <label
          key={option.value}
          className="blank-radio-group__option"
        >
          <input
            type="radio"
            name="blank-radio"
            value={option.value}
            defaultChecked={index === 0}
            disabled={disabled}
          />

          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
});
`;

const radioGroupSubCSS = `.blank-radio-group {
  display: grid;
  gap: 8px;
}
.blank-radio-group__option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}`;

export const RADIO_GROUP_SPEC: ComponentSpec = {
  id: "radio-group",
  name: "Radio Group",
  fileName: "RadioGroup.tsx",
  exportName: "RadioGroup",
  className: "blank-radio-group",
  vanillaTSX: defaultRadioGroupTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: radioGroupSubCSS,
  supportedStates: ["default"],
};
