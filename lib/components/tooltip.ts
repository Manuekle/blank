import type { ComponentSpec } from "@/lib/component-model";

export const defaultTooltipTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type TooltipProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Tooltip = forwardRef<
  HTMLSpanElement,
  TooltipProps
>(function Tooltip(
  {
    children = "Hover me",
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
        "blank-tooltip",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-tooltip__trigger">
        {children}
      </span>

      <span
        role="tooltip"
        className="blank-tooltip__content"
      >
        Tooltip
      </span>
    </span>
  );
});
`;

const tooltipSubCSS = `.blank-tooltip {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.blank-tooltip__content {
  margin-block-start: 6px;
}`;

export const TOOLTIP_SPEC: ComponentSpec = {
  id: "tooltip",
  name: "Tooltip",
  fileName: "Tooltip.tsx",
  exportName: "Tooltip",
  className: "blank-tooltip",
  vanillaTSX: defaultTooltipTSX,
  contentProp: "children",
  contentLabel: "Trigger",
  defaultContent: "Hover me",
  subCSS: tooltipSubCSS,
  supportedStates: ["default"],
};
