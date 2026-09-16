import type { ComponentSpec } from "@/lib/component-model";

export const defaultBadgeTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type BadgeProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Badge = forwardRef<
  HTMLSpanElement,
  BadgeProps
>(function Badge(
  {
    children = "Badge",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        "blank-badge",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
});
`;

export const BADGE_SPEC: ComponentSpec = {
  id: "badge",
  name: "Badge",
  fileName: "Badge.tsx",
  exportName: "Badge",
  className: "blank-badge",
  vanillaTSX: defaultBadgeTSX,
  contentProp: "children",
  contentLabel: "Label",
  defaultContent: "Badge",
  subCSS: "",
  supportedStates: ["default"],
};
