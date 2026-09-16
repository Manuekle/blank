import type { ComponentSpec } from "@/lib/component-model";

export const defaultMessageScrollerTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type MessageScrollerProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const messages = [
  { id: "1", author: "Ada", text: "Morning!" },
  { id: "2", author: "Linus", text: "Ready to ship." },
  { id: "3", author: "Ada", text: "Tests are green." },
  { id: "4", author: "Linus", text: "Merging now." },
];

export const MessageScroller = forwardRef<
  HTMLDivElement,
  MessageScrollerProps
>(function MessageScroller(
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
      tabIndex={0}
      className={[
        "blank-message-scroller",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className="blank-message-scroller__row"
        >
          <span className="blank-message-scroller__author">
            {message.author}
          </span>

          <span className="blank-message-scroller__text">
            {message.text}
          </span>
        </div>
      ))}
    </div>
  );
});
`;

const messageScrollerSubCSS = `.blank-message-scroller {
  display: grid;
  gap: 8px;
  overflow-y: auto;
  max-height: 220px;
}
.blank-message-scroller__row {
  display: grid;
  gap: 2px;
}
.blank-message-scroller__author,
.blank-message-scroller__text {
  display: block;
}`;

export const MESSAGE_SCROLLER_SPEC: ComponentSpec = {
  id: "message-scroller",
  name: "Message Scroller",
  fileName: "MessageScroller.tsx",
  exportName: "MessageScroller",
  className: "blank-message-scroller",
  vanillaTSX: defaultMessageScrollerTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: messageScrollerSubCSS,
  supportedStates: ["default"],
};
