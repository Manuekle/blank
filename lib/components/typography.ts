import type { ComponentSpec } from "@/lib/component-model";

export const defaultTypographyTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type TypographyProps =
  HTMLAttributes<HTMLParagraphElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Typography = forwardRef<
  HTMLParagraphElement,
  TypographyProps
>(function Typography(
  {
    children = "Typography",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <p
      ref={ref}
      className={[
        "blank-typography",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </p>
  );
});
`;

export const TYPOGRAPHY_SPEC: ComponentSpec = {
  id: "typography",
  name: "Typography",
  fileName: "Typography.tsx",
  exportName: "Typography",
  className: "blank-typography",
  vanillaTSX: defaultTypographyTSX,
  contentProp: "children",
  contentLabel: "Text",
  defaultContent: "Typography",
  subCSS: "",
  supportedStates: ["default"],
};
