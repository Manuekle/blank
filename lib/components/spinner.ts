import type { ComponentSpec } from "@/lib/component-model";

export const defaultSpinnerTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type SpinnerProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const Spinner = forwardRef<
  HTMLSpanElement,
  SpinnerProps
>(function Spinner(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label="Loading"
      className={[
        "blank-spinner",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

export const SPINNER_SPEC: ComponentSpec = {
  id: "spinner",
  name: "Spinner",
  fileName: "Spinner.tsx",
  exportName: "Spinner",
  className: "blank-spinner",
  vanillaTSX: defaultSpinnerTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: "",
  supportedStates: ["default"],
};
