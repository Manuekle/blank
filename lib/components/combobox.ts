import type { ComponentSpec } from "@/lib/component-model";

export const defaultComboboxTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ComboboxProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const options = ["Apple", "Banana", "Cherry"];

export const Combobox = forwardRef<
  HTMLDivElement,
  ComboboxProps
>(function Combobox(
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
      className={[
        "blank-combobox",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <input
        className="blank-combobox__input"
        placeholder="Search…"
        role="combobox"
        aria-expanded="true"
        aria-controls="blank-combobox-list"
        disabled={disabled}
      />

      <ul
        id="blank-combobox-list"
        role="listbox"
        className="blank-combobox__list"
      >
        {options.map((option, index) => (
          <li
            key={option}
            role="option"
            aria-selected={index === 0}
            className="blank-combobox__option"
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
});
`;

const comboboxSubCSS = `.blank-combobox {
  display: grid;
  gap: 6px;
}
.blank-combobox__list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.blank-combobox__option {
  cursor: pointer;
}`;

export const COMBOBOX_SPEC: ComponentSpec = {
  id: "combobox",
  name: "Combobox",
  fileName: "Combobox.tsx",
  exportName: "Combobox",
  className: "blank-combobox",
  vanillaTSX: defaultComboboxTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: comboboxSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
