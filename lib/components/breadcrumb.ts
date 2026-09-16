import type { ComponentSpec } from "@/lib/component-model";

export const defaultBreadcrumbTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type BreadcrumbProps =
  HTMLAttributes<HTMLElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const items = ["Home", "Library", "Data"];

export const Breadcrumb = forwardRef<
  HTMLElement,
  BreadcrumbProps
>(function Breadcrumb(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={[
        "blank-breadcrumb",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <ol className="blank-breadcrumb__list">
        {items.map((item, index) => (
          <li
            key={item}
            className="blank-breadcrumb__item"
          >
            {index < items.length - 1 ? (
              <>
                <span className="blank-breadcrumb__link">
                  {item}
                </span>

                <span
                  className="blank-breadcrumb__separator"
                  aria-hidden="true"
                >
                  /
                </span>
              </>
            ) : (
              <span
                className="blank-breadcrumb__page"
                aria-current="page"
              >
                {item}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});
`;

const breadcrumbSubCSS = `.blank-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.blank-breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}`;

export const BREADCRUMB_SPEC: ComponentSpec = {
  id: "breadcrumb",
  name: "Breadcrumb",
  fileName: "Breadcrumb.tsx",
  exportName: "Breadcrumb",
  className: "blank-breadcrumb",
  vanillaTSX: defaultBreadcrumbTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: breadcrumbSubCSS,
  supportedStates: ["default"],
};
