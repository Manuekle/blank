import type { ComponentSpec } from "@/lib/component-model";

export const defaultCollapsibleTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type CollapsibleProps =
  HTMLAttributes<HTMLDetailsElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Collapsible = forwardRef<
  HTMLDetailsElement,
  CollapsibleProps
>(function Collapsible(
  {
    children = "Details",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <details
      ref={ref}
      open
      className={[
        "blank-collapsible",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <summary className="blank-collapsible__trigger">
        {children}
      </summary>

      <div className="blank-collapsible__content">
        Hidden content
      </div>
    </details>
  );
});
`;

const collapsibleSubCSS = `.blank-collapsible {
  display: block;
}
.blank-collapsible__trigger {
  cursor: pointer;
}
.blank-collapsible__content {
  padding-block: 8px;
}`;

export const COLLAPSIBLE_SPEC: ComponentSpec = {
  id: "collapsible",
  name: "Collapsible",
  fileName: "Collapsible.tsx",
  exportName: "Collapsible",
  className: "blank-collapsible",
  vanillaTSX: defaultCollapsibleTSX,
  contentProp: "children",
  contentLabel: "Trigger",
  defaultContent: "Details",
  subCSS: collapsibleSubCSS,
  supportedStates: ["default"],
};
