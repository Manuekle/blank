import type { ComponentSpec } from "@/lib/component-model";

export const defaultAlertDialogTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type AlertDialogProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const AlertDialog = forwardRef<
  HTMLDivElement,
  AlertDialogProps
>(function AlertDialog(
  {
    children = "Uh oh! Something went wrong",
    className = "",
    disabled = false,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alertdialog"
      aria-labelledby="blank-alert-dialog-title"
      aria-describedby="blank-alert-dialog-description"
      aria-disabled={disabled || undefined}
      className={[
        "blank-alert-dialog",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-alert-dialog__card">
        <div className="blank-alert-dialog__content">
          <div
            className="blank-alert-dialog__icon-wrapper"
            aria-hidden="true"
          >
            <svg
              className="blank-alert-dialog__icon"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M12 10.5V15" />

              <circle
                cx="12"
                cy="7.5"
                r="0.75"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </div>

          <div className="blank-alert-dialog__text">
            <h2
              id="blank-alert-dialog-title"
              className="blank-alert-dialog__title"
            >
              {children}
            </h2>

            <p
              id="blank-alert-dialog-description"
              className="blank-alert-dialog__description"
            >
              We apologize for the inconvenience you
              experienced.
            </p>
          </div>
        </div>

        <div className="blank-alert-dialog__actions">
          <button
            type="button"
            disabled={disabled}
            className="
              blank-alert-dialog__action
              blank-alert-dialog__action--primary
            "
          >
            Retry
          </button>

          <button
            type="button"
            disabled={disabled}
            className="
              blank-alert-dialog__action
              blank-alert-dialog__action--secondary
            "
          >
            Learn more
          </button>

          <button
            type="button"
            disabled={disabled}
            aria-label="Close"
            className="blank-alert-dialog__close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M7 7L17 17" />
              <path d="M17 7L7 17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="blank-alert-dialog__footer">
        <span>
          This message will automatically close in{" "}
          <strong>12 sec</strong>
        </span>
      </div>
    </div>
  );
});

AlertDialog.displayName = "AlertDialog";
`;

const alertDialogSubCSS = `.blank-alert-dialog {
  display: flex;
  flex-direction: column;
}
.blank-alert-dialog__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}
.blank-alert-dialog__content {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.blank-alert-dialog__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.blank-alert-dialog__title,
.blank-alert-dialog__description {
  margin: 0;
}
.blank-alert-dialog__actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.blank-alert-dialog__action,
.blank-alert-dialog__close {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.blank-alert-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: center;
}`;

export const ALERT_DIALOG_SPEC: ComponentSpec = {
  id: "alert-dialog",
  name: "Alert Dialog",
  fileName: "AlertDialog.tsx",
  exportName: "AlertDialog",
  className: "blank-alert-dialog",
  vanillaTSX: defaultAlertDialogTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Uh oh! Something went wrong",
  subCSS: alertDialogSubCSS,
  supportedStates: ["default"],
};
