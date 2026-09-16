import type { ComponentSpec } from "@/lib/component-model";

export const defaultSkeletonTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type SkeletonProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const Skeleton = forwardRef<
  HTMLSpanElement,
  SkeletonProps
>(function Skeleton(
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
      aria-hidden="true"
      className={[
        "blank-skeleton",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

export const SKELETON_SPEC: ComponentSpec = {
  id: "skeleton",
  name: "Skeleton",
  fileName: "Skeleton.tsx",
  exportName: "Skeleton",
  className: "blank-skeleton",
  vanillaTSX: defaultSkeletonTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: "",
  supportedStates: ["default"],
};
