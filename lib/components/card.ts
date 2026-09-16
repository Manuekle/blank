import type { ComponentSpec } from "@/lib/component-model";

export const defaultCardTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type CardProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Card = forwardRef<
  HTMLDivElement,
  CardProps
>(function Card(
  {
    children = "Card title",
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
        "blank-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-card__header">
        <span className="blank-card__title">
          {children}
        </span>

        <span className="blank-card__description">
          Card description
        </span>
      </div>

      <div className="blank-card__content">
        Card content
      </div>

      <div className="blank-card__footer">
        <button
          type="button"
          className="blank-card__action"
        >
          Action
        </button>
      </div>
    </div>
  );
});
`;

const cardSubCSS = `.blank-card {
  display: grid;
  gap: 12px;
}
.blank-card__header,
.blank-card__content,
.blank-card__footer {
  display: grid;
  gap: 4px;
}
.blank-card__footer {
  display: flex;
}
.blank-card__title,
.blank-card__description {
  display: block;
}`;

export const CARD_SPEC: ComponentSpec = {
  id: "card",
  name: "Card",
  fileName: "Card.tsx",
  exportName: "Card",
  className: "blank-card",
  vanillaTSX: defaultCardTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "Card title",
  subCSS: cardSubCSS,
  supportedStates: ["default"],
};
