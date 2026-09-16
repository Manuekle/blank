import type { ComponentSpec } from "@/lib/component-model";

export const defaultResizableTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ResizableProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const Resizable = forwardRef<
  HTMLDivElement,
  ResizableProps
>(function Resizable(
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
      className={[
        "blank-resizable",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-resizable__panel">
        Sidebar
      </div>

      <div
        className="blank-resizable__handle"
        role="separator"
        aria-orientation="vertical"
      />

      <div className="blank-resizable__panel">
        Content
      </div>
    </div>
  );
});
`;

const resizableSubCSS = `.blank-resizable {
  display: flex;
  align-items: stretch;
  gap: 0;
}
.blank-resizable__panel {
  overflow: auto;
}
.blank-resizable__panel:first-child {
  resize: horizontal;
  min-width: 96px;
  max-width: 60%;
}
.blank-resizable__handle {
  flex: 0 0 auto;
  width: 6px;
  cursor: col-resize;
}`;

export const RESIZABLE_SPEC: ComponentSpec = {
  id: "resizable",
  name: "Resizable",
  fileName: "Resizable.tsx",
  exportName: "Resizable",
  className: "blank-resizable",
  vanillaTSX: defaultResizableTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: resizableSubCSS,
  supportedStates: ["default"],
};
