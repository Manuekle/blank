import type { ComponentSpec } from "@/lib/component-model";

export const defaultDataTableTSX = `import {
  forwardRef,
  type TableHTMLAttributes,
} from "react";

import "./styles.css";

export type DataTableProps =
  TableHTMLAttributes<HTMLTableElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const columns = ["Name", "Status", "Role"];

const rows = [
  { name: "Ada", status: "Active", role: "Engineer" },
  { name: "Linus", status: "Away", role: "Maintainer" },
  { name: "Grace", status: "Active", role: "Reviewer" },
];

export const DataTable = forwardRef<
  HTMLTableElement,
  DataTableProps
>(function DataTable(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <table
      ref={ref}
      className={[
        "blank-data-table",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th
              key={column}
              scope="col"
              aria-sort={index === 0 ? "ascending" : "none"}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.status}</td>
            <td>{row.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
`;

export const DATA_TABLE_SPEC: ComponentSpec = {
  id: "data-table",
  name: "Data Table",
  fileName: "DataTable.tsx",
  exportName: "DataTable",
  className: "blank-data-table",
  vanillaTSX: defaultDataTableTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: "",
  supportedStates: ["default"],
};
