import type { ComponentSpec } from "@/lib/component-model";

export const defaultDialogTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type DialogProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Dialog = forwardRef<
  HTMLDivElement,
  DialogProps
>(function Dialog(
  {
    children = "Dialog title",
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
      aria-labelledby="blank-dialog-title"
      className={[
        "blank-dialog",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <h2
        id="blank-dialog-title"
        className="blank-dialog__title"
      >
        {children}
      </h2>

      <p className="blank-dialog__description">
        Dialog description.
      </p>

      <div className="blank-dialog__actions">
        <button
          type="button"
          className="blank-dialog__action"
        >
          Cancel
        </button>

        <button
          type="button"
          className="blank-dialog__action"
        >
          Continue
        </button>
      </div>
    </div>
  );
});
`;

const dialogSubCSS = `.blank-dialog {
  display: grid;
  gap: 10px;
}
.blank-dialog__title,
.blank-dialog__description {
  margin: 0;
}
.blank-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}`;

export const DIALOG_SPEC: ComponentSpec = {
  id: "dialog",
  name: "Dialog",
  fileName: "Dialog.tsx",
  exportName: "Dialog",
  className: "blank-dialog",
  vanillaTSX: defaultDialogTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Dialog title",
  subCSS: dialogSubCSS,
  supportedStates: ["default"],
};
