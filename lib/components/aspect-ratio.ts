import type { ComponentSpec } from "@/lib/component-model";

export const defaultAspectRatioTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type AspectRatioProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const AspectRatio = forwardRef<
  HTMLDivElement,
  AspectRatioProps
>(function AspectRatio(
  {
    children = "16 / 9",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "blank-aspect-ratio",
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

const aspectRatioSubCSS = `.blank-aspect-ratio {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
}`;

export const ASPECT_RATIO_SPEC: ComponentSpec = {
  id: "aspect-ratio",
  name: "Aspect Ratio",
  fileName: "AspectRatio.tsx",
  exportName: "AspectRatio",
  className: "blank-aspect-ratio",
  vanillaTSX: defaultAspectRatioTSX,
  contentProp: "children",
  contentLabel: "Ratio",
  defaultContent: "16 / 9",
  subCSS: aspectRatioSubCSS,
  supportedStates: ["default"],
};
