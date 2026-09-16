import type { ComponentSpec } from "@/lib/component-model";

export const defaultSeparatorTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type SeparatorProps =
  HTMLAttributes<HTMLHRElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const Separator = forwardRef<
  HTMLHRElement,
  SeparatorProps
>(function Separator(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <hr
      ref={ref}
      className={[
        "blank-separator",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

export const SEPARATOR_SPEC: ComponentSpec = {
  id: "separator",
  name: "Separator",
  fileName: "Separator.tsx",
  exportName: "Separator",
  className: "blank-separator",
  vanillaTSX: defaultSeparatorTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: "",
  supportedStates: ["default"],
};
