import type { ComponentSpec } from "@/lib/component-model";

export const defaultChartTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type ChartProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const values = [42, 68, 54, 88, 61, 74];

export const Chart = forwardRef<
  HTMLDivElement,
  ChartProps
>(function Chart(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Bar chart"
      className={[
        "blank-chart",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {values.map((value, index) => (
        <div
          key={index}
          className="blank-chart__bar"
          style={{ height: \`\${value}%\` }}
        />
      ))}
    </div>
  );
});
`;

const chartSubCSS = `.blank-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 140px;
}
.blank-chart__bar {
  flex: 1;
  min-width: 0;
}`;

export const CHART_SPEC: ComponentSpec = {
  id: "chart",
  name: "Chart",
  fileName: "Chart.tsx",
  exportName: "Chart",
  className: "blank-chart",
  vanillaTSX: defaultChartTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: chartSubCSS,
  supportedStates: ["default"],
};
