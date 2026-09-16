import type { ComponentSpec } from "@/lib/component-model";

export const defaultAccordionTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type AccordionProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const items = [
  { value: "one", label: "First section" },
  { value: "two", label: "Second section" },
  { value: "three", label: "Third section" },
];

export const Accordion = forwardRef<
  HTMLDivElement,
  AccordionProps
>(function Accordion(
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
      className={[
        "blank-accordion",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((item, index) => (
        <details
          key={item.value}
          className="blank-accordion__item"
          open={index === 0}
        >
          <summary className="blank-accordion__trigger">
            {item.label}
          </summary>

          <div className="blank-accordion__content">
            Content for {item.label.toLowerCase()}.
          </div>
        </details>
      ))}
    </div>
  );
});
`;

const accordionSubCSS = `.blank-accordion {
  display: grid;
}
.blank-accordion__trigger {
  cursor: pointer;
}
.blank-accordion__content {
  padding-block: 8px;
}`;

export const ACCORDION_SPEC: ComponentSpec = {
  id: "accordion",
  name: "Accordion",
  fileName: "Accordion.tsx",
  exportName: "Accordion",
  className: "blank-accordion",
  vanillaTSX: defaultAccordionTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: accordionSubCSS,
  supportedStates: ["default"],
};
