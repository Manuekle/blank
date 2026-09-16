import type { ComponentSpec } from "@/lib/component-model";

export const defaultAvatarTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type AvatarProps =
  HTMLAttributes<HTMLSpanElement> & {
    /** Image source; falls back to the initials when absent. */
    src?: string;

    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

export const Avatar = forwardRef<
  HTMLSpanElement,
  AvatarProps
>(function Avatar(
  {
    children = "AB",
    src,
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
        "blank-avatar",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {src ? (
        <img
          className="blank-avatar__image"
          src={src}
          alt=""
        />
      ) : (
        <span className="blank-avatar__initials">
          {children}
        </span>
      )}
    </span>
  );
});
`;

const avatarSubCSS = `.blank-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.blank-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}`;

export const AVATAR_SPEC: ComponentSpec = {
  id: "avatar",
  name: "Avatar",
  fileName: "Avatar.tsx",
  exportName: "Avatar",
  className: "blank-avatar",
  vanillaTSX: defaultAvatarTSX,
  contentProp: "children",
  contentLabel: "Initials",
  defaultContent: "AB",
  subCSS: avatarSubCSS,
  supportedStates: ["default"],
};
