import type { ComponentSpec } from "@/lib/component-model";

export const defaultBubbleTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type BubbleProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Bubble = forwardRef<
  HTMLDivElement,
  BubbleProps
>(function Bubble(
  {
    children = "Hey there",
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
        "blank-bubble",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-bubble__content">
        {children}
      </span>
    </div>
  );
});
`;

const bubbleSubCSS = `.blank-bubble {
  display: inline-flex;
  max-width: 32ch;
}
.blank-bubble__content {
  display: block;
}`;

export const BUBBLE_SPEC: ComponentSpec = {
  id: "bubble",
  name: "Bubble",
  fileName: "Bubble.tsx",
  exportName: "Bubble",
  className: "blank-bubble",
  vanillaTSX: defaultBubbleTSX,
  contentProp: "children",
  contentLabel: "Message",
  defaultContent: "Hey there",
  subCSS: bubbleSubCSS,
  supportedStates: ["default"],
};
