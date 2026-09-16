import type { ComponentSpec } from "@/lib/component-model";

export const defaultTextareaTSX = `import {
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";

import "./styles.css";

export type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function Textarea(
  {
    placeholder = "Textarea",
    className = "",
    ...props
  },
  ref,
) {
  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      className={[
        "blank-textarea",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

export const TEXTAREA_SPEC: ComponentSpec = {
  id: "textarea",
  name: "Textarea",
  fileName: "Textarea.tsx",
  exportName: "Textarea",
  className: "blank-textarea",
  vanillaTSX: defaultTextareaTSX,
  contentProp: "placeholder",
  contentLabel: "Placeholder",
  defaultContent: "Textarea",
  subCSS: `.blank-textarea::placeholder {
  color: var(--blank-placeholder-color, #8c8c8c);
  opacity: 1;
}`,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
