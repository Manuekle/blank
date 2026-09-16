import type { ComponentSpec } from "@/lib/component-model";

export const defaultPaginationTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type PaginationProps =
  HTMLAttributes<HTMLElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const pages = ["1", "2", "3"];

export const Pagination = forwardRef<
  HTMLElement,
  PaginationProps
>(function Pagination(
  {
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label="Pagination"
      className={[
        "blank-pagination",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <button
        type="button"
        className="blank-pagination__item"
        disabled={disabled}
      >
        Previous
      </button>

      {pages.map((page, index) => (
        <button
          key={page}
          type="button"
          aria-current={index === 0 ? "page" : undefined}
          disabled={disabled}
          className="blank-pagination__item"
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="blank-pagination__item"
        disabled={disabled}
      >
        Next
      </button>
    </nav>
  );
});
`;

const paginationSubCSS = `.blank-pagination {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.blank-pagination__item {
  cursor: pointer;
}`;

export const PAGINATION_SPEC: ComponentSpec = {
  id: "pagination",
  name: "Pagination",
  fileName: "Pagination.tsx",
  exportName: "Pagination",
  className: "blank-pagination",
  vanillaTSX: defaultPaginationTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: paginationSubCSS,
  supportedStates: ["default"],
};
