import type { ComponentSpec } from "@/lib/component-model";

export const defaultFieldTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type FieldProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Field = forwardRef<
  HTMLDivElement,
  FieldProps
>(function Field(
  {
    children = "Field",
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
        "blank-field",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <label className="blank-field__label">
        {children}
      </label>

      <input
        className="blank-field__control"
        placeholder="Value"
        disabled={disabled}
      />

      <span className="blank-field__description">
        Helper text
      </span>
    </div>
  );
});
`;

const fieldSubCSS = `.blank-field {
  display: grid;
  gap: 6px;
}
.blank-field__label {
  display: block;
}
.blank-field__description {
  display: block;
}`;

export const FIELD_SPEC: ComponentSpec = {
  id: "field",
  name: "Field",
  fileName: "Field.tsx",
  exportName: "Field",
  className: "blank-field",
  vanillaTSX: defaultFieldTSX,
  contentProp: "children",
  contentLabel: "Label",
  defaultContent: "Field",
  subCSS: fieldSubCSS,
  supportedStates: ["default"],
};
