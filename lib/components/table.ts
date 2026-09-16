import type { ComponentSpec } from "@/lib/component-model";

export const defaultTableTSX = `import {
  forwardRef,
  type TableHTMLAttributes,
} from "react";

import "./styles.css";

export type TableProps =
  TableHTMLAttributes<HTMLTableElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const rows = [
  { name: "Ada", role: "Engineer", status: "Active" },
  { name: "Linus", role: "Maintainer", status: "Away" },
];

export const Table = forwardRef<
  HTMLTableElement,
  TableProps
>(function Table(
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
        "blank-table",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
          <th scope="col">Status</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.role}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
`;

export const TABLE_SPEC: ComponentSpec = {
  id: "table",
  name: "Table",
  fileName: "Table.tsx",
  exportName: "Table",
  className: "blank-table",
  vanillaTSX: defaultTableTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: "",
  supportedStates: ["default"],
};
