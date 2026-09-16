import type { ComponentSpec } from "@/lib/component-model";

export const defaultTabsTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type TabsProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const tabs = ["Overview", "Activity", "Settings"];

export const Tabs = forwardRef<
  HTMLDivElement,
  TabsProps
>(function Tabs(
  {
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "blank-tabs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div role="tablist" className="blank-tabs__list">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={index === 0}
            disabled={disabled}
            className="blank-tabs__tab"
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="blank-tabs__panel">
        Panel content
      </div>
    </div>
  );
});
`;

const tabsSubCSS = `.blank-tabs {
  display: grid;
  gap: 12px;
}
.blank-tabs__list {
  display: flex;
  align-items: center;
  gap: 4px;
}`;

export const TABS_SPEC: ComponentSpec = {
  id: "tabs",
  name: "Tabs",
  fileName: "Tabs.tsx",
  exportName: "Tabs",
  className: "blank-tabs",
  vanillaTSX: defaultTabsTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: tabsSubCSS,
  supportedStates: ["default"],
};
