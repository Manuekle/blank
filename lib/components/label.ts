import type { ComponentSpec } from "@/lib/component-model";

export const defaultLabelTSX = `import {
  forwardRef,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type LabelProps =
  LabelHTMLAttributes<HTMLLabelElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Label = forwardRef<
  HTMLLabelElement,
  LabelProps
>(function Label(
  {
    children = "Label",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <label
      ref={ref}
      className={[
        "blank-label",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </label>
  );
});
`;

export const LABEL_SPEC: ComponentSpec = {
  id: "label",
  name: "Label",
  fileName: "Label.tsx",
  exportName: "Label",
  className: "blank-label",
  vanillaTSX: defaultLabelTSX,
  contentProp: "children",
  contentLabel: "Text",
  defaultContent: "Label",
  subCSS: "",
  supportedStates: ["default"],
};
