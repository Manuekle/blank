import type { ComponentSpec } from "@/lib/component-model";

export const defaultHoverCardTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type HoverCardProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const HoverCard = forwardRef<
  HTMLSpanElement,
  HoverCardProps
>(function HoverCard(
  {
    children = "@ada",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        "blank-hover-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-hover-card__trigger">
        {children}
      </span>

      <span className="blank-hover-card__content">
        <span className="blank-hover-card__title">
          Ada Lovelace
        </span>

        <span className="blank-hover-card__description">
          First programmer.
        </span>
      </span>
    </span>
  );
});
`;

const hoverCardSubCSS = `.blank-hover-card {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}
.blank-hover-card__content {
  display: grid;
  gap: 2px;
  margin-block-start: 6px;
}
.blank-hover-card__title,
.blank-hover-card__description {
  display: block;
}`;

export const HOVER_CARD_SPEC: ComponentSpec = {
  id: "hover-card",
  name: "Hover Card",
  fileName: "HoverCard.tsx",
  exportName: "HoverCard",
  className: "blank-hover-card",
  vanillaTSX: defaultHoverCardTSX,
  contentProp: "children",
  contentLabel: "Trigger",
  defaultContent: "@ada",
  subCSS: hoverCardSubCSS,
  supportedStates: ["default"],
};
