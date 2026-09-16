import type { ComponentSpec } from "@/lib/component-model";

export const defaultAttachmentTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type AttachmentProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Attachment = forwardRef<
  HTMLSpanElement,
  AttachmentProps
>(function Attachment(
  {
    children = "report.pdf",
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        "blank-attachment",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-attachment__name">
        {children}
      </span>

      <span className="blank-attachment__meta">
        2.4 MB
      </span>
    </span>
  );
});
`;

const attachmentSubCSS = `.blank-attachment {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.blank-attachment__name,
.blank-attachment__meta {
  display: inline-flex;
  align-items: center;
}`;

export const ATTACHMENT_SPEC: ComponentSpec = {
  id: "attachment",
  name: "Attachment",
  fileName: "Attachment.tsx",
  exportName: "Attachment",
  className: "blank-attachment",
  vanillaTSX: defaultAttachmentTSX,
  contentProp: "children",
  contentLabel: "File name",
  defaultContent: "report.pdf",
  subCSS: attachmentSubCSS,
  supportedStates: ["default"],
};
