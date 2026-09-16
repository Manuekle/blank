"use client";

import * as React from "react";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function ButtonGroup({ className, ...props }: ButtonGroupProps) {
  return <div className={cn("blank-btn-group", className)} {...props} />;
}

export type ButtonGroupItemProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
  };

export const ButtonGroupItem = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps
>(function ButtonGroupItem({ className, active = false, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      aria-pressed={active}
      className={cn("blank-btn-group__item", className)}
      {...props}
    >
      {children}
    </button>
  );
});
