import type { ComponentSpec } from "@/lib/component-model";

export const defaultSheetTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type SheetProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Sheet = forwardRef<
  HTMLDivElement,
  SheetProps
>(function Sheet(
  {
    children = "Sheet",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby="blank-sheet-title"
      className={[
        "blank-sheet",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-sheet__header">
        <h2
          id="blank-sheet-title"
          className="blank-sheet__title"
        >
          {children}
        </h2>

        <button
          type="button"
          className="blank-sheet__close"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <p className="blank-sheet__description">
        Sheet description.
      </p>
    </div>
  );
});
`;

const sheetSubCSS = `.blank-sheet {
  display: grid;
  gap: 8px;
}
.blank-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.blank-sheet__title,
.blank-sheet__description {
  margin: 0;
}`;

export const SHEET_SPEC: ComponentSpec = {
  id: "sheet",
  name: "Sheet",
  fileName: "Sheet.tsx",
  exportName: "Sheet",
  className: "blank-sheet",
  vanillaTSX: defaultSheetTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Sheet",
  subCSS: sheetSubCSS,
  supportedStates: ["default"],
};
