import type { ComponentSpec } from "@/lib/component-model";

export const defaultToastTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type ToastProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Toast = forwardRef<
  HTMLDivElement,
  ToastProps
>(function Toast(
  {
    children = "Saved",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      className={[
        "blank-toast",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-toast__body">
        <span className="blank-toast__title">
          {children}
        </span>

        <span className="blank-toast__description">
          Toast description.
        </span>
      </div>

      <button
        type="button"
        className="blank-toast__close"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
});
`;

const toastSubCSS = `.blank-toast {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.blank-toast__body {
  display: grid;
  gap: 2px;
}
.blank-toast__title,
.blank-toast__description {
  display: block;
}`;

export const TOAST_SPEC: ComponentSpec = {
  id: "toast",
  name: "Toast",
  fileName: "Toast.tsx",
  exportName: "Toast",
  className: "blank-toast",
  vanillaTSX: defaultToastTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Saved",
  subCSS: toastSubCSS,
  supportedStates: ["default"],
};
