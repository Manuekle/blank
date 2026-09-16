import type { ComponentSpec } from "@/lib/component-model";

export const defaultCommandTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type CommandProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const items = [
  { label: "New file", shortcut: "⌘N" },
  { label: "Search", shortcut: "⌘K" },
  { label: "Toggle theme", shortcut: "⌘T" },
];

export const Command = forwardRef<
  HTMLDivElement,
  CommandProps
>(function Command(
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
        "blank-command",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <input
        className="blank-command__input"
        placeholder="Type a command…"
        disabled={disabled}
      />

      <ul
        role="listbox"
        className="blank-command__list"
      >
        {items.map((item, index) => (
          <li
            key={item.label}
            role="option"
            aria-selected={index === 0}
            className="blank-command__item"
          >
            <span className="blank-command__label">
              {item.label}
            </span>

            <span className="blank-command__shortcut">
              {item.shortcut}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
`;

const commandSubCSS = `.blank-command {
  display: grid;
  gap: 6px;
}
.blank-command__list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.blank-command__item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}`;

export const COMMAND_SPEC: ComponentSpec = {
  id: "command",
  name: "Command",
  fileName: "Command.tsx",
  exportName: "Command",
  className: "blank-command",
  vanillaTSX: defaultCommandTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: commandSubCSS,
  supportedStates: ["default"],
};
