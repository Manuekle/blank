import type { ComponentSpec } from "@/lib/component-model";

export const defaultDirectionTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type DirectionProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Direction = forwardRef<
  HTMLDivElement,
  DirectionProps
>(function Direction(
  {
    children = "Text direction",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      dir="rtl"
      className={[
        "blank-direction",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
});
`;

const directionSubCSS = `.blank-direction {
  display: block;
}`;

export const DIRECTION_SPEC: ComponentSpec = {
  id: "direction",
  name: "Direction",
  fileName: "Direction.tsx",
  exportName: "Direction",
  className: "blank-direction",
  vanillaTSX: defaultDirectionTSX,
  contentProp: "children",
  contentLabel: "Text",
  defaultContent: "Text direction",
  subCSS: directionSubCSS,
  supportedStates: ["default"],
};
