import type { ComponentSpec } from "@/lib/component-model";

export const defaultInputTSX = `import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import "./styles.css";

export type InputProps =
  InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<
  HTMLInputElement,
  InputProps
>(function Input(
  {
    placeholder = "Input",
    className = "",
    ...props
  },
  ref,
) {
  return (
    <input
      ref={ref}
      placeholder={placeholder}
      className={[
        "blank-input",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

export const INPUT_SPEC: ComponentSpec = {
  id: "input",
  name: "Input",
  fileName: "Input.tsx",
  exportName: "Input",
  className: "blank-input",
  vanillaTSX: defaultInputTSX,
  contentProp: "placeholder",
  contentLabel: "Placeholder",
  defaultContent: "Input",
  subCSS: `.blank-input::placeholder {
  color: var(--blank-placeholder-color, #8c8c8c);
  opacity: 1;
}`,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
