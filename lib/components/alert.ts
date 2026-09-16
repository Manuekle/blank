import type { ComponentSpec } from "@/lib/component-model";

export const defaultAlertTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type AlertProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Alert = forwardRef<
  HTMLDivElement,
  AlertProps
>(function Alert(
  {
    children = "Heads up",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={[
        "blank-alert",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-alert__title">
        {children}
      </span>

      <span className="blank-alert__description">
        Alert description
      </span>
    </div>
  );
});
`;

const alertSubCSS = `.blank-alert {
  display: grid;
  gap: 4px;
}
.blank-alert__title,
.blank-alert__description {
  display: block;
}`;

export const ALERT_SPEC: ComponentSpec = {
  id: "alert",
  name: "Alert",
  fileName: "Alert.tsx",
  exportName: "Alert",
  className: "blank-alert",
  vanillaTSX: defaultAlertTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Heads up",
  subCSS: alertSubCSS,
  supportedStates: ["default"],
};
