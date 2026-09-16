import type { ComponentSpec } from "@/lib/component-model";

export const defaultScrollAreaTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ScrollAreaProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const rows = Array.from(
  { length: 12 },
  (_, index) => \`Row \${index + 1}\`,
);

export const ScrollArea = forwardRef<
  HTMLDivElement,
  ScrollAreaProps
>(function ScrollArea(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={0}
      className={[
        "blank-scroll-area",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {rows.map((row) => (
        <div
          key={row}
          className="blank-scroll-area__row"
        >
          {row}
        </div>
      ))}
    </div>
  );
});
`;

const scrollAreaSubCSS = `.blank-scroll-area {
  display: grid;
  gap: 6px;
  overflow-y: auto;
  max-height: 180px;
}`;

export const SCROLL_AREA_SPEC: ComponentSpec = {
  id: "scroll-area",
  name: "Scroll Area",
  fileName: "ScrollArea.tsx",
  exportName: "ScrollArea",
  className: "blank-scroll-area",
  vanillaTSX: defaultScrollAreaTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: scrollAreaSubCSS,
  supportedStates: ["default"],
};
