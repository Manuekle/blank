import type { SVGProps } from "react";

type ChangesIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
};

/** Branch with commits, used as the change-history mark. */
export function ChangesIcon({ size = 14, ...props }: ChangesIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 8L6 16" />
      <path d="M18 16V12C18 9.17156 18 7.75735 17.1213 6.87867C16.2426 5.99999 14.8284 5.99999 12 5.99999L11 5.99999" />
      <path d="M11 5.99999C11 5.29976 12.9943 3.99152 13.5 3.49999" />
      <path d="M11 5.99999C11 6.70022 12.9943 8.00846 13.5 8.49999" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}
