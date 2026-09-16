import type { ComponentSpec } from "@/lib/component-model";

export const defaultMessageTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type MessageProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Message = forwardRef<
  HTMLDivElement,
  MessageProps
>(function Message(
  {
    children = "Message",
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
        "blank-message",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span
        className="blank-message__avatar"
        aria-hidden="true"
      >
        A
      </span>

      <div className="blank-message__body">
        <span className="blank-message__author">
          Ada
        </span>

        <span className="blank-message__content">
          {children}
        </span>
      </div>
    </div>
  );
});
`;

const messageSubCSS = `.blank-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.blank-message__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.blank-message__body {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.blank-message__author,
.blank-message__content {
  display: block;
}`;

export const MESSAGE_SPEC: ComponentSpec = {
  id: "message",
  name: "Message",
  fileName: "Message.tsx",
  exportName: "Message",
  className: "blank-message",
  vanillaTSX: defaultMessageTSX,
  contentProp: "children",
  contentLabel: "Text",
  defaultContent: "Message",
  subCSS: messageSubCSS,
  supportedStates: ["default"],
};
