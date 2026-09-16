import type { ComponentSpec } from "@/lib/component-model";

export const defaultInputOtpTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type InputOtpProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Number of single-character slots. */
    length?: number;

    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

export const InputOtp = forwardRef<
  HTMLDivElement,
  InputOtpProps
>(function InputOtp(
  {
    length = 6,
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "blank-input-otp",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          className="blank-input-otp__slot"
          inputMode="numeric"
          maxLength={1}
          aria-label={\`Digit \${index + 1}\`}
          disabled={disabled}
        />
      ))}
    </div>
  );
});
`;

const inputOtpSubCSS = `.blank-input-otp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.blank-input-otp__slot {
  text-align: center;
}`;

export const INPUT_OTP_SPEC: ComponentSpec = {
  id: "input-otp",
  name: "Input OTP",
  fileName: "InputOtp.tsx",
  exportName: "InputOtp",
  className: "blank-input-otp",
  vanillaTSX: defaultInputOtpTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: inputOtpSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
