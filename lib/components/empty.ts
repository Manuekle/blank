import type { ComponentSpec } from "@/lib/component-model";

export const defaultEmptyTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type EmptyProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Empty = forwardRef<
  HTMLDivElement,
  EmptyProps
>(function Empty(
  {
    children = "No results",
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
        "blank-empty",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-empty__title">
        {children}
      </span>

      <span className="blank-empty__description">
        Try a different search.
      </span>
    </div>
  );
});
`;

const emptySubCSS = `.blank-empty {
  display: grid;
  justify-items: center;
  gap: 4px;
  text-align: center;
}
.blank-empty__title,
.blank-empty__description {
  display: block;
}`;

export const EMPTY_SPEC: ComponentSpec = {
  id: "empty",
  name: "Empty",
  fileName: "Empty.tsx",
  exportName: "Empty",
  className: "blank-empty",
  vanillaTSX: defaultEmptyTSX,
  contentProp: "children",
  contentLabel: "Title",
  defaultContent: "No results",
  subCSS: emptySubCSS,
  supportedStates: ["default"],
};
