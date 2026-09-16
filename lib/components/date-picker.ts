import type { ComponentSpec } from "@/lib/component-model";

export const defaultDatePickerTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type DatePickerProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const days = Array.from(
  { length: 14 },
  (_, index) => index + 1,
);

export const DatePicker = forwardRef<
  HTMLDivElement,
  DatePickerProps
>(function DatePicker(
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
        "blank-date-picker",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <button
        type="button"
        aria-expanded="true"
        aria-haspopup="dialog"
        disabled={disabled}
        className="blank-date-picker__trigger"
      >
        Pick a date
      </button>

      <div className="blank-date-picker__panel">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            aria-current={day === 7 ? "date" : undefined}
            disabled={disabled}
            className="blank-date-picker__day"
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
});
`;

const datePickerSubCSS = `.blank-date-picker {
  display: inline-grid;
  justify-items: start;
  gap: 6px;
}
.blank-date-picker__panel {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}
.blank-date-picker__day {
  cursor: pointer;
  display: grid;
  place-items: center;
  cursor: pointer;
}`;

export const DATE_PICKER_SPEC: ComponentSpec = {
  id: "date-picker",
  name: "Date Picker",
  fileName: "DatePicker.tsx",
  exportName: "DatePicker",
  className: "blank-date-picker",
  vanillaTSX: defaultDatePickerTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: datePickerSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
