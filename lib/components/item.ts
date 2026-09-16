import type { ComponentSpec } from "@/lib/component-model";

export const defaultItemTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type ItemProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Leading media, usually an icon. */
    icon?: ReactNode;

    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Item = forwardRef<
  HTMLDivElement,
  ItemProps
>(function Item(
  {
    children = "Item",
    icon,
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
        "blank-item",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon && (
        <span
          className="blank-item__media"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <span className="blank-item__content">
        {children}
      </span>
    </div>
  );
});
`;

const itemSubCSS = `.blank-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.blank-item__media {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.blank-item__content {
  min-width: 0;
}`;

export const ITEM_SPEC: ComponentSpec = {
  id: "item",
  name: "Item",
  fileName: "Item.tsx",
  exportName: "Item",
  className: "blank-item",
  vanillaTSX: defaultItemTSX,
  contentProp: "children",
  contentLabel: "Text",
  defaultContent: "Item",
  subCSS: itemSubCSS,
  iconSlots: [{ prop: "icon", label: "Leading" }],
  supportedStates: ["default"],
};
