import type { ComponentSpec } from "@/lib/component-model";

export const defaultMarkerTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type MarkerProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Marker = forwardRef<
  HTMLSpanElement,
  MarkerProps
>(function Marker(
  {
    children = "Marker",
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
        "blank-marker",
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

const markerSubCSS = `.blank-marker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}`;

export const MARKER_SPEC: ComponentSpec = {
  id: "marker",
  name: "Marker",
  fileName: "Marker.tsx",
  exportName: "Marker",
  className: "blank-marker",
  vanillaTSX: defaultMarkerTSX,
  contentProp: "children",
  contentLabel: "Text",
  defaultContent: "Marker",
  subCSS: markerSubCSS,
  supportedStates: ["default"],
};
