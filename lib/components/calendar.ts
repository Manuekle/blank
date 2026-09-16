import type { ComponentSpec } from "@/lib/component-model";

export const defaultCalendarTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type CalendarProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

const days = Array.from(
  { length: 30 },
  (_, index) => index + 1,
);

export const Calendar = forwardRef<
  HTMLDivElement,
  CalendarProps
>(function Calendar(
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
        "blank-calendar",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="blank-calendar__header">
        <button
          type="button"
          className="blank-calendar__nav"
          aria-label="Previous month"
          disabled={disabled}
        >
          ‹
        </button>

        <span className="blank-calendar__month">
          January
        </span>

        <button
          type="button"
          className="blank-calendar__nav"
          aria-label="Next month"
          disabled={disabled}
        >
          ›
        </button>
      </div>

      <div className="blank-calendar__grid">
        {weekdays.map((day, index) => (
          <span
            key={\`\${day}-\${index}\`}
            className="blank-calendar__weekday"
            aria-hidden="true"
          >
            {day}
          </span>
        ))}

        {days.map((day) => (
          <button
            key={day}
            type="button"
            aria-current={day === 12 ? "date" : undefined}
            disabled={disabled}
            className="blank-calendar__day"
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
});
`;

const calendarSubCSS = `.blank-calendar {
  display: grid;
  gap: 8px;
}
.blank-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.blank-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}
.blank-calendar__weekday,
.blank-calendar__day {
  cursor: pointer;
  display: grid;
  place-items: center;
  cursor: pointer;
}`;

export const CALENDAR_SPEC: ComponentSpec = {
  id: "calendar",
  name: "Calendar",
  fileName: "Calendar.tsx",
  exportName: "Calendar",
  className: "blank-calendar",
  vanillaTSX: defaultCalendarTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: calendarSubCSS,
  supportedStates: ["default"],
};
