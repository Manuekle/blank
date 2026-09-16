import type { ComponentSpec } from "@/lib/component-model";

export const defaultProgressTSX = `import {
  forwardRef,
  type ProgressHTMLAttributes,
} from "react";

import "./styles.css";

export type ProgressProps =
  ProgressHTMLAttributes<HTMLProgressElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const Progress = forwardRef<
  HTMLProgressElement,
  ProgressProps
>(function Progress(
  {
    value = 60,
    max = 100,
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <progress
      ref={ref}
      value={value}
      max={max}
      className={[
        "blank-progress",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

export const PROGRESS_SPEC: ComponentSpec = {
  id: "progress",
  name: "Progress",
  fileName: "Progress.tsx",
  exportName: "Progress",
  className: "blank-progress",
  vanillaTSX: defaultProgressTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: "",
  supportedStates: ["default"],
};
