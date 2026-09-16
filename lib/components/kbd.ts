import type { ComponentSpec } from "@/lib/component-model";

export const defaultKbdTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type KbdProps =
  HTMLAttributes<HTMLElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Kbd = forwardRef<
  HTMLElement,
  KbdProps
>(function Kbd(
  {
    children = "K",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={[
        "blank-kbd",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </kbd>
  );
});
`;

export const KBD_SPEC: ComponentSpec = {
  id: "kbd",
  name: "Kbd",
  fileName: "Kbd.tsx",
  exportName: "Kbd",
  className: "blank-kbd",
  vanillaTSX: defaultKbdTSX,
  contentProp: "children",
  contentLabel: "Keys",
  defaultContent: "K",
  subCSS: "",
  supportedStates: ["default"],
};
