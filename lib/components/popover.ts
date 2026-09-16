import type { ComponentSpec } from "@/lib/component-model";

export const defaultPopoverTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type PopoverProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Popover = forwardRef<
  HTMLSpanElement,
  PopoverProps
>(function Popover(
  {
    children = "Open popover",
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
        "blank-popover",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <button
        type="button"
        aria-expanded="true"
        className="blank-popover__trigger"
      >
        {children}
      </button>

      <span
        role="dialog"
        className="blank-popover__content"
      >
        Popover content
      </span>
    </span>
  );
});
`;

const popoverSubCSS = `.blank-popover {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}
.blank-popover__content {
  margin-block-start: 6px;
}`;

export const POPOVER_SPEC: ComponentSpec = {
  id: "popover",
  name: "Popover",
  fileName: "Popover.tsx",
  exportName: "Popover",
  className: "blank-popover",
  vanillaTSX: defaultPopoverTSX,
  contentProp: "children",
  contentLabel: "Trigger",
  defaultContent: "Open popover",
  subCSS: popoverSubCSS,
  supportedStates: ["default"],
};
